import "server-only";
import { createClient } from "@supabase/supabase-js";
import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const bucketName = process.env.SUPABASE_STORAGE_BUCKET || "website-assets";

export function isSupabaseStorageConfigured(): boolean {
  return Boolean(
    supabaseUrl &&
      serviceRoleKey &&
      supabaseUrl.startsWith("http") &&
      serviceRoleKey.length > 20
  );
}

function getSupabaseAdmin() {
  if (!isSupabaseStorageConfigured()) {
    return null;
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

import { prisma } from "./prisma";

/**
 * Memastikan bucket storage publik telah tersedia di Supabase
 * Menggunakan direct SQL superuser agar tidak terhalang izin RLS pada API client key
 */
export async function ensureBucket(): Promise<boolean> {
  try {
    await prisma.$executeRawUnsafe(`
      INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
      VALUES (
        '${bucketName}',
        '${bucketName}',
        true,
        26214400,
        ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']::text[]
      )
      ON CONFLICT (id) DO UPDATE SET public = true;
    `);
    return true;
  } catch (err) {
    console.warn("Info ensureBucket SQL:", err);
    return true;
  }
}

export interface UploadResult {
  url: string;
  path: string;
  isLocal: boolean;
  originalSize: number;
  compressedSize: number;
}

/**
 * Kompresi gambar cerdas menggunakan Sharp ke target ukuran ~200KB
 * Mengonversi gambar ke format WebP modern dengan resolusi maksimal 1920px (Full HD).
 */
export async function compressImageToTarget(
  inputBuffer: Buffer,
  targetSizeKB = 200
): Promise<{ buffer: Buffer; contentType: string; ext: string }> {
  const targetBytes = targetSizeKB * 1024;
  const pipeline = sharp(inputBuffer).rotate(); // auto-orient berdasarkan EXIF

  const metadata = await pipeline.metadata();
  const width = metadata.width || 1920;

  // Jika resolusi lebih besar dari 1920px (misal foto 4K atau kamera ponsel 48MP),
  // kecilkan ke Full HD (1920px) agar efisien tanpa menurunkan ketajaman layar
  const maxWidth = width > 1920 ? 1920 : width;

  // Loop kompresi adaptif untuk mencapai target ~200KB
  const qualitySteps = [82, 75, 68, 58, 48, 38];
  let finalBuffer: Buffer | null = null;

  for (const quality of qualitySteps) {
    const candidate = await sharp(inputBuffer)
      .rotate()
      .resize({ width: maxWidth, fit: "inside", withoutEnlargement: true })
      .webp({ quality, effort: 4 })
      .toBuffer();

    finalBuffer = candidate;
    if (candidate.length <= targetBytes) {
      break;
    }
  }

  // Jika masih di atas target (gambar sangat kompleks), turunkan dimensi sedikit ke 1440px
  if (finalBuffer && finalBuffer.length > targetBytes && maxWidth > 1440) {
    const candidate = await sharp(inputBuffer)
      .rotate()
      .resize({ width: 1440, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 60, effort: 4 })
      .toBuffer();
    finalBuffer = candidate;
  }

  return {
    buffer: finalBuffer || inputBuffer,
    contentType: "image/webp",
    ext: "webp",
  };
}

/**
 * Upload gambar ke Supabase Storage (atau fallback lokal jika service role key belum diisi)
 * Menerima file gambar ukuran berapa saja lalu otomatis mengompresi ke ~200KB.
 */
export async function uploadImage(
  file: File,
  folder: "hero" | "edukasi" | "petugas" = "hero"
): Promise<UploadResult> {
  const originalSize = file.size;
  const rawArrayBuffer = await file.arrayBuffer();
  const rawBuffer = Buffer.from(rawArrayBuffer);

  // Kompres gambar ke format webp dengan target ukuran ~200KB
  let compressedBuffer: Buffer;
  let contentType = "image/webp";
  let ext = "webp";

  try {
    const compressionResult = await compressImageToTarget(rawBuffer, 200);
    compressedBuffer = compressionResult.buffer;
    contentType = compressionResult.contentType;
    ext = compressionResult.ext;
  } catch (compressErr) {
    console.warn("Gagal melakukan kompresi sharp, menggunakan file asli:", compressErr);
    compressedBuffer = rawBuffer;
    ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    contentType = file.type || "image/jpeg";
  }

  const compressedSize = compressedBuffer.length;
  const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;
  const storageFilePath = `${folder}/${uniqueName}`;

  // 1. Jika Supabase Storage sudah terkonfigurasi
  if (isSupabaseStorageConfigured()) {
    await ensureBucket();
    const supabase = getSupabaseAdmin()!;
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(storageFilePath, compressedBuffer, {
        contentType,
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Gagal upload ke Supabase Storage: ${uploadError.message}`);
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(storageFilePath);

    return {
      url: publicUrlData.publicUrl,
      path: storageFilePath,
      isLocal: false,
      originalSize,
      compressedSize,
    };
  }

  // 2. Fallback lokal jika SUPABASE_SERVICE_ROLE_KEY belum diisi
  const localDir = path.join(process.cwd(), "public", "uploads", folder);
  await fs.mkdir(localDir, { recursive: true });
  const localFilePath = path.join(localDir, uniqueName);
  await fs.writeFile(localFilePath, compressedBuffer);

  return {
    url: `/uploads/${folder}/${uniqueName}`,
    path: `local:${folder}/${uniqueName}`,
    isLocal: true,
    originalSize,
    compressedSize,
  };
}

/**
 * Mengekstrak path relatif storage dari URL lengkap atau imagePath.
 * Mengabaikan file bawaan statis (/assets-landingpage/...).
 */
export function extractCleanStoragePath(rawPathOrUrl: string | null | undefined): string | null {
  if (!rawPathOrUrl) return null;

  // Jika aset statis lokal bawaan template (jangan dihapus)
  if (rawPathOrUrl.startsWith("/assets-") || rawPathOrUrl.includes("/assets-landingpage/")) {
    return null;
  }

  // Jika path bertanda local:
  if (rawPathOrUrl.startsWith("local:")) {
    return rawPathOrUrl;
  }

  // Jika URL lokal (/uploads/hero/...)
  if (rawPathOrUrl.startsWith("/uploads/")) {
    return `local:${rawPathOrUrl.replace(/^\/uploads\//, "")}`;
  }

  // Jika URL publik Supabase Storage (https://.../storage/v1/object/public/website-assets/hero/xxx.webp)
  const marker = "/storage/v1/object/public/";
  if (rawPathOrUrl.includes(marker)) {
    const afterMarker = rawPathOrUrl.split(marker)[1];
    if (afterMarker) {
      const parts = afterMarker.split("/");
      if (parts[0] === bucketName) {
        return parts.slice(1).join("/");
      }
      return parts.slice(1).join("/") || afterMarker;
    }
  }

  // Jika diawali dengan nama bucket "website-assets/hero/..."
  if (rawPathOrUrl.startsWith(`${bucketName}/`)) {
    return rawPathOrUrl.replace(`${bucketName}/`, "");
  }

  return rawPathOrUrl.trim();
}

/**
 * Menghapus gambar dari Supabase Storage atau file lokal secara otomatis
 * Menggunakan kombinasi Supabase Storage API dan direct query storage.objects agar terhapus tuntas
 */
export async function deleteImage(rawPathOrUrl: string | null | undefined): Promise<boolean> {
  const cleanPath = extractCleanStoragePath(rawPathOrUrl);
  if (!cleanPath) return false;

  try {
    // 1. Jika file lokal
    if (cleanPath.startsWith("local:")) {
      const relativePath = cleanPath.replace("local:", "");
      const fullPath = path.join(process.cwd(), "public", "uploads", relativePath);
      await fs.unlink(fullPath).catch(() => {});
      return true;
    }

    // 2. Jika Supabase Storage
    if (isSupabaseStorageConfigured()) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        await supabase.storage.from(bucketName).remove([cleanPath]);
      }

      // Pastikan juga terhapus bersih di database PostgreSQL storage.objects
      await prisma.$executeRawUnsafe(`
        DELETE FROM storage.objects 
        WHERE bucket_id = '${bucketName}' AND name = '${cleanPath}';
      `).catch(() => {});

      return true;
    }

    return false;
  } catch (err) {
    console.warn("Gagal menghapus gambar:", err);
    return false;
  }
}


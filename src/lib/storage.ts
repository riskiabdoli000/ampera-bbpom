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
        ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'application/pdf']::text[]
      )
      ON CONFLICT (id) DO UPDATE SET 
        public = true,
        allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'application/pdf']::text[];
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

export type UploadFolder =
  | "hero"
  | "edukasi"
  | "petugas"
  | "aduan"
  | "kip"
  | "ktp"
  | "layanan";

/**
 * Kompresi gambar cerdas menggunakan Sharp ke target ukuran ~200KB
 * Mengonversi gambar ke format WebP modern dengan resolusi maksimal 1920px (Full HD).
 */
export async function compressImageToTarget(
  inputBuffer: Buffer,
  targetSizeKB = 200
): Promise<{ buffer: Buffer; contentType: string; ext: string }> {
  const targetBytes = targetSizeKB * 1024;
  const pipeline = sharp(inputBuffer).rotate();

  const metadata = await pipeline.metadata();
  const width = metadata.width || 1920;
  const maxWidth = width > 1920 ? 1920 : width;

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
 * Upload gambar atau dokumen PDF ke Supabase Storage (atau fallback lokal jika service role key belum diisi).
 * Jika file adalah gambar, otomatis dikompresi ke format WebP ~200KB.
 * Jika file adalah PDF, disimpan utuh dengan MIME application/pdf.
 */
export async function uploadFileOrDocument(
  file: File,
  folder: UploadFolder = "layanan"
): Promise<UploadResult> {
  const originalSize = file.size;
  const rawArrayBuffer = await file.arrayBuffer();
  const rawBuffer = Buffer.from(rawArrayBuffer);

  const isPdf =
    file.type === "application/pdf" ||
    file.name.toLowerCase().endsWith(".pdf");

  let uploadBuffer: Buffer = rawBuffer;
  let contentType = file.type || "application/octet-stream";
  let ext = file.name.split(".").pop()?.toLowerCase() || "bin";

  if (isPdf) {
    contentType = "application/pdf";
    ext = "pdf";
  } else if (file.type.startsWith("image/") || /\.(jpe?g|png|webp)$/i.test(file.name)) {
    try {
      const compressionResult = await compressImageToTarget(rawBuffer, 200);
      uploadBuffer = compressionResult.buffer;
      contentType = compressionResult.contentType;
      ext = compressionResult.ext;
    } catch (compressErr) {
      console.warn("Gagal kompresi sharp, menggunakan gambar asli:", compressErr);
      uploadBuffer = rawBuffer;
      ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      contentType = file.type || "image/jpeg";
    }
  }

  const compressedSize = uploadBuffer.length;
  const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;
  const storageFilePath = `${folder}/${uniqueName}`;

  // 1. Supabase Storage
  if (isSupabaseStorageConfigured()) {
    await ensureBucket();
    const supabase = getSupabaseAdmin()!;
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(storageFilePath, uploadBuffer, {
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

  // 2. Fallback Lokal
  const localDir = path.join(process.cwd(), "public", "uploads", folder);
  await fs.mkdir(localDir, { recursive: true });
  const localFilePath = path.join(localDir, uniqueName);
  await fs.writeFile(localFilePath, uploadBuffer);

  return {
    url: `/uploads/${folder}/${uniqueName}`,
    path: `local:${folder}/${uniqueName}`,
    isLocal: true,
    originalSize,
    compressedSize,
  };
}

/**
 * Upload gambar ke Supabase Storage (atau fallback lokal jika service role key belum diisi)
 * Menerima file gambar ukuran berapa saja lalu otomatis mengompresi ke ~200KB.
 */
export async function uploadImage(
  file: File,
  folder: UploadFolder = "hero"
): Promise<UploadResult> {
  return uploadFileOrDocument(file, folder);
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


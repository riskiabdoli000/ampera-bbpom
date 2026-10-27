"use server";

import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/auth/session";
import { uploadImage, deleteImage, isSupabaseStorageConfigured } from "@/lib/storage";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const heroKontenSchema = z.object({
  judul: z.string().min(5, "Judul utama minimal 5 karakter"),
  subjudul: z.string().min(10, "Subjudul/deskripsi minimal 10 karakter"),
  ctaUtamaLabel: z.string().min(2, "Label tombol CTA minimal 2 karakter"),
  ctaSekunderLabel: z.string().optional().default(""),
});

export async function getHeroSettings() {
  let konten = await prisma.heroKonten.findUnique({
    where: { id: 1 },
  });

  if (!konten) {
    konten = await prisma.heroKonten.create({
      data: {
        id: 1,
        judul: "Obat & Pangan yang Aman, untuk Anda",
        subjudul:
          "AMPERA adalah inovasi Balai Besar POM di Palembang untuk layanan informasi, pengaduan, dan pengujian cepat sediaan farmasi dan pangan olahan.",
        ctaUtamaLabel: "Akses Layanan AMPERA",
        ctaSekunderLabel: "",
      },
    });
  }

  const slides = await prisma.heroSlide.findMany({
    orderBy: [{ urutan: "asc" }, { id: "asc" }],
  });

  const isStorageConfigured = isSupabaseStorageConfigured();

  return {
    konten,
    slides,
    isStorageConfigured,
  };
}

export async function saveHeroKontenAction(data: {
  judul: string;
  subjudul: string;
  ctaUtamaLabel: string;
  ctaSekunderLabel?: string;
}) {
  await verifyAdminSession();

  const validated = heroKontenSchema.safeParse(data);
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues[0]?.message || "Input teks hero tidak valid.",
    };
  }

  try {
    const updated = await prisma.heroKonten.upsert({
      where: { id: 1 },
      update: validated.data,
      create: {
        id: 1,
        ...validated.data,
      },
    });

    revalidatePath("/admin/settings/hero");
    revalidatePath("/admin/settings");
    revalidatePath("/");

    return { success: true, data: updated };
  } catch (err: unknown) {
    console.error("Gagal menyimpan hero konten:", err);
    return {
      success: false,
      error: "Gagal menyimpan data ke database. Silakan coba lagi.",
    };
  }
}

export async function createHeroSlideAction(formData: FormData) {
  await verifyAdminSession();

  const title = (formData.get("title") as string)?.trim() || "Slide Baru";
  const alt = (formData.get("alt") as string)?.trim() || title;
  const imageFile = formData.get("imageFile") as File | null;
  const manualImageUrl = (formData.get("imageUrl") as string)?.trim();

  let imageUrl = manualImageUrl || "/assets-landingpage/hero1.png";
  let imagePath: string | null = null;
  let isLocalUpload = false;
  let compressionStats: { originalSize: number; compressedSize: number } | null = null;

  try {
    if (imageFile && imageFile.size > 0) {
      const uploadResult = await uploadImage(imageFile, "hero");
      imageUrl = uploadResult.url;
      imagePath = uploadResult.path;
      isLocalUpload = uploadResult.isLocal;
      compressionStats = {
        originalSize: uploadResult.originalSize,
        compressedSize: uploadResult.compressedSize,
      };
    }

    const maxUrutan = await prisma.heroSlide.aggregate({
      _max: { urutan: true },
    });
    const nextUrutan = (maxUrutan._max.urutan ?? 0) + 1;

    const newSlide = await prisma.heroSlide.create({
      data: {
        title,
        alt,
        imageUrl,
        imagePath,
        isActive: true,
        urutan: nextUrutan,
      },
    });

    revalidatePath("/admin/settings/hero");
    revalidatePath("/admin/settings");
    revalidatePath("/");

    function formatBytes(bytes: number) {
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }

    const compressionNote =
      compressionStats && compressionStats.originalSize > 0
        ? ` (dikompres ${formatBytes(compressionStats.originalSize)} → ${formatBytes(compressionStats.compressedSize)})`
        : "";

    return {
      success: true,
      data: newSlide,
      isLocalUpload,
      message: isLocalUpload
        ? `Slide berhasil ditambahkan${compressionNote} dan disimpan secara lokal.`
        : `Slide berhasil ditambahkan${compressionNote} dan tersimpan di Supabase Storage.`,
    };
  } catch (err: unknown) {
    console.error("Gagal membuat hero slide:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Gagal menambahkan slide.",
    };
  }
}

export async function updateHeroSlideAction(
  id: number,
  data: {
    title?: string;
    alt?: string;
    isActive?: boolean;
    urutan?: number;
  }
) {
  await verifyAdminSession();

  try {
    const updated = await prisma.heroSlide.update({
      where: { id },
      data,
    });

    revalidatePath("/admin/settings/hero");
    revalidatePath("/admin/settings");
    revalidatePath("/");

    return { success: true, data: updated };
  } catch (err: unknown) {
    console.error("Gagal mengupdate hero slide:", err);
    return {
      success: false,
      error: "Gagal memperbarui slide.",
    };
  }
}

export async function replaceHeroSlideImageAction(id: number, formData: FormData) {
  await verifyAdminSession();

  const file = formData.get("imageFile") as File | null;
  if (!file || file.size === 0) {
    return { success: false, error: "Pilih file gambar terlebih dahulu." };
  }

  try {
    const oldSlide = await prisma.heroSlide.findUnique({
      where: { id },
    });

    if (!oldSlide) {
      return { success: false, error: "Slide tidak ditemukan." };
    }

    const uploadRes = await uploadImage(file, "hero");

    // Hapus foto lama otomatis dari Supabase Storage / file lokal jika ada
    const oldTarget = oldSlide.imagePath || oldSlide.imageUrl;
    if (oldTarget) {
      await deleteImage(oldTarget);
    }

    const updated = await prisma.heroSlide.update({
      where: { id },
      data: {
        imageUrl: uploadRes.url,
        imagePath: uploadRes.path,
      },
    });

    revalidatePath("/admin/settings/hero");
    revalidatePath("/admin/settings");
    revalidatePath("/");

    function formatBytes(bytes: number) {
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }

    const compressionNote =
      uploadRes.originalSize > 0
        ? ` (dikompres ${formatBytes(uploadRes.originalSize)} → ${formatBytes(uploadRes.compressedSize)})`
        : "";

    return {
      success: true,
      data: updated,
      isLocal: uploadRes.isLocal,
      message: uploadRes.isLocal
        ? `Foto berhasil diganti${compressionNote} dan disimpan secara lokal.`
        : `Foto berhasil diganti${compressionNote} dan tersimpan di Supabase Storage.`,
    };
  } catch (err: unknown) {
    console.error("Gagal mengganti foto slide:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Gagal mengganti gambar slide.",
    };
  }
}

export async function deleteHeroSlideAction(id: number) {
  await verifyAdminSession();

  try {
    const slide = await prisma.heroSlide.findUnique({
      where: { id },
    });

    if (!slide) {
      return { success: false, error: "Slide tidak ditemukan." };
    }

    // Pastikan tidak menghapus jika hanya tersisa 1 slide aktif
    const totalSlides = await prisma.heroSlide.count();
    if (totalSlides <= 1) {
      return {
        success: false,
        error: "Minimal harus ada 1 slide hero banner tersisa.",
      };
    }

    const targetToDelete = slide.imagePath || slide.imageUrl;

    await prisma.heroSlide.delete({
      where: { id },
    });

    if (targetToDelete) {
      await deleteImage(targetToDelete);
    }

    revalidatePath("/admin/settings/hero");
    revalidatePath("/admin/settings");
    revalidatePath("/");

    return { success: true };
  } catch (err: unknown) {
    console.error("Gagal menghapus slide:", err);
    return {
      success: false,
      error: "Gagal menghapus slide.",
    };
  }
}

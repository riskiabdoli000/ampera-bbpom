"use server";

import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { extractYouTubeId } from "@/lib/youtube";

export interface VideoItemData {
  id: number;
  eyebrow: string;
  judul: string;
  deskripsi: string;
  youtubeUrl: string;
  youtubeId: string;
  urutan: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const videoItemSchema = z.object({
  eyebrow: z.string().min(2, "Tagline atas (eyebrow) minimal 2 karakter"),
  judul: z.string().min(5, "Judul video minimal 5 karakter"),
  deskripsi: z.string().min(10, "Deskripsi video minimal 10 karakter"),
  youtubeUrl: z.string().min(5, "URL YouTube wajib diisi"),
  urutan: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

const DEFAULT_VIDEO_INIT = {
  eyebrow: "DEDIKASI, INTEGRITAS & PELAYANAN PUBLIK PRIMA",
  judul: "Mengenal Lebih Dekat Dedikasi & Layanan BBPOM di Palembang",
  deskripsi:
    "Saksikan dokumentasi resmi mengenai fasilitas laboratorium modern teruji, pengawasan peredaran terpadu, serta komitmen seluruh insan BPOM dalam melindungi kesehatan masyarakat Sumatera Selatan.",
  youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  youtubeId: "dQw4w9WgXcQ",
  urutan: 1,
  isActive: true,
};

/**
 * Mengambil seluruh daftar video untuk halaman kelola admin
 */
export async function getVideoSettingsList(): Promise<VideoItemData[]> {
  try {
    const list = await prisma.videoProfil.findMany({
      orderBy: [{ urutan: "asc" }, { id: "asc" }],
    });

    if (list.length === 0) {
      const seeded = await prisma.videoProfil.create({
        data: DEFAULT_VIDEO_INIT,
      });
      return [seeded];
    }

    return list;
  } catch (error) {
    console.error("Gagal mengambil daftar video profil:", error);
    return [{ id: 1, ...DEFAULT_VIDEO_INIT }];
  }
}

/**
 * Mengambil daftar video yang aktif untuk landing page publik (carousel/slider)
 */
export async function getLandingVideoList(): Promise<VideoItemData[]> {
  try {
    const list = await prisma.videoProfil.findMany({
      where: { isActive: true },
      orderBy: [{ urutan: "asc" }, { id: "asc" }],
    });

    if (list.length === 0) {
      // Coba ambil sembarang video jika belum ada yang diset aktif
      const anyVideo = await prisma.videoProfil.findFirst({
        orderBy: [{ urutan: "asc" }, { id: "asc" }],
      });
      if (anyVideo) return [anyVideo];
      return [{ id: 1, ...DEFAULT_VIDEO_INIT }];
    }

    return list;
  } catch (error) {
    console.error("Gagal mengambil data video landing page:", error);
    return [{ id: 1, ...DEFAULT_VIDEO_INIT }];
  }
}

/**
 * Mengambil satu video utama (untuk backward compatibility / hero card)
 */
export async function getVideoSettings(): Promise<VideoItemData> {
  const list = await getLandingVideoList();
  return list[0] || { id: 1, ...DEFAULT_VIDEO_INIT };
}

/**
 * Tambah video baru
 */
export async function createVideoAction(data: {
  eyebrow: string;
  judul: string;
  deskripsi: string;
  youtubeUrl: string;
  urutan?: number;
  isActive?: boolean;
}) {
  await verifyAdminSession();

  const validated = videoItemSchema.safeParse(data);
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues[0]?.message || "Input video tidak valid.",
    };
  }

  const extractedId = extractYouTubeId(validated.data.youtubeUrl);
  if (!extractedId) {
    return {
      success: false,
      error:
        "Format URL YouTube tidak dikenali. Gunakan format seperti https://www.youtube.com/watch?v=... atau https://youtu.be/...",
    };
  }

  try {
    // Tentukan urutan berikutnya jika belum diisi
    let urutanVal = validated.data.urutan;
    if (typeof urutanVal !== "number") {
      const maxUrutan = await prisma.videoProfil.aggregate({
        _max: { urutan: true },
      });
      urutanVal = (maxUrutan._max.urutan ?? 0) + 1;
    }

    const created = await prisma.videoProfil.create({
      data: {
        eyebrow: validated.data.eyebrow,
        judul: validated.data.judul,
        deskripsi: validated.data.deskripsi,
        youtubeUrl: validated.data.youtubeUrl,
        youtubeId: extractedId,
        urutan: urutanVal,
        isActive: validated.data.isActive ?? true,
      },
    });

    revalidatePath("/");
    revalidatePath("/admin/settings/video");

    return {
      success: true,
      data: created,
    };
  } catch (error) {
    console.error("Gagal membuat video profil baru:", error);
    return {
      success: false,
      error: "Gagal menyimpan video baru ke database.",
    };
  }
}

/**
 * Perbarui video yang sudah ada
 */
export async function updateVideoAction(
  id: number,
  data: {
    eyebrow: string;
    judul: string;
    deskripsi: string;
    youtubeUrl: string;
    urutan?: number;
    isActive?: boolean;
  }
) {
  await verifyAdminSession();

  const validated = videoItemSchema.safeParse(data);
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues[0]?.message || "Input video tidak valid.",
    };
  }

  const extractedId = extractYouTubeId(validated.data.youtubeUrl);
  if (!extractedId) {
    return {
      success: false,
      error:
        "Format URL YouTube tidak dikenali. Gunakan format seperti https://www.youtube.com/watch?v=... atau https://youtu.be/...",
    };
  }

  try {
    const updated = await prisma.videoProfil.update({
      where: { id },
      data: {
        eyebrow: validated.data.eyebrow,
        judul: validated.data.judul,
        deskripsi: validated.data.deskripsi,
        youtubeUrl: validated.data.youtubeUrl,
        youtubeId: extractedId,
        ...(typeof validated.data.urutan === "number" ? { urutan: validated.data.urutan } : {}),
        ...(typeof validated.data.isActive === "boolean" ? { isActive: validated.data.isActive } : {}),
      },
    });

    revalidatePath("/");
    revalidatePath("/admin/settings/video");

    return {
      success: true,
      data: updated,
    };
  } catch (error) {
    console.error("Gagal memperbarui video profil:", error);
    return {
      success: false,
      error: "Gagal memperbarui data video profil di database.",
    };
  }
}

/**
 * Hapus video
 */
export async function deleteVideoAction(id: number) {
  await verifyAdminSession();

  try {
    const count = await prisma.videoProfil.count();
    if (count <= 1) {
      return {
        success: false,
        error: "Minimal harus ada 1 video profil yang tersimpan di sistem.",
      };
    }

    await prisma.videoProfil.delete({
      where: { id },
    });

    revalidatePath("/");
    revalidatePath("/admin/settings/video");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Gagal menghapus video profil:", error);
    return {
      success: false,
      error: "Gagal menghapus video dari database.",
    };
  }
}

/**
 * Toggle status aktif/non-aktif video
 */
export async function toggleVideoStatusAction(id: number) {
  await verifyAdminSession();

  try {
    const existing = await prisma.videoProfil.findUnique({
      where: { id },
    });

    if (!existing) {
      return {
        success: false,
        error: "Data video tidak ditemukan.",
      };
    }

    const updated = await prisma.videoProfil.update({
      where: { id },
      data: {
        isActive: !existing.isActive,
      },
    });

    revalidatePath("/");
    revalidatePath("/admin/settings/video");

    return {
      success: true,
      isActive: updated.isActive,
    };
  } catch (error) {
    console.error("Gagal mengubah status video:", error);
    return {
      success: false,
      error: "Gagal mengubah status aktif video.",
    };
  }
}

/**
 * Fallback action untuk form lama (upsert video pertama)
 */
export async function saveVideoSettingsAction(data: {
  eyebrow: string;
  judul: string;
  deskripsi: string;
  youtubeUrl: string;
}) {
  const first = await prisma.videoProfil.findFirst({
    orderBy: { id: "asc" },
  });

  if (first) {
    return updateVideoAction(first.id, data);
  }
  return createVideoAction(data);
}

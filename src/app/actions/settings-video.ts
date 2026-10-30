"use server";

import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { extractYouTubeId } from "@/lib/youtube";

const videoSettingsSchema = z.object({
  eyebrow: z.string().min(2, "Tagline atas (eyebrow) minimal 2 karakter"),
  judul: z.string().min(5, "Judul video minimal 5 karakter"),
  deskripsi: z.string().min(10, "Deskripsi video minimal 10 karakter"),
  youtubeUrl: z.string().min(5, "URL YouTube wajib diisi"),
});

export async function getVideoSettings() {
  let video = await prisma.videoProfil.findUnique({
    where: { id: 1 },
  });

  if (!video) {
    video = await prisma.videoProfil.create({
      data: {
        id: 1,
        eyebrow: "DEDIKASI, INTEGRITAS & PELAYANAN PUBLIK PRIMA",
        judul: "Mengenal Lebih Dekat Dedikasi & Layanan BBPOM di Palembang",
        deskripsi:
          "Saksikan dokumentasi resmi mengenai fasilitas laboratorium modern teruji, pengawasan peredaran terpadu, serta komitmen seluruh insan BPOM dalam melindungi kesehatan masyarakat Sumatera Selatan.",
        youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        youtubeId: "dQw4w9WgXcQ",
      },
    });
  }

  return video;
}

export async function saveVideoSettingsAction(data: {
  eyebrow: string;
  judul: string;
  deskripsi: string;
  youtubeUrl: string;
}) {
  await verifyAdminSession();

  const validated = videoSettingsSchema.safeParse(data);
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues[0]?.message || "Input video profil tidak valid.",
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
    const updated = await prisma.videoProfil.upsert({
      where: { id: 1 },
      update: {
        eyebrow: validated.data.eyebrow,
        judul: validated.data.judul,
        deskripsi: validated.data.deskripsi,
        youtubeUrl: validated.data.youtubeUrl,
        youtubeId: extractedId,
      },
      create: {
        id: 1,
        eyebrow: validated.data.eyebrow,
        judul: validated.data.judul,
        deskripsi: validated.data.deskripsi,
        youtubeUrl: validated.data.youtubeUrl,
        youtubeId: extractedId,
      },
    });

    revalidatePath("/");

    return {
      success: true,
      data: updated,
    };
  } catch (error) {
    console.error("Gagal menyimpan video profil:", error);
    return {
      success: false,
      error: "Gagal menyimpan pengaturan video profil ke database.",
    };
  }
}

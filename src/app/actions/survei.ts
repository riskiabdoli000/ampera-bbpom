"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface SurveiPengajuanData {
  id: number;
  kodePengajuan: string;
  status: string;
  namaPemohon: string;
  namaLayanan: string;
  kodeLayanan: string;
  waktuPengajuan: Date;
  sudahSurvei: boolean;
  dataSurvei?: {
    ratingBintang: number;
    kualitasPelayanan: number;
    manfaatPelayanan: number;
    kualitasWebsite: number;
    manfaatWebsite: number;
    kritikSaran: string | null;
    createdAt: Date;
  } | null;
}

export interface SurveiInput {
  kodePengajuan: string;
  ratingBintang: number;
  kualitasPelayanan: number;
  manfaatPelayanan: number;
  kualitasWebsite: number;
  manfaatWebsite: number;
  kritikSaran?: string;
}

/**
 * Mengambil informasi pengajuan untuk keperluan pengisian formulir survei kepuasan
 */
export async function getSurveiPengajuanAction(
  kodePengajuan: string
): Promise<{ success: boolean; message?: string; data?: SurveiPengajuanData }> {
  try {
    const cleanKode = (kodePengajuan || "").trim();
    if (!cleanKode) {
      return {
        success: false,
        message: "Nomor tiket permohonan wajib disertakan.",
      };
    }

    const pengajuan = await prisma.pengajuanLayanan.findUnique({
      where: { kodePengajuan: cleanKode },
      include: {
        tamu: true,
        layanan: true,
        survei: true,
      },
    });

    if (!pengajuan) {
      return {
        success: false,
        message: `Tiket permohonan "${cleanKode}" tidak ditemukan dalam sistem BBPOM Palembang. Pastikan nomor tiket yang Anda buka sudah sesuai.`,
      };
    }

    return {
      success: true,
      data: {
        id: pengajuan.id,
        kodePengajuan: pengajuan.kodePengajuan,
        status: pengajuan.status,
        namaPemohon: pengajuan.tamu.nama,
        namaLayanan: pengajuan.layanan.nama,
        kodeLayanan: pengajuan.layanan.kode,
        waktuPengajuan: pengajuan.createdAt,
        sudahSurvei: Boolean(pengajuan.survei),
        dataSurvei: pengajuan.survei
          ? {
              ratingBintang: pengajuan.survei.ratingBintang,
              kualitasPelayanan: pengajuan.survei.kualitasPelayanan,
              manfaatPelayanan: pengajuan.survei.manfaatPelayanan,
              kualitasWebsite: pengajuan.survei.kualitasWebsite,
              manfaatWebsite: pengajuan.survei.manfaatWebsite,
              kritikSaran: pengajuan.survei.kritikSaran,
              createdAt: pengajuan.survei.createdAt,
            }
          : null,
      },
    };
  } catch (error) {
    console.error("[getSurveiPengajuanAction Error]", error);
    return {
      success: false,
      message: "Terjadi gangguan sistem saat memuat data survei. Silakan coba beberapa saat lagi.",
    };
  }
}

/**
 * Menyimpan hasil pengisian survei kepuasan masyarakat
 */
export async function submitSurveiAction(
  input: SurveiInput
): Promise<{ success: boolean; message: string }> {
  try {
    const cleanKode = (input.kodePengajuan || "").trim();
    if (!cleanKode) {
      return { success: false, message: "Nomor tiket pengajuan tidak valid." };
    }

    // Validasi nilai rating (1 s.d. 5)
    if (!input.ratingBintang || input.ratingBintang < 1 || input.ratingBintang > 5) {
      return { success: false, message: "Silakan berikan penilaian bintang antara 1 hingga 5." };
    }

    if (!input.kualitasPelayanan || input.kualitasPelayanan < 1 || input.kualitasPelayanan > 5) {
      return { success: false, message: "Silakan pilih penilaian kualitas pelayanan petugas." };
    }

    if (!input.manfaatPelayanan || input.manfaatPelayanan < 1 || input.manfaatPelayanan > 5) {
      return { success: false, message: "Silakan pilih penilaian kebermanfaatan pelayanan petugas." };
    }

    if (!input.kualitasWebsite || input.kualitasWebsite < 1 || input.kualitasWebsite > 5) {
      return { success: false, message: "Silakan pilih penilaian kualitas sistem website AMPERA." };
    }

    if (!input.manfaatWebsite || input.manfaatWebsite < 1 || input.manfaatWebsite > 5) {
      return { success: false, message: "Silakan pilih penilaian kebermanfaatan website AMPERA." };
    }

    const pengajuan = await prisma.pengajuanLayanan.findUnique({
      where: { kodePengajuan: cleanKode },
      include: { survei: true },
    });

    if (!pengajuan) {
      return { success: false, message: "Data tiket pengajuan tidak ditemukan." };
    }

    if (pengajuan.survei) {
      return {
        success: false,
        message: "Survei untuk tiket pengajuan ini telah berhasil dikirimkan sebelumnya. Terima kasih atas partisipasi Anda!",
      };
    }

    await prisma.surveiLayanan.create({
      data: {
        pengajuanId: pengajuan.id,
        ratingBintang: input.ratingBintang,
        kualitasPelayanan: input.kualitasPelayanan,
        manfaatPelayanan: input.manfaatPelayanan,
        kualitasWebsite: input.kualitasWebsite,
        manfaatWebsite: input.manfaatWebsite,
        kritikSaran: input.kritikSaran?.trim() || null,
      },
    });

    try {
      revalidatePath("/admin");
      revalidatePath("/admin/data-ampera");
      revalidatePath(`/survei`);
    } catch {
      // Ignore outside request context
    }

    return {
      success: true,
      message: "Terima kasih banyak! Penilaian dan masukan Anda telah berhasil tersimpan dan sangat berarti bagi peningkatan kualitas layanan BBPOM di Palembang.",
    };
  } catch (error: any) {
    console.error("[submitSurveiAction Error]", error);
    return {
      success: false,
      message: error?.message || "Gagal menyimpan hasil survei. Silakan coba lagi.",
    };
  }
}

"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { verifyAdminSession } from "@/lib/auth/session";

export interface PenilaianItem {
  id: number;
  pengajuanId: number;
  ratingBintang: number;
  kualitasPelayanan: number;
  manfaatPelayanan: number;
  kualitasWebsite: number;
  manfaatWebsite: number;
  kritikSaran: string | null;
  createdAt: Date;

  pengajuan: {
    id: number;
    kodePengajuan: string;
    status: string;
    createdAt: Date;
    layanan: {
      id: number;
      kode: string;
      nama: string;
    };
    tamu: {
      id: number;
      nama: string;
      telepon: string | null;
      email: string | null;
      asalInstansi: string | null;
      alamat: string | null;
    };
  };
}

export interface PenilaianStats {
  totalSurvei: number;
  avgRatingBintang: number;
  avgKualitasPelayanan: number;
  avgManfaatPelayanan: number;
  avgKualitasWebsite: number;
  avgManfaatWebsite: number;
  skorIkm: number; // Skala 0 - 100
  mutuPelayanan: "A (Sangat Baik)" | "B (Baik)" | "C (Kurang Baik)" | "D (Tidak Baik)";
  distribusiBintang: {
    bintang5: number;
    bintang4: number;
    bintang3: number;
    bintang2: number;
    bintang1: number;
  };
}

export interface AdminPenilaianOverviewResponse {
  list: PenilaianItem[];
  stats: PenilaianStats;
}

/**
 * Mengambil seluruh data penilaian / survei kepuasan masyarakat beserta statistik agregat IKM
 */
export async function getAdminPenilaianOverviewAction(): Promise<AdminPenilaianOverviewResponse> {
  try {
    const session = await verifyAdminSession();
    if (!session) {
      throw new Error("Akses ditolak. Silakan login sebagai Admin.");
    }
    const rawData = await prisma.surveiLayanan.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        pengajuan: {
          include: {
            layanan: true,
            tamu: true,
          },
        },
      },
    });

    const total = rawData.length;

    let sumBintang = 0;
    let sumKualitasPelayanan = 0;
    let sumManfaatPelayanan = 0;
    let sumKualitasWebsite = 0;
    let sumManfaatWebsite = 0;

    const distribusiBintang = {
      bintang5: 0,
      bintang4: 0,
      bintang3: 0,
      bintang2: 0,
      bintang1: 0,
    };

    const list: PenilaianItem[] = rawData.map((item) => {
      sumBintang += item.ratingBintang;
      sumKualitasPelayanan += item.kualitasPelayanan;
      sumManfaatPelayanan += item.manfaatPelayanan;
      sumKualitasWebsite += item.kualitasWebsite;
      sumManfaatWebsite += item.manfaatWebsite;

      if (item.ratingBintang === 5) distribusiBintang.bintang5++;
      else if (item.ratingBintang === 4) distribusiBintang.bintang4++;
      else if (item.ratingBintang === 3) distribusiBintang.bintang3++;
      else if (item.ratingBintang === 2) distribusiBintang.bintang2++;
      else if (item.ratingBintang === 1) distribusiBintang.bintang1++;

      return {
        id: item.id,
        pengajuanId: item.pengajuanId,
        ratingBintang: item.ratingBintang,
        kualitasPelayanan: item.kualitasPelayanan,
        manfaatPelayanan: item.manfaatPelayanan,
        kualitasWebsite: item.kualitasWebsite,
        manfaatWebsite: item.manfaatWebsite,
        kritikSaran: item.kritikSaran,
        createdAt: item.createdAt,
        pengajuan: {
          id: item.pengajuan.id,
          kodePengajuan: item.pengajuan.kodePengajuan,
          status: item.pengajuan.status,
          createdAt: item.pengajuan.createdAt,
          layanan: {
            id: item.pengajuan.layanan.id,
            kode: item.pengajuan.layanan.kode,
            nama: item.pengajuan.layanan.nama,
          },
          tamu: {
            id: item.pengajuan.tamu.id,
            nama: item.pengajuan.tamu.nama,
            telepon: item.pengajuan.tamu.telepon,
            email: item.pengajuan.tamu.email,
            asalInstansi: item.pengajuan.tamu.asalInstansi,
            alamat: item.pengajuan.tamu.alamat,
          },
        },
      };
    });

    const avgRatingBintang = total > 0 ? Number((sumBintang / total).toFixed(2)) : 0;
    const avgKualitasPelayanan = total > 0 ? Number((sumKualitasPelayanan / total).toFixed(2)) : 0;
    const avgManfaatPelayanan = total > 0 ? Number((sumManfaatPelayanan / total).toFixed(2)) : 0;
    const avgKualitasWebsite = total > 0 ? Number((sumKualitasWebsite / total).toFixed(2)) : 0;
    const avgManfaatWebsite = total > 0 ? Number((sumManfaatWebsite / total).toFixed(2)) : 0;

    // Kalkulasi Indeks Kepuasan Masyarakat (IKM) skala 100 berdasarkan 5 indikator
    const rerataKeseluruhan =
      total > 0
        ? (avgRatingBintang +
            avgKualitasPelayanan +
            avgManfaatPelayanan +
            avgKualitasWebsite +
            avgManfaatWebsite) /
          5
        : 0;

    const skorIkm = Number(((rerataKeseluruhan / 5) * 100).toFixed(1));

    // Standar Nilai Mutu PermenPAN-RB No. 14 Tahun 2017:
    // 88.31 - 100.00: A (Sangat Baik)
    // 76.61 - 88.30: B (Baik)
    // 65.00 - 76.60: C (Kurang Baik)
    // 25.00 - 64.99: D (Tidak Baik)
    let mutuPelayanan: "A (Sangat Baik)" | "B (Baik)" | "C (Kurang Baik)" | "D (Tidak Baik)" =
      "A (Sangat Baik)";

    if (skorIkm >= 88.31) {
      mutuPelayanan = "A (Sangat Baik)";
    } else if (skorIkm >= 76.61) {
      mutuPelayanan = "B (Baik)";
    } else if (skorIkm >= 65.0) {
      mutuPelayanan = "C (Kurang Baik)";
    } else {
      mutuPelayanan = "D (Tidak Baik)";
    }

    return {
      list,
      stats: {
        totalSurvei: total,
        avgRatingBintang,
        avgKualitasPelayanan,
        avgManfaatPelayanan,
        avgKualitasWebsite,
        avgManfaatWebsite,
        skorIkm,
        mutuPelayanan,
        distribusiBintang,
      },
    };
  } catch (error) {
    console.error("[getAdminPenilaianOverviewAction Error]", error);
    return {
      list: [],
      stats: {
        totalSurvei: 0,
        avgRatingBintang: 0,
        avgKualitasPelayanan: 0,
        avgManfaatPelayanan: 0,
        avgKualitasWebsite: 0,
        avgManfaatWebsite: 0,
        skorIkm: 0,
        mutuPelayanan: "A (Sangat Baik)",
        distribusiBintang: {
          bintang5: 0,
          bintang4: 0,
          bintang3: 0,
          bintang2: 0,
          bintang1: 0,
        },
      },
    };
  }
}

/**
 * Menghapus data penilaian tertentu oleh Administrator
 */
export async function deletePenilaianAction(
  id: number
): Promise<{ success: boolean; message: string }> {
  try {
    const session = await verifyAdminSession();
    if (!session) {
      return { success: false, message: "Akses ditolak. Silakan login sebagai Admin." };
    }
    await prisma.surveiLayanan.delete({
      where: { id },
    });

    try {
      revalidatePath("/");
    } catch {
      // Ignore outside request context
    }

    return {
      success: true,
      message: "Data penilaian berhasil dihapus dari sistem.",
    };
  } catch (error: any) {
    console.error("[deletePenilaianAction Error]", error);
    return {
      success: false,
      message: error?.message || "Gagal menghapus data penilaian.",
    };
  }
}

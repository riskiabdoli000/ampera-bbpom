"use server";

import { prisma } from "@/lib/prisma";

export interface LandingReviewItem {
  id: number;
  kodePengajuan: string;
  namaTamu: string;
  asalInstansi: string;
  layananNama: string;
  layananKode: string;
  ratingBintang: number;
  kualitasPelayanan: number;
  manfaatPelayanan: number;
  kualitasWebsite: number;
  manfaatWebsite: number;
  kritikSaran: string | null;
  createdAt: string;
}

export interface LandingPenilaianData {
  totalSurvei: number;
  avgRatingBintang: number;
  skorIkm: number;
  mutuPelayanan: "A (Sangat Baik)" | "B (Baik)" | "C (Kurang Baik)" | "D (Tidak Baik)";
  persenPuas: number; // Persentase bintang 4 & 5
  avgKualitasPelayanan: number;
  avgManfaatPelayanan: number;
  avgKualitasWebsite: number;
  avgManfaatWebsite: number;
  distribusiBintang: {
    bintang5: number;
    bintang4: number;
    bintang3: number;
    bintang2: number;
    bintang1: number;
  };
  reviews: LandingReviewItem[];
}

/**
 * Mengambil ringkasan penilaian dan ulasan masyarakat untuk landing page
 */
export async function getLandingPenilaianData(): Promise<LandingPenilaianData> {
  try {
    const rawSurvei = await prisma.surveiLayanan.findMany({
      orderBy: { createdAt: "desc" },
      take: 6, // 6 ulasan terbaru untuk carousel / grid landing page
      include: {
        pengajuan: {
          include: {
            layanan: true,
            tamu: true,
          },
        },
      },
    });

    const allSurvei = await prisma.surveiLayanan.findMany({
      select: {
        ratingBintang: true,
        kualitasPelayanan: true,
        manfaatPelayanan: true,
        kualitasWebsite: true,
        manfaatWebsite: true,
      },
    });

    const total = allSurvei.length;

    let sumBintang = 0;
    let sumKualitasPelayanan = 0;
    let sumManfaatPelayanan = 0;
    let sumKualitasWebsite = 0;
    let sumManfaatWebsite = 0;
    let countPuas = 0;

    const dist = {
      bintang5: 0,
      bintang4: 0,
      bintang3: 0,
      bintang2: 0,
      bintang1: 0,
    };

    allSurvei.forEach((item) => {
      sumBintang += item.ratingBintang;
      sumKualitasPelayanan += item.kualitasPelayanan;
      sumManfaatPelayanan += item.manfaatPelayanan;
      sumKualitasWebsite += item.kualitasWebsite;
      sumManfaatWebsite += item.manfaatWebsite;

      if (item.ratingBintang >= 4) countPuas++;

      if (item.ratingBintang === 5) dist.bintang5++;
      else if (item.ratingBintang === 4) dist.bintang4++;
      else if (item.ratingBintang === 3) dist.bintang3++;
      else if (item.ratingBintang === 2) dist.bintang2++;
      else if (item.ratingBintang === 1) dist.bintang1++;
    });

    const avgRatingBintang = total > 0 ? Number((sumBintang / total).toFixed(1)) : 5.0;
    const avgKualitasPelayanan =
      total > 0 ? Number((sumKualitasPelayanan / total).toFixed(1)) : 5.0;
    const avgManfaatPelayanan =
      total > 0 ? Number((sumManfaatPelayanan / total).toFixed(1)) : 5.0;
    const avgKualitasWebsite =
      total > 0 ? Number((sumKualitasWebsite / total).toFixed(1)) : 5.0;
    const avgManfaatWebsite =
      total > 0 ? Number((sumManfaatWebsite / total).toFixed(1)) : 5.0;

    const rerata =
      total > 0
        ? (avgRatingBintang +
            avgKualitasPelayanan +
            avgManfaatPelayanan +
            avgKualitasWebsite +
            avgManfaatWebsite) /
          5
        : 5.0;

    const skorIkm = total > 0 ? Number(((rerata / 5) * 100).toFixed(1)) : 100.0;
    const persenPuas = total > 0 ? Math.round((countPuas / total) * 100) : 100;

    let mutu: "A (Sangat Baik)" | "B (Baik)" | "C (Kurang Baik)" | "D (Tidak Baik)" =
      "A (Sangat Baik)";
    if (skorIkm >= 88.31) mutu = "A (Sangat Baik)";
    else if (skorIkm >= 76.61) mutu = "B (Baik)";
    else if (skorIkm >= 65.0) mutu = "C (Kurang Baik)";
    else mutu = "D (Tidak Baik)";

    const reviews: LandingReviewItem[] = rawSurvei.map((s) => ({
      id: s.id,
      kodePengajuan: s.pengajuan.kodePengajuan,
      namaTamu: s.pengajuan.tamu.nama,
      asalInstansi:
        s.pengajuan.tamu.asalInstansi ||
        s.pengajuan.tamu.alamat ||
        "Masyarakat Umum",
      layananNama: s.pengajuan.layanan.nama,
      layananKode: s.pengajuan.layanan.kode,
      ratingBintang: s.ratingBintang,
      kualitasPelayanan: s.kualitasPelayanan,
      manfaatPelayanan: s.manfaatPelayanan,
      kualitasWebsite: s.kualitasWebsite,
      manfaatWebsite: s.manfaatWebsite,
      kritikSaran: s.kritikSaran,
      createdAt: s.createdAt.toISOString(),
    }));

    return {
      totalSurvei: total,
      avgRatingBintang,
      skorIkm,
      mutuPelayanan: mutu,
      persenPuas,
      avgKualitasPelayanan,
      avgManfaatPelayanan,
      avgKualitasWebsite,
      avgManfaatWebsite,
      distribusiBintang: dist,
      reviews,
    };
  } catch (error) {
    console.error("[getLandingPenilaianData] Gagal mengambil data survei:", error);
    // Fallback data aman
    return {
      totalSurvei: 0,
      avgRatingBintang: 5.0,
      skorIkm: 100.0,
      mutuPelayanan: "A (Sangat Baik)",
      persenPuas: 100,
      avgKualitasPelayanan: 5.0,
      avgManfaatPelayanan: 5.0,
      avgKualitasWebsite: 5.0,
      avgManfaatWebsite: 5.0,
      distribusiBintang: {
        bintang5: 0,
        bintang4: 0,
        bintang3: 0,
        bintang2: 0,
        bintang1: 0,
      },
      reviews: [],
    };
  }
}

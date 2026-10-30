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
    // Eksekusi paralel: 6 ulasan terbaru + agregasi SQL langsung (tanpa full-table scan di memori Node.js)
    const [rawSurvei, aggregateStats, starDistribution] = await Promise.all([
      prisma.surveiLayanan.findMany({
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
      }),
      prisma.surveiLayanan.aggregate({
        _count: { _all: true },
        _avg: {
          ratingBintang: true,
          kualitasPelayanan: true,
          manfaatPelayanan: true,
          kualitasWebsite: true,
          manfaatWebsite: true,
        },
      }),
      prisma.surveiLayanan.groupBy({
        by: ["ratingBintang"],
        _count: { _all: true },
      }),
    ]);

    const total = aggregateStats._count._all;

    const dist = {
      bintang5: 0,
      bintang4: 0,
      bintang3: 0,
      bintang2: 0,
      bintang1: 0,
    };

    for (const group of starDistribution) {
      if (group.ratingBintang === 5) dist.bintang5 = group._count._all;
      else if (group.ratingBintang === 4) dist.bintang4 = group._count._all;
      else if (group.ratingBintang === 3) dist.bintang3 = group._count._all;
      else if (group.ratingBintang === 2) dist.bintang2 = group._count._all;
      else if (group.ratingBintang === 1) dist.bintang1 = group._count._all;
    }

    const countPuas = dist.bintang5 + dist.bintang4;

    const avgRatingBintang =
      total > 0 ? Number((aggregateStats._avg.ratingBintang || 5.0).toFixed(1)) : 5.0;
    const avgKualitasPelayanan =
      total > 0 ? Number((aggregateStats._avg.kualitasPelayanan || 5.0).toFixed(1)) : 5.0;
    const avgManfaatPelayanan =
      total > 0 ? Number((aggregateStats._avg.manfaatPelayanan || 5.0).toFixed(1)) : 5.0;
    const avgKualitasWebsite =
      total > 0 ? Number((aggregateStats._avg.kualitasWebsite || 5.0).toFixed(1)) : 5.0;
    const avgManfaatWebsite =
      total > 0 ? Number((aggregateStats._avg.manfaatWebsite || 5.0).toFixed(1)) : 5.0;

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

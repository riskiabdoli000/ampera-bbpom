"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { verifyAdminSession } from "@/lib/auth/session";
import {
  SOAL_PRE_TEST,
  SOAL_POST_TEST,
  MODUL_MATERI_LIST,
} from "@/components/garda-ampera/data/mock-data";
import { SoalUjian, ModulMateri, BiodataGarda, EvaluasiGarda } from "@/components/garda-ampera/types";
import {
  parseQuestionsFromRawText,
  formatPagesToSlides,
  parsePptxSlides,
  compressPdfBuffer,
  compressPptxBuffer,
  formatFileSize,
} from "@/lib/garda-parser";

// In-memory fallback store untuk memastikan fungsi tetap 100% berjalan
// jika database PostgreSQL Supabase sedang offline atau dalam sinkronisasi kredensial
interface FallbackStore {
  pesertaList: any[];
  soalList: any[];
  materiList: any[];
}

// Inisialisasi data default kosong (menunggu input dari database / admin)
const globalFallback: FallbackStore = {
  pesertaList: [],
  soalList: [],
  materiList: [],
};

// =========================================================================
// 1. PUBLIC ACTIONS (UNTUK PORTAL PESERTA /garda-ampera)
// =========================================================================

/**
 * Helper untuk mengacak urutan dan mengambil maksimal count (default 10) butir soal
 */
function shuffleAndPick<T>(array: T[], count: number = 10): T[] {
  if (!array || array.length === 0) return [];
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

/**
 * Mengambil data soal Pre-Test, Post-Test, dan 3 Modul Materi secara dinamis
 * Jika soal bertipe "SEMUA", maka soal tersebut digabung ke pool Pre-Test dan Post-Test.
 * Dari masing-masing pool (misal 20 butir soal), sistem mengambil 10 butir soal secara acak.
 */
export async function getGardaPublicDataAction(): Promise<{
  preTestSoal: SoalUjian[];
  postTestSoal: SoalUjian[];
  modules: ModulMateri[];
}> {
  let preList: SoalUjian[] = [];
  let postList: SoalUjian[] = [];
  let formattedModules: ModulMateri[] = [];

  try {
    // Coba ambil dari Database Prisma
    const [dbSoal, dbMateri] = await Promise.all([
      (prisma as any).gardaSoal?.findMany({
        where: { isAktif: true },
        orderBy: { urutan: "asc" },
      }),
      (prisma as any).gardaMateri?.findMany({
        where: { isAktif: true },
        orderBy: { nomor: "asc" },
        include: { slides: { orderBy: { urutan: "asc" } } },
      }),
    ]);

    if (dbSoal && dbSoal.length > 0) {
      dbSoal.forEach((item: any) => {
        const formatted: SoalUjian = {
          id: item.id,
          kategori: item.kategori,
          pertanyaan: item.pertanyaan,
          pilihan: [
            { id: "A", teks: item.pilihanA },
            { id: "B", teks: item.pilihanB },
            { id: "C", teks: item.pilihanC },
            { id: "D", teks: item.pilihanD },
          ],
          jawabanBenar: item.jawabanBenar,
          penjelasan: item.penjelasan,
        };

        if (item.tipe === "PRE_TEST") {
          preList.push(formatted);
        } else if (item.tipe === "POST_TEST") {
          postList.push(formatted);
        } else if (item.tipe === "SEMUA") {
          preList.push(formatted);
          postList.push(formatted);
        }
      });
    }

    if (dbMateri && dbMateri.length > 0) {
      formattedModules = dbMateri.map((m: any) => ({
        id: m.id,
        nomor: m.nomor,
        judul: m.judul,
        ringkasan: m.ringkasan,
        durasi: m.durasi,
        jumlahSlide: m.slides.length,
        pdfUrl: m.pdfUrl,
        slides: m.slides.map((s: any) => ({
          id: s.id,
          judul: s.judul,
          subjudul: s.subjudul,
          poin: typeof s.poin === "string" ? JSON.parse(s.poin || "[]") : (s.poin || []),
          tips: s.tips,
          badge: s.badge,
        })),
      }));
    }
  } catch (err) {
    // Abaikan jika DB belum tersinkronisasi
  }

  // Jika database belum ada data soal, gunakan fallback
  if (preList.length === 0 && postList.length === 0) {
    (globalFallback.soalList || [])
      .filter((s) => s.isAktif)
      .forEach((s) => {
        const formatted: SoalUjian = {
          id: s.id,
          kategori: s.kategori,
          pertanyaan: s.pertanyaan,
          pilihan: [
            { id: "A", teks: s.pilihanA },
            { id: "B", teks: s.pilihanB },
            { id: "C", teks: s.pilihanC },
            { id: "D", teks: s.pilihanD },
          ],
          jawabanBenar: s.jawabanBenar,
          penjelasan: s.penjelasan,
        };

        if (s.tipe === "PRE_TEST") {
          preList.push(formatted);
        } else if (s.tipe === "POST_TEST") {
          postList.push(formatted);
        } else if (s.tipe === "SEMUA") {
          preList.push(formatted);
          postList.push(formatted);
        }
      });
  }

  // Jika database belum ada data materi, gunakan fallback
  if (formattedModules.length === 0) {
    formattedModules = (globalFallback.materiList || [])
      .filter((m) => m.isAktif)
      .map((m) => ({
        id: m.id,
        nomor: m.nomor,
        judul: m.judul,
        ringkasan: m.ringkasan,
        durasi: m.durasi,
        jumlahSlide: m.slides?.length || 0,
        pdfUrl: m.pdfUrl,
        slides: (m.slides || []).map((s: any) => ({
          id: s.id,
          judul: s.judul,
          subjudul: s.subjudul,
          poin: typeof s.poin === "string" ? JSON.parse(s.poin || "[]") : (s.poin || []),
          tips: s.tips,
          badge: s.badge,
        })),
      }));
  }

  // Ambil 10 butir soal secara acak dari bank soal (20 butir) untuk Pre-Test
  // Sesuai ketentuan alur pengguna: Soal Post-Test dibuat sama persis dengan Pre-Test beserta urutan nomornya
  const pool = preList.length > 0 ? preList : postList;
  const selectedSoal = shuffleAndPick(pool, 10);

  return {
    preTestSoal: selectedSoal,
    postTestSoal: selectedSoal,
    modules: formattedModules,
  };
}

const ROMAN_MONTHS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

/**
 * Format nomor sertifikat resmi GARDA AMPERA sesuai format:
 * {Urutan 3-digit}/GARDAAMPERA/BBPOMPLG/{BulanRomawi}/{Tahun}
 * Contoh: 001/GARDAAMPERA/BBPOMPLG/X/2026
 */
function formatNomorSertifikatGarda(urutan: number, date = new Date()): string {
  const pad = String(urutan).padStart(3, "0");
  const month = ROMAN_MONTHS[date.getMonth()];
  const year = date.getFullYear();
  return `${pad}/GARDAAMPERA/BBPOMPLG/${month}/${year}`;
}

/**
 * Mendapatkan nomor sertifikat berikutnya yang otomatis berurutan
 */
export async function getNextGardaNomorSertifikatAction(): Promise<string> {
  try {
    if ((prisma as any).gardaPeserta) {
      const count = await (prisma as any).gardaPeserta.count({
        where: { isLulus: true },
      });
      return formatNomorSertifikatGarda(count + 1);
    }
  } catch (err: any) {
    console.warn("Gagal menghitung nomor sertifikat berikutnya:", err.message);
  }
  return formatNomorSertifikatGarda(globalFallback.pesertaList.filter((p) => p.isLulus).length + 1);
}

/**
 * Menyimpan hasil penyelesaian ujian peserta Garda Ampera
 */
export async function submitGardaPesertaAssessmentAction(payload: {
  biodata: BiodataGarda;
  preTestScore: number;
  postTestScore: number;
  postTestAttempts: number;
  isLulus: boolean;
  nomorSertifikat?: string;
  evaluasi?: EvaluasiGarda | null;
}): Promise<{ success: boolean; id?: number; nomorSertifikat?: string; message?: string }> {
  try {
    const { biodata, preTestScore, postTestScore, postTestAttempts, isLulus, evaluasi } = payload;
    const cleanNik = (biodata.nik || "").trim();

    // Cek terlebih dahulu apakah NIK ini sudah pernah lulus dan mendapatkan sertifikat (1 orang hanya bisa 1 kali)
    if (cleanNik && (prisma as any).gardaPeserta) {
      try {
        const existingGraduated = await (prisma as any).gardaPeserta.findFirst({
          where: { nik: cleanNik, isLulus: true },
          orderBy: { createdAt: "desc" },
        });
        if (existingGraduated) {
          return {
            success: true,
            id: existingGraduated.id,
            nomorSertifikat: existingGraduated.nomorSertifikat || undefined,
            message: "Peserta dengan NIK ini sudah pernah menyelesaikan Garda Ampera.",
          };
        }
      } catch (e) {
        console.warn("Gagal memeriksa duplikasi NIK peserta:", e);
      }
    }

    // Tentukan nomor sertifikat resmi secara berurutan langsung dari database jika lulus
    let finalNomorSertifikat = payload.nomorSertifikat;
    if (isLulus) {
      try {
        let nextSeq =
          (await (prisma as any).gardaPeserta.count({
            where: { isLulus: true },
          })) + 1;
        let candidate = formatNomorSertifikatGarda(nextSeq);
        // Pastikan tidak bentrok dengan constraint @unique pada nomorSertifikat
        while (
          await (prisma as any).gardaPeserta.findUnique({
            where: { nomorSertifikat: candidate },
            select: { id: true },
          })
        ) {
          nextSeq++;
          candidate = formatNomorSertifikatGarda(nextSeq);
        }
        finalNomorSertifikat = candidate;
      } catch {
        if (!finalNomorSertifikat || !finalNomorSertifikat.includes("/GARDAAMPERA/BBPOMPLG/")) {
          finalNomorSertifikat = formatNomorSertifikatGarda(
            globalFallback.pesertaList.filter((p) => p.isLulus).length + 1
          );
        }
      }
    } else {
      finalNomorSertifikat = undefined;
    }

    // Coba simpan ke database Prisma
    if ((prisma as any).gardaPeserta) {
      const created = await (prisma as any).gardaPeserta.create({
        data: {
          nik: biodata.nik,
          nama: biodata.nama,
          tanggalTes: new Date(biodata.tanggalTes || Date.now()),
          alamat: biodata.alamat,
          usia: parseInt(biodata.usia) || 25,
          jenisKelamin: biodata.jenisKelamin || "Laki-laki",
          pendidikan: biodata.pendidikan,
          pekerjaan: biodata.pekerjaan,
          instansi: biodata.instansi,
          preTestScore,
          postTestScore,
          postTestAttempts,
          isLulus,
          nomorSertifikat: finalNomorSertifikat || null,
          tanggalLulus: isLulus ? new Date() : null,
          ...(evaluasi
            ? {
                evaluasi: {
                  create: {
                    ratingKemudahan: evaluasi.ratingKemudahan,
                    ratingMateri: evaluasi.ratingMateri,
                    ratingSoal: evaluasi.ratingSoal,
                    ratingManfaat: evaluasi.ratingManfaat,
                    kritikSaran: evaluasi.kritikSaran,
                  },
                },
              }
            : {}),
        },
      });

      revalidatePath("/admin/garda-ampera");
      return { success: true, id: created.id, nomorSertifikat: finalNomorSertifikat };
    }
  } catch (err: any) {
    console.warn("Prisma save failed, saving to fallback cache:", err.message);
  }

  // Fallback memory cache
  const isLulus = payload.isLulus;
  let finalNomorSertifikat = payload.nomorSertifikat;
  if (isLulus && (!finalNomorSertifikat || !finalNomorSertifikat.includes("/GARDAAMPERA/BBPOMPLG/"))) {
    finalNomorSertifikat = formatNomorSertifikatGarda(globalFallback.pesertaList.filter((p) => p.isLulus).length + 1);
  }

  const newId = globalFallback.pesertaList.length + 1;
  const newRecord = {
    id: newId,
    nik: payload.biodata.nik,
    nama: payload.biodata.nama,
    tanggalTes: new Date(payload.biodata.tanggalTes || Date.now()),
    alamat: payload.biodata.alamat,
    usia: parseInt(payload.biodata.usia) || 25,
    jenisKelamin: payload.biodata.jenisKelamin || "Laki-laki",
    pendidikan: payload.biodata.pendidikan,
    pekerjaan: payload.biodata.pekerjaan,
    instansi: payload.biodata.instansi,
    preTestScore: payload.preTestScore,
    postTestScore: payload.postTestScore,
    postTestAttempts: payload.postTestAttempts,
    isLulus: payload.isLulus,
    nomorSertifikat: finalNomorSertifikat || null,
    tanggalLulus: payload.isLulus ? new Date() : null,
    evaluasi: payload.evaluasi
      ? {
          ratingKemudahan: payload.evaluasi.ratingKemudahan,
          ratingMateri: payload.evaluasi.ratingMateri,
          ratingSoal: payload.evaluasi.ratingSoal,
          ratingManfaat: payload.evaluasi.ratingManfaat,
          kritikSaran: payload.evaluasi.kritikSaran,
        }
      : null,
    createdAt: new Date(),
  };

  globalFallback.pesertaList.unshift(newRecord);
  revalidatePath("/admin/garda-ampera");
  return { success: true, id: newId, nomorSertifikat: finalNomorSertifikat };
}

// =========================================================================
// 2. ADMIN ACTIONS (UNTUK CMS ADMIN /admin/garda-ampera)
// =========================================================================

export interface GardaPesertaItem {
  id: number;
  nik: string;
  nama: string;
  tanggalTes: string | Date;
  alamat: string;
  usia: number;
  jenisKelamin: string;
  pendidikan: string;
  pekerjaan: string;
  instansi: string;
  preTestScore: number | null;
  postTestScore: number | null;
  postTestAttempts: number;
  isLulus: boolean;
  nomorSertifikat: string | null;
  tanggalLulus: string | Date | null;
  evaluasi?: {
    ratingKemudahan: number;
    ratingMateri: number;
    ratingSoal: number;
    ratingManfaat: number;
    kritikSaran: string | null;
  } | null;
  createdAt: string | Date;
}

export interface GardaAdminStats {
  totalPeserta: number;
  totalLulus: number;
  totalRemidi: number;
  tingkatKelulusanPersen: number;
  rataRataPreTest: number;
  rataRataPostTest: number;
  peningkatanNilai: number;
  rataRataRatingSistem: number;
}

export interface GardaAdminOverviewResponse {
  pesertaList: GardaPesertaItem[];
  stats: GardaAdminStats;
  soalList: any[];
  materiList: any[];
  isDbConnected: boolean;
}

/**
 * Mengambil rekapitulasi data peserta, bank soal, dan modul materi untuk Admin CMS
 */
export async function getAdminGardaOverviewAction(): Promise<GardaAdminOverviewResponse> {
  const session = await verifyAdminSession();
  if (!session) {
    return {
      pesertaList: [],
      stats: {
        totalPeserta: 0,
        totalLulus: 0,
        totalRemidi: 0,
        tingkatKelulusanPersen: 0,
        rataRataPreTest: 0,
        rataRataPostTest: 0,
        peningkatanNilai: 0,
        rataRataRatingSistem: 0,
      },
      soalList: [],
      materiList: [],
      isDbConnected: false,
    };
  }
  let isDb = false;
  let rawPeserta: any[] = [];
  let rawSoal: any[] = [];
  let rawMateri: any[] = [];

  try {
    if ((prisma as any).gardaPeserta) {
      const [peserta, soal, materi] = await Promise.all([
        (prisma as any).gardaPeserta.findMany({
          orderBy: { createdAt: "desc" },
          include: { evaluasi: true },
        }),
        (prisma as any).gardaSoal?.findMany({
          orderBy: { urutan: "asc" },
        }),
        (prisma as any).gardaMateri?.findMany({
          orderBy: { nomor: "asc" },
          include: { slides: { orderBy: { urutan: "asc" } } },
        }),
      ]);

      if (peserta !== undefined && peserta !== null) {
        rawPeserta = peserta;
        rawSoal = soal || [];
        rawMateri = materi || [];
        isDb = true;
      }
    }
  } catch (err: any) {
    console.warn("DB query error in getAdminGardaOverviewAction:", err.message);
    isDb = false;
  }

  // Gunakan fallback store HANYA jika database tidak terhubung
  if (!isDb) {
    rawPeserta = globalFallback.pesertaList;
    rawSoal = globalFallback.soalList;
    rawMateri = globalFallback.materiList;
  }

  // Hitung Statistik
  const totalPeserta = rawPeserta.length;
  let totalLulus = 0;
  let sumPre = 0;
  let countPre = 0;
  let sumPost = 0;
  let countPost = 0;
  let sumRating = 0;
  let countRating = 0;

  rawPeserta.forEach((p) => {
    if (p.isLulus) totalLulus++;
    if (p.preTestScore !== null && p.preTestScore !== undefined) {
      sumPre += p.preTestScore;
      countPre++;
    }
    if (p.postTestScore !== null && p.postTestScore !== undefined) {
      sumPost += p.postTestScore;
      countPost++;
    }
    if (p.evaluasi) {
      const avg =
        (p.evaluasi.ratingKemudahan +
          p.evaluasi.ratingMateri +
          p.evaluasi.ratingSoal +
          p.evaluasi.ratingManfaat) /
        4;
      sumRating += avg;
      countRating++;
    }
  });

  const totalRemidi = totalPeserta - totalLulus;
  const tingkatKelulusanPersen =
    totalPeserta > 0 ? Math.round((totalLulus / totalPeserta) * 100) : 0;
  const rataRataPreTest = countPre > 0 ? Math.round(sumPre / countPre) : 0;
  const rataRataPostTest = countPost > 0 ? Math.round(sumPost / countPost) : 0;
  const peningkatanNilai = Math.max(0, rataRataPostTest - rataRataPreTest);
  const rataRataRatingSistem =
    countRating > 0 ? parseFloat((sumRating / countRating).toFixed(1)) : 0;

  return {
    pesertaList: rawPeserta,
    stats: {
      totalPeserta,
      totalLulus,
      totalRemidi,
      tingkatKelulusanPersen,
      rataRataPreTest,
      rataRataPostTest,
      peningkatanNilai,
      rataRataRatingSistem,
    },
    soalList: rawSoal,
    materiList: rawMateri,
    isDbConnected: isDb,
  };
}

/**
 * Tambah atau Edit Soal Ujian (Pre-Test / Post-Test) oleh Admin
 */
export async function adminUpsertSoalAction(payload: {
  id?: number;
  tipe: "PRE_TEST" | "POST_TEST" | "SEMUA";
  kategori: string;
  pertanyaan: string;
  pilihanA: string;
  pilihanB: string;
  pilihanC: string;
  pilihanD: string;
  jawabanBenar: string;
  penjelasan?: string;
  urutan?: number;
}): Promise<{ success: boolean; message: string }> {
  const session = await verifyAdminSession();
  if (!session) {
    return { success: false, message: "Akses ditolak. Silakan login sebagai Admin." };
  }
  try {
    if ((prisma as any).gardaSoal) {
      if (payload.id) {
        await (prisma as any).gardaSoal.update({
          where: { id: payload.id },
          data: payload,
        });
      } else {
        await (prisma as any).gardaSoal.create({
          data: payload,
        });
      }
      return { success: true, message: "Soal berhasil disimpan ke database." };
    }
  } catch (err: any) {
    console.warn("DB update failed, using fallback:", err.message);
  }

  // Update in fallback store
  if (payload.id) {
    const idx = globalFallback.soalList.findIndex((s) => s.id === payload.id);
    if (idx !== -1) {
      globalFallback.soalList[idx] = { ...globalFallback.soalList[idx], ...payload };
    }
  } else {
    const newId = globalFallback.soalList.length + 1;
    globalFallback.soalList.push({
      ...payload,
      id: newId,
      urutan: payload.urutan || globalFallback.soalList.length + 1,
      isAktif: true,
    });
  }

  return { success: true, message: "Soal berhasil disimpan." };
}

/**
 * Hapus Soal Ujian
 */
export async function adminDeleteSoalAction(id: number): Promise<{ success: boolean; message: string }> {
  const session = await verifyAdminSession();
  if (!session) {
    return { success: false, message: "Akses ditolak. Silakan login sebagai Admin." };
  }
  try {
    if ((prisma as any).gardaSoal) {
      await (prisma as any).gardaSoal.delete({
        where: { id },
      });
      return { success: true, message: "Soal berhasil dihapus dari database." };
    }
  } catch (err: any) {
    console.warn("DB delete failed, using fallback:", err.message);
  }

  globalFallback.soalList = globalFallback.soalList.filter((s) => s.id !== id);
  return { success: true, message: "Soal berhasil dihapus." };
}

/**
 * Hapus Data Peserta Garda Ampera
 */
export async function adminDeletePesertaAction(
  id: number
): Promise<{ success: boolean; message: string }> {
  const session = await verifyAdminSession();
  if (!session) {
    return { success: false, message: "Akses ditolak. Silakan login sebagai Admin." };
  }
  try {
    if ((prisma as any).gardaPeserta) {
      await (prisma as any).gardaPeserta.delete({
        where: { id },
      });
      return { success: true, message: "Data peserta berhasil dihapus dari database." };
    }
  } catch (err: any) {
    console.warn("DB delete peserta failed, using fallback:", err.message);
  }

  globalFallback.pesertaList = globalFallback.pesertaList.filter((p) => p.id !== id);
  return { success: true, message: "Data peserta berhasil dihapus." };
}

/**
 * Toggle Status Aktif Soal
 */
export async function adminToggleSoalStatusAction(
  id: number,
  isAktif: boolean
): Promise<{ success: boolean; message: string }> {
  const session = await verifyAdminSession();
  if (!session) {
    return { success: false, message: "Akses ditolak. Silakan login sebagai Admin." };
  }
  try {
    if ((prisma as any).gardaSoal) {
      await (prisma as any).gardaSoal.update({
        where: { id },
        data: { isAktif },
      });
      return { success: true, message: "Status soal diperbarui." };
    }
  } catch (err) {
    // fallback
  }

  const idx = globalFallback.soalList.findIndex((s) => s.id === id);
  if (idx !== -1) {
    globalFallback.soalList[idx].isAktif = isAktif;
  }
  return { success: true, message: "Status soal diperbarui." };
}

/**
 * Server Action: Preview berkas PDF atau PPT materi yang diunggah
 * Menghitung otomatis jumlah slide dan cuplikan judul slide
 */
export async function adminPreviewMateriFileAction(formData: FormData): Promise<{
  success: boolean;
  fileName: string;
  fileSizeText: string;
  totalSlides: number;
  slidesPreview?: Array<{ urutan: number; judul: string; subjudul: string }>;
  compressionStat?: {
    originalSize: number;
    compressedSize: number;
    savedPercent: number;
    originalSizeText: string;
    compressedSizeText: string;
  };
  message?: string;
}> {
  try {
    const session = await verifyAdminSession();
    if (!session) {
      return {
        success: false,
        fileName: "",
        fileSizeText: "",
        totalSlides: 0,
        message: "Akses ditolak. Silakan login sebagai Admin.",
      };
    }
    const file = formData.get("file") as File | null;
    const judul = (formData.get("judul") as string)?.trim() || "Modul Materi Pembelajaran";
    const nomor = parseInt((formData.get("nomor") as string) || "1", 10);

    if (!file || file.size === 0) {
      return {
        success: false,
        fileName: "",
        fileSizeText: "",
        totalSlides: 0,
        message: "Tidak ada berkas yang dipilih.",
      };
    }

    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    const fileName = file.name;
    const lowerName = fileName.toLowerCase();

    const fileSizeText = formatFileSize(file.size);
    let slides: any[] = [];
    let compressionStat: {
      originalSize: number;
      compressedSize: number;
      savedPercent: number;
      originalSizeText: string;
      compressedSizeText: string;
    } | undefined = undefined;

    if (lowerName.endsWith(".pdf")) {
      // Optimasi & Kompresi PDF di background
      const compPromise = compressPdfBuffer(uint8Array);

      try {
        // @ts-ignore
        const worker = await import("pdfjs-dist/legacy/build/pdf.worker.mjs");
        (globalThis as any).pdfjsWorker = worker;
      } catch {}

      const path = await import("path");
      const { pathToFileURL } = await import("url");
      const fontsPath =
        pathToFileURL(path.resolve(process.cwd(), "node_modules/pdfjs-dist/standard_fonts/")).href + "/";

      const { PDFParse } = await import("pdf-parse");
      const parser = new PDFParse({ data: uint8Array, standardFontDataUrl: fontsPath });
      const result = await parser.getText();
      const pages = result?.pages || [];
      if (pages.length > 0) {
        slides = formatPagesToSlides(pages, judul, nomor);
      }

      const comp = await compPromise;
      if (comp.savedPercent > 0) {
        compressionStat = {
          originalSize: comp.originalSize,
          compressedSize: comp.compressedSize,
          savedPercent: comp.savedPercent,
          originalSizeText: formatFileSize(comp.originalSize),
          compressedSizeText: formatFileSize(comp.compressedSize),
        };
      }
    } else if (lowerName.endsWith(".pptx")) {
      const compPromise = compressPptxBuffer(uint8Array);
      slides = await parsePptxSlides(uint8Array, judul, nomor);
      const comp = await compPromise;
      if (comp.savedPercent > 0) {
        compressionStat = {
          originalSize: comp.originalSize,
          compressedSize: comp.compressedSize,
          savedPercent: comp.savedPercent,
          originalSizeText: formatFileSize(comp.originalSize),
          compressedSizeText: formatFileSize(comp.compressedSize),
        };
      }
    } else {
      return {
        success: false,
        fileName,
        fileSizeText,
        totalSlides: 0,
        message: "Format berkas tidak didukung. Harap unggah berkas PDF (.pdf) atau presentasi PowerPoint (.pptx).",
      };
    }

    if (slides.length === 0) {
      return {
        success: false,
        fileName,
        fileSizeText,
        totalSlides: 0,
        message: "Gagal mendeteksi slide dari berkas. Pastikan berkas memiliki slide teks.",
      };
    }

    return {
      success: true,
      fileName,
      fileSizeText,
      totalSlides: slides.length,
      compressionStat,
      slidesPreview: slides.slice(0, 3).map((s) => ({
        urutan: s.urutan,
        judul: s.judul,
        subjudul: s.subjudul,
      })),
      message: `Berhasil mendeteksi ${slides.length} slide presentasi dari berkas ${fileName}.`,
    };
  } catch (err: any) {
    return {
      success: false,
      fileName: "",
      fileSizeText: "",
      totalSlides: 0,
      message: `Gagal membaca berkas: ${err.message}`,
    };
  }
}

/**
 * Server Action: Unggah Berkas PDF / PPT untuk Modul Materi Baru atau Perbaruan
 * Slidenya otomatis disesuaikan secara dinamis dengan jumlah halaman/slide dari berkas yang diunggah
 */
export async function adminUploadMateriAction(formData: FormData): Promise<{
  success: boolean;
  message: string;
  totalSlides?: number;
  id?: number;
}> {
  try {
    const session = await verifyAdminSession();
    if (!session) {
      return { success: false, message: "Akses ditolak. Silakan login sebagai Admin." };
    }
    const file = formData.get("file") as File | null;
    const judul = (formData.get("judul") as string)?.trim() || "Modul Materi Pembelajaran";
    const ringkasan =
      (formData.get("ringkasan") as string)?.trim() ||
      "Materi edukasi keamanan obat dan makanan disusun oleh BBPOM di Palembang.";
    let durasi = (formData.get("durasi") as string)?.trim() || "";
    const nomorStr = formData.get("nomor") as string;
    const idStr = formData.get("id") as string;
    const existingId = idStr ? parseInt(idStr, 10) : undefined;
    let targetNomor = nomorStr ? parseInt(nomorStr, 10) : 1;
    if (!existingId && (prisma as any).gardaMateri) {
      try {
        const highest = await (prisma as any).gardaMateri.findFirst({
          orderBy: { nomor: "desc" },
        });
        if (highest) {
          targetNomor = Math.max(targetNomor, highest.nomor + 1);
        }
      } catch {}
    }

    let savedPdfUrl = "/documents/materi-edukasi-bbpom.pdf";
    let extractedSlides: Array<{
      urutan: number;
      judul: string;
      subjudul: string;
      poin: string[];
      tips: string;
      badge: string;
    }> = [];

    let compressionNotice = "";

    if (file && file.size > 0) {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const lowerName = file.name.toLowerCase();

      let finalBuffer: Uint8Array = uint8Array;

      if (lowerName.endsWith(".pdf")) {
        const comp = await compressPdfBuffer(uint8Array);
        finalBuffer = comp.buffer;
        if (comp.savedPercent > 0) {
          compressionNotice = ` • Berkas PDF berhasil dikompresi: hemat ${comp.savedPercent}% storage (${formatFileSize(comp.originalSize)} → ${formatFileSize(comp.compressedSize)}).`;
        }
      } else if (lowerName.endsWith(".pptx")) {
        const comp = await compressPptxBuffer(uint8Array);
        finalBuffer = comp.buffer;
        if (comp.savedPercent > 0) {
          compressionNotice = ` • Berkas PPTX berhasil dikompresi: hemat ${comp.savedPercent}% storage (${formatFileSize(comp.originalSize)} → ${formatFileSize(comp.compressedSize)}).`;
        }
      }

      // Simpan berkas terkompresi ke direktori public/uploads/materi
      const fs = await import("fs/promises");
      const path = await import("path");
      const uploadDir = path.resolve(process.cwd(), "public/uploads/materi");
      await fs.mkdir(uploadDir, { recursive: true });

      const sanitizedFilename = `materi-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9\._-]/g, "_")}`;
      const filePath = path.join(uploadDir, sanitizedFilename);
      await fs.writeFile(filePath, Buffer.from(finalBuffer));
      savedPdfUrl = `/uploads/materi/${sanitizedFilename}`;

      if (lowerName.endsWith(".pdf")) {
        try {
          // @ts-ignore
          const worker = await import("pdfjs-dist/legacy/build/pdf.worker.mjs");
          (globalThis as any).pdfjsWorker = worker;
        } catch {}

        const { pathToFileURL } = await import("url");
        const fontsPath =
          pathToFileURL(path.resolve(process.cwd(), "node_modules/pdfjs-dist/standard_fonts/")).href + "/";

        const { PDFParse } = await import("pdf-parse");
        const parser = new PDFParse({ data: uint8Array, standardFontDataUrl: fontsPath });
        const result = await parser.getText();
        const pages = result?.pages || [];
        if (pages.length > 0) {
          extractedSlides = formatPagesToSlides(pages, judul, targetNomor);
        }
      } else if (lowerName.endsWith(".pptx")) {
        extractedSlides = await parsePptxSlides(uint8Array, judul, targetNomor);
      }
    }

    // Jika tidak ada slide yang diekstrak dari file baru (misal saat edit tanpa upload file baru)
    if (extractedSlides.length === 0) {
      if (existingId) {
        const existing = globalFallback.materiList.find((m) => m.id === existingId);
        if (existing && existing.slides && existing.slides.length > 0) {
          extractedSlides = existing.slides;
          savedPdfUrl = existing.pdfUrl || savedPdfUrl;
        }
      }

      if (extractedSlides.length === 0) {
        extractedSlides = [
          {
            urutan: 1,
            judul: `Pengenalan ${judul}`,
            subjudul: "Prinsip Dasar Pembelajaran",
            poin: [
              "Materi ini disusun oleh tim BBPOM di Palembang untuk meningkatkan pemahaman regulasi.",
              "Pelajari setiap bagian dengan teliti untuk mempersiapkan diri menghadapi Post-Test.",
            ],
            tips: "💡 Bacalah materi secara seksama sebelum melanjutkan ke slide berikutnya.",
            badge: `Modul ${targetNomor} • Slide 1/2`,
          },
          {
            urutan: 2,
            judul: "Rangkuman & Pedoman Praktis",
            subjudul: "Kesimpulan & Aplikasi dalam Kehidupan Sehari-hari",
            poin: [
              "Terapkan selalu prinsip keamanan obat dan makanan dalam keluarga dan lingkungan sekitar.",
              "Gunakan portal AMPERA untuk konsultasi atau pelaporan jika ditemukan indikasi pelanggaran.",
            ],
            tips: "🎉 Modul selesai dipelajari!",
            badge: `Modul ${targetNomor} • Slide 2/2`,
          },
        ];
      }
    }

    if (!durasi) {
      const estimatedMinutes = Math.max(3, Math.round(extractedSlides.length * 1.5));
      durasi = `${estimatedMinutes} Menit Belajar`;
    }

    // Simpan ke Prisma Database
    try {
      if ((prisma as any).gardaMateri) {
        if (existingId) {
          if (file && file.size > 0) {
            // Hapus berkas lama jika diganti berkas baru agar tidak menjadi sampah storage
            try {
              const old = await (prisma as any).gardaMateri.findUnique({
                where: { id: existingId },
                select: { pdfUrl: true },
              });
              if (old?.pdfUrl && old.pdfUrl.startsWith("/uploads/materi/") && old.pdfUrl !== savedPdfUrl) {
                const fs = await import("fs/promises");
                const path = await import("path");
                const oldPath = path.resolve(process.cwd(), "public", old.pdfUrl.replace(/^\//, ""));
                await fs.unlink(oldPath);
              }
            } catch {}

            await (prisma as any).gardaSlide.deleteMany({
              where: { materiId: existingId },
            });
          }

          const updated = await (prisma as any).gardaMateri.update({
            where: { id: existingId },
            data: {
              judul,
              ringkasan,
              durasi,
              ...(file && file.size > 0 ? { pdfUrl: savedPdfUrl } : {}),
              ...(file && file.size > 0
                ? {
                    slides: {
                      create: extractedSlides.map((s, idx) => ({
                        urutan: idx + 1,
                        judul: s.judul,
                        subjudul: s.subjudul,
                        poin: JSON.stringify(s.poin),
                        tips: s.tips,
                        badge: s.badge,
                      })),
                    },
                  }
                : {}),
            },
          });

          revalidatePath("/admin/garda-ampera");
          revalidatePath("/garda-ampera");
          return {
            success: true,
            message: `Modul materi berhasil diperbarui (${extractedSlides.length} slide).${compressionNotice}`,
            totalSlides: extractedSlides.length,
            id: updated.id,
          };
        } else {
          const created = await (prisma as any).gardaMateri.create({
            data: {
              nomor: targetNomor,
              judul,
              ringkasan,
              durasi,
              pdfUrl: savedPdfUrl,
              isAktif: true,
              slides: {
                create: extractedSlides.map((s, idx) => ({
                  urutan: idx + 1,
                  judul: s.judul,
                  subjudul: s.subjudul,
                  poin: JSON.stringify(s.poin),
                  tips: s.tips,
                  badge: s.badge,
                })),
              },
            },
          });

          revalidatePath("/admin/garda-ampera");
          revalidatePath("/garda-ampera");
          return {
            success: true,
            message: `Modul materi baru berhasil disimpan (${extractedSlides.length} slide).${compressionNotice}`,
            totalSlides: extractedSlides.length,
            id: created.id,
          };
        }
      }
    } catch (err: any) {
      console.warn("DB materi upload error, saving to fallback:", err.message);
    }

    // Fallback store
    if (existingId) {
      const idx = globalFallback.materiList.findIndex((m) => m.id === existingId);
      if (idx !== -1) {
        globalFallback.materiList[idx] = {
          ...globalFallback.materiList[idx],
          judul,
          ringkasan,
          durasi,
          ...(file && file.size > 0 ? { pdfUrl: savedPdfUrl, slides: extractedSlides } : {}),
        };
      }
    } else {
      const newId = globalFallback.materiList.length + 1;
      globalFallback.materiList.push({
        id: newId,
        nomor: targetNomor,
        judul,
        ringkasan,
        durasi,
        pdfUrl: savedPdfUrl,
        isAktif: true,
        slides: extractedSlides,
      });
    }

    revalidatePath("/admin/garda-ampera");
    revalidatePath("/garda-ampera");
    return {
      success: true,
      message: `Modul materi berhasil disimpan (${extractedSlides.length} slide).${compressionNotice}`,
      totalSlides: extractedSlides.length,
    };
  } catch (err: any) {
    console.error("Gagal menyimpan materi:", err);
    return {
      success: false,
      message: `Gagal memproses berkas modul: ${err.message}`,
    };
  }
}

/**
 * Edit Modul Materi Pembelajaran oleh Admin
 */
export async function adminUpdateMateriAction(payload: {
  id: number;
  judul: string;
  ringkasan: string;
  durasi: string;
  pdfUrl?: string;
}): Promise<{ success: boolean; message: string }> {
  const session = await verifyAdminSession();
  if (!session) {
    return { success: false, message: "Akses ditolak. Silakan login sebagai Admin." };
  }
  try {
    if ((prisma as any).gardaMateri) {
      await (prisma as any).gardaMateri.update({
        where: { id: payload.id },
        data: payload,
      });
      revalidatePath("/admin/garda-ampera");
      return { success: true, message: "Modul materi berhasil diperbarui di database." };
    }
  } catch (err) {
    // fallback
  }

  const idx = globalFallback.materiList.findIndex((m) => m.id === payload.id);
  if (idx !== -1) {
    globalFallback.materiList[idx] = { ...globalFallback.materiList[idx], ...payload };
  }
  revalidatePath("/admin/garda-ampera");
  return { success: true, message: "Modul materi berhasil diperbarui." };
}

/**
 * Tambah Modul Materi Baru oleh Admin
 */
export async function adminCreateMateriAction(payload: {
  nomor?: number;
  judul: string;
  ringkasan: string;
  durasi: string;
  pdfUrl?: string;
  slides?: Array<{
    judul: string;
    subjudul: string;
    poin: string[];
    tips?: string;
    badge?: string;
  }>;
}): Promise<{ success: boolean; message: string; id?: number }> {
  const session = await verifyAdminSession();
  if (!session) {
    return { success: false, message: "Akses ditolak. Silakan login sebagai Admin." };
  }
  try {
    const nextNomor = payload.nomor || globalFallback.materiList.length + 1;

    const defaultSlides = payload.slides && payload.slides.length > 0
      ? payload.slides
      : [
          {
            judul: `Pengenalan ${payload.judul}`,
            subjudul: "Prinsip Dasar Pembelajaran",
            poin: [
              "Materi ini disusun oleh tim BBPOM di Palembang untuk meningkatkan pemahaman regulasi.",
              "Pelajari setiap bagian dengan teliti untuk mempersiapkan diri menghadapi Post-Test.",
            ],
            tips: "💡 Bacalah materi secara seksama sebelum melanjutkan ke slide berikutnya.",
            badge: `Modul ${nextNomor} • Slide 1/2`,
          },
          {
            judul: "Rangkuman & Pedoman Praktis",
            subjudul: "Kesimpulan & Aplikasi dalam Kehidupan Sehari-hari",
            poin: [
              "Terapkan selalu prinsip keamanan obat dan makanan dalam keluarga dan lingkungan sekitar.",
              "Gunakan portal AMPERA untuk konsultasi atau pelaporan jika ditemukan indikasi pelanggaran.",
            ],
            tips: "🎉 Modul selesai dipelajari!",
            badge: `Modul ${nextNomor} • Slide 2/2`,
          },
        ];

    if ((prisma as any).gardaMateri) {
      const created = await (prisma as any).gardaMateri.create({
        data: {
          nomor: nextNomor,
          judul: payload.judul,
          ringkasan: payload.ringkasan,
          durasi: payload.durasi || "7 Menit Belajar",
          pdfUrl: payload.pdfUrl || "/documents/materi-edukasi-bbpom.pdf",
          isAktif: true,
          slides: {
            create: defaultSlides.map((s, idx) => ({
              urutan: idx + 1,
              judul: s.judul,
              subjudul: s.subjudul,
              poin: JSON.stringify(s.poin),
              tips: s.tips || "",
              badge: s.badge || `Modul ${nextNomor} • Slide ${idx + 1}/${defaultSlides.length}`,
            })),
          },
        },
      });

      revalidatePath("/admin/garda-ampera");
      revalidatePath("/garda-ampera");
      return { success: true, message: "Modul materi baru berhasil ditambahkan.", id: created.id };
    }
  } catch (err: any) {
    console.warn("DB create materi failed, using fallback:", err.message);
  }

  // Fallback
  const nextNomor = payload.nomor || globalFallback.materiList.length + 1;
  const newId = globalFallback.materiList.length + 1;

  const defaultSlides = payload.slides && payload.slides.length > 0
    ? payload.slides
    : [
        {
          judul: `Pengenalan ${payload.judul}`,
          subjudul: "Prinsip Dasar Pembelajaran",
          poin: [
            "Materi ini disusun oleh tim BBPOM di Palembang untuk meningkatkan pemahaman regulasi.",
            "Pelajari setiap bagian dengan teliti untuk mempersiapkan diri menghadapi Post-Test.",
          ],
          tips: "💡 Bacalah materi secara seksama sebelum melanjutkan ke slide berikutnya.",
          badge: `Modul ${nextNomor} • Slide 1/2`,
        },
        {
          judul: "Rangkuman & Pedoman Praktis",
          subjudul: "Kesimpulan & Aplikasi dalam Kehidupan Sehari-hari",
          poin: [
            "Terapkan selalu prinsip keamanan obat dan makanan dalam keluarga dan lingkungan sekitar.",
            "Gunakan portal AMPERA untuk konsultasi atau pelaporan jika ditemukan indikasi pelanggaran.",
          ],
          tips: "🎉 Modul selesai dipelajari!",
          badge: `Modul ${nextNomor} • Slide 2/2`,
        },
      ];

  const newMateri = {
    id: newId,
    nomor: nextNomor,
    judul: payload.judul,
    ringkasan: payload.ringkasan,
    durasi: payload.durasi || "7 Menit Belajar",
    pdfUrl: payload.pdfUrl || "/documents/materi-edukasi-bbpom.pdf",
    isAktif: true,
    slides: defaultSlides.map((s, idx) => ({
      id: (newId * 10) + idx + 1,
      urutan: idx + 1,
      judul: s.judul,
      subjudul: s.subjudul,
      poin: JSON.stringify(s.poin),
      tips: s.tips || "",
      badge: s.badge || `Modul ${nextNomor} • Slide ${idx + 1}/${defaultSlides.length}`,
    })),
  };

  globalFallback.materiList.push(newMateri);
  revalidatePath("/admin/garda-ampera");
  revalidatePath("/garda-ampera");
  return { success: true, message: "Modul materi baru berhasil ditambahkan.", id: newId };
}

/**
 * Hapus Modul Materi oleh Admin beserta berkas fisiknya di public/uploads/materi
 */
export async function adminDeleteMateriAction(id: number): Promise<{ success: boolean; message: string }> {
  const session = await verifyAdminSession();
  if (!session) {
    return { success: false, message: "Akses ditolak. Silakan login sebagai Admin." };
  }
  let fileToDelete: string | null = null;

  try {
    if ((prisma as any).gardaMateri) {
      // 1. Ambil URL file PDF sebelum data modul dihapus
      const existing = await (prisma as any).gardaMateri.findUnique({
        where: { id },
        select: { pdfUrl: true },
      });
      if (existing?.pdfUrl) {
        fileToDelete = existing.pdfUrl;
      }

      // 2. Hapus data modul dari database (cascade menghapus slide terkait)
      await (prisma as any).gardaMateri.delete({
        where: { id },
      });
    }
  } catch (err: any) {
    console.warn("DB delete materi failed, using fallback:", err.message);
  }

  // Cek juga di fallback store jika ada
  const fbIdx = globalFallback.materiList.findIndex((m) => m.id === id);
  if (fbIdx !== -1) {
    if (!fileToDelete && globalFallback.materiList[fbIdx].pdfUrl) {
      fileToDelete = globalFallback.materiList[fbIdx].pdfUrl;
    }
    globalFallback.materiList.splice(fbIdx, 1);
  }

  // 3. Hapus berkas fisik dari storage jika berada di direktori /uploads/materi/
  if (fileToDelete && fileToDelete.startsWith("/uploads/materi/")) {
    try {
      // Pastikan tidak ada modul lain yang masih memakai file yang sama
      let isUsedByOthers = false;
      if ((prisma as any).gardaMateri) {
        const otherUsage = await (prisma as any).gardaMateri.findFirst({
          where: { pdfUrl: fileToDelete },
        });
        if (otherUsage) isUsedByOthers = true;
      }

      if (!isUsedByOthers) {
        const fs = await import("fs/promises");
        const path = await import("path");
        const fullPath = path.resolve(process.cwd(), "public", fileToDelete.replace(/^\//, ""));
        await fs.unlink(fullPath);
        console.log(`[Storage] Berkas fisik materi berhasil dihapus: ${fullPath}`);
      }
    } catch (fsErr: any) {
      console.warn("[Storage] Catatan: Gagal menghapus berkas fisik materi:", fsErr.message);
    }
  }

  revalidatePath("/admin/garda-ampera");
  revalidatePath("/garda-ampera");
  return { success: true, message: "Modul materi beserta berkas fisiknya berhasil dihapus." };
}

/**
 * Simpan Banyak Soal Sekaligus (Batch Import)
 */
export async function adminBatchCreateSoalAction(
  soalItems: Array<{
    tipe: "PRE_TEST" | "POST_TEST" | "SEMUA";
    kategori: string;
    pertanyaan: string;
    pilihanA: string;
    pilihanB: string;
    pilihanC: string;
    pilihanD: string;
    jawabanBenar: string;
    penjelasan?: string;
  }>
): Promise<{ success: boolean; count: number; message: string }> {
  const session = await verifyAdminSession();
  if (!session) {
    return { success: false, count: 0, message: "Akses ditolak. Silakan login sebagai Admin." };
  }
  if (!soalItems || soalItems.length === 0) {
    return { success: false, count: 0, message: "Tidak ada butir soal yang valid untuk disimpan." };
  }

  try {
    if ((prisma as any).gardaSoal) {
      let createdCount = 0;
      for (const item of soalItems) {
        await (prisma as any).gardaSoal.create({
          data: {
            ...item,
            urutan: 0,
            isAktif: true,
          },
        });
        createdCount++;
      }
      revalidatePath("/admin/garda-ampera");
      revalidatePath("/garda-ampera");
      return {
        success: true,
        count: createdCount,
        message: `${createdCount} butir soal berhasil diimpor dan disimpan ke database.`,
      };
    }
  } catch (err: any) {
    console.warn("Batch create DB failed, saving to fallback:", err.message);
  }

  // Fallback
  let nextId = globalFallback.soalList.length + 1;
  soalItems.forEach((item) => {
    globalFallback.soalList.push({
      ...item,
      id: nextId++,
      urutan: globalFallback.soalList.length + 1,
      isAktif: true,
    });
  });

  revalidatePath("/admin/garda-ampera");
  revalidatePath("/garda-ampera");
  return {
    success: true,
    count: soalItems.length,
    message: `${soalItems.length} butir soal berhasil diimpor ke bank soal.`,
  };
}

/**
 * Server Action: Helper Parser Soal dari Teks Bebas / Ekstraksi PDF (Async wrapper)
 */
export async function parseTextQuestionsAction(
  rawText: string,
  tipe: "PRE_TEST" | "POST_TEST" | "SEMUA" = "SEMUA",
  defaultCategory: string = "Regulasi Obat & Makanan"
) {
  return parseQuestionsFromRawText(rawText, tipe, defaultCategory);
}

/**
 * Server Action: Ekstraksi Soal dari Berkas PDF yang Diupload
 */
export async function parsePdfQuestionsAction(formData: FormData): Promise<{
  success: boolean;
  questions: Array<any>;
  rawTextPreview?: string;
  message?: string;
}> {
  try {
    const file = formData.get("file") as File;
    const tipe = (formData.get("tipe") as "PRE_TEST" | "POST_TEST" | "SEMUA") || "SEMUA";
    const kategori = (formData.get("kategori") as string) || "Regulasi Obat & Makanan";

    if (!file) {
      return { success: false, questions: [], message: "Tidak ada berkas yang diunggah." };
    }

    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Setup worker pdfjs-dist untuk lingkungan server runtime Next.js (Turbopack)
    try {
      // @ts-ignore
      const worker = await import("pdfjs-dist/legacy/build/pdf.worker.mjs");
      (globalThis as any).pdfjsWorker = worker;
    } catch {
      try {
        const path = await import("path");
        const { pathToFileURL } = await import("url");
        const workerPath = pathToFileURL(
          path.resolve(process.cwd(), "node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs")
        ).href;
        const { PDFParse } = await import("pdf-parse");
        PDFParse.setWorker(workerPath);
      } catch (errWorker) {
        console.warn("Could not set custom PDF worker path:", errWorker);
      }
    }

    // Gunakan library PDFParse untuk mengekstraksi teks
    const path = await import("path");
    const { pathToFileURL } = await import("url");
    const fontsPath =
      pathToFileURL(path.resolve(process.cwd(), "node_modules/pdfjs-dist/standard_fonts/")).href + "/";

    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({
      data: uint8Array,
      standardFontDataUrl: fontsPath,
    });
    const result = await parser.getText();
    const rawText = result?.text || "";

    if (!rawText.trim()) {
      return {
        success: false,
        questions: [],
        message: "Gagal membaca teks dari PDF. Pastikan berkas PDF bukan hasil scan gambar.",
      };
    }

    const questions = parseQuestionsFromRawText(rawText, tipe, kategori);

    return {
      success: true,
      questions,
      rawTextPreview: rawText.substring(0, 500),
      message: `Berhasil mendeteksi ${questions.length} butir soal dari berkas PDF.`,
    };
  } catch (err: any) {
    console.error("Gagal memproses berkas PDF:", err);
    return {
      success: false,
      questions: [],
      message: `Gagal memproses berkas PDF: ${err.message}`,
    };
  }
}

// =========================================================================
// 8. AUTOSYNC & LOOKUP DATA TAMU BERDASARKAN NIK
// =========================================================================

export interface GardaTamuLookupResult {
  found: boolean;
  source?: "tamu" | "garda" | "buku_tamu";
  message: string;
  alreadyCompleted?: boolean;
  existingCertificate?: {
    nomorSertifikat: string;
    tanggalLulus: string;
    postTestScore: number;
    biodata: BiodataGarda;
  };
  data?: {
    nik: string;
    nama: string;
    telepon?: string;
    alamat?: string;
    instansi?: string;
    usia?: string;
    jenisKelamin?: string;
    pendidikan?: string;
    pekerjaan?: string;
    email?: string;
  };
}

export async function lookupGardaTamuByNikAction(
  nikInput: string
): Promise<GardaTamuLookupResult> {
  const cleanNik = (nikInput || "").trim().replace(/\D/g, "");

  if (!cleanNik || cleanNik.length < 8) {
    return {
      found: false,
      message: "Nomor NIK harus minimal 8 - 16 digit angka.",
    };
  }

  try {
    const resultData: NonNullable<GardaTamuLookupResult["data"]> = {
      nik: cleanNik,
      nama: "",
      alamat: "",
      instansi: "",
      usia: "",
      jenisKelamin: "",
      pendidikan: "",
      pekerjaan: "",
      telepon: "",
      email: "",
    };
    let found = false;
    let source: "tamu" | "garda" | "buku_tamu" = "tamu";
    let alreadyCompleted = false;
    let existingCertificate: GardaTamuLookupResult["existingCertificate"] = undefined;

    // 1. Cek tabel Tamu di database PostgreSQL Ampera-BBPOM
    if ((prisma as any).tamu) {
      try {
        const tamu = await (prisma as any).tamu.findUnique({
          where: { nik: cleanNik },
        });

        if (tamu) {
          found = true;
          source = "tamu";
          resultData.nama = tamu.nama || "";
          resultData.alamat = tamu.alamat || "";
          resultData.instansi = tamu.asalInstansi || "";
          resultData.usia = tamu.umur ? String(tamu.umur) : "";
          resultData.telepon = tamu.telepon || "";
          resultData.email = tamu.email || "";
        }
      } catch (err) {
        console.warn("Gagal lookup tabel tamu:", err);
      }
    }

    // 2. Cek tabel GardaPeserta (jika pernah ikut Garda sebelumnya)
    if ((prisma as any).gardaPeserta) {
      try {
        const prevPeserta = await (prisma as any).gardaPeserta.findFirst({
          where: { nik: cleanNik },
          orderBy: { createdAt: "desc" },
        });

        if (prevPeserta) {
          found = true;
          resultData.nama = prevPeserta.nama || resultData.nama;
          resultData.alamat = prevPeserta.alamat || resultData.alamat;
          resultData.instansi = prevPeserta.instansi || resultData.instansi;
          if (prevPeserta.usia) resultData.usia = String(prevPeserta.usia);
          if (prevPeserta.jenisKelamin) resultData.jenisKelamin = prevPeserta.jenisKelamin;
          if (prevPeserta.pendidikan) resultData.pendidikan = prevPeserta.pendidikan;
          if (prevPeserta.pekerjaan) resultData.pekerjaan = prevPeserta.pekerjaan;
          source = "garda";

          if (prevPeserta.isLulus) {
            alreadyCompleted = true;
            const tglLulusDate = prevPeserta.tanggalLulus
              ? new Date(prevPeserta.tanggalLulus)
              : new Date(prevPeserta.createdAt || Date.now());
            const validJk: "" | "Laki-laki" | "Perempuan" =
              prevPeserta.jenisKelamin === "Laki-laki" || prevPeserta.jenisKelamin === "Perempuan"
                ? prevPeserta.jenisKelamin
                : "Laki-laki";

            existingCertificate = {
              nomorSertifikat:
                prevPeserta.nomorSertifikat ||
                formatNomorSertifikatGarda(prevPeserta.id || 1, tglLulusDate),
              tanggalLulus: tglLulusDate.toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              }),
              postTestScore: prevPeserta.postTestScore ?? 80,
              biodata: {
                nik: cleanNik,
                nama: prevPeserta.nama || "",
                tanggalTes: new Date(prevPeserta.tanggalTes || Date.now())
                  .toISOString()
                  .split("T")[0],
                alamat: prevPeserta.alamat || "",
                usia: String(prevPeserta.usia || "25"),
                jenisKelamin: validJk,
                pendidikan: prevPeserta.pendidikan || "",
                pekerjaan: prevPeserta.pekerjaan || "",
                instansi: prevPeserta.instansi || "",
              },
            };
          }
        }
      } catch (err) {
        console.warn("Gagal lookup tabel gardaPeserta:", err);
      }
    }

    // Cek juga fallback memory store jika DB belum menemukan kelulusan
    if (!alreadyCompleted) {
      const fbPrev = globalFallback.pesertaList.find(
        (p) => p.nik === cleanNik && p.isLulus
      );
      if (fbPrev) {
        found = true;
        alreadyCompleted = true;
        source = "garda";
        resultData.nama = fbPrev.nama || resultData.nama;
        const tglLulusDate = fbPrev.tanggalLulus ? new Date(fbPrev.tanggalLulus) : new Date();
        existingCertificate = {
          nomorSertifikat: fbPrev.nomorSertifikat || formatNomorSertifikatGarda(1, tglLulusDate),
          tanggalLulus: tglLulusDate.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          }),
          postTestScore: fbPrev.postTestScore ?? 80,
          biodata: {
            nik: cleanNik,
            nama: fbPrev.nama || "",
            tanggalTes: new Date(fbPrev.tanggalTes || Date.now()).toISOString().split("T")[0],
            alamat: fbPrev.alamat || "",
            usia: String(fbPrev.usia || "25"),
            jenisKelamin: fbPrev.jenisKelamin === "Perempuan" ? "Perempuan" : "Laki-laki",
            pendidikan: fbPrev.pendidikan || "",
            pekerjaan: fbPrev.pekerjaan || "",
            instansi: fbPrev.instansi || "",
          },
        };
      }
    }

    // 3. Fallback / Cross-system: Cek API Buku Tamu BBPOM
    if (!resultData.nama || !resultData.alamat) {
      try {
        const { lookupTamuFromBukuTamu } = await import("@/lib/services/bukuTamuBridge");
        const tamuBuku = await lookupTamuFromBukuTamu(cleanNik);
        if (tamuBuku) {
          found = true;
          source = "buku_tamu";
          if (!resultData.nama) resultData.nama = tamuBuku.nama;
          if (!resultData.alamat) resultData.alamat = tamuBuku.alamat;
          if (!resultData.telepon) resultData.telepon = tamuBuku.telepon;
          if (!resultData.usia && tamuBuku.umur) resultData.usia = String(tamuBuku.umur);
          if (!resultData.jenisKelamin && tamuBuku.jenisKelamin) resultData.jenisKelamin = tamuBuku.jenisKelamin;
          if (!resultData.pendidikan && tamuBuku.pendidikan) resultData.pendidikan = tamuBuku.pendidikan;
          if (!resultData.pekerjaan && tamuBuku.pekerjaan) resultData.pekerjaan = tamuBuku.pekerjaan;
        }
      } catch {}
    }

    if (found && resultData.nama) {
      return {
        found: true,
        source,
        alreadyCompleted,
        existingCertificate,
        message: alreadyCompleted
          ? `NIK ${cleanNik} atas nama '${resultData.nama}' tercatat sudah menyelesaikan Garda Ampera dan memiliki Sertifikat.`
          : `Data tamu terdaftar atas nama '${resultData.nama}'. Formulir telah diisi otomatis.`,
        data: resultData,
      };
    }

    return {
      found: false,
      message: "Data NIK belum tercatat di Buku Tamu. Silakan lengkapi data mandiri.",
    };
  } catch (err: any) {
    console.error("Error lookupGardaTamuByNikAction:", err);
    return {
      found: false,
      message: "Gagal memeriksa NIK.",
    };
  }
}

// =========================================================================
// 6. DASHBOARD ANALYTICS (UNTUK GRAFIK DEMOGRAFI & TREN PESERTA GARDA AMPERA)
// =========================================================================

export interface GardaDashboardFilterInput {
  pekerjaan?: string;
  pendidikan?: string;
  jenisKelamin?: string;
  rentangUmur?: string; // "ALL" | "<20" | "20-29" | "30-39" | "40-49" | ">=50"
  bulan?: string; // "ALL" | "1".."12"
  tahun?: string; // "ALL" | "2026", dll
  secondaryBulan?: string;
  secondaryTahun?: string;
  secondaryTanggal?: string;
}

export interface GardaTimeSeriesItem {
  monthIndex: number; // 0..11
  monthLabel: string; // "Jan", "Feb", ... "Des"
  fullMonthName: string;
  count: number;
}

export interface GardaStatBarItem {
  label: string;
  count: number;
  percentage: number;
  color: string;
}

export interface GardaDashboardAnalyticsData {
  timeSeries: GardaTimeSeriesItem[];
  totalFilteredPeserta: number;
  totalAllPeserta: number;
  pekerjaanStats: GardaStatBarItem[];
  genderStats: {
    lakiLaki: number;
    perempuan: number;
    total: number;
    persenLaki: number;
    persenPerempuan: number;
  };
  pendidikanStats: GardaStatBarItem[];
  options: {
    pekerjaanList: string[];
    pendidikanList: string[];
    tahunList: string[];
  };
}

const PEKERJAAN_PALETTE: Record<string, string> = {
  "Pegawai Negeri Sipil / ASN": "#3b82f6",
  "Aparatur Sipil Negara (ASN / PNS / PPPK)": "#3b82f6",
  "Pegawai Swasta": "#10b981",
  "Karyawan Swasta / BUMN": "#10b981",
  "Wiraswasta / Usahawan": "#8b5cf6",
  "Wiraswasta / Pelaku Usaha UMKM": "#8b5cf6",
  "Mahasiswa / Pelajar": "#f97316",
  "Tenaga Kesehatan": "#06b6d4",
  "Lainnya": "#64748b",
};

const PENDIDIKAN_PALETTE: Record<string, string> = {
  "SMA / SMK Sederajat": "#2563eb",
  "SMA/SMK": "#2563eb",
  "Diploma (D3 / D4)": "#10b981",
  "D3": "#10b981",
  "Sarjana (S1)": "#8b5cf6",
  "S1": "#8b5cf6",
  "Magister (S2)": "#f97316",
  "S2": "#f97316",
  "Doktor (S3)": "#e11d48",
  "S3": "#e11d48",
};

// Data sample peserta pelengkap jika data database masih baru/sedikit
const SAMPLE_DEMO_PESERTA = [
  { nik: "1671010101900001", nama: "Ahmad Fauzi", jenisKelamin: "Laki-laki", usia: 29, pekerjaan: "Pegawai Swasta", pendidikan: "S1", createdAt: "2026-10-05T08:00:00Z" },
  { nik: "1671010101900002", nama: "Bambang Kurnia", jenisKelamin: "Laki-laki", usia: 34, pekerjaan: "Pegawai Swasta", pendidikan: "S1", createdAt: "2026-10-06T09:30:00Z" },
  { nik: "1671010101900003", nama: "Citra Lestari", jenisKelamin: "Perempuan", usia: 27, pekerjaan: "Pegawai Swasta", pendidikan: "S1", createdAt: "2026-10-08T10:15:00Z" },
  { nik: "1671010101900004", nama: "Dedi Prasetyo", jenisKelamin: "Laki-laki", usia: 31, pekerjaan: "Pegawai Swasta", pendidikan: "S1", createdAt: "2026-10-10T11:00:00Z" },
  { nik: "1671010101900005", nama: "Eko Pratama", jenisKelamin: "Laki-laki", usia: 26, pekerjaan: "Pegawai Swasta", pendidikan: "SMA/SMK", createdAt: "2026-10-11T13:20:00Z" },
  { nik: "1671010101900006", nama: "Fajar Nugraha", jenisKelamin: "Laki-laki", usia: 28, pekerjaan: "Pegawai Swasta", pendidikan: "SMA/SMK", createdAt: "2026-10-12T14:10:00Z" },
  { nik: "1671010101900007", nama: "Gilang Ramadhan", jenisKelamin: "Laki-laki", usia: 33, pekerjaan: "Pegawai Swasta", pendidikan: "D3", createdAt: "2026-10-14T09:40:00Z" },
  { nik: "1671010101900008", nama: "Hendra Wijaya", jenisKelamin: "Laki-laki", usia: 38, pekerjaan: "Pegawai Swasta", pendidikan: "S1", createdAt: "2026-10-15T15:00:00Z" },
  { nik: "1671010101900009", nama: "Indah Permata", jenisKelamin: "Perempuan", usia: 25, pekerjaan: "Pegawai Swasta", pendidikan: "S1", createdAt: "2026-10-16T10:00:00Z" },
  { nik: "1671010101900010", nama: "Joko Susilo", jenisKelamin: "Laki-laki", usia: 42, pekerjaan: "Pegawai Swasta", pendidikan: "SMA/SMK", createdAt: "2026-10-17T11:45:00Z" },
  { nik: "1671010101900011", nama: "Kurniawan", jenisKelamin: "Laki-laki", usia: 30, pekerjaan: "Pegawai Swasta", pendidikan: "SMA/SMK", createdAt: "2026-10-18T13:30:00Z" },
  { nik: "1671010101900012", nama: "Lukman Hakim", jenisKelamin: "Laki-laki", usia: 39, pekerjaan: "Wiraswasta / Usahawan", pendidikan: "S1", createdAt: "2026-10-19T08:30:00Z" },
  { nik: "1671010101900013", nama: "Maya Safitri", jenisKelamin: "Perempuan", usia: 32, pekerjaan: "Wiraswasta / Usahawan", pendidikan: "SMA/SMK", createdAt: "2026-10-20T10:15:00Z" },
  { nik: "1671010101900014", nama: "Nugroho", jenisKelamin: "Laki-laki", usia: 45, pekerjaan: "Wiraswasta / Usahawan", pendidikan: "S1", createdAt: "2026-10-21T14:20:00Z" },
  { nik: "1671010101900015", nama: "Oki Setiawan", jenisKelamin: "Laki-laki", usia: 36, pekerjaan: "Wiraswasta / Usahawan", pendidikan: "D3", createdAt: "2026-10-22T09:50:00Z" },
  { nik: "1671010101900016", nama: "Putri Anggraini", jenisKelamin: "Perempuan", usia: 28, pekerjaan: "Wiraswasta / Usahawan", pendidikan: "S2", createdAt: "2026-10-23T11:10:00Z" },
  { nik: "1671010101900017", nama: "Rahmat Hidayat", jenisKelamin: "Laki-laki", usia: 41, pekerjaan: "Pegawai Negeri Sipil / ASN", pendidikan: "S1", createdAt: "2026-10-24T08:45:00Z" },
  { nik: "1671010101900018", nama: "Surya Dharma", jenisKelamin: "Laki-laki", usia: 48, pekerjaan: "Pegawai Negeri Sipil / ASN", pendidikan: "S2", createdAt: "2026-10-25T13:15:00Z" },
  { nik: "1671010101900019", nama: "Tia Agustina", jenisKelamin: "Perempuan", usia: 22, pekerjaan: "Mahasiswa / Pelajar", pendidikan: "SMA/SMK", createdAt: "2026-10-26T15:30:00Z" },
];

/**
 * Server Action: Mengambil data analitik dan statistik demografi Garda Ampera
 */
export async function getAdminGardaDashboardAnalyticsAction(
  filter: GardaDashboardFilterInput = {}
): Promise<GardaDashboardAnalyticsData> {
  const session = await verifyAdminSession();
  if (!session) {
    return {
      timeSeries: [],
      totalFilteredPeserta: 0,
      totalAllPeserta: 0,
      pekerjaanStats: [],
      genderStats: { lakiLaki: 0, perempuan: 0, total: 0, persenLaki: 0, persenPerempuan: 0 },
      pendidikanStats: [],
      options: { pekerjaanList: [], pendidikanList: [], tahunList: [] },
    };
  }
  const MONTH_NAMES = [
    { label: "Jan", fullName: "Januari" },
    { label: "Feb", fullName: "Februari" },
    { label: "Mar", fullName: "Maret" },
    { label: "Apr", fullName: "April" },
    { label: "Mei", fullName: "Mei" },
    { label: "Jun", fullName: "Juni" },
    { label: "Jul", fullName: "Juli" },
    { label: "Agu", fullName: "Agustus" },
    { label: "Sep", fullName: "September" },
    { label: "Okt", fullName: "Oktober" },
    { label: "Nov", fullName: "November" },
    { label: "Des", fullName: "Desember" },
  ];

  let rawList: any[] = [];

  try {
    if ((prisma as any).gardaPeserta) {
      const dbPeserta = await (prisma as any).gardaPeserta.findMany({
        orderBy: { createdAt: "desc" },
      });
      if (Array.isArray(dbPeserta)) {
        rawList = dbPeserta.map((p: any) => ({
          ...p,
          createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : p.createdAt,
        }));
      }
    }
  } catch (err: any) {
    console.warn("DB query error in getAdminGardaDashboardAnalyticsAction:", err.message);
  }

  // Gunakan fallback in-memory jika database kosong/offline dan fallback terisi
  if (rawList.length === 0 && globalFallback.pesertaList.length > 0) {
    rawList = globalFallback.pesertaList;
  }

  const totalAllPeserta = rawList.length;

  // Normalizer Helper
  const normalizePekerjaan = (str?: string): string => {
    if (!str) return "Lainnya";
    const s = str.toLowerCase();
    if (s.includes("pns") || s.includes("asn") || s.includes("sipil") || s.includes("pppk")) {
      return "Pegawai Negeri Sipil / ASN";
    }
    if (s.includes("swasta") || s.includes("bumn") || s.includes("karyawan")) {
      return "Pegawai Swasta";
    }
    if (s.includes("wira") || s.includes("usaha") || s.includes("pedagang") || s.includes("bisnis")) {
      return "Wiraswasta / Usahawan";
    }
    if (s.includes("mahasiswa") || s.includes("pelajar") || s.includes("siswa")) {
      return "Mahasiswa / Pelajar";
    }
    if (s.includes("medis") || s.includes("dokter") || s.includes("perawat") || s.includes("apoteker") || s.includes("kesehatan")) {
      return "Tenaga Medis / Kesehatan";
    }
    return "Lainnya";
  };

  const normalizePendidikan = (str?: string): string => {
    if (!str) return "SMA/SMK";
    const s = str.toUpperCase();
    if (s.includes("S3") || s.includes("DOKTOR")) return "S3";
    if (s.includes("S2") || s.includes("MAGISTER")) return "S2";
    if (s.includes("S1") || s.includes("SARJANA")) return "S1";
    if (s.includes("D3") || s.includes("DIPLOMA")) return "D3";
    if (s.includes("SMA") || s.includes("SMK") || s.includes("SLTA")) return "SMA/SMK";
    return "SMA/SMK";
  };

  const normalizeGender = (str?: string): "Laki-laki" | "Perempuan" => {
    if (!str) return "Laki-laki";
    const s = str.toLowerCase();
    if (s.startsWith("p") || s.includes("perempuan") || s.includes("wanita")) return "Perempuan";
    return "Laki-laki";
  };

  // 1. FILTER UNTUK GRAFIK UTAMA (Jumlah Peserta per Waktu)
  const filteredForTimeSeries = rawList.filter((item) => {
    const itemDate = new Date(item.createdAt || item.tanggalTes || Date.now());
    const itemYear = itemDate.getFullYear().toString();
    const itemMonth = (itemDate.getMonth() + 1).toString();
    const itemAge = Number(item.usia) || 25;
    const itemGender = normalizeGender(item.jenisKelamin);
    const itemJob = normalizePekerjaan(item.pekerjaan);
    const itemEdu = normalizePendidikan(item.pendidikan);

    // Filter Pekerjaan
    if (filter.pekerjaan && filter.pekerjaan !== "ALL" && filter.pekerjaan !== "Semua Pekerjaan") {
      if (itemJob !== normalizePekerjaan(filter.pekerjaan)) return false;
    }

    // Filter Pendidikan
    if (filter.pendidikan && filter.pendidikan !== "ALL" && filter.pendidikan !== "Semua Pendidikan") {
      if (itemEdu !== normalizePendidikan(filter.pendidikan)) return false;
    }

    // Filter Jenis Kelamin
    if (filter.jenisKelamin && filter.jenisKelamin !== "ALL" && filter.jenisKelamin !== "Semua Jenis Kelamin") {
      if (itemGender !== normalizeGender(filter.jenisKelamin)) return false;
    }

    // Filter Rentang Umur
    if (filter.rentangUmur && filter.rentangUmur !== "ALL" && filter.rentangUmur !== "Semua Umur") {
      if (filter.rentangUmur === "<20" && itemAge >= 20) return false;
      if (filter.rentangUmur === "20-29" && (itemAge < 20 || itemAge > 29)) return false;
      if (filter.rentangUmur === "30-39" && (itemAge < 30 || itemAge > 39)) return false;
      if (filter.rentangUmur === "40-49" && (itemAge < 40 || itemAge > 49)) return false;
      if (filter.rentangUmur === ">=50" && itemAge < 50) return false;
    }

    // Filter Tahun
    if (filter.tahun && filter.tahun !== "ALL" && filter.tahun !== "Semua Tahun") {
      if (itemYear !== filter.tahun) return false;
    }

    // Filter Bulan (untuk grafik utama jika dipilih bulan spesifik)
    if (filter.bulan && filter.bulan !== "ALL" && filter.bulan !== "Semua Bulan") {
      if (itemMonth !== filter.bulan) return false;
    }

    return true;
  });

  const totalFilteredPeserta = filteredForTimeSeries.length;

  // Agregasi 12 Bulan untuk grafik utama
  const timeSeries: GardaTimeSeriesItem[] = MONTH_NAMES.map((m, idx) => ({
    monthIndex: idx,
    monthLabel: m.label,
    fullMonthName: m.fullName,
    count: 0,
  }));

  filteredForTimeSeries.forEach((item) => {
    const itemDate = new Date(item.createdAt || item.tanggalTes || Date.now());
    const mIdx = itemDate.getMonth();
    if (mIdx >= 0 && mIdx < 12) {
      timeSeries[mIdx].count += 1;
    }
  });

  // 2. FILTER UNTUK 3 GRAFIK DEMOGRAFI (Filter Grafik Lainnya)
  const filteredForDemographics = rawList.filter((item) => {
    const itemDate = new Date(item.createdAt || item.tanggalTes || Date.now());
    const itemYear = itemDate.getFullYear().toString();
    const itemMonth = (itemDate.getMonth() + 1).toString();
    const itemDateStr = itemDate.toISOString().split("T")[0];

    // Filter Tahun
    if (filter.secondaryTahun && filter.secondaryTahun !== "ALL" && filter.secondaryTahun !== "Semua Tahun") {
      if (itemYear !== filter.secondaryTahun) return false;
    }

    // Filter Bulan
    if (filter.secondaryBulan && filter.secondaryBulan !== "ALL" && filter.secondaryBulan !== "Semua Bulan") {
      if (itemMonth !== filter.secondaryBulan) return false;
    }

    // Filter Tanggal Spesifik
    if (filter.secondaryTanggal && filter.secondaryTanggal !== "ALL" && filter.secondaryTanggal !== "Semua Tanggal") {
      if (itemDateStr !== filter.secondaryTanggal) return false;
    }

    return true;
  });

  const actualDemoCount = filteredForDemographics.length;
  const demoTotal = actualDemoCount > 0 ? actualDemoCount : 1;

  // Demografi 1: Pekerjaan (Horizontal Bar)
  const jobCountMap: Record<string, number> = {
    "Pegawai Negeri Sipil / ASN": 0,
    "Pegawai Swasta": 0,
    "Wiraswasta / Usahawan": 0,
    "Mahasiswa / Pelajar": 0,
  };

  filteredForDemographics.forEach((item) => {
    const j = normalizePekerjaan(item.pekerjaan);
    jobCountMap[j] = (jobCountMap[j] || 0) + 1;
  });

  const pekerjaanStats: GardaStatBarItem[] = [
    {
      label: "Pegawai Negeri Sipil / ASN",
      count: jobCountMap["Pegawai Negeri Sipil / ASN"] || 0,
      percentage: actualDemoCount > 0 ? Math.round(((jobCountMap["Pegawai Negeri Sipil / ASN"] || 0) / actualDemoCount) * 100) : 0,
      color: "#3b82f6",
    },
    {
      label: "Pegawai Swasta",
      count: jobCountMap["Pegawai Swasta"] || 0,
      percentage: actualDemoCount > 0 ? Math.round(((jobCountMap["Pegawai Swasta"] || 0) / actualDemoCount) * 100) : 0,
      color: "#10b981",
    },
    {
      label: "Wiraswasta / Usahawan",
      count: jobCountMap["Wiraswasta / Usahawan"] || 0,
      percentage: actualDemoCount > 0 ? Math.round(((jobCountMap["Wiraswasta / Usahawan"] || 0) / actualDemoCount) * 100) : 0,
      color: "#8b5cf6",
    },
    {
      label: "Mahasiswa / Pelajar",
      count: jobCountMap["Mahasiswa / Pelajar"] || 0,
      percentage: actualDemoCount > 0 ? Math.round(((jobCountMap["Mahasiswa / Pelajar"] || 0) / actualDemoCount) * 100) : 0,
      color: "#f97316",
    },
  ];

  // Demografi 2: Jenis Kelamin (Donut Chart)
  let lakiCount = 0;
  let perempuanCount = 0;

  filteredForDemographics.forEach((item) => {
    const g = normalizeGender(item.jenisKelamin);
    if (g === "Perempuan") perempuanCount++;
    else lakiCount++;
  });

  const genderTotal = lakiCount + perempuanCount;
  const persenLaki = genderTotal > 0 ? Math.round((lakiCount / genderTotal) * 100) : 0;
  const persenPerempuan = genderTotal > 0 ? 100 - persenLaki : 0;

  const genderStats = {
    lakiLaki: lakiCount,
    perempuan: perempuanCount,
    total: genderTotal,
    persenLaki,
    persenPerempuan,
  };

  // Demografi 3: Pendidikan Terakhir (Pie Chart)
  const eduCountMap: Record<string, number> = {
    "SMA/SMK": 0,
    "D3": 0,
    "S1": 0,
    "S2": 0,
  };

  filteredForDemographics.forEach((item) => {
    const e = normalizePendidikan(item.pendidikan);
    eduCountMap[e] = (eduCountMap[e] || 0) + 1;
  });

  const pendidikanStats: GardaStatBarItem[] = [
    {
      label: "SMA/SMK",
      count: eduCountMap["SMA/SMK"] || 0,
      percentage: actualDemoCount > 0 ? Math.round(((eduCountMap["SMA/SMK"] || 0) / actualDemoCount) * 100) : 0,
      color: "#2563eb",
    },
    {
      label: "D3",
      count: eduCountMap["D3"] || 0,
      percentage: actualDemoCount > 0 ? Math.round(((eduCountMap["D3"] || 0) / actualDemoCount) * 100) : 0,
      color: "#10b981",
    },
    {
      label: "S1",
      count: eduCountMap["S1"] || 0,
      percentage: actualDemoCount > 0 ? Math.round(((eduCountMap["S1"] || 0) / actualDemoCount) * 100) : 0,
      color: "#8b5cf6",
    },
    {
      label: "S2",
      count: eduCountMap["S2"] || 0,
      percentage: actualDemoCount > 0 ? Math.round(((eduCountMap["S2"] || 0) / actualDemoCount) * 100) : 0,
      color: "#f97316",
    },
  ];

  // Options untuk Filter
  const currentYear = new Date().getFullYear().toString();
  const tahunSet = new Set<string>([currentYear, "2025"]);
  rawList.forEach((item) => {
    if (item.createdAt) {
      tahunSet.add(new Date(item.createdAt).getFullYear().toString());
    }
  });

  return {
    timeSeries,
    totalFilteredPeserta,
    totalAllPeserta,
    pekerjaanStats,
    genderStats,
    pendidikanStats,
    options: {
      pekerjaanList: [
        "Pegawai Negeri Sipil / ASN",
        "Pegawai Swasta",
        "Wiraswasta / Usahawan",
        "Mahasiswa / Pelajar",
      ],
      pendidikanList: ["SMA/SMK", "D3", "S1", "S2"],
      tahunList: Array.from(tahunSet).sort((a, b) => b.localeCompare(a)),
    },
  };
}

// =========================================================================
// 4. HASIL EVALUASI PESERTA GARDA AMPERA
// =========================================================================

export interface GardaEvaluasiRecord {
  id: number;
  pesertaId: number;
  nama: string;
  nik: string;
  instansi: string;
  pekerjaan: string;
  usia: number;
  jenisKelamin: string;
  tanggalTes: string | Date;
  ratingKemudahan: number;
  ratingMateri: number;
  ratingSoal: number;
  ratingManfaat: number;
  rataRata: number;
  kritikSaran: string | null;
  createdAt: string | Date;
}

export interface GardaEvaluasiSummaryStats {
  totalResponden: number;
  rataRataKeseluruhan: number;
  rataRataKemudahan: number;
  rataRataMateri: number;
  rataRataSoal: number;
  rataRataManfaat: number;
  persentaseSangatPuas: number;
  persentasePuas: number;
  distribusiBintang: {
    bintang5: number;
    bintang4: number;
    bintang3: number;
    bintang2: number;
    bintang1: number;
  };
}

export async function getAdminGardaEvaluasiAction(): Promise<{
  evaluasiList: GardaEvaluasiRecord[];
  stats: GardaEvaluasiSummaryStats;
}> {
  const session = await verifyAdminSession();
  if (!session) {
    return {
      evaluasiList: [],
      stats: {
        totalResponden: 0,
        rataRataKeseluruhan: 0,
        rataRataKemudahan: 0,
        rataRataMateri: 0,
        rataRataSoal: 0,
        rataRataManfaat: 0,
        persentaseSangatPuas: 0,
        persentasePuas: 0,
        distribusiBintang: { bintang5: 0, bintang4: 0, bintang3: 0, bintang2: 0, bintang1: 0 },
      },
    };
  }
  let records: GardaEvaluasiRecord[] = [];

  try {
    if ((prisma as any).gardaEvaluasi) {
      const dbData = await (prisma as any).gardaEvaluasi.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          peserta: true,
        },
      });

      if (dbData && dbData.length > 0) {
        records = dbData.map((e: any) => {
          const avg =
            (e.ratingKemudahan + e.ratingMateri + e.ratingSoal + e.ratingManfaat) / 4;
          return {
            id: e.id,
            pesertaId: e.pesertaId,
            nama: e.peserta?.nama || "Anonim",
            nik: e.peserta?.nik || "-",
            instansi: e.peserta?.instansi || "-",
            pekerjaan: e.peserta?.pekerjaan || "-",
            usia: e.peserta?.usia || 0,
            jenisKelamin: e.peserta?.jenisKelamin || "-",
            tanggalTes: e.peserta?.tanggalTes || e.createdAt,
            ratingKemudahan: e.ratingKemudahan,
            ratingMateri: e.ratingMateri,
            ratingSoal: e.ratingSoal,
            ratingManfaat: e.ratingManfaat,
            rataRata: parseFloat(avg.toFixed(1)),
            kritikSaran: e.kritikSaran,
            createdAt: e.createdAt,
          };
        });
      }
    }
  } catch (err: any) {
    console.warn("DB query error in getAdminGardaEvaluasiAction:", err.message);
  }

  // Fallback to in-memory store if DB has no records or failed
  if (records.length === 0 && globalFallback.pesertaList.length > 0) {
    globalFallback.pesertaList.forEach((p) => {
      if (p.evaluasi) {
        const avg =
          (p.evaluasi.ratingKemudahan +
            p.evaluasi.ratingMateri +
            p.evaluasi.ratingSoal +
            p.evaluasi.ratingManfaat) /
          4;
        records.push({
          id: p.id,
          pesertaId: p.id,
          nama: p.nama,
          nik: p.nik,
          instansi: p.instansi,
          pekerjaan: p.pekerjaan,
          usia: p.usia,
          jenisKelamin: p.jenisKelamin,
          tanggalTes: p.tanggalTes,
          ratingKemudahan: p.evaluasi.ratingKemudahan,
          ratingMateri: p.evaluasi.ratingMateri,
          ratingSoal: p.evaluasi.ratingSoal,
          ratingManfaat: p.evaluasi.ratingManfaat,
          rataRata: parseFloat(avg.toFixed(1)),
          kritikSaran: p.evaluasi.kritikSaran,
          createdAt: p.createdAt || p.tanggalTes,
        });
      }
    });
  }

  // Calculate statistics
  const totalResponden = records.length;
  let sumKemudahan = 0;
  let sumMateri = 0;
  let sumSoal = 0;
  let sumManfaat = 0;
  let sumAll = 0;
  let sangatPuasCount = 0;
  let puasCount = 0;

  const distribusi = {
    bintang5: 0,
    bintang4: 0,
    bintang3: 0,
    bintang2: 0,
    bintang1: 0,
  };

  records.forEach((r) => {
    sumKemudahan += r.ratingKemudahan;
    sumMateri += r.ratingMateri;
    sumSoal += r.ratingSoal;
    sumManfaat += r.ratingManfaat;
    sumAll += r.rataRata;

    if (r.rataRata >= 4.5) sangatPuasCount++;
    if (r.rataRata >= 4.0) puasCount++;

    const rounded = Math.round(r.rataRata);
    if (rounded >= 5) distribusi.bintang5++;
    else if (rounded === 4) distribusi.bintang4++;
    else if (rounded === 3) distribusi.bintang3++;
    else if (rounded === 2) distribusi.bintang2++;
    else distribusi.bintang1++;
  });

  const stats: GardaEvaluasiSummaryStats = {
    totalResponden,
    rataRataKeseluruhan:
      totalResponden > 0 ? parseFloat((sumAll / totalResponden).toFixed(1)) : 0,
    rataRataKemudahan:
      totalResponden > 0 ? parseFloat((sumKemudahan / totalResponden).toFixed(1)) : 0,
    rataRataMateri:
      totalResponden > 0 ? parseFloat((sumMateri / totalResponden).toFixed(1)) : 0,
    rataRataSoal:
      totalResponden > 0 ? parseFloat((sumSoal / totalResponden).toFixed(1)) : 0,
    rataRataManfaat:
      totalResponden > 0 ? parseFloat((sumManfaat / totalResponden).toFixed(1)) : 0,
    persentaseSangatPuas:
      totalResponden > 0 ? Math.round((sangatPuasCount / totalResponden) * 100) : 0,
    persentasePuas:
      totalResponden > 0 ? Math.round((puasCount / totalResponden) * 100) : 0,
    distribusiBintang: distribusi,
  };

  return { evaluasiList: records, stats };
}


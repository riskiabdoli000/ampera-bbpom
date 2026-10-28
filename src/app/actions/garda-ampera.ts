"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
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

  return {
    preTestSoal: shuffleAndPick(preList, 10),
    postTestSoal: shuffleAndPick(postList, 10),
    modules: formattedModules,
  };
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
}): Promise<{ success: boolean; id?: number; message?: string }> {
  try {
    const { biodata, preTestScore, postTestScore, postTestAttempts, isLulus, nomorSertifikat, evaluasi } = payload;

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
          nomorSertifikat: nomorSertifikat || null,
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
      return { success: true, id: created.id };
    }
  } catch (err: any) {
    console.warn("Prisma save failed, saving to fallback cache:", err.message);
  }

  // Fallback memory cache
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
    nomorSertifikat: payload.nomorSertifikat || null,
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
  return { success: true, id: newId };
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
      revalidatePath("/admin/garda-ampera");
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

  revalidatePath("/admin/garda-ampera");
  return { success: true, message: "Soal berhasil disimpan." };
}

/**
 * Hapus Soal Ujian
 */
export async function adminDeleteSoalAction(id: number): Promise<{ success: boolean; message: string }> {
  try {
    if ((prisma as any).gardaSoal) {
      await (prisma as any).gardaSoal.delete({
        where: { id },
      });
      revalidatePath("/admin/garda-ampera");
      return { success: true, message: "Soal berhasil dihapus dari database." };
    }
  } catch (err: any) {
    console.warn("DB delete failed, using fallback:", err.message);
  }

  globalFallback.soalList = globalFallback.soalList.filter((s) => s.id !== id);
  revalidatePath("/admin/garda-ampera");
  return { success: true, message: "Soal berhasil dihapus." };
}

/**
 * Toggle Status Aktif Soal
 */
export async function adminToggleSoalStatusAction(
  id: number,
  isAktif: boolean
): Promise<{ success: boolean; message: string }> {
  try {
    if ((prisma as any).gardaSoal) {
      await (prisma as any).gardaSoal.update({
        where: { id },
        data: { isAktif },
      });
      revalidatePath("/admin/garda-ampera");
      return { success: true, message: "Status soal diperbarui." };
    }
  } catch (err) {
    // fallback
  }

  const idx = globalFallback.soalList.findIndex((s) => s.id === id);
  if (idx !== -1) {
    globalFallback.soalList[idx].isAktif = isAktif;
  }
  revalidatePath("/admin/garda-ampera");
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
 * Hapus Modul Materi oleh Admin
 */
export async function adminDeleteMateriAction(id: number): Promise<{ success: boolean; message: string }> {
  try {
    if ((prisma as any).gardaMateri) {
      await (prisma as any).gardaMateri.delete({
        where: { id },
      });
      revalidatePath("/admin/garda-ampera");
      revalidatePath("/garda-ampera");
      return { success: true, message: "Modul materi berhasil dihapus." };
    }
  } catch (err: any) {
    console.warn("DB delete materi failed, using fallback:", err.message);
  }

  globalFallback.materiList = globalFallback.materiList.filter((m) => m.id !== id);
  revalidatePath("/admin/garda-ampera");
  revalidatePath("/garda-ampera");
  return { success: true, message: "Modul materi berhasil dihapus." };
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
          if (!resultData.nama) resultData.nama = prevPeserta.nama;
          if (!resultData.alamat) resultData.alamat = prevPeserta.alamat;
          if (!resultData.instansi) resultData.instansi = prevPeserta.instansi;
          if (!resultData.usia && prevPeserta.usia) resultData.usia = String(prevPeserta.usia);
          if (!resultData.jenisKelamin) resultData.jenisKelamin = prevPeserta.jenisKelamin;
          if (!resultData.pendidikan) resultData.pendidikan = prevPeserta.pendidikan;
          if (!resultData.pekerjaan) resultData.pekerjaan = prevPeserta.pekerjaan;
          source = "garda";
        }
      } catch (err) {
        console.warn("Gagal lookup tabel gardaPeserta:", err);
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
        message: `Data tamu terdaftar atas nama '${resultData.nama}'. Formulir telah diisi otomatis.`,
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

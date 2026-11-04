"use server";

import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import fs from "fs/promises";
import path from "path";
import { compressPdfBuffer } from "@/lib/garda-parser";

export type KomoditasType = "Pangan" | "Kosmetik" | "Obat" | "Obat Tradisional";

export interface MateriEdukasiItemData {
  id: number;
  judul: string;
  komoditas: KomoditasType;
  deskripsi: string;
  imageUrl: string;
  imagePath?: string | null;
  pdfUrl?: string | null;
  pdfFilename?: string | null;
  icon?: string;
  isPublished: boolean;
  urutan: number;
  createdAt?: string;
  updatedAt?: string;
}

// Alias for backward compatibility if imported elsewhere
export type EdukasiItemData = MateriEdukasiItemData;

export type MateriActionResult<T = unknown> = {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
};

const DEFAULT_MATERI_EDUKASI = [
  {
    judul: "Kenali Bahaya Bahan Berbahaya pada Pangan",
    komoditas: "Pangan" as KomoditasType,
    deskripsi:
      "Pelajari ciri-ciri pangan yang mengandung bahan berbahaya seperti formalin, boraks, rhodamin B, dan metanil yellow.",
    imageUrl: "/assets-landingpage/layanan/pengujian-cepat-hero.jpg",
    pdfUrl: "/documents/materi-edukasi-bbpom.pdf",
    pdfFilename: "Panduan-Keamanan-Pangan-BBPOM.pdf",
    urutan: 1,
    isPublished: true,
  },
  {
    judul: "Tips Memilih Pangan yang Aman dan Bermutu",
    komoditas: "Pangan" as KomoditasType,
    deskripsi:
      "Ketahui tips mudah memilih pangan segar, sayuran, dan produk olahan yang aman, higienis, dan sehat untuk keluarga.",
    imageUrl: "/assets-landingpage/layanan/1.jpg",
    pdfUrl: "/documents/materi-edukasi-bbpom.pdf",
    pdfFilename: "Panduan-Keamanan-Pangan-BBPOM.pdf",
    urutan: 2,
    isPublished: true,
  },
  {
    judul: "Cara Menyimpan Pangan dengan Benar",
    komoditas: "Pangan" as KomoditasType,
    deskripsi:
      "Simpan pangan dengan cara yang tepat di kulkas maupun wadah tertutup agar mutu nutrisi terjaga dan tidak mudah rusak.",
    imageUrl: "/assets-landingpage/layanan/2.jpg",
    pdfUrl: "/documents/materi-edukasi-bbpom.pdf",
    pdfFilename: "Panduan-Keamanan-Pangan-BBPOM.pdf",
    urutan: 3,
    isPublished: true,
  },
  {
    judul: "5 Kunci Keamanan Pangan Menurut BPOM",
    komoditas: "Pangan" as KomoditasType,
    deskripsi:
      "Kenali 5 kunci penting keamanan pangan untuk menjaga kebersihan diri, pemisahan bahan pangan, dan pengolahan bersuhu aman.",
    imageUrl: "/documents/materi-edukasi-page-1.png",
    pdfUrl: "/documents/materi-edukasi-bbpom.pdf",
    pdfFilename: "Panduan-Keamanan-Pangan-BBPOM.pdf",
    urutan: 4,
    isPublished: true,
  },
  {
    judul: "Waspada Pangan Kedaluwarsa & Rusak",
    komoditas: "Pangan" as KomoditasType,
    deskripsi:
      "Simak panduan penting mengenali kemasan kaleng kembung, penyok, bocor, serta membaca tanggal kedaluwarsa secara teliti.",
    imageUrl: "/assets-landingpage/layanan/3.jpg",
    pdfUrl: "/documents/materi-edukasi-bbpom.pdf",
    pdfFilename: "Panduan-Keamanan-Pangan-BBPOM.pdf",
    urutan: 5,
    isPublished: true,
  },
  {
    judul: "Tips Menghindari Pangan Tidak Aman",
    komoditas: "Pangan" as KomoditasType,
    deskripsi:
      "Langkah-langkah sederhana membiasakan Cek KLIK (Kemasan, Label, Izin Edar, Kedaluwarsa) sebelum membeli makanan.",
    imageUrl: "/assets-landingpage/layanan/4.jpg",
    pdfUrl: "/documents/materi-edukasi-bbpom.pdf",
    pdfFilename: "Panduan-Keamanan-Pangan-BBPOM.pdf",
    urutan: 6,
    isPublished: true,
  },
  {
    judul: "Waspada Merkuri & Hidrokuinon pada Kosmetik",
    komoditas: "Kosmetik" as KomoditasType,
    deskripsi:
      "Kenali bahaya efek samping zat pemutih berbahaya yang berisiko merusak kulit, memicu iritasi kronis, hingga kanker kulit.",
    imageUrl: "/assets-landingpage/layanan/pengujian-cepat-hero.jpg",
    pdfUrl: "/documents/materi-edukasi-bbpom.pdf",
    pdfFilename: "Panduan-Keamanan-Pangan-BBPOM.pdf",
    urutan: 7,
    isPublished: true,
  },
  {
    judul: "Tips Cerdas Memilih Kosmetik Berizin Edar",
    komoditas: "Kosmetik" as KomoditasType,
    deskripsi:
      "Pastikan kosmetik yang Anda gunakan memiliki nomor notifikasi BPOM resmi dengan kode NA melalui aplikasi BPOM Mobile.",
    imageUrl: "/documents/materi-edukasi-page-2.png",
    pdfUrl: "/documents/materi-edukasi-bbpom.pdf",
    pdfFilename: "Panduan-Keamanan-Pangan-BBPOM.pdf",
    urutan: 8,
    isPublished: true,
  },
  {
    judul: "Pahami Golongan Obat & Logo Lingkaran Warna",
    komoditas: "Obat" as KomoditasType,
    deskripsi:
      "Panduan mengenali arti lingkaran hijau (obat bebas), biru (obat bebas terbatas), merah bertanda K (obat keras), dan palang merah.",
    imageUrl: "/assets-landingpage/layanan/3.jpg",
    pdfUrl: "/documents/materi-edukasi-bbpom.pdf",
    pdfFilename: "Panduan-Keamanan-Pangan-BBPOM.pdf",
    urutan: 9,
    isPublished: true,
  },
  {
    judul: "Tanya 5 O: Gunakan Obat dengan Bijak & Benar",
    komoditas: "Obat" as KomoditasType,
    deskripsi:
      "Prinsip penting sebelum mengonsumsi obat: Pastikan Obatnya Benar, Dosisnya Benar, Caranya Benar, Waktunya Benar, Waspada Efeknya.",
    imageUrl: "/assets-landingpage/layanan/1.jpg",
    pdfUrl: "/documents/materi-edukasi-bbpom.pdf",
    pdfFilename: "Panduan-Keamanan-Pangan-BBPOM.pdf",
    urutan: 10,
    isPublished: true,
  },
  {
    judul: "Cek BKO pada Jamu & Obat Tradisional",
    komoditas: "Obat Tradisional" as KomoditasType,
    deskripsi:
      "Waspadai jamu instan atau ramuan herbal yang dicampuri Bahan Kimia Obat (BKO) seperti parasetamol atau sildenafil ilegal.",
    imageUrl: "/assets-landingpage/layanan/2.jpg",
    pdfUrl: "/documents/materi-edukasi-bbpom.pdf",
    pdfFilename: "Panduan-Keamanan-Pangan-BBPOM.pdf",
    urutan: 11,
    isPublished: true,
  },
  {
    judul: "Mengenal Jamu, OHT, dan Fitofarmaka",
    komoditas: "Obat Tradisional" as KomoditasType,
    deskripsi:
      "Pahami tiga tingkatan logo obat bahan alam asli Indonesia yang telah teruji klinis keamanan dan khasiatnya oleh BPOM.",
    imageUrl: "/assets-landingpage/layanan/4.jpg",
    pdfUrl: "/documents/materi-edukasi-bbpom.pdf",
    pdfFilename: "Panduan-Keamanan-Pangan-BBPOM.pdf",
    urutan: 12,
    isPublished: true,
  },
];

const VALID_KOMODITAS: KomoditasType[] = [
  "Pangan",
  "Kosmetik",
  "Obat",
  "Obat Tradisional",
];

const materiSchema = z.object({
  judul: z.string().min(2, "Judul materi edukasi minimal 2 karakter"),
  komoditas: z.enum(["Pangan", "Kosmetik", "Obat", "Obat Tradisional"]),
  deskripsi: z.string().min(5, "Deskripsi materi minimal 5 karakter"),
});

/**
 * Helper untuk menghapus file lama di public/uploads/edukasi
 */
async function deleteOldLocalFile(fileUrl: string | null | undefined) {
  if (!fileUrl || !fileUrl.startsWith("/uploads/edukasi/")) return;
  try {
    const relPath = fileUrl.replace(/^\/uploads\/edukasi\//, "");
    const uploadDir = path.resolve(process.cwd(), "public", "uploads", "edukasi");
    const targetPath = path.resolve(uploadDir, relPath);
    if (targetPath.startsWith(uploadDir + path.sep)) {
      await fs.unlink(targetPath).catch(() => {});
    }
  } catch (err) {
    console.warn("Gagal menghapus file lama:", err);
  }
}

/**
 * Menyimpan file PDF yang diunggah ke public/uploads/edukasi/documents
 */
async function saveUploadedPdf(file: File): Promise<{
  pdfUrl: string;
  pdfFilename: string;
}> {
  const uploadDir = path.resolve(process.cwd(), "public", "uploads", "edukasi", "documents");
  await fs.mkdir(uploadDir, { recursive: true });

  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  let finalBuffer: Uint8Array = uint8Array;

  try {
    const comp = await compressPdfBuffer(uint8Array);
    if (comp && comp.buffer) {
      finalBuffer = comp.buffer;
    }
  } catch {
    finalBuffer = uint8Array;
  }

  const cleanOriginalName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const savedFilename = `materi-${Date.now()}-${cleanOriginalName}`;
  const newFilePath = path.join(uploadDir, savedFilename);

  await fs.writeFile(newFilePath, Buffer.from(finalBuffer));

  return {
    pdfUrl: `/uploads/edukasi/documents/${savedFilename}`,
    pdfFilename: file.name,
  };
}

/**
 * Menyimpan gambar cover (baik dari upload kustom atau hasil render halaman 1 PDF)
 */
async function saveUploadedCoverImage(fileOrBlob: File | Blob, ext = "webp"): Promise<string> {
  const uploadDir = path.resolve(process.cwd(), "public", "uploads", "edukasi", "images");
  await fs.mkdir(uploadDir, { recursive: true });

  const arrayBuffer = await fileOrBlob.arrayBuffer();
  const filename = `cover-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
  const newFilePath = path.join(uploadDir, filename);

  await fs.writeFile(newFilePath, Buffer.from(arrayBuffer));

  return `/uploads/edukasi/images/${filename}`;
}

/**
 * Memastikan nilai imageUrl valid dan bukan dokumen PDF
 * Mencegah error 400 Bad Request pada Next.js Image Optimizer
 */
function sanitizeImageUrl(url: string | null | undefined): string {
  if (!url || typeof url !== "string") {
    return "/assets-landingpage/layanan/1.jpg";
  }
  const clean = url.trim();
  if (!clean || clean.toLowerCase().endsWith(".pdf")) {
    return "/assets-landingpage/layanan/1.jpg";
  }
  return clean;
}

/**
 * Mengambil daftar seluruh Materi Edukasi untuk Halaman Admin
 * Jika tabel masih kosong sama sekali, otomatis inisialisasi 12 materi default
 */
export async function getMateriEdukasiAdminListAction(): Promise<MateriEdukasiItemData[]> {
  try {
    // Auto-update data lama jika pernah ada record yang imageUrl-nya tersimpan sebagai berkas PDF
    await prisma.edukasi.updateMany({
      where: {
        imageUrl: {
          endsWith: ".pdf",
          mode: "insensitive",
        },
      },
      data: {
        imageUrl: "/assets-landingpage/layanan/1.jpg",
      },
    }).catch(() => {});

    let records = await prisma.edukasi.findMany({
      orderBy: [{ urutan: "asc" }, { id: "asc" }],
    });

    if (records.length === 0) {
      await prisma.edukasi.createMany({
        data: DEFAULT_MATERI_EDUKASI,
      });

      records = await prisma.edukasi.findMany({
        orderBy: [{ urutan: "asc" }, { id: "asc" }],
      });
    }

    return records.map((r) => ({
      id: r.id,
      judul: r.judul,
      komoditas: (VALID_KOMODITAS.includes(r.komoditas as KomoditasType)
        ? r.komoditas
        : "Pangan") as KomoditasType,
      deskripsi: r.deskripsi,
      imageUrl: sanitizeImageUrl(r.imageUrl),
      imagePath: r.imagePath,
      pdfUrl: r.pdfUrl,
      pdfFilename: r.pdfFilename,
      isPublished: r.isPublished,
      urutan: r.urutan,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));
  } catch (error) {
    console.error("[getMateriEdukasiAdminListAction] Error:", error);
    return DEFAULT_MATERI_EDUKASI.map((item, idx) => ({
      id: idx + 1,
      ...item,
    }));
  }
}

/**
 * Mengambil daftar Materi Edukasi yang dipublikasikan (isPublished: true) untuk halaman publik /edukasi
 */
export async function getPublicMateriEdukasiListAction(): Promise<MateriEdukasiItemData[]> {
  try {
    let records = await prisma.edukasi.findMany({
      where: { isPublished: true },
      orderBy: [{ urutan: "asc" }, { id: "asc" }],
    });

    if (records.length === 0) {
      const countAll = await prisma.edukasi.count();
      if (countAll === 0) {
        await prisma.edukasi.createMany({
          data: DEFAULT_MATERI_EDUKASI,
        });

        records = await prisma.edukasi.findMany({
          where: { isPublished: true },
          orderBy: [{ urutan: "asc" }, { id: "asc" }],
        });
      }
    }

    if (records.length === 0) {
      return DEFAULT_MATERI_EDUKASI.map((item, idx) => ({
        id: idx + 1,
        ...item,
      }));
    }

    return records.map((r) => ({
      id: r.id,
      judul: r.judul,
      komoditas: (VALID_KOMODITAS.includes(r.komoditas as KomoditasType)
        ? r.komoditas
        : "Pangan") as KomoditasType,
      deskripsi: r.deskripsi,
      imageUrl: sanitizeImageUrl(r.imageUrl),
      imagePath: r.imagePath,
      pdfUrl: r.pdfUrl,
      pdfFilename: r.pdfFilename,
      isPublished: r.isPublished,
      urutan: r.urutan,
    }));
  } catch (error) {
    console.warn("[getPublicMateriEdukasiListAction] Fallback to default:", error);
    return DEFAULT_MATERI_EDUKASI.map((item, idx) => ({
      id: idx + 1,
      ...item,
    }));
  }
}

// Backward compatibility alias for landing page education
export async function getEdukasiList(): Promise<MateriEdukasiItemData[]> {
  return getMateriEdukasiAdminListAction();
}

export async function getLandingEdukasiList(): Promise<MateriEdukasiItemData[]> {
  return getPublicMateriEdukasiListAction();
}

/**
 * Tambah Materi Edukasi Baru
 */
export async function createMateriEdukasiAction(
  formData: FormData
): Promise<MateriActionResult<MateriEdukasiItemData>> {
  try {
    await verifyAdminSession();

    const judul = ((formData.get("judul") as string) || "").trim();
    const komoditas = ((formData.get("komoditas") as string) || "Pangan").trim();
    const deskripsi = ((formData.get("deskripsi") as string) || "").trim();
    const urutanStr = formData.get("urutan") as string;
    const isPublished = formData.get("isPublished") === "true";

    const validated = materiSchema.safeParse({ judul, komoditas, deskripsi });
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Input materi tidak valid.",
      };
    }

    const pdfFile = formData.get("pdfFile") as File | null;
    const coverImageFile = formData.get("coverImage") as File | null;
    const defaultCoverUrl = (formData.get("defaultCoverUrl") as string) || "";

    let finalPdfUrl: string | null = null;
    let finalPdfFilename: string | null = null;
    let finalImageUrl: string = defaultCoverUrl || "/assets-landingpage/layanan/1.jpg";

    // 1. Simpan Berkas PDF jika ada
    if (pdfFile && pdfFile.size > 0) {
      const lowerName = pdfFile.name.toLowerCase();
      if (!lowerName.endsWith(".pdf") && pdfFile.type !== "application/pdf") {
        return {
          success: false,
          error: "Berkas materi wajib berformat dokumen PDF (.pdf).",
        };
      }
      const savedPdf = await saveUploadedPdf(pdfFile);
      finalPdfUrl = savedPdf.pdfUrl;
      finalPdfFilename = savedPdf.pdfFilename;
    }

    // 2. Simpan Gambar Cover jika ada (hasil generate Halaman 1 PDF atau upload gambar kustom)
    if (coverImageFile && coverImageFile.size > 0) {
      const ext = coverImageFile.name?.split(".").pop() || "webp";
      finalImageUrl = await saveUploadedCoverImage(coverImageFile, ext);
    }

    // 3. Tentukan Urutan Tampil
    let urutan = parseInt(urutanStr, 10);
    if (isNaN(urutan) || urutan <= 0) {
      const maxItem = await prisma.edukasi.findFirst({
        orderBy: { urutan: "desc" },
        select: { urutan: true },
      });
      urutan = (maxItem?.urutan || 0) + 1;
    }

    const created = await prisma.edukasi.create({
      data: {
        judul: validated.data.judul,
        komoditas: validated.data.komoditas,
        deskripsi: validated.data.deskripsi,
        imageUrl: sanitizeImageUrl(finalImageUrl),
        imagePath: finalImageUrl.startsWith("/uploads/") ? finalImageUrl : null,
        pdfUrl: finalPdfUrl,
        pdfFilename: finalPdfFilename,
        isPublished,
        urutan,
      },
    });

    revalidatePath("/edukasi");
    revalidatePath("/admin/settings/edukasi");
    revalidatePath("/");

    return {
      success: true,
      message: `Materi edukasi "${created.judul}" berhasil ditambahkan.`,
      data: {
        id: created.id,
        judul: created.judul,
        komoditas: created.komoditas as KomoditasType,
        deskripsi: created.deskripsi,
        imageUrl: created.imageUrl || "/assets-landingpage/layanan/1.jpg",
        imagePath: created.imagePath,
        pdfUrl: created.pdfUrl,
        pdfFilename: created.pdfFilename,
        isPublished: created.isPublished,
        urutan: created.urutan,
        createdAt: created.createdAt.toISOString(),
        updatedAt: created.updatedAt.toISOString(),
      },
    };
  } catch (error) {
    console.error("[createMateriEdukasiAction] Error:", error);
    return {
      success: false,
      error: "Gagal menambahkan materi edukasi baru ke database.",
    };
  }
}

/**
 * Perbarui Materi Edukasi
 */
export async function updateMateriEdukasiAction(
  formData: FormData
): Promise<MateriActionResult<MateriEdukasiItemData>> {
  try {
    await verifyAdminSession();

    const id = parseInt((formData.get("id") as string) || "0", 10);
    if (!id) {
      return { success: false, error: "ID materi edukasi tidak valid." };
    }

    const existing = await prisma.edukasi.findUnique({ where: { id } });
    if (!existing) {
      return { success: false, error: "Materi edukasi tidak ditemukan." };
    }

    const judul = ((formData.get("judul") as string) || "").trim();
    const komoditas = ((formData.get("komoditas") as string) || "Pangan").trim();
    const deskripsi = ((formData.get("deskripsi") as string) || "").trim();
    const urutanStr = formData.get("urutan") as string;
    const isPublished = formData.get("isPublished") === "true";

    const validated = materiSchema.safeParse({ judul, komoditas, deskripsi });
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Input materi tidak valid.",
      };
    }

    const pdfFile = formData.get("pdfFile") as File | null;
    const coverImageFile = formData.get("coverImage") as File | null;

    let finalPdfUrl = existing.pdfUrl;
    let finalPdfFilename = existing.pdfFilename;
    let finalImageUrl = existing.imageUrl;

    // Ganti PDF jika ada berkas PDF baru
    if (pdfFile && pdfFile.size > 0) {
      const lowerName = pdfFile.name.toLowerCase();
      if (!lowerName.endsWith(".pdf") && pdfFile.type !== "application/pdf") {
        return {
          success: false,
          error: "Berkas materi wajib berformat dokumen PDF (.pdf).",
        };
      }
      // Hapus PDF lama jika berada di folder uploads
      await deleteOldLocalFile(existing.pdfUrl);

      const savedPdf = await saveUploadedPdf(pdfFile);
      finalPdfUrl = savedPdf.pdfUrl;
      finalPdfFilename = savedPdf.pdfFilename;
    }

    // Ganti Cover Gambar jika ada cover baru
    if (coverImageFile && coverImageFile.size > 0) {
      await deleteOldLocalFile(existing.imageUrl);
      const ext = coverImageFile.name?.split(".").pop() || "webp";
      finalImageUrl = await saveUploadedCoverImage(coverImageFile, ext);
    }

    let urutan = parseInt(urutanStr, 10);
    if (isNaN(urutan)) urutan = existing.urutan;

    const updated = await prisma.edukasi.update({
      where: { id },
      data: {
        judul: validated.data.judul,
        komoditas: validated.data.komoditas,
        deskripsi: validated.data.deskripsi,
        imageUrl: sanitizeImageUrl(finalImageUrl),
        imagePath: finalImageUrl?.startsWith("/uploads/") ? finalImageUrl : existing.imagePath,
        pdfUrl: finalPdfUrl,
        pdfFilename: finalPdfFilename,
        isPublished,
        urutan,
      },
    });

    revalidatePath("/edukasi");
    revalidatePath("/admin/settings/edukasi");
    revalidatePath("/");

    return {
      success: true,
      message: `Materi edukasi "${updated.judul}" berhasil diperbarui.`,
      data: {
        id: updated.id,
        judul: updated.judul,
        komoditas: updated.komoditas as KomoditasType,
        deskripsi: updated.deskripsi,
        imageUrl: updated.imageUrl || "/assets-landingpage/layanan/1.jpg",
        imagePath: updated.imagePath,
        pdfUrl: updated.pdfUrl,
        pdfFilename: updated.pdfFilename,
        isPublished: updated.isPublished,
        urutan: updated.urutan,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      },
    };
  } catch (error) {
    console.error("[updateMateriEdukasiAction] Error:", error);
    return {
      success: false,
      error: "Gagal memperbarui materi edukasi.",
    };
  }
}

/**
 * Hapus Materi Edukasi beserta Berkas Gambarnya / PDF
 */
export async function deleteMateriEdukasiAction(id: number): Promise<MateriActionResult> {
  try {
    await verifyAdminSession();

    const existing = await prisma.edukasi.findUnique({ where: { id } });
    if (!existing) {
      return { success: false, error: "Materi edukasi tidak ditemukan." };
    }

    await deleteOldLocalFile(existing.imageUrl);
    await deleteOldLocalFile(existing.pdfUrl);

    await prisma.edukasi.delete({ where: { id } });

    revalidatePath("/edukasi");
    revalidatePath("/admin/settings/edukasi");
    revalidatePath("/");

    return {
      success: true,
      message: `Materi edukasi "${existing.judul}" berhasil dihapus.`,
    };
  } catch (error) {
    console.error("[deleteMateriEdukasiAction] Error:", error);
    return {
      success: false,
      error: "Gagal menghapus materi edukasi.",
    };
  }
}

/**
 * Toggle Status Aktif / Nonaktif Materi Edukasi
 */
export async function toggleMateriEdukasiStatusAction(
  id: number
): Promise<MateriActionResult<{ isPublished: boolean }>> {
  try {
    await verifyAdminSession();

    const existing = await prisma.edukasi.findUnique({ where: { id } });
    if (!existing) {
      return { success: false, error: "Materi edukasi tidak ditemukan." };
    }

    const nextStatus = !existing.isPublished;

    await prisma.edukasi.update({
      where: { id },
      data: { isPublished: nextStatus },
    });

    revalidatePath("/edukasi");
    revalidatePath("/admin/settings/edukasi");
    revalidatePath("/");

    return {
      success: true,
      message: `Status publikasi materi diubah menjadi ${nextStatus ? "Aktif" : "Nonaktif"}.`,
      data: { isPublished: nextStatus },
    };
  } catch (error) {
    console.error("[toggleMateriEdukasiStatusAction] Error:", error);
    return {
      success: false,
      error: "Gagal mengubah status publikasi materi.",
    };
  }
}

/**
 * Reset ke 12 Materi Bawaan Resmi BBPOM
 */
export async function resetToDefaultMateriEdukasiAction(): Promise<
  MateriActionResult<MateriEdukasiItemData[]>
> {
  try {
    await verifyAdminSession();

    // Hapus seluruh data yang ada
    await prisma.edukasi.deleteMany({});

    // Buat ulang 12 materi default
    await prisma.edukasi.createMany({
      data: DEFAULT_MATERI_EDUKASI,
    });

    const resetRecords = await prisma.edukasi.findMany({
      orderBy: [{ urutan: "asc" }, { id: "asc" }],
    });

    revalidatePath("/edukasi");
    revalidatePath("/admin/settings/edukasi");
    revalidatePath("/");

    return {
      success: true,
      message: "Seluruh materi edukasi berhasil dikembalikan ke 12 data bawaan resmi BPOM.",
      data: resetRecords.map((r) => ({
        id: r.id,
        judul: r.judul,
        komoditas: r.komoditas as KomoditasType,
        deskripsi: r.deskripsi,
        imageUrl: r.imageUrl || "/assets-landingpage/layanan/1.jpg",
        imagePath: r.imagePath,
        pdfUrl: r.pdfUrl,
        pdfFilename: r.pdfFilename,
        isPublished: r.isPublished,
        urutan: r.urutan,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      })),
    };
  } catch (error) {
    console.error("[resetToDefaultMateriEdukasiAction] Error:", error);
    return {
      success: false,
      error: "Gagal mengembalikan data materi ke default.",
    };
  }
}

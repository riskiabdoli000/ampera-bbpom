"use server";

import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import fs from "fs/promises";
import path from "path";
import { compressPdfBuffer } from "@/lib/garda-parser";

export interface EdukasiItemData {
  id: number;
  judul: string;
  deskripsi: string;
  icon: string;
  pdfUrl: string;
  pdfFilename: string;
  isPublished: boolean;
  urutan: number;
}

export type EdukasiSettingsData = EdukasiItemData;

const ALLOWED_EDUKASI_ICONS = [
  "ShieldCheck",
  "BookOpen",
  "FileText",
  "Utensils",
  "FlaskConical",
  "Sparkles",
  "Lightbulb",
  "CheckCircle2",
  "HeartHandshake",
  "Award",
] as const;

export type EdukasiIconName = (typeof ALLOWED_EDUKASI_ICONS)[number];

const DEFAULT_EDUKASI_ITEM: Omit<EdukasiItemData, "id"> = {
  judul: "Keamanan Pangan",
  deskripsi: "Pelajari panduan praktis cara Cek KLIK, izin edar, dan higienitas.",
  icon: "ShieldCheck",
  pdfUrl: "/documents/materi-edukasi-bbpom.pdf",
  pdfFilename: "Panduan-Keamanan-Pangan-BBPOM.pdf",
  isPublished: true,
  urutan: 1,
};

const edukasiSchema = z.object({
  judul: z.string().min(2, "Judul kartu edukasi minimal 2 karakter"),
  deskripsi: z.string().min(5, "Deskripsi singkat minimal 5 karakter"),
  icon: z.string().min(2, "Pilih salah satu icon kartu"),
});

/**
 * Helper untuk menghapus berkas PDF lama di folder lokal public/uploads/edukasi
 * (mengabaikan file bawaan /documents/materi-edukasi-bbpom.pdf)
 */
async function deleteOldLocalPdf(pdfUrl: string | null | undefined) {
  if (!pdfUrl || !pdfUrl.startsWith("/uploads/edukasi/")) return;
  try {
    const filename = path.basename(decodeURIComponent(pdfUrl));
    const uploadDir = path.resolve(process.cwd(), "public", "uploads", "edukasi");
    const targetPath = path.resolve(uploadDir, filename);
    if (targetPath.startsWith(uploadDir + path.sep)) {
      await fs.unlink(targetPath).catch(() => {});
    }
  } catch (err) {
    console.warn("Gagal menghapus file PDF edukasi lama:", err);
  }
}

/**
 * Helper untuk menyimpan berkas PDF yang diunggah ke public/uploads/edukasi
 */
async function saveUploadedPdfToDisk(file: File): Promise<{
  pdfUrl: string;
  pdfFilename: string;
}> {
  const uploadDir = path.resolve(process.cwd(), "public", "uploads", "edukasi");
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
  const savedFilename = `edukasi-${Date.now()}-${cleanOriginalName}`;
  const newFilePath = path.join(uploadDir, savedFilename);

  await fs.writeFile(newFilePath, Buffer.from(finalBuffer));

  return {
    pdfUrl: `/uploads/edukasi/${savedFilename}`,
    pdfFilename: file.name,
  };
}

/**
 * Mengambil seluruh daftar Kartu Edukasi untuk halaman Admin.
 * Jika tabel masih kosong sama sekali, otomatis membuat 1 kartu default ("Keamanan Pangan").
 */
export async function getEdukasiList(): Promise<EdukasiItemData[]> {
  try {
    let records = await prisma.edukasi.findMany({
      orderBy: [{ urutan: "asc" }, { id: "asc" }],
    });

    if (records.length === 0) {
      const seeded = await prisma.edukasi.create({
        data: {
          judul: DEFAULT_EDUKASI_ITEM.judul,
          ringkasan: DEFAULT_EDUKASI_ITEM.deskripsi,
          kategori: DEFAULT_EDUKASI_ITEM.icon,
          konten: DEFAULT_EDUKASI_ITEM.judul,
          imageUrl: DEFAULT_EDUKASI_ITEM.pdfUrl,
          imagePath: DEFAULT_EDUKASI_ITEM.pdfFilename,
          isPublished: true,
          urutan: 1,
        },
      });
      records = [seeded];
    }

    return records.map((r) => ({
      id: r.id,
      judul: r.judul || DEFAULT_EDUKASI_ITEM.judul,
      deskripsi: r.ringkasan || DEFAULT_EDUKASI_ITEM.deskripsi,
      icon: r.kategori || DEFAULT_EDUKASI_ITEM.icon,
      pdfUrl: r.imageUrl || DEFAULT_EDUKASI_ITEM.pdfUrl,
      pdfFilename: r.imagePath || DEFAULT_EDUKASI_ITEM.pdfFilename,
      isPublished: r.isPublished,
      urutan: r.urutan,
    }));
  } catch (error) {
    console.warn("Gagal mengambil daftar edukasi dari DB, menggunakan default:", error);
    return [{ id: 1, ...DEFAULT_EDUKASI_ITEM }];
  }
}

/**
 * Mengambil daftar Kartu Edukasi yang aktif (isPublished: true) untuk ditampilkan di Landing Page.
 */
export async function getLandingEdukasiList(): Promise<EdukasiItemData[]> {
  const all = await getEdukasiList();
  return all.filter((item) => item.isPublished);
}

/**
 * Menambah Kartu Edukasi PDF Baru
 */
export async function createEdukasiAction(formData: FormData): Promise<{
  success: boolean;
  data?: EdukasiItemData;
  error?: string;
  message?: string;
}> {
  try {
    const session = await verifyAdminSession();
    if (!session) {
      return {
        success: false,
        error: "Akses ditolak. Silakan login kembali sebagai Admin.",
      };
    }

    const judul = ((formData.get("judul") as string) || "").trim();
    const deskripsi = ((formData.get("deskripsi") as string) || "").trim();
    const icon = ((formData.get("icon") as string) || "ShieldCheck").trim();
    const file = formData.get("pdfFile") as File | null;

    const validated = edukasiSchema.safeParse({ judul, deskripsi, icon });
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Input kartu edukasi tidak valid.",
      };
    }

    if (!file || file.size === 0) {
      return {
        success: false,
        error: "Harap pilih berkas dokumen PDF (.pdf) untuk materi edukasi baru.",
      };
    }

    const lowerName = file.name.toLowerCase();
    if (!lowerName.endsWith(".pdf") && file.type !== "application/pdf") {
      return {
        success: false,
        error: "Format berkas tidak valid. Harap unggah berkas berformat PDF (.pdf).",
      };
    }

    const { pdfUrl, pdfFilename } = await saveUploadedPdfToDisk(file);

    const lastItem = await prisma.edukasi.findFirst({
      orderBy: { urutan: "desc" },
    });
    const nextUrutan = (lastItem?.urutan || 0) + 1;

    const created = await prisma.edukasi.create({
      data: {
        judul: validated.data.judul,
        ringkasan: validated.data.deskripsi,
        kategori: validated.data.icon,
        konten: validated.data.judul,
        imageUrl: pdfUrl,
        imagePath: pdfFilename,
        isPublished: true,
        urutan: nextUrutan,
      },
    });

    revalidatePath("/");
    revalidatePath("/admin/settings");
    revalidatePath("/admin/settings/edukasi");

    return {
      success: true,
      data: {
        id: created.id,
        judul: created.judul,
        deskripsi: created.ringkasan,
        icon: created.kategori,
        pdfUrl: created.imageUrl || pdfUrl,
        pdfFilename: created.imagePath || pdfFilename,
        isPublished: created.isPublished,
        urutan: created.urutan,
      },
      message: `Kartu edukasi "${created.judul}" berhasil ditambahkan!`,
    };
  } catch (error) {
    console.error("Gagal menambah kartu edukasi baru:", error);
    return {
      success: false,
      error: "Gagal menambahkan kartu edukasi baru.",
    };
  }
}

/**
 * Mengedit Kartu Edukasi PDF yang Sudah Ada.
 * Jika file PDF diganti, maka file PDF lama di public/uploads/edukasi otomatis dihapus.
 */
export async function updateEdukasiAction(formData: FormData): Promise<{
  success: boolean;
  data?: EdukasiItemData;
  error?: string;
  message?: string;
}> {
  try {
    const session = await verifyAdminSession();
    if (!session) {
      return {
        success: false,
        error: "Akses ditolak. Silakan login kembali sebagai Admin.",
      };
    }

    const id = parseInt((formData.get("id") as string) || "0", 10);
    if (!id) {
      return { success: false, error: "ID kartu edukasi tidak valid." };
    }

    const existing = await prisma.edukasi.findUnique({ where: { id } });
    if (!existing) {
      return { success: false, error: "Data kartu edukasi tidak ditemukan." };
    }

    const judul = ((formData.get("judul") as string) || "").trim();
    const deskripsi = ((formData.get("deskripsi") as string) || "").trim();
    const icon = ((formData.get("icon") as string) || "ShieldCheck").trim();
    const file = formData.get("pdfFile") as File | null;

    const validated = edukasiSchema.safeParse({ judul, deskripsi, icon });
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Input kartu edukasi tidak valid.",
      };
    }

    let nextPdfUrl = existing.imageUrl || DEFAULT_EDUKASI_ITEM.pdfUrl;
    let nextPdfFilename = existing.imagePath || DEFAULT_EDUKASI_ITEM.pdfFilename;
    let fileReplacedMessage = "";

    // Jika Admin mengunggah file PDF baru saat edit
    if (file && file.size > 0) {
      const lowerName = file.name.toLowerCase();
      if (!lowerName.endsWith(".pdf") && file.type !== "application/pdf") {
        return {
          success: false,
          error: "Format berkas tidak valid. Harap unggah berkas berformat PDF (.pdf).",
        };
      }

      // Hapus file PDF lama milik item ini dari public/uploads/edukasi
      await deleteOldLocalPdf(existing.imageUrl);

      // Simpan file PDF baru
      const uploaded = await saveUploadedPdfToDisk(file);
      nextPdfUrl = uploaded.pdfUrl;
      nextPdfFilename = uploaded.pdfFilename;
      fileReplacedMessage =
        " Berkas PDF baru berhasil disimpan dan berkas PDF lama telah dihapus otomatis.";
    }

    const updated = await prisma.edukasi.update({
      where: { id },
      data: {
        judul: validated.data.judul,
        ringkasan: validated.data.deskripsi,
        kategori: validated.data.icon,
        konten: validated.data.judul,
        imageUrl: nextPdfUrl,
        imagePath: nextPdfFilename,
      },
    });

    revalidatePath("/");
    revalidatePath("/admin/settings");
    revalidatePath("/admin/settings/edukasi");

    return {
      success: true,
      data: {
        id: updated.id,
        judul: updated.judul,
        deskripsi: updated.ringkasan,
        icon: updated.kategori,
        pdfUrl: updated.imageUrl || nextPdfUrl,
        pdfFilename: updated.imagePath || nextPdfFilename,
        isPublished: updated.isPublished,
        urutan: updated.urutan,
      },
      message: `Kartu edukasi "${updated.judul}" berhasil diperbarui!${fileReplacedMessage}`,
    };
  } catch (error) {
    console.error("Gagal memperbarui kartu edukasi:", error);
    return {
      success: false,
      error: "Gagal menyimpan perubahan kartu edukasi.",
    };
  }
}

/**
 * Mengubah status tampil (Aktif / Nonaktif) Kartu Edukasi di Landing Page
 */
export async function toggleEdukasiStatusAction(
  id: number,
  isPublished: boolean
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const session = await verifyAdminSession();
    if (!session) {
      return { success: false, error: "Akses ditolak." };
    }

    await prisma.edukasi.update({
      where: { id },
      data: { isPublished },
    });

    revalidatePath("/");
    revalidatePath("/admin/settings");
    revalidatePath("/admin/settings/edukasi");

    return { success: true };
  } catch (error) {
    console.error("Gagal toggle status edukasi:", error);
    return { success: false, error: "Gagal mengubah status kartu edukasi." };
  }
}

/**
 * Menghapus Kartu Edukasi beserta file PDF lokalnya di public/uploads/edukasi
 */
export async function deleteEdukasiAction(id: number): Promise<{
  success: boolean;
  error?: string;
  message?: string;
}> {
  try {
    const session = await verifyAdminSession();
    if (!session) {
      return { success: false, error: "Akses ditolak." };
    }

    const existing = await prisma.edukasi.findUnique({ where: { id } });
    if (!existing) {
      return { success: false, error: "Data edukasi tidak ditemukan." };
    }

    // Hapus file PDF lokal di public/uploads/edukasi
    await deleteOldLocalPdf(existing.imageUrl);

    await prisma.edukasi.delete({ where: { id } });

    revalidatePath("/");
    revalidatePath("/admin/settings");
    revalidatePath("/admin/settings/edukasi");

    return {
      success: true,
      message: `Kartu edukasi "${existing.judul}" dan berkas PDF-nya berhasil dihapus.`,
    };
  } catch (error) {
    console.error("Gagal menghapus kartu edukasi:", error);
    return { success: false, error: "Gagal menghapus kartu edukasi." };
  }
}

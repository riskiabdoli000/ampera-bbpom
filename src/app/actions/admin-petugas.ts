"use server";

import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { uploadImage, deleteImage } from "@/lib/storage";

export interface PetugasRecord {
  id: number;
  nip: string;
  nama: string;
  telepon: string | null;
  jabatan: string | null;
  fotoUrl: string | null;
  fotoPath: string | null;
  isAktif: boolean;
  layananId: number | null;
  layananKode?: string | null;
  layananNama?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface LayananOption {
  id: number;
  kode: string;
  nama: string;
}

/**
 * Mengambil daftar opsi layanan aktif untuk dropdown pemilihan penugasan petugas.
 */
export async function getLayananOptions(): Promise<LayananOption[]> {
  await verifyAdminSession();

  const options = await prisma.layanan.findMany({
    select: {
      id: true,
      kode: true,
      nama: true,
    },
    orderBy: {
      id: "asc",
    },
  });

  return options;
}

/**
 * Mengambil daftar seluruh master data petugas BBPOM beserta data layanan terkait.
 */
export async function getAdminPetugasList(): Promise<PetugasRecord[]> {
  await verifyAdminSession();

  const rows = await prisma.$queryRawUnsafe<PetugasRecord[]>(`
    SELECT 
      p.id,
      p.nip,
      p.nama,
      p.telepon,
      p.jabatan,
      p."fotoUrl",
      p."fotoPath",
      p."isAktif",
      p."layananId",
      p."createdAt",
      p."updatedAt",
      l.kode as "layananKode",
      l.nama as "layananNama"
    FROM "Petugas" p
    LEFT JOIN "Layanan" l ON p."layananId" = l.id
    ORDER BY p.id ASC;
  `);

  return rows;
}

/**
 * Menambahkan data petugas baru ke sistem beserta pilihan layanan.
 */
export async function createPetugasAction(formData: FormData) {
  await verifyAdminSession();

  const nip = (formData.get("nip") as string)?.trim() || "";
  const nama = (formData.get("nama") as string)?.trim() || "";
  const telepon = (formData.get("telepon") as string)?.trim() || null;
  const jabatan = (formData.get("jabatan") as string)?.trim() || null;
  const isAktif = formData.get("isAktif") !== "false";
  const fotoFile = formData.get("fotoFile") as File | null;

  const layananIdStr = formData.get("layananId") as string;
  const layananId =
    layananIdStr && layananIdStr !== "0" && !isNaN(Number(layananIdStr))
      ? Number(layananIdStr)
      : null;

  if (!nip) {
    return { success: false, error: "NIP petugas wajib diisi." };
  }
  if (!nama) {
    return { success: false, error: "Nama lengkap petugas wajib diisi." };
  }

  // Cek keunikan NIP
  const existingNip = await prisma.$queryRawUnsafe<PetugasRecord[]>(
    `SELECT id FROM "Petugas" WHERE nip = $1 LIMIT 1;`,
    nip
  );

  if (existingNip.length > 0) {
    return {
      success: false,
      error: `Petugas dengan NIP "${nip}" sudah terdaftar. Periksa kembali NIP yang Anda masukkan.`,
    };
  }

  let fotoUrl: string | null = null;
  let fotoPath: string | null = null;

  // Upload foto jika disediakan
  if (fotoFile && fotoFile.size > 0 && fotoFile.name) {
    try {
      const uploadResult = await uploadImage(fotoFile, "petugas");
      fotoUrl = uploadResult.url;
      fotoPath = uploadResult.path;
    } catch (uploadErr) {
      console.error("Gagal mengunggah foto petugas:", uploadErr);
      return {
        success: false,
        error: "Gagal memproses dan mengunggah berkas foto petugas.",
      };
    }
  }

  try {
    const fullRecord = await prisma.$queryRawUnsafe<PetugasRecord[]>(
      `
      WITH inserted AS (
        INSERT INTO "Petugas" (nip, nama, telepon, jabatan, "fotoUrl", "fotoPath", "isAktif", "layananId", "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
        RETURNING *
      )
      SELECT 
        i.*,
        l.kode as "layananKode",
        l.nama as "layananNama"
      FROM inserted i
      LEFT JOIN "Layanan" l ON i."layananId" = l.id;
      `,
      nip,
      nama,
      telepon,
      jabatan,
      fotoUrl,
      fotoPath,
      isAktif,
      layananId
    );

    return {
      success: true,
      data: fullRecord[0],
    };
  } catch (err: unknown) {
    console.error("Error creating Petugas:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Gagal menambahkan data petugas.",
    };
  }
}

/**
 * Memperbarui data petugas yang sudah ada beserta layanannya.
 */
export async function updatePetugasAction(id: number, formData: FormData) {
  await verifyAdminSession();

  const nip = (formData.get("nip") as string)?.trim() || "";
  const nama = (formData.get("nama") as string)?.trim() || "";
  const telepon = (formData.get("telepon") as string)?.trim() || null;
  const jabatan = (formData.get("jabatan") as string)?.trim() || null;
  const isAktif = formData.get("isAktif") !== "false";
  const fotoFile = formData.get("fotoFile") as File | null;
  const removeFoto = formData.get("removeFoto") === "true";

  const layananIdStr = formData.get("layananId") as string;
  const layananId =
    layananIdStr && layananIdStr !== "0" && !isNaN(Number(layananIdStr))
      ? Number(layananIdStr)
      : null;

  if (!nip) {
    return { success: false, error: "NIP petugas wajib diisi." };
  }
  if (!nama) {
    return { success: false, error: "Nama lengkap petugas wajib diisi." };
  }

  // Cek keberadaan data petugas & keunikan NIP secara paralel
  const [currentPetugas, duplicateNip] = await Promise.all([
    prisma.$queryRawUnsafe<PetugasRecord[]>(
      `SELECT * FROM "Petugas" WHERE id = $1 LIMIT 1;`,
      id
    ),
    prisma.$queryRawUnsafe<PetugasRecord[]>(
      `SELECT id FROM "Petugas" WHERE nip = $1 AND id != $2 LIMIT 1;`,
      nip,
      id
    ),
  ]);

  if (currentPetugas.length === 0) {
    return { success: false, error: "Data petugas tidak ditemukan." };
  }

  const existing = currentPetugas[0];

  if (duplicateNip.length > 0) {
    return {
      success: false,
      error: `Petugas lain dengan NIP "${nip}" sudah terdaftar.`,
    };
  }

  let fotoUrl = existing.fotoUrl;
  let fotoPath = existing.fotoPath;

  // Jika admin menghapus foto
  if (removeFoto && fotoPath) {
    deleteImage(fotoPath).catch(() => {});
    fotoUrl = null;
    fotoPath = null;
  }

  // Jika ada foto baru yang diunggah
  if (fotoFile && fotoFile.size > 0 && fotoFile.name) {
    try {
      const uploadResult = await uploadImage(fotoFile, "petugas");
      if (fotoPath) {
        deleteImage(fotoPath).catch(() => {});
      }
      fotoUrl = uploadResult.url;
      fotoPath = uploadResult.path;
    } catch (uploadErr) {
      console.error("Gagal mengunggah foto baru:", uploadErr);
      return {
        success: false,
        error: "Gagal memproses dan mengunggah foto baru petugas.",
      };
    }
  }

  try {
    const updatedFull = await prisma.$queryRawUnsafe<PetugasRecord[]>(
      `
      WITH updated AS (
        UPDATE "Petugas"
        SET 
          nip = $1,
          nama = $2,
          telepon = $3,
          jabatan = $4,
          "fotoUrl" = $5,
          "fotoPath" = $6,
          "isAktif" = $7,
          "layananId" = $8,
          "updatedAt" = NOW()
        WHERE id = $9
        RETURNING *
      )
      SELECT 
        u.*,
        l.kode as "layananKode",
        l.nama as "layananNama"
      FROM updated u
      LEFT JOIN "Layanan" l ON u."layananId" = l.id;
      `,
      nip,
      nama,
      telepon,
      jabatan,
      fotoUrl,
      fotoPath,
      isAktif,
      layananId,
      id
    );

    return {
      success: true,
      data: updatedFull[0],
    };
  } catch (err: unknown) {
    console.error("Error updating Petugas:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Gagal memperbarui data petugas.",
    };
  }
}

/**
 * Mengubah status aktif/nonaktif petugas dengan 1 klik.
 */
export async function togglePetugasStatusAction(id: number) {
  await verifyAdminSession();

  try {
    const updated = await prisma.$queryRawUnsafe<PetugasRecord[]>(
      `
      WITH toggled AS (
        UPDATE "Petugas"
        SET "isAktif" = NOT "isAktif", "updatedAt" = NOW()
        WHERE id = $1
        RETURNING *
      )
      SELECT 
        t.*,
        l.kode as "layananKode",
        l.nama as "layananNama"
      FROM toggled t
      LEFT JOIN "Layanan" l ON t."layananId" = l.id;
      `,
      id
    );

    if (updated.length === 0) {
      return { success: false, error: "Petugas tidak ditemukan." };
    }

    return {
      success: true,
      data: updated[0],
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Gagal mengubah status petugas.",
    };
  }
}

/**
 * Menghapus data petugas dari sistem dan menghapus fotonya dari storage jika ada.
 */
export async function deletePetugasAction(id: number) {
  await verifyAdminSession();

  try {
    const deleted = await prisma.$queryRawUnsafe<Array<{ fotoPath: string | null }>>(
      `DELETE FROM "Petugas" WHERE id = $1 RETURNING "fotoPath";`,
      id
    );

    if (deleted.length === 0) {
      return { success: false, error: "Data petugas tidak ditemukan." };
    }

    if (deleted[0].fotoPath) {
      deleteImage(deleted[0].fotoPath).catch(() => {});
    }

    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Gagal menghapus data petugas.",
    };
  }
}

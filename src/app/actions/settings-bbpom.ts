"use server";

import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

export interface BbpomTautanItem {
  id: number;
  judul: string;
  deskripsi: string;
  url: string;
  ikon: string;
  badge: string | null;
  urutan: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type BbpomActionResult<T = unknown> = {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
};

const DEFAULT_BBPOM_TAUTAN = [
  {
    judul: "Badan POM RI (Pusat)",
    deskripsi: "Portal Resmi Badan Pengawas Obat dan Makanan RI",
    url: "https://www.pom.go.id",
    ikon: "globe",
    badge: "Pusat",
    urutan: 1,
    isActive: true,
  },
  {
    judul: "BBPOM di Palembang",
    deskripsi: "Portal Resmi Balai Besar POM di Palembang",
    url: "https://palembang.pom.go.id",
    ikon: "landmark",
    badge: "Sumsel",
    urutan: 2,
    isActive: true,
  },
];

/**
 * Mengambil daftar tautan untuk dikelola di halaman Admin
 * Jika masih kosong, otomatis mengisi 2 tautan bawaan (auto-seed)
 */
export async function getBbpomTautanAdminListAction(): Promise<BbpomTautanItem[]> {
  try {
    const list = await prisma.bbpomTautan.findMany({
      orderBy: [{ urutan: "asc" }, { id: "asc" }],
    });

    if (list.length === 0) {
      await prisma.bbpomTautan.createMany({
        data: DEFAULT_BBPOM_TAUTAN,
      });

      const seeded = await prisma.bbpomTautan.findMany({
        orderBy: [{ urutan: "asc" }, { id: "asc" }],
      });

      return seeded.map((item) => ({
        id: item.id,
        judul: item.judul,
        deskripsi: item.deskripsi,
        url: item.url,
        ikon: item.ikon,
        badge: item.badge,
        urutan: item.urutan,
        isActive: item.isActive,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
      }));
    }

    return list.map((item) => ({
      id: item.id,
      judul: item.judul,
      deskripsi: item.deskripsi,
      url: item.url,
      ikon: item.ikon,
      badge: item.badge,
      urutan: item.urutan,
      isActive: item.isActive,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    }));
  } catch (error) {
    console.error("[getBbpomTautanAdminListAction] Error:", error);
    return DEFAULT_BBPOM_TAUTAN.map((item, idx) => ({
      id: idx + 1,
      ...item,
    }));
  }
}

/**
 * Mengambil tautan aktif untuk publik (Navbar utama & subpage)
 */
export async function getPublicBbpomTautanListAction(): Promise<BbpomTautanItem[]> {
  try {
    let list = await prisma.bbpomTautan.findMany({
      where: { isActive: true },
      orderBy: [{ urutan: "asc" }, { id: "asc" }],
    });

    if (list.length === 0) {
      const allCount = await prisma.bbpomTautan.count();
      if (allCount === 0) {
        await prisma.bbpomTautan.createMany({
          data: DEFAULT_BBPOM_TAUTAN,
        });
        list = await prisma.bbpomTautan.findMany({
          where: { isActive: true },
          orderBy: [{ urutan: "asc" }, { id: "asc" }],
        });
      }
    }

    if (list.length === 0) {
      return DEFAULT_BBPOM_TAUTAN.map((item, idx) => ({
        id: idx + 1,
        ...item,
      }));
    }

    return list.map((item) => ({
      id: item.id,
      judul: item.judul,
      deskripsi: item.deskripsi,
      url: item.url,
      ikon: item.ikon,
      badge: item.badge,
      urutan: item.urutan,
      isActive: item.isActive,
    }));
  } catch (error) {
    console.warn("[getPublicBbpomTautanListAction] Fallback to default:", error);
    return DEFAULT_BBPOM_TAUTAN.map((item, idx) => ({
      id: idx + 1,
      ...item,
    }));
  }
}

/**
 * Tambah tautan BBPOM baru
 */
export async function createBbpomTautanAction(payload: {
  judul: string;
  deskripsi: string;
  url: string;
  ikon?: string;
  badge?: string;
  urutan?: number;
  isActive?: boolean;
}): Promise<BbpomActionResult<BbpomTautanItem>> {
  try {
    await verifyAdminSession();

    const judulClean = payload.judul?.trim();
    const deskripsiClean = payload.deskripsi?.trim() || "";
    let urlClean = payload.url?.trim() || "";
    const ikonClean = payload.ikon?.trim() || "globe";
    const badgeClean = payload.badge?.trim() || null;
    const isActive = payload.isActive ?? true;

    if (!judulClean || judulClean.length < 2) {
      return {
        success: false,
        error: "Judul tautan minimal 2 karakter.",
      };
    }

    if (!urlClean) {
      return {
        success: false,
        error: "Alamat URL web tujuan wajib diisi.",
      };
    }

    // Normalisasi protokol URL jika pengguna lupa mengetik https://
    if (!urlClean.startsWith("http://") && !urlClean.startsWith("https://")) {
      urlClean = `https://${urlClean}`;
    }

    // Tentukan urutan jika belum ditentukan
    let urutan = payload.urutan;
    if (urutan === undefined || isNaN(urutan)) {
      const maxItem = await prisma.bbpomTautan.findFirst({
        orderBy: { urutan: "desc" },
        select: { urutan: true },
      });
      urutan = (maxItem?.urutan ?? 0) + 1;
    }

    const created = await prisma.bbpomTautan.create({
      data: {
        judul: judulClean,
        deskripsi: deskripsiClean,
        url: urlClean,
        ikon: ikonClean,
        badge: badgeClean,
        urutan,
        isActive,
      },
    });

    revalidatePath("/");
    revalidatePath("/admin/settings/bbpom");
    revalidatePath("/panduan");

    return {
      success: true,
      message: `Tautan "${created.judul}" berhasil ditambahkan.`,
      data: {
        id: created.id,
        judul: created.judul,
        deskripsi: created.deskripsi,
        url: created.url,
        ikon: created.ikon,
        badge: created.badge,
        urutan: created.urutan,
        isActive: created.isActive,
        createdAt: created.createdAt.toISOString(),
        updatedAt: created.updatedAt.toISOString(),
      },
    };
  } catch (error) {
    console.error("[createBbpomTautanAction] Error:", error);
    return {
      success: false,
      error: "Gagal menambahkan tautan baru ke database.",
    };
  }
}

/**
 * Perbarui tautan BBPOM
 */
export async function updateBbpomTautanAction(
  id: number,
  payload: {
    judul: string;
    deskripsi: string;
    url: string;
    ikon?: string;
    badge?: string;
    urutan?: number;
    isActive?: boolean;
  }
): Promise<BbpomActionResult<BbpomTautanItem>> {
  try {
    await verifyAdminSession();

    const judulClean = payload.judul?.trim();
    const deskripsiClean = payload.deskripsi?.trim() || "";
    let urlClean = payload.url?.trim() || "";
    const ikonClean = payload.ikon?.trim() || "globe";
    const badgeClean = payload.badge?.trim() || null;

    if (!judulClean || judulClean.length < 2) {
      return {
        success: false,
        error: "Judul tautan minimal 2 karakter.",
      };
    }

    if (!urlClean) {
      return {
        success: false,
        error: "Alamat URL web tujuan wajib diisi.",
      };
    }

    if (!urlClean.startsWith("http://") && !urlClean.startsWith("https://")) {
      urlClean = `https://${urlClean}`;
    }

    const updated = await prisma.bbpomTautan.update({
      where: { id },
      data: {
        judul: judulClean,
        deskripsi: deskripsiClean,
        url: urlClean,
        ikon: ikonClean,
        badge: badgeClean,
        ...(payload.urutan !== undefined ? { urutan: payload.urutan } : {}),
        ...(payload.isActive !== undefined ? { isActive: payload.isActive } : {}),
      },
    });

    revalidatePath("/");
    revalidatePath("/admin/settings/bbpom");
    revalidatePath("/panduan");

    return {
      success: true,
      message: `Tautan "${updated.judul}" berhasil diperbarui.`,
      data: {
        id: updated.id,
        judul: updated.judul,
        deskripsi: updated.deskripsi,
        url: updated.url,
        ikon: updated.ikon,
        badge: updated.badge,
        urutan: updated.urutan,
        isActive: updated.isActive,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      },
    };
  } catch (error) {
    console.error("[updateBbpomTautanAction] Error:", error);
    return {
      success: false,
      error: "Gagal memperbarui data tautan.",
    };
  }
}

/**
 * Hapus tautan BBPOM
 */
export async function deleteBbpomTautanAction(id: number): Promise<BbpomActionResult> {
  try {
    await verifyAdminSession();

    const target = await prisma.bbpomTautan.findUnique({
      where: { id },
      select: { judul: true },
    });

    if (!target) {
      return {
        success: false,
        error: "Tautan tidak ditemukan.",
      };
    }

    await prisma.bbpomTautan.delete({
      where: { id },
    });

    revalidatePath("/");
    revalidatePath("/admin/settings/bbpom");
    revalidatePath("/panduan");

    return {
      success: true,
      message: `Tautan "${target.judul}" berhasil dihapus.`,
    };
  } catch (error) {
    console.error("[deleteBbpomTautanAction] Error:", error);
    return {
      success: false,
      error: "Gagal menghapus tautan.",
    };
  }
}

/**
 * Toggle status aktif / nonaktif tautan
 */
export async function toggleBbpomTautanStatusAction(
  id: number
): Promise<BbpomActionResult<{ isActive: boolean }>> {
  try {
    await verifyAdminSession();

    const target = await prisma.bbpomTautan.findUnique({
      where: { id },
      select: { id: true, isActive: true, judul: true },
    });

    if (!target) {
      return {
        success: false,
        error: "Tautan tidak ditemukan.",
      };
    }

    const nextStatus = !target.isActive;

    await prisma.bbpomTautan.update({
      where: { id },
      data: { isActive: nextStatus },
    });

    revalidatePath("/");
    revalidatePath("/admin/settings/bbpom");
    revalidatePath("/panduan");

    return {
      success: true,
      message: `Status tautan "${target.judul}" diubah menjadi ${nextStatus ? "Aktif" : "Nonaktif"}.`,
      data: { isActive: nextStatus },
    };
  } catch (error) {
    console.error("[toggleBbpomTautanStatusAction] Error:", error);
    return {
      success: false,
      error: "Gagal mengubah status aktif tautan.",
    };
  }
}

/**
 * Kembalikan ke 2 tautan bawaan resmi BPOM (Reset to Default)
 */
export async function resetToDefaultBbpomTautanAction(): Promise<BbpomActionResult<BbpomTautanItem[]>> {
  try {
    await verifyAdminSession();

    // Hapus seluruh data yang ada
    await prisma.bbpomTautan.deleteMany({});

    // Buat ulang 2 tautan bawaan
    await prisma.bbpomTautan.createMany({
      data: DEFAULT_BBPOM_TAUTAN,
    });

    const resetList = await prisma.bbpomTautan.findMany({
      orderBy: [{ urutan: "asc" }, { id: "asc" }],
    });

    revalidatePath("/");
    revalidatePath("/admin/settings/bbpom");
    revalidatePath("/panduan");

    return {
      success: true,
      message: "Tautan berhasil dikembalikan ke pengaturan default (2 portal resmi BBPOM).",
      data: resetList.map((item) => ({
        id: item.id,
        judul: item.judul,
        deskripsi: item.deskripsi,
        url: item.url,
        ikon: item.ikon,
        badge: item.badge,
        urutan: item.urutan,
        isActive: item.isActive,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
      })),
    };
  } catch (error) {
    console.error("[resetToDefaultBbpomTautanAction] Error:", error);
    return {
      success: false,
      error: "Gagal mereset tautan ke default.",
    };
  }
}


"use server";

import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const layananSchema = z.object({
  kode: z
    .string()
    .min(2, "Kode layanan minimal 2 karakter")
    .max(30, "Kode layanan maksimal 30 karakter")
    .regex(/^[A-Z0-9_]+$/, "Kode layanan hanya boleh huruf kapital, angka, dan underscore (cth: INFO, UJI_CEPAT)"),
  nama: z.string().min(3, "Nama layanan minimal 3 karakter").max(100, "Nama layanan maksimal 100 karakter"),
  deskripsi: z.string().optional().nullable(),
  isAktif: z.boolean().default(true),
});

export type LayananFormInput = z.infer<typeof layananSchema>;

/**
 * Mengambil seluruh master data layanan beserta jumlah pengajuan terkait.
 */
export async function getAdminLayananList() {
  await verifyAdminSession();

  const list = await prisma.layanan.findMany({
    include: {
      _count: {
        select: {
          pengajuan: true,
        },
      },
    },
    orderBy: {
      id: "asc",
    },
  });

  return list;
}

/**
 * Menambahkan data master layanan baru.
 */
export async function createLayananAction(data: {
  kode: string;
  nama: string;
  deskripsi?: string | null;
  isAktif?: boolean;
}) {
  await verifyAdminSession();

  const validated = layananSchema.safeParse({
    ...data,
    kode: data.kode.trim().toUpperCase(),
    nama: data.nama.trim(),
  });

  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues[0]?.message || "Data layanan tidak valid.",
    };
  }

  // Cek apakah kode atau nama sudah dipakai
  const existingKode = await prisma.layanan.findUnique({
    where: { kode: validated.data.kode },
  });
  if (existingKode) {
    return {
      success: false,
      error: `Kode layanan "${validated.data.kode}" sudah terdaftar. Gunakan kode lain.`,
    };
  }

  const existingNama = await prisma.layanan.findUnique({
    where: { nama: validated.data.nama },
  });
  if (existingNama) {
    return {
      success: false,
      error: `Nama layanan "${validated.data.nama}" sudah terdaftar.`,
    };
  }

  try {
    const created = await prisma.layanan.create({
      data: {
        kode: validated.data.kode,
        nama: validated.data.nama,
        deskripsi: validated.data.deskripsi?.trim() || null,
        isAktif: validated.data.isAktif ?? true,
      },
    });

    revalidatePath("/admin/layanan");
    revalidatePath("/");

    return {
      success: true,
      data: created,
    };
  } catch (error) {
    console.error("Gagal menambahkan layanan:", error);
    return {
      success: false,
      error: "Gagal menyimpan layanan baru ke database.",
    };
  }
}

/**
 * Mengubah data master layanan yang sudah ada.
 */
export async function updateLayananAction(
  id: number,
  data: {
    kode: string;
    nama: string;
    deskripsi?: string | null;
    isAktif?: boolean;
  }
) {
  await verifyAdminSession();

  const validated = layananSchema.safeParse({
    ...data,
    kode: data.kode.trim().toUpperCase(),
    nama: data.nama.trim(),
  });

  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues[0]?.message || "Data layanan tidak valid.",
    };
  }

  // Cek apakah kode dipakai layanan lain
  const existingKode = await prisma.layanan.findFirst({
    where: {
      kode: validated.data.kode,
      NOT: { id },
    },
  });
  if (existingKode) {
    return {
      success: false,
      error: `Kode layanan "${validated.data.kode}" sudah digunakan layanan lain.`,
    };
  }

  // Cek apakah nama dipakai layanan lain
  const existingNama = await prisma.layanan.findFirst({
    where: {
      nama: validated.data.nama,
      NOT: { id },
    },
  });
  if (existingNama) {
    return {
      success: false,
      error: `Nama layanan "${validated.data.nama}" sudah digunakan layanan lain.`,
    };
  }

  try {
    const updated = await prisma.layanan.update({
      where: { id },
      data: {
        kode: validated.data.kode,
        nama: validated.data.nama,
        deskripsi: validated.data.deskripsi?.trim() || null,
        isAktif: validated.data.isAktif ?? true,
      },
    });

    revalidatePath("/admin/layanan");
    revalidatePath("/");

    return {
      success: true,
      data: updated,
    };
  } catch (error) {
    console.error("Gagal memperbarui layanan:", error);
    return {
      success: false,
      error: "Gagal memperbarui data layanan di database.",
    };
  }
}

/**
 * Mengubah status aktif / nonaktif layanan secara instan (1-klik).
 */
export async function toggleLayananStatusAction(id: number) {
  await verifyAdminSession();

  try {
    const current = await prisma.layanan.findUnique({
      where: { id },
      select: { isAktif: true },
    });

    if (!current) {
      return {
        success: false,
        error: "Layanan tidak ditemukan.",
      };
    }

    const updated = await prisma.layanan.update({
      where: { id },
      data: { isAktif: !current.isAktif },
    });

    revalidatePath("/admin/layanan");
    revalidatePath("/");

    return {
      success: true,
      data: updated,
    };
  } catch (error) {
    console.error("Gagal mengubah status layanan:", error);
    return {
      success: false,
      error: "Gagal memperbarui status layanan.",
    };
  }
}

/**
 * Menghapus layanan (hanya jika belum memiliki transaksi pengajuan terkait).
 */
export async function deleteLayananAction(id: number) {
  await verifyAdminSession();

  try {
    const layanan = await prisma.layanan.findUnique({
      where: { id },
      include: {
        _count: {
          select: { pengajuan: true },
        },
      },
    });

    if (!layanan) {
      return {
        success: false,
        error: "Layanan tidak ditemukan.",
      };
    }

    if (layanan._count.pengajuan > 0) {
      return {
        success: false,
        error: `Layanan "${layanan.nama}" tidak dapat dihapus karena sudah memiliki ${layanan._count.pengajuan} data permohonan pengajuan masyarakat. Anda dapat menonaktifkan layanan agar tidak tampil bagi publik.`,
      };
    }

    await prisma.layanan.delete({
      where: { id },
    });

    revalidatePath("/admin/layanan");
    revalidatePath("/");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Gagal menghapus layanan:", error);
    return {
      success: false,
      error: "Gagal menghapus layanan dari database.",
    };
  }
}

export interface LandingServiceItem {
  id: string;
  kode: string;
  title: string;
  description: string;
  iconName: "HelpCircle" | "FlaskConical" | "ShieldAlert" | "FileText";
  image: string;
  href: string;
  actionText: string;
}

const SERVICE_META_MAP: Record<
  string,
  {
    iconName: "HelpCircle" | "FlaskConical" | "ShieldAlert" | "FileText";
    image: string;
    href: string;
    actionText: string;
  }
> = {
  INFO: {
    iconName: "HelpCircle",
    image: "/assets-landingpage/layanan/1.jpg",
    href: "/permintaan-informasi",
    actionText: "Akses Layanan",
  },
  UJI_CEPAT: {
    iconName: "FlaskConical",
    image: "/assets-landingpage/layanan/2.jpg",
    href: "/pengujian-cepat",
    actionText: "Uji Sekarang",
  },
  ADUAN: {
    iconName: "ShieldAlert",
    image: "/assets-landingpage/layanan/3.jpg",
    href: "/pengaduan",
    actionText: "Buat Pengaduan",
  },
  KIP: {
    iconName: "FileText",
    image: "/assets-landingpage/layanan/4.jpg",
    href: "/keterbukaan-informasi",
    actionText: "Lihat Dokumen",
  },
};

const DEFAULT_LANDING_SERVICES: LandingServiceItem[] = [
  {
    id: "permintaan-informasi",
    kode: "INFO",
    title: "Permintaan Informasi",
    description:
      "Layanan konsultasi regulasi, perizinan edar, dan sertifikasi obat & makanan untuk masyarakat dan UMKM.",
    iconName: "HelpCircle",
    image: "/assets-landingpage/layanan/1.jpg",
    href: "/permintaan-informasi",
    actionText: "Akses Layanan",
  },
  {
    id: "pengujian-cepat",
    kode: "UJI_CEPAT",
    title: "Pengujian Cepat AMPERA",
    description:
      "Inovasi uji laboratorium cepat untuk mendeteksi bahan kimia berbahaya pada sampel pangan dan farmasi.",
    iconName: "FlaskConical",
    image: "/assets-landingpage/layanan/2.jpg",
    href: "/pengujian-cepat",
    actionText: "Uji Sekarang",
  },
  {
    id: "pengaduan",
    kode: "ADUAN",
    title: "Layanan Pengaduan",
    description:
      "Kanal resmi pelaporan dugaan peredaran obat dan makanan ilegal, palsu, rusak, atau kedaluwarsa.",
    iconName: "ShieldAlert",
    image: "/assets-landingpage/layanan/3.jpg",
    href: "/pengaduan",
    actionText: "Buat Pengaduan",
  },
  {
    id: "ppid",
    kode: "KIP",
    title: "Keterbukaan Informasi",
    description:
      "Akses transparan terhadap dokumen resmi publik, SOP pengawasan, anggaran, dan laporan kinerja PPID.",
    iconName: "FileText",
    image: "/assets-landingpage/layanan/4.jpg",
    href: "/keterbukaan-informasi",
    actionText: "Lihat Dokumen",
  },
];

/**
 * Mengambil data layanan yang aktif untuk ditampilkan pada ServicesSection beranda publik.
 */
export async function getLandingServicesData(): Promise<LandingServiceItem[]> {
  try {
    const list = await prisma.layanan.findMany({
      where: { isAktif: true },
      orderBy: { id: "asc" },
    });

    if (list.length === 0) {
      return DEFAULT_LANDING_SERVICES;
    }

    return list.map((item) => {
      const meta = SERVICE_META_MAP[item.kode] || {
        iconName: "HelpCircle" as const,
        image: "/assets-landingpage/layanan/1.jpg",
        href: `/${item.kode.toLowerCase().replace(/_/g, "-")}`,
        actionText: "Akses Layanan",
      };

      return {
        id: item.kode.toLowerCase().replace(/_/g, "-"),
        kode: item.kode,
        title: item.nama,
        description: item.deskripsi || "",
        iconName: meta.iconName,
        image: meta.image,
        href: meta.href,
        actionText: meta.actionText,
      };
    });
  } catch (err) {
    console.error("Gagal mengambil data layanan landing page:", err);
    return DEFAULT_LANDING_SERVICES;
  }
}


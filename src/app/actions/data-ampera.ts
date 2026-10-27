"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type StatusPengajuan = "MENUNGGU_VERIFIKASI" | "DIPROSES" | "SELESAI" | "DITOLAK";

export interface PengajuanItem {
  id: number;
  kodePengajuan: string;
  status: StatusPengajuan;
  catatanPetugas: string | null;
  createdAt: Date;
  updatedAt: Date;

  // Layanan relation
  layanan: {
    id: number;
    kode: string;
    nama: string;
  };

  // Tamu relation
  tamu: {
    id: number;
    nik: string;
    nama: string;
    email: string | null;
    telepon: string | null;
    alamat: string | null;
    asalInstansi: string | null;
    umur: number | null;
  };

  // Service-specific fields
  informasiDibutuhkan: string | null;
  kategoriInformasi: string | null;

  produkDicurigai: string | null;
  produkLainnya: string | null;
  alasanKecurigaan: string | null;
  alasanLainnya: string | null;
  rincianProduk: string | null;

  isiPengaduan: string | null;
  buktiFotoUrl: string | null;
  ktpUrl: string | null;
  dokumenPendukungUrl: string | null;

  rincianInformasiKip: string | null;
  tujuanPenggunaanKip: string | null;
}

export interface PenggunaItem {
  id: number;
  nik: string;
  nama: string;
  email: string | null;
  telepon: string | null;
  alamat: string | null;
  asalInstansi: string | null;
  umur: number | null;
  createdAt: Date;
  updatedAt: Date;
  totalPengajuan: number;
  pengajuan: Array<{
    id: number;
    kodePengajuan: string;
    status: StatusPengajuan;
    layananNama: string;
    createdAt: Date;
  }>;
}

export interface DataAmperaStats {
  totalPengajuan: number;
  menungguVerifikasi: number;
  sedangDiproses: number;
  selesai: number;
  ditolak: number;
  totalPengguna: number;
}

export interface DataAmperaOverviewResponse {
  pengajuanList: PengajuanItem[];
  penggunaList: PenggunaItem[];
  stats: DataAmperaStats;
}

/**
 * Mengambil seluruh data pengajuan layanan dan data pengguna (tamu) yang pernah mengisi formulir Ampera
 */
export async function getDataAmperaOverview(): Promise<DataAmperaOverviewResponse> {
  try {
    const [rawPengajuan, rawTamu] = await Promise.all([
      prisma.pengajuanLayanan.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          tamu: true,
          layanan: true,
        },
      }),
      prisma.tamu.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          pengajuan: {
            orderBy: { createdAt: "desc" },
            include: {
              layanan: true,
            },
          },
        },
      }),
    ]);

    const pengajuanList: PengajuanItem[] = rawPengajuan.map((p) => ({
      id: p.id,
      kodePengajuan: p.kodePengajuan,
      status: p.status as StatusPengajuan,
      catatanPetugas: p.catatanPetugas,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      layanan: {
        id: p.layanan.id,
        kode: p.layanan.kode,
        nama: p.layanan.nama,
      },
      tamu: {
        id: p.tamu.id,
        nik: p.tamu.nik,
        nama: p.tamu.nama,
        email: p.tamu.email,
        telepon: p.tamu.telepon,
        alamat: p.tamu.alamat,
        asalInstansi: p.tamu.asalInstansi,
        umur: p.tamu.umur,
      },
      informasiDibutuhkan: p.informasiDibutuhkan,
      kategoriInformasi: p.kategoriInformasi,
      produkDicurigai: p.produkDicurigai,
      produkLainnya: p.produkLainnya,
      alasanKecurigaan: p.alasanKecurigaan,
      alasanLainnya: p.alasanLainnya,
      rincianProduk: p.rincianProduk,
      isiPengaduan: p.isiPengaduan,
      buktiFotoUrl: p.buktiFotoUrl,
      ktpUrl: p.ktpUrl,
      dokumenPendukungUrl: p.dokumenPendukungUrl,
      rincianInformasiKip: p.rincianInformasiKip,
      tujuanPenggunaanKip: p.tujuanPenggunaanKip,
    }));

    const penggunaList: PenggunaItem[] = rawTamu.map((t) => ({
      id: t.id,
      nik: t.nik,
      nama: t.nama,
      email: t.email,
      telepon: t.telepon,
      alamat: t.alamat,
      asalInstansi: t.asalInstansi,
      umur: t.umur,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
      totalPengajuan: t.pengajuan.length,
      pengajuan: t.pengajuan.map((p) => ({
        id: p.id,
        kodePengajuan: p.kodePengajuan,
        status: p.status as StatusPengajuan,
        layananNama: p.layanan.nama,
        createdAt: p.createdAt,
      })),
    }));

    // Agregat Statistik
    const totalPengajuan = pengajuanList.length;
    let menungguVerifikasi = 0;
    let sedangDiproses = 0;
    let selesai = 0;
    let ditolak = 0;

    for (const p of pengajuanList) {
      if (p.status === "MENUNGGU_VERIFIKASI") menungguVerifikasi++;
      else if (p.status === "DIPROSES") sedangDiproses++;
      else if (p.status === "SELESAI") selesai++;
      else if (p.status === "DITOLAK") ditolak++;
    }

    const stats: DataAmperaStats = {
      totalPengajuan,
      menungguVerifikasi,
      sedangDiproses,
      selesai,
      ditolak,
      totalPengguna: penggunaList.length,
    };

    return {
      pengajuanList,
      penggunaList,
      stats,
    };
  } catch (err) {
    console.error("[getDataAmperaOverview Error]", err);
    return {
      pengajuanList: [],
      penggunaList: [],
      stats: {
        totalPengajuan: 0,
        menungguVerifikasi: 0,
        sedangDiproses: 0,
        selesai: 0,
        ditolak: 0,
        totalPengguna: 0,
      },
    };
  }
}

/**
 * Memperbarui status verifikasi pengajuan layanan dan catatan/tanggapan dari petugas
 */
export async function updatePengajuanStatusAction(
  id: number,
  status: StatusPengajuan,
  catatanPetugas?: string
): Promise<{ success: boolean; message: string }> {
  try {
    const existing = await prisma.pengajuanLayanan.findUnique({
      where: { id },
    });

    if (!existing) {
      return { success: false, message: "Data pengajuan tidak ditemukan." };
    }

    await prisma.pengajuanLayanan.update({
      where: { id },
      data: {
        status,
        catatanPetugas: catatanPetugas !== undefined ? catatanPetugas : existing.catatanPetugas,
      },
    });

    try {
      revalidatePath("/admin");
      revalidatePath("/admin/data-ampera");
      revalidatePath("/admin/laporan/informasi");
      revalidatePath("/admin/laporan/pengujian-cepat");
      revalidatePath("/admin/laporan/pengaduan");
      revalidatePath("/admin/laporan/kip");
    } catch {
      // Ignore if called outside Next.js request context
    }

    return {
      success: true,
      message: `Status pengajuan #${existing.kodePengajuan} berhasil diperbarui menjadi ${status.replace("_", " ")}.`,
    };
  } catch (err: any) {
    console.error("[updatePengajuanStatusAction Error]", err);
    return {
      success: false,
      message: err.message || "Gagal memperbarui status pengajuan layanan.",
    };
  }
}

/**
 * Menghapus data pengajuan layanan (jika data testing atau salah input)
 */
export async function deletePengajuanAction(
  id: number
): Promise<{ success: boolean; message: string }> {
  try {
    const deleted = await prisma.pengajuanLayanan.delete({
      where: { id },
    });

    try {
      revalidatePath("/admin");
      revalidatePath("/admin/data-ampera");
      revalidatePath("/admin/laporan/informasi");
      revalidatePath("/admin/laporan/pengujian-cepat");
      revalidatePath("/admin/laporan/pengaduan");
      revalidatePath("/admin/laporan/kip");
    } catch {
      // Ignore if called outside Next.js request context
    }

    return {
      success: true,
      message: `Pengajuan #${deleted.kodePengajuan} berhasil dihapus dari sistem.`,
    };
  } catch (err: any) {
    console.error("[deletePengajuanAction Error]", err);
    return {
      success: false,
      message: err.message || "Gagal menghapus pengajuan layanan.",
    };
  }
}

export interface ServiceLaporanResponse {
  layanan: {
    id: number;
    kode: string;
    nama: string;
    deskripsi: string | null;
  } | null;
  pengajuanList: PengajuanItem[];
  penggunaList: PenggunaItem[];
  stats: DataAmperaStats;
}

/**
 * Mengambil data pengajuan dan pengguna khusus untuk 1 layanan tertentu
 */
export async function getServiceLaporanData(
  serviceCode: "INFO" | "UJI_CEPAT" | "ADUAN" | "KIP"
): Promise<ServiceLaporanResponse> {
  try {
    const layanan = await prisma.layanan.findUnique({
      where: { kode: serviceCode },
    });

    const rawPengajuan = await prisma.pengajuanLayanan.findMany({
      where: {
        layanan: { kode: serviceCode },
      },
      orderBy: { createdAt: "desc" },
      include: {
        tamu: true,
        layanan: true,
      },
    });

    const pengajuanList: PengajuanItem[] = rawPengajuan.map((p) => ({
      id: p.id,
      kodePengajuan: p.kodePengajuan,
      status: p.status as StatusPengajuan,
      catatanPetugas: p.catatanPetugas,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      layanan: {
        id: p.layanan.id,
        kode: p.layanan.kode,
        nama: p.layanan.nama,
      },
      tamu: {
        id: p.tamu.id,
        nik: p.tamu.nik,
        nama: p.tamu.nama,
        email: p.tamu.email,
        telepon: p.tamu.telepon,
        alamat: p.tamu.alamat,
        asalInstansi: p.tamu.asalInstansi,
        umur: p.tamu.umur,
      },
      informasiDibutuhkan: p.informasiDibutuhkan,
      kategoriInformasi: p.kategoriInformasi,
      produkDicurigai: p.produkDicurigai,
      produkLainnya: p.produkLainnya,
      alasanKecurigaan: p.alasanKecurigaan,
      alasanLainnya: p.alasanLainnya,
      rincianProduk: p.rincianProduk,
      isiPengaduan: p.isiPengaduan,
      buktiFotoUrl: p.buktiFotoUrl,
      ktpUrl: p.ktpUrl,
      dokumenPendukungUrl: p.dokumenPendukungUrl,
      rincianInformasiKip: p.rincianInformasiKip,
      tujuanPenggunaanKip: p.tujuanPenggunaanKip,
    }));

    // Kumpulkan pengguna unik yang mengajukan layanan ini
    const tamuMap = new Map<number, PenggunaItem>();
    for (const p of rawPengajuan) {
      if (!tamuMap.has(p.tamu.id)) {
        tamuMap.set(p.tamu.id, {
          id: p.tamu.id,
          nik: p.tamu.nik,
          nama: p.tamu.nama,
          email: p.tamu.email,
          telepon: p.tamu.telepon,
          alamat: p.tamu.alamat,
          asalInstansi: p.tamu.asalInstansi,
          umur: p.tamu.umur,
          createdAt: p.tamu.createdAt,
          updatedAt: p.tamu.updatedAt,
          totalPengajuan: 0,
          pengajuan: [],
        });
      }
      const existing = tamuMap.get(p.tamu.id)!;
      existing.totalPengajuan++;
      existing.pengajuan.push({
        id: p.id,
        kodePengajuan: p.kodePengajuan,
        status: p.status as StatusPengajuan,
        layananNama: p.layanan.nama,
        createdAt: p.createdAt,
      });
    }

    const penggunaList = Array.from(tamuMap.values());

    const totalPengajuan = pengajuanList.length;
    let menungguVerifikasi = 0;
    let sedangDiproses = 0;
    let selesai = 0;
    let ditolak = 0;

    for (const p of pengajuanList) {
      if (p.status === "MENUNGGU_VERIFIKASI") menungguVerifikasi++;
      else if (p.status === "DIPROSES") sedangDiproses++;
      else if (p.status === "SELESAI") selesai++;
      else if (p.status === "DITOLAK") ditolak++;
    }

    const stats: DataAmperaStats = {
      totalPengajuan,
      menungguVerifikasi,
      sedangDiproses,
      selesai,
      ditolak,
      totalPengguna: penggunaList.length,
    };

    return {
      layanan: layanan
        ? {
            id: layanan.id,
            kode: layanan.kode,
            nama: layanan.nama,
            deskripsi: layanan.deskripsi,
          }
        : null,
      pengajuanList,
      penggunaList,
      stats,
    };
  } catch (err) {
    console.error("[getServiceLaporanData Error]", err);
    return {
      layanan: null,
      pengajuanList: [],
      penggunaList: [],
      stats: {
        totalPengajuan: 0,
        menungguVerifikasi: 0,
        sedangDiproses: 0,
        selesai: 0,
        ditolak: 0,
        totalPengguna: 0,
      },
    };
  }
}


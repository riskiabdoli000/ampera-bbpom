"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { uploadFileOrDocument, deleteImage } from "@/lib/storage";
import {
  triggerPengajuanStatusUpdatedNotification,
  sendRawWhatsAppMessage,
} from "@/lib/whatsapp";

export type StatusPengajuan = "MENUNGGU_VERIFIKASI" | "DIPROSES" | "SELESAI" | "DITOLAK";

export interface LampiranTindakanItem {
  id: number;
  pengajuanId: number;
  url: string;
  storagePath: string;
  namaFile: string;
  tipeFile: string;
  ukuranFile: number | null;
  createdAt: Date;
}

export interface NotifikasiWaItem {
  id: number;
  pengajuanId: number | null;
  tipePenerima: "TAMU" | "PETUGAS";
  nomorTujuan: string;
  namaPenerima: string;
  pesan: string;
  status: "TERKIRIM" | "GAGAL" | "MENUNGGU";
  responGateway: string | null;
  dikirimPada: Date;
  createdAt: Date;
}

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

  // Bukti Lampiran Tindakan Petugas BBPOM
  lampiranTindakan: LampiranTindakanItem[];

  // Riwayat Pengiriman Notifikasi WhatsApp
  notifikasiWa: NotifikasiWaItem[];
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
          lampiranTindakan: {
            orderBy: { createdAt: "asc" },
          },
          notifikasiWa: {
            orderBy: { createdAt: "desc" },
          },
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
      lampiranTindakan: (p.lampiranTindakan || []).map((l: any) => ({
        id: l.id,
        pengajuanId: l.pengajuanId,
        url: l.url,
        storagePath: l.storagePath,
        namaFile: l.namaFile,
        tipeFile: l.tipeFile,
        ukuranFile: l.ukuranFile,
        createdAt: l.createdAt,
      })),
      notifikasiWa: (p.notifikasiWa || []).map((n: any) => ({
        id: n.id,
        pengajuanId: n.pengajuanId,
        tipePenerima: n.tipePenerima,
        nomorTujuan: n.nomorTujuan,
        namaPenerima: n.namaPenerima,
        pesan: n.pesan,
        status: n.status,
        responGateway: n.responGateway,
        dikirimPada: n.dikirimPada,
        createdAt: n.createdAt,
      })),
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
 * Memperbarui status verifikasi pengajuan layanan secara cepat dari tabel admin.
 * Safeguard: Jika status diubah menjadi SELESAI, sistem memvalidasi bahwa pengajuan
 * sudah memiliki minimal 2 berkas bukti lampiran tindakan petugas.
 */
export async function updatePengajuanStatusAction(
  id: number,
  status: StatusPengajuan,
  catatanPetugas?: string
): Promise<{ success: boolean; message: string }> {
  try {
    const existing = await prisma.pengajuanLayanan.findUnique({
      where: { id },
      include: {
        lampiranTindakan: true,
      },
    });

    if (!existing) {
      return { success: false, message: "Data pengajuan tidak ditemukan." };
    }

    if (status === "SELESAI" && existing.lampiranTindakan.length < 2) {
      return {
        success: false,
        message: `Pengajuan belum dapat diselesaikan. Petugas wajib melampirkan minimal 2 bukti lampiran tindakan (saat ini ${existing.lampiranTindakan.length} berkas). Silakan buka modal detail untuk mengunggah bukti lampiran.`,
      };
    }

    await prisma.pengajuanLayanan.update({
      where: { id },
      data: {
        status,
        catatanPetugas: catatanPetugas !== undefined ? catatanPetugas : existing.catatanPetugas,
      },
    });

    // Memicu notifikasi WhatsApp update status ke Tamu
    if (status !== "MENUNGGU_VERIFIKASI") {
      triggerPengajuanStatusUpdatedNotification(id).catch((err) => {
        console.error("[WA Notif Background Error] Status Update:", err);
      });
    }

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
 * Memperbarui tindakan petugas BBPOM lengkap beserta Bukti Lampiran (Minimal 2 lampiran, dinamis).
 * Menerima FormData yang memuat status, catatanPetugas, deletedLampiranIds (JSON), dan lampiranFiles.
 */
export async function updatePengajuanTindakanWithLampiranAction(
  formData: FormData
): Promise<{
  success: boolean;
  message: string;
  updatedPengajuan?: PengajuanItem;
}> {
  try {
    const rawId = formData.get("id");
    const id = typeof rawId === "string" ? parseInt(rawId, 10) : Number(rawId);
    if (!id || isNaN(id)) {
      return { success: false, message: "ID pengajuan tidak valid." };
    }

    const status = (formData.get("status") as StatusPengajuan) || "MENUNGGU_VERIFIKASI";
    const catatanPetugas = (formData.get("catatanPetugas") as string) || "";

    const rawDeletedIds = formData.get("deletedLampiranIds");
    let deletedLampiranIds: number[] = [];
    if (typeof rawDeletedIds === "string" && rawDeletedIds.trim()) {
      try {
        deletedLampiranIds = JSON.parse(rawDeletedIds);
      } catch {
        deletedLampiranIds = [];
      }
    }

    const rawFiles = formData.getAll("lampiranFiles");
    const validNewFiles = rawFiles.filter(
      (f): f is File => f instanceof File && f.size > 0
    );

    const existingPengajuan = await prisma.pengajuanLayanan.findUnique({
      where: { id },
      include: {
        tamu: true,
        layanan: true,
        lampiranTindakan: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!existingPengajuan) {
      return { success: false, message: "Data pengajuan tidak ditemukan." };
    }

    // Hitung sisa lampiran lama yang tidak dihapus
    const remainingExisting = existingPengajuan.lampiranTindakan.filter(
      (l) => !deletedLampiranIds.includes(l.id)
    );

    const totalFinalLampiran = remainingExisting.length + validNewFiles.length;

    // VALIDASI: Minimal 2 lampiran bukti jika petugas menyimpan tindakan (status DIPROSES, SELESAI, atau ada catatan)
    const isUnderAction =
      status === "DIPROSES" ||
      status === "SELESAI" ||
      catatanPetugas.trim().length > 0 ||
      validNewFiles.length > 0 ||
      existingPengajuan.lampiranTindakan.length > 0;

    if (isUnderAction && totalFinalLampiran < 2) {
      return {
        success: false,
        message: `Bukti lampiran tindakan petugas minimal 2 berkas (saat ini baru ${totalFinalLampiran} berkas). Silakan lampirkan minimal 2 berkas bukti sebelum menyimpan.`,
      };
    }

    // 1. Hapus berkas lama yang ditandai untuk dihapus
    if (deletedLampiranIds.length > 0) {
      const itemsToDelete = existingPengajuan.lampiranTindakan.filter((l) =>
        deletedLampiranIds.includes(l.id)
      );

      for (const item of itemsToDelete) {
        try {
          await deleteImage(item.storagePath || item.url);
        } catch (delErr) {
          console.warn("[deleteImage error]", delErr);
        }
        await prisma.lampiranTindakanPetugas.delete({
          where: { id: item.id },
        });
      }
    }

    // 2. Upload berkas bukti lampiran baru (kompresi gambar ke target ~100KB, simpan dokumen PDF utuh)
    const newRecords: Array<{
      url: string;
      storagePath: string;
      namaFile: string;
      tipeFile: string;
      ukuranFile: number;
    }> = [];

    for (const file of validNewFiles) {
      if (file.size > 10 * 1024 * 1024) {
        return {
          success: false,
          message: `Berkas "${file.name}" melebihi batas ukuran maksimal 10MB.`,
        };
      }

      const isAllowed =
        file.type === "application/pdf" ||
        file.type.startsWith("image/") ||
        /\.(jpe?g|png|webp|pdf)$/i.test(file.name);

      if (!isAllowed) {
        return {
          success: false,
          message: `Format berkas "${file.name}" tidak didukung. Harap unggah gambar (JPG, PNG, WebP) atau PDF.`,
        };
      }

      const uploadRes = await uploadFileOrDocument(file, "tindakan", 100);
      newRecords.push({
        url: uploadRes.url,
        storagePath: uploadRes.path,
        namaFile: file.name,
        tipeFile:
          file.type ||
          (file.name.toLowerCase().endsWith(".pdf") ? "application/pdf" : "image/jpeg"),
        ukuranFile: uploadRes.compressedSize || file.size,
      });
    }

    if (newRecords.length > 0) {
      await prisma.lampiranTindakanPetugas.createMany({
        data: newRecords.map((r) => ({
          pengajuanId: id,
          url: r.url,
          storagePath: r.storagePath,
          namaFile: r.namaFile,
          tipeFile: r.tipeFile,
          ukuranFile: r.ukuranFile,
        })),
      });
    }

    // 3. Update status dan catatan petugas
    await prisma.pengajuanLayanan.update({
      where: { id },
      data: {
        status,
        catatanPetugas: catatanPetugas.trim() || null,
      },
    });

    // Memicu notifikasi WhatsApp update status ke Tamu
    if (status !== "MENUNGGU_VERIFIKASI") {
      triggerPengajuanStatusUpdatedNotification(id).catch((err) => {
        console.error("[WA Notif Background Error] Status Update With Files:", err);
      });
    }

    // 4. Query ulang data terupdate dengan seluruh relasi
    const updated = await prisma.pengajuanLayanan.findUnique({
      where: { id },
      include: {
        tamu: true,
        layanan: true,
        lampiranTindakan: {
          orderBy: { createdAt: "asc" },
        },
        notifikasiWa: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!updated) {
      return { success: false, message: "Gagal mengambil data pengajuan yang diperbarui." };
    }

    const updatedPengajuan: PengajuanItem = {
      id: updated.id,
      kodePengajuan: updated.kodePengajuan,
      status: updated.status as StatusPengajuan,
      catatanPetugas: updated.catatanPetugas,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
      layanan: {
        id: updated.layanan.id,
        kode: updated.layanan.kode,
        nama: updated.layanan.nama,
      },
      tamu: {
        id: updated.tamu.id,
        nik: updated.tamu.nik,
        nama: updated.tamu.nama,
        email: updated.tamu.email,
        telepon: updated.tamu.telepon,
        alamat: updated.tamu.alamat,
        asalInstansi: updated.tamu.asalInstansi,
        umur: updated.tamu.umur,
      },
      informasiDibutuhkan: updated.informasiDibutuhkan,
      kategoriInformasi: updated.kategoriInformasi,
      produkDicurigai: updated.produkDicurigai,
      produkLainnya: updated.produkLainnya,
      alasanKecurigaan: updated.alasanKecurigaan,
      alasanLainnya: updated.alasanLainnya,
      rincianProduk: updated.rincianProduk,
      isiPengaduan: updated.isiPengaduan,
      buktiFotoUrl: updated.buktiFotoUrl,
      ktpUrl: updated.ktpUrl,
      dokumenPendukungUrl: updated.dokumenPendukungUrl,
      rincianInformasiKip: updated.rincianInformasiKip,
      tujuanPenggunaanKip: updated.tujuanPenggunaanKip,
      lampiranTindakan: (updated.lampiranTindakan || []).map((l: any) => ({
        id: l.id,
        pengajuanId: l.pengajuanId,
        url: l.url,
        storagePath: l.storagePath,
        namaFile: l.namaFile,
        tipeFile: l.tipeFile,
        ukuranFile: l.ukuranFile,
        createdAt: l.createdAt,
      })),
      notifikasiWa: (updated.notifikasiWa || []).map((n: any) => ({
        id: n.id,
        pengajuanId: n.pengajuanId,
        tipePenerima: n.tipePenerima,
        nomorTujuan: n.nomorTujuan,
        namaPenerima: n.namaPenerima,
        pesan: n.pesan,
        status: n.status,
        responGateway: n.responGateway,
        dikirimPada: n.dikirimPada,
        createdAt: n.createdAt,
      })),
    };

    try {
      revalidatePath("/admin");
      revalidatePath("/admin/data-ampera");
      revalidatePath("/admin/laporan/informasi");
      revalidatePath("/admin/laporan/pengujian-cepat");
      revalidatePath("/admin/laporan/pengaduan");
      revalidatePath("/admin/laporan/kip");
    } catch {
      // Ignore outside request context
    }

    return {
      success: true,
      message: `Tindakan petugas #${updated.kodePengajuan} berhasil disimpan (${totalFinalLampiran} bukti lampiran).`,
      updatedPengajuan,
    };
  } catch (err: any) {
    console.error("[updatePengajuanTindakanWithLampiranAction Error]", err);
    return {
      success: false,
      message: err.message || "Gagal memperbarui tindakan dan bukti lampiran petugas.",
    };
  }
}

/**
 * Menghapus data pengajuan layanan beserta berkas fisiknya di storage
 */
export async function deletePengajuanAction(
  id: number
): Promise<{ success: boolean; message: string }> {
  try {
    const existing = await prisma.pengajuanLayanan.findUnique({
      where: { id },
      include: {
        lampiranTindakan: true,
      },
    });

    if (existing) {
      for (const l of existing.lampiranTindakan) {
        await deleteImage(l.storagePath || l.url).catch(() => {});
      }
      if (existing.buktiFotoUrl) await deleteImage(existing.buktiFotoUrl).catch(() => {});
      if (existing.ktpUrl) await deleteImage(existing.ktpUrl).catch(() => {});
      if (existing.dokumenPendukungUrl) await deleteImage(existing.dokumenPendukungUrl).catch(() => {});
    }

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
        lampiranTindakan: {
          orderBy: { createdAt: "asc" },
        },
        notifikasiWa: {
          orderBy: { createdAt: "desc" },
        },
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
      lampiranTindakan: (p.lampiranTindakan || []).map((l: any) => ({
        id: l.id,
        pengajuanId: l.pengajuanId,
        url: l.url,
        storagePath: l.storagePath,
        namaFile: l.namaFile,
        tipeFile: l.tipeFile,
        ukuranFile: l.ukuranFile,
        createdAt: l.createdAt,
      })),
      notifikasiWa: (p.notifikasiWa || []).map((n: any) => ({
        id: n.id,
        pengajuanId: n.pengajuanId,
        tipePenerima: n.tipePenerima,
        nomorTujuan: n.nomorTujuan,
        namaPenerima: n.namaPenerima,
        pesan: n.pesan,
        status: n.status,
        responGateway: n.responGateway,
        dikirimPada: n.dikirimPada,
        createdAt: n.createdAt,
      })),
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

/**
 * Mengirim ulang pesan notifikasi WhatsApp dari log tertentu
 */
export async function resendPengajuanWaNotificationAction(
  logId: number
): Promise<{ success: boolean; message: string }> {
  try {
    const log = await prisma.notifikasiWaLog.findUnique({
      where: { id: logId },
    });

    if (!log) {
      return { success: false, message: "Catatan log notifikasi WhatsApp tidak ditemukan." };
    }

    const sendResult = await sendRawWhatsAppMessage(log.nomorTujuan, log.pesan);

    await prisma.notifikasiWaLog.update({
      where: { id: logId },
      data: {
        status: sendResult.success ? "TERKIRIM" : "GAGAL",
        responGateway: sendResult.error || (sendResult.data ? JSON.stringify(sendResult.data) : "Pesan dikirim ulang"),
        dikirimPada: new Date(),
      },
    });

    if (sendResult.success) {
      return {
        success: true,
        message: `Pesan WhatsApp berhasil dikirim ulang ke ${log.namaPenerima} (${log.nomorTujuan}).`,
      };
    } else {
      return {
        success: false,
        message: `Gagal mengirim ulang WhatsApp: ${sendResult.error || "Gateway tidak merespon"}`,
      };
    }
  } catch (err: any) {
    console.error("[resendPengajuanWaNotificationAction Error]", err);
    return {
      success: false,
      message: err.message || "Terjadi kesalahan sistem saat mengirim ulang pesan WhatsApp.",
    };
  }
}

/**
 * Memicu pengiriman manual notifikasi status terkini ke WhatsApp Pemohon
 */
export async function sendManualPengajuanWaNotificationAction(
  pengajuanId: number
): Promise<{ success: boolean; message: string }> {
  try {
    const pengajuan = await prisma.pengajuanLayanan.findUnique({
      where: { id: pengajuanId },
      include: {
        tamu: true,
        layanan: true,
      },
    });

    if (!pengajuan) {
      return { success: false, message: "Data pengajuan tidak ditemukan." };
    }

    if (!pengajuan.tamu.telepon) {
      return { success: false, message: "Pemohon tidak memiliki nomor WhatsApp yang tercatat." };
    }

    await triggerPengajuanStatusUpdatedNotification(pengajuanId);

    return {
      success: true,
      message: `Notifikasi status terkini berhasil dikirimkan ke WhatsApp pemohon (${pengajuan.tamu.telepon}).`,
    };
  } catch (err: any) {
    console.error("[sendManualPengajuanWaNotificationAction Error]", err);
    return {
      success: false,
      message: err.message || "Gagal memproses pengiriman notifikasi WhatsApp.",
    };
  }
}


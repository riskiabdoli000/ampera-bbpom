"use server";

import { prisma } from "@/lib/prisma";
import { triggerPengajuanCreatedNotifications } from "@/lib/whatsapp";

export interface PermintaanInformasiFormState {
  nik: string;
  nama: string;
  umur: string;
  email: string;
  alamatAsalInstansi: string;
  informasiDibutuhkan: string;
  telepon?: string;
  kategoriInformasi?: string;
}

export interface PermintaanInformasiResponse {
  success: boolean;
  message: string;
  kodePengajuan: string;
  data: PermintaanInformasiFormState & {
    tanggalPengajuan: string;
    estimasiPenyelesaian: string;
    status: string;
  };
}

export async function submitPermintaanInformasiAction(
  formData: PermintaanInformasiFormState
): Promise<PermintaanInformasiResponse> {
  const cleanNik = formData.nik?.trim() || "";
  const cleanNama = formData.nama?.trim() || "";
  const cleanUmur = formData.umur?.trim() || "";
  const cleanEmail = formData.email?.trim() || "";
  const cleanAlamatInstansi = formData.alamatAsalInstansi?.trim() || "";
  const cleanInformasi = formData.informasiDibutuhkan?.trim() || "";
  const cleanTelepon = formData.telepon?.trim() || "";
  const cleanKategori = formData.kategoriInformasi?.trim() || "Konsultasi / Regulasi Umum";

  // 1. Validasi Input Dasar Sesuai Syarat Formulir
  if (!cleanNik) {
    return {
      success: false,
      message: "NIK (Nomor Induk Kependudukan) wajib diisi.",
      kodePengajuan: "",
      data: {
        ...formData,
        tanggalPengajuan: new Date().toISOString(),
        estimasiPenyelesaian: "1 - 3 Hari Kerja",
        status: "MENUNGGU_VERIFIKASI",
      },
    };
  }

  if (cleanNik.replace(/\D/g, "").length < 8) {
    return {
      success: false,
      message: "Format NIK tidak valid (minimal 8 hingga 16 digit).",
      kodePengajuan: "",
      data: {
        ...formData,
        tanggalPengajuan: new Date().toISOString(),
        estimasiPenyelesaian: "1 - 3 Hari Kerja",
        status: "MENUNGGU_VERIFIKASI",
      },
    };
  }

  if (!cleanNama) {
    return {
      success: false,
      message: "Nama lengkap pemohon wajib diisi.",
      kodePengajuan: "",
      data: {
        ...formData,
        tanggalPengajuan: new Date().toISOString(),
        estimasiPenyelesaian: "1 - 3 Hari Kerja",
        status: "MENUNGGU_VERIFIKASI",
      },
    };
  }

  if (!cleanUmur || isNaN(Number(cleanUmur)) || Number(cleanUmur) < 1) {
    return {
      success: false,
      message: "Umur wajib diisi dengan angka yang valid.",
      kodePengajuan: "",
      data: {
        ...formData,
        tanggalPengajuan: new Date().toISOString(),
        estimasiPenyelesaian: "1 - 3 Hari Kerja",
        status: "MENUNGGU_VERIFIKASI",
      },
    };
  }

  if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return {
      success: false,
      message: "Email aktif wajib diisi dengan format yang benar.",
      kodePengajuan: "",
      data: {
        ...formData,
        tanggalPengajuan: new Date().toISOString(),
        estimasiPenyelesaian: "1 - 3 Hari Kerja",
        status: "MENUNGGU_VERIFIKASI",
      },
    };
  }

  if (!cleanTelepon) {
    return {
      success: false,
      message: "Nomor WhatsApp/telepon pemohon wajib diisi.",
      kodePengajuan: "",
      data: {
        ...formData,
        tanggalPengajuan: new Date().toISOString(),
        estimasiPenyelesaian: "1 - 3 Hari Kerja",
        status: "MENUNGGU_VERIFIKASI",
      },
    };
  }

  if (cleanTelepon.replace(/\D/g, "").length < 8) {
    return {
      success: false,
      message: "Nomor WhatsApp/telepon minimal 8 digit angka.",
      kodePengajuan: "",
      data: {
        ...formData,
        tanggalPengajuan: new Date().toISOString(),
        estimasiPenyelesaian: "1 - 3 Hari Kerja",
        status: "MENUNGGU_VERIFIKASI",
      },
    };
  }

  if (!cleanAlamatInstansi) {
    return {
      success: false,
      message: "Alamat domisili atau asal instansi wajib diisi.",
      kodePengajuan: "",
      data: {
        ...formData,
        tanggalPengajuan: new Date().toISOString(),
        estimasiPenyelesaian: "1 - 3 Hari Kerja",
        status: "MENUNGGU_VERIFIKASI",
      },
    };
  }

  if (!cleanInformasi || cleanInformasi.length < 10) {
    return {
      success: false,
      message: "Informasi yang dibutuhkan wajib diisi minimal 10 karakter.",
      kodePengajuan: "",
      data: {
        ...formData,
        tanggalPengajuan: new Date().toISOString(),
        estimasiPenyelesaian: "1 - 3 Hari Kerja",
        status: "MENUNGGU_VERIFIKASI",
      },
    };
  }

  // 2. Generate Kode Pengajuan Unik: Format AMP-INF-YYYYMM-XXXX
  const now = new Date();
  const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const kodePengajuan = `AMP-INF-${yearMonth}-${randomSuffix}`;
  const tanggalFormat = now.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const responseData = {
    ...formData,
    nik: cleanNik,
    nama: cleanNama,
    umur: cleanUmur,
    email: cleanEmail,
    alamatAsalInstansi: cleanAlamatInstansi,
    informasiDibutuhkan: cleanInformasi,
    telepon: cleanTelepon,
    kategoriInformasi: cleanKategori,
    tanggalPengajuan: tanggalFormat,
    estimasiPenyelesaian: "1 - 3 Hari Kerja",
    status: "MENUNGGU_VERIFIKASI",
  };

  // 3. Simpan ke Database Prisma dengan Fallback Resilient
  try {
    // Cari layanan INFO
    let layanan = await prisma.layanan.findUnique({
      where: { kode: "INFO" },
    });

    if (!layanan) {
      layanan = await prisma.layanan.create({
        data: {
          kode: "INFO",
          nama: "Layanan Permintaan Informasi",
          deskripsi:
            "Layanan konsultasi regulasi, perizinan edar, dan sertifikasi obat & makanan untuk masyarakat dan UMKM.",
          isAktif: true,
        },
      });
    }

    const parsedUmur = parseInt(cleanUmur, 10) || null;

    // Cari atau update / buat Tamu berdasarkan NIK
    let tamu = await prisma.tamu.findUnique({
      where: { nik: cleanNik },
    });

    if (!tamu) {
      tamu = await prisma.tamu.create({
        data: {
          nik: cleanNik,
          nama: cleanNama,
          email: cleanEmail,
          umur: parsedUmur,
          alamat: cleanAlamatInstansi,
          asalInstansi: cleanAlamatInstansi,
          telepon: cleanTelepon || null,
        },
      });
    } else {
      tamu = await prisma.tamu.update({
        where: { id: tamu.id },
        data: {
          nama: cleanNama,
          email: cleanEmail,
          umur: parsedUmur || tamu.umur,
          alamat: cleanAlamatInstansi,
          asalInstansi: cleanAlamatInstansi,
          telepon: cleanTelepon || tamu.telepon,
        },
      });
    }

    // Buat PengajuanLayanan
    const pengajuan = await prisma.pengajuanLayanan.create({
      data: {
        kodePengajuan,
        tamuId: tamu.id,
        layananId: layanan.id,
        informasiDibutuhkan: cleanInformasi,
        kategoriInformasi: cleanKategori,
        status: "MENUNGGU_VERIFIKASI",
      },
    });

    // Memicu notifikasi WhatsApp ke Tamu & Petugas (asinkron non-blocking)
    triggerPengajuanCreatedNotifications(pengajuan.id).catch((err) => {
      console.error("[WA Notif Background Error] Permintaan Informasi:", err);
    });

    return {
      success: true,
      message: "Permintaan informasi Anda berhasil dicatat dalam sistem resmi BBPOM Palembang.",
      kodePengajuan,
      data: responseData,
    };
  } catch (error) {
    console.error("[Permintaan Informasi Action] Database error:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? `Gagal menyimpan data ke sistem database: ${error.message}`
          : "Terjadi gangguan sistem saat menyimpan permohonan.",
      kodePengajuan: "",
      data: responseData,
    };
  }
}

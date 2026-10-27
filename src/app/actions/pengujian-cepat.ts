"use server";

import { prisma } from "@/lib/prisma";

export interface PengujianCepatFormState {
  nik: string;
  nama: string;
  email: string;
  alamat: string;
  telepon: string;
  produkDicurigai: string;
  alasanKecurigaan: string;
  rincianProduk: string;
}

export interface PengujianCepatResponse {
  success: boolean;
  message: string;
  kodePengajuan: string;
  data: PengujianCepatFormState & {
    tanggalPengajuan: string;
    estimasiHasil: string;
    status: string;
  };
}

export async function submitPengujianCepatAction(
  formData: PengujianCepatFormState
): Promise<PengujianCepatResponse> {
  const cleanNik = (formData.nik || "").trim().replace(/\D/g, "");
  const cleanNama = (formData.nama || "").trim();
  const cleanTelepon = (formData.telepon || "").trim();
  const cleanEmail = (formData.email || "").trim();
  const cleanAlamat = (formData.alamat || "").trim();
  const cleanProduk = (formData.produkDicurigai || "").trim();
  const cleanAlasan = (formData.alasanKecurigaan || "").trim();
  const cleanRincian = (formData.rincianProduk || "").trim();

  // 1. Validasi Input Dasar
  if (!cleanNik) {
    return {
      success: false,
      message: "Nomor Induk Kependudukan (NIK) pemohon wajib diisi.",
      kodePengajuan: "",
      data: {
        ...formData,
        tanggalPengajuan: new Date().toISOString(),
        estimasiHasil: "15 - 30 Menit",
        status: "MENUNGGU_VERIFIKASI",
      },
    };
  }

  if (cleanNik.length < 8 || cleanNik.length > 16) {
    return {
      success: false,
      message: "Format NIK tidak valid (harus 8 hingga 16 digit angka).",
      kodePengajuan: "",
      data: {
        ...formData,
        tanggalPengajuan: new Date().toISOString(),
        estimasiHasil: "15 - 30 Menit",
        status: "MENUNGGU_VERIFIKASI",
      },
    };
  }

  if (!cleanNama) {
    return {
      success: false,
      message: "Nama pemohon wajib diisi.",
      kodePengajuan: "",
      data: {
        ...formData,
        tanggalPengajuan: new Date().toISOString(),
        estimasiHasil: "15 - 30 Menit",
        status: "MENUNGGU_VERIFIKASI",
      },
    };
  }

  if (!cleanTelepon) {
    return {
      success: false,
      message: "Nomor telepon / WhatsApp wajib diisi.",
      kodePengajuan: "",
      data: {
        ...formData,
        tanggalPengajuan: new Date().toISOString(),
        estimasiHasil: "15 - 30 Menit",
        status: "MENUNGGU_VERIFIKASI",
      },
    };
  }

  if (!cleanAlamat) {
    return {
      success: false,
      message: "Alamat domisili pemohon wajib diisi.",
      kodePengajuan: "",
      data: {
        ...formData,
        tanggalPengajuan: new Date().toISOString(),
        estimasiHasil: "15 - 30 Menit",
        status: "MENUNGGU_VERIFIKASI",
      },
    };
  }

  if (!cleanProduk) {
    return {
      success: false,
      message: "Pilihan produk yang dicurigai wajib dipilih.",
      kodePengajuan: "",
      data: {
        ...formData,
        tanggalPengajuan: new Date().toISOString(),
        estimasiHasil: "15 - 30 Menit",
        status: "MENUNGGU_VERIFIKASI",
      },
    };
  }

  if (!cleanAlasan) {
    return {
      success: false,
      message: "Alasan kecurigaan wajib dipilih.",
      kodePengajuan: "",
      data: {
        ...formData,
        tanggalPengajuan: new Date().toISOString(),
        estimasiHasil: "15 - 30 Menit",
        status: "MENUNGGU_VERIFIKASI",
      },
    };
  }

  if (!cleanRincian) {
    return {
      success: false,
      message: "Rincian produk (lokasi/pasar/penjual) wajib diisi.",
      kodePengajuan: "",
      data: {
        ...formData,
        tanggalPengajuan: new Date().toISOString(),
        estimasiHasil: "15 - 30 Menit",
        status: "MENUNGGU_VERIFIKASI",
      },
    };
  }

  // 2. Generate Kode Pengajuan Unik: Format AMP-UJI-YYYYMM-XXXX
  const now = new Date();
  const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const kodePengajuan = `AMP-UJI-${yearMonth}-${randomSuffix}`;
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
    telepon: cleanTelepon,
    email: cleanEmail,
    alamat: cleanAlamat,
    produkDicurigai: cleanProduk,
    alasanKecurigaan: cleanAlasan,
    rincianProduk: cleanRincian,
    tanggalPengajuan: tanggalFormat,
    estimasiHasil: "15 - 30 Menit",
    status: "MENUNGGU_PENYERAHAN_SAMPEL",
  };

  // 3. Simpan ke Database Prisma
  try {
    // Cari atau buat master layanan UJI_CEPAT
    let layanan = await prisma.layanan.findUnique({
      where: { kode: "UJI_CEPAT" },
    });

    if (!layanan) {
      layanan = await prisma.layanan.create({
        data: {
          kode: "UJI_CEPAT",
          nama: "Layanan Pengujian Cepat Ampera",
          deskripsi: "Pengujian cepat Rapid Test Kit BBPOM Palembang",
          isAktif: true,
        },
      });
    }

    // Cari atau buat/update Tamu berdasarkan NIK resmi
    let tamu = await prisma.tamu.findUnique({
      where: { nik: cleanNik },
    });

    if (!tamu) {
      tamu = await prisma.tamu.create({
        data: {
          nik: cleanNik,
          nama: cleanNama,
          email: cleanEmail || null,
          telepon: cleanTelepon,
          alamat: cleanAlamat,
        },
      });
    } else {
      tamu = await prisma.tamu.update({
        where: { id: tamu.id },
        data: {
          nama: cleanNama,
          email: cleanEmail || tamu.email,
          telepon: cleanTelepon || tamu.telepon,
          alamat: cleanAlamat || tamu.alamat,
        },
      });
    }

    // Buat PengajuanLayanan
    await prisma.pengajuanLayanan.create({
      data: {
        kodePengajuan,
        tamuId: tamu.id,
        layananId: layanan.id,
        produkDicurigai: cleanProduk,
        alasanKecurigaan: cleanAlasan,
        rincianProduk: cleanRincian,
        status: "MENUNGGU_VERIFIKASI",
      },
    });

    return {
      success: true,
      message: "Pengajuan layanan pengujian cepat berhasil dicatat dalam sistem BBPOM Palembang.",
      kodePengajuan,
      data: responseData,
    };
  } catch (error) {
    console.error("[Pengujian Cepat Action] Database error:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? `Gagal menyimpan permohonan ke sistem database: ${error.message}`
          : "Terjadi gangguan sistem saat menyimpan data.",
      kodePengajuan: "",
      data: responseData,
    };
  }
}

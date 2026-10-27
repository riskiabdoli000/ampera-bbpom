"use server";

import { prisma } from "@/lib/prisma";
import { uploadFileOrDocument } from "@/lib/storage";

export interface KeterbukaanInformasiFormState {
  nik: string;
  nama: string;
  email: string;
  alamat: string;
  telepon: string;
  namaFormulirPdf?: string;
  ukuranFormulirPdf?: string;
  namaKtp?: string;
  ukuranKtp?: string;
  catatanTambahan?: string;
}

export interface KeterbukaanInformasiResponse {
  success: boolean;
  message: string;
  kodePengajuan: string;
  data: KeterbukaanInformasiFormState & {
    tanggalPengajuan: string;
    estimasiWaktuTanggapan: string;
    status: string;
  };
}

export async function submitKeterbukaanInformasiAction(
  input: FormData | KeterbukaanInformasiFormState
): Promise<KeterbukaanInformasiResponse> {
  let rawNik = "";
  let rawNama = "";
  let rawTelepon = "";
  let rawEmail = "";
  let rawAlamat = "";
  let rawCatatan = "";
  let formulirFile: File | null = null;
  let ktpFile: File | null = null;
  let namaFormulirPdf: string | undefined = undefined;
  let namaKtp: string | undefined = undefined;

  if (input instanceof FormData) {
    rawNik = (input.get("nik") as string) || "";
    rawNama = (input.get("nama") as string) || "";
    rawTelepon = (input.get("telepon") as string) || "";
    rawEmail = (input.get("email") as string) || "";
    rawAlamat = (input.get("alamat") as string) || "";
    rawCatatan = (input.get("catatanTambahan") as string) || "";
    formulirFile = input.get("formulirPdf") as File | null;
    ktpFile = input.get("ktpFile") as File | null;
    namaFormulirPdf = formulirFile?.name || (input.get("namaFormulirPdf") as string) || undefined;
    namaKtp = ktpFile?.name || (input.get("namaKtp") as string) || undefined;
  } else {
    rawNik = input.nik;
    rawNama = input.nama;
    rawTelepon = input.telepon;
    rawEmail = input.email;
    rawAlamat = input.alamat;
    rawCatatan = input.catatanTambahan || "";
    namaFormulirPdf = input.namaFormulirPdf;
    namaKtp = input.namaKtp;
  }

  const cleanNik = (rawNik || "").trim().replace(/\D/g, "");
  const cleanNama = (rawNama || "").trim();
  const cleanTelepon = (rawTelepon || "").trim();
  const cleanEmail = (rawEmail || "").trim();
  const cleanAlamat = (rawAlamat || "").trim();
  const cleanCatatan = (rawCatatan || "").trim();

  const baseFormData: KeterbukaanInformasiFormState = {
    nik: cleanNik,
    nama: cleanNama,
    telepon: cleanTelepon,
    email: cleanEmail,
    alamat: cleanAlamat,
    namaFormulirPdf,
    namaKtp,
    catatanTambahan: cleanCatatan,
  };

  // 1. Validasi Input Dasar
  if (!cleanNik) {
    return {
      success: false,
      message: "Nomor Induk Kependudukan (NIK) pemohon wajib diisi.",
      kodePengajuan: "",
      data: {
        ...baseFormData,
        tanggalPengajuan: new Date().toISOString(),
        estimasiWaktuTanggapan: "1 - 3 Hari Kerja",
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
        ...baseFormData,
        tanggalPengajuan: new Date().toISOString(),
        estimasiWaktuTanggapan: "1 - 3 Hari Kerja",
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
        ...baseFormData,
        tanggalPengajuan: new Date().toISOString(),
        estimasiWaktuTanggapan: "1 - 3 Hari Kerja",
        status: "MENUNGGU_VERIFIKASI",
      },
    };
  }

  if (!cleanTelepon) {
    return {
      success: false,
      message: "Nomor WhatsApp / telepon pemohon wajib diisi.",
      kodePengajuan: "",
      data: {
        ...baseFormData,
        tanggalPengajuan: new Date().toISOString(),
        estimasiWaktuTanggapan: "1 - 3 Hari Kerja",
        status: "MENUNGGU_VERIFIKASI",
      },
    };
  }

  if (!cleanEmail) {
    return {
      success: false,
      message: "Email aktif pemohon wajib diisi.",
      kodePengajuan: "",
      data: {
        ...baseFormData,
        tanggalPengajuan: new Date().toISOString(),
        estimasiWaktuTanggapan: "1 - 3 Hari Kerja",
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
        ...baseFormData,
        tanggalPengajuan: new Date().toISOString(),
        estimasiWaktuTanggapan: "1 - 3 Hari Kerja",
        status: "MENUNGGU_VERIFIKASI",
      },
    };
  }

  // 2. Generate Kode Pengajuan Unik: Format AMP-KIP-YYYYMM-XXXX
  const now = new Date();
  const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const kodePengajuan = `AMP-KIP-${yearMonth}-${randomSuffix}`;
  const tanggalFormat = now.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const responseData = {
    ...baseFormData,
    tanggalPengajuan: tanggalFormat,
    estimasiWaktuTanggapan: "1 - 3 Hari Kerja",
    status: "MENUNGGU_VERIFIKASI",
  };

  // 3. Upload Berkas ke Storage
  let dokumenPendukungUrl: string | null = null;
  let ktpUrl: string | null = null;

  try {
    if (formulirFile && formulirFile.size > 0) {
      const uploadFormulir = await uploadFileOrDocument(formulirFile, "kip");
      dokumenPendukungUrl = uploadFormulir.url;
    }
  } catch (err) {
    console.error("[Keterbukaan Informasi Action] Gagal upload formulir PDF:", err);
    return {
      success: false,
      message: `Gagal mengunggah formulir PDF: ${err instanceof Error ? err.message : "Kesalahan berkas"}`,
      kodePengajuan: "",
      data: responseData,
    };
  }

  try {
    if (ktpFile && ktpFile.size > 0) {
      const uploadKtp = await uploadFileOrDocument(ktpFile, "ktp");
      ktpUrl = uploadKtp.url;
    }
  } catch (err) {
    console.error("[Keterbukaan Informasi Action] Gagal upload KTP:", err);
    return {
      success: false,
      message: `Gagal mengunggah identitas KTP: ${err instanceof Error ? err.message : "Kesalahan berkas"}`,
      kodePengajuan: "",
      data: responseData,
    };
  }

  // 4. Simpan ke Database Prisma
  try {
    // Cari atau buat layanan KIP
    let layanan = await prisma.layanan.findUnique({
      where: { kode: "KIP" },
    });

    if (!layanan) {
      layanan = await prisma.layanan.create({
        data: {
          kode: "KIP",
          nama: "Layanan Keterbukaan Informasi Publik",
          deskripsi: "Akses informasi publik, SOP, anggaran, dan laporan kinerja PPID BBPOM di Palembang",
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
          alamat: cleanAlamat || tamu.alamat,
          telepon: cleanTelepon || tamu.telepon,
        },
      });
    }

    // Buat PengajuanLayanan
    await prisma.pengajuanLayanan.create({
      data: {
        kodePengajuan,
        tamuId: tamu.id,
        layananId: layanan.id,
        rincianInformasiKip: cleanCatatan || "Permohonan Keterbukaan Informasi Publik PPID",
        tujuanPenggunaanKip: "Permohonan Keterbukaan Informasi Publik (PPID BBPOM Palembang)",
        dokumenPendukungUrl,
        ktpUrl,
        status: "MENUNGGU_VERIFIKASI",
      },
    });

    return {
      success: true,
      message: "Permohonan Keterbukaan Informasi Publik berhasil dicatat dalam sistem PPID BBPOM Palembang.",
      kodePengajuan,
      data: responseData,
    };
  } catch (error) {
    console.error("[Keterbukaan Informasi Action] Database error:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? `Gagal menyimpan permohonan ke sistem database: ${error.message}`
          : "Terjadi gangguan sistem saat menyimpan permohonan.",
      kodePengajuan: "",
      data: responseData,
    };
  }
}

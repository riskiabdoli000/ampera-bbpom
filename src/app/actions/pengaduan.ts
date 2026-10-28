"use server";

import { prisma } from "@/lib/prisma";
import { uploadFileOrDocument } from "@/lib/storage";
import { triggerPengajuanCreatedNotifications } from "@/lib/whatsapp";

export interface PengaduanFormState {
  nik: string;
  nama: string;
  email: string;
  alamat: string;
  telepon: string;
  isiPengaduan: string;
  namaBuktiFoto?: string;
  ukuranBuktiFoto?: string;
  namaKtp?: string;
  ukuranKtp?: string;
}

export interface PengaduanResponse {
  success: boolean;
  message: string;
  kodePengajuan: string;
  data: PengaduanFormState & {
    tanggalPengajuan: string;
    estimasiWaktuTanggapan: string;
    status: string;
  };
}

export async function submitPengaduanAction(
  input: FormData | PengaduanFormState
): Promise<PengaduanResponse> {
  let rawNik = "";
  let rawNama = "";
  let rawTelepon = "";
  let rawEmail = "";
  let rawAlamat = "";
  let rawIsi = "";
  let buktiFile: File | null = null;
  let ktpFile: File | null = null;
  let namaBuktiFoto: string | undefined = undefined;
  let namaKtp: string | undefined = undefined;

  if (input instanceof FormData) {
    rawNik = (input.get("nik") as string) || "";
    rawNama = (input.get("nama") as string) || "";
    rawTelepon = (input.get("telepon") as string) || "";
    rawEmail = (input.get("email") as string) || "";
    rawAlamat = (input.get("alamat") as string) || "";
    rawIsi = (input.get("isiPengaduan") as string) || "";
    buktiFile = input.get("buktiFile") as File | null;
    ktpFile = input.get("ktpFile") as File | null;
    namaBuktiFoto = buktiFile?.name || (input.get("namaBuktiFoto") as string) || undefined;
    namaKtp = ktpFile?.name || (input.get("namaKtp") as string) || undefined;
  } else {
    rawNik = input.nik;
    rawNama = input.nama;
    rawTelepon = input.telepon;
    rawEmail = input.email;
    rawAlamat = input.alamat;
    rawIsi = input.isiPengaduan;
    namaBuktiFoto = input.namaBuktiFoto;
    namaKtp = input.namaKtp;
  }

  const cleanNik = (rawNik || "").trim().replace(/\D/g, "");
  const cleanNama = (rawNama || "").trim();
  const cleanTelepon = (rawTelepon || "").trim();
  const cleanEmail = (rawEmail || "").trim();
  const cleanAlamat = (rawAlamat || "").trim();
  const cleanIsiPengaduan = (rawIsi || "").trim();

  const baseFormData: PengaduanFormState = {
    nik: cleanNik,
    nama: cleanNama,
    telepon: cleanTelepon,
    email: cleanEmail,
    alamat: cleanAlamat,
    isiPengaduan: cleanIsiPengaduan,
    namaBuktiFoto,
    namaKtp,
  };

  // 1. Validasi Input Dasar
  if (!cleanNik) {
    return {
      success: false,
      message: "Nomor Induk Kependudukan (NIK) pelapor wajib diisi.",
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
      message: "Nama pelapor wajib diisi.",
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
      message: "Nomor WhatsApp / telepon wajib diisi.",
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
      message: "Email aktif pelapor wajib diisi.",
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
      message: "Alamat domisili pelapor wajib diisi.",
      kodePengajuan: "",
      data: {
        ...baseFormData,
        tanggalPengajuan: new Date().toISOString(),
        estimasiWaktuTanggapan: "1 - 3 Hari Kerja",
        status: "MENUNGGU_VERIFIKASI",
      },
    };
  }

  if (!cleanIsiPengaduan) {
    return {
      success: false,
      message: "Isi uraian pengaduan wajib diisi.",
      kodePengajuan: "",
      data: {
        ...baseFormData,
        tanggalPengajuan: new Date().toISOString(),
        estimasiWaktuTanggapan: "1 - 3 Hari Kerja",
        status: "MENUNGGU_VERIFIKASI",
      },
    };
  }

  // 2. Generate Kode Pengaduan Unik: Format AMP-ADU-YYYYMM-XXXX
  const now = new Date();
  const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const kodePengajuan = `AMP-ADU-${yearMonth}-${randomSuffix}`;
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

  // 3. Upload File Pendukung ke Storage jika ada
  let buktiFotoUrl: string | null = null;
  let ktpUrl: string | null = null;

  try {
    if (buktiFile && buktiFile.size > 0) {
      const uploadBukti = await uploadFileOrDocument(buktiFile, "aduan");
      buktiFotoUrl = uploadBukti.url;
    }
  } catch (err) {
    console.error("[Pengaduan Action] Gagal upload foto bukti:", err);
    return {
      success: false,
      message: `Gagal mengunggah foto bukti kelengkapan: ${err instanceof Error ? err.message : "Kesalahan berkas"}`,
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
    console.error("[Pengaduan Action] Gagal upload KTP:", err);
    return {
      success: false,
      message: `Gagal mengunggah identitas KTP: ${err instanceof Error ? err.message : "Kesalahan berkas"}`,
      kodePengajuan: "",
      data: responseData,
    };
  }

  // 4. Simpan ke Database Prisma
  try {
    // Cari atau buat layanan ADUAN
    let layanan = await prisma.layanan.findUnique({
      where: { kode: "ADUAN" },
    });

    if (!layanan) {
      layanan = await prisma.layanan.create({
        data: {
          kode: "ADUAN",
          nama: "Layanan Pengaduan Masyarakat",
          deskripsi: "Kanal pelaporan peredaran produk obat dan makanan ilegal, palsu, rusak, atau kedaluwarsa",
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
    const pengajuan = await prisma.pengajuanLayanan.create({
      data: {
        kodePengajuan,
        tamuId: tamu.id,
        layananId: layanan.id,
        isiPengaduan: cleanIsiPengaduan,
        buktiFotoUrl,
        ktpUrl,
        status: "MENUNGGU_VERIFIKASI",
      },
    });

    // Memicu notifikasi WhatsApp ke Tamu & Petugas (asinkron non-blocking)
    triggerPengajuanCreatedNotifications(pengajuan.id).catch((err) => {
      console.error("[WA Notif Background Error] Pengaduan:", err);
    });

    return {
      success: true,
      message: "Laporan pengaduan berhasil dicatat dalam sistem penindakan BBPOM Palembang.",
      kodePengajuan,
      data: responseData,
    };
  } catch (error) {
    console.error("[Pengaduan Action] Database error:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? `Gagal menyimpan laporan ke database: ${error.message}`
          : "Terjadi gangguan sistem saat menyimpan laporan.",
      kodePengajuan: "",
      data: responseData,
    };
  }
}

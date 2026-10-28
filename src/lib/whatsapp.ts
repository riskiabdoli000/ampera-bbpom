import { prisma } from "@/lib/prisma";

// Konfigurasi WA Server Baileys
const DEFAULT_WA_SERVER_URL = "http://127.0.0.1:3006";

function getWaServerUrl(): string {
  return process.env.WA_SERVER_URL || DEFAULT_WA_SERVER_URL;
}

function getInternalWaSecret(): string {
  return process.env.INTERNAL_WA_SECRET || "";
}

function getAppUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
  );
}

/**
 * Format nomor WhatsApp ke format internasional (misal: 0811-7850-008 -> 628117850008)
 */
export function formatWhatsAppNumber(phone: string): string {
  if (!phone) return "";
  let cleaned = phone.replace(/[^0-9]/g, "");
  if (!cleaned) return "";

  if (cleaned.startsWith("0")) {
    cleaned = "62" + cleaned.slice(1);
  } else if (cleaned.startsWith("8")) {
    cleaned = "62" + cleaned;
  } else if (!cleaned.startsWith("62")) {
    cleaned = "62" + cleaned;
  }
  return cleaned;
}

/**
 * Format tanggal ke format lokal Indonesia (contoh: 28 Oktober 2026, 11:45 WIB)
 */
export function formatTanggalWib(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  }).format(date) + " WIB";
}

/**
 * Kirim pesan mentah ke WA Gateway Baileys via HTTP POST
 */
export async function sendRawWhatsAppMessage(
  to: string,
  message: string
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  const formattedTo = formatWhatsAppNumber(to);
  if (!formattedTo || formattedTo.length < 9) {
    return {
      success: false,
      error: `Nomor telepon tujuan tidak valid: ${to}`,
    };
  }

  const waUrl = getWaServerUrl();
  const waSecret = getInternalWaSecret();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4 detik timeout

    const res = await fetch(`${waUrl}/send-message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": waSecret,
      },
      body: JSON.stringify({
        to: formattedTo,
        message: message,
        phone: formattedTo,
        target: formattedTo,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      return {
        success: false,
        error: `WA Gateway Error (${res.status}): ${errText || res.statusText}`,
      };
    }

    const data = await res.json().catch(() => ({}));
    return {
      success: true,
      data,
    };
  } catch (err: unknown) {
    const errorMsg =
      err instanceof Error
        ? err.name === "AbortError"
          ? "Koneksi ke WA Gateway timeout (lebih dari 4 detik)"
          : err.message
        : "Gangguan koneksi ke WA Gateway";

    return {
      success: false,
      error: errorMsg,
    };
  }
}

/**
 * Generator template pesan WhatsApp untuk Tamu/Pemohon saat pengajuan baru dibuat
 */
export function buildTamuPengajuanCreatedMessage(pengajuan: {
  kodePengajuan: string;
  createdAt: Date;
  layanan: { kode: string; nama: string };
  tamu: { nama: string };
  produkDicurigai?: string | null;
  rincianProduk?: string | null;
  kategoriInformasi?: string | null;
  informasiDibutuhkan?: string | null;
  isiPengaduan?: string | null;
  rincianInformasiKip?: string | null;
  tujuanPenggunaanKip?: string | null;
}): string {
  const namaTamu = pengajuan.tamu.nama;
  const kodePengajuan = pengajuan.kodePengajuan;
  const waktuPengajuan = formatTanggalWib(pengajuan.createdAt);
  const kodeLayanan = pengajuan.layanan.kode;

  const footer = `────────────────────────────
*Balai Besar POM di Palembang*
📸 Instagram: @bpom.palembang
📧 Email: bpom_palembang@pom.go.id
_Pesan ini dikirim otomatis oleh Sistem AMPERA BBPOM Palembang._`;

  if (kodeLayanan === "UJI_CEPAT") {
    return `🏛️ *BALAI BESAR POM DI PALEMBANG*
*Sistem Pelayanan Terpadu AMPERA*
────────────────────────────
Yth. Bapak/Ibu *${namaTamu}*,

Terima kasih telah mengajukan *Layanan Pengujian Cepat Sampel (AMPERA)* pada Balai Besar POM di Palembang. Permohonan Anda telah resmi tercatat di sistem kami:

📋 *RINCIAN PENGAJUAN:*
• *Nomor Tiket:* \`${kodePengajuan}\`
• *Waktu Pengajuan:* ${waktuPengajuan}
• *Produk Dicurigai:* ${pengajuan.produkDicurigai || "-"}
• *Rincian Lokasi:* ${pengajuan.rincianProduk || "-"}

📍 *PETUNJUK SELANJUTNYA:*
Silakan serahkan sampel fisik produk tersebut kepada petugas penguji di Laboratorium Pengujian / Mobil Laboratorium Keliling BBPOM Palembang dengan menunjukkan *Nomor Tiket* di atas.

${footer}`;
  }

  if (kodeLayanan === "INFO") {
    return `🏛️ *BALAI BESAR POM DI PALEMBANG*
*Sistem Pelayanan Terpadu AMPERA*
────────────────────────────
Yth. Bapak/Ibu *${namaTamu}*,

Terima kasih atas permohonan Anda. Permohonan *Layanan Permintaan Informasi Obat dan Makanan* Anda telah berhasil kami terima:

📋 *RINCIAN PENGAJUAN:*
• *Nomor Tiket:* \`${kodePengajuan}\`
• *Kategori:* ${pengajuan.kategoriInformasi || "-"}
• *Hal yang Dibutuhkan:* ${pengajuan.informasiDibutuhkan || "-"}
• *Waktu Registrasi:* ${waktuPengajuan}

Petugas pelayanan informasi BBPOM Palembang akan segera menelaah dan menyiapkan informasi yang Anda butuhkan sesuai ketentuan standar pelayanan publik.

${footer}`;
  }

  if (kodeLayanan === "ADUAN") {
    return `🏛️ *BALAI BESAR POM DI PALEMBANG*
*Sistem Pelayanan Terpadu AMPERA*
────────────────────────────
Yth. Bapak/Ibu *${namaTamu}*,

Laporan Pengaduan Konsumen Anda telah kami terima dan tercatat dengan aman dalam basis data BBPOM di Palembang:

📋 *RINCIAN PENGADUAN:*
• *Nomor Pengaduan:* \`${kodePengajuan}\`
• *Waktu Masuk:* ${waktuPengajuan}
• *Status Saat Ini:* Menunggu Verifikasi Petugas
• *Ringkasan Aduan:* ${pengajuan.isiPengaduan || "-"}

Kerahasiaan identitas dan data pelapor dijamin sesuai dengan peraturan perundang-undangan. Petugas BBPOM Palembang akan melakukan verifikasi awal terhadap indikasi yang dilaporkan.

${footer}`;
  }

  // Layanan KIP (Keterbukaan Informasi Publik)
  return `🏛️ *BALAI BESAR POM DI PALEMBANG*
*Pejabat Pengelola Informasi & Dokumentasi (PPID)*
────────────────────────────
Yth. Pemohon Informasi Publik,
*${namaTamu}*

Permohonan Informasi Publik Anda telah teregistrasi dalam sistem PPID BBPOM di Palembang:

📋 *RINCIAN PERMOHONAN:*
• *Nomor Registrasi PPID:* \`${kodePengajuan}\`
• *Rincian Informasi:* ${pengajuan.rincianInformasiKip || "-"}
• *Tujuan Penggunaan:* ${pengajuan.tujuanPenggunaanKip || "-"}
• *Waktu Registrasi:* ${waktuPengajuan}

Pemberitahuan tertulis dan dokumen informasi yang diminta akan disampaikan secara resmi oleh petugas PPID BBPOM Palembang.

${footer}`;
}

/**
 * Generator template pesan WhatsApp alert untuk Petugas BBPOM
 */
export function buildPetugasAlertMessage(
  pengajuan: {
    kodePengajuan: string;
    createdAt: Date;
    layanan: { kode: string; nama: string };
    tamu: { nama: string; telepon?: string | null; asalInstansi?: string | null; alamat?: string | null };
    produkDicurigai?: string | null;
    alasanKecurigaan?: string | null;
    rincianProduk?: string | null;
    kategoriInformasi?: string | null;
    informasiDibutuhkan?: string | null;
    isiPengaduan?: string | null;
    rincianInformasiKip?: string | null;
    tujuanPenggunaanKip?: string | null;
  },
  namaPetugas: string
): string {
  const waktuPengajuan = formatTanggalWib(pengajuan.createdAt);
  const adminDetailUrl = `${getAppUrl()}/admin/data-ampera?q=${encodeURIComponent(pengajuan.kodePengajuan)}`;

  let ringkasanSubmisi = "-";
  if (pengajuan.layanan.kode === "UJI_CEPAT") {
    ringkasanSubmisi = `• Produk: ${pengajuan.produkDicurigai || "-"}\n• Alasan: ${pengajuan.alasanKecurigaan || "-"}\n• Lokasi/Warung: ${pengajuan.rincianProduk || "-"}`;
  } else if (pengajuan.layanan.kode === "INFO") {
    ringkasanSubmisi = `• Kategori: ${pengajuan.kategoriInformasi || "-"}\n• Info Diminta: ${pengajuan.informasiDibutuhkan || "-"}`;
  } else if (pengajuan.layanan.kode === "ADUAN") {
    ringkasanSubmisi = `• Isi Aduan: ${pengajuan.isiPengaduan || "-"}`;
  } else if (pengajuan.layanan.kode === "KIP") {
    ringkasanSubmisi = `• Informasi KIP: ${pengajuan.rincianInformasiKip || "-"}\n• Tujuan: ${pengajuan.tujuanPenggunaanKip || "-"}`;
  }

  return `🚨 *NOTIFIKASI PENGAJUAN BARU — AMPERA BBPOM*
────────────────────────────
Halo Rekan Petugas *${namaPetugas}*,
Terdapat permohonan layanan publik baru yang ditugaskan pada unit Anda:

📌 *INFORMASI LAYANAN:*
• *Jenis Layanan:* [${pengajuan.layanan.kode}] ${pengajuan.layanan.nama}
• *Nomor Tiket:* \`${pengajuan.kodePengajuan}\`
• *Waktu Pengajuan:* ${waktuPengajuan}

👤 *DATA PEMOHON:*
• *Nama Pemohon:* ${pengajuan.tamu.nama}
• *No. WhatsApp:* ${pengajuan.tamu.telepon || "-"}
• *Instansi / Asal:* ${pengajuan.tamu.asalInstansi || pengajuan.tamu.alamat || "-"}

📝 *RINGKASAN PERMOHONAN:*
${ringkasanSubmisi}

⚡ *TINDAK LANJUT SEGERA:*
Buka panel admin untuk verifikasi berkas & masukkan tindakan:
👉 ${adminDetailUrl}

────────────────────────────
_Sistem Notifikasi Otomatis Internal AMPERA BBPOM Palembang_`;
}

/**
 * Generator template pesan WhatsApp untuk Tamu saat Petugas memperbarui status pengajuan
 */
export function buildTamuStatusUpdateMessage(pengajuan: {
  kodePengajuan: string;
  status: string;
  catatanPetugas?: string | null;
  layanan: { nama: string };
  tamu: { nama: string };
}): string {
  const statusLabels: Record<string, string> = {
    MENUNGGU_VERIFIKASI: "Menunggu Verifikasi",
    DIPROSES: "Sedang Diproses oleh Petugas",
    SELESAI: "Selesai Ditindaklanjuti",
    DITOLAK: "Ditolak / Belum Dapat Diproses",
  };

  const statusLabel = statusLabels[pengajuan.status] || pengajuan.status;
  const waktuUpdate = formatTanggalWib(new Date());

  return `🏛️ *BALAI BESAR POM DI PALEMBANG*
*Pembaruan Status Layanan AMPERA*
────────────────────────────
Yth. Bapak/Ibu *${pengajuan.tamu.nama}*,

Permohonan Anda pada *${pengajuan.layanan.nama}* dengan nomor tiket \`${pengajuan.kodePengajuan}\` telah diperbarui oleh petugas BBPOM Palembang:

📌 *STATUS TERBARU:* *${statusLabel}*
📅 *Waktu Pembaruan:* ${waktuUpdate}

📝 *CATATAN / HASIL PEMERIKSAAN PETUGAS:*
${pengajuan.catatanPetugas || "Permohonan Anda sedang dalam penanganan petugas berwenang BBPOM Palembang."}

────────────────────────────
*Balai Besar POM di Palembang*
📸 Instagram: @bpom.palembang
📧 Email: bpom_palembang@pom.go.id
_Pesan otomatis dari Sistem AMPERA BBPOM Palembang._`;
}

/**
 * Memicu pengiriman notifikasi WhatsApp dua arah (Tamu & Petugas Terkait)
 * Berjalan asinkron non-blocking dan mencatat riwayat ke tabel NotifikasiWaLog.
 */
export async function triggerPengajuanCreatedNotifications(pengajuanId: number): Promise<void> {
  try {
    const pengajuan = await prisma.pengajuanLayanan.findUnique({
      where: { id: pengajuanId },
      include: {
        tamu: true,
        layanan: true,
      },
    });

    if (!pengajuan) {
      console.warn(`[WA Notif] Pengajuan ID ${pengajuanId} tidak ditemukan.`);
      return;
    }

    // 1. KIRIM NOTIFIKASI KE TAMU / PEMOHON
    if (pengajuan.tamu.telepon) {
      const formattedTamuPhone = formatWhatsAppNumber(pengajuan.tamu.telepon);
      if (formattedTamuPhone) {
        const pesanTamu = buildTamuPengajuanCreatedMessage(pengajuan);
        const sendResult = await sendRawWhatsAppMessage(formattedTamuPhone, pesanTamu);

        await prisma.notifikasiWaLog.create({
          data: {
            pengajuanId: pengajuan.id,
            tipePenerima: "TAMU",
            nomorTujuan: formattedTamuPhone,
            namaPenerima: pengajuan.tamu.nama,
            pesan: pesanTamu,
            status: sendResult.success ? "TERKIRIM" : "GAGAL",
            responGateway: sendResult.error || (sendResult.data ? JSON.stringify(sendResult.data) : "Pesan terkirim ke gateway"),
          },
        });
      }
    }

    // 2. QUERY DAFTAR PETUGAS TERKAIT LAYANAN INI
    let petugasList = await prisma.petugas.findMany({
      where: {
        isAktif: true,
        layananId: pengajuan.layananId,
        telepon: { not: null },
      },
    });

    // Fallback: Jika belum ada petugas khusus yang di-assign ke layanan ini,
    // ambil petugas aktif umum (layananId is null) atau seluruh petugas aktif yang punya nomor WA
    if (petugasList.length === 0) {
      petugasList = await prisma.petugas.findMany({
        where: {
          isAktif: true,
          telepon: { not: null },
        },
        take: 3, // Maksimal 3 petugas umum
      });
    }

    // 3. KIRIM ALERT KE SETIAP PETUGAS
    for (const petugas of petugasList) {
      if (!petugas.telepon) continue;
      const formattedPetugasPhone = formatWhatsAppNumber(petugas.telepon);
      if (!formattedPetugasPhone) continue;

      const pesanPetugas = buildPetugasAlertMessage(pengajuan, petugas.nama);
      const sendResult = await sendRawWhatsAppMessage(formattedPetugasPhone, pesanPetugas);

      await prisma.notifikasiWaLog.create({
        data: {
          pengajuanId: pengajuan.id,
          tipePenerima: "PETUGAS",
          nomorTujuan: formattedPetugasPhone,
          namaPenerima: petugas.nama,
          pesan: pesanPetugas,
          status: sendResult.success ? "TERKIRIM" : "GAGAL",
          responGateway: sendResult.error || (sendResult.data ? JSON.stringify(sendResult.data) : "Pesan terkirim ke gateway"),
        },
      });
    }
  } catch (error) {
    console.error(`[WA Notif Error] Gagal memproses notifikasi pengajuan ID ${pengajuanId}:`, error);
  }
}

/**
 * Memicu pengiriman notifikasi WhatsApp ke Tamu ketika status layanan diperbarui
 */
export async function triggerPengajuanStatusUpdatedNotification(pengajuanId: number): Promise<void> {
  try {
    const pengajuan = await prisma.pengajuanLayanan.findUnique({
      where: { id: pengajuanId },
      include: {
        tamu: true,
        layanan: true,
      },
    });

    if (!pengajuan || !pengajuan.tamu.telepon) {
      return;
    }

    const formattedTamuPhone = formatWhatsAppNumber(pengajuan.tamu.telepon);
    if (!formattedTamuPhone) return;

    const pesan = buildTamuStatusUpdateMessage(pengajuan);
    const sendResult = await sendRawWhatsAppMessage(formattedTamuPhone, pesan);

    await prisma.notifikasiWaLog.create({
      data: {
        pengajuanId: pengajuan.id,
        tipePenerima: "TAMU",
        nomorTujuan: formattedTamuPhone,
        namaPenerima: pengajuan.tamu.nama,
        pesan: pesan,
        status: sendResult.success ? "TERKIRIM" : "GAGAL",
        responGateway: sendResult.error || (sendResult.data ? JSON.stringify(sendResult.data) : "Pesan terkirim ke gateway"),
      },
    });
  } catch (error) {
    console.error(`[WA Notif Error] Gagal memproses status update pengajuan ID ${pengajuanId}:`, error);
  }
}

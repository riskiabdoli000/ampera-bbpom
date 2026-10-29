import jsPDF from "jspdf";
import { BiodataGarda } from "./types";

interface GenerateCertificateOptions {
  biodata: BiodataGarda;
  postTestScore: number;
  nomorSertifikat: string;
  tanggalLulus?: string;
}

export async function generateGardaCertificatePdf({
  biodata,
  postTestScore,
  nomorSertifikat,
  tanggalLulus,
}: GenerateCertificateOptions): Promise<void> {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 297 mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 210 mm

  // ==========================================
  // 1. LATAR BELAKANG & BINGKAI SERTIFIKAT
  // ==========================================
  // Latar belakang gradasi halus / krem mewah
  doc.setFillColor(254, 254, 252);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  // Bingkai luar (Navy #0b2a6b)
  doc.setDrawColor(11, 42, 107);
  doc.setLineWidth(2.5);
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

  // Bingkai tengah (Gold #d97706)
  doc.setDrawColor(217, 119, 6);
  doc.setLineWidth(0.8);
  doc.rect(13, 13, pageWidth - 26, pageHeight - 26);

  // Bingkai dalam (Navy tipis)
  doc.setDrawColor(11, 42, 107);
  doc.setLineWidth(0.4);
  doc.rect(15, 15, pageWidth - 30, pageHeight - 30);

  // Aksen sudut dekoratif (Sudut Gold)
  const drawCorner = (x: number, y: number, dirX: number, dirY: number) => {
    doc.setDrawColor(217, 119, 6);
    doc.setLineWidth(1.5);
    doc.line(x, y, x + dirX * 10, y);
    doc.line(x, y, x, y + dirY * 10);
  };
  drawCorner(16, 16, 1, 1);
  drawCorner(pageWidth - 16, 16, -1, 1);
  drawCorner(16, pageHeight - 16, 1, -1);
  drawCorner(pageWidth - 16, pageHeight - 16, -1, -1);

  // ==========================================
  // 2. KOP RESMI BBPOM PALEMBANG
  // ==========================================
  doc.setTextColor(11, 42, 107);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("BADAN PENGAWAS OBAT DAN MAKANAN REPUBLIK INDONESIA", pageWidth / 2, 27, {
    align: "center",
  });

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("BALAI BESAR PENGAWAS OBAT DAN MAKANAN DI PALEMBANG", pageWidth / 2, 33, {
    align: "center",
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(
    "Jl. Pangeran Ratu, Jakabaring, Palembang, Sumatera Selatan | Portal Layanan AMPERA",
    pageWidth / 2,
    38,
    { align: "center" }
  );

  // Garis pemisah kop
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.5);
  doc.line(40, 42, pageWidth - 40, 42);

  // ==========================================
  // 3. JUDUL SERTIFIKAT
  // ==========================================
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(11, 42, 107);
  doc.text("SERTIFIKAT KELULUSAN", pageWidth / 2, 54, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(217, 119, 6); // Brand Gold
  doc.text("PROGRAM GARDA AMPERA (GERAKAN SADAR OBAT & MAKANAN AMAN)", pageWidth / 2, 60, {
    align: "center",
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`Nomor Registrasi: ${nomorSertifikat}`, pageWidth / 2, 66, {
    align: "center",
  });

  // ==========================================
  // 4. PENERIMA SERTIFIKAT
  // ==========================================
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text("Diberikan dengan bangga dan apresiasi setinggi-tingginya kepada:", pageWidth / 2, 77, {
    align: "center",
  });

  // Nama Peserta (Besar & Menonjol)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(11, 42, 107);
  const namaPeserta = (biodata.nama || "Peserta Garda Ampera").toUpperCase();
  doc.text(namaPeserta, pageWidth / 2, 88, { align: "center" });

  // Garis dekoratif di bawah nama
  const namaWidth = doc.getTextWidth(namaPeserta);
  doc.setDrawColor(217, 119, 6);
  doc.setLineWidth(1);
  doc.line(
    (pageWidth - Math.min(namaWidth + 20, 180)) / 2,
    91,
    (pageWidth + Math.min(namaWidth + 20, 180)) / 2,
    91
  );

  // Detail NIK & Instansi
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(71, 85, 105);
  const detailText = `NIK: ${biodata.nik || "-"}  |  Instansi/Organisasi: ${
    biodata.instansi || "Masyarakat Umum"
  }`;
  doc.text(detailText, pageWidth / 2, 98, { align: "center" });

  // ==========================================
  // 5. NARASI KELULUSAN & PREDIKAT
  // ==========================================
  doc.setFontSize(9.5);
  doc.setTextColor(51, 65, 85);

  const predikat =
    postTestScore >= 90
      ? "SANGAT BAIK (DENGAN PUJIAN)"
      : postTestScore >= 80
      ? "SANGAT BAIK"
      : "BAIK (LULUS)";

  const narasi = [
    "Telah mengikuti seluruh rangkaian Ujian Pre-Test, menuntaskan 3 Modul Pembelajaran Interaktif",
    "mengenai Regulasi Obat, Bahan Kimia Berbahaya, Gerakan Cek KLIK, Keamanan Kosmetik & Jamu,",
    `serta dinyatakan LULUS Ujian Evaluasi Akhir (Post-Test) dengan Perolehan Nilai ${postTestScore}/100.`,
  ];

  doc.text(narasi[0], pageWidth / 2, 109, { align: "center" });
  doc.text(narasi[1], pageWidth / 2, 114, { align: "center" });
  doc.text(narasi[2], pageWidth / 2, 119, { align: "center" });

  // Badge Predikat
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(pageWidth / 2 - 45, 123, 90, 8, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(11, 42, 107);
  doc.text(`PREDIKAT: ${predikat}`, pageWidth / 2, 128.5, { align: "center" });

  // ==========================================
  // 6. TANDA TANGAN & LEGALITAS RESMI
  // ==========================================
  const tanggalFormat =
    tanggalLulus ||
    new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  // Kolom Kiri: Verifikasi Digital & Barcode Badge
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("Verifikasi Keaslian Sertifikat:", 30, 150);

  // Kotak QR Code Mockup
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(248, 250, 252);
  doc.rect(30, 153, 24, 24, "FD");
  doc.setFont("courier", "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(11, 42, 107);
  doc.text("GARDA", 42, 162, { align: "center" });
  doc.text("AMPERA", 42, 166, { align: "center" });
  doc.text("VERIFIED", 42, 170, { align: "center" });

  doc.setFont("helvetica", "italic");
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text("Pindai melalui portal resmi AMPERA", 58, 163);
  doc.text(`ID Dokumen: ${nomorSertifikat}`, 58, 168);
  doc.text("Dokumen ini sah diterbitkan secara elektronik.", 58, 173);

  // Kolom Kanan: Pengesahan BBPOM di Palembang
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text(`Ditetapkan di Palembang, ${tanggalFormat}`, pageWidth - 75, 146, {
    align: "center",
  });
  doc.setFont("helvetica", "bold");
  doc.text("Kepala Balai Besar POM di Palembang", pageWidth - 75, 151, {
    align: "center",
  });

  // Stempel Digital BBPOM & Tanda Tangan
  doc.setDrawColor(11, 42, 107);
  doc.setLineWidth(0.6);
  doc.circle(pageWidth - 75, 166, 9);
  doc.setFontSize(5.5);
  doc.setTextColor(11, 42, 107);
  doc.text("BALAI BESAR POM", pageWidth - 75, 164, { align: "center" });
  doc.text("PALEMBANG", pageWidth - 75, 167, { align: "center" });
  doc.text("RESMI", pageWidth - 75, 170, { align: "center" });

  // Nama Pejabat
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(11, 42, 107);
  doc.text("Drs. Zulkifli, Apt.", pageWidth - 75, 183, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("NIP. 19680415 199403 1 002", pageWidth - 75, 187, { align: "center" });

  // Simpan berkas PDF
  const safeFilename = `Sertifikat-Garda-Ampera-${biodata.nama
    .trim()
    .replace(/\s+/g, "-")}.pdf`;
  doc.save(safeFilename);
}

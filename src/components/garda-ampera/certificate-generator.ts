import type { BiodataGarda } from "./types";

interface GenerateCertificateOptions {
  biodata: BiodataGarda;
  postTestScore: number;
  nomorSertifikat: string;
  tanggalLulus?: string;
}

/**
 * Helper untuk mengambil aset gambar dari URL publik browser menjadi ArrayBuffer
 */
async function fetchAssetBuffer(path: string): Promise<ArrayBuffer> {
  const res = await fetch(path);
  if (!res.ok) {
    throw new Error(`Gagal memuat aset sertifikat: ${path}`);
  }
  return await res.arrayBuffer();
}

/**
 * Generate E-Sertifikat Resmi Garda Ampera (A4 Landscape)
 * Menggunakan format desain terbaru BBPOM di Palembang:
 * - Font: Times New Roman & Trebuchet MS / Helvetica
 * - Watermark Garda Ampera (opacity 0.10)
 * - Gelombang Toska bawah (wave-bottom.jpg)
 * - Penandatangan: Yani Ardiyanti, SF, Apt.,M.Sc (TTE & Cap Basah BBPOM Palembang)
 */
export async function generateGardaCertificatePdf({
  biodata,
  nomorSertifikat,
  tanggalLulus,
}: GenerateCertificateOptions): Promise<void> {
  const { PDFDocument, rgb, StandardFonts } = await import("pdf-lib");
  const pdfDoc = await PDFDocument.create();

  // Dimensi A4 Landscape (841.89 x 595.28 pt)
  const pageWidth = 841.89;
  const pageHeight = 595.28;
  const page = pdfDoc.addPage([pageWidth, pageHeight]);

  // Muat Standard Fonts
  const fontTimes = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const fontTimesBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const fontHelvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontHelveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // 1. Latar Belakang Putih
  page.drawRectangle({
    x: 0,
    y: 0,
    width: pageWidth,
    height: pageHeight,
    color: rgb(1, 1, 1),
  });

  // 2. Muat seluruh aset gambar resmi secara paralel
  const [logoBytes, waveBytes, gardaLogoBytes, capBytes, tteBytes] =
    await Promise.all([
      fetchAssetBuffer("/sertifikat/assets/logo-bpom.png"),
      fetchAssetBuffer("/sertifikat/assets/wave-bottom.jpg"),
      fetchAssetBuffer("/sertifikat/assets/garda-ampera-logo.png"),
      fetchAssetBuffer("/sertifikat/assets/cap-bpom.png"),
      fetchAssetBuffer("/sertifikat/assets/tte-bu-yani.png"),
    ]);

  const logoImage = await pdfDoc.embedPng(logoBytes);
  const waveImage = await pdfDoc.embedJpg(waveBytes);
  const gardaLogoImage = await pdfDoc.embedPng(gardaLogoBytes);
  const capImage = await pdfDoc.embedPng(capBytes);
  const tteImage = await pdfDoc.embedPng(tteBytes);

  // 3. Watermark Logo GARDA AMPERA di latar belakang (opacity 0.10)
  const wmWidth = 470;
  const wmHeight = 470;
  page.drawImage(gardaLogoImage, {
    x: (pageWidth - wmWidth) / 2,
    y: (pageHeight - wmHeight) / 2 - 25,
    width: wmWidth,
    height: wmHeight,
    opacity: 0.1,
  });

  // 4. Gelombang Poligon Toska di Bagian Bawah
  const waveHeight = 142;
  page.drawImage(waveImage, {
    x: 0,
    y: 0,
    width: pageWidth,
    height: waveHeight,
  });

  // 5. Logo BPOM di Tengah Atas
  const logoW = 96;
  const logoH = 68;
  page.drawImage(logoImage, {
    x: (pageWidth - logoW) / 2,
    y: pageHeight - 90,
    width: logoW,
    height: logoH,
  });

  // 6. Judul: "SERTIFIKAT" (Times New Roman Bold, 33pt)
  const titleText = "SERTIFIKAT";
  const titleFontSize = 33;
  const titleWidth = fontTimesBold.widthOfTextAtSize(titleText, titleFontSize);
  page.drawText(titleText, {
    x: (pageWidth - titleWidth) / 2,
    y: pageHeight - 132,
    size: titleFontSize,
    font: fontTimesBold,
    color: rgb(0.05, 0.05, 0.05),
  });

  // 7. Nomor Sertifikat (Times New Roman Regular, 13.5pt)
  const noText = `Nomor :  ${nomorSertifikat}`;
  const noFontSize = 13.5;
  const noWidth = fontTimes.widthOfTextAtSize(noText, noFontSize);
  page.drawText(noText, {
    x: (pageWidth - noWidth) / 2,
    y: pageHeight - 165,
    size: noFontSize,
    font: fontTimes,
    color: rgb(0.1, 0.1, 0.1),
  });

  // 8. Kalimat Pengantar: "Sertifikat ini menerangkan bahwa:" (Times New Roman, 14.5pt)
  const introText = "Sertifikat ini menerangkan bahwa:";
  const introFontSize = 14.5;
  const introWidth = fontTimes.widthOfTextAtSize(introText, introFontSize);
  page.drawText(introText, {
    x: (pageWidth - introWidth) / 2,
    y: pageHeight - 202,
    size: introFontSize,
    font: fontTimes,
    color: rgb(0.12, 0.12, 0.12),
  });

  // 9. Nama Peserta (Times New Roman Bold, 36pt)
  const namaPeserta = biodata.nama || "Peserta Garda Ampera";
  const namaFontSize = 36;
  const namaWidth = fontTimesBold.widthOfTextAtSize(namaPeserta, namaFontSize);
  page.drawText(namaPeserta, {
    x: (pageWidth - namaWidth) / 2,
    y: pageHeight - 248,
    size: namaFontSize,
    font: fontTimesBold,
    color: rgb(0.02, 0.02, 0.02),
  });

  // 10. Narasi Kelulusan Resmi: Times New Roman Bold (13.5pt, spasi rapat)
  const descLines = [
    "Telah menyelesaikan modul Gerakan Antisipasi Risiko, Deteksi, dan Aksi pada inovasi GARDA AMPERA.",
    "Semoga partisipasi ini menjadi langkah nyata bersama dalam mewujudkan keamanan pangan",
    "dan pengawasan obat dan makanan yang lebih baik.",
  ];
  const descFontSize = 13.5;
  let currentY = pageHeight - 282;
  const lineHeight = 17.5;

  for (const line of descLines) {
    const lineWidth = fontTimesBold.widthOfTextAtSize(line, descFontSize);
    page.drawText(line, {
      x: (pageWidth - lineWidth) / 2,
      y: currentY,
      size: descFontSize,
      font: fontTimesBold,
      color: rgb(0.08, 0.08, 0.08),
    });
    currentY -= lineHeight;
  }

  // 11. Blok Tanda Tangan & Pengesahan
  const centerSignX = pageWidth / 2;

  // Tanggal Penerbitan (Times New Roman Regular)
  const dateStr = tanggalLulus
    ? tanggalLulus.startsWith("Palembang")
      ? tanggalLulus
      : `Palembang, ${tanggalLulus}`
    : `Palembang, ${new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })}`;

  const tanggalFontSize = 13;
  const tanggalWidth = fontTimes.widthOfTextAtSize(dateStr, tanggalFontSize);
  page.drawText(dateStr, {
    x: centerSignX - tanggalWidth / 2,
    y: 222,
    size: tanggalFontSize,
    font: fontTimes,
    color: rgb(0.1, 0.1, 0.1),
  });

  // Jabatan Penandatangan (Trebuchet/Helvetica)
  const jabatanText1 = "Kepala Balai Besar Pengawas Obat dan Makanan";
  const jabatanText2 = "di Palembang";
  const jabFontSize = 12;
  const jab1Width = fontHelvetica.widthOfTextAtSize(jabatanText1, jabFontSize);
  const jab2Width = fontHelvetica.widthOfTextAtSize(jabatanText2, jabFontSize);

  page.drawText(jabatanText1, {
    x: centerSignX - jab1Width / 2,
    y: 205,
    size: jabFontSize,
    font: fontHelvetica,
    color: rgb(0.1, 0.1, 0.1),
  });
  page.drawText(jabatanText2, {
    x: centerSignX - jab2Width / 2,
    y: 191,
    size: jabFontSize,
    font: fontHelvetica,
    color: rgb(0.1, 0.1, 0.1),
  });

  // Cap Stempel BBPOM Palembang (cap-bpom.png) -> sesuai -translate-x-20 & -translate-y-2
  const stempelW = 86;
  const stempelH = 86;
  page.drawImage(capImage, {
    x: centerSignX - 96,
    y: 106,
    width: stempelW,
    height: stempelH,
  });

  // Tanda Tangan Elektronik Bu Yani (tte-bu-yani.png) -> sesuai translate-x-2
  const ttdW = 105;
  const ttdH = 70;
  page.drawImage(tteImage, {
    x: centerSignX - 28,
    y: 108,
    width: ttdW,
    height: ttdH,
  });

  // Nama Pejabat: Yani Ardiyanti, SF, Apt.,M.Sc (Trebuchet / Helvetica Bold, tanpa NIP)
  const pejabatNama = "Yani Ardiyanti, SF, Apt.,M.Sc";
  const pejabatFontSize = 14;
  const pejabatWidth = fontHelveticaBold.widthOfTextAtSize(
    pejabatNama,
    pejabatFontSize
  );
  page.drawText(pejabatNama, {
    x: centerSignX - pejabatWidth / 2,
    y: 92,
    size: pejabatFontSize,
    font: fontHelveticaBold,
    color: rgb(0.05, 0.05, 0.05),
  });

  // 12. Simpan & Picu Download Otomatis di Browser
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
  const downloadUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = downloadUrl;
  const safeName = (biodata.nama || "Peserta").replace(/[^a-zA-Z0-9]/g, "_");
  link.download = `Sertifikat-Garda-Ampera-${safeName}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(downloadUrl);
}

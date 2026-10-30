import type { GardaPesertaItem, GardaAdminStats } from "@/app/actions/garda-ampera";

/**
 * Format tanggal Indonesia lengkap (cth: "Rabu, 28 Oktober 2026, 10.30 WIB")
 */
function formatTanggalIndo(dateInput: Date | string): string {
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "-";
  return (
    d.toLocaleString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }) + " WIB"
  );
}

/**
 * Format tanggal ringkas (cth: "28/10/2026")
 */
function formatTanggalPendek(dateInput: Date | string): string {
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * Mengambil berkas gambar sebagai base64 data URL untuk jsPDF
 */
async function getImageBase64(url: string): Promise<string | null> {
  if (typeof window === "undefined") return null;
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

// =========================================================================
// 1. GENERATOR EXCEL (.XLSX) - SESUAI FORMAT RESMI DATA AMPERA
// =========================================================================
export async function exportGardaToExcel(
  pesertaList: GardaPesertaItem[],
  stats: GardaAdminStats
): Promise<void> {
  const ExcelJS = (await import("exceljs")).default;
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Sistem Informasi AMPERA - BBPOM di Palembang";
  workbook.lastModifiedBy = "Admin BBPOM Palembang";
  workbook.created = new Date();
  workbook.modified = new Date();

  const worksheet = workbook.addWorksheet("Rekap Peserta Garda Ampera", {
    views: [{ state: "frozen", xSplit: 0, ySplit: 8 }],
    pageSetup: { orientation: "landscape", paperSize: 9 }, // A4 Landscape
  });

  const nowFormatted = formatTanggalIndo(new Date());

  // 1. Judul & Kop Dokumen Excel
  worksheet.mergeCells("A1:M1");
  const titleCell = worksheet.getCell("A1");
  titleCell.value = "BADAN PENGAWAS OBAT DAN MAKANAN - BALAI BESAR POM DI PALEMBANG";
  titleCell.font = { name: "Segoe UI", size: 14, bold: true, color: { argb: "FF06132F" } };
  titleCell.alignment = { vertical: "middle", horizontal: "center" };

  worksheet.mergeCells("A2:M2");
  const subTitleCell = worksheet.getCell("A2");
  subTitleCell.value = "REKAPITULASI LAPORAN PESERTA EDUKASI & KADER (GARDA AMPERA)";
  subTitleCell.font = { name: "Segoe UI", size: 11, bold: true, color: { argb: "FFFF7A1A" } };
  subTitleCell.alignment = { vertical: "middle", horizontal: "center" };

  worksheet.mergeCells("A3:M3");
  const dateCell = worksheet.getCell("A3");
  dateCell.value = `Waktu Ekspor: ${nowFormatted} • Dokumen Resmi BBPOM di Palembang`;
  dateCell.font = { name: "Segoe UI", size: 9, italic: true, color: { argb: "FF64748B" } };
  dateCell.alignment = { vertical: "middle", horizontal: "center" };

  // 2. Ringkasan Statistik KPI Box (Baris 5-6)
  const kpiItems = [
    { label: "TOTAL PESERTA", val: stats.totalPeserta, col1: "B", col2: "C", bg: "FFF8FAFC", fg: "FF0F172A" },
    { label: "LULUS UJIAN", val: stats.totalLulus, col1: "E", col2: "F", bg: "FFECFDF5", fg: "FF059669" },
    { label: "BELUM LULUS (REMEDI)", val: stats.totalRemidi, col1: "H", col2: "I", bg: "FFFEF2F2", fg: "FFDC2626" },
    { label: "TINGKAT KELULUSAN", val: `${stats.tingkatKelulusanPersen}%`, col1: "K", col2: "L", bg: "FFFFF7ED", fg: "FFEA580C" },
  ];

  kpiItems.forEach((kpi) => {
    worksheet.mergeCells(`${kpi.col1}5:${kpi.col2}5`);
    const lblCell = worksheet.getCell(`${kpi.col1}5`);
    lblCell.value = kpi.label;
    lblCell.font = { name: "Segoe UI", size: 8, bold: true, color: { argb: "FF64748B" } };
    lblCell.alignment = { horizontal: "center", vertical: "middle" };
    lblCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: kpi.bg } };

    worksheet.mergeCells(`${kpi.col1}6:${kpi.col2}6`);
    const valCell = worksheet.getCell(`${kpi.col1}6`);
    valCell.value = kpi.val;
    valCell.font = { name: "Segoe UI", size: 14, bold: true, color: { argb: kpi.fg } };
    valCell.alignment = { horizontal: "center", vertical: "middle" };
    valCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: kpi.bg } };
  });

  worksheet.addRow([]); // Baris 7 kosong

  // 3. Header Tabel (Baris 8)
  const headers = [
    "NO",
    "NIK",
    "NAMA LENGKAP",
    "L/P",
    "USIA",
    "PENDIDIKAN",
    "PEKERJAAN",
    "INSTANSI / ORGANISASI",
    "TANGGAL TES",
    "PRE-TEST",
    "POST-TEST",
    "STATUS",
    "NOMOR SERTIFIKAT",
  ];

  const headerRow = worksheet.addRow(headers);
  headerRow.height = 26;
  headerRow.eachCell((cell) => {
    cell.font = { name: "Segoe UI", size: 9, bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0B2A6B" } }; // Navy BPOM
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    cell.border = {
      top: { style: "thin", color: { argb: "FF94A3B8" } },
      left: { style: "thin", color: { argb: "FF94A3B8" } },
      bottom: { style: "medium", color: { argb: "FF06132F" } },
      right: { style: "thin", color: { argb: "FF94A3B8" } },
    };
  });

  // 4. Data Rows
  pesertaList.forEach((p, idx) => {
    const tgl = new Date(p.tanggalTes);
    const tglStr = !isNaN(tgl.getTime()) ? formatTanggalPendek(tgl) : "-";

    const row = worksheet.addRow([
      idx + 1,
      p.nik,
      p.nama,
      p.jenisKelamin === "Laki-laki" ? "L" : "P",
      `${p.usia} thn`,
      p.pendidikan,
      p.pekerjaan,
      p.instansi || "-",
      tglStr,
      p.preTestScore !== null ? p.preTestScore : "-",
      p.postTestScore !== null ? p.postTestScore : "-",
      p.isLulus ? "LULUS" : "REMIDI (< 70)",
      p.nomorSertifikat || "-",
    ]);

    row.height = 22;
    const isEven = idx % 2 === 0;

    row.eachCell((cell, colNumber) => {
      cell.font = { name: "Segoe UI", size: 8.5 };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: isEven ? "FFFFFFFF" : "FFF8FAFC" },
      };
      cell.border = {
        top: { style: "thin", color: { argb: "FFE2E8F0" } },
        left: { style: "thin", color: { argb: "FFE2E8F0" } },
        bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
        right: { style: "thin", color: { argb: "FFE2E8F0" } },
      };

      // Alignment
      if ([1, 4, 5, 9, 10, 11, 12].includes(colNumber)) {
        cell.alignment = { vertical: "middle", horizontal: "center" };
      } else {
        cell.alignment = { vertical: "middle", horizontal: "left" };
      }

      // Warna Status Kelulusan
      if (colNumber === 12) {
        if (p.isLulus) {
          cell.font = { name: "Segoe UI", size: 8.5, bold: true, color: { argb: "FF059669" } };
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFECFDF5" } };
        } else {
          cell.font = { name: "Segoe UI", size: 8.5, bold: true, color: { argb: "FFDC2626" } };
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFEF2F2" } };
        }
      }
    });
  });

  // 5. Lebar Kolom
  worksheet.getColumn(1).width = 6; // No
  worksheet.getColumn(2).width = 20; // NIK
  worksheet.getColumn(3).width = 26; // Nama
  worksheet.getColumn(4).width = 7; // L/P
  worksheet.getColumn(5).width = 10; // Usia
  worksheet.getColumn(6).width = 15; // Pendidikan
  worksheet.getColumn(7).width = 24; // Pekerjaan
  worksheet.getColumn(8).width = 26; // Instansi
  worksheet.getColumn(9).width = 14; // Tanggal
  worksheet.getColumn(10).width = 12; // Pre-Test
  worksheet.getColumn(11).width = 12; // Post-Test
  worksheet.getColumn(12).width = 18; // Status
  worksheet.getColumn(13).width = 30; // No Sertifikat

  // 6. Download di Browser
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `Rekap-Peserta-Garda-Ampera-${new Date().toISOString().split("T")[0]}.xlsx`;
  anchor.click();
  window.URL.revokeObjectURL(url);
}

// =========================================================================
// 2. GENERATOR PDF (.PDF) - SESUAI KOP & STANDAR RESMI DATA AMPERA
// =========================================================================
export async function exportGardaToPdf(
  pesertaList: GardaPesertaItem[],
  stats: GardaAdminStats
): Promise<void> {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);
  // A4 Landscape: 297mm x 210mm
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 297
  const margin = 12;

  // 1. Gambar Kop Surat Resmi: Logo BBPOM (Kiri) & Logo AMPERA (Kanan)
  const [logoBpomBase64, logoAmperaBase64] = await Promise.all([
    getImageBase64("/assets-landingpage/logo-bpom.png"),
    getImageBase64("/assets-landingpage/garda_ampera_logo.png"),
  ]);

  // Logo BBPOM di Kiri
  if (logoBpomBase64) {
    try {
      doc.addImage(logoBpomBase64, "PNG", margin + 3, margin - 1, 20, 18);
    } catch {
      // Abaikan jika gambar gagal
    }
  }

  // Logo AMPERA di Kanan
  if (logoAmperaBase64) {
    try {
      const amperaWidth = 24;
      const amperaHeight = 16.5;
      const amperaX = pageWidth - margin - 3 - amperaWidth;
      doc.addImage(logoAmperaBase64, "PNG", amperaX, margin + 0.5, amperaWidth, amperaHeight);
    } catch {
      // Abaikan jika gambar gagal
    }
  }

  // Teks Kop Surat di Tengah (Center Aligned)
  const centerX = pageWidth / 2;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(6, 19, 47); // Navy #06132F
  doc.text(
    "BADAN PENGAWAS OBAT DAN MAKANAN REPUBLIK INDONESIA",
    centerX,
    margin + 4,
    { align: "center" }
  );

  doc.setFontSize(10.5);
  doc.setTextColor(255, 122, 26); // Brand Orange #ff7a1a
  doc.text(
    "BALAI BESAR PENGAWAS OBAT DAN MAKANAN DI PALEMBANG",
    centerX,
    margin + 9,
    { align: "center" }
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(
    "Jl. Pangeran Ratu, Jakabaring, Kota Palembang, Sumatera Selatan 30252",
    centerX,
    margin + 13.5,
    { align: "center" }
  );
  doc.text(
    "Telepon: (0711) 510195 | Email: bbpom_palembang@pom.go.id | Laman: palembang.pom.go.id",
    centerX,
    margin + 17,
    { align: "center" }
  );

  // Garis Pembatas Kop Surat Ganda (Double-line Header)
  const lineY = margin + 20;
  doc.setDrawColor(6, 19, 47);
  doc.setLineWidth(0.7);
  doc.line(margin, lineY, pageWidth - margin, lineY);

  doc.setLineWidth(0.25);
  doc.line(margin, lineY + 0.8, pageWidth - margin, lineY + 0.8);

  // 2. Judul Dokumen Laporan
  const titleY = lineY + 6;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(6, 19, 47);
  doc.text(
    "LAPORAN REKAPITULASI PESERTA E-LEARNING GARDA AMPERA",
    pageWidth / 2,
    titleY,
    { align: "center" }
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Waktu Cetak: ${formatTanggalIndo(new Date())} • Dokumen Resmi BBPOM di Palembang`,
    pageWidth / 2,
    titleY + 4,
    { align: "center" }
  );

  // 3. Ringkasan Statistik KPI Mini Box
  const kpiBoxY = titleY + 7;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, kpiBoxY, pageWidth - margin * 2, 6.5, 1.5, 1.5, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  const kpiText = `Total Peserta: ${stats.totalPeserta} Orang   |   Lulus Ujian: ${stats.totalLulus} Orang   |   Belum Lulus: ${stats.totalRemidi} Orang   |   Tingkat Kelulusan: ${stats.tingkatKelulusanPersen}%`;
  doc.text(kpiText, pageWidth / 2, kpiBoxY + 4.3, { align: "center" });

  // 4. Tabel Menggunakan jspdf-autotable
  const startTableY = kpiBoxY + 9;

  const tableBody = pesertaList.map((p, idx) => {
    const tgl = new Date(p.tanggalTes);
    const tglStr = !isNaN(tgl.getTime()) ? formatTanggalPendek(tgl) : "-";

    return [
      idx + 1,
      `${p.nama}\nNIK: ${p.nik}`,
      `${p.jenisKelamin === "Laki-laki" ? "L" : "P"} / ${p.usia} thn`,
      p.pendidikan,
      p.pekerjaan,
      p.instansi || "-",
      tglStr,
      p.preTestScore !== null ? p.preTestScore : "-",
      p.postTestScore !== null ? p.postTestScore : "-",
      p.isLulus ? "LULUS" : "REMIDI",
      p.nomorSertifikat || "-",
    ];
  });

  autoTable(doc, {
    startY: startTableY,
    head: [
      [
        "NO",
        "NAMA & NIK PESERTA",
        "L/P & USIA",
        "PENDIDIKAN",
        "PEKERJAAN",
        "INSTANSI",
        "TANGGAL",
        "PRE",
        "POST",
        "STATUS",
        "NOMOR SERTIFIKAT",
      ],
    ],
    body: tableBody,
    theme: "striped",
    styles: {
      fontSize: 7.2,
      cellPadding: 1.8,
      overflow: "linebreak",
      valign: "middle",
      textColor: [30, 41, 59],
    },
    headStyles: {
      fillColor: [11, 42, 107], // Navy BPOM #0B2A6B
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "center",
      fontSize: 7.5,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 8 },
      1: { cellWidth: 46 },
      2: { halign: "center", cellWidth: 18 },
      3: { halign: "center", cellWidth: 18 },
      4: { cellWidth: 34 },
      5: { cellWidth: 34 },
      6: { halign: "center", cellWidth: 18 },
      7: { halign: "center", cellWidth: 12 },
      8: { halign: "center", cellWidth: 12 },
      9: { halign: "center", cellWidth: 20 },
      10: { cellWidth: 53 },
    },
    didParseCell: (data) => {
      // Warnai badge status
      if (data.section === "body" && data.column.index === 9) {
        const val = data.cell.raw as string;
        if (val === "LULUS") {
          data.cell.styles.textColor = [5, 150, 105]; // Emerald #059669
          data.cell.styles.fontStyle = "bold";
        } else {
          data.cell.styles.textColor = [220, 38, 38]; // Red #DC2626
          data.cell.styles.fontStyle = "bold";
        }
      }
    },
    didDrawPage: (data) => {
      // Footer Halaman
      const footerY = doc.internal.pageSize.getHeight() - 7;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);

      doc.text(
        "Sistem Informasi AMPERA • Balai Besar Pengawas Obat dan Makanan (BBPOM) di Palembang",
        margin,
        footerY
      );

      const pageStr = `Halaman ${data.pageNumber}`;
      doc.text(pageStr, pageWidth - margin, footerY, { align: "right" });
    },
  });

  // 5. Simpan / Unduh Berkas PDF
  doc.save(`Laporan-Peserta-Garda-Ampera-${new Date().toISOString().split("T")[0]}.pdf`);
}

import ExcelJS from "exceljs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { GardaEvaluasiRecord, GardaEvaluasiSummaryStats } from "@/app/actions/garda-ampera";

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
// 1. GENERATOR EXCEL (.XLSX) - LAPORAN HASIL EVALUASI GARDA AMPERA
// =========================================================================
export async function exportEvaluasiToExcel(
  evaluasiList: GardaEvaluasiRecord[],
  stats: GardaEvaluasiSummaryStats
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Sistem Informasi AMPERA - BBPOM di Palembang";
  workbook.lastModifiedBy = "Admin BBPOM Palembang";
  workbook.created = new Date();
  workbook.modified = new Date();

  const worksheet = workbook.addWorksheet("Hasil Evaluasi Garda Ampera", {
    views: [{ state: "frozen", xSplit: 0, ySplit: 8 }],
    pageSetup: { orientation: "landscape", paperSize: 9 }, // A4 Landscape
  });

  const nowFormatted = formatTanggalIndo(new Date());

  // 1. Judul & Kop Dokumen Excel
  worksheet.mergeCells("A1:M1");
  const titleCell = worksheet.getCell("A1");
  titleCell.value = "BADAN PENGAWAS OBAT DAN MAKANAN - BALAI BESAR POM DI PALEMBANG";
  titleCell.font = { name: "Arial", size: 14, bold: true, color: { argb: "FF0B2A6B" } };
  titleCell.alignment = { horizontal: "center", vertical: "middle" };

  worksheet.mergeCells("A2:M2");
  const subTitleCell = worksheet.getCell("A2");
  subTitleCell.value = "LAPORAN REKAPITULASI HASIL EVALUASI & SURVEI KEPUASAN PESERTA GARDA AMPERA";
  subTitleCell.font = { name: "Arial", size: 11, bold: true, color: { argb: "FFD97706" } };
  subTitleCell.alignment = { horizontal: "center", vertical: "middle" };

  worksheet.mergeCells("A3:M3");
  const dateCell = worksheet.getCell("A3");
  dateCell.value = `Waktu Ekspor: ${nowFormatted} | Total Responden: ${stats.totalResponden} Peserta | Indeks Kepuasan: ${stats.rataRataKeseluruhan} / 5.0 (${stats.persentasePuas}% Puas)`;
  dateCell.font = { name: "Arial", size: 9, italic: true, color: { argb: "FF6B7280" } };
  dateCell.alignment = { horizontal: "center", vertical: "middle" };

  // 2. Kotak Ringkasan KPI
  const kpiRow = worksheet.getRow(5);
  kpiRow.height = 24;

  const kpiLabels = [
    { col: "B", label: "Total Responden", val: `${stats.totalResponden} Orang` },
    { col: "D", label: "Indeks Kepuasan", val: `★ ${stats.rataRataKeseluruhan} / 5.0` },
    { col: "F", label: "1. Kemudahan", val: `★ ${stats.rataRataKemudahan}` },
    { col: "H", label: "2. Kualitas Materi", val: `★ ${stats.rataRataMateri}` },
    { col: "J", label: "3. Bobot Soal", val: `★ ${stats.rataRataSoal}` },
    { col: "L", label: "4. Manfaat Program", val: `★ ${stats.rataRataManfaat}` },
  ];

  kpiLabels.forEach(({ col, label, val }) => {
    const cell = worksheet.getCell(`${col}5`);
    cell.value = `${label}: ${val}`;
    cell.font = { name: "Arial", size: 9, bold: true, color: { argb: "FF1E293B" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFF8FAFC" },
    };
    cell.border = {
      top: { style: "thin", color: { argb: "FFE2E8F0" } },
      left: { style: "thin", color: { argb: "FFE2E8F0" } },
      bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
      right: { style: "thin", color: { argb: "FFE2E8F0" } },
    };
    cell.alignment = { horizontal: "center", vertical: "middle" };
  });

  // 3. Header Tabel
  const headers = [
    "No",
    "Nama Peserta",
    "NIK (KTP)",
    "Instansi / Organisasi",
    "Profesi",
    "Tanggal Ujian",
    "1. Kemudahan (1-5)",
    "2. Materi (1-5)",
    "3. Soal (1-5)",
    "4. Manfaat (1-5)",
    "Rata-rata Skor",
    "Kategori Kepuasan",
    "Kritik, Masukan & Saran Peserta",
  ];

  const headerRow = worksheet.getRow(8);
  headerRow.height = 28;

  headers.forEach((h, idx) => {
    const colNumber = idx + 1;
    const cell = headerRow.getCell(colNumber);
    cell.value = h;
    cell.font = { name: "Arial", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF0B2A6B" }, // Biru Navy Resmi
    };
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    cell.border = {
      top: { style: "medium", color: { argb: "FF0B2A6B" } },
      bottom: { style: "medium", color: { argb: "FF0B2A6B" } },
      left: { style: "thin", color: { argb: "FFCBD5E1" } },
      right: { style: "thin", color: { argb: "FFCBD5E1" } },
    };
  });

  // 4. Baris Data Evaluasi Peserta
  let currentRow = 9;

  evaluasiList.forEach((e, idx) => {
    const row = worksheet.getRow(currentRow);
    row.height = 24;

    const kategoriKepuasan =
      e.rataRata >= 4.5
        ? "Sangat Puas"
        : e.rataRata >= 3.5
        ? "Puas"
        : e.rataRata >= 2.5
        ? "Cukup"
        : "Kurang";

    const rowValues = [
      idx + 1,
      e.nama,
      e.nik,
      e.instansi || "-",
      e.pekerjaan || "-",
      formatTanggalPendek(e.tanggalTes),
      e.ratingKemudahan,
      e.ratingMateri,
      e.ratingSoal,
      e.ratingManfaat,
      e.rataRata,
      kategoriKepuasan,
      e.kritikSaran || "-",
    ];

    rowValues.forEach((val, valIdx) => {
      const colNum = valIdx + 1;
      const cell = row.getCell(colNum);
      cell.value = val;
      cell.font = { name: "Arial", size: 9, color: { argb: "FF1E293B" } };

      const isEven = idx % 2 === 0;
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: isEven ? "FFFFFFFF" : "FFF8FAFC" },
      };

      cell.border = {
        top: { style: "thin", color: { argb: "FFE2E8F0" } },
        bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
        left: { style: "thin", color: { argb: "FFE2E8F0" } },
        right: { style: "thin", color: { argb: "FFE2E8F0" } },
      };

      // Alignment khusus per kolom
      if (colNum === 1 || colNum === 6) {
        cell.alignment = { horizontal: "center", vertical: "middle" };
      } else if (colNum >= 7 && colNum <= 11) {
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.font = { name: "Arial", size: 9, bold: true };
      } else if (colNum === 12) {
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.font = {
          name: "Arial",
          size: 9,
          bold: true,
          color: { argb: e.rataRata >= 4.0 ? "FF047857" : "FFB45309" },
        };
      } else {
        cell.alignment = { horizontal: "left", vertical: "middle", wrapText: true };
      }
    });

    currentRow++;
  });

  // 5. Atur Lebar Kolom Otomatis
  const columnWidths = [6, 26, 18, 26, 18, 14, 14, 14, 14, 14, 14, 16, 45];
  columnWidths.forEach((w, i) => {
    worksheet.getColumn(i + 1).width = w;
  });

  // 6. Simpan File Excel ke Browser
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `Laporan_Evaluasi_Garda_Ampera_${new Date()
    .toISOString()
    .slice(0, 10)}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// =========================================================================
// 2. GENERATOR PDF (.PDF) - LAPORAN HASIL EVALUASI GARDA AMPERA RESMI
// =========================================================================
export async function exportEvaluasiToPdf(
  evaluasiList: GardaEvaluasiRecord[],
  stats: GardaEvaluasiSummaryStats
): Promise<void> {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const nowFormatted = formatTanggalIndo(new Date());

  // 1. Ambil Logo Resmi
  const [logoBbpomBase64, logoGardaBase64] = await Promise.all([
    getImageBase64("/assets-landingpage/logo.png"),
    getImageBase64("/assets-landingpage/garda_ampera_logo.png"),
  ]);

  if (logoBbpomBase64) {
    try {
      doc.addImage(logoBbpomBase64, "PNG", 14, 8, 20, 20);
    } catch (e) {
      console.warn("Gagal render logo bbpom di PDF:", e);
    }
  }

  if (logoGardaBase64) {
    try {
      doc.addImage(logoGardaBase64, "PNG", pageWidth - 34, 8, 20, 20);
    } catch (e) {
      console.warn("Gagal render logo garda di PDF:", e);
    }
  }

  // 2. Teks Kop Surat Resmi BBPOM Palembang
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(11, 42, 107); // Navy #0b2a6b
  doc.text("BADAN PENGAWAS OBAT DAN MAKANAN", pageWidth / 2, 12, { align: "center" });
  doc.text("BALAI BESAR PENGAWAS OBAT DAN MAKANAN DI PALEMBANG", pageWidth / 2, 17, {
    align: "center",
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(
    "Jl. Pangeran Ratu, Jakabaring, Palembang, Sumatera Selatan 30252 | Telp: (0711) 510042 | Email: bpom_palembang@pom.go.id",
    pageWidth / 2,
    22,
    { align: "center" }
  );

  // Garis Pembatas Kop Surat Ganda
  doc.setDrawColor(11, 42, 107);
  doc.setLineWidth(0.8);
  doc.line(14, 27, pageWidth - 14, 27);
  doc.setLineWidth(0.3);
  doc.line(14, 28, pageWidth - 14, 28);

  // 3. Judul Dokumen Laporan
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.text(
    "LAPORAN REKAPITULASI HASIL EVALUASI & SURVEI KEPUASAN PESERTA GARDA AMPERA",
    pageWidth / 2,
    34,
    { align: "center" }
  );

  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Waktu Cetak: ${nowFormatted} | Dicetak oleh: Administrator Sistem Informasi AMPERA`,
    pageWidth / 2,
    38,
    { align: "center" }
  );

  // 4. Kotak Ringkasan KPI Evaluasi
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 41, pageWidth - 28, 14, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);

  const kpiItems = [
    { label: "Total Responden", val: `${stats.totalResponden} Peserta`, color: [11, 42, 107] },
    { label: "Indeks Kepuasan", val: `★ ${stats.rataRataKeseluruhan} / 5.0`, color: [217, 119, 6] },
    { label: "1. Kemudahan", val: `★ ${stats.rataRataKemudahan}`, color: [15, 23, 42] },
    { label: "2. Materi", val: `★ ${stats.rataRataMateri}`, color: [15, 23, 42] },
    { label: "3. Soal Ujian", val: `★ ${stats.rataRataSoal}`, color: [15, 23, 42] },
    { label: "4. Manfaat", val: `★ ${stats.rataRataManfaat}`, color: [15, 23, 42] },
    { label: "Tingkat Kepuasan", val: `${stats.persentasePuas}% Puas`, color: [4, 120, 87] },
  ];

  const colWidth = (pageWidth - 28) / kpiItems.length;
  kpiItems.forEach((kpi, idx) => {
    const xPos = 14 + idx * colWidth + colWidth / 2;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(kpi.label, xPos, 46, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(kpi.color[0], kpi.color[1], kpi.color[2]);
    doc.text(kpi.val, xPos, 51, { align: "center" });
  });

  // 5. Tabel Data Evaluasi Peserta via autoTable
  const tableData = evaluasiList.map((e, idx) => {
    return [
      (idx + 1).toString(),
      e.nama,
      e.nik,
      e.instansi || "-",
      formatTanggalPendek(e.tanggalTes),
      `${e.ratingKemudahan} ★`,
      `${e.ratingMateri} ★`,
      `${e.ratingSoal} ★`,
      `${e.ratingManfaat} ★`,
      `${e.rataRata} ★`,
      e.kritikSaran || "-",
    ];
  });

  autoTable(doc, {
    startY: 58,
    head: [
      [
        "No",
        "Nama Peserta",
        "NIK (KTP)",
        "Instansi",
        "Tanggal",
        "Kemudahan",
        "Materi",
        "Soal",
        "Manfaat",
        "Rata-rata",
        "Kritik, Masukan & Saran Peserta",
      ],
    ],
    body: tableData,
    theme: "striped",
    headStyles: {
      fillColor: [11, 42, 107], // Biru Navy
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
      halign: "center",
      valign: "middle",
    },
    styles: {
      font: "helvetica",
      fontSize: 7.5,
      cellPadding: 2,
      textColor: [30, 41, 59],
      valign: "middle",
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 8, halign: "center" },
      1: { cellWidth: 32 },
      2: { cellWidth: 24, font: "courier" },
      3: { cellWidth: 32 },
      4: { cellWidth: 16, halign: "center" },
      5: { cellWidth: 16, halign: "center", fontStyle: "bold" },
      6: { cellWidth: 16, halign: "center", fontStyle: "bold" },
      7: { cellWidth: 16, halign: "center", fontStyle: "bold" },
      8: { cellWidth: 16, halign: "center", fontStyle: "bold" },
      9: {
        cellWidth: 16,
        halign: "center",
        fontStyle: "bold",
        textColor: [217, 119, 6],
      },
      10: { cellWidth: "auto", fontStyle: "italic" },
    },
    didDrawPage: (data) => {
      // Footer Nomor Halaman
      const pageNumber = data.pageNumber;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `Halaman ${pageNumber} | Dokumen Resmi Balai Besar POM di Palembang`,
        pageWidth / 2,
        pageHeight - 8,
        { align: "center" }
      );
    },
    margin: { left: 14, right: 14, top: 12, bottom: 12 },
  });

  // 6. Simpan File PDF ke Browser
  doc.save(
    `Laporan_Evaluasi_Garda_Ampera_${new Date().toISOString().slice(0, 10)}.pdf`
  );
}

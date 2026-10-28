import ExcelJS from "exceljs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { PenilaianItem, PenilaianStats } from "@/app/actions/admin-penilaian";

function formatTanggalIndo(dateInput: Date | string): string {
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }) + " WIB";
}

function formatTanggalPendek(dateInput: Date | string): string {
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

const getLabelKualitas = (val: number) => {
  switch (val) {
    case 5:
      return "Sangat Baik (5)";
    case 4:
      return "Baik (4)";
    case 3:
      return "Cukup (3)";
    case 2:
      return "Buruk (2)";
    default:
      return "Sangat Buruk (1)";
  }
};

const getLabelManfaat = (val: number) => {
  switch (val) {
    case 5:
      return "Sangat Bermanfaat (5)";
    case 4:
      return "Bermanfaat (4)";
    case 3:
      return "Cukup Bermanfaat (3)";
    case 2:
      return "Kurang Bermanfaat (2)";
    default:
      return "Tidak Bermanfaat (1)";
  }
};

/**
 * Ekspor Rekapitulasi Data Survei IKM ke Berkas Excel (.xlsx)
 */
export async function exportPenilaianExcel(
  list: PenilaianItem[],
  stats: PenilaianStats
) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Sistem Informasi AMPERA - BBPOM di Palembang";
  workbook.lastModifiedBy = "Admin BBPOM Palembang";
  workbook.created = new Date();
  workbook.modified = new Date();

  const worksheet = workbook.addWorksheet("Rekap Penilaian IKM", {
    views: [{ state: "frozen", xSplit: 0, ySplit: 7 }],
    pageSetup: { orientation: "landscape", paperSize: 9 }, // A4 Landscape
  });

  // 1. Kop Dokumen
  worksheet.mergeCells("A1:K1");
  const titleCell = worksheet.getCell("A1");
  titleCell.value = "BADAN PENGAWAS OBAT DAN MAKANAN - BALAI BESAR POM DI PALEMBANG";
  titleCell.font = { name: "Segoe UI", size: 13, bold: true, color: { argb: "FF06132F" } };
  titleCell.alignment = { vertical: "middle", horizontal: "center" };

  worksheet.mergeCells("A2:K2");
  const subTitleCell = worksheet.getCell("A2");
  subTitleCell.value = "REKAPITULASI DATA SURVEI KEPUASAN MASYARAKAT (IKM) SISTEM AMPERA";
  subTitleCell.font = { name: "Segoe UI", size: 11, bold: true, color: { argb: "FFFF7A1A" } };
  subTitleCell.alignment = { vertical: "middle", horizontal: "center" };

  worksheet.mergeCells("A3:K3");
  const metaCell = worksheet.getCell("A3");
  metaCell.value = `Waktu Ekspor: ${formatTanggalIndo(new Date())} | Total Responden: ${stats.totalSurvei} | Rata-Rata Bintang: ${stats.avgRatingBintang}/5 | Skor IKM: ${stats.skorIkm}/100 (${stats.mutuPelayanan})`;
  metaCell.font = { name: "Segoe UI", size: 9, italic: true, color: { argb: "FF64748B" } };
  metaCell.alignment = { vertical: "middle", horizontal: "center" };

  worksheet.addRow([]);

  // Baris Ringkasan KPI
  const kpiRow = worksheet.addRow([
    "RINGKASAN IKM:",
    `Total Responden: ${stats.totalSurvei}`,
    `Rating Bintang: ${stats.avgRatingBintang} / 5.0`,
    `Skor IKM: ${stats.skorIkm} / 100`,
    `Mutu: ${stats.mutuPelayanan}`,
    `Pelayanan (Kualitas): ${stats.avgKualitasPelayanan}/5`,
    `Pelayanan (Manfaat): ${stats.avgManfaatPelayanan}/5`,
    `Website (Kualitas): ${stats.avgKualitasWebsite}/5`,
    `Website (Manfaat): ${stats.avgManfaatWebsite}/5`,
  ]);
  kpiRow.font = { name: "Segoe UI", size: 9, bold: true, color: { argb: "FF06132F" } };
  kpiRow.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFF0F7FF" },
    };
    cell.border = {
      top: { style: "thin", color: { argb: "FFCBD5E1" } },
      bottom: { style: "thin", color: { argb: "FFCBD5E1" } },
    };
  });

  worksheet.addRow([]);

  // Header Kolom Tabel
  const headers = [
    "NO",
    "TANGGAL SUBMIT",
    "NO. TIKET",
    "NAMA PEMOHON",
    "INSTANSI / ALAMAT",
    "JENIS LAYANAN",
    "RATING BINTANG",
    "KUALITAS PELAYANAN",
    "MANFAAT PELAYANAN",
    "KUALITAS WEBSITE",
    "MANFAAT WEBSITE",
  ];

  const headerRow = worksheet.addRow(headers);
  headerRow.height = 26;
  headerRow.font = { name: "Segoe UI", size: 9, bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF06132F" },
    };
    cell.border = {
      top: { style: "thin", color: { argb: "FF334155" } },
      bottom: { style: "medium", color: { argb: "FFFF7A1A" } },
    };
  });

  // Isi Data
  list.forEach((item, idx) => {
    const row = worksheet.addRow([
      idx + 1,
      formatTanggalPendek(item.createdAt),
      item.pengajuan.kodePengajuan,
      item.pengajuan.tamu.nama,
      item.pengajuan.tamu.asalInstansi || item.pengajuan.tamu.alamat || "-",
      item.pengajuan.layanan.nama,
      `${item.ratingBintang} Bintang`,
      getLabelKualitas(item.kualitasPelayanan),
      getLabelManfaat(item.manfaatPelayanan),
      getLabelKualitas(item.kualitasWebsite),
      getLabelManfaat(item.manfaatWebsite),
    ]);

    row.height = 22;
    row.font = { name: "Segoe UI", size: 9 };
    row.alignment = { vertical: "middle" };

    // Zebra striping
    if (idx % 2 === 1) {
      row.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF8FAFC" },
        };
      });
    }

    row.getCell(1).alignment = { vertical: "middle", horizontal: "center" };
    row.getCell(2).alignment = { vertical: "middle", horizontal: "center" };
    row.getCell(3).alignment = { vertical: "middle", horizontal: "center" };
    row.getCell(7).alignment = { vertical: "middle", horizontal: "center" };
    row.getCell(8).alignment = { vertical: "middle", horizontal: "center" };
    row.getCell(9).alignment = { vertical: "middle", horizontal: "center" };
    row.getCell(10).alignment = { vertical: "middle", horizontal: "center" };
    row.getCell(11).alignment = { vertical: "middle", horizontal: "center" };
  });

  // Auto-width columns
  worksheet.columns = [
    { width: 6 },  // No
    { width: 14 }, // Tanggal
    { width: 22 }, // No Tiket
    { width: 22 }, // Nama Pemohon
    { width: 24 }, // Instansi
    { width: 26 }, // Layanan
    { width: 15 }, // Rating Bintang
    { width: 20 }, // Kualitas Pelayanan
    { width: 20 }, // Manfaat Pelayanan
    { width: 20 }, // Kualitas Website
    { width: 20 }, // Manfaat Website
  ];

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `Rekap_Survei_IKM_BBPOM_Palembang_${new Date().toISOString().slice(0, 10)}.xlsx`;
  anchor.click();
  window.URL.revokeObjectURL(url);
}

/**
 * Ekspor Rekapitulasi Data Survei IKM ke Berkas PDF Resmi
 */
export async function exportPenilaianPdf(
  list: PenilaianItem[],
  stats: PenilaianStats
) {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // 1. Kop Laporan
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(6, 19, 47);
  doc.text("BALAI BESAR POM DI PALEMBANG", pageWidth / 2, 14, { align: "center" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 122, 26);
  doc.text("LAPORAN INDEKS KEPUASAN MASYARAKAT (IKM) SISTEM AMPERA", pageWidth / 2, 20, {
    align: "center",
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Waktu Cetak: ${formatTanggalIndo(new Date())} | Dasar Regulasi: PermenPAN-RB No. 14 Tahun 2017`,
    pageWidth / 2,
    25,
    { align: "center" }
  );

  // Garis Pembatas
  doc.setDrawColor(255, 122, 26);
  doc.setLineWidth(0.8);
  doc.line(14, 28, pageWidth - 14, 28);

  // 2. Kotak Ringkasan Statistik KPI
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 32, pageWidth - 28, 16, 2, 2, "F");

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(6, 19, 47);

  const kpiText = `Total Responden: ${stats.totalSurvei}  |  Rata-Rata Bintang: ${stats.avgRatingBintang} / 5.0  |  Skor IKM: ${stats.skorIkm} / 100 (${stats.mutuPelayanan})  |  Pelayanan Petugas: ${stats.avgKualitasPelayanan}/5  |  Website AMPERA: ${stats.avgKualitasWebsite}/5`;
  doc.text(kpiText, pageWidth / 2, 41, { align: "center" });

  // 3. Tabel Rekap Data
  const tableData = list.map((item, idx) => [
    idx + 1,
    formatTanggalPendek(item.createdAt),
    item.pengajuan.kodePengajuan,
    item.pengajuan.tamu.nama,
    item.pengajuan.tamu.asalInstansi || "-",
    item.pengajuan.layanan.nama,
    `${item.ratingBintang} ★`,
    getLabelKualitas(item.kualitasPelayanan),
    getLabelManfaat(item.manfaatPelayanan),
    getLabelKualitas(item.kualitasWebsite),
    getLabelManfaat(item.manfaatWebsite),
  ]);

  autoTable(doc, {
    startY: 52,
    head: [
      [
        "No",
        "Tanggal",
        "No. Tiket",
        "Pemohon",
        "Instansi",
        "Jenis Layanan",
        "Rating",
        "Kualitas Pel.",
        "Manfaat Pel.",
        "Kualitas Web",
        "Manfaat Web",
      ],
    ],
    body: tableData,
    theme: "striped",
    headStyles: {
      fillColor: [6, 19, 47],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 7.5,
      halign: "center",
    },
    bodyStyles: {
      fontSize: 7,
      textColor: [30, 41, 59],
      cellPadding: 2,
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 8 },
      1: { halign: "center", cellWidth: 16 },
      2: { halign: "center", cellWidth: 26 },
      3: { cellWidth: 24 },
      4: { cellWidth: 24 },
      5: { cellWidth: 32 },
      6: { halign: "center", cellWidth: 14 },
      7: { halign: "center", cellWidth: 26 },
      8: { halign: "center", cellWidth: 26 },
      9: { halign: "center", cellWidth: 26 },
      10: { halign: "center", cellWidth: 26 },
    },
    margin: { left: 14, right: 14 },
    didDrawPage: (data) => {
      // Footer Nomor Halaman
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(148, 163, 184);
      doc.text(
        `Halaman ${data.pageNumber}`,
        pageWidth - 20,
        pageHeight - 6,
        { align: "right" }
      );
      doc.text(
        "Sistem Pelayanan Terpadu AMPERA - Balai Besar POM di Palembang",
        14,
        pageHeight - 6
      );
    },
  });

  doc.save(`Laporan_Survei_IKM_BBPOM_Palembang_${new Date().toISOString().slice(0, 10)}.pdf`);
}

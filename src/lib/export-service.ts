import type { PengajuanItem, PenggunaItem, DataAmperaStats } from "@/app/actions/data-ampera";

/**
 * Format tanggal Indonesia lengkap (cth: "Rabu, 28 Oktober 2026, 10.30 WIB")
 */
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
 * Menghitung durasi penyelesaian antara waktu masuk (createdAt) dan waktu selesai (updatedAt)
 */
function formatDurasiPenyelesaian(
  startDate: Date | string,
  endDate: Date | string
): string {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  if (isNaN(start) || isNaN(end)) return "-";
  const diffMs = Math.max(0, end - start);
  const totalMinutes = Math.floor(diffMs / (1000 * 60));

  if (totalMinutes < 1) {
    const seconds = Math.max(1, Math.floor(diffMs / 1000));
    return `${seconds} detik`;
  }

  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days} hari`);
  if (hours > 0) parts.push(`${hours} jam`);
  if (minutes > 0) parts.push(`${minutes} menit`);

  return parts.join(" ");
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
// 1. GENERATOR EXCEL PROFESIONAL (.XLSX)
// =========================================================================

interface ExportExcelOptions {
  activeTab: "PENGAJUAN" | "PENGGUNA";
  pengajuanList?: PengajuanItem[];
  penggunaList?: PenggunaItem[];
  stats: DataAmperaStats;
  serviceTitle?: string;
}

export async function exportToExcelProfessional({
  activeTab,
  pengajuanList = [],
  penggunaList = [],
  stats,
  serviceTitle = "Data Pengguna & Layanan Ampera",
}: ExportExcelOptions) {
  const ExcelJS = (await import("exceljs")).default;
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Sistem Informasi AMPERA - BBPOM di Palembang";
  workbook.lastModifiedBy = "Admin BBPOM Palembang";
  workbook.created = new Date();
  workbook.modified = new Date();

  const nowFormatted = formatTanggalIndo(new Date());

  if (activeTab === "PENGAJUAN") {
    const worksheet = workbook.addWorksheet("Rekap Pengajuan", {
      views: [{ state: "frozen", xSplit: 0, ySplit: 7 }],
      pageSetup: { orientation: "landscape", paperSize: 9 }, // A4 Landscape
    });

    // 1. Judul & Kop Dokumen Excel
    worksheet.mergeCells("A1:N1");
    const titleCell = worksheet.getCell("A1");
    titleCell.value = "BADAN PENGAWAS OBAT DAN MAKANAN - BALAI BESAR POM DI PALEMBANG";
    titleCell.font = { name: "Segoe UI", size: 14, bold: true, color: { argb: "FF06132F" } };
    titleCell.alignment = { vertical: "middle", horizontal: "center" };

    worksheet.mergeCells("A2:N2");
    const subTitleCell = worksheet.getCell("A2");
    subTitleCell.value = `REKAPITULASI LAPORAN LAYANAN PUBLIK (${serviceTitle.toUpperCase()})`;
    subTitleCell.font = { name: "Segoe UI", size: 11, bold: true, color: { argb: "FFFF7A1A" } };
    subTitleCell.alignment = { vertical: "middle", horizontal: "center" };

    worksheet.mergeCells("A3:N3");
    const metaCell = worksheet.getCell("A3");
    metaCell.value = `Waktu Ekspor: ${nowFormatted} | Total Pengajuan: ${pengajuanList.length} berkas | Terverifikasi Selesai: ${stats.selesai} | Sedang Diproses: ${stats.sedangDiproses} | Menunggu: ${stats.menungguVerifikasi} | Ditolak: ${stats.ditolak}`;
    metaCell.font = { name: "Segoe UI", size: 9, italic: true, color: { argb: "FF64748B" } };
    metaCell.alignment = { vertical: "middle", horizontal: "center" };

    // Baris 4-6 spacer & KPI styling
    worksheet.addRow([]);
    const kpiRow = worksheet.addRow([
      "RINGKASAN METRIK:",
      `Total: ${pengajuanList.length}`,
      `Menunggu: ${stats.menungguVerifikasi}`,
      `Diproses: ${stats.sedangDiproses}`,
      `Selesai: ${stats.selesai}`,
      `Ditolak: ${stats.ditolak}`,
    ]);
    kpiRow.font = { name: "Segoe UI", size: 9, bold: true };
    kpiRow.eachCell((cell, colNumber) => {
      if (colNumber > 1 && colNumber <= 6) {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF1F5F9" },
        };
        cell.border = {
          top: { style: "thin", color: { argb: "FFE2E8F0" } },
          bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
          left: { style: "thin", color: { argb: "FFE2E8F0" } },
          right: { style: "thin", color: { argb: "FFE2E8F0" } },
        };
      }
    });

    worksheet.addRow([]); // Baris 6 kosong

    // 2. Baris Header Tabel (Baris 7)
    const headerRow = worksheet.addRow([
      "No",
      "Kode Pengajuan",
      "Tanggal Masuk",
      "Status",
      "Durasi Penyelesaian",
      "Layanan BBPOM",
      "Nama Pemohon",
      "NIK (KTP)",
      "No. WhatsApp",
      "Email",
      "Domisili / Instansi",
      "Rincian / Kebutuhan",
      "Catatan Petugas BBPOM",
      "Bukti Lampiran Tindakan",
    ]);

    headerRow.height = 32;
    headerRow.eachCell((cell) => {
      cell.font = { name: "Segoe UI", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF06132F" }, // Navy BBPOM
      };
      cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
      cell.border = {
        top: { style: "medium", color: { argb: "FF06132F" } },
        bottom: { style: "medium", color: { argb: "FF06132F" } },
        left: { style: "thin", color: { argb: "FF334155" } },
        right: { style: "thin", color: { argb: "FF334155" } },
      };
    });

    // 3. Baris Data Pengajuan
    pengajuanList.forEach((p, idx) => {
      const ringkasan =
        p.produkDicurigai ||
        p.informasiDibutuhkan ||
        p.isiPengaduan ||
        p.rincianInformasiKip ||
        "-";

      const durasiStr =
        p.status === "SELESAI"
          ? `Selesai dalam ${formatDurasiPenyelesaian(p.createdAt, p.updatedAt)}`
          : "-";

      const row = worksheet.addRow([
        idx + 1,
        p.kodePengajuan,
        formatTanggalPendek(p.createdAt),
        p.status.replace("_", " "),
        durasiStr,
        p.layanan.nama,
        p.tamu.nama,
        String(p.tamu.nik), // Text mode for NIK
        p.tamu.telepon || "-",
        p.tamu.email || "-",
        p.tamu.alamat || p.tamu.asalInstansi || "-",
        ringkasan,
        p.catatanPetugas || "-",
        p.lampiranTindakan && p.lampiranTindakan.length > 0
          ? `${p.lampiranTindakan.length} Berkas Bukti`
          : "Tidak Ada",
      ]);

      row.height = 24;

      // Styling Data Sel
      row.eachCell((cell, colNumber) => {
        cell.font = { name: "Segoe UI", size: 9 };
        cell.alignment = { vertical: "middle", wrapText: true };
        cell.border = {
          top: { style: "thin", color: { argb: "FFE2E8F0" } },
          bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
          left: { style: "thin", color: { argb: "FFE2E8F0" } },
          right: { style: "thin", color: { argb: "FFE2E8F0" } },
        };

        // Zebra striping lembut
        if (idx % 2 === 1) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF8FAFC" },
          };
        }

        // Alignments khusus
        if (colNumber === 1 || colNumber === 3 || colNumber === 5 || colNumber === 14) {
          cell.alignment = { vertical: "middle", horizontal: "center" };
        }

        // Format Text untuk NIK dan Telepon (Mencegah scientific notation 1.671E+15)
        if (colNumber === 8 || colNumber === 9) {
          cell.numFmt = "@";
          cell.alignment = { vertical: "middle", horizontal: "center" };
        }

        // Styling Badge Status (Kolom 4)
        if (colNumber === 4) {
          cell.alignment = { vertical: "middle", horizontal: "center" };
          if (p.status === "SELESAI") {
            cell.font = { name: "Segoe UI", size: 9, bold: true, color: { argb: "FF065F46" } };
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFD1FAE5" } };
          } else if (p.status === "DIPROSES") {
            cell.font = { name: "Segoe UI", size: 9, bold: true, color: { argb: "FF0369A1" } };
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE0F2FE" } };
          } else if (p.status === "MENUNGGU_VERIFIKASI") {
            cell.font = { name: "Segoe UI", size: 9, bold: true, color: { argb: "FF92400E" } };
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFEF3C7" } };
          } else if (p.status === "DITOLAK") {
            cell.font = { name: "Segoe UI", size: 9, bold: true, color: { argb: "FF9F1239" } };
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFE4E6" } };
          }
        }

        // Styling Kolom Durasi Penyelesaian (Kolom 5) jika Selesai
        if (colNumber === 5 && p.status === "SELESAI") {
          cell.font = { name: "Segoe UI", size: 9, bold: true, color: { argb: "FF065F46" } };
        }
      });
    });

    // Auto-fit kolom dengan padding rapi
    worksheet.columns.forEach((column, i) => {
      let maxLen = 12;
      column.eachCell?.({ includeEmpty: false }, (cell, rowNumber) => {
        if (rowNumber >= 7) {
          const cellLen = cell.value ? String(cell.value).length : 0;
          if (cellLen > maxLen) maxLen = Math.min(cellLen, 50);
        }
      });
      column.width = Math.max(maxLen + 3, i === 0 ? 6 : 14);
    });

    // Aktifkan AutoFilter Excel
    worksheet.autoFilter = {
      from: { row: 7, column: 1 },
      to: { row: 7, column: 14 },
    };
  } else {
    // TAB PENGGUNA (DATA TAMU)
    const worksheet = workbook.addWorksheet("Direktori Pengguna", {
      views: [{ state: "frozen", xSplit: 0, ySplit: 6 }],
      pageSetup: { orientation: "landscape", paperSize: 9 },
    });

    worksheet.mergeCells("A1:I1");
    const titleCell = worksheet.getCell("A1");
    titleCell.value = "BADAN PENGAWAS OBAT DAN MAKANAN - BALAI BESAR POM DI PALEMBANG";
    titleCell.font = { name: "Segoe UI", size: 14, bold: true, color: { argb: "FF06132F" } };
    titleCell.alignment = { vertical: "middle", horizontal: "center" };

    worksheet.mergeCells("A2:I2");
    const subTitleCell = worksheet.getCell("A2");
    subTitleCell.value = "DIREKTORI PENGGUNA TERDAFTAR (DATA PENGGUNA AMPERA BBPOM)";
    subTitleCell.font = { name: "Segoe UI", size: 11, bold: true, color: { argb: "FFFF7A1A" } };
    subTitleCell.alignment = { vertical: "middle", horizontal: "center" };

    worksheet.mergeCells("A3:I3");
    const metaCell = worksheet.getCell("A3");
    metaCell.value = `Waktu Ekspor: ${nowFormatted} | Total Warga Terdaftar: ${penggunaList.length} Orang`;
    metaCell.font = { name: "Segoe UI", size: 9, italic: true, color: { argb: "FF64748B" } };
    metaCell.alignment = { vertical: "middle", horizontal: "center" };

    worksheet.addRow([]);
    worksheet.addRow([]);

    const headerRow = worksheet.addRow([
      "No",
      "Nama Lengkap",
      "NIK KTP (Teks)",
      "Nomor WhatsApp / HP",
      "Alamat Email",
      "Alamat Domisili",
      "Asal Instansi / Lembaga",
      "Total Pengajuan",
      "Terdaftar Sejak",
    ]);

    headerRow.height = 30;
    headerRow.eachCell((cell) => {
      cell.font = { name: "Segoe UI", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF06132F" },
      };
      cell.alignment = { vertical: "middle", horizontal: "center" };
    });

    penggunaList.forEach((u, idx) => {
      const row = worksheet.addRow([
        idx + 1,
        u.nama,
        String(u.nik),
        u.telepon || "-",
        u.email || "-",
        u.alamat || "-",
        u.asalInstansi || "-",
        `${u.totalPengajuan} Kali`,
        formatTanggalPendek(u.createdAt),
      ]);

      row.height = 22;
      row.eachCell((cell, colNumber) => {
        cell.font = { name: "Segoe UI", size: 9 };
        cell.alignment = { vertical: "middle", wrapText: true };
        cell.border = {
          top: { style: "thin", color: { argb: "FFE2E8F0" } },
          bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
          left: { style: "thin", color: { argb: "FFE2E8F0" } },
          right: { style: "thin", color: { argb: "FFE2E8F0" } },
        };

        if (idx % 2 === 1) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF8FAFC" },
          };
        }

        if (colNumber === 1 || colNumber === 8 || colNumber === 9) {
          cell.alignment = { vertical: "middle", horizontal: "center" };
        }

        if (colNumber === 3 || colNumber === 4) {
          cell.numFmt = "@";
          cell.alignment = { vertical: "middle", horizontal: "center" };
        }
      });
    });

    worksheet.columns.forEach((column, i) => {
      let maxLen = 14;
      column.eachCell?.({ includeEmpty: false }, (cell, rowNumber) => {
        if (rowNumber >= 6) {
          const len = cell.value ? String(cell.value).length : 0;
          if (len > maxLen) maxLen = Math.min(len, 45);
        }
      });
      column.width = Math.max(maxLen + 3, i === 0 ? 6 : 14);
    });

    worksheet.autoFilter = {
      from: { row: 6, column: 1 },
      to: { row: 6, column: 9 },
    };
  }

  // Generate File & Trigger Browser Download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `AMPERA-BBPOM-${activeTab.toLowerCase()}-${new Date().toISOString().slice(0, 10)}.xlsx`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

// =========================================================================
// 2. GENERATOR PDF RESMI (A4 LANDSCAPE SIAP CETAK & AUDIT)
// =========================================================================

interface ExportPdfOptions {
  activeTab: "PENGAJUAN" | "PENGGUNA";
  pengajuanList?: PengajuanItem[];
  penggunaList?: PenggunaItem[];
  stats: DataAmperaStats;
  serviceTitle?: string;
}

export async function exportToPdfOfficial({
  activeTab,
  pengajuanList = [],
  penggunaList = [],
  stats,
  serviceTitle = "Data Pengguna & Layanan Ampera",
}: ExportPdfOptions) {
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
  const pageHeight = doc.internal.pageSize.getHeight(); // 210
  const margin = 12;

  // 1. Gambar Kop Surat Resmi: Logo BBPOM (Kiri) & Logo AMPERA (Kanan)
  const [logoBpomBase64, logoAmperaBase64] = await Promise.all([
    getImageBase64("/assets-landingpage/logo-bpom.png"),
    getImageBase64("/assets-landingpage/am.png"),
  ]);

  // Logo BBPOM di Kiri
  if (logoBpomBase64) {
    try {
      doc.addImage(logoBpomBase64, "PNG", margin + 3, margin - 1, 20, 18);
    } catch {
      // Abaikan jika gagal load logo
    }
  }

  // Logo AMPERA (am.png) di Kanan
  if (logoAmperaBase64) {
    try {
      const amperaWidth = 24;
      const amperaHeight = 16.5;
      const amperaX = pageWidth - margin - 3 - amperaWidth;
      doc.addImage(logoAmperaBase64, "PNG", amperaX, margin + 0.5, amperaWidth, amperaHeight);
    } catch {
      // Abaikan jika gagal load logo
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
  const judul =
    activeTab === "PENGAJUAN"
      ? `LAPORAN REKAPITULASI PENGAJUAN LAYANAN MASYARAKAT (${serviceTitle.toUpperCase()})`
      : "LAPORAN DIREKTORI PENGGUNA TERDAFTAR (DATA TAMU AMPERA BBPOM)";
  doc.text(judul, pageWidth / 2, titleY, { align: "center" });

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
  doc.setFillColor(248, 250, 252); // Soft gray
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, kpiBoxY, pageWidth - margin * 2, 6.5, 1.5, 1.5, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);

  if (activeTab === "PENGAJUAN") {
    const kpiText = `Total Pengajuan: ${pengajuanList.length}   |   Menunggu Verifikasi: ${stats.menungguVerifikasi}   |   Sedang Diproses: ${stats.sedangDiproses}   |   Selesai Dilayani: ${stats.selesai}   |   Ditolak: ${stats.ditolak}`;
    doc.text(kpiText, pageWidth / 2, kpiBoxY + 4.3, { align: "center" });
  } else {
    const kpiText = `Total Warga Terdaftar: ${penggunaList.length} Orang   |   Total Pengajuan Diinput: ${stats.totalPengajuan} Kali`;
    doc.text(kpiText, pageWidth / 2, kpiBoxY + 4.3, { align: "center" });
  }

  // 4. Tabel Menggunakan jspdf-autotable
  const startTableY = kpiBoxY + 9;

  if (activeTab === "PENGAJUAN") {
    const tableBody = pengajuanList.map((p, idx) => {
      const ringkasan =
        p.produkDicurigai ||
        p.informasiDibutuhkan ||
        p.isiPengaduan ||
        p.rincianInformasiKip ||
        "-";

      const statusWithDurasi =
        p.status === "SELESAI"
          ? `SELESAI\n(${formatDurasiPenyelesaian(p.createdAt, p.updatedAt)})`
          : p.status.replace("_", " ");

      return [
        idx + 1,
        p.kodePengajuan,
        formatTanggalPendek(p.createdAt),
        `${p.tamu.nama}\nNIK: ${p.tamu.nik}\nWA: ${p.tamu.telepon || "-"}`,
        p.layanan.nama,
        ringkasan,
        p.catatanPetugas || "-",
        statusWithDurasi,
        p.lampiranTindakan && p.lampiranTindakan.length > 0
          ? `${p.lampiranTindakan.length} File`
          : "-",
      ];
    });

    autoTable(doc, {
      startY: startTableY,
      tableWidth: pageWidth - margin * 2,
      margin: { left: margin, right: margin, bottom: 20 },
      head: [
        [
          "No",
          "Kode Tiket",
          "Tgl Masuk",
          "Pemohon & Kontak",
          "Layanan",
          "Rincian / Kebutuhan",
          "Catatan Petugas BBPOM",
          "Status & Durasi",
          "Bukti",
        ],
      ],
      body: tableBody,
      theme: "grid",
      styles: {
        font: "helvetica",
        fontSize: 7,
        cellPadding: 2,
        valign: "middle",
        overflow: "linebreak",
        lineColor: [226, 232, 240],
        lineWidth: 0.2,
      },
      headStyles: {
        fillColor: [6, 19, 47], // Navy #06132F
        textColor: [255, 255, 255],
        fontStyle: "bold",
        halign: "center",
        fontSize: 7.5,
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      columnStyles: {
        0: { cellWidth: 8, halign: "center" },
        1: { cellWidth: 29, fontStyle: "bold" },
        2: { cellWidth: 18, halign: "center" },
        3: { cellWidth: 44 },
        4: { cellWidth: 28 },
        5: { cellWidth: 52 },
        6: { cellWidth: 48 },
        7: { cellWidth: 32, halign: "center", fontStyle: "bold" },
        8: { cellWidth: 14, halign: "center", fontStyle: "bold" },
      },
      didParseCell: (data) => {
        // Warnai sel status agar profesional
        if (data.section === "body" && data.column.index === 7) {
          const val = String(data.cell.raw);
          if (val.startsWith("SELESAI")) {
            data.cell.styles.textColor = [6, 95, 70];
            data.cell.styles.fillColor = [209, 250, 229];
          } else if (val === "DIPROSES") {
            data.cell.styles.textColor = [3, 105, 161];
            data.cell.styles.fillColor = [224, 242, 254];
          } else if (val.includes("MENUNGGU")) {
            data.cell.styles.textColor = [146, 64, 14];
            data.cell.styles.fillColor = [254, 243, 199];
          } else if (val === "DITOLAK") {
            data.cell.styles.textColor = [159, 18, 57];
            data.cell.styles.fillColor = [255, 228, 230];
          }
        }
      },
    });
  } else {
    // TAB PENGGUNA (DATA TAMU)
    const tableBody = penggunaList.map((u, idx) => [
      idx + 1,
      u.nama,
      u.nik,
      u.telepon || "-",
      u.email || "-",
      u.alamat || "-",
      u.asalInstansi || "-",
      `${u.totalPengajuan} Kali`,
      formatTanggalPendek(u.createdAt),
    ]);

    autoTable(doc, {
      startY: startTableY,
      tableWidth: pageWidth - margin * 2,
      margin: { left: margin, right: margin, bottom: 20 },
      head: [
        [
          "No",
          "Nama Lengkap Pemohon",
          "NIK (KTP)",
          "No. Telepon / WA",
          "Alamat Email",
          "Alamat Domisili",
          "Asal Instansi",
          "Total Pengajuan",
          "Terdaftar Sejak",
        ],
      ],
      body: tableBody,
      theme: "grid",
      styles: {
        font: "helvetica",
        fontSize: 7.5,
        cellPadding: 2.2,
        valign: "middle",
        overflow: "linebreak",
        lineColor: [226, 232, 240],
        lineWidth: 0.2,
      },
      headStyles: {
        fillColor: [6, 19, 47],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        halign: "center",
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      columnStyles: {
        0: { cellWidth: 10, halign: "center" },
        1: { cellWidth: 42, fontStyle: "bold" },
        2: { cellWidth: 32, halign: "center" },
        3: { cellWidth: 28, halign: "center" },
        4: { cellWidth: 35 },
        5: { cellWidth: 51 },
        6: { cellWidth: 35 },
        7: { cellWidth: 20, halign: "center", fontStyle: "bold" },
        8: { cellWidth: 20, halign: "center" },
      },
    });
  }

  // 5. Lembar Pengesahan Tanda Tangan & Paging Footer
  const totalPages = (doc as any).internal.getNumberOfPages();

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Footer Tiap Halaman
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);

    doc.text(
      "Dokumen Resmi Sistem Informasi Pelayanan Terpadu (AMPERA) - Balai Besar POM di Palembang",
      margin,
      pageHeight - 8
    );

    doc.text(
      `Halaman ${i} dari ${totalPages}`,
      pageWidth - margin,
      pageHeight - 8,
      { align: "right" }
    );
  }

  // Lembar Tanda Tangan Resmi di Halaman Terakhir
  const lastPage = totalPages;
  doc.setPage(lastPage);

  // Ambil posisi Y akhir tabel
  const finalY = (doc as any).lastAutoTable?.finalY || startTableY;
  const signatureSpaceNeeded = 35;

  let sigY = finalY + 8;
  if (sigY + signatureSpaceNeeded > pageHeight - 12) {
    // Jika tidak muat di halaman akhir, tambahkan halaman penutup baru
    doc.addPage();
    sigY = margin + 15;
  }

  const sigX = pageWidth - margin - 65;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);

  doc.text(`Palembang, ${formatTanggalPendek(new Date())}`, sigX, sigY);
  doc.text("Petugas Penanggung Jawab Pelayanan,", sigX, sigY + 4.5);

  doc.setFont("helvetica", "bold");
  doc.text("( ............................................................ )", sigX, sigY + 24);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text("NIP. .....................................................", sigX, sigY + 28);

  // Trigger Download PDF di Browser
  doc.save(`AMPERA-BBPOM-${activeTab.toLowerCase()}-${new Date().toISOString().slice(0, 10)}.pdf`);
}

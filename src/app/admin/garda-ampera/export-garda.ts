import ExcelJS from "exceljs";
import { GardaPesertaItem, GardaAdminStats } from "@/app/actions/garda-ampera";

export async function exportGardaToExcel(
  pesertaList: GardaPesertaItem[],
  stats: GardaAdminStats
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "BBPOM di Palembang - Portal AMPERA";
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet("Rekap Peserta Garda Ampera", {
    pageSetup: { orientation: "landscape", paperSize: 9 }, // A4 Landscape
  });

  // 1. Judul Header Excel
  worksheet.mergeCells("A1:N1");
  const titleRow1 = worksheet.getCell("A1");
  titleRow1.value = "BADAN PENGAWAS OBAT DAN MAKANAN REPUBLIK INDONESIA";
  titleRow1.font = { name: "Arial", size: 12, bold: true, color: { argb: "FF0B2A6B" } };
  titleRow1.alignment = { horizontal: "center", vertical: "middle" };

  worksheet.mergeCells("A2:N2");
  const titleRow2 = worksheet.getCell("A2");
  titleRow2.value = "BALAI BESAR POM DI PALEMBANG - REKAPITULASI PROGRAM GARDA AMPERA";
  titleRow2.font = { name: "Arial", size: 13, bold: true, color: { argb: "FF0B2A6B" } };
  titleRow2.alignment = { horizontal: "center", vertical: "middle" };

  worksheet.mergeCells("A3:N3");
  const titleRow3 = worksheet.getCell("A3");
  titleRow3.value = `Tanggal Ekspor: ${new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })} | Total: ${stats.totalPeserta} Peserta (Lulus: ${stats.totalLulus}, Remidi: ${stats.totalRemidi})`;
  titleRow3.font = { name: "Arial", size: 10, italic: true, color: { argb: "FF475569" } };
  titleRow3.alignment = { horizontal: "center", vertical: "middle" };

  worksheet.addRow([]); // Blank row

  // 2. Definisi Kolom Tabel
  const headers = [
    "No",
    "NIK",
    "Nama Peserta",
    "Usia",
    "L/P",
    "Pendidikan",
    "Pekerjaan",
    "Instansi / Organisasi",
    "Tanggal Tes",
    "Skor Pre-Test",
    "Skor Post-Test",
    "Status Kelulusan",
    "Nomor Sertifikat",
    "Rating & Saran Evaluasi",
  ];

  const headerRow = worksheet.addRow(headers);
  headerRow.height = 28;
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF0B2A6B" }, // Navy BPOM
    };
    cell.font = { name: "Arial", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    cell.border = {
      top: { style: "thin", color: { argb: "FFCBD5E1" } },
      left: { style: "thin", color: { argb: "FFCBD5E1" } },
      bottom: { style: "thin", color: { argb: "FFCBD5E1" } },
      right: { style: "thin", color: { argb: "FFCBD5E1" } },
    };
  });

  // 3. Masukkan Data Peserta
  pesertaList.forEach((p, index) => {
    const tgl = new Date(p.tanggalTes);
    const tglStr = !isNaN(tgl.getTime())
      ? tgl.toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric" })
      : "-";

    const ratingStr = p.evaluasi
      ? `★ ${(
          (p.evaluasi.ratingKemudahan +
            p.evaluasi.ratingMateri +
            p.evaluasi.ratingSoal +
            p.evaluasi.ratingManfaat) /
          4
        ).toFixed(1)}/5: ${p.evaluasi.kritikSaran || "-"}`
      : "Belum Mengisi";

    const row = worksheet.addRow([
      index + 1,
      p.nik,
      p.nama,
      p.usia,
      p.jenisKelamin === "Laki-laki" ? "L" : "P",
      p.pendidikan,
      p.pekerjaan,
      p.instansi,
      tglStr,
      p.preTestScore !== null ? p.preTestScore : "-",
      p.postTestScore !== null ? p.postTestScore : "-",
      p.isLulus ? "LULUS" : "REMIDI (< 70)",
      p.nomorSertifikat || "-",
      ratingStr,
    ]);

    row.height = 22;
    row.eachCell((cell, colNumber) => {
      cell.font = { name: "Arial", size: 9.5 };
      cell.border = {
        top: { style: "thin", color: { argb: "FFE2E8F0" } },
        left: { style: "thin", color: { argb: "FFE2E8F0" } },
        bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
        right: { style: "thin", color: { argb: "FFE2E8F0" } },
      };

      // Alignment per kolom
      if ([1, 4, 5, 9, 10, 11, 12].includes(colNumber)) {
        cell.alignment = { horizontal: "center", vertical: "middle" };
      } else {
        cell.alignment = { horizontal: "left", vertical: "middle" };
      }

      // Highlight Status Kelulusan
      if (colNumber === 12) {
        if (p.isLulus) {
          cell.font = { name: "Arial", size: 9.5, bold: true, color: { argb: "FF059669" } }; // Green
        } else {
          cell.font = { name: "Arial", size: 9.5, bold: true, color: { argb: "FFDC2626" } }; // Red
        }
      }
    });
  });

  // 4. Lebar Kolom
  worksheet.getColumn(1).width = 6; // No
  worksheet.getColumn(2).width = 20; // NIK
  worksheet.getColumn(3).width = 26; // Nama
  worksheet.getColumn(4).width = 8; // Usia
  worksheet.getColumn(5).width = 7; // L/P
  worksheet.getColumn(6).width = 18; // Pendidikan
  worksheet.getColumn(7).width = 24; // Pekerjaan
  worksheet.getColumn(8).width = 28; // Instansi
  worksheet.getColumn(9).width = 14; // Tanggal
  worksheet.getColumn(10).width = 14; // Pre-Test
  worksheet.getColumn(11).width = 14; // Post-Test
  worksheet.getColumn(12).width = 18; // Status
  worksheet.getColumn(13).width = 26; // No Sertifikat
  worksheet.getColumn(14).width = 36; // Evaluasi

  // 5. Download di Browser
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `Rekap-Garda-Ampera-BBPOM-${new Date().toISOString().split("T")[0]}.xlsx`;
  anchor.click();
  window.URL.revokeObjectURL(url);
}

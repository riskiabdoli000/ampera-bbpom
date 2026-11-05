/**
 * Utilitas Validasi & Parsing NIK (Nomor Induk Kependudukan) Republik Indonesia
 *
 * Struktur 16 digit NIK berdasarkan UU Administrasi Kependudukan:
 * - Digit 1-6   : Kode Wilayah (Provinsi, Kabupaten/Kota, Kecamatan)
 * - Digit 7-8   : Tanggal Lahir
 *                 - Laki-laki : 01 s.d. 31
 *                 - Perempuan : 41 s.d. 71 (tanggal lahir asli 1-31 ditambah 40)
 * - Digit 9-10  : Bulan Lahir (01 s.d. 12)
 * - Digit 11-12 : 2 Digit Terakhir Tahun Lahir (00 s.d. 99)
 * - Digit 13-16 : Nomor Urut Registrasi Penduduk
 */

const NAMA_BULAN = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export interface NikDetails {
  kodeWilayah: string;
  tanggalLahir: number;
  bulanLahir: number;
  namaBulan: string;
  tahunLahir: number;
  duaDigitTahun: string;
  jenisKelamin: "Laki-laki" | "Perempuan";
  perkiraanUmur: number;
  formattedTglLahir: string;
  nomorUrut: string;
}

export interface NikValidationResult {
  isValid: boolean;
  message?: string;
  details?: NikDetails;
}

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function getDaysInMonth(month: number, year: number): number {
  if (month === 2) {
    return isLeapYear(year) ? 29 : 28;
  }
  if ([4, 6, 9, 11].includes(month)) {
    return 30;
  }
  return 31;
}

/**
 * Validasi kelayakan NIK 16 digit sesuai aturan Dukcapil Indonesia.
 */
export function validateNik(nikInput?: string | null): NikValidationResult {
  const raw = (nikInput || "").trim();

  // 1. Wajib diisi
  if (!raw) {
    return {
      isValid: false,
      message: "Nomor Induk Kependudukan (NIK) wajib diisi.",
    };
  }

  const INVALID_MSG = "NIK tidak valid, periksa kembali NIK anda";

  // 2. Hanya boleh karakter angka
  if (!/^\d+$/.test(raw)) {
    return {
      isValid: false,
      message: INVALID_MSG,
    };
  }

  // 3. Tepat 16 digit (tidak boleh lebih dan tidak boleh kurang)
  if (raw.length !== 16) {
    return {
      isValid: false,
      message: INVALID_MSG,
    };
  }

  // 4. Validasi Digit 7-8: Tanggal Lahir
  // Laki-laki: 01 s.d. 31, Perempuan: 41 s.d. 71
  const rawDay = parseInt(raw.slice(6, 8), 10);
  const isPria = rawDay >= 1 && rawDay <= 31;
  const isWanita = rawDay >= 41 && rawDay <= 71;

  if (!isPria && !isWanita) {
    return {
      isValid: false,
      message: INVALID_MSG,
    };
  }

  const actualDay = isWanita ? rawDay - 40 : rawDay;
  const jenisKelamin = isWanita ? "Perempuan" : "Laki-laki";

  // 5. Validasi Digit 9-10: Bulan Lahir (01 s.d. 12)
  const month = parseInt(raw.slice(8, 10), 10);
  if (month < 1 || month > 12) {
    return {
      isValid: false,
      message: INVALID_MSG,
    };
  }

  // 6. Validasi Digit 11-12: 2 digit tahun lahir
  const yyStr = raw.slice(10, 12);
  const yyNum = parseInt(yyStr, 10);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentCenturyBase = Math.floor(currentYear / 100) * 100;

  // Asumsi: jika 2000 + yy > tahun saat ini, maka lahir pada abad sebelumnya (1900-an)
  let birthYear = currentCenturyBase + yyNum;
  if (birthYear > currentYear) {
    birthYear -= 100;
  }

  // 7. Validasi apakah tanggal tersebut ada pada bulan dan tahun bersangkutan
  const maxDays = getDaysInMonth(month, birthYear);
  if (actualDay > maxDays) {
    return {
      isValid: false,
      message: INVALID_MSG,
    };
  }

  // 8. Hitung perkiraan umur
  let age = currentYear - birthYear;
  const currentMonth = now.getMonth() + 1;
  const currentDate = now.getDate();
  if (currentMonth < month || (currentMonth === month && currentDate < actualDay)) {
    age -= 1;
  }
  if (age < 0) age = 0;

  const namaBulan = NAMA_BULAN[month - 1];
  const formattedTglLahir = `${actualDay} ${namaBulan} ${birthYear}`;

  return {
    isValid: true,
    details: {
      kodeWilayah: raw.slice(0, 6),
      tanggalLahir: actualDay,
      bulanLahir: month,
      namaBulan,
      tahunLahir: birthYear,
      duaDigitTahun: yyStr,
      jenisKelamin,
      perkiraanUmur: age,
      formattedTglLahir,
      nomorUrut: raw.slice(12, 16),
    },
  };
}


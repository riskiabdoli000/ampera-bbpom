import { SoalKuis } from "./cindoTypes";

/**
 * BANK SOAL CINDO - BBPOM PALEMBANG
 * 
 * CATATAN PENGEMBANG:
 * Untuk menambahkan soal baru, Anda cukup menambahkan objek soal baru ke dalam array `BANK_SOAL_CINDO` di bawah ini.
 * Format standar:
 * {
 *   id: number (unik),
 *   pertanyaan: "Teks pertanyaan",
 *   pilihan: [{ key: "A", teks: "..." }, { key: "B", teks: "..." }, { key: "C", teks: "..." }, { key: "D", teks: "..." }],
 *   jawabanBenar: "A" | "B" | "C" | "D",
 *   kategori: "Kategori Soal",
 *   penjelasan: "Penjelasan jawaban"
 * }
 */
export const BANK_SOAL_CINDO: SoalKuis[] = [
  {
    id: 1,
    pertanyaan: "Apa kepanjangan dari slogan 'Cek KLIK' yang selalu disosialisasikan oleh Badan POM?",
    pilihan: [
      { key: "A", teks: "Cek Kemasan, Label, Izin Edar, Kedaluwarsa" },
      { key: "B", teks: "Cek Kandungan, Lokasi, Izin Edar, Kebersihan" },
      { key: "C", teks: "Cek Kualitas, Legalitas, Informasi, Khasiat" },
      { key: "D", teks: "Cek Komposisi, Label, Izin Usaha, Kelayakan" },
    ],
    jawabanBenar: "A",
    kategori: "Prinsip Cek KLIK",
    penjelasan: "Cek KLIK adalah panduan BPOM untuk memeriksa Kemasan, Label, Izin Edar, dan Kedaluwarsa sebelum membeli produk pangan/obat.",
  },
  {
    id: 2,
    pertanyaan: "Zat kimia berbahaya pengawet mayat yang sering kali disalahgunakan oknum nakal pada tahu atau mie basah adalah...",
    pilihan: [
      { key: "A", teks: "Natrium Benzoat" },
      { key: "B", teks: "Formalin" },
      { key: "C", teks: "Asam Sitrat" },
      { key: "D", teks: "Monosodium Glutamat (MSG)" },
    ],
    jawabanBenar: "B",
    kategori: "Bahan Berbahaya",
    penjelasan: "Formalin adalah larutan formaldehida untuk pengawet spesimen biologi/mayat dan sangat dilarang keras untuk produk makanan.",
  },
  {
    id: 3,
    pertanyaan: "Ciri fisik makanan (seperti bakso atau kerupuk) yang dicurigai mengandung Boraks (bleng/pijer) antara lain...",
    pilihan: [
      { key: "A", teks: "Tekstur sangat kenyal membal, tidak mudah hancur, dan tahan berhari-hari di suhu ruang" },
      { key: "B", teks: "Mudah berlendir dan berbau asam dalam 6 jam" },
      { key: "C", teks: "Warna menjadi sangat pucat keputihan" },
      { key: "D", teks: "Memiliki rasa manis berlebihan" },
    ],
    jawabanBenar: "A",
    kategori: "Bahan Berbahaya",
    penjelasan: "Boraks memberikan tekstur kenyal berlebihan pada makanan olahan daging dan membuatnya tidak mudah basi namun merusak ginjal.",
  },
  {
    id: 4,
    pertanyaan: "Pewarna sintetis non-pangan (pewarna tekstil/kertas) yang sering disalahgunakan menghasilkan warna merah menyala/fluoresen berpendar adalah...",
    pilihan: [
      { key: "A", teks: "Tartrazin" },
      { key: "B", teks: "Karamel" },
      { key: "C", teks: "Rhodamin B" },
      { key: "D", teks: "Klorofil" },
    ],
    jawabanBenar: "C",
    kategori: "Pewarna Terlarang",
    penjelasan: "Rhodamin B adalah zat pewarna tekstil merah menyala yang bersifat karsinogenik dan dilarang digunakan pada pangan olahan.",
  },
  {
    id: 5,
    pertanyaan: "Pewarna tekstil terlarang yang menghasilkan warna kuning cerah pada pangan seperti kerupuk atau tahu kuning adalah...",
    pilihan: [
      { key: "A", teks: "Metanil Yellow" },
      { key: "B", teks: "Kurkumin Kunyit" },
      { key: "C", teks: "Beta Karoten" },
      { key: "D", teks: "Riboflavin" },
    ],
    jawabanBenar: "A",
    kategori: "Pewarna Terlarang",
    penjelasan: "Metanil Yellow merupakan pewarna tekstil kuning yang dilarang keras untuk makanan karena berpotensi merusak hati dan saluran cerna.",
  },
  {
    id: 6,
    pertanyaan: "Aplikasi resmi dari Badan POM yang dapat diunduh masyarakat untuk mengecek keaslian nomor izin edar pangan dan obat melalui ponsel adalah...",
    pilihan: [
      { key: "A", teks: "BPOM Mobile" },
      { key: "B", teks: "Peduli Pangan" },
      { key: "C", teks: "Ampera Guard" },
      { key: "D", teks: "Cek Halal App" },
    ],
    jawabanBenar: "A",
    kategori: "Aplikasi Resmi",
    penjelasan: "Aplikasi BPOM Mobile memungkinkan scan QR/barcode dan input izin edar untuk verifikasi keaslian produk secara langsung.",
  },
  {
    id: 7,
    pertanyaan: "Kode registrasi izin edar pada kemasan produk kosmetik yang terdaftar resmi di Badan POM diawali dengan huruf...",
    pilihan: [
      { key: "A", teks: "MD / ML" },
      { key: "B", teks: "NA / NB / NC / ND" },
      { key: "C", teks: "TR / TI" },
      { key: "D", teks: "P-IRT" },
    ],
    jawabanBenar: "B",
    kategori: "Registrasi Kosmetik",
    penjelasan: "Kode izin edar notifikasi kosmetik Badan POM diawali huruf NA (Asia), NB, NC, ND diikuti rentetan angka unik.",
  },
  {
    id: 8,
    pertanyaan: "Kode izin edar pada produk obat tradisional/jamu lokal yang memenuhi standar Badan POM diawali dengan kode...",
    pilihan: [
      { key: "A", teks: "POM TR" },
      { key: "B", teks: "POM SD" },
      { key: "C", teks: "POM ML" },
      { key: "D", teks: "P-IRT" },
    ],
    jawabanBenar: "A",
    kategori: "Obat Tradisional",
    penjelasan: "POM TR adalah kode registrasi untuk Obat Tradisional Dalam Negeri yang terdaftar resmi di Badan POM.",
  },
  {
    id: 9,
    pertanyaan: "Bahan berbahaya apa yang sering ditemukan pada kosmetik ilegal/krim pemutih wajah berbahaya yang dapat merusak ginjal dan memicu flek hitam parah?",
    pilihan: [
      { key: "A", teks: "Merkuri (Air Raksa) dan Hidrokuinon tanpa resep" },
      { key: "B", teks: "Vitamin C dan Niacinamide" },
      { key: "C", teks: "Zinc Oksida" },
      { key: "D", teks: "Gliserin" },
    ],
    jawabanBenar: "A",
    kategori: "Keamanan Kosmetik",
    penjelasan: "Merkuri adalah logam berat yang sangat beracun dan dilarang digunakan dalam kosmetik pemutih karena merusak saraf dan ginjal.",
  },
  {
    id: 10,
    pertanyaan: "Apa tujuan utama dari layanan 'Pengujian Cepat Ampera' oleh Balai Besar POM di Palembang?",
    pilihan: [
      { key: "A", teks: "Memudahkan masyarakat menguji sampel makanan yang dicurigai mengandung zat kimia berbahaya secara cepat" },
      { key: "B", teks: "Menjual reagen kimia kepada pemilik toko pangan" },
      { key: "C", teks: "Menggantikan seluruh proses laboratorium uji rujukan nasional" },
      { key: "D", teks: "Memberikan izin edar resmi dalam waktu 5 menit" },
    ],
    jawabanBenar: "A",
    kategori: "Layanan Ampera",
    penjelasan: "Pengujian Cepat Ampera BBPOM Palembang adalah layanan partisipasi publik untuk screening awal parameter kimia berbahaya pada makanan.",
  },
  {
    id: 11,
    pertanyaan: "Izin edar produk pangan olahan industri skala rumah tangga yang dikeluarkan oleh Dinas Kesehatan setempat berlabel...",
    pilihan: [
      { key: "A", teks: "P-IRT" },
      { key: "B", teks: "BPOM MD" },
      { key: "C", teks: "BPOM ML" },
      { key: "D", teks: "POM QD" },
    ],
    jawabanBenar: "A",
    kategori: "Regulasi Pangan",
    penjelasan: "P-IRT (Pangan Industri Rumah Tangga) adalah sertifikat izin edar untuk produk pangan industri berskala kecil/rumah tangga.",
  },
  {
    id: 12,
    pertanyaan: "Salah satu dari '5 Kunci Keamanan Pangan' menurut World Health Organization (WHO) dan BPOM adalah...",
    pilihan: [
      { key: "A", teks: "Jagalah kebersihan dan pisahkan pangan mentah dari pangan matang" },
      { key: "B", teks: "Campurkan seluruh bahan masakan dalam satu wadah terbuka" },
      { key: "C", teks: "Simpan makanan matang pada suhu ruangan lebih dari 24 jam" },
      { key: "D", teks: "Gunakan wadah bekas kemasan pestisida yang sudah dicuci" },
    ],
    jawabanBenar: "A",
    kategori: "Keamanan Pangan",
    penjelasan: "5 Kunci Keamanan Pangan: Menjaga kebersihan, memisahkan pangan mentah & matang, memasak dengan benar, menjaga suhu aman, gunakan air/bahan baku aman.",
  },
  {
    id: 13,
    pertanyaan: "Apa yang harus dilakukan masyarakat jika menemukan produk obat atau makanan kedaluwarsa yang masih dijual bebas di pasaran?",
    pilihan: [
      { key: "A", teks: "Melaporkan melalui Layanan Pengaduan Konsumen BBPOM Palembang / Halo BPOM" },
      { key: "B", teks: "Membelinya lalu mengonsumsinya secara diam-diam" },
      { key: "C", teks: "Mendiamkan saja karena bukan urusan kita" },
      { key: "D", teks: "Mengubah tanggal kedaluwarsa pada label kemasan" },
    ],
    jawabanBenar: "A",
    kategori: "Aduan Masyarakat",
    penjelasan: "Masyarakat berhak melapor ke kanal pengaduan resmi BBPOM Palembang atau Halo BPOM 1500533 agar ditindaklanjuti petugas.",
  },
  {
    id: 14,
    pertanyaan: "Kondisi kemasan kaleng makanan yang TIDAK boleh dipilih karena menandakan adanya kerusakan atau pertumbuhan bakteri anaerob berbahaya adalah...",
    pilihan: [
      { key: "A", teks: "Kaleng menggembung, berkarat, atau penyok tajam" },
      { key: "B", teks: "Kaleng berlabel bersih dan mulus" },
      { key: "C", teks: "Kaleng tersimpan di rak yang sejuk" },
      { key: "D", teks: "Kaleng memiliki segel yang utuh" },
    ],
    jawabanBenar: "A",
    kategori: "Prinsip Cek KLIK",
    penjelasan: "Kaleng gembung menandakan gas hasil aktivitas mikroba (seperti Clostridium botulinum) yang sangat berbahaya dan mematikan.",
  },
  {
    id: 15,
    pertanyaan: "Obat tradisional (jamu) yang mengandung Bahan Kimia Obat (BKO) seperti Parasetamol atau Deksametason memiliki dampak berbahaya yaitu...",
    pilihan: [
      { key: "A", teks: "Dapat memicu gagal ginjal, kerusakan organ hati, dan pendarahan lambung" },
      { key: "B", teks: "Membuat badan selalu awet muda tanpa efek samping" },
      { key: "C", teks: "Menambah nutrisi seimbang untuk tulang" },
      { key: "D", teks: "Memperbaiki daya tahan tubuh secara permanen" },
    ],
    jawabanBenar: "A",
    kategori: "Keamanan Obat",
    penjelasan: "Jamu mengandung BKO dilarang keras karena dosisnya tidak terkontrol dan sangat merusak fungsi organ vital manusia.",
  },
];

/**
 * Mengambil 10 soal secara acak dari Bank Soal untuk seorang peserta.
 * Kumpulan 10 soal ini disimpan ke sesi peserta dan digunakan untuk Pre-Test & Post-Test.
 */
export function getRandom10Soal(excludeIds: number[] = []): SoalKuis[] {
  // Salin array bank soal
  const pool = [...BANK_SOAL_CINDO];

  // Algoritma Fisher-Yates Shuffle
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  // Ambil 10 soal pertama
  return pool.slice(0, 10);
}

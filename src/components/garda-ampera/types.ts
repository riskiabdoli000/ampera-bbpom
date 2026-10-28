export interface BiodataGarda {
  nik: string;
  nama: string;
  tanggalTes: string;
  alamat: string;
  usia: string;
  jenisKelamin: "Laki-laki" | "Perempuan" | "";
  pendidikan: string;
  pekerjaan: string;
  instansi: string;
}

export interface PilihanSoal {
  id: string;
  teks: string;
}

export interface SoalUjian {
  id: number;
  pertanyaan: string;
  pilihan: PilihanSoal[];
  jawabanBenar: string;
  penjelasan?: string;
  kategori: string;
}

export interface SlideMateri {
  id: number;
  judul: string;
  subjudul: string;
  poin: string[];
  tips: string;
  badge: string;
  iconName?: string;
}

export interface ModulMateri {
  id: number;
  nomor: number;
  judul: string;
  ringkasan: string;
  durasi: string;
  jumlahSlide: number;
  slides: SlideMateri[];
  pdfUrl?: string;
}

export interface EvaluasiGarda {
  ratingKemudahan: number;
  ratingMateri: number;
  ratingSoal: number;
  ratingManfaat: number;
  kritikSaran: string;
}

export type StepGarda =
  | "biodata"
  | "pre-test"
  | "materi"
  | "post-test"
  | "evaluasi"
  | "sertifikat";

export interface GardaState {
  step: StepGarda;
  biodata: BiodataGarda;
  // Pre-test
  preTestAnswers: Record<number, string>;
  preTestScore: number | null;
  preTestSubmitted: boolean;
  // Materi
  currentModulIndex: number;
  currentSlideIndex: Record<number, number>; // modulId -> 0-based slideIndex
  maxSlideReached: Record<number, number>; // modulId -> highest slide reached
  modul1Completed: boolean;
  modul2Completed: boolean;
  modul3Completed: boolean;
  // Post-test
  postTestAnswers: Record<number, string>;
  postTestScore: number | null;
  postTestSubmitted: boolean;
  postTestPassed: boolean;
  postTestAttempts: number;
  // Evaluasi
  evaluasiSubmitted: boolean;
  evaluasiData: EvaluasiGarda | null;
  // Sertifikat
  nomorSertifikat: string;
  tanggalLulus: string;
}

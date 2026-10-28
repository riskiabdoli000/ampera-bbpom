export type JenisKelamin = "LAKI_LAKI" | "PEREMPUAN";

export type Pendidikan =
  | "SD"
  | "SMP"
  | "SMA_SEDERAJAT"
  | "D3"
  | "S1"
  | "S2"
  | "S3";

export type Pekerjaan =
  | "ASN"
  | "PEGAWAI_SWASTA"
  | "WIRASWASTA"
  | "MAHASISWA"
  | "LAINNYA";

export interface PesertaCindo {
  nama: string;
  tanggalTes: string;
  alamat: string;
  nik: string;
  usia: number;
  jenisKelamin: JenisKelamin;
  pendidikan: Pendidikan;
  pekerjaan: Pekerjaan;
  instansi: string;
}

export interface PilihanJawaban {
  key: "A" | "B" | "C" | "D";
  teks: string;
}

export interface SoalKuis {
  id: number;
  pertanyaan: string;
  pilihan: PilihanJawaban[];
  jawabanBenar: "A" | "B" | "C" | "D";
  kategori: string;
  penjelasan?: string;
}

export type TipeMateri = "pdf" | "video" | "both";

export interface BabMateri {
  id: number;
  nomor: string;
  judul: string;
  subjudul?: string;
  kategori: string;
  deskripsiSingkat: string;
  gambarThumbnail: string;
  estimasiMenit: number;
  tipeMateri: TipeMateri;
  pdfUrl?: string;
  pdfTitle?: string;
  pdfTotalPages?: number;
  videoUrl?: string;
  videoTitle?: string;
  videoDuration?: string;
  videoTranscript?: string;
  kontenPoin: string[];
  bacaanLengkap: string[];
  tipsPenting?: string;
  soalList?: SoalKuis[];
}

export interface PreTestState {
  completed: boolean;
  jawaban: Record<number, "A" | "B" | "C" | "D">;
  skor: number; // 0 - 100
  jumlahBenar: number;
  selesaiPada?: string;
}

export interface MateriProgressState {
  completedBabIds: number[];
  activeBabId: number;
}

export interface PostTestState {
  completed: boolean;
  attemptCount: number; // 0: belum, 1: percobaan 1, 2: remedial
  jawaban: Record<number, "A" | "B" | "C" | "D">;
  skor: number; // 0 - 100
  jumlahBenar: number;
  isPassed: boolean; // >= 80
  canRemedial: boolean; // true if failed on attempt 1
  selesaiPada?: string;
}

export interface SurveyProgressState {
  completed: boolean;
  rating?: number;
  saran?: string;
  selesaiPada?: string;
}

export interface TopikModuleProgress {
  preTest: {
    completed: boolean;
    skor: number;
    jumlahBenar: number;
    totalSoal: number;
    jawaban: Record<number, "A" | "B" | "C" | "D">;
    selesaiPada?: string;
  };
  materi: {
    completed: boolean;
    selesaiPada?: string;
    lastActiveTab?: "pdf" | "video";
  };
  postTest: {
    completed: boolean;
    attemptCount: number;
    skor: number;
    jumlahBenar: number;
    totalSoal: number;
    isPassed: boolean;
    canRemedial: boolean;
    jawaban: Record<number, "A" | "B" | "C" | "D">;
    selesaiPada?: string;
  };
  survey: SurveyProgressState;
  certificate?: CertificateState | null;
}

export interface CertificateState {
  nomorSertifikat: string;
  tanggalTerbit: string;
}

export interface CindoUser {
  username: string;
  password: string;
  createdAt: string;
  peserta: PesertaCindo | null;
  soalTerpilih: SoalKuis[];
  preTest: PreTestState;
  materiProgress: MateriProgressState;
  postTest: PostTestState;
  certificate: CertificateState | null;
  topikProgress?: Record<number, TopikModuleProgress>;
}

export interface SesiCindo {
  username?: string;
  peserta: PesertaCindo | null;
  soalTerpilih: SoalKuis[]; // Kumpulan soal kuis
  preTest: PreTestState;
  materiProgress: MateriProgressState;
  postTest: PostTestState;
  certificate: CertificateState | null;
  topikProgress?: Record<number, TopikModuleProgress>;
}

"use client";

import {
  PesertaCindo,
  SesiCindo,
  SoalKuis,
  PreTestState,
  PostTestState,
  MateriProgressState,
  CertificateState,
  CindoUser,
  TopikModuleProgress,
  SurveyProgressState,
} from "./cindoTypes";
import { getRandom10Soal } from "./bankSoal";
import { DAFTAR_MATERI_CINDO } from "./materiData";

const USERS_DB_KEY = "cindo_users_db_v1";
const ACTIVE_USER_KEY = "cindo_active_user_v1";
const LEGACY_STORAGE_KEY = "cindo_elearning_session_v1";

export const DEFAULT_PRE_TEST: PreTestState = {
  completed: false,
  jawaban: {},
  skor: 0,
  jumlahBenar: 0,
};

export const DEFAULT_MATERI_PROGRESS: MateriProgressState = {
  completedBabIds: [],
  activeBabId: 1,
};

export const DEFAULT_POST_TEST: PostTestState = {
  completed: false,
  attemptCount: 0,
  jawaban: {},
  skor: 0,
  jumlahBenar: 0,
  isPassed: false,
  canRemedial: false,
};

export const DEFAULT_SURVEY_STATE: SurveyProgressState = {
  completed: false,
  rating: 5,
  saran: "",
};

export const DEFAULT_TOPIK_PROGRESS: TopikModuleProgress = {
  preTest: {
    completed: false,
    skor: 0,
    jumlahBenar: 0,
    totalSoal: 5,
    jawaban: {},
  },
  materi: {
    completed: false,
    lastActiveTab: "pdf",
  },
  postTest: {
    completed: false,
    attemptCount: 0,
    skor: 0,
    jumlahBenar: 0,
    totalSoal: 5,
    isPassed: false,
    canRemedial: false,
    jawaban: {},
  },
  survey: DEFAULT_SURVEY_STATE,
  certificate: null,
};

export const DEFAULT_SESI: SesiCindo = {
  peserta: null,
  soalTerpilih: [],
  preTest: DEFAULT_PRE_TEST,
  materiProgress: DEFAULT_MATERI_PROGRESS,
  postTest: DEFAULT_POST_TEST,
  certificate: null,
  topikProgress: {},
};

/**
 * Mengambil database pengguna terdaftar
 */
export function getAllCindoUsers(): Record<string, CindoUser> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(USERS_DB_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Menyimpan seluruh data pengguna
 */
export function saveAllCindoUsers(users: Record<string, CindoUser>): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
  } catch (err) {
    console.error("[Cindo Storage] Gagal menyimpan users:", err);
  }
}

/**
 * Mendapatkan username yang sedang aktif login
 */
export function getActiveUsername(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACTIVE_USER_KEY);
}

/**
 * Registrasi pengguna baru Cindo
 */
export function registerCindoUser(
  usernameInput: string,
  passwordInput: string
): { success: boolean; message: string } {
  const username = usernameInput.trim().toLowerCase();
  const password = passwordInput.trim();

  if (!username || username.length < 3) {
    return { success: false, message: "Username minimal 3 karakter." };
  }
  if (!password || password.length < 4) {
    return { success: false, message: "Password minimal 4 karakter." };
  }

  const users = getAllCindoUsers();
  if (users[username]) {
    return { success: false, message: "Username sudah terdaftar! Silakan gunakan username lain atau langsung login." };
  }

  const newUser: CindoUser = {
    username,
    password,
    createdAt: new Date().toISOString(),
    peserta: null,
    soalTerpilih: [],
    preTest: DEFAULT_PRE_TEST,
    materiProgress: DEFAULT_MATERI_PROGRESS,
    postTest: DEFAULT_POST_TEST,
    certificate: null,
  };

  users[username] = newUser;
  saveAllCindoUsers(users);

  return { success: true, message: "Registrasi berhasil! Silakan login untuk melanjutkan." };
}

/**
 * Login pengguna Cindo
 */
export function loginCindoUser(
  usernameInput: string,
  passwordInput: string
): { success: boolean; message: string } {
  const username = usernameInput.trim().toLowerCase();
  const password = passwordInput.trim();

  const users = getAllCindoUsers();
  const user = users[username];

  if (!user) {
    return { success: false, message: "Username tidak ditemukan. Silakan registrasi terlebih dahulu." };
  }

  if (user.password !== password) {
    return { success: false, message: "Password salah. Silakan coba lagi." };
  }

  if (typeof window !== "undefined") {
    localStorage.setItem(ACTIVE_USER_KEY, username);
  }

  return { success: true, message: "Login berhasil!" };
}

/**
 * Logout pengguna
 */
export function logoutCindoUser(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(ACTIVE_USER_KEY);
  }
}

/**
 * Mendapatkan data pengguna yang sedang login saat ini
 */
export function getCurrentCindoUser(): CindoUser | null {
  const activeUser = getActiveUsername();
  if (!activeUser) return null;
  const users = getAllCindoUsers();
  return users[activeUser] || null;
}

/**
 * Mendapatkan sesi Cindo saat ini (berdasarkan pengguna yang sedang login)
 */
export function getSesiCindo(): SesiCindo {
  const user = getCurrentCindoUser();
  if (!user) {
    // Fallback legacy jika ada
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(LEGACY_STORAGE_KEY);
        if (raw) return JSON.parse(raw);
      } catch {}
    }
    return DEFAULT_SESI;
  }

  return {
    username: user.username,
    peserta: user.peserta,
    soalTerpilih: user.soalTerpilih || [],
    preTest: user.preTest || DEFAULT_PRE_TEST,
    materiProgress: user.materiProgress || DEFAULT_MATERI_PROGRESS,
    postTest: user.postTest || DEFAULT_POST_TEST,
    certificate: user.certificate || null,
    topikProgress: user.topikProgress || {},
  };
}

/**
 * Menyimpan sesi Cindo ke akun pengguna aktif
 */
export function saveSesiCindo(sesi: SesiCindo): void {
  const activeUser = getActiveUsername();
  if (!activeUser) {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(sesi));
      } catch {}
    }
    return;
  }

  const users = getAllCindoUsers();
  const current = users[activeUser];
  if (current) {
    users[activeUser] = {
      ...current,
      peserta: sesi.peserta,
      soalTerpilih: sesi.soalTerpilih,
      preTest: sesi.preTest,
      materiProgress: sesi.materiProgress,
      postTest: sesi.postTest,
      certificate: sesi.certificate,
      topikProgress: sesi.topikProgress || current.topikProgress || {},
    };
    saveAllCindoUsers(users);
  }
}

/**
 * Inisialisasi Peserta Baru & Generate 10 Soal Acak
 * Kumpulan 10 soal ini akan digunakan untuk Pre-Test DAN Post-Test si pengisi.
 */
export function initSesiWithPeserta(peserta: PesertaCindo): SesiCindo {
  const currentSesi = getSesiCindo();

  let soal: SoalKuis[] = [];
  if (currentSesi.soalTerpilih && currentSesi.soalTerpilih.length === 10) {
    soal = currentSesi.soalTerpilih;
  } else {
    soal = getRandom10Soal();
  }

  const updated: SesiCindo = {
    ...currentSesi,
    peserta,
    soalTerpilih: soal,
  };

  saveSesiCindo(updated);
  return updated;
}

/**
 * Memperbarui data identitas peserta tanpa mereset soal
 */
export function updateCindoPeserta(peserta: PesertaCindo): SesiCindo {
  const currentSesi = getSesiCindo();
  let soal = currentSesi.soalTerpilih;
  if (!soal || soal.length !== 10) {
    soal = getRandom10Soal();
  }
  const updated: SesiCindo = {
    ...currentSesi,
    peserta,
    soalTerpilih: soal,
  };
  saveSesiCindo(updated);
  return updated;
}

/**
 * Memperbarui password akun pengguna aktif
 */
export function updateCindoPassword(newPassword: string): { success: boolean; message: string } {
  const activeUser = getActiveUsername();
  if (!activeUser) {
    return { success: false, message: "Tidak ada sesi pengguna aktif." };
  }
  if (!newPassword || newPassword.trim().length < 4) {
    return { success: false, message: "Password baru minimal 4 karakter." };
  }

  const users = getAllCindoUsers();
  if (!users[activeUser]) {
    return { success: false, message: "Pengguna tidak ditemukan." };
  }

  users[activeUser].password = newPassword.trim();
  saveAllCindoUsers(users);
  return { success: true, message: "Password berhasil diperbarui!" };
}

/**
 * Submit Pengerjaan Pre-Test
 * Menghitung skor (tiap jawaban benar = 10 poin, max 100)
 * HASIL DITAMPILKAN TANPA MEMBERITAHUKAN KUNCI JAWABAN BENAR
 */
export function submitPreTestJawaban(
  jawaban: Record<number, "A" | "B" | "C" | "D">
): SesiCindo {
  const sesi = getSesiCindo();
  const soalList = sesi.soalTerpilih;

  let jumlahBenar = 0;
  soalList.forEach((soal) => {
    if (jawaban[soal.id] === soal.jawabanBenar) {
      jumlahBenar += 1;
    }
  });

  const skor = jumlahBenar * 10;

  const updated: SesiCindo = {
    ...sesi,
    preTest: {
      completed: true,
      jawaban,
      skor,
      jumlahBenar,
      selesaiPada: new Date().toISOString(),
    },
    materiProgress: {
      completedBabIds: sesi.materiProgress?.completedBabIds || [],
      activeBabId: sesi.materiProgress?.activeBabId || 1,
    },
  };

  saveSesiCindo(updated);
  return updated;
}

/**
 * Menandai sebuah Bab Materi telah selesai dibaca
 * Membuka Bab berikutnya secara berurutan
 */
export function markBabCompleted(babId: number): SesiCindo {
  const sesi = getSesiCindo();
  const currentCompleted = sesi.materiProgress?.completedBabIds || [];

  const updatedCompleted = currentCompleted.includes(babId)
    ? currentCompleted
    : [...currentCompleted, babId];

  // Cari bab berikutnya jika ada
  const currentIndex = DAFTAR_MATERI_CINDO.findIndex((b) => b.id === babId);
  let nextActiveId = babId;
  if (currentIndex >= 0 && currentIndex + 1 < DAFTAR_MATERI_CINDO.length) {
    nextActiveId = DAFTAR_MATERI_CINDO[currentIndex + 1].id;
  }

  const updated: SesiCindo = {
    ...sesi,
    materiProgress: {
      completedBabIds: updatedCompleted,
      activeBabId: nextActiveId,
    },
  };

  saveSesiCindo(updated);
  return updated;
}

/**
 * Submit Pengerjaan Post-Test
 * Menggunakan 10 soal yang sama persis dengan Pre-Test
 * Nilai kelulusan >= 80 (minimal 8 benar).
 * Jika < 80 pada attempt pertama, berhak remedial 1x.
 */
export function submitPostTestJawaban(
  jawaban: Record<number, "A" | "B" | "C" | "D">
): SesiCindo {
  const sesi = getSesiCindo();
  const soalList = sesi.soalTerpilih;

  let jumlahBenar = 0;
  soalList.forEach((soal) => {
    if (jawaban[soal.id] === soal.jawabanBenar) {
      jumlahBenar += 1;
    }
  });

  const skor = jumlahBenar * 10;
  const isPassed = skor >= 80;
  const newAttemptCount = (sesi.postTest?.attemptCount || 0) + 1;
  const canRemedial = !isPassed && newAttemptCount < 2;

  let cert: CertificateState | null = sesi.certificate;
  if (isPassed && !cert) {
    const randomHex = Math.random().toString(36).substring(2, 7).toUpperCase();
    const dateCode = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    cert = {
      nomorSertifikat: `CINDO/BBPOM/${dateCode}/${randomHex}`,
      tanggalTerbit: new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    };
  }

  const updated: SesiCindo = {
    ...sesi,
    postTest: {
      completed: true,
      attemptCount: newAttemptCount,
      jawaban,
      skor,
      jumlahBenar,
      isPassed,
      canRemedial,
      selesaiPada: new Date().toISOString(),
    },
    certificate: cert,
  };

  saveSesiCindo(updated);
  return updated;
}

/**
 * Mereset state Post-Test untuk remedial 1 kali
 */
export function prepareRemedialAttempt(): SesiCindo {
  const sesi = getSesiCindo();
  const updated: SesiCindo = {
    ...sesi,
    postTest: {
      ...sesi.postTest,
      completed: false,
      jawaban: {},
    },
  };
  saveSesiCindo(updated);
  return updated;
}

/**
 * Reset seluruh sesi Cindo
 */
export function clearCindoSession(): void {
  logoutCindoUser();
  if (typeof window !== "undefined") {
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  }
}

/**
 * Mendapatkan status progres 3 modul (pre-test, materi, post-test) untuk topik tertentu
 */
export function getTopikModuleProgress(topikId: number): TopikModuleProgress {
  const sesi = getSesiCindo();
  if (sesi.topikProgress && sesi.topikProgress[topikId]) {
    const tp = sesi.topikProgress[topikId];
    return {
      ...tp,
      survey: tp.survey || { ...DEFAULT_SURVEY_STATE },
    };
  }
  return {
    preTest: { ...DEFAULT_TOPIK_PROGRESS.preTest, jawaban: {} },
    materi: { ...DEFAULT_TOPIK_PROGRESS.materi },
    postTest: { ...DEFAULT_TOPIK_PROGRESS.postTest, jawaban: {} },
    survey: { ...DEFAULT_SURVEY_STATE },
    certificate: null,
  };
}

/**
 * Submit Jawaban Pre-Test Topik
 * Aturan: Selesai pre-test akan MEMBUKA akses modul Materi
 */
export function submitTopikPreTest(
  topikId: number,
  jawaban: Record<number, "A" | "B" | "C" | "D">,
  soalList: SoalKuis[]
): SesiCindo {
  const sesi = getSesiCindo();
  const currentTopikProgress = getTopikModuleProgress(topikId);

  let jumlahBenar = 0;
  soalList.forEach((soal) => {
    if (jawaban[soal.id] === soal.jawabanBenar) {
      jumlahBenar += 1;
    }
  });

  const totalSoal = soalList.length || 5;
  const skor = Math.round((jumlahBenar / totalSoal) * 100);

  const updatedTopik: TopikModuleProgress = {
    ...currentTopikProgress,
    preTest: {
      completed: true,
      skor,
      jumlahBenar,
      totalSoal,
      jawaban,
      selesaiPada: new Date().toISOString(),
    },
  };

  const updatedTopikProgress = {
    ...(sesi.topikProgress || {}),
    [topikId]: updatedTopik,
  };

  const updatedSesi: SesiCindo = {
    ...sesi,
    topikProgress: updatedTopikProgress,
  };

  saveSesiCindo(updatedSesi);
  return updatedSesi;
}

/**
 * Menandai Modul Materi pada topik telah selesai dipelajari
 * Aturan: Selesai materi akan MEMBUKA akses modul Post-Test
 */
export function markTopikMateriCompleted(
  topikId: number,
  activeTab: "pdf" | "video" = "pdf"
): SesiCindo {
  const sesi = getSesiCindo();
  const currentTopikProgress = getTopikModuleProgress(topikId);

  const updatedTopik: TopikModuleProgress = {
    ...currentTopikProgress,
    materi: {
      completed: true,
      lastActiveTab: activeTab,
      selesaiPada: new Date().toISOString(),
    },
  };

  const currentCompletedBabs = sesi.materiProgress?.completedBabIds || [];
  const updatedBabs = currentCompletedBabs.includes(topikId)
    ? currentCompletedBabs
    : [...currentCompletedBabs, topikId];

  const updatedTopikProgress = {
    ...(sesi.topikProgress || {}),
    [topikId]: updatedTopik,
  };

  const updatedSesi: SesiCindo = {
    ...sesi,
    materiProgress: {
      ...sesi.materiProgress,
      completedBabIds: updatedBabs,
    },
    topikProgress: updatedTopikProgress,
  };

  saveSesiCindo(updatedSesi);
  return updatedSesi;
}

/**
 * Submit Evaluasi Post-Test Topik
 * Kriteria kelulusan topik: Skor >= 80%
 */
export function submitTopikPostTest(
  topikId: number,
  jawaban: Record<number, "A" | "B" | "C" | "D">,
  soalList: SoalKuis[]
): SesiCindo {
  const sesi = getSesiCindo();
  const currentTopikProgress = getTopikModuleProgress(topikId);

  let jumlahBenar = 0;
  soalList.forEach((soal) => {
    if (jawaban[soal.id] === soal.jawabanBenar) {
      jumlahBenar += 1;
    }
  });

  const totalSoal = soalList.length || 5;
  const skor = Math.round((jumlahBenar / totalSoal) * 100);
  const isPassed = skor >= 80;
  const newAttemptCount = (currentTopikProgress.postTest?.attemptCount || 0) + 1;
  const canRemedial = !isPassed && newAttemptCount < 2;
  const randomHex = Math.random().toString(36).substring(2, 7).toUpperCase();
  const dateCode = new Date().toISOString().slice(0, 10).replace(/-/g, "");

  // Penerbitan sertifikat per topik (tersedia setelah menyelesaikan post-test)
  const topikCert = currentTopikProgress.certificate || {
    nomorSertifikat: `CINDO/TOP-${topikId}/${dateCode}/${randomHex}`,
    tanggalTerbit: new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
  };

  const updatedTopik: TopikModuleProgress = {
    ...currentTopikProgress,
    postTest: {
      completed: true,
      attemptCount: newAttemptCount,
      skor,
      jumlahBenar,
      totalSoal,
      isPassed,
      canRemedial,
      jawaban,
      selesaiPada: new Date().toISOString(),
    },
    certificate: topikCert,
  };

  const updatedTopikProgress = {
    ...(sesi.topikProgress || {}),
    [topikId]: updatedTopik,
  };

  // Penerbitan sertifikat sesi jika minimal ada topik yang lulus
  let cert = sesi.certificate;
  if (isPassed && !cert) {
    cert = {
      nomorSertifikat: `CINDO/BBPOM/${dateCode}/${randomHex}`,
      tanggalTerbit: new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    };
  }

  const updatedSesi: SesiCindo = {
    ...sesi,
    topikProgress: updatedTopikProgress,
    certificate: cert,
  };

  saveSesiCindo(updatedSesi);
  return updatedSesi;
}

/**
 * Reset Post-Test Topik untuk remedial 1 kali
 */
export function resetTopikPostTestRemedial(topikId: number): SesiCindo {
  const sesi = getSesiCindo();
  const currentTopikProgress = getTopikModuleProgress(topikId);

  const updatedTopik: TopikModuleProgress = {
    ...currentTopikProgress,
    postTest: {
      ...currentTopikProgress.postTest,
      completed: false,
      jawaban: {},
    },
  };

  const updatedTopikProgress = {
    ...(sesi.topikProgress || {}),
    [topikId]: updatedTopik,
  };

  const updatedSesi: SesiCindo = {
    ...sesi,
    topikProgress: updatedTopikProgress,
  };

  saveSesiCindo(updatedSesi);
  return updatedSesi;
}

/**
 * Submit Survei Kepuasan Pengguna per Topik
 * Aturan Alur: Pre-Test -> Materi -> Post-Test -> Survey -> Akses Sertifikat
 */
export function submitTopikSurvey(
  topikId: number,
  rating: number = 5,
  saran: string = ""
): SesiCindo {
  const sesi = getSesiCindo();
  const currentTopikProgress = getTopikModuleProgress(topikId);

  const randomHex = Math.random().toString(36).substring(2, 7).toUpperCase();
  const dateCode = new Date().toISOString().slice(0, 10).replace(/-/g, "");

  const topikCert = currentTopikProgress.certificate || {
    nomorSertifikat: `CINDO/TOP-${topikId}/${dateCode}/${randomHex}`,
    tanggalTerbit: new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
  };

  const updatedTopik: TopikModuleProgress = {
    ...currentTopikProgress,
    survey: {
      completed: true,
      rating,
      saran,
      selesaiPada: new Date().toISOString(),
    },
    certificate: topikCert,
  };

  const updatedTopikProgress = {
    ...(sesi.topikProgress || {}),
    [topikId]: updatedTopik,
  };

  const updatedSesi: SesiCindo = {
    ...sesi,
    topikProgress: updatedTopikProgress,
    certificate: sesi.certificate || topikCert,
  };

  saveSesiCindo(updatedSesi);
  return updatedSesi;
}

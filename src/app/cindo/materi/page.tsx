"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  BookOpen,
  Search,
  X,
  CheckCircle2,
  Lock,
  ArrowRight,
  AlertTriangle,
  FileQuestion,
  Award,
  FileText,
  Video,
  RotateCcw,
  Download,
  ChevronRight,
  Check,
  AlertCircle,
  ClipboardCheck,
  Star,
} from "lucide-react";
import { CindoChapterCard } from "@/components/cindo/CindoChapterCard";
import { DAFTAR_MATERI_CINDO } from "@/data/cindo/materiData";
import {
  BabMateri,
  SesiCindo,
  SoalKuis,
  TopikModuleProgress,
} from "@/data/cindo/cindoTypes";
import {
  getSesiCindo,
  getTopikModuleProgress,
  submitTopikPreTest,
  markTopikMateriCompleted,
  submitTopikPostTest,
  submitTopikSurvey,
  resetTopikPostTestRemedial,
} from "@/data/cindo/cindoStorage";

export default function CindoMateriPage() {
  const [sesi, setSesi] = useState<SesiCindo | null>(null);
  const [selectedTopik, setSelectedTopik] = useState<BabMateri | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal / View States for Sequential Stages (Pre-Test -> Materi -> Post-Test -> Survey)
  const [activeModuleModal, setActiveModuleModal] = useState<
    "overview" | "pre-test" | "materi" | "post-test" | "survey" | null
  >(null);

  // Survey States
  const [surveyRating, setSurveyRating] = useState<number>(5);
  const [surveySaran, setSurveySaran] = useState<string>("");
  const [surveyAnswers, setSurveyAnswers] = useState<Record<number, number>>({
    1: 5,
    2: 5,
    3: 5,
  });

  // Materi Active Tab: 'pdf' or 'video'
  const [materiTab, setMateriTab] = useState<"pdf" | "video">("pdf");
  const [materiChecked, setMateriChecked] = useState(false);

  // Quiz Runner States (used for both Pre-Test and Post-Test of the active topic)
  const [quizType, setQuizType] = useState<"pre" | "post">("pre");
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<
    Record<number, "A" | "B" | "C" | "D">
  >({});
  const [quizResult, setQuizResult] = useState<{
    skor: number;
    jumlahBenar: number;
    totalSoal: number;
    isPassed?: boolean;
    canRemedial?: boolean;
  } | null>(null);

  // Warning toast / notification message
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  // Topic certificate download notification
  const [downloadNotice, setDownloadNotice] = useState<{
    visible: boolean;
    topikJudul: string;
    nomor: string;
  } | null>(null);

  useEffect(() => {
    setSesi(getSesiCindo());
  }, []);

  const refreshSesi = () => {
    setSesi(getSesiCindo());
  };

  const hasPeserta = Boolean(sesi?.peserta && sesi.peserta.nama && sesi.peserta.nik);

  // Filtered topics
  const filteredTopik = DAFTAR_MATERI_CINDO.filter((topik) => {
    return (
      !searchQuery ||
      topik.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topik.deskripsiSingkat.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topik.nomor.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Calculate overall stats (4 tahapan: Pre-Test -> Materi -> Post-Test -> Survei)
  let totalStepsCompleted = 0;
  let totalTopicsCompleted = 0;
  DAFTAR_MATERI_CINDO.forEach((t) => {
    const prog = getTopikModuleProgress(t.id);
    let count = 0;
    if (prog.preTest.completed) count += 1;
    if (prog.materi.completed) count += 1;
    if (prog.postTest.completed && prog.postTest.isPassed) count += 1;
    if (prog.survey?.completed) count += 1;
    totalStepsCompleted += count;
    if (count === 4) totalTopicsCompleted += 1;
  });

  const totalPossibleSteps = DAFTAR_MATERI_CINDO.length * 4;
  const overallPercentage = Math.round(
    (totalStepsCompleted / totalPossibleSteps) * 100
  );

  // Click handler on Topic Card
  const handleOpenTopik = (topik: BabMateri) => {
    if (!hasPeserta) {
      setWarningMessage(
        "Silakan lengkapi data profil identitas peserta di menu Profile terlebih dahulu sebelum memilih materi."
      );
      return;
    }
    setSelectedTopik(topik);
    setActiveModuleModal("overview");
    setMateriChecked(false);
    setQuizResult(null);
  };

  // Close all modals
  const handleCloseModal = () => {
    setActiveModuleModal(null);
    setQuizResult(null);
  };

  // 1. OPEN PRE-TEST
  const handleStartPreTest = () => {
    if (!selectedTopik) return;
    const prog = getTopikModuleProgress(selectedTopik.id);
    setQuizType("pre");
    setQuizIndex(0);
    setQuizAnswers(prog.preTest.jawaban || {});
    setQuizResult(null);
    setActiveModuleModal("pre-test");
  };

  // 2. OPEN MATERI (Enforces Rule 3: Must finish Pre-Test first!)
  const handleStartMateri = () => {
    if (!selectedTopik) return;
    const prog = getTopikModuleProgress(selectedTopik.id);
    if (!prog.preTest.completed) {
      setWarningMessage(
        "Akses Terkunci: Anda harus menyelesaikan Modul 1 (Pre-Test) terlebih dahulu sebelum dapat membuka Materi Pembelajaran."
      );
      return;
    }
    setMateriTab(selectedTopik.tipeMateri === "video" ? "video" : "pdf");
    setMateriChecked(Boolean(prog.materi.completed));
    setActiveModuleModal("materi");
  };

  // 3. OPEN POST-TEST (Enforces Rule 3: Must finish Materi first!)
  const handleStartPostTest = () => {
    if (!selectedTopik) return;
    const prog = getTopikModuleProgress(selectedTopik.id);
    if (!prog.preTest.completed) {
      setWarningMessage(
        "Akses Terkunci: Anda harus menyelesaikan Modul 1 (Pre-Test) dan Modul 2 (Materi) terlebih dahulu."
      );
      return;
    }
    if (!prog.materi.completed) {
      setWarningMessage(
        "Akses Terkunci: Anda harus mempelajari Modul 2 (Materi Pembelajaran) hingga selesai dan menandai 'Selesai Mempelajari' sebelum membuka Post-Test."
      );
      return;
    }
    setQuizType("post");
    setQuizIndex(0);
    setQuizAnswers(prog.postTest.jawaban || {});
    setQuizResult(null);
    setActiveModuleModal("post-test");
  };

  // Handle Answer Selection in Quiz Runner
  const handleSelectAnswer = (soalId: number, key: "A" | "B" | "C" | "D") => {
    setQuizAnswers((prev) => ({
      ...prev,
      [soalId]: key,
    }));
  };

  // Submit Pre-Test
  const handleSubmitPreTest = () => {
    if (!selectedTopik || !selectedTopik.soalList) return;
    const soalList = selectedTopik.soalList;
    const answeredCount = Object.keys(quizAnswers).length;

    if (answeredCount < soalList.length) {
      if (
        !confirm(
          `Anda baru menjawab ${answeredCount} dari ${soalList.length} soal. Yakin ingin mengumpulkan? Soal yang belum dijawab bernilai 0.`
        )
      ) {
        return;
      }
    }

    const updated = submitTopikPreTest(selectedTopik.id, quizAnswers, soalList);
    setSesi(updated);

    const prog = getTopikModuleProgress(selectedTopik.id);
    setQuizResult({
      skor: prog.preTest.skor,
      jumlahBenar: prog.preTest.jumlahBenar,
      totalSoal: prog.preTest.totalSoal,
    });
  };

  // Submit Post-Test
  const handleSubmitPostTest = () => {
    if (!selectedTopik || !selectedTopik.soalList) return;
    const soalList = selectedTopik.soalList;
    const answeredCount = Object.keys(quizAnswers).length;

    if (answeredCount < soalList.length) {
      if (
        !confirm(
          `Anda baru menjawab ${answeredCount} dari ${soalList.length} soal evaluasi. Yakin ingin mengumpulkan?`
        )
      ) {
        return;
      }
    }

    const updated = submitTopikPostTest(selectedTopik.id, quizAnswers, soalList);
    setSesi(updated);

    const prog = getTopikModuleProgress(selectedTopik.id);
    setQuizResult({
      skor: prog.postTest.skor,
      jumlahBenar: prog.postTest.jumlahBenar,
      totalSoal: prog.postTest.totalSoal,
      isPassed: prog.postTest.isPassed,
      canRemedial: prog.postTest.canRemedial,
    });
  };

  // Mark Materi as Completed
  const handleCompleteMateri = () => {
    if (!selectedTopik) return;
    const updated = markTopikMateriCompleted(selectedTopik.id, materiTab);
    setSesi(updated);
    setMateriChecked(true);

    // Langsung kembali ke tampilan alur overview topik tanpa memunculkan banner notifikasi
    setTimeout(() => {
      setActiveModuleModal("overview");
    }, 200);
  };

  // Mulai Survei Kepuasan Topik
  const handleStartSurvey = () => {
    if (!selectedTopik) return;
    const prog = getTopikModuleProgress(selectedTopik.id);
    if (!prog.postTest.completed || !prog.postTest.isPassed) {
      setWarningMessage(
        "Akses Terkunci: Anda harus menyelesaikan dan lulus Post-Test terlebih dahulu sebelum mengisi survei kepuasan."
      );
      return;
    }
    setSurveyRating(prog.survey?.rating || 5);
    setSurveySaran(prog.survey?.saran || "");
    setActiveModuleModal("survey");
  };

  // Submit Survei Kepuasan Topik
  const handleSubmitSurvey = () => {
    if (!selectedTopik) return;
    const updated = submitTopikSurvey(selectedTopik.id, surveyRating, surveySaran);
    setSesi(updated);
    setActiveModuleModal("overview");
  };

  // Unduh Sertifikat Per Topik (Tersedia setelah menyelesaikan Post-Test dan Survei)
  const handleDownloadCertificate = (topik: BabMateri, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    const prog = getTopikModuleProgress(topik.id);
    if (!prog.postTest.completed || !prog.postTest.isPassed) {
      setWarningMessage(
        `Akses Terkunci: Sertifikat topik ${topik.nomor} baru dapat diunduh setelah Anda menyelesaikan evaluasi Post-Test dan mengisi Survei Kepuasan.`
      );
      return;
    }

    if (!prog.survey?.completed) {
      setWarningMessage(
        `Akses Terkunci: Sebelum mendapatkan sertifikat topik ${topik.nomor}, Anda wajib mengisi Survei Kepuasan terlebih dahulu.`
      );
      return;
    }

    setDownloadNotice({
      visible: true,
      topikJudul: topik.judul,
      nomor: topik.nomor,
    });

    setTimeout(() => {
      setDownloadNotice(null);
    }, 4500);
  };

  // Active topic progress data
  const currentTopikProg = selectedTopik
    ? getTopikModuleProgress(selectedTopik.id)
    : null;

  return (
    <div className="space-y-6">

      {/* Warning message toast */}
      {warningMessage && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950/80 dark:text-amber-200 animate-fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
            <span>{warningMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setWarningMessage(null)}
            className="text-amber-700 hover:text-amber-900 font-bold dark:text-amber-400"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Profile Notice if user has not completed profile */}
      {!hasPeserta && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-rose-300/80 bg-rose-50/90 p-4 sm:p-5 shadow-sm dark:border-rose-800 dark:bg-rose-950/50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-rose-900 dark:text-rose-200">
                Lengkapi Data Profil Peserta Terlebih Dahulu
              </h3>
              <p className="mt-0.5 text-xs text-rose-800 dark:text-rose-300">
                Sesuai ketentuan sertifikasi, Anda wajib mengisi data profil identitas di menu Profile sebelum dapat membuka topik pembelajaran dan evaluasi.
              </p>
            </div>
          </div>
          <Link
            href="/cindo/profile"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow transition-all hover:bg-rose-700 active:scale-95"
          >
            <span>Lengkapi Profil Sekarang</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      {/* Main Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-navy-900 dark:text-white">
            Daftar Topik Edukasi Cindo
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
            Pilih topik materi yang ingin dipelajari. Alur per topik diselesaikan secara bertahap: <strong>Pre-Test → Materi Dokumen PDF/Video → Post-Test → Survei Kepuasan → Akses Unduh Sertifikat</strong>.
          </p>
        </div>

        {/* Global Progress Box */}
        <div className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 min-w-[260px]">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-slate-500 dark:text-slate-400">
              Progres Total E-Learning:
            </span>
            <span className="font-black text-brand-orange dark:text-orange-400">
              {totalTopicsCompleted} / {DAFTAR_MATERI_CINDO.length} Topik Selesai
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full bg-gradient-to-r from-brand-orange to-amber-400 rounded-full transition-all duration-500"
              style={{ width: `${overallPercentage}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>{totalStepsCompleted} dari {totalPossibleSteps} tahapan tuntas</span>
            <span className="font-bold text-navy-900 dark:text-slate-300">
              {overallPercentage}%
            </span>
          </div>
        </div>
      </div>

      {/* Search Bar & Counter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-start gap-3 sm:gap-4">
        {/* Search Input */}
        <div className="relative min-w-[220px] sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari materi / kata kunci..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-1.5 text-xs outline-none transition-all focus:border-brand-orange focus:ring-1 focus:ring-brand-orange dark:border-slate-800 dark:bg-slate-900 dark:text-white"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-2 text-xs font-bold text-slate-400 hover:text-slate-600"
            >
              ×
            </button>
          )}
        </div>

        {/* Counter */}
        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          Menampilkan <span className="font-bold text-navy-900 dark:text-white">{filteredTopik.length}</span> produk dari {DAFTAR_MATERI_CINDO.length} topik pembelajaran
        </div>
      </div>

      {/* Topics Grid (Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {filteredTopik.map((topik) => {
          const prog = getTopikModuleProgress(topik.id);
          return (
            <CindoChapterCard
              key={topik.id}
              materi={topik}
              progress={prog}
              isSelected={selectedTopik?.id === topik.id}
              onClick={() => handleOpenTopik(topik)}
              onDownloadCertificate={handleDownloadCertificate}
            />
          );
        })}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 1. MODAL OVERVIEW: 3 MODUL BERURUTAN (Requirement 2 & 3)     */}
      {/* ------------------------------------------------------------- */}
      {activeModuleModal === "overview" && selectedTopik && currentTopikProg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="relative flex max-h-[92vh] w-full max-w-2xl flex-col rounded-3xl bg-white shadow-2xl overflow-hidden dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            {/* Modal Header */}
            <div className="relative h-36 sm:h-44 w-full shrink-0 overflow-hidden bg-slate-950">
              <Image
                src={selectedTopik.gambarThumbnail}
                alt={selectedTopik.judul}
                fill
                className="object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

              <button
                type="button"
                onClick={handleCloseModal}
                className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors shadow"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="absolute bottom-4 left-5 right-5 text-white">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-brand-orange px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-widest shadow-sm">
                    {selectedTopik.nomor}
                  </span>
                  <span className="rounded-md bg-white/20 backdrop-blur-sm px-2 py-0.5 text-[10px] font-medium text-slate-200">
                    {selectedTopik.kategori}
                  </span>
                </div>
                <h2 className="mt-1.5 text-lg sm:text-xl font-black leading-snug line-clamp-2">
                  {selectedTopik.judul}
                </h2>
              </div>
            </div>

            {/* Modal Content: 3 Sequential Modules */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider text-xs">
                  Alur Pembelajaran Topik (Wajib Berurutan)
                </h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Kerjakan tahapan secara berurutan: Pre-Test → Materi Pembelajaran → Post-Test → Survei Kepuasan → Akses E-Sertifikat Resmi.
                </p>
              </div>

              {/* CARD MODUL 1: PRE-TEST */}
              <div
                className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border p-4 sm:p-5 transition-all ${
                  currentTopikProg.preTest.completed
                    ? "border-emerald-300 bg-emerald-50/60 dark:border-emerald-900 dark:bg-emerald-950/30"
                    : "border-orange-300 bg-orange-50/60 dark:border-orange-900 dark:bg-orange-950/30"
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-sm ${
                      currentTopikProg.preTest.completed
                        ? "bg-emerald-500 text-white"
                        : "bg-gradient-to-br from-brand-orange to-orange-600 text-white"
                    }`}
                  >
                    <FileQuestion className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-extrabold uppercase text-brand-orange dark:text-orange-400">
                        Modul 1
                      </span>
                      {currentTopikProg.preTest.completed ? (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                          Selesai • Skor: {currentTopikProg.preTest.skor}/100
                        </span>
                      ) : (
                        <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-black text-brand-orange dark:bg-orange-950 dark:text-orange-200">
                          Langkah Pertama
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                      Pre-Test (Asesmen Pemahaman Awal)
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                      5 Soal pilihan ganda untuk menguji pemahaman dasar sebelum membaca materi.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleStartPreTest}
                  className={`w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all active:scale-95 ${
                    currentTopikProg.preTest.completed
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-gradient-to-r from-brand-orange to-orange-600 hover:from-orange-600 hover:to-orange-700"
                  }`}
                >
                  <span>
                    {currentTopikProg.preTest.completed
                      ? "Ulangi / Lihat Pre-Test"
                      : "Kerjakan Pre-Test"}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              {/* CARD MODUL 2: MATERI PEMBELAJARAN (PDF / VIDEO) */}
              <div
                className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border p-4 sm:p-5 transition-all ${
                  currentTopikProg.materi.completed
                    ? "border-emerald-300 bg-emerald-50/60 dark:border-emerald-900 dark:bg-emerald-950/30"
                    : currentTopikProg.preTest.completed
                    ? "border-orange-300 bg-orange-50/60 dark:border-orange-900 dark:bg-orange-950/30"
                    : "border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900/60 opacity-80"
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-sm ${
                      currentTopikProg.materi.completed
                        ? "bg-emerald-500 text-white"
                        : currentTopikProg.preTest.completed
                        ? "bg-gradient-to-br from-brand-orange to-orange-600 text-white"
                        : "bg-slate-300 dark:bg-slate-700 text-slate-500"
                    }`}
                  >
                    {currentTopikProg.preTest.completed ? (
                      <BookOpen className="h-6 w-6" />
                    ) : (
                      <Lock className="h-6 w-6" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-extrabold uppercase text-brand-orange dark:text-orange-400">
                        Modul 2
                      </span>
                      {currentTopikProg.materi.completed ? (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                          Selesai Dipelajari
                        </span>
                      ) : currentTopikProg.preTest.completed ? (
                        <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-black text-brand-orange dark:bg-orange-950 dark:text-orange-200">
                          Siap Dipelajari
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-black text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                          Terkunci (Wajib Pre-Test)
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                      Materi Pembelajaran (Dokumen PDF & Video)
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                      Tersedia dalam format dokumen panduan PDF dan video edukasi interaktif BBPOM.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleStartMateri}
                  disabled={!currentTopikProg.preTest.completed}
                  className={`w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all ${
                    currentTopikProg.materi.completed
                      ? "bg-emerald-600 hover:bg-emerald-700 active:scale-95"
                      : currentTopikProg.preTest.completed
                      ? "bg-gradient-to-r from-brand-orange to-orange-600 hover:from-orange-600 hover:to-orange-700 active:scale-95"
                      : "bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed"
                  }`}
                >
                  {currentTopikProg.preTest.completed ? (
                    <>
                      <span>
                        {currentTopikProg.materi.completed
                          ? "Buka Kembali Materi"
                          : "Pelajari Materi"}
                      </span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      <Lock className="h-3.5 w-3.5" />
                      <span>Selesaikan Pre-Test Dulu</span>
                    </>
                  )}
                </button>
              </div>

              {/* CARD MODUL 3: POST-TEST (EVALUASI AKHIR) */}
              <div
                className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border p-4 sm:p-5 transition-all ${
                  currentTopikProg.postTest.completed && currentTopikProg.postTest.isPassed
                    ? "border-emerald-300 bg-emerald-50/60 dark:border-emerald-900 dark:bg-emerald-950/30"
                    : currentTopikProg.postTest.completed && !currentTopikProg.postTest.isPassed
                    ? "border-amber-300 bg-amber-50/60 dark:border-amber-900 dark:bg-amber-950/30"
                    : currentTopikProg.materi.completed
                    ? "border-purple-300 bg-purple-50/60 dark:border-purple-900 dark:bg-purple-950/30"
                    : "border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900/60 opacity-80"
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-sm ${
                      currentTopikProg.postTest.completed && currentTopikProg.postTest.isPassed
                        ? "bg-emerald-500 text-white"
                        : currentTopikProg.materi.completed
                        ? "bg-purple-600 text-white"
                        : "bg-slate-300 dark:bg-slate-700 text-slate-500"
                    }`}
                  >
                    {currentTopikProg.materi.completed ? (
                      <Award className="h-6 w-6" />
                    ) : (
                      <Lock className="h-6 w-6" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-extrabold uppercase text-purple-600 dark:text-purple-400">
                        Modul 3
                      </span>
                      {currentTopikProg.postTest.completed && currentTopikProg.postTest.isPassed ? (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                          Lulus • Skor: {currentTopikProg.postTest.skor}/100
                        </span>
                      ) : currentTopikProg.postTest.completed ? (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-black text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                          Skor: {currentTopikProg.postTest.skor}/100 (Remedial Tersedia)
                        </span>
                      ) : currentTopikProg.materi.completed ? (
                        <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-black text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                          Siap Dikerjakan
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-black text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                          Terkunci (Wajib Materi)
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                      Post-Test (Evaluasi Kelulusan Topik)
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                      Ujian evaluasi akhir materi topik. Nilai kelulusan minimal (KKM) adalah 80.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleStartPostTest}
                  disabled={!currentTopikProg.materi.completed}
                  className={`w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all ${
                    currentTopikProg.postTest.completed && currentTopikProg.postTest.isPassed
                      ? "bg-emerald-600 hover:bg-emerald-700 active:scale-95"
                      : currentTopikProg.materi.completed
                      ? "bg-purple-600 hover:bg-purple-700 active:scale-95"
                      : "bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed"
                  }`}
                >
                  {currentTopikProg.materi.completed ? (
                    <>
                      <span>
                        {currentTopikProg.postTest.completed && currentTopikProg.postTest.isPassed
                          ? "Lihat Hasil Post-Test"
                          : currentTopikProg.postTest.completed
                          ? "Ikuti Remedial Post-Test"
                          : "Mulai Post-Test"}
                      </span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      <Lock className="h-3.5 w-3.5" />
                      <span>Pelajari Materi Dulu</span>
                    </>
                  )}
                </button>
              </div>

              {/* CARD MODUL 4: SURVEI KEPUASAN PENGGUNA */}
              <div
                className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border p-4 sm:p-5 transition-all ${
                  currentTopikProg.survey?.completed
                    ? "border-emerald-300 bg-emerald-50/60 dark:border-emerald-900 dark:bg-emerald-950/30"
                    : currentTopikProg.postTest.completed && currentTopikProg.postTest.isPassed
                    ? "border-teal-300 bg-teal-50/60 dark:border-teal-900 dark:bg-teal-950/30"
                    : "border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900/60 opacity-80"
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-sm ${
                      currentTopikProg.survey?.completed
                        ? "bg-emerald-500 text-white"
                        : currentTopikProg.postTest.completed && currentTopikProg.postTest.isPassed
                        ? "bg-teal-600 text-white shadow-teal-500/25"
                        : "bg-slate-300 dark:bg-slate-700 text-slate-500"
                    }`}
                  >
                    {currentTopikProg.postTest.completed && currentTopikProg.postTest.isPassed ? (
                      <ClipboardCheck className="h-6 w-6" />
                    ) : (
                      <Lock className="h-6 w-6" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-extrabold uppercase text-teal-600 dark:text-teal-400">
                        Modul 4
                      </span>
                      {currentTopikProg.survey?.completed ? (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                          Selesai Diisi • Rating {currentTopikProg.survey.rating || 5}/5
                        </span>
                      ) : currentTopikProg.postTest.completed && currentTopikProg.postTest.isPassed ? (
                        <span className="rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-black text-teal-800 dark:bg-teal-900 dark:text-teal-200">
                          Siap Diisi (Wajib untuk Sertifikat)
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-black text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                          Terkunci (Wajib Lulus Post-Test)
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                      Survei Kepuasan Pembelajaran Topik
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                      Evaluasi kepuasan peserta terhadap kualitas materi, panduan dokumen, dan video edukasi BBPOM.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleStartSurvey}
                  disabled={!currentTopikProg.postTest.completed || !currentTopikProg.postTest.isPassed}
                  className={`w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all ${
                    currentTopikProg.survey?.completed
                      ? "bg-emerald-600 hover:bg-emerald-700 active:scale-95"
                      : currentTopikProg.postTest.completed && currentTopikProg.postTest.isPassed
                      ? "bg-teal-600 hover:bg-teal-700 active:scale-95 shadow-teal-600/20"
                      : "bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed"
                  }`}
                >
                  {currentTopikProg.postTest.completed && currentTopikProg.postTest.isPassed ? (
                    <>
                      <span>
                        {currentTopikProg.survey?.completed
                          ? "Lihat / Ubah Survei"
                          : "Isi Survei Kepuasan"}
                      </span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      <Lock className="h-3.5 w-3.5" />
                      <span>Selesaikan Post-Test Dulu</span>
                    </>
                  )}
                </button>
              </div>

              {/* CARD SECTION: AKSES E-SERTIFIKAT KELULUSAN PER TOPIK */}
              <div
                className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border p-4 sm:p-5 transition-all ${
                  currentTopikProg.survey?.completed
                    ? "border-emerald-300/90 bg-gradient-to-br from-emerald-50/90 via-teal-50/40 to-green-50/60 dark:border-emerald-800/80 dark:bg-slate-800/90 shadow-sm"
                    : "border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-900/60 opacity-80"
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-sm ${
                      currentTopikProg.survey?.completed
                        ? "bg-emerald-600 text-white shadow-emerald-500/25 ring-2 ring-emerald-300 dark:ring-emerald-900"
                        : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500"
                    }`}
                  >
                    <Award className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-extrabold uppercase text-emerald-700 dark:text-emerald-400">
                        Akses E-Sertifikat Topik
                      </span>
                      {currentTopikProg.survey?.completed ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          <CheckCircle2 className="h-3 w-3" />
                          Siap Diunduh
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-black text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                          <Lock className="h-3 w-3" />
                          Terkunci (Wajib Isi Survei)
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                      Sertifikat Kelulusan Topik: {selectedTopik.judul}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                      {currentTopikProg.survey?.completed
                        ? "Selamat! Anda telah menyelesaikan seluruh tahapan (Pre-Test, Materi, Post-Test, dan Survei). E-Sertifikat resmi kompetensi BBPOM Palembang siap diunduh."
                        : "Sertifikat per topik ini baru dapat diunduh setelah Anda menyelesaikan evaluasi Post-Test dan mengisi Survei Kepuasan."}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDownloadCertificate(selectedTopik)}
                  disabled={!currentTopikProg.survey?.completed}
                  className={`w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition-all shadow-sm ${
                    currentTopikProg.survey?.completed
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 active:scale-95 cursor-pointer"
                      : "bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-500 cursor-not-allowed border border-slate-300/40 dark:border-slate-700/40"
                  }`}
                >
                  {currentTopikProg.survey?.completed ? (
                    <>
                      <Download className="h-4 w-4" />
                      <span>Unduh Sertifikat Topik</span>
                    </>
                  ) : (
                    <>
                      <Lock className="h-3.5 w-3.5" />
                      <span>Unduh Sertifikat (Terkunci)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. MODAL MATERI: DOKUMEN PDF & VIDEO (Requirement 4)         */}
      {/* ------------------------------------------------------------- */}
      {activeModuleModal === "materi" && selectedTopik && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 sm:p-6 backdrop-blur-md animate-fade-in">
          <div className="relative flex h-[92vh] w-full max-w-4xl flex-col rounded-3xl bg-white shadow-2xl overflow-hidden dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-5 py-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-orange-100 text-brand-orange dark:bg-orange-950 dark:text-orange-300 px-2.5 py-0.5 text-[10px] font-black uppercase">
                    Modul 2: Materi Pembelajaran
                  </span>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    {selectedTopik.nomor}
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-0.5 line-clamp-1">
                  {selectedTopik.judul}
                </h2>
              </div>

              {/* Mode Switcher Tabs (PDF vs Video) */}
              <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
                <button
                  type="button"
                  onClick={() => setMateriTab("pdf")}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                    materiTab === "pdf"
                      ? "bg-white text-brand-orange shadow-sm dark:bg-slate-700 dark:text-orange-300"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-400"
                  }`}
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>Dokumen PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMateriTab("video")}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                    materiTab === "video"
                      ? "bg-white text-rose-600 shadow-sm dark:bg-slate-700 dark:text-white"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-400"
                  }`}
                >
                  <Video className="h-3.5 w-3.5" />
                  <span>Video Pembelajaran</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setActiveModuleModal("overview")}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300 transition-colors ml-2"
                title="Kembali ke Alur Topik"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Viewer Content Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-slate-50/50 dark:bg-slate-950/50">
              {/* TAB 1: DOKUMEN PDF */}
              {materiTab === "pdf" && (
                <div className="space-y-4">
                  {/* PDF Toolbar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                          {selectedTopik.pdfTitle || "Dokumen Edukasi Resmi BBPOM Palembang.pdf"}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Format Dokumen Resmi (Buku Pedoman Keamanan Obat & Makanan)
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={selectedTopik.pdfUrl || "/documents/materi-edukasi-bbpom.pdf"}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 shadow-sm"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Unduh PDF</span>
                      </a>
                    </div>
                  </div>

                  {/* Embedded PDF iframe / Document Canvas */}
                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <iframe
                      src={`${selectedTopik.pdfUrl || "/documents/materi-edukasi-bbpom.pdf"}#toolbar=1&navpanes=0&scrollbar=1&view=FitH`}
                      className="w-full h-[480px] sm:h-[540px] border-none"
                      title={selectedTopik.judul}
                    />
                  </div>

                  {/* Bacaan Lengkap Card as Supplementary Reader */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">
                      Poin Inti Bacaan Dokumen:
                    </h3>
                    <ul className="space-y-2">
                      {selectedTopik.kontenPoin.map((poin, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{poin}</span>
                        </li>
                      ))}
                    </ul>
                    {selectedTopik.tipsPenting && (
                      <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/60 dark:text-amber-200">
                        <strong>💡 Tips Konsumen:</strong> {selectedTopik.tipsPenting}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: VIDEO PEMBELAJARAN */}
              {materiTab === "video" && (
                <div className="space-y-4">
                  {/* Video Player */}
                  <div className="overflow-hidden rounded-2xl bg-black shadow-xl border border-slate-800">
                    <iframe
                      src={selectedTopik.videoUrl || "https://www.youtube-nocookie.com/embed/5UaK_K63R5E"}
                      title={selectedTopik.videoTitle || selectedTopik.judul}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full aspect-video border-none"
                    />
                  </div>

                  {/* Video Details Card */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="inline-block rounded-md bg-rose-100 text-rose-700 px-2.5 py-0.5 text-xs font-bold dark:bg-rose-950 dark:text-rose-300">
                        Durasi: {selectedTopik.videoDuration || "03:45"} Menit
                      </span>
                      <span className="text-xs text-slate-400">Media Edukasi BBPOM</span>
                    </div>

                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      {selectedTopik.videoTitle || selectedTopik.judul}
                    </h3>

                    {selectedTopik.videoTranscript && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
                        <strong>Ringkasan Narasi Video:</strong> {selectedTopik.videoTranscript}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Confirmation Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-200 dark:border-slate-800 bg-white p-4 sm:px-6 dark:bg-slate-900">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={materiChecked}
                  onChange={(e) => setMateriChecked(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-brand-orange focus:ring-brand-orange"
                />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Saya telah selesai membaca dokumen PDF / menonton video materi ini.
                </span>
              </label>

              <button
                type="button"
                onClick={handleCompleteMateri}
                disabled={!materiChecked}
                className={`flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold text-white shadow-md transition-all ${
                  materiChecked
                    ? "bg-gradient-to-r from-brand-orange to-orange-600 hover:from-orange-600 hover:to-orange-700 active:scale-95"
                    : "bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed"
                }`}
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Tandai Selesai & Buka Post-Test</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. MODAL QUIZ RUNNER (PRE-TEST & POST-TEST)                   */}
      {/* ------------------------------------------------------------- */}
      {(activeModuleModal === "pre-test" || activeModuleModal === "post-test") &&
        selectedTopik &&
        selectedTopik.soalList && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
            <div className="relative flex max-h-[92vh] w-full max-w-2xl flex-col rounded-3xl bg-white shadow-2xl overflow-hidden dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              {/* Quiz Header */}
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-5 py-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-md px-2.5 py-0.5 text-[10px] font-black uppercase ${
                        quizType === "pre"
                          ? "bg-orange-100 text-brand-orange dark:bg-orange-950 dark:text-orange-300"
                          : "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300"
                      }`}
                    >
                      {quizType === "pre"
                        ? "Modul 1: Pre-Test Topik"
                        : "Modul 3: Post-Test Evaluasi"}
                    </span>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                      {selectedTopik.nomor}
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white mt-0.5 line-clamp-1">
                    {selectedTopik.judul}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveModuleModal("overview")}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* QUIZ RESULT SCREEN IF SUBMITTED */}
              {quizResult ? (
                <div className="flex-1 overflow-y-auto p-6 sm:p-8 text-center space-y-5">
                  <div
                    className={`mx-auto flex h-16 w-16 items-center justify-center rounded-3xl shadow-inner ${
                      quizType === "pre" || quizResult.isPassed
                        ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300"
                        : "bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-300"
                    }`}
                  >
                    <Award className="h-8 w-8" />
                  </div>

                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                      {quizType === "pre"
                        ? "Pre-Test Berhasil Disimpan!"
                        : quizResult.isPassed
                        ? "Selamat! Anda Lulus Post-Test 🎉"
                        : "Hasil Evaluasi Post-Test"}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {quizType === "pre"
                        ? "Modul 2 (Materi Pembelajaran) sekarang telah terbuka. Pelajari materi untuk mempersiapkan Post-Test."
                        : quizResult.isPassed
                        ? "Pemahaman Anda telah memenuhi standar kelulusan KKM (>= 80). Modul topik ini tuntas!"
                        : "Nilai Anda belum mencapai KKM 80. Silakan ikuti kesempatan remedial untuk memperbaiki nilai."}
                    </p>
                  </div>

                  {/* Big Score Box */}
                  <div className="rounded-3xl border border-slate-200 bg-slate-50/70 py-6 dark:border-slate-800 dark:bg-slate-800/40 max-w-sm mx-auto">
                    <div
                      className={`text-5xl font-black ${
                        quizType === "pre" || quizResult.isPassed
                          ? "text-brand-orange dark:text-orange-400"
                          : "text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      {quizResult.skor}
                      <span className="text-xl font-bold text-slate-400">/100</span>
                    </div>
                    <div className="mt-1 text-xs font-semibold text-slate-500">
                      {quizResult.jumlahBenar} dari {quizResult.totalSoal} Soal Terjawab Benar
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
                    {quizType === "pre" ? (
                      <button
                        type="button"
                        onClick={handleStartMateri}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-orange to-orange-600 px-6 py-3 text-xs font-bold text-white shadow hover:from-orange-600 hover:to-orange-700 transition-all active:scale-95"
                      >
                        <BookOpen className="h-4 w-4" />
                        <span>Buka Modul 2: Pelajari Materi (PDF & Video)</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    ) : quizResult.isPassed ? (
                      <>
                        <button
                          type="button"
                          onClick={handleStartSurvey}
                          className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-600/25 transition-all active:scale-95 cursor-pointer"
                        >
                          <ClipboardCheck className="h-4 w-4" />
                          <span>Lanjut: Isi Survei Kepuasan (Wajib untuk Sertifikat)</span>
                          <ArrowRight className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveModuleModal("overview")}
                          className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-5 py-3 text-xs font-bold text-slate-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 transition-all active:scale-95"
                        >
                          <Check className="h-4 w-4" />
                          <span>Kembali ke Halaman Topik</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            if (!selectedTopik) return;
                            resetTopikPostTestRemedial(selectedTopik.id);
                            refreshSesi();
                            setQuizIndex(0);
                            setQuizAnswers({});
                            setQuizResult(null);
                          }}
                          className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-5 py-3 text-xs font-bold text-white shadow hover:bg-amber-700 transition-all active:scale-95"
                        >
                          <RotateCcw className="h-4 w-4" />
                          <span>Ikuti Remedial Post-Test Sekarang</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleStartMateri}
                          className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
                        >
                          <span>Review Materi Lagi</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                /* QUESTION RUNNER */
                (() => {
                  const soalList = selectedTopik.soalList || [];
                  const currentSoal = soalList[quizIndex];
                  return (
                    <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
                      {/* Stepper Progress */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-600 dark:text-slate-300">
                            Soal {quizIndex + 1} dari {soalList.length}
                          </span>
                          <span className="font-semibold text-slate-400">
                            Terjawab: {Object.keys(quizAnswers).length} / {soalList.length}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {soalList.map((s, idx) => (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => setQuizIndex(idx)}
                              className={`h-2 flex-1 rounded-full transition-all ${
                                quizIndex === idx
                                  ? "bg-brand-orange ring-2 ring-orange-300 dark:ring-orange-900"
                                  : quizAnswers[s.id]
                                  ? "bg-emerald-500"
                                  : "bg-slate-200 dark:bg-slate-800"
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Question Box */}
                      {currentSoal && (
                        <div className="space-y-4">
                          <div className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-800/40">
                            <span className="inline-block rounded-md bg-orange-100 text-brand-orange dark:bg-orange-950 dark:text-orange-300 px-2.5 py-0.5 text-[10px] font-black uppercase mb-2">
                              Pertanyaan {quizIndex + 1}
                            </span>
                            <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-relaxed">
                              {currentSoal.pertanyaan}
                            </h4>
                          </div>

                          {/* Options List */}
                          <div className="space-y-2.5">
                            {currentSoal.pilihan.map((opt) => {
                              const isSelected = quizAnswers[currentSoal.id] === opt.key;
                              return (
                                <button
                                  key={opt.key}
                                  type="button"
                                  onClick={() => handleSelectAnswer(currentSoal.id, opt.key)}
                                  className={`w-full flex items-center gap-3.5 rounded-2xl border p-3.5 sm:p-4 text-left transition-all ${
                                    isSelected
                                      ? "border-brand-orange bg-orange-50/70 text-orange-950 shadow-sm ring-2 ring-orange-500/20 dark:border-orange-500 dark:bg-orange-950/40 dark:text-orange-200"
                                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                                  }`}
                                >
                                  <div
                                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-black text-xs transition-colors ${
                                      isSelected
                                        ? "bg-brand-orange text-white"
                                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                                    }`}
                                  >
                                    {opt.key}
                                  </div>
                                  <span className="text-xs sm:text-sm font-medium leading-relaxed">
                                    {opt.teks}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Navigation Buttons */}
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                        <button
                          type="button"
                          onClick={() => setQuizIndex((prev) => Math.max(0, prev - 1))}
                          disabled={quizIndex === 0}
                          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                        >
                          Sebelumnya
                        </button>

                        {quizIndex < soalList.length - 1 ? (
                          <button
                            type="button"
                            onClick={() =>
                              setQuizIndex((prev) => Math.min(soalList.length - 1, prev + 1))
                            }
                            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-orange to-orange-600 px-5 py-2 text-xs font-bold text-white shadow hover:from-orange-600 hover:to-orange-700 active:scale-95"
                          >
                            <span>Selanjutnya</span>
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={
                              quizType === "pre"
                                ? handleSubmitPreTest
                                : handleSubmitPostTest
                            }
                            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-6 py-2 text-xs font-bold text-white shadow hover:bg-emerald-700 active:scale-95"
                          >
                            <Check className="h-4 w-4" />
                            <span>Kumpulkan Jawaban</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })()
              )}
            </div>
          </div>
        )}

      {/* ------------------------------------------------------------- */}
      {/* 4. MODAL SURVEI KEPUASAN PENGGUNA (Requirement Survey)         */}
      {/* ------------------------------------------------------------- */}
      {activeModuleModal === "survey" && selectedTopik && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="relative flex max-h-[92vh] w-full max-w-2xl flex-col rounded-3xl bg-white shadow-2xl overflow-hidden dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            {/* Survey Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-5 py-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 px-2.5 py-0.5 text-[10px] font-black uppercase">
                    Modul 4: Survei Kepuasan
                  </span>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    {selectedTopik.nomor}
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white mt-0.5 line-clamp-1">
                  Survei Evaluasi Pembelajaran: {selectedTopik.judul}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setActiveModuleModal("overview")}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300 transition-colors"
                title="Tutup & Kembali"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Survey Content */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
              <div className="rounded-2xl border border-teal-200 bg-teal-50/70 p-4 text-xs text-teal-900 dark:border-teal-900/60 dark:bg-teal-950/40 dark:text-teal-200 leading-relaxed">
                <strong>📝 Survei Indeks Kepuasan Pengguna Cindo BBPOM Palembang:</strong>
                <p className="mt-1 text-[11px] text-teal-800 dark:text-teal-300">
                  Mohon luangkan waktu sejenak untuk menilai materi topik ini. Jawaban Anda membantu kami terus meningkatkan kualitas pelayanan dan materi edukasi keamanan obat & makanan.
                </p>
              </div>

              {/* Questionnaire Items (Pernyataan Survei) */}
              <div className="space-y-4">
                {[
                  {
                    id: 1,
                    pernyataan:
                      "Materi pembelajaran topik ini disajikan secara jelas, informatif, dan mudah dipahami.",
                  },
                  {
                    id: 2,
                    pernyataan:
                      "Kualitas materi panduan dokumen PDF dan video interaktif sangat memuaskan.",
                  },
                  {
                    id: 3,
                    pernyataan:
                      "Topik ini memberikan manfaat nyata bagi wawasan dan keamanan konsumsi obat & pangan sehari-hari.",
                  },
                ].map((item) => {
                  const val = surveyAnswers[item.id] || 5;
                  return (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/40 space-y-2.5"
                    >
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {item.id}. {item.pernyataan}
                      </div>

                      {/* 1-5 Rating Choice */}
                      <div className="flex items-center justify-between gap-1.5 pt-1">
                        {[
                          { score: 1, label: "Sangat Kurang" },
                          { score: 2, label: "Kurang" },
                          { score: 3, label: "Cukup" },
                          { score: 4, label: "Puas" },
                          { score: 5, label: "Sangat Puas" },
                        ].map((opt) => (
                          <button
                            key={opt.score}
                            type="button"
                            onClick={() =>
                              setSurveyAnswers((prev) => ({
                                ...prev,
                                [item.id]: opt.score,
                              }))
                            }
                            className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-xl text-center transition-all ${
                              val === opt.score
                                ? "bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-400 font-bold"
                                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700"
                            }`}
                          >
                            <span className="text-xs sm:text-sm font-black">
                              {opt.score}
                            </span>
                            <span className="text-[9px] hidden sm:inline-block leading-tight mt-0.5">
                              {opt.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Star Rating General */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/40 space-y-2 text-center">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Kepuasan Keseluruhan Terhadap Topik Ini:
                </span>
                <div className="flex items-center justify-center gap-2 pt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setSurveyRating(star)}
                      className="p-1 transition-transform hover:scale-125"
                    >
                      <Star
                        className={`h-7 w-7 ${
                          star <= surveyRating
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-300 dark:text-slate-600"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <div className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                  {surveyRating === 5
                    ? "⭐⭐⭐⭐⭐ Sangat Memuaskan (5/5)"
                    : surveyRating === 4
                    ? "⭐⭐⭐⭐ Memuaskan (4/5)"
                    : surveyRating === 3
                    ? "⭐⭐⭐ Cukup (3/5)"
                    : surveyRating === 2
                    ? "⭐⭐ Kurang (2/5)"
                    : "⭐ Sangat Kurang (1/5)"}
                </div>
              </div>

              {/* Saran dan Masukan */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Kritik, Saran, atau Masukan untuk BBPOM Palembang (Opsional):
                </label>
                <textarea
                  value={surveySaran}
                  onChange={(e) => setSurveySaran(e.target.value)}
                  placeholder="Tuliskan masukan atau topik materi lain yang Anda harapkan..."
                  rows={3}
                  className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-xs outline-none transition-all focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800 bg-white p-4 sm:px-6 dark:bg-slate-900">
              <button
                type="button"
                onClick={() => setActiveModuleModal("overview")}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSubmitSurvey}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 active:scale-95 transition-all cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Kirim Survei & Buka Akses Sertifikat</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifikasi Unduh Sertifikat Topik */}
      {downloadNotice && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3.5 rounded-2xl border border-emerald-300 bg-white p-4 shadow-2xl dark:border-emerald-800 dark:bg-slate-900 animate-slide-up max-w-md">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/25">
            <Download className="h-5 w-5 animate-bounce" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-1.5">
              <span className="rounded-md bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 text-[10px] font-black text-emerald-800 dark:text-emerald-300 uppercase">
                {downloadNotice.nomor}
              </span>
              <h4 className="text-xs font-black text-slate-900 dark:text-white">
                Memproses Unduhan Sertifikat
              </h4>
            </div>
            <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-300 line-clamp-1 font-medium">
              {downloadNotice.topikJudul}
            </p>
            <p className="mt-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
              ✓ E-Sertifikat kelulusan topik BBPOM Palembang siap diunduh.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setDownloadNotice(null)}
            className="text-slate-400 hover:text-slate-600 dark:text-slate-500 p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

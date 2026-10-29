"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, RotateCcw, CheckCircle2 } from "lucide-react";
import { StepGarda, BiodataGarda, EvaluasiGarda, SoalUjian, ModulMateri } from "./types";
import {
  SOAL_PRE_TEST,
  SOAL_POST_TEST,
  MODUL_MATERI_LIST,
  CONTOH_BIODATA_DEMO,
} from "./data/mock-data";
import {
  getGardaPublicDataAction,
  submitGardaPesertaAssessmentAction,
} from "@/app/actions/garda-ampera";
import { StepProgress } from "./StepProgress";
import { BiodataForm } from "./BiodataForm";
import { QuizView } from "./QuizView";
import { MateriViewer } from "./MateriViewer";
import { EvaluasiForm } from "./EvaluasiForm";
import { SertifikatView } from "./SertifikatView";
import { ConfirmDialogModal, ConfirmDialogConfig } from "./GardaNotificationModal";

const INITIAL_BIODATA: BiodataGarda = {
  nik: "",
  nama: "",
  tanggalTes: new Date().toISOString().split("T")[0],
  alamat: "",
  usia: "",
  jenisKelamin: "",
  pendidikan: "",
  pekerjaan: "",
  instansi: "",
};

const STORAGE_SESSION_KEY = "garda_ampera_session_active";

export function GardaAmperaContainer() {
  const [step, setStep] = useState<StepGarda>("biodata");
  const [completedSteps, setCompletedSteps] = useState<Set<StepGarda>>(new Set());
  const [sessionHydrated, setSessionHydrated] = useState(false);
  const [restoredBanner, setRestoredBanner] = useState(false);

  // Dynamic Data dari Database / Server Actions
  const [soalPre, setSoalPre] = useState<SoalUjian[]>([]);
  const [soalPost, setSoalPost] = useState<SoalUjian[]>([]);
  const [materiModules, setMateriModules] = useState<ModulMateri[]>([]);

  useEffect(() => {
    getGardaPublicDataAction().then((res) => {
      setSoalPre(res.preTestSoal || []);
      setSoalPost(res.postTestSoal || []);
      setMateriModules(res.modules || []);
    });
  }, []);

  // Biodata state
  const [biodata, setBiodata] = useState<BiodataGarda>(INITIAL_BIODATA);

  // Pre-test state
  const [preTestAnswers, setPreTestAnswers] = useState<Record<number, string>>({});
  const [preTestScore, setPreTestScore] = useState<number | null>(null);
  const [preTestSubmitted, setPreTestSubmitted] = useState<boolean>(false);

  // Materi state (3 modules)
  const [currentModulIndex, setCurrentModulIndex] = useState<number>(0);
  const [currentSlideIndex, setCurrentSlideIndex] = useState<Record<number, number>>({
    1: 0,
    2: 0,
    3: 0,
  });
  const [maxSlideReached, setMaxSlideReached] = useState<Record<number, number>>({
    1: 0,
    2: 0,
    3: 0,
  });
  const [modul1Completed, setModul1Completed] = useState<boolean>(false);
  const [modul2Completed, setModul2Completed] = useState<boolean>(false);
  const [modul3Completed, setModul3Completed] = useState<boolean>(false);

  // Post-test state
  const [postTestAnswers, setPostTestAnswers] = useState<Record<number, string>>({});
  const [postTestScore, setPostTestScore] = useState<number | null>(null);
  const [postTestSubmitted, setPostTestSubmitted] = useState<boolean>(false);
  const [postTestAttempts, setPostTestAttempts] = useState<number>(1);

  // Evaluasi state
  const [evaluasiData, setEvaluasiData] = useState<EvaluasiGarda | null>(null);
  const [evaluasiSubmitted, setEvaluasiSubmitted] = useState<boolean>(false);

  // Confirm Modal state
  const [confirmConfig, setConfirmConfig] = useState<ConfirmDialogConfig | null>(null);

  // Sertifikat number & date
  const [nomorSertifikat, setNomorSertifikat] = useState<string>(() => {
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    return `BBPOM-PLG/GARDA/2026/X/${randomDigits}`;
  });
  const [tanggalLulus, setTanggalLulus] = useState<string>(() => {
    return new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  });

  // =========================================================================
  // 1. HYDRATION: Pulihkan progres saat browser di-refresh oleh pengguna
  // =========================================================================
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_SESSION_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved && saved.step) {
          setStep(saved.step);
          if (Array.isArray(saved.completedSteps)) {
            setCompletedSteps(new Set(saved.completedSteps));
          }
          if (saved.biodata) setBiodata(saved.biodata);
          if (saved.preTestAnswers) setPreTestAnswers(saved.preTestAnswers);
          if (typeof saved.preTestScore === "number") setPreTestScore(saved.preTestScore);
          if (saved.preTestSubmitted !== undefined) setPreTestSubmitted(saved.preTestSubmitted);
          if (saved.currentModulIndex !== undefined) setCurrentModulIndex(saved.currentModulIndex);
          if (saved.currentSlideIndex) setCurrentSlideIndex(saved.currentSlideIndex);
          if (saved.maxSlideReached) setMaxSlideReached(saved.maxSlideReached);
          if (saved.modul1Completed !== undefined) setModul1Completed(saved.modul1Completed);
          if (saved.modul2Completed !== undefined) setModul2Completed(saved.modul2Completed);
          if (saved.modul3Completed !== undefined) setModul3Completed(saved.modul3Completed);
          if (saved.postTestAnswers) setPostTestAnswers(saved.postTestAnswers);
          if (typeof saved.postTestScore === "number") setPostTestScore(saved.postTestScore);
          if (saved.postTestSubmitted !== undefined) setPostTestSubmitted(saved.postTestSubmitted);
          if (saved.postTestAttempts !== undefined) setPostTestAttempts(saved.postTestAttempts);
          if (saved.evaluasiData) setEvaluasiData(saved.evaluasiData);
          if (saved.evaluasiSubmitted !== undefined) setEvaluasiSubmitted(saved.evaluasiSubmitted);
          if (saved.nomorSertifikat) setNomorSertifikat(saved.nomorSertifikat);
          if (saved.tanggalLulus) setTanggalLulus(saved.tanggalLulus);

          if (saved.step !== "biodata") {
            setRestoredBanner(true);
          }
        }
      }
    } catch (e) {
      console.warn("Gagal membaca session localStorage Garda Ampera:", e);
    } finally {
      setSessionHydrated(true);
    }
  }, []);

  // =========================================================================
  // 2. PERSISTENCE: Simpan snapshot setiap perubahan state
  // =========================================================================
  useEffect(() => {
    if (!sessionHydrated) return;

    // Jika form masih kosong total dan belum pindah dari biodata awal, lewati
    if (step === "biodata" && !biodata.nik && !biodata.nama) {
      return;
    }

    const snapshot = {
      step,
      completedSteps: Array.from(completedSteps),
      biodata,
      preTestAnswers,
      preTestScore,
      preTestSubmitted,
      currentModulIndex,
      currentSlideIndex,
      maxSlideReached,
      modul1Completed,
      modul2Completed,
      modul3Completed,
      postTestAnswers,
      postTestScore,
      postTestSubmitted,
      postTestAttempts,
      evaluasiData,
      evaluasiSubmitted,
      nomorSertifikat,
      tanggalLulus,
      savedAt: Date.now(),
    };

    try {
      localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(snapshot));
    } catch (e) {
      console.warn("Gagal menyimpan snapshot ke localStorage:", e);
    }
  }, [
    sessionHydrated,
    step,
    completedSteps,
    biodata,
    preTestAnswers,
    preTestScore,
    preTestSubmitted,
    currentModulIndex,
    currentSlideIndex,
    maxSlideReached,
    modul1Completed,
    modul2Completed,
    modul3Completed,
    postTestAnswers,
    postTestScore,
    postTestSubmitted,
    postTestAttempts,
    evaluasiData,
    evaluasiSubmitted,
    nomorSertifikat,
    tanggalLulus,
  ]);

  // Mark step as completed
  const markStepDone = (doneStep: StepGarda) => {
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      next.add(doneStep);
      return next;
    });
  };

  // 1. Submit Biodata -> Lanjut ke Pre-Test
  const handleBiodataSubmit = (data: BiodataGarda) => {
    setBiodata(data);
    markStepDone("biodata");
    setStep("pre-test");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 2. Submit Pre-Test -> Hitung skor & Tampilkan skor
  const handlePreTestSubmit = (answers: Record<number, string>, score: number) => {
    setPreTestAnswers(answers);
    setPreTestScore(score);
    setPreTestSubmitted(true);
    markStepDone("pre-test");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Pre-test Proceed -> Lanjut ke Materi
  const handleProceedToMateri = () => {
    setStep("materi");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 3. Update Slide & Complete Module logic
  const handleUpdateSlide = (modulId: number, slideIdx: number) => {
    setCurrentSlideIndex((prev) => ({ ...prev, [modulId]: slideIdx }));
    setMaxSlideReached((prev) => ({
      ...prev,
      [modulId]: Math.max(prev[modulId] || 0, slideIdx),
    }));
  };

  const handleCompleteModul = (modulId: number) => {
    const m = materiModules.find((mod) => mod.id === modulId);
    const nomor = m?.nomor ?? modulId;
    if (nomor === 1) setModul1Completed(true);
    if (nomor === 2) setModul2Completed(true);
    if (nomor === 3) setModul3Completed(true);

    if (m && m.slides) {
      setMaxSlideReached((prev) => ({
        ...prev,
        [modulId]: m.slides.length - 1,
        [nomor]: m.slides.length - 1,
      }));
    }

    const allFinished =
      materiModules.length > 0 &&
      materiModules.every((mod) => {
        if (mod.id === modulId || mod.nomor === nomor) return true;
        if (mod.nomor === 1) return modul1Completed;
        if (mod.nomor === 2) return modul2Completed;
        if (mod.nomor === 3) return modul3Completed;
        return (
          (maxSlideReached[mod.id] ?? maxSlideReached[mod.nomor] ?? 0) >=
          (mod.slides?.length || 1) - 1
        );
      });

    if (allFinished || (materiModules.length <= 1 && modulId === materiModules[0]?.id)) {
      markStepDone("materi");
    }
  };

  const handleProceedToPostTest = () => {
    setStep("post-test");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 4. Submit Post-Test
  const handlePostTestSubmit = (answers: Record<number, string>, score: number) => {
    setPostTestAnswers(answers);
    setPostTestScore(score);
    setPostTestSubmitted(true);
    if (score >= 70) {
      markStepDone("post-test");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRetryPostTest = async () => {
    setPostTestAnswers({});
    setPostTestScore(null);
    setPostTestSubmitted(false);
    setPostTestAttempts((prev) => prev + 1);
    try {
      const res = await getGardaPublicDataAction();
      if (res.postTestSoal && res.postTestSoal.length > 0) {
        setSoalPost(res.postTestSoal);
      }
    } catch {
      // fallback
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleProceedToEvaluasi = () => {
    setStep("evaluasi");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 5. Submit Evaluasi -> Simpan ke Database & Buka Sertifikat
  const handleEvaluasiSubmit = async (data: EvaluasiGarda) => {
    setEvaluasiData(data);
    setEvaluasiSubmitted(true);
    markStepDone("evaluasi");
    markStepDone("sertifikat");
    setStep("sertifikat");
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Simpan data lengkap peserta ke database via Server Action
    try {
      await submitGardaPesertaAssessmentAction({
        biodata,
        preTestScore: preTestScore ?? 0,
        postTestScore: postTestScore ?? 0,
        postTestAttempts,
        isLulus: (postTestScore ?? 0) >= 70,
        nomorSertifikat,
        evaluasi: data,
      });
    } catch (err) {
      console.warn("Gagal sinkron assessment ke server action:", err);
    }
  };

  // Reset demo
  const handleResetAll = () => {
    setConfirmConfig({
      isOpen: true,
      title: "Mulai Ulang Seluruh Uji Coba?",
      message:
        "Apakah Anda yakin ingin mengulang dari awal?\nSeluruh riwayat nilai dan jawaban akan direset kembali ke langkah Biodata.",
      confirmText: "Ya, Mulai Ulang",
      cancelText: "Batal",
      type: "warning",
      onCancel: () => setConfirmConfig(null),
      onConfirm: () => {
        try {
          localStorage.removeItem(STORAGE_SESSION_KEY);
        } catch {}
        setConfirmConfig(null);
        setRestoredBanner(false);
        setStep("biodata");
        setCompletedSteps(new Set());
        setBiodata(INITIAL_BIODATA);
        setPreTestAnswers({});
        setPreTestScore(null);
        setPreTestSubmitted(false);
        setModul1Completed(false);
        setModul2Completed(false);
        setModul3Completed(false);
        setCurrentSlideIndex({ 1: 0, 2: 0, 3: 0 });
        setMaxSlideReached({ 1: 0, 2: 0, 3: 0 });
        setPostTestAnswers({});
        setPostTestScore(null);
        setPostTestSubmitted(false);
        setPostTestAttempts(1);
        setEvaluasiData(null);
        setEvaluasiSubmitted(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
      },
    });
  };

  return (
    <div className="w-full">
      {/* Visual Stepper */}
      <StepProgress
        currentStep={step}
        completedSteps={completedSteps}
        onStepClick={(targetStep) => setStep(targetStep)}
      />

      {/* Sesi Restored Banner */}
      {restoredBanner && step !== "biodata" && (
        <div className="mb-6 p-4 sm:p-4.5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200 dark:border-blue-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 text-xs text-blue-950 dark:text-blue-200 shadow-sm animate-fade-up">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4 text-brand-orange" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-navy-900 dark:text-white leading-tight">
                Sesi Belajar Anda Berhasil Dipulihkan
              </p>
              <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed whitespace-normal break-words">
                Peserta <strong>{biodata.nama || "Tamu"}</strong> sedang berada pada tahap <strong>{step.toUpperCase()}</strong>. Seluruh progres sebelumnya tetap tersimpan aman di peramban Anda.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-between sm:justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-blue-200/60 dark:border-blue-800/60">
            <button
              type="button"
              onClick={handleResetAll}
              className="px-3.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-[11px] cursor-pointer transition-colors shadow-2xs"
            >
              Ulangi Dari Awal
            </button>
            <button
              type="button"
              onClick={() => setRestoredBanner(false)}
              className="px-3 py-1.5 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-[11px] font-bold cursor-pointer transition-colors"
            >
              ✕ Tutup
            </button>
          </div>
        </div>
      )}

      {/* Render Steps */}
      {step === "biodata" && (
        <BiodataForm initialData={biodata} onSubmit={handleBiodataSubmit} />
      )}

      {step === "pre-test" && (
        <QuizView
          type="pre-test"
          soalList={soalPre}
          savedAnswers={preTestAnswers}
          submittedScore={preTestScore}
          isSubmitted={preTestSubmitted}
          onSubmit={handlePreTestSubmit}
          onProceed={handleProceedToMateri}
        />
      )}

      {step === "materi" && (
        <MateriViewer
          modules={materiModules}
          currentModulIndex={currentModulIndex}
          currentSlideIndex={currentSlideIndex}
          maxSlideReached={maxSlideReached}
          modul1Completed={modul1Completed}
          modul2Completed={modul2Completed}
          modul3Completed={modul3Completed}
          onUpdateSlide={handleUpdateSlide}
          onCompleteModul={handleCompleteModul}
          onProceedToPostTest={handleProceedToPostTest}
        />
      )}

      {step === "post-test" && (
        <QuizView
          type="post-test"
          soalList={soalPost}
          savedAnswers={postTestAnswers}
          submittedScore={postTestScore}
          isSubmitted={postTestSubmitted}
          attemptsCount={postTestAttempts}
          onSubmit={handlePostTestSubmit}
          onRetry={handleRetryPostTest}
          onProceed={handleProceedToEvaluasi}
          onReviewMateri={() => setStep("materi")}
        />
      )}

      {step === "evaluasi" && (
        <EvaluasiForm initialData={evaluasiData} onSubmit={handleEvaluasiSubmit} />
      )}

      {step === "sertifikat" && (
        <SertifikatView
          biodata={biodata.nama ? biodata : CONTOH_BIODATA_DEMO}
          postTestScore={postTestScore ?? 80}
          nomorSertifikat={nomorSertifikat}
          tanggalLulus={tanggalLulus}
          onResetAll={handleResetAll}
        />
      )}

      {/* Confirmation Modal */}
      <ConfirmDialogModal config={confirmConfig} />
    </div>
  );
}

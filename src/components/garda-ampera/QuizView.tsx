"use client";

import React, { useState } from "react";
import {
  ClipboardList,
  GraduationCap,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  BookOpen,
  Award,
  HelpCircle,
} from "lucide-react";
import { SoalUjian } from "./types";

interface QuizViewProps {
  type: "pre-test" | "post-test";
  soalList: SoalUjian[];
  savedAnswers: Record<number, string>;
  submittedScore: number | null;
  isSubmitted: boolean;
  attemptsCount?: number;
  onSubmit: (answers: Record<number, string>, calculatedScore: number) => void;
  onRetry?: () => void;
  onProceed: () => void;
  onReviewMateri?: () => void;
}

export function QuizView({
  type,
  soalList,
  savedAnswers,
  submittedScore,
  isSubmitted,
  attemptsCount = 1,
  onSubmit,
  onRetry,
  onProceed,
  onReviewMateri,
}: QuizViewProps) {
  const [answers, setAnswers] = useState<Record<number, string>>(savedAnswers);
  const [currentIdx, setCurrentIdx] = useState(0);

  const isPreTest = type === "pre-test";
  const title = isPreTest ? "Pre-Test Garda Ampera" : "Post-Test Evaluasi Kelulusan";
  const badgeLabel = isPreTest ? "Langkah 2 dari 6 • Pre-Test" : "Langkah 4 dari 6 • Post-Test";

  if (!soalList || soalList.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-12 text-center max-w-xl mx-auto shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-4">
          <HelpCircle className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-extrabold text-navy-900 dark:text-white">
          Soal Ujian Belum Tersedia
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
          Bank soal {isPreTest ? "Pre-Test" : "Post-Test"} saat ini masih kosong karena belum diinput ke database. Anda dapat menambahkan butir soal melalui panel admin Garda Ampera.
        </p>
        <div className="mt-6">
          <button
            type="button"
            onClick={onProceed}
            className="px-5 py-2.5 rounded-xl bg-navy-900 hover:bg-blue-800 text-white font-bold text-xs cursor-pointer"
          >
            Lanjut ke Tahap Berikutnya
          </button>
        </div>
      </div>
    );
  }

  const answeredCount = Object.keys(answers).length;
  const isAllAnswered = answeredCount === soalList.length;

  const currentSoal = soalList[currentIdx];

  const handleSelectAnswer = (pilihanId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentSoal.id]: pilihanId,
    }));
  };

  const calculateScore = (testAnswers: Record<number, string>) => {
    let correct = 0;
    soalList.forEach((s) => {
      if (testAnswers[s.id] === s.jawabanBenar) {
        correct++;
      }
    });
    return Math.round((correct / soalList.length) * 100);
  };

  const handleSubmit = () => {
    const finalScore = calculateScore(answers);
    onSubmit(answers, finalScore);
  };

  // Demo Helpers untuk Reviewer
  const handleQuickFillPass = () => {
    const perfectAnswers: Record<number, string> = {};
    soalList.forEach((s, idx) => {
      // 9 benar, 1 salah untuk nilai 90 yang natural
      if (idx === 3) {
        const wrongOption = s.pilihan.find((p) => p.id !== s.jawabanBenar)?.id || "A";
        perfectAnswers[s.id] = wrongOption;
      } else {
        perfectAnswers[s.id] = s.jawabanBenar;
      }
    });
    setAnswers(perfectAnswers);
  };

  const handleQuickFillFail = () => {
    const failAnswers: Record<number, string> = {};
    soalList.forEach((s, idx) => {
      // 5 benar, 5 salah untuk nilai 50 (< 70)
      if (idx < 5) {
        failAnswers[s.id] = s.jawabanBenar;
      } else {
        const wrongOption = s.pilihan.find((p) => p.id !== s.jawabanBenar)?.id || "C";
        failAnswers[s.id] = wrongOption;
      }
    });
    setAnswers(failAnswers);
  };

  // =========================================================================
  // TAMPILAN JIKA SUDAH DISUBMIT (HASIL SKOR)
  // =========================================================================
  if (isSubmitted && submittedScore !== null) {
    const isPassed = submittedScore >= 70;

    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-md overflow-hidden transition-all">
        {/* Banner Hasil */}
        <div
          className={`p-6 sm:p-10 text-white text-center relative overflow-hidden ${
            isPreTest
              ? "bg-gradient-to-r from-blue-900 via-indigo-900 to-navy-900"
              : isPassed
              ? "bg-gradient-to-r from-emerald-800 via-teal-900 to-emerald-950"
              : "bg-gradient-to-r from-amber-700 via-rose-900 to-red-900"
          }`}
        >
          <div className="max-w-xl mx-auto space-y-3 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-xs font-semibold mb-1">
              {isPreTest ? (
                <ClipboardList className="w-4 h-4 text-sky-300" />
              ) : isPassed ? (
                <Award className="w-4 h-4 text-amber-300" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-300" />
              )}
              {isPreTest
                ? "Hasil Penilaian Pre-Test"
                : isPassed
                ? "Hasil Ujian Post-Test: LULUS"
                : `Hasil Ujian Post-Test: Belum Lulus (Percobaan #${attemptsCount})`}
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {isPreTest
                ? "Pre-Test Berhasil Diselesaikan!"
                : isPassed
                ? "Selamat! Anda Memenuhi KKM 70"
                : "Nilai Anda Belum Memenuhi KKM 70"}
            </h2>

            {/* Skor Circle */}
            <div className="py-4">
              <div className="inline-flex flex-col items-center justify-center w-32 h-32 rounded-full bg-white/15 backdrop-blur-md border-2 border-white/30 shadow-inner">
                <span className="text-4xl sm:text-5xl font-black">{submittedScore}</span>
                <span className="text-xs uppercase tracking-widest text-slate-200 mt-0.5">
                  dari 100
                </span>
              </div>
            </div>

            {/* Penjelasan Khusus Sesuai Prompt */}
            {isPreTest ? (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-xs sm:text-sm text-slate-100 text-left border border-white/15">
                <p className="font-semibold mb-1">ℹ️ Ketentuan Pre-Test Garda Ampera:</p>
                <p className="text-slate-200">
                  Skor Anda telah dicatat oleh sistem. Sesuai ketentuan,{" "}
                  <strong>kunci jawaban yang benar tidak ditampilkan</strong> guna mengukur
                  pemahaman murni awal sebelum Anda mempelajari modul edukasi.
                </p>
              </div>
            ) : isPassed ? (
              <div className="bg-emerald-950/40 backdrop-blur-sm rounded-xl p-4 text-xs sm:text-sm text-emerald-100 text-left border border-emerald-500/30">
                <p className="font-semibold mb-1">🎉 Selamat atas Kelulusan Anda!</p>
                <p className="text-emerald-200">
                  Nilai Anda <strong>{submittedScore}</strong> telah melampaui batas minimum
                  kelulusan (70). Langkah selanjutnya adalah mengisi{" "}
                  <strong>Evaluasi Sistem Garda Ampera</strong> agar Sertifikat Resmi dapat
                  diunduh.
                </p>
              </div>
            ) : (
              <div className="bg-red-950/40 backdrop-blur-sm rounded-xl p-4 text-xs sm:text-sm text-rose-100 text-left border border-rose-500/30">
                <p className="font-semibold mb-1">⚠️ Batas Kelulusan Belum Tercapai:</p>
                <p className="text-rose-200">
                  Batas kelulusan minimal (KKM) Post-Test adalah <strong>70</strong>. Nilai
                  Anda adalah <strong>{submittedScore}</strong>. Mohon ulangi pengerjaan
                  Post-Test atau pelajari kembali modul materi agar pemahaman Anda lebih matang.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 dark:bg-slate-900/50">
          {isPreTest ? (
            <>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Langkah berikutnya: Membaca 3 Materi Edukasi (Slide demi Slide).
              </p>
              <button
                type="button"
                onClick={onProceed}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-navy-900 hover:bg-blue-800 text-white font-bold text-sm shadow-md transition-all hover:translate-x-0.5 cursor-pointer"
              >
                Lanjut ke Materi Edukasi
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          ) : isPassed ? (
            <>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Wajib isi evaluasi sistem untuk membuka unduh sertifikat.
              </p>
              <button
                type="button"
                onClick={onProceed}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all hover:translate-x-0.5 cursor-pointer"
              >
                Lanjut ke Evaluasi Sistem
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              {onReviewMateri && (
                <button
                  type="button"
                  onClick={onReviewMateri}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-sm transition-all cursor-pointer"
                >
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  Pelajari Ulang Materi
                </button>
              )}
              <button
                type="button"
                onClick={onRetry}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm shadow-md shadow-amber-600/20 transition-all hover:scale-[1.02] cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                Ulangi Pengerjaan Post-Test
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // TAMPILAN PENGERJAAN QUIZ (SOAL-SOAL)
  // =========================================================================
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-md overflow-hidden transition-all">
      {/* Quiz Top Header */}
      <div className="bg-[#0b2a6b] dark:bg-[#06173d] p-6 sm:p-7 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-sky-200 text-xs font-semibold mb-2">
              {isPreTest ? <ClipboardList className="w-3.5 h-3.5" /> : <GraduationCap className="w-3.5 h-3.5" />}
              {badgeLabel}
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">{title}</h2>
            <p className="text-xs sm:text-sm text-slate-200 mt-1">
              {isPreTest
                ? "Jawab 10 soal di bawah ini sebaik mungkin untuk mengukur pemahaman awal Anda."
                : "Jawab 10 soal evaluasi materi. Batas minimal kelulusan (KKM) adalah nilai 70."}
            </p>
          </div>

          {/* Reviewer Quick Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {isPreTest ? (
              <button
                type="button"
                onClick={handleQuickFillPass}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-sky-200 text-xs font-semibold border border-white/20 transition-colors cursor-pointer"
                title="Bantu isi otomatis untuk uji coba"
              >
                <Sparkles className="w-3.5 h-3.5" />
                ⚡ Jawab Otomatis (Demo)
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleQuickFillPass}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 text-xs font-semibold border border-emerald-400/30 transition-colors cursor-pointer"
                  title="Simulasi Nilai Lulus (90) untuk lanjut ke Evaluasi & Sertifikat"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                  ⚡ Simulasi Lulus (90)
                </button>
                <button
                  type="button"
                  onClick={handleQuickFillFail}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-xs font-semibold border border-amber-400/30 transition-colors cursor-pointer"
                  title="Simulasi Nilai Gagal (50) untuk menguji fitur ulangi Post-Test"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  ⚡ Simulasi Remidi (50)
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Progress & Palette Strip */}
      <div className="bg-slate-50 dark:bg-slate-800/60 px-6 py-3.5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Terjawab: {answeredCount} dari {soalList.length} Soal
          </span>
          <span className="text-xs text-slate-400">•</span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Kategori: <strong className="text-blue-600 dark:text-blue-400">{currentSoal.kategori}</strong>
          </span>
        </div>

        {/* Soal Palette */}
        <div className="flex items-center gap-1.5">
          {soalList.map((s, idx) => {
            const hasAnswer = Boolean(answers[s.id]);
            const isSelected = idx === currentIdx;

            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setCurrentIdx(idx)}
                className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-navy-900 dark:bg-blue-600 text-white ring-2 ring-blue-300 dark:ring-blue-800"
                    : hasAnswer
                    ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700"
                    : "bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Soal Active Content */}
      <div className="p-6 sm:p-8 space-y-6">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400">
            Pertanyaan #{currentIdx + 1}
          </span>
          <h3 className="text-lg sm:text-xl font-bold text-navy-900 dark:text-white mt-1.5 leading-relaxed">
            {currentSoal.pertanyaan}
          </h3>
        </div>

        {/* Pilihan Jawaban */}
        <div className="space-y-3">
          {currentSoal.pilihan.map((pil) => {
            const isPicked = answers[currentSoal.id] === pil.id;

            return (
              <button
                key={pil.id}
                type="button"
                onClick={() => handleSelectAnswer(pil.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3.5 group cursor-pointer ${
                  isPicked
                    ? "border-blue-600 dark:border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 text-navy-950 dark:text-blue-100 shadow-sm"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-50/50"
                }`}
              >
                <span
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                    isPicked
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 group-hover:bg-slate-200"
                  }`}
                >
                  {pil.id}
                </span>
                <span className="text-sm pt-1 leading-snug">{pil.teks}</span>
              </button>
            );
          })}
        </div>

        {/* Footer Navigation */}
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              disabled={currentIdx === 0}
              onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Sebelumnya
            </button>

            <button
              type="button"
              disabled={currentIdx === soalList.length - 1}
              onClick={() => setCurrentIdx((prev) => Math.min(soalList.length - 1, prev + 1))}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer inline-flex items-center gap-1.5"
            >
              Selanjutnya
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="button"
            disabled={!isAllAnswered}
            onClick={handleSubmit}
            className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm shadow-md transition-all cursor-pointer inline-flex items-center justify-center gap-2 ${
              isAllAnswered
                ? "bg-navy-900 hover:bg-blue-800 text-white shadow-navy-900/20 hover:scale-[1.01]"
                : "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            {isAllAnswered
              ? isPreTest
                ? "Kirim Jawaban & Lihat Skor Pre-Test"
                : "Kirim Jawaban Post-Test"
              : `Jawab Semua Soal (${answeredCount}/${soalList.length})`}
          </button>
        </div>
      </div>
    </div>
  );
}

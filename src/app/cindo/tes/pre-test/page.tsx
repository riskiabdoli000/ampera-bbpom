"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FileQuestion,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Clock,
  Sparkles,
} from "lucide-react";
import {
  getSesiCindo,
  submitPreTestJawaban,
  initSesiWithPeserta,
} from "@/data/cindo/cindoStorage";
import { SesiCindo, SoalKuis } from "@/data/cindo/cindoTypes";
import { DAFTAR_MATERI_CINDO } from "@/data/cindo/materiData";

export default function CindoPreTestPage() {
  const router = useRouter();
  const [sesi, setSesi] = useState<SesiCindo | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [jawaban, setJawaban] = useState<Record<number, "A" | "B" | "C" | "D">>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let s = getSesiCindo();
    if (!s.peserta) {
      router.push("/cindo/profile");
      return;
    }
    // Jika pre-test sudah selesai, jangan izinkan tes ulang, kembali ke materi
    if (s.preTest?.completed) {
      router.push("/cindo/materi");
      return;
    }
    if (!s.soalTerpilih || s.soalTerpilih.length !== 10) {
      s = initSesiWithPeserta(s.peserta);
    }
    setSesi(s);
    if (s.preTest?.jawaban) {
      setJawaban(s.preTest.jawaban);
    }
  }, [router]);

  if (!sesi || !sesi.soalTerpilih || sesi.soalTerpilih.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto" />
          <p className="mt-3 text-xs text-slate-500">Menyiapkan 10 soal acak Anda...</p>
        </div>
      </div>
    );
  }

  const soalList = sesi.soalTerpilih;
  const currentSoal: SoalKuis = soalList[currentIndex];
  const totalSoal = soalList.length;
  const answeredCount = Object.keys(jawaban).length;
  const allAnswered = answeredCount === totalSoal;
  const activeBab = DAFTAR_MATERI_CINDO.find(
    (b) => b.id === (sesi.materiProgress?.activeBabId || 1)
  );

  const handleSelectOption = (key: "A" | "B" | "C" | "D") => {
    setJawaban((prev) => ({
      ...prev,
      [currentSoal.id]: key,
    }));
  };

  const handleFinishPreTest = () => {
    if (!allAnswered) {
      if (
        !confirm(
          `Anda baru menjawab ${answeredCount} dari ${totalSoal} soal. Yakin ingin mengumpulkan sekarang? Soal yang belum dijawab bernilai 0.`
        )
      ) {
        return;
      }
    }
    setIsSubmitting(true);
    submitPreTestJawaban(jawaban);
    router.push("/cindo/tes/hasil-pre");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header & Progress Stepper */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-block rounded-md bg-blue-100 px-2 py-0.5 text-[11px] font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                Evaluasi Awal (Pre-Test)
              </span>
              {activeBab && (
                <span className="inline-block rounded-md bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  Topik: {activeBab.nomor} - {activeBab.judul}
                </span>
              )}
            </div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1">
              Asesmen Pemahaman Awal (10 Soal)
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Peserta: <strong className="text-slate-800 dark:text-slate-200">{sesi.peserta?.nama}</strong> | Tiap soal benar = 10 Poin (Maks. 100)
            </p>
          </div>

          <div className="text-right">
            <div className="text-xs font-bold text-slate-500">
              Progres Terjawab
            </div>
            <div className="text-lg font-black text-blue-600 dark:text-blue-400">
              {answeredCount} / {totalSoal}
            </div>
          </div>
        </div>

        {/* Stepper Grid Numbers 1-10 */}
        <div className="mt-4 flex flex-wrap gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          {soalList.map((s, idx) => {
            const isAnswered = jawaban[s.id] !== undefined;
            const isCurrent = idx === currentIndex;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl text-xs font-bold transition-all ${
                  isCurrent
                    ? "bg-brand-orange text-white shadow-md ring-2 ring-orange-500/30 scale-105"
                    : isAnswered
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Question Card */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm space-y-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-orange dark:text-orange-400">
            Soal Nomor {currentIndex + 1} dari {totalSoal}
          </span>
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {currentSoal.kategori}
          </span>
        </div>

        {/* Question Text */}
        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
          {currentSoal.pertanyaan}
        </h2>

        {/* 4 Multiple Choice Options (A, B, C, D) */}
        <div className="space-y-3 pt-2">
          {currentSoal.pilihan.map((pil) => {
            const isSelected = jawaban[currentSoal.id] === pil.key;
            return (
              <button
                key={pil.key}
                type="button"
                onClick={() => handleSelectOption(pil.key)}
                className={`group flex w-full items-start gap-3.5 rounded-2xl border p-4 text-left transition-all duration-200 ${
                  isSelected
                    ? "border-brand-orange bg-orange-50/70 text-orange-950 ring-2 ring-orange-500/30 shadow dark:bg-orange-950/60 dark:border-orange-500 dark:text-white"
                    : "border-slate-200/90 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800/60"
                }`}
              >
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-colors ${
                    isSelected
                      ? "bg-brand-orange text-white"
                      : "bg-slate-100 text-slate-600 group-hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  {pil.key}
                </div>
                <div className="text-xs sm:text-sm font-medium leading-relaxed pt-0.5">
                  {pil.teks}
                </div>
              </button>
            );
          })}
        </div>

        {/* Navigation Buttons between questions */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-5 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Sebelumnya</span>
          </button>

          {currentIndex < totalSoal - 1 ? (
            <button
              type="button"
              onClick={() => setCurrentIndex((prev) => Math.min(totalSoal - 1, prev + 1))}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-800 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-slate-900 active:scale-95 dark:bg-slate-700 dark:hover:bg-slate-600"
            >
              <span>Selanjutnya</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinishPreTest}
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow hover:bg-emerald-700 active:scale-95"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Selesai & Kumpulkan Pre-Test</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

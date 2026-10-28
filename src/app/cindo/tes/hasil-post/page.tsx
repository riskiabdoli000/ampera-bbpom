"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Award,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  BookOpen,
  FileText,
  Sparkles,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import {
  getSesiCindo,
  prepareRemedialAttempt,
} from "@/data/cindo/cindoStorage";
import { SesiCindo } from "@/data/cindo/cindoTypes";

export default function CindoHasilPostTestPage() {
  const router = useRouter();
  const [sesi, setSesi] = useState<SesiCindo | null>(null);

  useEffect(() => {
    const s = getSesiCindo();
    if (!s.peserta || !s.postTest?.completed) {
      router.push("/cindo/profile");
      return;
    }
    setSesi(s);
  }, [router]);

  if (!sesi || !sesi.postTest) {
    return null;
  }

  const { skor, jumlahBenar, isPassed, canRemedial, attemptCount } = sesi.postTest;
  const preSkor = sesi.preTest?.skor || 0;
  const gain = skor - preSkor;

  const handleStartRemedial = () => {
    if (confirm("Apakah Anda siap memulai 1x kesempatan Remedial Post-Test sekarang?")) {
      prepareRemedialAttempt();
      router.push("/cindo/tes/post-test");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Result Status Banner */}
      <div
        className={`overflow-hidden rounded-3xl border p-6 sm:p-8 text-center space-y-6 shadow-xl ${
          isPassed
            ? "border-emerald-300 bg-gradient-to-b from-emerald-50/90 via-white to-white dark:border-emerald-800 dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-900"
            : "border-rose-300 bg-gradient-to-b from-rose-50/90 via-white to-white dark:border-rose-800 dark:from-rose-950/40 dark:via-slate-900 dark:to-slate-900"
        }`}
      >
        <div
          className={`mx-auto flex h-16 w-16 items-center justify-center rounded-3xl shadow-lg ${
            isPassed
              ? "bg-emerald-500 text-white"
              : "bg-rose-500 text-white"
          }`}
        >
          {isPassed ? <Award className="h-9 w-9" /> : <AlertCircle className="h-9 w-9" />}
        </div>

        <div>
          <span
            className={`inline-block rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-widest ${
              isPassed
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"
                : "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200"
            }`}
          >
            {isPassed ? "Dinyatakan LULUS (Skor >= 80)" : "Belum Lulus (Passing Grade: 80)"}
          </span>
          <h1 className="mt-2 text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {isPassed ? "Selamat! Anda Berhasil Lulus" : "Hasil Evaluasi Post-Test Anda"}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Peserta: <strong className="text-slate-800 dark:text-slate-200">{sesi.peserta?.nama}</strong> | Percobaan ke-{attemptCount}
          </p>
        </div>

        {/* Big Score Display */}
        <div className="rounded-3xl border border-slate-200/90 bg-white py-8 shadow-inner dark:border-slate-800 dark:bg-slate-900">
          <div
            className={`text-5xl sm:text-6xl font-black tracking-tight ${
              isPassed
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-rose-600 dark:text-rose-400"
            }`}
          >
            {skor}
            <span className="text-xl sm:text-2xl font-bold text-slate-400">/100</span>
          </div>
          <div className="mt-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            {jumlahBenar} dari 10 Pertanyaan Dijawab dengan Benar
          </div>
        </div>

        {/* Delta Comparison (Pre-Test vs Post-Test Gain) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-800/60">
            <div className="text-xs font-semibold text-slate-500">Skor Pre-Test</div>
            <div className="text-xl font-black text-slate-800 dark:text-slate-100 mt-0.5">
              {preSkor}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-800/60">
            <div className="text-xs font-semibold text-slate-500">Skor Post-Test</div>
            <div className="text-xl font-black text-slate-800 dark:text-slate-100 mt-0.5">
              {skor}
            </div>
          </div>

          <div className="rounded-2xl border border-blue-200 bg-blue-50/80 p-3.5 dark:border-blue-900 dark:bg-blue-950/60">
            <div className="text-xs font-semibold text-blue-700 dark:text-blue-300 flex items-center justify-center gap-1">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Peningkatan</span>
            </div>
            <div className="text-xl font-black text-blue-700 dark:text-blue-300 mt-0.5">
              {gain >= 0 ? `+${gain}` : `${gain}`} Poin
            </div>
          </div>
        </div>

        {/* Action Buttons based on Passed vs Remedial */}
        <div className="pt-4 space-y-3">
          {isPassed ? (
            <Link
              href="/cindo/sertifikat"
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-4 text-sm font-bold text-white shadow-xl transition-all hover:bg-emerald-700 active:scale-95"
            >
              <Award className="h-5 w-5" />
              <span>Lihat & Unduh E-Sertifikat Kelulusan Resmi BBPOM</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : canRemedial ? (
            <div className="space-y-3">
              <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-900 text-left dark:bg-amber-950/50 dark:text-amber-200 dark:border-amber-800">
                <strong>Ketentuan Remedial:</strong> Nilai minimal kelulusan adalah 80. Anda berhak mendapatkan <strong>1 kali kesempatan remedial</strong> untuk memperbaiki nilai Post-Test Anda.
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleStartRemedial}
                  className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-amber-600 px-6 py-3.5 text-xs sm:text-sm font-bold text-white shadow hover:bg-amber-700 active:scale-95"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Ambil Kesempatan Remedial Post-Test (1x)</span>
                </button>

                <Link
                  href="/cindo/materi"
                  className="flex-1 flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-6 py-3.5 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <BookOpen className="h-4 w-4" />
                  <span>Pelajari Ulang Materi Dulu</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="rounded-2xl border border-rose-300 bg-rose-50 p-4 text-xs text-rose-900 text-left dark:bg-rose-950/50 dark:text-rose-200 dark:border-rose-800">
                Kesempatan remedial 1x telah Anda gunakan. Silakan baca dan pelajari kembali seluruh materi modul untuk memperdalam pemahaman keamanan obat dan makanan.
              </div>

              <Link
                href="/cindo/materi"
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-800 px-6 py-3.5 text-xs sm:text-sm font-bold text-white shadow hover:bg-slate-900 dark:bg-slate-700"
              >
                <BookOpen className="h-4 w-4" />
                <span>Pelajari Kembali Materi Pembelajaran</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Review Soal & Kunci Jawaban Lengkap (Hanya setelah Post-Test) */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Pembahasan & Review Evaluasi 10 Soal
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Kunci jawaban dan penjelasan materi untuk penguatan pengetahuan Anda.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {sesi.soalTerpilih.map((soal, idx) => {
            const userPilihan = sesi.postTest.jawaban[soal.id];
            const isCorrect = userPilihan === soal.jawabanBenar;
            return (
              <div
                key={soal.id}
                className={`rounded-2xl border p-4 text-xs sm:text-sm space-y-2.5 ${
                  isCorrect
                    ? "border-emerald-200 bg-emerald-50/40 dark:border-emerald-900/40 dark:bg-emerald-950/20"
                    : "border-rose-200 bg-rose-50/40 dark:border-rose-900/40 dark:bg-rose-950/20"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="font-bold text-slate-800 dark:text-slate-200">
                    {idx + 1}. {soal.pertanyaan}
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      isCorrect
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"
                        : "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200"
                    }`}
                  >
                    {isCorrect ? "Jawaban Anda Benar (+10)" : "Kurang Tepat (0)"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="rounded-xl bg-white/80 p-2 border border-slate-200/80 dark:bg-slate-800/80 dark:border-slate-700">
                    <span className="text-slate-400">Jawaban Anda: </span>
                    <strong
                      className={
                        isCorrect
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-rose-600 dark:text-rose-400"
                      }
                    >
                      Pilihan {userPilihan || "-"}
                    </strong>
                  </div>
                  <div className="rounded-xl bg-white/80 p-2 border border-slate-200/80 dark:bg-slate-800/80 dark:border-slate-700">
                    <span className="text-slate-400">Kunci Jawaban: </span>
                    <strong className="text-emerald-600 dark:text-emerald-400">
                      Pilihan {soal.jawabanBenar}
                    </strong>
                  </div>
                </div>

                {soal.penjelasan && (
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 pt-1 italic">
                    💡 <strong>Penjelasan:</strong> {soal.penjelasan}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

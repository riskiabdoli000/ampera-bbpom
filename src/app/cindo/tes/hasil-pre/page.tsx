"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Award,
  CheckCircle2,
  XCircle,
  ArrowRight,
  BookOpen,
  ShieldAlert,
  Info,
  Sparkles,
} from "lucide-react";
import { getSesiCindo } from "@/data/cindo/cindoStorage";
import { SesiCindo } from "@/data/cindo/cindoTypes";

export default function CindoHasilPreTestPage() {
  const router = useRouter();
  const [sesi, setSesi] = useState<SesiCindo | null>(null);

  useEffect(() => {
    const s = getSesiCindo();
    if (!s.peserta || !s.preTest?.completed) {
      router.push("/cindo/tes/identitas");
      return;
    }
    setSesi(s);
  }, [router]);

  if (!sesi || !sesi.preTest) {
    return null;
  }

  const { skor, jumlahBenar } = sesi.preTest;
  const jumlahSalah = 10 - jumlahBenar;

  return (
    <div className="max-w-2xl mx-auto space-y-6 text-center">
      {/* Result Card */}
      <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-10 shadow-lg dark:border-slate-800 dark:bg-slate-900 space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-50 text-blue-600 shadow-inner dark:bg-blue-950/60 dark:text-blue-400">
          <Award className="h-8 w-8" />
        </div>

        <div>
          <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
            Hasil Asesmen Awal
          </span>
          <h1 className="mt-2 text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Skor Pre-Test Anda
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Peserta: <strong className="text-slate-800 dark:text-slate-200">{sesi.peserta?.nama}</strong>
          </p>
        </div>

        {/* Big Score Display */}
        <div className="rounded-3xl border border-blue-200/90 bg-gradient-to-b from-blue-50/80 to-white py-8 shadow-inner dark:border-blue-900/50 dark:from-slate-800/80 dark:to-slate-900">
          <div className="text-5xl sm:text-6xl font-black tracking-tight text-[#1664e8] dark:text-blue-400">
            {skor}
            <span className="text-xl sm:text-2xl font-bold text-slate-400">/100</span>
          </div>
          <div className="mt-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            Nilai Evaluasi Pemahaman Awal
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 text-left dark:border-emerald-900/50 dark:bg-emerald-950/30">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white shadow">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <div className="text-lg font-black text-emerald-800 dark:text-emerald-300">
                {jumlahBenar} Soal
              </div>
              <div className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                Jawaban Benar
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50/70 p-4 text-left dark:border-rose-900/50 dark:bg-rose-950/30">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500 text-white shadow">
              <XCircle className="h-5 w-5" />
            </div>
            <div>
              <div className="text-lg font-black text-rose-800 dark:text-rose-300">
                {jumlahSalah} Soal
              </div>
              <div className="text-[11px] font-medium text-rose-700 dark:text-rose-400">
                Jawaban Kurang Tepat
              </div>
            </div>
          </div>
        </div>

        {/* Blind Scoring Rule 6 Notice */}
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-left text-xs text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/50 dark:text-amber-200">
          <ShieldAlert className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold">Ketentuan Blind Scoring Pre-Test:</div>
            <p className="text-[11px] leading-relaxed">
              Sesuai aturan sistem Cindo, <strong>kunci jawaban yang benar TIDAK ditampilkan</strong> jika ada soal yang salah. Hal ini bertujuan agar Anda mempelajari seluruh materi secara seksama sebelum mengikuti evaluasi akhir (Post-Test).
            </p>
          </div>
        </div>

        {/* CTA to Materi (Rule 7 & 8) */}
        <div className="pt-2">
          <Link
            href="/cindo/materi"
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1664e8] px-6 py-4 text-sm font-bold text-white shadow-xl transition-all hover:bg-blue-700 active:scale-95"
          >
            <BookOpen className="h-5 w-5" />
            <span>Buka Materi Pembelajaran (Wajib Dibaca)</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

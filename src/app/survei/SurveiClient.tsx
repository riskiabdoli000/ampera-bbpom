"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import {
  Star,
  CheckCircle2,
  AlertCircle,
  Search,
  Sparkles,
  ArrowRight,
  Home,
  MessageSquare,
  ShieldCheck,
  Globe,
  Send,
  HeartHandshake,
} from "lucide-react";
import {
  SurveiPengajuanData,
  getSurveiPengajuanAction,
  submitSurveiAction,
} from "@/app/actions/survei";

interface SurveiClientProps {
  initialKode: string;
  initialData: SurveiPengajuanData | null;
  initialError: string | null;
}

const SKALA_KUALITAS = [
  { value: 5, label: "Sangat Baik", emoji: "🟢", color: "hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/30" },
  { value: 4, label: "Baik", emoji: "🔵", color: "hover:border-sky-500 hover:bg-sky-50 dark:hover:bg-sky-950/30" },
  { value: 3, label: "Cukup", emoji: "🟡", color: "hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30" },
  { value: 2, label: "Buruk", emoji: "🟠", color: "hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/30" },
  { value: 1, label: "Sangat Buruk", emoji: "🔴", color: "hover:border-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30" },
];

const SKALA_MANFAAT = [
  { value: 5, label: "Sangat Bermanfaat", emoji: "🟢", color: "hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/30" },
  { value: 4, label: "Bermanfaat", emoji: "🔵", color: "hover:border-sky-500 hover:bg-sky-50 dark:hover:bg-sky-950/30" },
  { value: 3, label: "Cukup Bermanfaat", emoji: "🟡", color: "hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30" },
  { value: 2, label: "Kurang Bermanfaat", emoji: "🟠", color: "hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/30" },
  { value: 1, label: "Tidak Bermanfaat", emoji: "🔴", color: "hover:border-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30" },
];

const BINTANG_LABELS: Record<number, string> = {
  1: "Sangat Tidak Puas",
  2: "Kurang Puas",
  3: "Cukup Puas",
  4: "Puas",
  5: "Sangat Puas",
};

export default function SurveiClient({
  initialKode,
  initialData,
  initialError,
}: SurveiClientProps) {
  const [kodeInput, setKodeInput] = useState(initialKode);
  const [data, setData] = useState<SurveiPengajuanData | null>(initialData);
  const [errorMessage, setErrorMessage] = useState<string | null>(initialError);

  // Form State
  const [ratingBintang, setRatingBintang] = useState<number>(0);
  const [hoverBintang, setHoverBintang] = useState<number>(0);
  const [kualitasPelayanan, setKualitasPelayanan] = useState<number>(0);
  const [manfaatPelayanan, setManfaatPelayanan] = useState<number>(0);
  const [kualitasWebsite, setKualitasWebsite] = useState<number>(0);
  const [manfaatWebsite, setManfaatWebsite] = useState<number>(0);
  const [kritikSaran, setKritikSaran] = useState<string>("");

  const [isSearching, startSearching] = useTransition();
  const [isSubmitting, startSubmitting] = useTransition();
  const [isSuccessSubmitted, setIsSuccessSubmitted] = useState<boolean>(false);
  const [formValidationError, setFormValidationError] = useState<string | null>(null);

  // Handler Pencarian Tiket Manual
  const handleSearchTiket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kodeInput.trim()) {
      setErrorMessage("Silakan masukkan nomor tiket pengajuan Anda.");
      return;
    }

    setErrorMessage(null);
    setFormValidationError(null);

    startSearching(async () => {
      const res = await getSurveiPengajuanAction(kodeInput);
      if (res.success && res.data) {
        setData(res.data);
      } else {
        setData(null);
        setErrorMessage(res.message || "Tiket permohonan tidak ditemukan.");
      }
    });
  };

  // Handler Submit Survei
  const handleSubmitSurvei = (e: React.FormEvent) => {
    e.preventDefault();
    setFormValidationError(null);

    if (!data) return;

    if (ratingBintang === 0) {
      setFormValidationError("Mohon berikan penilaian bintang keseluruhan (1 - 5).");
      return;
    }
    if (kualitasPelayanan === 0) {
      setFormValidationError("Mohon pilih penilaian untuk Pertanyaan 2 (Kualitas Pelayanan Petugas).");
      return;
    }
    if (manfaatPelayanan === 0) {
      setFormValidationError("Mohon pilih penilaian untuk Pertanyaan 3 (Kebermanfaatan Pelayanan Petugas).");
      return;
    }
    if (kualitasWebsite === 0) {
      setFormValidationError("Mohon pilih penilaian untuk Pertanyaan 4 (Kualitas Sistem & Website AMPERA).");
      return;
    }
    if (manfaatWebsite === 0) {
      setFormValidationError("Mohon pilih penilaian untuk Pertanyaan 5 (Kebermanfaatan Website AMPERA).");
      return;
    }

    startSubmitting(async () => {
      const res = await submitSurveiAction({
        kodePengajuan: data.kodePengajuan,
        ratingBintang,
        kualitasPelayanan,
        manfaatPelayanan,
        kualitasWebsite,
        manfaatWebsite,
        kritikSaran,
      });

      if (res.success) {
        setIsSuccessSubmitted(true);
      } else {
        setFormValidationError(res.message);
      }
    });
  };

  // 1. Tampilan Sukses Setelah Submit
  if (isSuccessSubmitted) {
    return (
      <div className="rounded-3xl border border-emerald-200 bg-white p-8 sm:p-12 text-center shadow-xl dark:border-emerald-900/60 dark:bg-slate-900 animate-fade-up">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
          <HeartHandshake className="h-10 w-10 animate-bounce" />
        </div>

        <span className="mt-6 inline-block rounded-full bg-emerald-100 px-4 py-1 text-xs font-extrabold text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200 uppercase tracking-wider">
          Survei Berhasil Dikirim
        </span>

        <h2 className="mt-3 text-2xl sm:text-3xl font-black text-navy-900 dark:text-white font-brand">
          Terima Kasih Banyak!
        </h2>

        <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-xl mx-auto leading-relaxed">
          Penilaian dan masukan Anda untuk tiket permohonan{" "}
          <span className="font-mono font-bold text-[#ff7a1a]">{data?.kodePengajuan}</span> telah resmi kami terima. Kontribusi Anda sangat berarti bagi komitmen Balai Besar POM di Palembang dalam menghadirkan pelayanan publik yang semakin transparan, responsif, dan berkualitas prima.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3.5">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#ff7a1a] to-[#f26a0f] px-6 py-3 text-sm font-bold text-white shadow-cta hover:brightness-110 transition cursor-pointer"
          >
            <Home className="h-4 w-4" /> Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  // 2. Tampilan Jika Tiket Ini Sudah Pernah Diisi Survei Sebelumnya
  if (data && data.sudahSurvei) {
    return (
      <div className="rounded-3xl border border-sky-200 bg-white p-8 sm:p-12 text-center shadow-xl dark:border-sky-900/60 dark:bg-slate-900 animate-fade-up">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400">
          <CheckCircle2 className="h-8 w-8" />
        </div>

        <span className="mt-5 inline-block rounded-full bg-sky-100 px-3.5 py-1 text-xs font-bold text-sky-800 dark:bg-sky-900/60 dark:text-sky-200">
          Ulasan Telah Tercatat
        </span>

        <h2 className="mt-3 text-2xl sm:text-3xl font-black text-navy-900 dark:text-white font-brand">
          Survei Sudah Pernah Diisi
        </h2>

        <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-lg mx-auto leading-relaxed">
          Terima kasih atas partisipasi Anda, Bapak/Ibu <strong className="text-navy-900 dark:text-white">{data.namaPemohon}</strong>. Ulasan kepuasan masyarakat untuk nomor tiket <strong className="font-mono text-[#ff7a1a]">{data.kodePengajuan}</strong> telah tersimpan dalam sistem kami.
        </p>

        {data.dataSurvei && (
          <div className="mt-6 inline-flex items-center gap-1.5 rounded-2xl border border-slate-200/80 bg-slate-50 px-4 py-2 dark:border-slate-800 dark:bg-slate-800/60">
            <span className="text-xs text-slate-500 dark:text-slate-400">Penilaian Anda:</span>
            <div className="flex text-amber-400">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <= (data.dataSurvei?.ratingBintang || 0)
                      ? "fill-amber-400 text-amber-400"
                      : "text-slate-300 dark:text-slate-600"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">
              ({data.dataSurvei.ratingBintang}/5)
            </span>
          </div>
        )}

        <div className="mt-8 flex justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-2xl bg-navy-900 dark:bg-slate-800 px-6 py-3 text-sm font-bold text-white hover:bg-navy-800 transition cursor-pointer"
          >
            <Home className="h-4 w-4" /> Kembali ke Halaman Utama
          </Link>
        </div>
      </div>
    );
  }

  // 3. Tampilan Pencarian Tiket Manual Jika Belum Ada Data Tiket Valid
  if (!data) {
    return (
      <div className="rounded-3xl border border-slate-200/80 bg-white p-7 sm:p-10 shadow-xl dark:border-slate-800 dark:bg-slate-900 animate-fade-up">
        <div className="text-center max-w-xl mx-auto">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#ff7a1a]/10 text-[#ff7a1a]">
            <Sparkles className="h-8 w-8" />
          </div>

          <span className="mt-4 inline-block text-xs font-extrabold uppercase tracking-widest text-[#ff7a1a]">
            SURVEI KEPUASAN MASYARAKAT
          </span>
          <h1 className="mt-2 text-2xl sm:text-3xl font-black text-navy-900 dark:text-white font-brand">
            Evaluasi Layanan BBPOM Palembang
          </h1>
          <p className="mt-2.5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Silakan masukkan nomor tiket pengajuan resmi Anda (contoh:{" "}
            <span className="font-mono font-semibold text-slate-700 dark:text-slate-200">
              AMP-UJI-202610-0001
            </span>
            ) untuk mengisi survei kepuasan pelayanan.
          </p>

          <form onSubmit={handleSearchTiket} className="mt-6 flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={kodeInput}
                onChange={(e) => setKodeInput(e.target.value.toUpperCase())}
                placeholder="Masukkan Nomor Tiket Pengajuan..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 pl-11 pr-4 py-3 text-sm font-mono font-semibold uppercase tracking-wider text-navy-900 focus:border-[#ff7a1a] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800/80 dark:text-white transition"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#ff7a1a] to-[#f26a0f] px-6 py-3 text-sm font-bold text-white shadow-cta hover:brightness-110 transition disabled:opacity-50 cursor-pointer shrink-0"
            >
              {isSearching ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Mencari...
                </>
              ) : (
                <>
                  Buka Survei <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {errorMessage && (
            <div className="mt-4 flex items-center gap-2 rounded-2xl bg-rose-50 p-3.5 text-xs font-semibold text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-900/60 dark:text-rose-300 text-left">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 4. Formulir Utama Survei Kepuasan (Data Tiket Valid Ditemukan)
  const activeBintang = hoverBintang || ratingBintang;

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header Info Banner Tiket Pengajuan */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#ff7a1a]">
              SURVEI KEPUASAN MASYARAKAT
            </span>
            <h1 className="mt-1 text-xl sm:text-2xl font-black text-navy-900 dark:text-white font-brand">
              Penilaian Pelayanan & Website AMPERA
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Yth. <strong className="text-navy-900 dark:text-white">{data.namaPemohon}</strong>, terima kasih telah mempercayakan pengajuan Anda kepada BBPOM di Palembang.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 px-4 py-2.5 border border-slate-200/80 dark:bg-slate-800/60 dark:border-slate-700">
            <span className="text-[11px] text-slate-400 block font-medium">Nomor Tiket:</span>
            <span className="font-mono font-black text-sm text-[#ff7a1a] dark:text-orange-400">
              {data.kodePengajuan}
            </span>
            <span className="block text-[11px] text-slate-600 dark:text-slate-300 font-semibold truncate max-w-[200px]">
              {data.namaLayanan}
            </span>
          </div>
        </div>
      </div>

      {/* Form Survei */}
      <form onSubmit={handleSubmitSurvei} className="space-y-6">
        {/* ========================================================= */}
        {/* PERTANYAAN 1: RATING BINTANG KESELURUHAN (1 - 5 ⭐) */}
        {/* ========================================================= */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
              <Star className="h-4 w-4 fill-amber-500" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Pertanyaan 1 dari 5
              </span>
              <h2 className="text-sm sm:text-base font-bold text-navy-900 dark:text-white">
                Secara keseluruhan, bagaimana tingkat kepuasan Anda terhadap layanan yang diberikan oleh BBPOM di Palembang? <span className="text-red-500">*</span>
              </h2>
            </div>
          </div>

          <div className="py-4 text-center">
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRatingBintang(star)}
                  onMouseEnter={() => setHoverBintang(star)}
                  onMouseLeave={() => setHoverBintang(0)}
                  className="p-1 sm:p-2 transition-transform hover:scale-115 active:scale-95 cursor-pointer focus:outline-none"
                  title={`${star} Bintang - ${BINTANG_LABELS[star]}`}
                >
                  <Star
                    className={`h-9 w-9 sm:h-12 sm:w-12 transition-colors duration-200 ${
                      star <= activeBintang
                        ? "fill-amber-400 text-amber-400 drop-shadow-xs"
                        : "text-slate-200 dark:text-slate-700"
                    }`}
                  />
                </button>
              ))}
            </div>

            <div className="mt-3.5 h-6">
              {activeBintang > 0 ? (
                <span className="inline-block rounded-full bg-amber-50 px-4 py-1 text-xs font-bold text-amber-700 border border-amber-200/80 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-300">
                  {BINTANG_LABELS[activeBintang]} ({activeBintang} dari 5 Bintang)
                </span>
              ) : (
                <span className="text-xs text-slate-400 italic">
                  Klik pada bintang untuk memberikan penilaian
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* BAGIAN A: PELAYANAN PETUGAS BBPOM PALEMBANG (2 PERTANYAAN) */}
        {/* ========================================================= */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4 dark:border-slate-800">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Bagian A: Pelayanan Petugas
              </span>
              <h2 className="text-sm sm:text-base font-extrabold text-navy-900 dark:text-white">
                Penilaian Kualitas & Kebermanfaatan Petugas Pelayanan
              </h2>
            </div>
          </div>

          {/* Pertanyaan 2: Kualitas Pelayanan */}
          <div className="space-y-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Pertanyaan 2 dari 5
            </span>
            <label className="text-sm font-bold text-navy-900 dark:text-white block leading-snug">
              Bagaimana kualitas pelayanan yang diberikan oleh petugas kepada Anda? <span className="text-red-500">*</span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-2.5">
              {SKALA_KUALITAS.map((skala) => {
                const isSelected = kualitasPelayanan === skala.value;
                return (
                  <button
                    key={skala.value}
                    type="button"
                    onClick={() => setKualitasPelayanan(skala.value)}
                    className={`flex flex-col items-center justify-center rounded-2xl border p-3 text-center transition cursor-pointer ${
                      isSelected
                        ? "border-[#ff7a1a] bg-orange-50/80 text-[#ff7a1a] font-bold dark:border-orange-500 dark:bg-orange-950/40 dark:text-orange-300 ring-2 ring-[#ff7a1a]/30"
                        : `border-slate-200/80 bg-slate-50/60 text-slate-700 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-300 ${skala.color}`
                    }`}
                  >
                    <span className="text-base sm:text-lg mb-1">{skala.emoji}</span>
                    <span className="text-xs">{skala.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pertanyaan 3: Kebermanfaatan Pelayanan */}
          <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Pertanyaan 3 dari 5
            </span>
            <label className="text-sm font-bold text-navy-900 dark:text-white block leading-snug">
              Seberapa bermanfaat pelayanan yang Anda terima dari petugas bagi Anda? <span className="text-red-500">*</span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-2.5">
              {SKALA_MANFAAT.map((skala) => {
                const isSelected = manfaatPelayanan === skala.value;
                return (
                  <button
                    key={skala.value}
                    type="button"
                    onClick={() => setManfaatPelayanan(skala.value)}
                    className={`flex flex-col items-center justify-center rounded-2xl border p-3 text-center transition cursor-pointer ${
                      isSelected
                        ? "border-[#ff7a1a] bg-orange-50/80 text-[#ff7a1a] font-bold dark:border-orange-500 dark:bg-orange-950/40 dark:text-orange-300 ring-2 ring-[#ff7a1a]/30"
                        : `border-slate-200/80 bg-slate-50/60 text-slate-700 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-300 ${skala.color}`
                    }`}
                  >
                    <span className="text-base sm:text-lg mb-1">{skala.emoji}</span>
                    <span className="text-xs">{skala.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* BAGIAN B: SISTEM & WEBSITE AMPERA (2 PERTANYAAN) */}
        {/* ========================================================= */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4 dark:border-slate-800">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Globe className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Bagian B: Sistem & Website AMPERA
              </span>
              <h2 className="text-sm sm:text-base font-extrabold text-navy-900 dark:text-white">
                Penilaian Kualitas & Kebermanfaatan Website AMPERA
              </h2>
            </div>
          </div>

          {/* Pertanyaan 4: Kualitas Website */}
          <div className="space-y-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Pertanyaan 4 dari 5
            </span>
            <label className="text-sm font-bold text-navy-900 dark:text-white block leading-snug">
              Bagaimana kualitas sistem dan website AMPERA? <span className="text-red-500">*</span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-2.5">
              {SKALA_KUALITAS.map((skala) => {
                const isSelected = kualitasWebsite === skala.value;
                return (
                  <button
                    key={skala.value}
                    type="button"
                    onClick={() => setKualitasWebsite(skala.value)}
                    className={`flex flex-col items-center justify-center rounded-2xl border p-3 text-center transition cursor-pointer ${
                      isSelected
                        ? "border-[#ff7a1a] bg-orange-50/80 text-[#ff7a1a] font-bold dark:border-orange-500 dark:bg-orange-950/40 dark:text-orange-300 ring-2 ring-[#ff7a1a]/30"
                        : `border-slate-200/80 bg-slate-50/60 text-slate-700 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-300 ${skala.color}`
                    }`}
                  >
                    <span className="text-base sm:text-lg mb-1">{skala.emoji}</span>
                    <span className="text-xs">{skala.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pertanyaan 5: Kebermanfaatan Website */}
          <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Pertanyaan 5 dari 5
            </span>
            <label className="text-sm font-bold text-navy-900 dark:text-white block leading-snug">
              Seberapa bermanfaat sistem dan website AMPERA bagi Anda? <span className="text-red-500">*</span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-2.5">
              {SKALA_MANFAAT.map((skala) => {
                const isSelected = manfaatWebsite === skala.value;
                return (
                  <button
                    key={skala.value}
                    type="button"
                    onClick={() => setManfaatWebsite(skala.value)}
                    className={`flex flex-col items-center justify-center rounded-2xl border p-3 text-center transition cursor-pointer ${
                      isSelected
                        ? "border-[#ff7a1a] bg-orange-50/80 text-[#ff7a1a] font-bold dark:border-orange-500 dark:bg-orange-950/40 dark:text-orange-300 ring-2 ring-[#ff7a1a]/30"
                        : `border-slate-200/80 bg-slate-50/60 text-slate-700 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-300 ${skala.color}`
                    }`}
                  >
                    <span className="text-base sm:text-lg mb-1">{skala.emoji}</span>
                    <span className="text-xs">{skala.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* KRITIK & SARAN OPSIONAL */}
        {/* ========================================================= */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-[#ff7a1a]" />
            <label className="text-sm font-bold text-navy-900 dark:text-white">
              Kritik, Saran, atau Masukan untuk BBPOM Palembang <span className="text-slate-400 font-normal">(Opsional)</span>
            </label>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Tuliskan saran perbaikan atau apresiasi Anda untuk kemajuan layanan dan sistem informasi kami.
          </p>
          <textarea
            rows={4}
            value={kritikSaran}
            onChange={(e) => setKritikSaran(e.target.value)}
            placeholder="Tuliskan saran dan masukan Anda di sini..."
            className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-sm text-navy-900 placeholder:text-slate-400 focus:border-[#ff7a1a] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800/60 dark:text-white transition"
          />
        </div>

        {/* Error Notification */}
        {formValidationError && (
          <div className="flex items-center gap-2 rounded-2xl bg-rose-50 p-4 text-xs font-semibold text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-900/60 dark:text-rose-300 animate-shake">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{formValidationError}</span>
          </div>
        )}

        {/* Action Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center sm:text-left">
            Dengan menekan tombol kirim, ulasan Anda akan tercatat dalam Indeks Kepuasan Masyarakat (IKM) BBPOM Palembang.
          </p>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-[#ff7a1a] to-[#f26a0f] px-8 py-3.5 text-sm font-bold text-white shadow-cta hover:brightness-110 transition disabled:opacity-50 cursor-pointer shrink-0"
          >
            {isSubmitting ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Mengirimkan Survei...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Kirim Penilaian Survei
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

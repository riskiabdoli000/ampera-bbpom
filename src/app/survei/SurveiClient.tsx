"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import {
  Star,
  CheckCircle2,
  AlertCircle,
  Search,
  ChevronLeft,
  HeartHandshake,
  Home,
  Send,
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
  { value: 5, label: "Sangat Baik" },
  { value: 4, label: "Baik" },
  { value: 3, label: "Cukup" },
  { value: 2, label: "Buruk" },
  { value: 1, label: "Sangat Buruk" },
];

const SKALA_MANFAAT = [
  { value: 5, label: "Sangat Bermanfaat" },
  { value: 4, label: "Bermanfaat" },
  { value: 3, label: "Cukup Bermanfaat" },
  { value: 2, label: "Kurang Bermanfaat" },
  { value: 1, label: "Tidak Bermanfaat" },
];

/**
 * Komponen Radio Button Horizontal dengan tema warna Orange khas BBPOM Palembang
 */
function RadioItem({
  name,
  value,
  checked,
  onChange,
  label,
}: {
  name: string;
  value: number;
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <label
      onClick={onChange}
      className="inline-flex items-center gap-2 cursor-pointer select-none group"
    >
      <div
        className={`h-4.5 w-4.5 rounded-full border flex items-center justify-center transition-all ${
          checked
            ? "border-[#ff7a1a] bg-white ring-2 ring-[#ff7a1a]/20"
            : "border-slate-300 bg-white group-hover:border-slate-400"
        }`}
      >
        {checked && <div className="h-2.5 w-2.5 rounded-full bg-[#ff7a1a]" />}
      </div>
      <span
        className={`text-xs sm:text-sm transition-colors ${
          checked ? "text-slate-900 font-semibold" : "text-slate-600 font-medium"
        }`}
      >
        {label}
      </span>
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
    </label>
  );
}

export default function SurveiClient({
  initialKode,
  initialData,
  initialError,
}: SurveiClientProps) {
  const [kodeInput, setKodeInput] = useState(initialKode);
  const [data, setData] = useState<SurveiPengajuanData | null>(initialData);
  const [errorMessage, setErrorMessage] = useState<string | null>(initialError);

  // Form State untuk 5 Pertanyaan
  const [ratingBintang, setRatingBintang] = useState<number>(0);
  const [hoverBintang, setHoverBintang] = useState<number>(0);
  const [kualitasPelayanan, setKualitasPelayanan] = useState<number>(0);
  const [manfaatPelayanan, setManfaatPelayanan] = useState<number>(0);
  const [kualitasWebsite, setKualitasWebsite] = useState<number>(0);
  const [manfaatWebsite, setManfaatWebsite] = useState<number>(0);
  const [kritikSaran, setKritikSaran] = useState<string>("");

  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSearching, startSearching] = useTransition();
  const [isSubmitting, startSubmitting] = useTransition();
  const [isSuccessSubmitted, setIsSuccessSubmitted] = useState<boolean>(false);

  // Handler Pencarian Tiket Manual
  const handleSearchTiket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kodeInput.trim()) {
      setErrorMessage("Silakan masukkan nomor tiket pengajuan Anda.");
      return;
    }

    setErrorMessage(null);
    setValidationError(null);

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

  // Handler Submit Langsung 5 Pertanyaan
  const handleSubmitSurvei = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!data) return;

    if (ratingBintang === 0) {
      setValidationError("Mohon berikan penilaian bintang pada Pertanyaan 1.");
      return;
    }
    if (kualitasPelayanan === 0) {
      setValidationError("Mohon pilih penilaian pada Pertanyaan 2 (Kualitas Pelayanan Petugas).");
      return;
    }
    if (manfaatPelayanan === 0) {
      setValidationError("Mohon pilih penilaian pada Pertanyaan 3 (Kebermanfaatan Pelayanan Petugas).");
      return;
    }
    if (kualitasWebsite === 0) {
      setValidationError("Mohon pilih penilaian pada Pertanyaan 4 (Kualitas Sistem & Website AMPERA).");
      return;
    }
    if (manfaatWebsite === 0) {
      setValidationError("Mohon pilih penilaian pada Pertanyaan 5 (Kebermanfaatan Website AMPERA).");
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
        setValidationError(res.message);
      }
    });
  };

  const activeBintang = hoverBintang || ratingBintang;

  /* ========================================================================= */
  /* KARTU KIRI: INFORMASI WEBSITE (SIMPEL & ELEGAN, AKSEN ORANGE)              */
  /* ========================================================================= */
  const renderLeftCard = () => (
    <div className="rounded-3xl border border-slate-100 bg-white p-7 sm:p-9 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col justify-between space-y-6 lg:sticky lg:top-8">
      <div className="space-y-6 sm:space-y-7">
        {/* Logo BPOM & Identitas */}
        <div className="flex items-center gap-3">
          <img
            src="/assets-landingpage/logo-bpom.png"
            alt="Logo BPOM"
            className="h-10 w-10 sm:h-11 sm:w-11 object-contain shrink-0"
          />
          <div>
            <span className="text-sm font-black tracking-wider text-slate-900 block leading-tight">
              BPOM
            </span>
            <span className="text-[11px] font-medium text-slate-500 block leading-tight">
              Balai Pengawas Obat dan Makanan Palembang
            </span>
          </div>
        </div>

        {/* Teks Utama */}
        <div className="space-y-3">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-[1.25] font-brand">
            Terima kasih telah menggunakan layanan kami!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-sm">
            Pendapat Anda sangat berarti bagi kami untuk terus meningkatkan kualitas layanan.
          </p>

          {/* Info Singkat Tiket */}
          {data && (
            <div className="mt-4 pt-3.5 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Nomor Tiket:</span>
                <span className="font-mono font-bold text-[#ff7a1a] bg-orange-50 px-2 py-0.5 rounded-md border border-orange-100">
                  {data.kodePengajuan}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Pemohon:</span>
                <span className="font-semibold text-slate-700 truncate max-w-[150px]">
                  {data.namaPemohon}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Layanan:</span>
                <span className="font-semibold text-slate-700 truncate max-w-[150px]">
                  {data.namaLayanan}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Catatan Kaki Bergaya Tulisan Tangan Tema Orange */}
      <div className="pt-6 border-t border-slate-50">
        <p className="text-sm sm:text-base font-semibold italic text-[#ea580c] -rotate-1 tracking-tight select-none">
          Bersama kita wujudkan layanan yang lebih baik
        </p>
        <svg
          className="w-40 sm:w-44 h-3 text-[#ff7a1a]/80 mt-1"
          viewBox="0 0 170 12"
          fill="none"
        >
          <path
            d="M2.5 9.5C45.5 3.5 125.5 1.5 167.5 7.5"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );

  /* ========================================================================= */
  /* KARTU KANAN: STATE 1 (SUKSES SETELAH SUBMIT)                               */
  /* ========================================================================= */
  if (isSuccessSubmitted) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
        <div className="lg:col-span-5">{renderLeftCard()}</div>
        <div className="lg:col-span-7">
          <div className="rounded-3xl border border-slate-100 bg-white p-8 sm:p-12 text-center shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col items-center justify-center animate-fade-up">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-[#ff7a1a]">
              <HeartHandshake className="h-8 w-8" />
            </div>

            <h2 className="mt-5 text-2xl font-black text-slate-900 font-brand">
              Terima Kasih Banyak!
            </h2>

            <p className="mt-2 text-xs sm:text-sm text-slate-500 max-w-md leading-relaxed">
              Survei kepuasan Anda untuk tiket{" "}
              <strong className="font-mono text-[#ff7a1a]">{data?.kodePengajuan}</strong> telah berhasil kami terima dan tersimpan ke dalam sistem IKM BBPOM di Palembang.
            </p>

            <div className="mt-6">
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#ff7a1a] to-[#f26a0f] px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm hover:brightness-105 transition"
              >
                <Home className="h-4 w-4" /> Kembali ke Halaman Utama
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ========================================================================= */
  /* KARTU KANAN: STATE 2 (SUDAH PERNAH DIISI SEBELUMNYA)                       */
  /* ========================================================================= */
  if (data && data.sudahSurvei) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
        <div className="lg:col-span-5">{renderLeftCard()}</div>
        <div className="lg:col-span-7">
          <div className="rounded-3xl border border-slate-100 bg-white p-8 sm:p-12 text-center shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col items-center justify-center animate-fade-up">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-[#ff7a1a]">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <h2 className="mt-5 text-2xl font-black text-slate-900 font-brand">
              Survei Sudah Pernah Diisi
            </h2>

            <p className="mt-2 text-xs sm:text-sm text-slate-500 max-w-md leading-relaxed">
              Terima kasih, Bapak/Ibu <strong className="text-slate-800">{data.namaPemohon}</strong>. Ulasan kepuasan untuk nomor tiket <strong className="font-mono text-[#ff7a1a]">{data.kodePengajuan}</strong> telah tersimpan sebelumnya.
            </p>

            {data.dataSurvei && (
              <div className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-slate-50 px-4 py-2 border border-slate-200/70">
                <span className="text-xs text-slate-500">Penilaian:</span>
                <div className="flex text-amber-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= (data.dataSurvei?.ratingBintang || 0)
                          ? "fill-amber-400 text-amber-400"
                          : "text-slate-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-slate-700 ml-1">
                  ({data.dataSurvei.ratingBintang}/5)
                </span>
              </div>
            )}

            <div className="mt-6">
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-5 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-slate-900 transition"
              >
                <Home className="h-4 w-4" /> Kembali ke Beranda
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ========================================================================= */
  /* KARTU KANAN: STATE 3 (PENCARIAN TIKET MANUAL)                             */
  /* ========================================================================= */
  if (!data) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
        <div className="lg:col-span-5">{renderLeftCard()}</div>
        <div className="lg:col-span-7">
          <div className="rounded-3xl border border-slate-100 bg-white p-7 sm:p-10 shadow-[0_4px_24px_rgba(0,0,0,0.03)] animate-fade-up">
            <h2 className="text-2xl font-black text-slate-900 font-brand">
              Survey Kepuasan Pelanggan
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
              Silakan masukkan nomor tiket pengajuan Anda untuk memulai pengisian survei.
            </p>

            <form onSubmit={handleSearchTiket} className="mt-6 space-y-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={kodeInput}
                  onChange={(e) => setKodeInput(e.target.value.toUpperCase())}
                  placeholder="Contoh: AMP-ADU-202610-1849"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-10 pr-4 py-2.5 text-xs sm:text-sm font-mono font-semibold uppercase tracking-wider text-slate-800 focus:border-[#ff7a1a] focus:bg-white focus:outline-none transition"
                />
              </div>

              {errorMessage && (
                <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs font-medium text-rose-700 border border-rose-200">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSearching}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#ff7a1a] to-[#f26a0f] px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm hover:brightness-105 transition disabled:opacity-50 cursor-pointer"
              >
                {isSearching ? "Mencari..." : "Buka Survei →"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  /* ========================================================================= */
  /* KARTU KANAN: STATE 4 (LANGSUNG TAMPIL 5 PERTANYAAN, TEMA ORANGE)          */
  /* ========================================================================= */
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start animate-fade-up">
      {/* SISI KIRI: INFORMASI WEBSITE */}
      <div className="lg:col-span-5">{renderLeftCard()}</div>

      {/* SISI KANAN: FORM 5 PERTANYAAN LANGSUNG */}
      <div className="lg:col-span-7">
        <form
          onSubmit={handleSubmitSurvei}
          className="rounded-3xl border border-slate-100 bg-white p-6 sm:p-9 shadow-[0_4px_24px_rgba(0,0,0,0.03)] space-y-6"
        >
          {/* Header Form */}
          <div className="space-y-1 border-b border-slate-100 pb-4">
           
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-brand">
              Survey Kepuasan Pelanggan
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Mohon luangkan waktu untuk mengisi survei berikut. Semua jawaban Anda akan sangat membantu kami.
            </p>
          </div>

          {/* ========================================================= */}
          {/* PERTANYAAN 1: RATING BINTANG KESELURUHAN (1 - 5 ⭐) */}
          {/* ========================================================= */}
          <div className="rounded-2xl border border-orange-100/70 bg-[#fffbf7] p-4 sm:p-5 space-y-3">
            <div className="flex items-start gap-2.5">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#ff7a1a] text-white text-xs font-bold mt-0.5">
                1
              </div>
              <label className="text-xs sm:text-sm font-bold text-slate-800 leading-snug">
                Bagaimana pendapat Anda tentang kualitas layanan yang Anda terima? <span className="text-rose-500">*</span>
              </label>
            </div>

            <div className="py-2 flex items-center justify-center gap-2 sm:gap-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRatingBintang(star)}
                  onMouseEnter={() => setHoverBintang(star)}
                  onMouseLeave={() => setHoverBintang(0)}
                  className="p-1 transition-transform hover:scale-115 active:scale-95 cursor-pointer focus:outline-none"
                  title={`${star} Bintang`}
                >
                  <Star
                    className={`h-8 w-8 sm:h-9 sm:w-9 transition-colors ${
                      star <= activeBintang
                        ? "fill-amber-400 text-amber-400 drop-shadow-xs"
                        : "text-slate-300 fill-transparent"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* ========================================================= */}
          {/* PERTANYAAN 2: KUALITAS PELAYANAN PETUGAS                  */}
          {/* ========================================================= */}
          <div className="rounded-2xl border border-orange-100/70 bg-[#fffbf7] p-4 sm:p-5 space-y-3">
            <div className="flex items-start gap-2.5">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#ff7a1a] text-white text-xs font-bold mt-0.5">
                2
              </div>
              <label className="text-xs sm:text-sm font-bold text-slate-800 leading-snug">
                Bagaimana kualitas pelayanan yang diberikan oleh petugas kepada Anda? <span className="text-rose-500">*</span>
              </label>
            </div>

            <div className="pl-8 flex flex-wrap items-center gap-4 sm:gap-6 pt-1">
              {SKALA_KUALITAS.map((opt) => (
                <RadioItem
                  key={opt.value}
                  name="kualitasPelayanan"
                  value={opt.value}
                  checked={kualitasPelayanan === opt.value}
                  onChange={() => setKualitasPelayanan(opt.value)}
                  label={opt.label}
                />
              ))}
            </div>
          </div>

          {/* ========================================================= */}
          {/* PERTANYAAN 3: KEBERMANFAATAN PELAYANAN PETUGAS            */}
          {/* ========================================================= */}
          <div className="rounded-2xl border border-orange-100/70 bg-[#fffbf7] p-4 sm:p-5 space-y-3">
            <div className="flex items-start gap-2.5">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#ff7a1a] text-white text-xs font-bold mt-0.5">
                3
              </div>
              <label className="text-xs sm:text-sm font-bold text-slate-800 leading-snug">
                Seberapa bermanfaat pelayanan yang Anda terima dari petugas bagi Anda? <span className="text-rose-500">*</span>
              </label>
            </div>

            <div className="pl-8 flex flex-wrap items-center gap-4 sm:gap-6 pt-1">
              {SKALA_MANFAAT.map((opt) => (
                <RadioItem
                  key={opt.value}
                  name="manfaatPelayanan"
                  value={opt.value}
                  checked={manfaatPelayanan === opt.value}
                  onChange={() => setManfaatPelayanan(opt.value)}
                  label={opt.label}
                />
              ))}
            </div>
          </div>

          {/* ========================================================= */}
          {/* PERTANYAAN 4: KUALITAS SISTEM & WEBSITE AMPERA            */}
          {/* ========================================================= */}
          <div className="rounded-2xl border border-orange-100/70 bg-[#fffbf7] p-4 sm:p-5 space-y-3">
            <div className="flex items-start gap-2.5">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#ff7a1a] text-white text-xs font-bold mt-0.5">
                4
              </div>
              <label className="text-xs sm:text-sm font-bold text-slate-800 leading-snug">
                Bagaimana kualitas sistem dan website AMPERA? <span className="text-rose-500">*</span>
              </label>
            </div>

            <div className="pl-8 flex flex-wrap items-center gap-4 sm:gap-6 pt-1">
              {SKALA_KUALITAS.map((opt) => (
                <RadioItem
                  key={opt.value}
                  name="kualitasWebsite"
                  value={opt.value}
                  checked={kualitasWebsite === opt.value}
                  onChange={() => setKualitasWebsite(opt.value)}
                  label={opt.label}
                />
              ))}
            </div>
          </div>

          {/* ========================================================= */}
          {/* PERTANYAAN 5: KEBERMANFAATAN WEBSITE AMPERA               */}
          {/* ========================================================= */}
          <div className="rounded-2xl border border-orange-100/70 bg-[#fffbf7] p-4 sm:p-5 space-y-3">
            <div className="flex items-start gap-2.5">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#ff7a1a] text-white text-xs font-bold mt-0.5">
                5
              </div>
              <label className="text-xs sm:text-sm font-bold text-slate-800 leading-snug">
                Seberapa bermanfaat sistem dan website AMPERA bagi Anda? <span className="text-rose-500">*</span>
              </label>
            </div>

            <div className="pl-8 flex flex-wrap items-center gap-4 sm:gap-6 pt-1">
              {SKALA_MANFAAT.map((opt) => (
                <RadioItem
                  key={opt.value}
                  name="manfaatWebsite"
                  value={opt.value}
                  checked={manfaatWebsite === opt.value}
                  onChange={() => setManfaatWebsite(opt.value)}
                  label={opt.label}
                />
              ))}
            </div>
          </div>


          {/* Validasi Error Alert */}
          {validationError && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-3.5 text-xs font-medium text-rose-700 border border-rose-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Tombol Submit Langsung (Kirim Penilaian) */}
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#ff7a1a] to-[#f26a0f] px-8 py-3 text-sm font-bold text-white shadow-md shadow-orange-500/20 hover:brightness-105 active:scale-[0.99] transition disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Mengirimkan Penilaian...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" /> Kirim Penilaian Survei
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

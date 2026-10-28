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
  FileText,
  User,
  Clock,
  Mail,
  ExternalLink,
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
  { value: 5, label: "Sangat Baik", emoji: "🟢" },
  { value: 4, label: "Baik", emoji: "🔵" },
  { value: 3, label: "Cukup", emoji: "🟡" },
  { value: 2, label: "Buruk", emoji: "🟠" },
  { value: 1, label: "Sangat Buruk", emoji: "🔴" },
];

const SKALA_MANFAAT = [
  { value: 5, label: "Sangat Bermanfaat", emoji: "🟢" },
  { value: 4, label: "Bermanfaat", emoji: "🔵" },
  { value: 3, label: "Cukup Bermanfaat", emoji: "🟡" },
  { value: 2, label: "Kurang Bermanfaat", emoji: "🟠" },
  { value: 1, label: "Tidak Bermanfaat", emoji: "🔴" },
];

const BINTANG_LABELS: Record<number, string> = {
  1: "Sangat Tidak Puas",
  2: "Kurang Puas",
  3: "Cukup Puas",
  4: "Puas",
  5: "Sangat Puas",
};

/**
 * Komponen Radio Option yang modern, bersih, dan mudah diklik
 */
function RadioOption({
  name,
  value,
  selectedValue,
  onChange,
  label,
  emoji,
}: {
  name: string;
  value: number;
  selectedValue: number;
  onChange: (val: number) => void;
  label: string;
  emoji: string;
}) {
  const isSelected = selectedValue === value;
  return (
    <label
      onClick={() => onChange(value)}
      className={`group flex items-center justify-between rounded-2xl border px-4 py-3 cursor-pointer transition select-none ${
        isSelected
          ? "border-[#ff7a1a] bg-orange-50/70 dark:bg-orange-950/25 ring-2 ring-[#ff7a1a]/25 text-navy-900 dark:text-white"
          : "border-slate-200/90 bg-white hover:border-slate-300 hover:bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900/90 dark:hover:border-slate-700 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300"
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Lingkaran Radio Button */}
        <div
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all ${
            isSelected
              ? "border-[#ff7a1a] bg-[#ff7a1a]"
              : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 group-hover:border-slate-400"
          }`}
        >
          {isSelected && <div className="h-2 w-2 rounded-full bg-white shadow-xs" />}
        </div>
        <span className={`text-sm ${isSelected ? "font-bold" : "font-medium"}`}>
          {label}
        </span>
      </div>
      <span className="text-base shrink-0">{emoji}</span>
      <input
        type="radio"
        name={name}
        value={value}
        checked={isSelected}
        onChange={() => onChange(value)}
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
      setFormValidationError("Mohon pilih opsi penilaian untuk Pertanyaan 2 (Kualitas Pelayanan Petugas).");
      return;
    }
    if (manfaatPelayanan === 0) {
      setFormValidationError("Mohon pilih opsi penilaian untuk Pertanyaan 3 (Kebermanfaatan Pelayanan Petugas).");
      return;
    }
    if (kualitasWebsite === 0) {
      setFormValidationError("Mohon pilih opsi penilaian untuk Pertanyaan 4 (Kualitas Sistem & Website AMPERA).");
      return;
    }
    if (manfaatWebsite === 0) {
      setFormValidationError("Mohon pilih opsi penilaian untuk Pertanyaan 5 (Kebermanfaatan Website AMPERA).");
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

  const activeBintang = hoverBintang || ratingBintang;

  /* ========================================================================= */
  /* KARTU KIRI: INFORMASI WEBSITE & IDENTITAS LAYANAN                          */
  /* ========================================================================= */
  const renderLeftInfoCard = () => (
    <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between space-y-6 lg:sticky lg:top-8">
      <div className="space-y-6">
        {/* Identitas Instansi & Logo */}
        <div className="flex items-center gap-3.5 border-b border-slate-100 pb-5 dark:border-slate-800">
          <img
            src="/assets-landingpage/logo-bpom.png"
            alt="Logo BBPOM Palembang"
            className="h-12 w-12 object-contain shrink-0"
          />
          <div>
            <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-[#ff7a1a] block">
              BALAI BESAR POM DI PALEMBANG
            </span>
            <h2 className="text-base sm:text-lg font-black text-navy-900 dark:text-white leading-tight font-brand">
              Sistem Pelayanan Terpadu AMPERA
            </h2>
          </div>
        </div>

        {/* Judul & Pengantar IKM */}
        <div className="space-y-2">
          <span className="inline-block rounded-full bg-orange-100 px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-orange-800 dark:bg-orange-950/50 dark:text-orange-300">
            SURVEI KEPUASAN MASYARAKAT (IKM)
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-navy-900 dark:text-white font-brand">
            Evaluasi Mutu Layanan & Sistem Informasi
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Survei ini diselenggarakan secara resmi sebagai wujud komitmen BBPOM di Palembang untuk mengukur kepuasan masyarakat terhadap pelayanan petugas dan keandalan sistem aplikasi online AMPERA.
          </p>
        </div>

        {/* Ringkasan Tiket Layanan Pemohon (Jika Data Tiket Valid) */}
        {data ? (
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4.5 dark:border-slate-800 dark:bg-slate-800/40 space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block border-b border-slate-200/60 pb-1.5 dark:border-slate-700">
              Rincian Tiket Pemohon
            </span>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-slate-400" /> Nomor Tiket:
                </span>
                <span className="font-mono font-black text-[#ff7a1a] text-xs">
                  {data.kodePengajuan}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-slate-400" /> Nama Pemohon:
                </span>
                <span className="font-bold text-navy-900 dark:text-white truncate max-w-[180px]">
                  {data.namaPemohon}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-slate-400" /> Jenis Layanan:
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 text-right truncate max-w-[180px]">
                  {data.namaLayanan}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-slate-400" /> Status Layanan:
                </span>
                <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                  Selesai Ditindaklanjuti
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-4 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-800/40">
            Penilaian Anda bersifat objektif dan dilindungi kerahasiaannya untuk peningkatan mutu berkelanjutan.
          </div>
        )}

        {/* Landasan Regulasi & Nilai Integritas */}
        <div className="rounded-2xl bg-blue-50/60 p-3.5 border border-blue-100 text-xs text-slate-600 dark:bg-blue-950/30 dark:border-blue-900/50 dark:text-slate-300 space-y-1">
          <p className="font-bold text-blue-900 dark:text-blue-300 text-[11px] uppercase tracking-wide">
            Transparan & Akuntabel
          </p>
          <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
            Berdasarkan PermenPAN-RB No. 14 Tahun 2017 tentang Pedoman Penyusunan Survei Kepuasan Masyarakat Unit Penyelenggara Pelayanan Publik.
          </p>
        </div>
      </div>

      {/* Footer Info Kontak & Navigasi */}
      <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <svg className="h-3.5 w-3.5 fill-[#ff7a1a] shrink-0" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            <span>@bpom.palembang</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="h-3.5 w-3.5 text-[#ff7a1a]" />
            <span>bpom_palembang@pom.go.id</span>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="h-3.5 w-3.5 text-[#ff7a1a]" />
            <span>palembang.pom.go.id</span>
          </div>
        </div>

        <Link
          href="/"
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          <Home className="h-3.5 w-3.5" /> Kembali ke Beranda AMPERA
        </Link>
      </div>
    </div>
  );

  /* ========================================================================= */
  /* KARTU KANAN: STATE 1 (SUKSES SETELAH SUBMIT)                               */
  /* ========================================================================= */
  if (isSuccessSubmitted) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        <div className="lg:col-span-5">{renderLeftInfoCard()}</div>
        <div className="lg:col-span-7">
          <div className="rounded-3xl border border-emerald-200 bg-white p-8 sm:p-12 text-center shadow-sm dark:border-emerald-900/60 dark:bg-slate-900 animate-fade-up">
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
              <span className="font-mono font-bold text-[#ff7a1a]">{data?.kodePengajuan}</span> telah resmi tercatat. Kontribusi Anda sangat berarti bagi komitmen Balai Besar POM di Palembang dalam menghadirkan pelayanan publik yang semakin transparan, responsif, dan berkualitas prima.
            </p>

            <div className="mt-8 flex justify-center">
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#ff7a1a] to-[#f26a0f] px-6 py-3 text-sm font-bold text-white shadow-cta hover:brightness-110 transition cursor-pointer"
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        <div className="lg:col-span-5">{renderLeftInfoCard()}</div>
        <div className="lg:col-span-7">
          <div className="rounded-3xl border border-sky-200 bg-white p-8 sm:p-12 text-center shadow-sm dark:border-sky-900/60 dark:bg-slate-900 animate-fade-up">
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
              <div className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-slate-50 px-5 py-2.5 dark:border-slate-800 dark:bg-slate-800/60">
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
                  ({data.dataSurvei.ratingBintang}/5 Bintang)
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
        </div>
      </div>
    );
  }

  /* ========================================================================= */
  /* KARTU KANAN: STATE 3 (PENCARIAN MANUAL JIKA BELUM ADA TIKET)              */
  /* ========================================================================= */
  if (!data) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        <div className="lg:col-span-5">{renderLeftInfoCard()}</div>
        <div className="lg:col-span-7">
          <div className="rounded-3xl border border-slate-200/90 bg-white p-7 sm:p-10 shadow-sm dark:border-slate-800 dark:bg-slate-900 animate-fade-up">
            <div className="text-center max-w-lg mx-auto">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#ff7a1a]/10 text-[#ff7a1a]">
                <Sparkles className="h-7 w-7" />
              </div>

              <span className="mt-4 inline-block text-xs font-extrabold uppercase tracking-widest text-[#ff7a1a]">
                VERIFIKASI TIKET PENGAJUAN
              </span>
              <h2 className="mt-2 text-2xl font-black text-navy-900 dark:text-white font-brand">
                Masukkan Nomor Tiket Anda
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Silakan ketik nomor tiket pengajuan resmi Anda (contoh:{" "}
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                  AMP-ADU-202610-1849
                </span>
                ) untuk melanjutkan pengisian survei.
              </p>

              <form onSubmit={handleSearchTiket} className="mt-6 flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={kodeInput}
                    onChange={(e) => setKodeInput(e.target.value.toUpperCase())}
                    placeholder="Contoh: AMP-ADU-202610-1849"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 pl-11 pr-4 py-3 text-sm font-mono font-semibold uppercase tracking-wider text-navy-900 focus:border-[#ff7a1a] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800/80 dark:text-white transition"
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
        </div>
      </div>
    );
  }

  /* ========================================================================= */
  /* KARTU KANAN: STATE 4 (FORMULIR UTAMA SURVEI 5 PERTANYAAN)                 */
  /* ========================================================================= */
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start animate-fade-up">
      {/* SISI KIRI: INFORMASI WEBSITE */}
      <div className="lg:col-span-5">{renderLeftInfoCard()}</div>

      {/* SISI KANAN: FORM PERTANYAAN SURVEI */}
      <div className="lg:col-span-7">
        <form
          onSubmit={handleSubmitSurvei}
          className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-7"
        >
          {/* Header Form */}
          <div className="border-b border-slate-100 pb-4 dark:border-slate-800">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#ff7a1a] block">
              FORMULIR PENILAIAN PELAYANAN
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-navy-900 dark:text-white font-brand mt-0.5">
              Ulasan Kepuasan Anda
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Silakan isi 5 pertanyaan berikut dengan memberikan skala penilaian yang paling sesuai.
            </p>
          </div>

          {/* ========================================================= */}
          {/* PERTANYAAN 1: RATING BINTANG KESELURUHAN (1 - 5 ⭐) */}
          {/* ========================================================= */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500 text-xs font-bold">
                1
              </span>
              <label className="text-sm font-bold text-navy-900 dark:text-white leading-snug">
                Secara keseluruhan, bagaimana tingkat kepuasan Anda terhadap layanan BBPOM di Palembang?{" "}
                <span className="text-red-500">*</span>
              </label>
            </div>

            <div className="rounded-2xl border border-amber-200/60 bg-amber-50/40 p-4 text-center dark:border-amber-900/40 dark:bg-amber-950/20">
              <div className="flex items-center justify-center gap-2 sm:gap-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRatingBintang(star)}
                    onMouseEnter={() => setHoverBintang(star)}
                    onMouseLeave={() => setHoverBintang(0)}
                    className="p-1 sm:p-1.5 transition-transform hover:scale-115 active:scale-95 cursor-pointer focus:outline-none"
                    title={`${star} Bintang - ${BINTANG_LABELS[star]}`}
                  >
                    <Star
                      className={`h-8 w-8 sm:h-10 sm:w-10 transition-colors duration-200 ${
                        star <= activeBintang
                          ? "fill-amber-400 text-amber-400 drop-shadow-xs"
                          : "text-slate-300 dark:text-slate-700"
                      }`}
                    />
                  </button>
                ))}
              </div>

              <div className="mt-2.5 h-6">
                {activeBintang > 0 ? (
                  <span className="inline-block rounded-full bg-amber-100 px-3.5 py-0.5 text-xs font-bold text-amber-800 dark:bg-amber-900/60 dark:text-amber-200 border border-amber-300/80">
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
          {/* PERTANYAAN 2: KUALITAS PELAYANAN PETUGAS (RADIO BUTTON)   */}
          {/* ========================================================= */}
          <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold">
                2
              </span>
              <label className="text-sm font-bold text-navy-900 dark:text-white leading-snug">
                Bagaimana kualitas pelayanan yang diberikan oleh petugas kepada Anda?{" "}
                <span className="text-red-500">*</span>
              </label>
            </div>

            <div className="space-y-2">
              {SKALA_KUALITAS.map((skala) => (
                <RadioOption
                  key={skala.value}
                  name="kualitasPelayanan"
                  value={skala.value}
                  selectedValue={kualitasPelayanan}
                  onChange={setKualitasPelayanan}
                  label={skala.label}
                  emoji={skala.emoji}
                />
              ))}
            </div>
          </div>

          {/* ========================================================= */}
          {/* PERTANYAAN 3: KEBERMANFAATAN PELAYANAN (RADIO BUTTON)     */}
          {/* ========================================================= */}
          <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold">
                3
              </span>
              <label className="text-sm font-bold text-navy-900 dark:text-white leading-snug">
                Seberapa bermanfaat pelayanan yang Anda terima dari petugas bagi Anda?{" "}
                <span className="text-red-500">*</span>
              </label>
            </div>

            <div className="space-y-2">
              {SKALA_MANFAAT.map((skala) => (
                <RadioOption
                  key={skala.value}
                  name="manfaatPelayanan"
                  value={skala.value}
                  selectedValue={manfaatPelayanan}
                  onChange={setManfaatPelayanan}
                  label={skala.label}
                  emoji={skala.emoji}
                />
              ))}
            </div>
          </div>

          {/* ========================================================= */}
          {/* PERTANYAAN 4: KUALITAS SISTEM & WEBSITE (RADIO BUTTON)    */}
          {/* ========================================================= */}
          <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-bold">
                4
              </span>
              <label className="text-sm font-bold text-navy-900 dark:text-white leading-snug">
                Bagaimana kualitas sistem dan website AMPERA?{" "}
                <span className="text-red-500">*</span>
              </label>
            </div>

            <div className="space-y-2">
              {SKALA_KUALITAS.map((skala) => (
                <RadioOption
                  key={skala.value}
                  name="kualitasWebsite"
                  value={skala.value}
                  selectedValue={kualitasWebsite}
                  onChange={setKualitasWebsite}
                  label={skala.label}
                  emoji={skala.emoji}
                />
              ))}
            </div>
          </div>

          {/* ========================================================= */}
          {/* PERTANYAAN 5: KEBERMANFAATAN WEBSITE (RADIO BUTTON)       */}
          {/* ========================================================= */}
          <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-bold">
                5
              </span>
              <label className="text-sm font-bold text-navy-900 dark:text-white leading-snug">
                Seberapa bermanfaat sistem dan website AMPERA bagi Anda?{" "}
                <span className="text-red-500">*</span>
              </label>
            </div>

            <div className="space-y-2">
              {SKALA_MANFAAT.map((skala) => (
                <RadioOption
                  key={skala.value}
                  name="manfaatWebsite"
                  value={skala.value}
                  selectedValue={manfaatWebsite}
                  onChange={setManfaatWebsite}
                  label={skala.label}
                  emoji={skala.emoji}
                />
              ))}
            </div>
          </div>

          {/* ========================================================= */}
          {/* KRITIK & SARAN OPSIONAL                                   */}
          {/* ========================================================= */}
          <div className="space-y-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-[#ff7a1a]" />
              <label className="text-sm font-bold text-navy-900 dark:text-white">
                Kritik, Saran, atau Masukan <span className="text-slate-400 font-normal">(Opsional)</span>
              </label>
            </div>
            <textarea
              rows={3}
              value={kritikSaran}
              onChange={(e) => setKritikSaran(e.target.value)}
              placeholder="Tuliskan masukan atau apresiasi Anda di sini..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-sm text-navy-900 placeholder:text-slate-400 focus:border-[#ff7a1a] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800/60 dark:text-white transition"
            />
          </div>

          {/* Validasi Error Message */}
          {formValidationError && (
            <div className="flex items-center gap-2 rounded-2xl bg-rose-50 p-4 text-xs font-semibold text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-900/60 dark:text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{formValidationError}</span>
            </div>
          )}

          {/* Tombol Kirim Survei CTA */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#ff7a1a] to-[#f26a0f] py-3.5 px-6 text-sm font-bold text-white shadow-cta hover:brightness-110 active:scale-[0.99] transition disabled:opacity-60 cursor-pointer"
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
            <p className="mt-2.5 text-[11px] text-center text-slate-400">
              Penilaian Anda akan langsung dicatat secara sah ke dalam basis data IKM BBPOM di Palembang.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

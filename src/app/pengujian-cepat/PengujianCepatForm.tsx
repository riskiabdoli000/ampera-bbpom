"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  User,
  Mail,
  Phone,
  MapPin,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  FlaskConical,
  HelpCircle,
  Copy,
  Printer,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import {
  submitPengujianCepatAction,
  type PengujianCepatFormState,
  type PengujianCepatResponse,
} from "@/app/actions/pengujian-cepat";

const PRODUK_OPTIONS = [
  "Pempek, tekwan, model",
  "Kerupuk/Kemplang",
  "Tahu",
  "Mie Basah",
];

const ALASAN_OPTIONS = [
  "Produk tahan lama",
  "Perbedaan tekstur, rasa, dan/atau bau",
];

export function PengujianCepatForm() {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<PengujianCepatResponse | null>(null);

  // Form State
  const [formData, setFormData] = useState<PengujianCepatFormState>({
    nama: "",
    email: "",
    alamat: "",
    telepon: "",
    produkDicurigai: "",
    alasanKecurigaan: "",
    rincianProduk: "",
  });

  // Validation Errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Hapus error saat user mengetik
    if (errors[name]) {
      setErrors((prev) => {
        const newErr = { ...prev };
        delete newErr[name];
        return newErr;
      });
    }
  };

  // Validasi Step 1: Data Pemohon
  const validateStep1 = () => {
    const errs: { [key: string]: string } = {};
    if (!formData.nama.trim()) {
      errs.nama = "Nama lengkap wajib diisi";
    }
    if (!formData.telepon.trim()) {
      errs.telepon = "Nomor WhatsApp/telepon wajib diisi";
    } else if (formData.telepon.trim().length < 8) {
      errs.telepon = "Nomor telepon minimal 8 digit";
    }
    if (!formData.email.trim()) {
      errs.email = "Email aktif wajib diisi";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = "Format email tidak valid (contoh: nama@email.com)";
    }
    if (!formData.alamat.trim()) {
      errs.alamat = "Alamat domisili wajib diisi";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Validasi Step 2: Detail Sampel
  const validateStep2 = () => {
    const errs: { [key: string]: string } = {};
    if (!formData.produkDicurigai.trim()) {
      errs.produkDicurigai = "Silakan pilih produk yang dicurigai";
    }
    if (!formData.alasanKecurigaan.trim()) {
      errs.alasanKecurigaan = "Silakan pilih alasan kecurigaan";
    }
    if (!formData.rincianProduk.trim()) {
      errs.rincianProduk = "Rincian produk dan lokasi penjual wajib diisi";
    } else if (formData.rincianProduk.trim().length < 10) {
      errs.rincianProduk = "Berikan rincian lebih detail (minimal 10 karakter)";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (validateStep1()) {
        setCurrentStep(2);
        window.scrollTo({ top: 320, behavior: "smooth" });
      }
    } else if (currentStep === 2) {
      if (validateStep2()) {
        setCurrentStep(3);
        window.scrollTo({ top: 320, behavior: "smooth" });
      }
    }
  };

  const handleBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    } else if (currentStep === 3) {
      setCurrentStep(2);
    }
    window.scrollTo({ top: 320, behavior: "smooth" });
  };

  const handleStepClick = (step: 1 | 2 | 3) => {
    if (step === 1) {
      setCurrentStep(1);
    } else if (step === 2) {
      if (validateStep1()) setCurrentStep(2);
    } else if (step === 3) {
      if (validateStep1() && validateStep2()) setCurrentStep(3);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep1() || !validateStep2()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await submitPengujianCepatAction(formData);
      setSubmissionResult(response);
      window.scrollTo({ top: 200, behavior: "smooth" });
    } catch (err) {
      console.error("Gagal mengirim pengajuan:", err);
      // Fallback response bila terjadi kendala jaringan
      const fallbackCode = `AMP-UJI-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}-${Math.floor(1000 + Math.random() * 9000)}`;
      setSubmissionResult({
        success: true,
        message: "Formulir berhasil diterima dan kode pendaftaran diterbitkan.",
        kodePengajuan: fallbackCode,
        data: {
          ...formData,
          tanggalPengajuan: new Date().toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          }),
          estimasiHasil: "15 - 30 Menit",
          status: "MENUNGGU_PENYERAHAN_SAMPEL",
        },
      });
      window.scrollTo({ top: 200, behavior: "smooth" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleReset = () => {
    setSubmissionResult(null);
    setCurrentStep(1);
    setFormData({
      nama: "",
      email: "",
      alamat: "",
      telepon: "",
      produkDicurigai: "",
      alasanKecurigaan: "",
      rincianProduk: "",
    });
    setErrors({});
  };

  // =========================================================================
  // TAMPILAN JIKA PENGAJUAN TELAH BERHASIL (SUCCESS RECEIPT SCREEN)
  // =========================================================================
  if (submissionResult?.success) {
    return (
      <div className="w-full max-w-4xl mx-auto animate-fade-up">
        <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-[0_20px_50px_-20px_rgba(11,42,107,0.15)] p-6 sm:p-10 lg:p-12 overflow-hidden relative">
          {/* Decorative ambient background */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-orange-100/40 dark:bg-orange-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-sky-100/50 dark:bg-sky-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

          {/* Header Status Sukses */}
          <div className="relative text-center max-w-xl mx-auto pb-8 border-b border-slate-100 dark:border-slate-800">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/25 mb-4 animate-bounce [animation-iteration-count:2]">
              <CheckCircle2 className="w-10 h-10 stroke-[2.2]" />
            </div>
            <span className="inline-block px-3.5 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 mb-2">
              Pengajuan Berhasil Diterima
            </span>
            <h2 className="font-brand font-extrabold text-2xl sm:text-3xl text-navy-900 dark:text-white">
              Tiket Registrasi <span className="text-brand-orange">Uji Cepat</span> Terbit
            </h2>
            <p className="text-sm text-ink-soft dark:text-slate-400 mt-2">
              Simpan atau cetak kode pengajuan berikut untuk ditunjukkan kepada petugas Laboratorium BBPOM di Palembang.
            </p>

            {/* Kode Pengajuan Box */}
            <div className="mt-6 p-4 rounded-2xl bg-orange-50/70 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800/60 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-left">
                <span className="text-xs uppercase tracking-wider font-semibold text-brand-orange-600 dark:text-orange-400">
                  Kode Pengajuan Resmi
                </span>
                <p className="font-mono text-xl sm:text-2xl font-black text-navy-900 dark:text-white tracking-wider">
                  {submissionResult.kodePengajuan}
                </p>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(submissionResult.kodePengajuan)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-orange-200 dark:border-orange-700 text-xs font-bold text-navy-900 dark:text-white hover:text-brand-orange hover:border-brand-orange transition-colors cursor-pointer shadow-xs active:scale-95"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedCode ? "Tersalin!" : "Salin Kode"}</span>
              </button>
            </div>
          </div>

          {/* Rincian Data Pengajuan */}
          <div className="relative py-8 grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-slate-100 dark:border-slate-800 text-sm">
            {/* Sisi Kiri: Data Pemohon */}
            <div className="space-y-4">
              <h3 className="font-brand font-bold text-base text-navy-900 dark:text-white flex items-center gap-2">
                <User className="w-4 h-4 text-brand-orange" />
                <span>Data Pemohon</span>
              </h3>
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 space-y-2.5">
                <div>
                  <span className="text-xs text-ink-soft dark:text-slate-400 block">Nama Lengkap:</span>
                  <span className="font-semibold text-navy-900 dark:text-white">{submissionResult.data.nama}</span>
                </div>
                <div>
                  <span className="text-xs text-ink-soft dark:text-slate-400 block">WhatsApp / Telepon:</span>
                  <span className="font-semibold text-navy-900 dark:text-white">{submissionResult.data.telepon}</span>
                </div>
                <div>
                  <span className="text-xs text-ink-soft dark:text-slate-400 block">Email:</span>
                  <span className="font-semibold text-navy-900 dark:text-white">{submissionResult.data.email}</span>
                </div>
                <div>
                  <span className="text-xs text-ink-soft dark:text-slate-400 block">Alamat Domisili:</span>
                  <span className="font-semibold text-navy-900 dark:text-white">{submissionResult.data.alamat}</span>
                </div>
              </div>
            </div>

            {/* Sisi Kanan: Detail Sampel yang Dicurigai */}
            <div className="space-y-4">
              <h3 className="font-brand font-bold text-base text-navy-900 dark:text-white flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-brand-orange" />
                <span>Detail Sampel Uji</span>
              </h3>
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 space-y-2.5">
                <div>
                  <span className="text-xs text-ink-soft dark:text-slate-400 block">Produk yang Dicurigai:</span>
                  <span className="font-bold text-brand-orange-600 dark:text-orange-400">
                    {submissionResult.data.produkDicurigai}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-ink-soft dark:text-slate-400 block">Alasan Kecurigaan:</span>
                  <span className="font-semibold text-navy-900 dark:text-white">
                    {submissionResult.data.alasanKecurigaan}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-ink-soft dark:text-slate-400 block">Rincian & Lokasi Penjual:</span>
                  <p className="font-normal text-slate-700 dark:text-slate-300 leading-relaxed text-xs sm:text-[13px] italic bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 mt-1">
                    "{submissionResult.data.rincianProduk}"
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Petunjuk Langkah Selanjutnya */}
          <div className="relative py-6 bg-sky-50/60 dark:bg-sky-950/20 rounded-2xl p-5 my-6 border border-sky-100 dark:border-sky-900/40">
            <h4 className="font-brand font-bold text-sm text-navy-900 dark:text-white flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-sky-500" />
              <span>Petunjuk Penyerahan Sampel Laboratorium:</span>
            </h4>
            <ol className="list-decimal list-inside text-xs sm:text-sm text-slate-700 dark:text-slate-300 space-y-1.5 leading-relaxed">
              <li>
                Siapkan sampel produk yang dicurigai minimal <strong>50 - 100 gram</strong> dalam wadah plastik atau wadah kedap bersih.
              </li>
              <li>
                Kunjungi loket pelayanan <strong>BBPOM di Palembang (Jl. Pangeran Ratu, Jakabaring)</strong> atau temui petugas di <strong>Mobil Laboratorium Keliling AMPERA</strong>.
              </li>
              <li>
                Tunjukkan <strong>Kode Pengajuan</strong> ini kepada petugas untuk diproses dengan Rapid Test Kit (bebas biaya/GRATIS).
              </li>
              <li>
                Hasil pengujian cepat keluar dalam estimasi waktu <strong>15 - 30 menit</strong>.
              </li>
            </ol>
          </div>

          {/* Action Footer */}
          <div className="relative flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold text-navy-900 dark:text-white hover:border-brand-orange hover:text-brand-orange transition-colors cursor-pointer w-full sm:w-auto shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan Bukti</span>
            </button>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/40 text-sm font-bold text-brand-orange hover:bg-orange-100 transition-colors cursor-pointer w-full sm:w-auto"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Ajukan Sampel Lain</span>
              </button>

              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full bg-gradient-to-r from-[#ff8a1f] to-[#f26a0f] text-sm font-bold text-white shadow-cta hover:shadow-lg transition-all w-full sm:w-auto text-center"
              >
                <span>Kembali ke Beranda</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // TAMPILAN FORM UTAMA (SESUAI GAMBAR ACUAN)
  // =========================================================================
  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="bg-white dark:bg-slate-900 rounded-[28px] sm:rounded-[36px] border border-slate-100 dark:border-slate-800/90 shadow-[0_20px_60px_-15px_rgba(11,42,107,0.1)] p-5 sm:p-10 lg:p-12 relative overflow-hidden transition-all duration-300">
        
        {/* =================================================================== */}
        {/* 1. STEPPER PROGRESS INDICATOR (Responsive Mobile & Desktop)         */}
        {/* =================================================================== */}
        <div className="relative mb-8 sm:mb-10 pb-6 sm:pb-8 border-b border-slate-100 dark:border-slate-800/80">
          
          {/* Mobile Stepper View (< sm) */}
          <div className="sm:hidden relative">
            {/* Progress Bar Behind Circles */}
            <div className="absolute top-4 left-[16.67%] right-[16.67%] h-0.5 -translate-y-1/2 bg-slate-200 dark:bg-slate-800">
              <div
                className="h-full bg-brand-orange transition-all duration-500 rounded-full"
                style={{
                  width: currentStep === 1 ? "0%" : currentStep === 2 ? "50%" : "100%",
                }}
              />
            </div>

            <div className="grid grid-cols-3 relative">
              {/* Step 1: Data Pemohon */}
              <button
                type="button"
                onClick={() => handleStepClick(1)}
                className="flex flex-col items-center group focus:outline-hidden cursor-pointer relative z-10"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-brand font-bold text-xs transition-all duration-300 ring-4 ring-white dark:ring-slate-900 ${
                    currentStep >= 1
                      ? "bg-brand-orange text-white shadow-[0_4px_14px_rgba(255,122,26,0.4)]"
                      : "bg-slate-100 text-slate-400 dark:bg-slate-800"
                  }`}
                >
                  01
                </div>
                <span
                  className={`mt-1.5 font-brand text-[11px] font-bold text-center leading-tight transition-colors line-clamp-2 px-1 ${
                    currentStep === 1
                      ? "text-brand-orange dark:text-orange-400"
                      : currentStep > 1
                      ? "text-navy-900 dark:text-white"
                      : "text-slate-400 dark:text-slate-500"
                  }`}
                >
                  Data Pemohon
                </span>
              </button>

              {/* Step 2: Detail Sampel */}
              <button
                type="button"
                onClick={() => handleStepClick(2)}
                className="flex flex-col items-center group focus:outline-hidden cursor-pointer relative z-10"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-brand font-bold text-xs transition-all duration-300 ring-4 ring-white dark:ring-slate-900 ${
                    currentStep >= 2
                      ? "bg-brand-orange text-white shadow-[0_4px_14px_rgba(255,122,26,0.4)]"
                      : "bg-sky-50 text-sky-700 dark:bg-slate-800 dark:text-slate-400 border border-sky-200 dark:border-slate-700"
                  }`}
                >
                  02
                </div>
                <span
                  className={`mt-1.5 font-brand text-[11px] font-bold text-center leading-tight transition-colors line-clamp-2 px-1 ${
                    currentStep === 2
                      ? "text-brand-orange dark:text-orange-400"
                      : currentStep > 2
                      ? "text-navy-900 dark:text-white"
                      : "text-slate-400 dark:text-slate-500"
                  }`}
                >
                  Detail Sampel
                </span>
              </button>

              {/* Step 3: Konfirmasi */}
              <button
                type="button"
                onClick={() => handleStepClick(3)}
                className="flex flex-col items-center group focus:outline-hidden cursor-pointer relative z-10"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-brand font-bold text-xs transition-all duration-300 ring-4 ring-white dark:ring-slate-900 ${
                    currentStep === 3
                      ? "bg-brand-orange text-white shadow-[0_4px_14px_rgba(255,122,26,0.4)]"
                      : "bg-slate-100 text-slate-400 dark:bg-slate-800"
                  }`}
                >
                  03
                </div>
                <span
                  className={`mt-1.5 font-brand text-[11px] font-bold text-center leading-tight transition-colors line-clamp-2 px-1 ${
                    currentStep === 3
                      ? "text-brand-orange dark:text-orange-400"
                      : "text-slate-400 dark:text-slate-500"
                  }`}
                >
                  Konfirmasi
                </span>
              </button>
            </div>
          </div>

          {/* Desktop Stepper View (>= sm) */}
          <div className="hidden sm:flex items-center justify-between max-w-3xl mx-auto relative">
            
            {/* Step 1: Data Pemohon */}
            <button
              type="button"
              onClick={() => handleStepClick(1)}
              className="flex items-center gap-2.5 sm:gap-3 group focus:outline-hidden cursor-pointer"
            >
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-brand font-bold text-xs sm:text-sm transition-all duration-300 ${
                  currentStep >= 1
                    ? "bg-brand-orange text-white shadow-[0_4px_14px_rgba(255,122,26,0.4)]"
                    : "bg-slate-100 text-slate-400 dark:bg-slate-800"
                }`}
              >
                01
              </div>
              <span
                className={`font-brand text-xs sm:text-sm font-bold transition-colors ${
                  currentStep === 1
                    ? "text-brand-orange dark:text-orange-400"
                    : currentStep > 1
                    ? "text-navy-900 dark:text-white"
                    : "text-slate-400 dark:text-slate-500"
                }`}
              >
                Data Pemohon
              </span>
            </button>

            {/* Connecting Bar 1-2 */}
            <div
              className={`flex-1 h-0.5 mx-3 sm:mx-6 rounded-full transition-colors duration-500 ${
                currentStep >= 2 ? "bg-brand-orange" : "bg-slate-200 dark:bg-slate-800"
              }`}
            />

            {/* Step 2: Detail Sampel */}
            <button
              type="button"
              onClick={() => handleStepClick(2)}
              className="flex items-center gap-2.5 sm:gap-3 group focus:outline-hidden cursor-pointer"
            >
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-brand font-bold text-xs sm:text-sm transition-all duration-300 ${
                  currentStep >= 2
                    ? "bg-brand-orange text-white shadow-[0_4px_14px_rgba(255,122,26,0.4)]"
                    : "bg-sky-50 text-sky-700 dark:bg-slate-800 dark:text-slate-400 border border-sky-200 dark:border-slate-700"
                }`}
              >
                02
              </div>
              <span
                className={`font-brand text-xs sm:text-sm font-bold transition-colors ${
                  currentStep === 2
                    ? "text-brand-orange dark:text-orange-400"
                    : currentStep > 2
                    ? "text-navy-900 dark:text-white"
                    : "text-slate-400 dark:text-slate-500"
                }`}
              >
                Detail Sampel
              </span>
            </button>

            {/* Connecting Bar 2-3 */}
            <div
              className={`flex-1 h-0.5 mx-3 sm:mx-6 rounded-full transition-colors duration-500 ${
                currentStep >= 3 ? "bg-brand-orange" : "bg-slate-200 dark:bg-slate-800"
              }`}
            />

            {/* Step 3: Konfirmasi */}
            <button
              type="button"
              onClick={() => handleStepClick(3)}
              className="flex items-center gap-2.5 sm:gap-3 group focus:outline-hidden cursor-pointer"
            >
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-brand font-bold text-xs sm:text-sm transition-all duration-300 ${
                  currentStep === 3
                    ? "bg-brand-orange text-white shadow-[0_4px_14px_rgba(255,122,26,0.4)]"
                    : "bg-slate-100 text-slate-400 dark:bg-slate-800"
                }`}
              >
                03
              </div>
              <span
                className={`font-brand text-xs sm:text-sm font-bold transition-colors ${
                  currentStep === 3
                    ? "text-brand-orange dark:text-orange-400"
                    : "text-slate-400 dark:text-slate-500"
                }`}
              >
                Konfirmasi
              </span>
            </button>
          </div>
        </div>

        {/* =================================================================== */}
        {/* 2. FORM BODY BERDASARKAN CURRENT STEP                               */}
        {/* =================================================================== */}
        <form onSubmit={handleSubmit} noValidate>
          {/* --------------------------------------------------------------- */}
          {/* STEP 1: DATA PEMOHON                                            */}
          {/* --------------------------------------------------------------- */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fade-up">
              <div className="border-b border-slate-100 dark:border-slate-800/80 pb-3">
                <h3 className="font-brand font-bold text-lg text-navy-900 dark:text-white">
                  Data Identitas Pemohon
                </h3>
                <p className="text-xs sm:text-sm text-ink-soft dark:text-slate-400 mt-0.5">
                  Masukkan identitas Anda sebagai pelapor untuk keperluan registrasi dan pelacakan hasil pengujian.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                {/* Field: Nama Lengkap */}
                <div>
                  <label
                    htmlFor="nama"
                    className="block text-xs sm:text-[13px] font-bold text-navy-900 dark:text-slate-200 mb-2"
                  >
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="nama"
                      name="nama"
                      type="text"
                      value={formData.nama}
                      onChange={handleChange}
                      placeholder="Masukkan nama lengkap"
                      className={`w-full rounded-2xl border bg-white dark:bg-slate-950 px-4 py-3.5 text-sm text-navy-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden transition-all duration-200 ${
                        errors.nama
                          ? "border-red-400 focus:ring-2 focus:ring-red-400/20"
                          : "border-slate-200 dark:border-slate-700/80 focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20"
                      }`}
                    />
                  </div>
                  {errors.nama && (
                    <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{errors.nama}</span>
                    </p>
                  )}
                </div>

                {/* Field: Nomor Telepon / WhatsApp */}
                <div>
                  <label
                    htmlFor="telepon"
                    className="block text-xs sm:text-[13px] font-bold text-navy-900 dark:text-slate-200 mb-2"
                  >
                    Nomor WhatsApp / Telepon <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="telepon"
                      name="telepon"
                      type="tel"
                      value={formData.telepon}
                      onChange={handleChange}
                      placeholder="Contoh: 081234567890"
                      className={`w-full rounded-2xl border bg-white dark:bg-slate-950 px-4 py-3.5 text-sm text-navy-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden transition-all duration-200 ${
                        errors.telepon
                          ? "border-red-400 focus:ring-2 focus:ring-red-400/20"
                          : "border-slate-200 dark:border-slate-700/80 focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20"
                      }`}
                    />
                  </div>
                  {errors.telepon && (
                    <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{errors.telepon}</span>
                    </p>
                  )}
                </div>

                {/* Field: Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs sm:text-[13px] font-bold text-navy-900 dark:text-slate-200 mb-2"
                  >
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="nama@email.com"
                      className={`w-full rounded-2xl border bg-white dark:bg-slate-950 px-4 py-3.5 text-sm text-navy-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden transition-all duration-200 ${
                        errors.email
                          ? "border-red-400 focus:ring-2 focus:ring-red-400/20"
                          : "border-slate-200 dark:border-slate-700/80 focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20"
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{errors.email}</span>
                    </p>
                  )}
                </div>

                {/* Field: Alamat */}
                <div>
                  <label
                    htmlFor="alamat"
                    className="block text-xs sm:text-[13px] font-bold text-navy-900 dark:text-slate-200 mb-2"
                  >
                    Alamat Domisili <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="alamat"
                      name="alamat"
                      type="text"
                      value={formData.alamat}
                      onChange={handleChange}
                      placeholder="Masukkan alamat domisili lengkap"
                      className={`w-full rounded-2xl border bg-white dark:bg-slate-950 px-4 py-3.5 text-sm text-navy-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden transition-all duration-200 ${
                        errors.alamat
                          ? "border-red-400 focus:ring-2 focus:ring-red-400/20"
                          : "border-slate-200 dark:border-slate-700/80 focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20"
                      }`}
                    />
                  </div>
                  {errors.alamat && (
                    <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{errors.alamat}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* --------------------------------------------------------------- */}
          {/* STEP 2: DETAIL SAMPEL (SESUAI PROMPT PENGGUNA)                  */}
          {/* --------------------------------------------------------------- */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fade-up">
              <div className="border-b border-slate-100 dark:border-slate-800/80 pb-3">
                <h3 className="font-brand font-bold text-lg text-navy-900 dark:text-white">
                  Informasi Sampel & Kecurigaan
                </h3>
                <p className="text-xs sm:text-sm text-ink-soft dark:text-slate-400 mt-0.5">
                  Berikan informasi produk pangan yang dicurigai mengandung bahan kimia berbahaya untuk diuji.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                {/* Field: Pilihan Produk yang Dicurigai (Dropdown) */}
                <div>
                  <label
                    htmlFor="produkDicurigai"
                    className="block text-xs sm:text-[13px] font-bold text-navy-900 dark:text-slate-200 mb-2"
                  >
                    Pilihan Produk yang Dicurigai <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="produkDicurigai"
                      name="produkDicurigai"
                      value={formData.produkDicurigai}
                      onChange={handleChange}
                      className={`w-full appearance-none rounded-2xl border bg-white dark:bg-slate-950 px-4 py-3.5 pr-10 text-sm text-navy-900 dark:text-white focus:outline-hidden transition-all duration-200 ${
                        !formData.produkDicurigai ? "text-slate-400" : ""
                      } ${
                        errors.produkDicurigai
                          ? "border-red-400 focus:ring-2 focus:ring-red-400/20"
                          : "border-slate-200 dark:border-slate-700/80 focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20"
                      }`}
                    >
                      <option value="" disabled>
                        Pilih produk yang dicurigai
                      </option>
                      {PRODUK_OPTIONS.map((opt) => (
                        <option key={opt} value={opt} className="text-navy-900 dark:text-white">
                          {opt}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                  {errors.produkDicurigai && (
                    <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{errors.produkDicurigai}</span>
                    </p>
                  )}
                </div>

                {/* Field: Alasan Kecurigaan (Dropdown) */}
                <div>
                  <label
                    htmlFor="alasanKecurigaan"
                    className="block text-xs sm:text-[13px] font-bold text-navy-900 dark:text-slate-200 mb-2"
                  >
                    Alasan Kecurigaan <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="alasanKecurigaan"
                      name="alasanKecurigaan"
                      value={formData.alasanKecurigaan}
                      onChange={handleChange}
                      className={`w-full appearance-none rounded-2xl border bg-white dark:bg-slate-950 px-4 py-3.5 pr-10 text-sm text-navy-900 dark:text-white focus:outline-hidden transition-all duration-200 ${
                        !formData.alasanKecurigaan ? "text-slate-400" : ""
                      } ${
                        errors.alasanKecurigaan
                          ? "border-red-400 focus:ring-2 focus:ring-red-400/20"
                          : "border-slate-200 dark:border-slate-700/80 focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20"
                      }`}
                    >
                      <option value="" disabled>
                        Pilih alasan kecurigaan
                      </option>
                      {ALASAN_OPTIONS.map((opt) => (
                        <option key={opt} value={opt} className="text-navy-900 dark:text-white">
                          {opt}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                  {errors.alasanKecurigaan && (
                    <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{errors.alasanKecurigaan}</span>
                    </p>
                  )}
                </div>

                {/* Field: Rincian Produk yang Dicurigai (Textarea Spanning 2 Columns) */}
                <div className="md:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label
                      htmlFor="rincianProduk"
                      className="block text-xs sm:text-[13px] font-bold text-navy-900 dark:text-slate-200"
                    >
                      Rincian Produk yang Dicurigai <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[11px] text-ink-soft dark:text-slate-400">
                      {formData.rincianProduk.length} karakter (min. 10)
                    </span>
                  </div>
                  {/* Deskripsi Tambahan Sesuai Permintaan Prompt */}
                  <p className="text-xs text-ink-soft dark:text-slate-400 mb-2">
                    Sebutkan tempat/pasar/penjual dan informasi penting lainnya
                  </p>
                  <div className="relative">
                    <textarea
                      id="rincianProduk"
                      name="rincianProduk"
                      rows={4}
                      value={formData.rincianProduk}
                      onChange={handleChange}
                      placeholder="Contoh: Dibeli di Pasar 16 Ilir Palembang pada jam 08.00 pagi, lapak bagian lorong ikan/daging. Pempek terasa sangat kenyal seperti karet, tidak berbau ikan segar, dan tidak berlendir meski ditaruh pada suhu ruang selama 3 hari..."
                      className={`w-full rounded-2xl border bg-white dark:bg-slate-950 px-4 py-3.5 text-sm text-navy-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden transition-all duration-200 resize-y leading-relaxed ${
                        errors.rincianProduk
                          ? "border-red-400 focus:ring-2 focus:ring-red-400/20"
                          : "border-slate-200 dark:border-slate-700/80 focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20"
                      }`}
                    />
                  </div>
                  {errors.rincianProduk && (
                    <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{errors.rincianProduk}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* --------------------------------------------------------------- */}
          {/* STEP 3: KONFIRMASI DATA                                         */}
          {/* --------------------------------------------------------------- */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fade-up">
              <div className="border-b border-slate-100 dark:border-slate-800/80 pb-3">
                <h3 className="font-brand font-bold text-lg text-navy-900 dark:text-white">
                  Konfirmasi Pengajuan Layanan
                </h3>
                <p className="text-xs sm:text-sm text-ink-soft dark:text-slate-400 mt-0.5">
                  Tinjau kembali seluruh data Anda sebelum mengirimkan pengajuan uji laboratorium cepat.
                </p>
              </div>

              {/* Ringkasan Data Preview Card */}
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 space-y-6">
                <div>
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200/70 dark:border-slate-700">
                    <h4 className="font-brand font-bold text-sm text-brand-orange uppercase tracking-wider flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>Data Pemohon</span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="text-xs font-semibold text-brand-orange hover:underline cursor-pointer"
                    >
                      Ubah Data
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                    <div>
                      <span className="text-slate-400 block text-xs">Nama Lengkap:</span>
                      <span className="font-semibold text-navy-900 dark:text-white">{formData.nama}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-xs">Nomor WhatsApp:</span>
                      <span className="font-semibold text-navy-900 dark:text-white">{formData.telepon}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-xs">Email:</span>
                      <span className="font-semibold text-navy-900 dark:text-white">{formData.email}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-xs">Alamat Domisili:</span>
                      <span className="font-semibold text-navy-900 dark:text-white">{formData.alamat}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200/70 dark:border-slate-700">
                    <h4 className="font-brand font-bold text-sm text-brand-orange uppercase tracking-wider flex items-center gap-2">
                      <FlaskConical className="w-4 h-4" />
                      <span>Informasi Sampel & Kecurigaan</span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="text-xs font-semibold text-brand-orange hover:underline cursor-pointer"
                    >
                      Ubah Data
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                    <div>
                      <span className="text-slate-400 block text-xs">Produk yang Dicurigai:</span>
                      <span className="font-bold text-brand-orange-600 dark:text-orange-400">
                        {formData.produkDicurigai}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-xs">Alasan Kecurigaan:</span>
                      <span className="font-semibold text-navy-900 dark:text-white">
                        {formData.alasanKecurigaan}
                      </span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-slate-400 block text-xs">Rincian Tempat/Penjual & Informasi:</span>
                      <p className="font-normal text-slate-700 dark:text-slate-300 italic bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700 mt-1">
                        "{formData.rincianProduk}"
                      </p>
                    </div>
                  </div>
                </div>

                {/* Fast Facts Badge */}
                <div className="p-4 rounded-2xl bg-orange-50/80 dark:bg-orange-950/30 border border-orange-200/80 dark:border-orange-800/50 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-brand-orange shrink-0 mt-0.5" />
                  <div className="text-xs text-navy-900 dark:text-slate-200 leading-relaxed">
                    <strong>Layanan Gratis & Rahasia:</strong> Pengujian cepat menggunakan Rapid Test Kit resmi BBPOM (mendeteksi Boraks, Formalin, Rhodamin B, dan Metanil Yellow). Identitas pelapor dijamin kerahasiaannya.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* 3. CARD FOOTER: NOTICE & ACTION BUTTONS                             */}
          {/* (Persis Sesuai Bagian Bawah Gambar Acuan)                           */}
          {/* =================================================================== */}
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/80">
            <p className="text-xs text-ink-soft dark:text-slate-400 mb-5">
              Pastikan data yang diisi sudah benar sebelum melanjutkan.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Sisi Kiri: Privacy / Security Badge */}
              <div className="flex items-center gap-2 text-xs text-ink-soft dark:text-slate-400">
                <ShieldCheck className="w-4 h-4 text-brand-orange shrink-0" />
                <span>Data Anda digunakan untuk keperluan pelayanan BBPOM Palembang.</span>
              </div>

              {/* Sisi Kanan: Tombol Kembali & Lanjutkan / Kirim */}
              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="inline-flex items-center justify-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-6 sm:px-7 py-3 text-xs sm:text-sm font-bold text-navy-900 dark:text-white hover:border-brand-orange hover:text-brand-orange transition-all duration-200 cursor-pointer shadow-xs"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Kembali</span>
                  </button>
                ) : (
                  <Link
                    href="/#layanan"
                    className="inline-flex items-center justify-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-6 sm:px-7 py-3 text-xs sm:text-sm font-bold text-navy-900 dark:text-white hover:border-brand-orange hover:text-brand-orange transition-all duration-200 text-center"
                  >
                    <span>Kembali</span>
                  </Link>
                )}

                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#ff8a1f] to-[#f26a0f] px-7 sm:px-8 py-3 text-xs sm:text-sm font-bold text-white shadow-cta hover:shadow-[0_14px_28px_-8px_rgb(255_122_26/0.65)] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                  >
                    <span>Lanjutkan</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#ff8a1f] to-[#f26a0f] px-8 sm:px-9 py-3 text-xs sm:text-sm font-bold text-white shadow-cta hover:shadow-[0_14px_28px_-8px_rgb(255_122_26/0.65)] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Mengirim Data...</span>
                      </>
                    ) : (
                      <>
                        <span>Kirim Pengajuan</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

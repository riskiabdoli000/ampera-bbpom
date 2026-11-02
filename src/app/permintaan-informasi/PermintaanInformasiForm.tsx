"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  User,
  Mail,
  Phone,
  MapPin,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  HelpCircle,
  Copy,
  Printer,
  Sparkles,
  RefreshCw,
  Loader2,
  Calendar,
  Building2,
  FileQuestion,
  Info,
} from "lucide-react";
import {
  submitPermintaanInformasiAction,
  type PermintaanInformasiFormState,
  type PermintaanInformasiResponse,
} from "@/app/actions/permintaan-informasi";
import { lookupNikAction } from "@/app/actions/lookup-nik";
import { ServiceSavingOverlay } from "@/components/common/ServiceSavingOverlay";

export function PermintaanInformasiForm() {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<PermintaanInformasiResponse | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // NIK Lookup States
  const [isCheckingNik, setIsCheckingNik] = useState(false);
  const [nikLookupStatus, setNikLookupStatus] = useState<{
    status: "idle" | "found" | "not_found";
    message: string;
  }>({ status: "idle", message: "" });

  // Form State
  const [formData, setFormData] = useState<PermintaanInformasiFormState>({
    nik: "",
    nama: "",
    umur: "",
    email: "",
    alamatAsalInstansi: "",
    informasiDibutuhkan: "",
    telepon: "",
    kategoriInformasi: "Layanan Informasi Obat & Makanan",
  });

  // Validation Errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const nikRef = useRef(formData.nik);
  nikRef.current = formData.nik;
  const lastCheckedNikRef = useRef<string>("");

  // Handler: Auto-fill data pemohon saat NIK valid ditemukan
  const performNikLookup = useCallback(async (cleanNik: string) => {
    if (!cleanNik || cleanNik.length < 8) return;
    if (cleanNik === lastCheckedNikRef.current) return;

    lastCheckedNikRef.current = cleanNik;
    setIsCheckingNik(true);

    try {
      const res = await lookupNikAction(cleanNik);
      // Validasi bahwa NIK di form saat ini belum berubah sebelum update state
      if (nikRef.current.trim().replace(/\D/g, "") === cleanNik) {
        if (res.found && res.data) {
          setNikLookupStatus({
            status: "found",
            message: `${res.message}. Data Anda telah diisikan otomatis.`,
          });
          setFormData((prev) => ({
            ...prev,
            nama: res.data?.nama || prev.nama,
            email: res.data?.email || prev.email,
            umur: res.data?.umur ? String(res.data.umur) : prev.umur,
            alamatAsalInstansi:
              res.data?.asalInstansi || res.data?.alamat || prev.alamatAsalInstansi,
            telepon: res.data?.telepon || prev.telepon,
          }));
          // Hapus error yang bersangkutan
          setErrors((prev) => {
            const next = { ...prev };
            delete next.nik;
            delete next.nama;
            delete next.email;
            delete next.umur;
            delete next.alamatAsalInstansi;
            delete next.telepon;
            return next;
          });
        } else {
          setNikLookupStatus({
            status: "not_found",
            message: res.message || "NIK belum terdaftar di sistem. Silakan lengkapi formulir di bawah ini.",
          });
        }
      }
    } catch {
      if (nikRef.current.trim().replace(/\D/g, "") === cleanNik) {
        setNikLookupStatus({
          status: "not_found",
          message: "Layanan cek NIK sementara offline. Silakan lengkapi formulir secara manual.",
        });
      }
    } finally {
      setIsCheckingNik(false);
    }
  }, []);

  // Auto-lookup saat NIK mencapai 16 digit (standar KTP)
  useEffect(() => {
    const cleanNik = formData.nik.trim().replace(/\D/g, "");
    if (cleanNik.length === 16 && cleanNik !== lastCheckedNikRef.current) {
      performNikLookup(cleanNik);
    }
  }, [formData.nik, performNikLookup]);

  // Lookup cadangan saat user selesai input NIK (onBlur) jika panjang >= 8
  const handleNikBlur = () => {
    const cleanNik = formData.nik.trim().replace(/\D/g, "");
    if (cleanNik.length >= 8 && cleanNik !== lastCheckedNikRef.current) {
      performNikLookup(cleanNik);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name === "nik") {
      // Hanya izinkan angka, maksimal 16 digit
      const numericVal = value.replace(/\D/g, "").slice(0, 16);
      setFormData((prev) => ({ ...prev, nik: numericVal }));

      // Reset lookup status jika NIK diubah dan berbeda dari NIK yang dicek sebelumnya
      if (numericVal !== lastCheckedNikRef.current) {
        setNikLookupStatus({ status: "idle", message: "" });
      }
      if (numericVal.length < 8) {
        lastCheckedNikRef.current = "";
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Clear error on type
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

    // 1. NIK
    const cleanNik = formData.nik.trim().replace(/\D/g, "");
    if (!formData.nik.trim()) {
      errs.nik = "Nomor Induk Kependudukan (NIK) wajib diisi";
    } else if (cleanNik.length < 8 || cleanNik.length > 16) {
      errs.nik = "NIK harus terdiri dari 8 hingga 16 digit angka";
    }

    // 2. Nama
    if (!formData.nama.trim()) {
      errs.nama = "Nama lengkap wajib diisi";
    } else if (formData.nama.trim().length < 3) {
      errs.nama = "Nama minimal 3 karakter";
    }

    // 3. Umur
    const umurNum = parseInt(formData.umur.trim(), 10);
    if (!formData.umur.trim()) {
      errs.umur = "Umur wajib diisi";
    } else if (isNaN(umurNum) || umurNum < 10 || umurNum > 120) {
      errs.umur = "Masukkan umur yang valid (10 - 120 tahun)";
    }

    // 4. Email
    if (!formData.email.trim()) {
      errs.email = "Alamat email aktif wajib diisi";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = "Format email tidak valid (contoh: pemohon@domain.com)";
    }

    // 5. WhatsApp / Nomor Telepon
    const tel = (formData.telepon || "").trim();
    if (!tel) {
      errs.telepon = "Nomor WhatsApp / telepon aktif wajib diisi";
    } else if (tel.length < 8) {
      errs.telepon = "Nomor WhatsApp minimal 8 digit";
    }

    // 6. Alamat / Asal Instansi
    if (!formData.alamatAsalInstansi.trim()) {
      errs.alamatAsalInstansi = "Alamat domisili atau asal instansi/perusahaan/kampus wajib diisi";
    } else if (formData.alamatAsalInstansi.trim().length < 5) {
      errs.alamatAsalInstansi = "Isian alamat/instansi terlalu pendek (minimal 5 karakter)";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Validasi Step 2: Detail Informasi yang Dibutuhkan
  const validateStep2 = () => {
    const errs: { [key: string]: string } = {};

    if (!formData.informasiDibutuhkan.trim()) {
      errs.informasiDibutuhkan = "Rincian informasi yang dibutuhkan wajib diisi";
    } else if (formData.informasiDibutuhkan.trim().length < 10) {
      errs.informasiDibutuhkan = "Mohon berikan rincian lebih jelas (minimal 10 karakter)";
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

    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const response = await submitPermintaanInformasiAction(formData);
      if (response.success) {
        try { localStorage.setItem("ampera_new_submission_signal", String(Date.now())); } catch {}
        setSubmissionResult(response);
        window.scrollTo({ top: 200, behavior: "smooth" });
      } else {
        setSubmitError(response.message || "Gagal menyimpan permohonan ke sistem.");
        window.scrollTo({ top: 320, behavior: "smooth" });
      }
    } catch (err) {
      console.error("Gagal mengirim permintaan informasi:", err);
      setSubmitError(
        err instanceof Error
          ? err.message
          : "Terjadi gangguan koneksi jaringan saat menyimpan data. Silakan coba kembali."
      );
      window.scrollTo({ top: 320, behavior: "smooth" });
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
      nik: "",
      nama: "",
      umur: "",
      email: "",
      alamatAsalInstansi: "",
      informasiDibutuhkan: "",
      telepon: "",
      kategoriInformasi: "Layanan Informasi Obat & Makanan",
    });
    setNikLookupStatus({ status: "idle", message: "" });
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
              Permintaan Informasi Diterima
            </span>
            <h2 className="font-brand font-extrabold text-2xl sm:text-3xl text-navy-900 dark:text-white">
              Tiket Registrasi <span className="text-brand-orange">Permintaan Informasi</span> Terbit
            </h2>
            <p className="text-sm text-ink-soft dark:text-slate-400 mt-2">
              Simpan kode registrasi berikut untuk melacak status tanggapan resmi dari petugas BBPOM di Palembang.
            </p>

            {/* Kode Pengajuan Box */}
            <div className="mt-6 p-4 rounded-2xl bg-orange-50/70 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800/60 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-left">
                <span className="text-xs uppercase tracking-wider font-semibold text-brand-orange-600 dark:text-orange-400">
                  Kode Registrasi Resmi
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
                <span>Identitas Pemohon</span>
              </h3>
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 space-y-2.5">
                <div>
                  <span className="text-xs text-ink-soft dark:text-slate-400 block">NIK Pemohon:</span>
                  <span className="font-mono font-bold text-navy-900 dark:text-white">
                    {submissionResult.data.nik}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-ink-soft dark:text-slate-400 block">Nama Lengkap:</span>
                  <span className="font-semibold text-navy-900 dark:text-white">
                    {submissionResult.data.nama}
                  </span>
                </div>
                <div className="flex gap-6">
                  <div>
                    <span className="text-xs text-ink-soft dark:text-slate-400 block">Umur:</span>
                    <span className="font-semibold text-navy-900 dark:text-white">
                      {submissionResult.data.umur} Tahun
                    </span>
                  </div>
                  {submissionResult.data.telepon && (
                    <div>
                      <span className="text-xs text-ink-soft dark:text-slate-400 block">Telepon / WhatsApp:</span>
                      <span className="font-semibold text-navy-900 dark:text-white">
                        {submissionResult.data.telepon}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <span className="text-xs text-ink-soft dark:text-slate-400 block">Email Pengiriman Tanggapan:</span>
                  <span className="font-semibold text-navy-900 dark:text-white">
                    {submissionResult.data.email}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-ink-soft dark:text-slate-400 block">Alamat / Asal Instansi:</span>
                  <span className="font-semibold text-navy-900 dark:text-white">
                    {submissionResult.data.alamatAsalInstansi}
                  </span>
                </div>
              </div>
            </div>

            {/* Sisi Kanan: Rincian Permintaan Informasi */}
            <div className="space-y-4">
              <h3 className="font-brand font-bold text-base text-navy-900 dark:text-white flex items-center gap-2">
                <FileQuestion className="w-4 h-4 text-brand-orange" />
                <span>Rincian Informasi</span>
              </h3>
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 space-y-2.5">
                <div>
                  <span className="text-xs text-ink-soft dark:text-slate-400 block">Estimasi Waktu Tanggapan:</span>
                  <span className="font-semibold text-navy-900 dark:text-white">
                    {submissionResult.data.estimasiPenyelesaian || "1 - 3 Hari Kerja"}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-ink-soft dark:text-slate-400 block">Informasi yang Dibutuhkan:</span>
                  <p className="font-normal text-slate-700 dark:text-slate-300 leading-relaxed text-xs sm:text-[13px] italic bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800 mt-1 whitespace-pre-line">
                    "{submissionResult.data.informasiDibutuhkan}"
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Petunjuk Langkah Selanjutnya */}
          <div className="relative py-6 bg-sky-50/60 dark:bg-sky-950/20 rounded-2xl p-5 my-6 border border-sky-100 dark:border-sky-900/40">
            <h4 className="font-brand font-bold text-sm text-navy-900 dark:text-white flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-sky-500" />
              <span>Petunjuk Prosedur Pelayanan Informasi:</span>
            </h4>
            <ol className="list-decimal list-inside text-xs sm:text-sm text-slate-700 dark:text-slate-300 space-y-1.5 leading-relaxed">
              <li>
                Permintaan Anda telah masuk ke sistem <strong>Layanan Konsultasi & Permintaan Informasi BBPOM Palembang</strong>.
              </li>
              <li>
                Petugas verifikator BBPOM Palembang akan menelaah pertanyaan Anda dalam estimasi <strong>1 hingga 3 hari kerja</strong>.
              </li>
              <li>
                Jawaban resmi, dokumen penjelasan, atau panduan regulasi akan dikirimkan langsung ke email <strong>{submissionResult.data.email}</strong>.
              </li>
              <li>
                Bila memerlukan konsultasi tatap muka, Anda dapat mendatangi <strong>Loket Pelayanan Publik Terpadu BBPOM Palembang di Jakabaring</strong> dengan membawa bukti pendaftaran ini.
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
                <span>Ajukan Permintaan Lain</span>
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
  // TAMPILAN FORM UTAMA DENGAN STEPPER (SESUAI DESAIN PENGUJIAN CEPAT)
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

              {/* Step 2: Detail Informasi */}
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
                  Informasi Dibutuhkan
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

            {/* Step 2: Detail Informasi */}
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
                Informasi Dibutuhkan
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

        {/* Alert Error jika ada kendala saat submit ke database */}
        {submitError && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
            <div className="text-sm">
              <p className="font-bold">Pengajuan Gagal Diproses</p>
              <p className="mt-0.5 text-xs text-rose-700 dark:text-rose-300">{submitError}</p>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* 2. FORM BODY BERDASARKAN CURRENT STEP                               */}
        {/* =================================================================== */}
        <form onSubmit={handleSubmit} noValidate>
          {/* --------------------------------------------------------------- */}
          {/* STEP 1: DATA PEMOHON (NIK, NAMA, UMUR, EMAIL, ALAMAT/INSTANSI)  */}
          {/* --------------------------------------------------------------- */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fade-up">
              <div className="border-b border-slate-100 dark:border-slate-800/80 pb-3">
                <h3 className="font-brand font-bold text-lg text-navy-900 dark:text-white">
                  Data Identitas Pemohon
                </h3>
                <p className="text-xs sm:text-sm text-ink-soft dark:text-slate-400 mt-0.5">
                  Masukkan data diri Anda untuk keperluan registrasi permohonan informasi dan pengiriman tanggapan resmi.
                </p>
              </div>

              {/* Status NIK Lookup Notification */}
              {nikLookupStatus.status === "found" && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs sm:text-sm text-emerald-700 dark:text-emerald-300 flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>{nikLookupStatus.message}</span>
                </div>
              )}
              {nikLookupStatus.status === "not_found" && (
                <div className="p-3.5 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-xs sm:text-sm text-sky-800 dark:text-sky-300 flex items-center gap-2.5">
                  <Info className="w-4 h-4 shrink-0 text-sky-600 dark:text-sky-400" />
                  <span>{nikLookupStatus.message}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                {/* Field 1: NIK (Nomor Induk Kependudukan) */}
                <div className="md:col-span-2">
                  <div className="flex items-center justify-between mb-2">
                    <label
                      htmlFor="nik"
                      className="block text-xs sm:text-[13px] font-bold text-navy-900 dark:text-slate-200"
                    >
                      NIK (Nomor Induk Kependudukan) <span className="text-red-500">*</span>
                    </label>
                    {isCheckingNik && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-sky-600 dark:text-sky-400">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Mengecek NIK otomatis...
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      id="nik"
                      name="nik"
                      type="text"
                      inputMode="numeric"
                      maxLength={16}
                      value={formData.nik}
                      onChange={handleChange}
                      onBlur={handleNikBlur}
                      placeholder="Masukkan 16 digit NIK KTP Anda"
                      className={`w-full rounded-2xl border bg-white dark:bg-slate-950 px-4 py-3.5 pr-11 text-sm text-navy-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden transition-all duration-200 ${
                        errors.nik
                          ? "border-red-400 focus:ring-2 focus:ring-red-400/20"
                          : nikLookupStatus.status === "found"
                          ? "border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
                          : "border-slate-200 dark:border-slate-700/80 focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20"
                      }`}
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                      {isCheckingNik ? (
                        <Loader2 className="w-5 h-5 animate-spin text-sky-600 dark:text-sky-400" />
                      ) : nikLookupStatus.status === "found" ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : null}
                    </div>
                  </div>
                  {errors.nik ? (
                    <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{errors.nik}</span>
                    </p>
                  ) : (
                    <p className="mt-1 text-[11px] sm:text-xs text-ink-soft dark:text-slate-400">
                      Masukkan 16 digit NIK KTP. Data identitas Anda akan otomatis terisi jika sudah pernah terdaftar di BBPOM.
                    </p>
                  )}
                </div>

                {/* Field 2: Nama Lengkap */}
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
                      placeholder="Masukkan nama lengkap sesuai KTP"
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

                {/* Field 3: Umur */}
                <div>
                  <label
                    htmlFor="umur"
                    className="block text-xs sm:text-[13px] font-bold text-navy-900 dark:text-slate-200 mb-2"
                  >
                    Umur (Tahun) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="umur"
                      name="umur"
                      type="number"
                      min="10"
                      max="120"
                      value={formData.umur}
                      onChange={handleChange}
                      placeholder="Contoh: 28"
                      className={`w-full rounded-2xl border bg-white dark:bg-slate-950 px-4 py-3.5 text-sm text-navy-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden transition-all duration-200 ${
                        errors.umur
                          ? "border-red-400 focus:ring-2 focus:ring-red-400/20"
                          : "border-slate-200 dark:border-slate-700/80 focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20"
                      }`}
                    />
                  </div>
                  {errors.umur && (
                    <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{errors.umur}</span>
                    </p>
                  )}
                </div>

                {/* Field 4: Email Aktif */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs sm:text-[13px] font-bold text-navy-900 dark:text-slate-200 mb-2"
                  >
                    Email Aktif <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="nama@email.com (Untuk pengiriman jawaban)"
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

                {/* Field 5: WhatsApp / Nomor Telepon (Wajib) */}
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
                  {errors.telepon ? (
                    <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{errors.telepon}</span>
                    </p>
                  ) : (
                    <p className="mt-1 text-[11px] text-ink-soft dark:text-slate-400">
                      Untuk konfirmasi cepat dan pengiriman notifikasi tindak lanjut permohonan.
                    </p>
                  )}
                </div>

                {/* Field 6: Alamat / Asal Instansi (Wajib Sesuai Prompt) */}
                <div className="md:col-span-2">
                  <label
                    htmlFor="alamatAsalInstansi"
                    className="block text-xs sm:text-[13px] font-bold text-navy-900 dark:text-slate-200 mb-2"
                  >
                    Alamat / Asal Instansi <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="alamatAsalInstansi"
                      name="alamatAsalInstansi"
                      type="text"
                      value={formData.alamatAsalInstansi}
                      onChange={handleChange}
                      placeholder="Contoh: Jl. Sudirman No. 45 Palembang / UMKM Kerupuk Kemplang / Universitas Sriwijaya"
                      className={`w-full rounded-2xl border bg-white dark:bg-slate-950 px-4 py-3.5 text-sm text-navy-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden transition-all duration-200 ${
                        errors.alamatAsalInstansi
                          ? "border-red-400 focus:ring-2 focus:ring-red-400/20"
                          : "border-slate-200 dark:border-slate-700/80 focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20"
                      }`}
                    />
                  </div>
                  {errors.alamatAsalInstansi ? (
                    <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{errors.alamatAsalInstansi}</span>
                    </p>
                  ) : (
                    <p className="mt-1 text-[11px] text-ink-soft dark:text-slate-400">
                      Tuliskan alamat domisili Anda atau nama perusahaan/instansi/organisasi tempat Anda bernaung.
                    </p>
                  )}
                </div>
              </div>

              {/* Action Button Step 1 */}
              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-[#ff8a1f] to-[#f26a0f] text-sm font-bold text-white shadow-cta hover:shadow-lg transition-all cursor-pointer w-full sm:w-auto"
                >
                  <span>Lanjutkan ke Rincian Informasi</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* --------------------------------------------------------------- */}
          {/* STEP 2: DETAIL INFORMASI YANG DIBUTUHKAN                        */}
          {/* --------------------------------------------------------------- */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fade-up">
              <div className="border-b border-slate-100 dark:border-slate-800/80 pb-3">
                <h3 className="font-brand font-bold text-lg text-navy-900 dark:text-white">
                  Informasi yang Dibutuhkan
                </h3>
                <p className="text-xs sm:text-sm text-ink-soft dark:text-slate-400 mt-0.5">
                  Uraikan secara jelas regulasi, konsultasi perizinan, sertifikasi, atau data obat & makanan yang Anda butuhkan.
                </p>
              </div>

              <div className="space-y-5">
                {/* Field: Informasi yang Dibutuhkan */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label
                      htmlFor="informasiDibutuhkan"
                      className="block text-xs sm:text-[13px] font-bold text-navy-900 dark:text-slate-200"
                    >
                      Informasi yang Dibutuhkan <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[11px] text-ink-soft dark:text-slate-400">
                      {formData.informasiDibutuhkan.length} karakter (min. 10)
                    </span>
                  </div>
                  <div className="relative">
                    <textarea
                      id="informasiDibutuhkan"
                      name="informasiDibutuhkan"
                      rows={5}
                      value={formData.informasiDibutuhkan}
                      onChange={handleChange}
                      placeholder="Jelaskan pertanyaan atau informasi yang Anda butuhkan secara terperinci. Contoh: Kami pelaku usaha UMKM pempek beku ingin menanyakan persyaratan cara memperoleh izin edar BPOM MD dan sertifikasi CPPOB di Palembang..."
                      className={`w-full rounded-2xl border bg-white dark:bg-slate-950 p-4 text-sm text-navy-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden transition-all duration-200 leading-relaxed ${
                        errors.informasiDibutuhkan
                          ? "border-red-400 focus:ring-2 focus:ring-red-400/20"
                          : "border-slate-200 dark:border-slate-700/80 focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20"
                      }`}
                    />
                  </div>
                  {errors.informasiDibutuhkan ? (
                    <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{errors.informasiDibutuhkan}</span>
                    </p>
                  ) : (
                    <p className="mt-1.5 text-[11px] sm:text-xs text-ink-soft dark:text-slate-400 flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-brand-orange shrink-0" />
                      <span>
                        Semakin lengkap rincian pertanyaan Anda, semakin cepat dan akurat tim BBPOM menyusun jawaban regulasi.
                      </span>
                    </p>
                  )}
                </div>

                {/* Tips Box */}
                <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-xs sm:text-sm text-amber-900 dark:text-amber-200">
                  <span className="font-bold block mb-1">Pedoman Layanan Informasi BBPOM Palembang:</span>
                  <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300 text-xs">
                    <li>Layanan informasi tidak dipungut biaya (GRATIS).</li>
                    <li>Untuk permohonan salinan dokumen publik resmi PPID, Anda juga dapat mengakses formulir Keterbukaan Informasi.</li>
                    <li>Jawaban resmi akan disampaikan melalui email pendaftar dalam 1 - 3 hari kerja.</li>
                  </ul>
                </div>
              </div>

              {/* Action Buttons Step 2 */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full border border-slate-200 dark:border-slate-700 text-sm font-bold text-navy-900 dark:text-white hover:border-brand-orange hover:text-brand-orange transition-colors cursor-pointer w-full sm:w-auto"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Kembali</span>
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-[#ff8a1f] to-[#f26a0f] text-sm font-bold text-white shadow-cta hover:shadow-lg transition-all cursor-pointer w-full sm:w-auto"
                >
                  <span>Lanjutkan ke Konfirmasi</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* --------------------------------------------------------------- */}
          {/* STEP 3: REVIEW KONFIRMASI & SUBMIT                              */}
          {/* --------------------------------------------------------------- */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fade-up">
              <div className="border-b border-slate-100 dark:border-slate-800/80 pb-3">
                <h3 className="font-brand font-bold text-lg text-navy-900 dark:text-white">
                  Konfirmasi Pengajuan Informasi
                </h3>
                <p className="text-xs sm:text-sm text-ink-soft dark:text-slate-400 mt-0.5">
                  Mohon periksa kembali kelengkapan data yang Anda masukkan sebelum mengirim formulir ke BBPOM Palembang.
                </p>
              </div>

              {/* Review Card 1: Data Identitas Pemohon */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-brand font-bold text-sm text-navy-900 dark:text-white flex items-center gap-2">
                    <User className="w-4 h-4 text-brand-orange" />
                    <span>Data Pemohon</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="text-xs font-bold text-brand-orange hover:underline cursor-pointer"
                  >
                    Ubah
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                  <div>
                    <span className="text-ink-soft dark:text-slate-400 block text-xs">NIK:</span>
                    <span className="font-mono font-bold text-navy-900 dark:text-white">
                      {formData.nik}
                    </span>
                  </div>
                  <div>
                    <span className="text-ink-soft dark:text-slate-400 block text-xs">Nama Lengkap:</span>
                    <span className="font-semibold text-navy-900 dark:text-white">
                      {formData.nama}
                    </span>
                  </div>
                  <div>
                    <span className="text-ink-soft dark:text-slate-400 block text-xs">Umur:</span>
                    <span className="font-semibold text-navy-900 dark:text-white">
                      {formData.umur} Tahun
                    </span>
                  </div>
                  <div>
                    <span className="text-ink-soft dark:text-slate-400 block text-xs">Email Aktif:</span>
                    <span className="font-semibold text-navy-900 dark:text-white">
                      {formData.email}
                    </span>
                  </div>
                  <div>
                    <span className="text-ink-soft dark:text-slate-400 block text-xs">Nomor WhatsApp / Telepon:</span>
                    <span className="font-semibold text-navy-900 dark:text-white">
                      {formData.telepon}
                    </span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-ink-soft dark:text-slate-400 block text-xs">Alamat / Asal Instansi:</span>
                    <span className="font-semibold text-navy-900 dark:text-white">
                      {formData.alamatAsalInstansi}
                    </span>
                  </div>
                </div>
              </div>

              {/* Review Card 2: Informasi yang Dibutuhkan */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-brand font-bold text-sm text-navy-900 dark:text-white flex items-center gap-2">
                    <FileQuestion className="w-4 h-4 text-brand-orange" />
                    <span>Informasi yang Diminta</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="text-xs font-bold text-brand-orange hover:underline cursor-pointer"
                  >
                    Ubah
                  </button>
                </div>
                <div className="space-y-2 text-xs sm:text-sm">
                  <div>
                    <span className="text-ink-soft dark:text-slate-400 block text-xs">Informasi yang Dibutuhkan:</span>
                    <p className="font-normal text-slate-800 dark:text-slate-200 leading-relaxed bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800 mt-1 whitespace-pre-line">
                      "{formData.informasiDibutuhkan}"
                    </p>
                  </div>
                </div>
              </div>

              {/* Checkbox Deklarasi */}
              <div className="p-4 rounded-2xl bg-sky-50/60 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900/40 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  Saya menyatakan bahwa data identitas yang saya masukkan adalah sah dan benar, serta informasi yang diminta akan dipergunakan secara bertanggung jawab sesuai peraturan perundang-undangan.
                </p>
              </div>

              {/* Action Buttons Step 3 */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full border border-slate-200 dark:border-slate-700 text-sm font-bold text-navy-900 dark:text-white hover:border-brand-orange hover:text-brand-orange transition-colors cursor-pointer w-full sm:w-auto disabled:opacity-50"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Kembali</span>
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center gap-2 px-9 py-3.5 rounded-full bg-gradient-to-r from-[#ff8a1f] to-[#f26a0f] text-sm font-bold text-white shadow-cta hover:shadow-lg transition-all cursor-pointer w-full sm:w-auto disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Mengirimkan Permintaan...</span>
                    </>
                  ) : (
                    <>
                      <span>Kirim Permintaan Informasi</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Overlay Loading Layar Penuh saat Proses Menyimpan */}
      <ServiceSavingOverlay
        isOpen={isSubmitting}
        serviceName="Permintaan Informasi BBPOM"
        title="Menyimpan Permintaan Informasi..."
        description="Sistem sedang mengenkripsi data pemohon, menyimpan rincian permintaan informasi ke server BBPOM di Palembang, dan menerbitkan kode tiket resmi Anda."
        hasFileUpload={false}
      />
    </div>
  );
}

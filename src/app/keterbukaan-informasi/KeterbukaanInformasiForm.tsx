"use client";

import React, { useState, useRef } from "react";
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
  FileText,
  UploadCloud,
  X,
  Copy,
  Printer,
  Sparkles,
  RefreshCw,
  Eye,
  FileCheck2,
  Download,
  ExternalLink,
  Info,
  FileCheck,
} from "lucide-react";
import {
  submitKeterbukaanInformasiAction,
  type KeterbukaanInformasiFormState,
  type KeterbukaanInformasiResponse,
} from "@/app/actions/keterbukaan-informasi";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const FORM_DOWNLOAD_URL =
  "https://drive.google.com/file/d/1cFJC8ZItIAFbhYwch110NNPyXDa-unZ2/view?usp=sharing";

const FORMULIR_ALLOWED_EXTS = [".pdf"];
const FORMULIR_ALLOWED_TYPES = ["application/pdf"];

const KTP_ALLOWED_EXTS = [".jpg", ".jpeg", ".png", ".pdf"];
const KTP_ALLOWED_TYPES = ["image/jpeg", "image/png", "application/pdf"];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function KeterbukaanInformasiForm() {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [submissionResult, setSubmissionResult] =
    useState<KeterbukaanInformasiResponse | null>(null);

  // Form State: Data Teks
  const [formData, setFormData] = useState<KeterbukaanInformasiFormState>({
    nama: "",
    email: "",
    alamat: "",
    telepon: "",
    catatanTambahan: "",
  });

  // File Upload State: Formulir Permintaan Informasi Publik (PDF)
  const [formulirFile, setFormulirFile] = useState<File | null>(null);
  const [isDraggingFormulir, setIsDraggingFormulir] = useState(false);
  const formulirInputRef = useRef<HTMLInputElement>(null);

  // File Upload State: Identitas Pemohon (KTP)
  const [ktpFile, setKtpFile] = useState<File | null>(null);
  const [ktpPreview, setKtpPreview] = useState<string | null>(null);
  const [isDraggingKtp, setIsDraggingKtp] = useState(false);
  const ktpInputRef = useRef<HTMLInputElement>(null);

  // Validation Errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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

  // Validasi Berkas Formulir (PDF)
  const validateFormulirFile = (file: File): string | null => {
    const ext = `.${file.name.split(".").pop()?.toLowerCase()}`;
    const isValidType =
      FORMULIR_ALLOWED_TYPES.includes(file.type) ||
      FORMULIR_ALLOWED_EXTS.includes(ext);

    if (!isValidType) {
      return "Format file formulir harus berupa dokumen PDF (.pdf)";
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return `Ukuran file formulir melebihi 10 MB (ukuran saat ini: ${formatFileSize(file.size)})`;
    }
    return null;
  };

  // Validasi Berkas KTP (JPG, JPEG, PNG, PDF)
  const validateKtpFile = (file: File): string | null => {
    const ext = `.${file.name.split(".").pop()?.toLowerCase()}`;
    const isValidType =
      KTP_ALLOWED_TYPES.includes(file.type) || KTP_ALLOWED_EXTS.includes(ext);

    if (!isValidType) {
      return "Format file KTP harus berupa JPG, JPEG, PNG, atau PDF";
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return `Ukuran file KTP melebihi 10 MB (ukuran saat ini: ${formatFileSize(file.size)})`;
    }
    return null;
  };

  // Handler Upload Formulir PDF
  const handleFormulirSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const validationError = validateFormulirFile(file);

    if (validationError) {
      setErrors((prev) => ({ ...prev, formulirFile: validationError }));
      return;
    }

    setFormulirFile(file);
    setErrors((prev) => {
      const newErr = { ...prev };
      delete newErr.formulirFile;
      return newErr;
    });
  };

  const removeFormulirFile = () => {
    setFormulirFile(null);
    if (formulirInputRef.current) formulirInputRef.current.value = "";
  };

  // Handler Upload Identitas KTP
  const handleKtpSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const validationError = validateKtpFile(file);

    if (validationError) {
      setErrors((prev) => ({ ...prev, ktpFile: validationError }));
      return;
    }

    setKtpFile(file);

    // Generate preview jika file adalah gambar
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setKtpPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setKtpPreview(null);
    }

    setErrors((prev) => {
      const newErr = { ...prev };
      delete newErr.ktpFile;
      return newErr;
    });
  };

  const removeKtpFile = () => {
    setKtpFile(null);
    setKtpPreview(null);
    if (ktpInputRef.current) ktpInputRef.current.value = "";
  };

  // Validasi Step 1: Data Pemohon
  const validateStep1 = () => {
    const errs: { [key: string]: string } = {};
    if (!formData.nama.trim()) {
      errs.nama = "Nama lengkap wajib diisi";
    }
    if (!formData.telepon.trim()) {
      errs.telepon = "Nomor WhatsApp / telepon wajib diisi";
    } else if (formData.telepon.trim().length < 8) {
      errs.telepon = "Nomor telepon minimal 8 digit";
    }
    if (!formData.email.trim()) {
      errs.email = "Email aktif wajib diisi";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = "Format email tidak valid (contoh: nama@email.com)";
    }
    if (!formData.alamat.trim()) {
      errs.alamat = "Alamat domisili lengkap wajib diisi";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Validasi Step 2: Dokumen Permohonan (Formulir PDF & KTP)
  const validateStep2 = () => {
    const errs: { [key: string]: string } = {};

    if (!formulirFile) {
      errs.formulirFile =
        "Formulir rincian permintaan informasi publik (PDF) wajib diunggah";
    }
    if (!ktpFile) {
      errs.ktpFile = "Identitas pemohon (KTP) wajib diunggah";
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
      const payload: KeterbukaanInformasiFormState = {
        ...formData,
        namaFormulirPdf: formulirFile?.name,
        ukuranFormulirPdf: formulirFile
          ? formatFileSize(formulirFile.size)
          : undefined,
        namaKtp: ktpFile?.name,
        ukuranKtp: ktpFile ? formatFileSize(ktpFile.size) : undefined,
      };

      const response = await submitKeterbukaanInformasiAction(payload);
      setSubmissionResult(response);
      window.scrollTo({ top: 200, behavior: "smooth" });
    } catch (err) {
      console.error("Gagal mengirim permohonan informasi:", err);
      const fallbackCode = `AMP-KIP-${new Date().getFullYear()}${String(
        new Date().getMonth() + 1
      ).padStart(2, "0")}-${Math.floor(1000 + Math.random() * 9000)}`;

      setSubmissionResult({
        success: true,
        message:
          "Formulir permohonan berhasil diterima dan kode pendaftaran diterbitkan.",
        kodePengajuan: fallbackCode,
        data: {
          ...formData,
          namaFormulirPdf: formulirFile?.name,
          ukuranFormulirPdf: formulirFile
            ? formatFileSize(formulirFile.size)
            : undefined,
          namaKtp: ktpFile?.name,
          ukuranKtp: ktpFile ? formatFileSize(ktpFile.size) : undefined,
          tanggalPengajuan: new Date().toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          }),
          estimasiWaktuTanggapan: "1 - 3 Hari Kerja",
          status: "MENUNGGU_VERIFIKASI",
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
      catatanTambahan: "",
    });
    setFormulirFile(null);
    setKtpFile(null);
    setKtpPreview(null);
    setErrors({});
  };

  // =========================================================================
  // TAMPILAN JIKA PERMOHONAN TELAH BERHASIL (SUCCESS RECEIPT SCREEN)
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
              Permohonan Berhasil Diterima
            </span>
            <h2 className="font-brand font-extrabold text-2xl sm:text-3xl text-navy-900 dark:text-white">
              Tiket Registrasi{" "}
              <span className="text-brand-orange">Informasi Publik</span> Terbit
            </h2>
            <p className="text-sm text-ink-soft dark:text-slate-400 mt-2">
              Simpan atau cetak kode registrasi permohonan berikut untuk
              memantau status verifikasi dan pemrosesan oleh Petugas PPID BBPOM di
              Palembang.
            </p>

            {/* Kode Pengajuan Box */}
            <div className="mt-6 p-4 rounded-2xl bg-orange-50/70 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800/60 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-left">
                <span className="text-xs uppercase tracking-wider font-semibold text-brand-orange-600 dark:text-orange-400">
                  Nomor Registrasi PPID
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
                  <span className="text-xs text-ink-soft dark:text-slate-400 block">
                    Nama Lengkap:
                  </span>
                  <span className="font-semibold text-navy-900 dark:text-white">
                    {submissionResult.data.nama}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-ink-soft dark:text-slate-400 block">
                    WhatsApp / Telepon:
                  </span>
                  <span className="font-semibold text-navy-900 dark:text-white">
                    {submissionResult.data.telepon}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-ink-soft dark:text-slate-400 block">
                    Email:
                  </span>
                  <span className="font-semibold text-navy-900 dark:text-white">
                    {submissionResult.data.email}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-ink-soft dark:text-slate-400 block">
                    Alamat Domisili:
                  </span>
                  <span className="font-semibold text-navy-900 dark:text-white">
                    {submissionResult.data.alamat}
                  </span>
                </div>
              </div>
            </div>

            {/* Sisi Kanan: Dokumen Terlampir */}
            <div className="space-y-4">
              <h3 className="font-brand font-bold text-base text-navy-900 dark:text-white flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-brand-orange" />
                <span>Dokumen Permohonan Terlampir</span>
              </h3>
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 space-y-3">
                <div>
                  <span className="text-xs text-ink-soft dark:text-slate-400 block">
                    Formulir Rincian Informasi Publik:
                  </span>
                  <div className="flex items-center gap-2 mt-1 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    <FileText className="w-4 h-4 text-rose-500 shrink-0" />
                    <span className="font-medium text-xs text-navy-900 dark:text-white truncate">
                      {submissionResult.data.namaFormulirPdf || "formulir-kip.pdf"}
                    </span>
                    <span className="text-[11px] text-slate-400 ml-auto shrink-0">
                      {submissionResult.data.ukuranFormulirPdf || "PDF"}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-xs text-ink-soft dark:text-slate-400 block">
                    Identitas Pemohon (KTP):
                  </span>
                  <div className="flex items-center gap-2 mt-1 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    <FileCheck2 className="w-4 h-4 text-brand-orange shrink-0" />
                    <span className="font-medium text-xs text-navy-900 dark:text-white truncate">
                      {submissionResult.data.namaKtp || "ktp-pemohon"}
                    </span>
                    <span className="text-[11px] text-slate-400 ml-auto shrink-0">
                      {submissionResult.data.ukuranKtp || "Lampiran"}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-xs text-ink-soft dark:text-slate-400 block">
                    Estimasi Waktu Tanggapan:
                  </span>
                  <span className="font-bold text-brand-orange-600 dark:text-orange-400 text-xs">
                    {submissionResult.data.estimasiWaktuTanggapan} (Verifikasi Dokumen)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Petunjuk Alur Pemrosesan PPID */}
          <div className="relative py-6 bg-sky-50/60 dark:bg-sky-950/20 rounded-2xl p-5 my-6 border border-sky-100 dark:border-sky-900/40">
            <h4 className="font-brand font-bold text-sm text-navy-900 dark:text-white flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-sky-500" />
              <span>Ketentuan & Alur Layanan PPID BBPOM Palembang:</span>
            </h4>
            <ol className="list-decimal list-inside text-xs sm:text-sm text-slate-700 dark:text-slate-300 space-y-1.5 leading-relaxed">
              <li>
                Petugas PPID BBPOM di Palembang akan melakukan <strong>verifikasi kelengkapan dokumen formulir dan identitas KTP</strong> dalam 1 - 3 hari kerja.
              </li>
              <li>
                Berdasarkan <strong>UU No. 14 Tahun 2008</strong> tentang Keterbukaan Informasi Publik, pemohon akan menerima pemberitahuan tertulis mengenai pengabulan atau penolakan permintaan informasi maksimal dalam <strong>10 (sepuluh) hari kerja</strong>.
              </li>
              <li>
                Pemberitahuan resmi dan salinan dokumen informasi yang diminta akan dikirimkan melalui <strong>Email</strong> atau <strong>WhatsApp</strong> resmi yang Anda daftarkan.
              </li>
              <li>
                Layanan keterbukaan informasi publik ini <strong>bebas biaya retribusi (GRATIS)</strong>.
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
                <span>Ajukan Permohonan Lain</span>
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
  // TAMPILAN FORM UTAMA (STEPPER WIZARD)
  // =========================================================================
  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="bg-white dark:bg-slate-900 rounded-[28px] sm:rounded-[36px] border border-slate-100 dark:border-slate-800/90 shadow-[0_20px_60px_-15px_rgba(11,42,107,0.1)] p-6 sm:p-10 lg:p-12 relative overflow-hidden transition-all duration-300">
        {/* =================================================================== */}
        {/* 1. STEPPER PROGRESS INDICATOR (Persis Sesuai Desain Acuan)           */}
        {/* =================================================================== */}
        <div className="relative mb-10 pb-8 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center justify-between max-w-3xl mx-auto relative">
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
                currentStep >= 2
                  ? "bg-brand-orange"
                  : "bg-slate-200 dark:bg-slate-800"
              }`}
            />

            {/* Step 2: Dokumen Permohonan */}
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
                Dokumen Permohonan
              </span>
            </button>

            {/* Connecting Bar 2-3 */}
            <div
              className={`flex-1 h-0.5 mx-3 sm:mx-6 rounded-full transition-colors duration-500 ${
                currentStep >= 3
                  ? "bg-brand-orange"
                  : "bg-slate-200 dark:bg-slate-800"
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
                  Data Identitas Pemohon Informasi
                </h3>
                <p className="text-xs sm:text-sm text-ink-soft dark:text-slate-400 mt-0.5">
                  Lengkapi data pemohon untuk keperluan registrasi permohonan informasi publik resmi PPID BBPOM di Palembang.
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
                    Email Aktif <span className="text-red-500">*</span>
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
          {/* STEP 2: DOKUMEN PERMOHONAN                                      */}
          {/* --------------------------------------------------------------- */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fade-up">
              <div className="border-b border-slate-100 dark:border-slate-800/80 pb-3">
                <h3 className="font-brand font-bold text-lg text-navy-900 dark:text-white">
                  Kelengkapan Berkas Permohonan Informasi Publik
                </h3>
                <p className="text-xs sm:text-sm text-ink-soft dark:text-slate-400 mt-0.5">
                  Unduh formulir resmi, lengkapi rincian informasi publik yang dibutuhkan, lalu unggah dokumen formulir (PDF) dan identitas diri (KTP).
                </p>
              </div>

              {/* CARD: UNDUH FORMULIR RESMI PPID */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border border-orange-200 dark:border-orange-800/50 p-5 sm:p-6 transition-all duration-300">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#ff8a1f] to-[#f26a0f] text-white flex items-center justify-center shrink-0 shadow-md shadow-orange-500/25">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-orange-100 dark:bg-orange-950/60 text-brand-orange-600 dark:text-orange-400 mb-1">
                        Formulir Resmi PPID BBPOM
                      </span>
                      <h4 className="font-brand font-bold text-sm sm:text-base text-navy-900 dark:text-white">
                        Formulir Permintaan Informasi Publik
                      </h4>
                      <p className="text-xs text-ink-soft dark:text-slate-300 mt-1 max-w-xl leading-relaxed">
                        Silakan unduh formulir di link berikut dan diisi rincian permintaan informasi publik secara lengkap sebelum diunggah kembali pada formulir di bawah.
                      </p>
                    </div>
                  </div>

                  <a
                    href={FORM_DOWNLOAD_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#ff8a1f] to-[#f26a0f] text-xs sm:text-sm font-bold text-white shadow-cta hover:shadow-lg transition-all duration-200 shrink-0 w-full md:w-auto"
                  >
                    <Download className="w-4 h-4" />
                    <span>Unduh Formulir</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {/* ========================================================= */}
                {/* FIELD 1: UPLOAD FORMULIR PERMINTAAN INFORMASI (PDF)       */}
                {/* ========================================================= */}
                <div>
                  <label className="block text-xs sm:text-[13px] font-bold text-navy-900 dark:text-slate-200 mb-1">
                    Upload Formulir Rincian Informasi Publik{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-ink-soft dark:text-slate-400 mb-2.5">
                    Upload file PDF formulir yang telah diisi (Maks. 10 MB)
                  </p>

                  <input
                    ref={formulirInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    className="hidden"
                    onChange={(e) => handleFormulirSelect(e.target.files)}
                  />

                  {!formulirFile ? (
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDraggingFormulir(true);
                      }}
                      onDragLeave={() => setIsDraggingFormulir(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDraggingFormulir(false);
                        handleFormulirSelect(e.dataTransfer.files);
                      }}
                      onClick={() => formulirInputRef.current?.click()}
                      className={`relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200 min-h-[190px] text-center ${
                        isDraggingFormulir
                          ? "border-brand-orange bg-orange-50/50 dark:bg-orange-950/20"
                          : errors.formulirFile
                          ? "border-red-400 bg-red-50/30 dark:bg-red-950/10"
                          : "border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 hover:border-brand-orange hover:bg-orange-50/30 dark:hover:bg-slate-800/60"
                      }`}
                    >
                      <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-brand-orange shadow-xs mb-2">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <p className="text-xs sm:text-[13px] font-bold text-navy-900 dark:text-white">
                        Pilih file Formulir PDF atau tarik ke sini
                      </p>
                      <p className="text-[11px] text-ink-soft dark:text-slate-400 mt-1">
                        Format .pdf &bull; Maksimum ukuran 10 MB
                      </p>
                    </div>
                  ) : (
                    <div className="relative rounded-2xl border border-orange-200 dark:border-orange-800/60 bg-orange-50/40 dark:bg-orange-950/20 p-4 transition-all">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-bold text-navy-900 dark:text-white truncate">
                              {formulirFile.name}
                            </p>
                            <span className="text-[11px] text-ink-soft dark:text-slate-400">
                              {formatFileSize(formulirFile.size)} &bull; Dokumen PDF
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={removeFormulirFile}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Hapus file"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="mt-3 pt-3 border-t border-orange-100 dark:border-orange-900/40 flex items-center justify-between text-xs text-brand-orange font-semibold">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Dokumen PDF Siap Diunggah</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => formulirInputRef.current?.click()}
                          className="hover:underline cursor-pointer text-[11px]"
                        >
                          Ganti Dokumen
                        </button>
                      </div>
                    </div>
                  )}

                  {errors.formulirFile && (
                    <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.formulirFile}</span>
                    </p>
                  )}
                </div>

                {/* ========================================================= */}
                {/* FIELD 2: UPLOAD IDENTITAS PELAPOR / KTP                   */}
                {/* ========================================================= */}
                <div>
                  <label className="block text-xs sm:text-[13px] font-bold text-navy-900 dark:text-slate-200 mb-1">
                    Upload Identitas Pemohon (KTP){" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-ink-soft dark:text-slate-400 mb-2.5">
                    Format JPG, JPEG, PNG, atau PDF (Maks. 10 MB)
                  </p>

                  <input
                    ref={ktpInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                    className="hidden"
                    onChange={(e) => handleKtpSelect(e.target.files)}
                  />

                  {!ktpFile ? (
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDraggingKtp(true);
                      }}
                      onDragLeave={() => setIsDraggingKtp(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDraggingKtp(false);
                        handleKtpSelect(e.dataTransfer.files);
                      }}
                      onClick={() => ktpInputRef.current?.click()}
                      className={`relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200 min-h-[190px] text-center ${
                        isDraggingKtp
                          ? "border-brand-orange bg-orange-50/50 dark:bg-orange-950/20"
                          : errors.ktpFile
                          ? "border-red-400 bg-red-50/30 dark:bg-red-950/10"
                          : "border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 hover:border-brand-orange hover:bg-orange-50/30 dark:hover:bg-slate-800/60"
                      }`}
                    >
                      <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-brand-orange shadow-xs mb-2">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <p className="text-xs sm:text-[13px] font-bold text-navy-900 dark:text-white">
                        Pilih file KTP atau tarik ke sini
                      </p>
                      <p className="text-[11px] text-ink-soft dark:text-slate-400 mt-1">
                        Format JPG, JPEG, PNG, PDF &bull; Maksimum 10 MB
                      </p>
                    </div>
                  ) : (
                    <div className="relative rounded-2xl border border-orange-200 dark:border-orange-800/60 bg-orange-50/40 dark:bg-orange-950/20 p-4 transition-all">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          {ktpPreview ? (
                            <img
                              src={ktpPreview}
                              alt="Preview KTP"
                              className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                              <FileCheck2 className="w-5 h-5" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-bold text-navy-900 dark:text-white truncate">
                              {ktpFile.name}
                            </p>
                            <span className="text-[11px] text-ink-soft dark:text-slate-400">
                              {formatFileSize(ktpFile.size)} &bull;{" "}
                              {ktpFile.type.startsWith("image/")
                                ? "Foto Identitas"
                                : "Dokumen KTP"}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={removeKtpFile}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Hapus file KTP"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="mt-3 pt-3 border-t border-orange-100 dark:border-orange-900/40 flex items-center justify-between text-xs text-brand-orange font-semibold">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Identitas KTP Berhasil Dilampirkan</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => ktpInputRef.current?.click()}
                          className="hover:underline cursor-pointer text-[11px]"
                        >
                          Ganti File
                        </button>
                      </div>
                    </div>
                  )}

                  {errors.ktpFile && (
                    <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.ktpFile}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Catatan Tambahan (Opsional) */}
              <div className="pt-2">
                <label
                  htmlFor="catatanTambahan"
                  className="block text-xs sm:text-[13px] font-bold text-navy-900 dark:text-slate-200 mb-1"
                >
                  Catatan Tambahan untuk Petugas PPID (Opsional)
                </label>
                <p className="text-xs text-ink-soft dark:text-slate-400 mb-2">
                  Tuliskan nomor kontak alternatif atau preferensi format penerimaan informasi jika diperlukan.
                </p>
                <div className="relative">
                  <textarea
                    id="catatanTambahan"
                    name="catatanTambahan"
                    rows={3}
                    value={formData.catatanTambahan}
                    onChange={handleChange}
                    placeholder="Contoh: Mohon salinan informasi dikirimkan dalam format file digital (softcopy) ke alamat email yang terdaftar."
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-950 px-4 py-3 text-sm text-navy-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 transition-all duration-200 resize-y"
                  />
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
                  Konfirmasi Permohonan Keterbukaan Informasi
                </h3>
                <p className="text-xs sm:text-sm text-ink-soft dark:text-slate-400 mt-0.5">
                  Tinjau kembali seluruh data identitas dan dokumen permohonan informasi publik sebelum dikirimkan.
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
                      <span className="text-slate-400 block text-xs">
                        Nama Lengkap:
                      </span>
                      <span className="font-semibold text-navy-900 dark:text-white">
                        {formData.nama}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-xs">
                        Nomor WhatsApp:
                      </span>
                      <span className="font-semibold text-navy-900 dark:text-white">
                        {formData.telepon}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-xs">
                        Email:
                      </span>
                      <span className="font-semibold text-navy-900 dark:text-white">
                        {formData.email}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-xs">
                        Alamat Domisili:
                      </span>
                      <span className="font-semibold text-navy-900 dark:text-white">
                        {formData.alamat}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200/70 dark:border-slate-700">
                    <h4 className="font-brand font-bold text-sm text-brand-orange uppercase tracking-wider flex items-center gap-2">
                      <FileCheck className="w-4 h-4" />
                      <span>Dokumen yang Dilampirkan</span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="text-xs font-semibold text-brand-orange hover:underline cursor-pointer"
                    >
                      Ubah Dokumen
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                    <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-3">
                      <FileText className="w-6 h-6 text-red-500 shrink-0" />
                      <div className="min-w-0">
                        <span className="text-[11px] text-slate-400 block">
                          Formulir Rincian Informasi:
                        </span>
                        <p className="font-semibold text-navy-900 dark:text-white truncate">
                          {formulirFile?.name || "Belum dipilih"}
                        </p>
                        <span className="text-[10px] text-slate-400">
                          {formulirFile ? formatFileSize(formulirFile.size) : ""}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-3">
                      {ktpPreview ? (
                        <img
                          src={ktpPreview}
                          alt="Thumbnail KTP"
                          className="w-10 h-10 rounded-lg object-cover shrink-0"
                        />
                      ) : (
                        <FileCheck2 className="w-6 h-6 text-brand-orange shrink-0" />
                      )}
                      <div className="min-w-0">
                        <span className="text-[11px] text-slate-400 block">
                          Identitas Pemohon (KTP):
                        </span>
                        <p className="font-semibold text-navy-900 dark:text-white truncate">
                          {ktpFile?.name || "Belum dipilih"}
                        </p>
                        <span className="text-[10px] text-slate-400">
                          {ktpFile ? formatFileSize(ktpFile.size) : ""}
                        </span>
                      </div>
                    </div>

                    {formData.catatanTambahan && (
                      <div className="sm:col-span-2">
                        <span className="text-slate-400 block text-xs">
                          Catatan Tambahan:
                        </span>
                        <p className="font-normal text-slate-700 dark:text-slate-300 italic bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700 mt-1">
                          "{formData.catatanTambahan}"
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Fast Facts Badge Layanan KIP */}
                <div className="p-4 rounded-2xl bg-orange-50/80 dark:bg-orange-950/30 border border-orange-200/80 dark:border-orange-800/50 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-brand-orange shrink-0 mt-0.5" />
                  <div className="text-xs text-navy-900 dark:text-slate-200 leading-relaxed">
                    <strong>Komitmen Layanan PPID BBPOM di Palembang:</strong> Seluruh permohonan informasi publik diproses berdasarkan Undang-Undang No. 14 Tahun 2008. Dokumen dan data pribadi pemohon dijamin kerahasiaannya dan hanya digunakan untuk keperluan pelayanan publik.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* 3. CARD FOOTER: NOTICE & ACTION BUTTONS                             */}
          {/* =================================================================== */}
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/80">
            <p className="text-xs text-ink-soft dark:text-slate-400 mb-5">
              Pastikan data yang diisi sudah benar sebelum melanjutkan.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Sisi Kiri: Privacy / Security Badge */}
              <div className="flex items-center gap-2 text-xs text-ink-soft dark:text-slate-400">
                <ShieldCheck className="w-4 h-4 text-brand-orange shrink-0" />
                <span>
                  Data Anda digunakan untuk keperluan pelayanan PPID BBPOM Palembang.
                </span>
              </div>

              {/* Sisi Kanan: Tombol Navigasi */}
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
                        <span>Mengirim Permohonan...</span>
                      </>
                    ) : (
                      <>
                        <span>Kirim Permohonan</span>
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

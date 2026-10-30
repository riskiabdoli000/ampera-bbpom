"use client";

import React, { useState, useRef, useCallback } from "react";
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
  ShieldAlert,
  FileText,
  UploadCloud,
  X,
  Copy,
  Printer,
  Sparkles,
  RefreshCw,
  Eye,
  FileCheck2,
  Info,
  Loader2,
} from "lucide-react";
import {
  submitPengaduanAction,
  type PengaduanFormState,
  type PengaduanResponse,
} from "@/app/actions/pengaduan";
import { lookupNikAction } from "@/app/actions/lookup-nik";
import { ServiceSavingOverlay } from "@/components/common/ServiceSavingOverlay";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const BUKTI_ALLOWED_EXTS = [".jpg", ".jpeg", ".png"];
const BUKTI_ALLOWED_TYPES = ["image/jpeg", "image/png"];
const KTP_ALLOWED_EXTS = [".jpg", ".jpeg", ".png", ".pdf"];
const KTP_ALLOWED_TYPES = ["image/jpeg", "image/png", "application/pdf"];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function PengaduanForm() {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<PengaduanResponse | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // NIK Lookup States
  const [isCheckingNik, setIsCheckingNik] = useState(false);
  const [nikLookupStatus, setNikLookupStatus] = useState<{
    status: "idle" | "found" | "not_found";
    message: string;
  }>({ status: "idle", message: "" });

  // Form State: Data Teks
  const [formData, setFormData] = useState<PengaduanFormState>({
    nik: "",
    nama: "",
    email: "",
    alamat: "",
    telepon: "",
    isiPengaduan: "",
  });

  // File Upload State: Bukti Foto
  const [buktiFile, setBuktiFile] = useState<File | null>(null);
  const [buktiPreview, setBuktiPreview] = useState<string | null>(null);
  const [isDraggingBukti, setIsDraggingBukti] = useState(false);
  const buktiInputRef = useRef<HTMLInputElement>(null);

  // File Upload State: Identitas KTP
  const [ktpFile, setKtpFile] = useState<File | null>(null);
  const [ktpPreview, setKtpPreview] = useState<string | null>(null);
  const [isDraggingKtp, setIsDraggingKtp] = useState(false);
  const ktpInputRef = useRef<HTMLInputElement>(null);

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
            alamat: res.data?.alamat || res.data?.asalInstansi || prev.alamat,
            telepon: res.data?.telepon || prev.telepon,
          }));
          setErrors((prev) => {
            const next = { ...prev };
            delete next.nik;
            delete next.nama;
            delete next.email;
            delete next.alamat;
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

    if (name === "nik") {
      const clean = value.trim().replace(/\D/g, "");
      if (clean.length === 16) {
        performNikLookup(clean);
      } else {
        setNikLookupStatus({ status: "idle", message: "" });
      }
    }
  };

  const handleNikBlur = () => {
    const clean = formData.nik.trim().replace(/\D/g, "");
    if (clean.length >= 8) {
      performNikLookup(clean);
    }
  };

  // Validasi Berkas Bukti Kelengkapan (Foto)
  const validateBuktiFile = (file: File): string | null => {
    const ext = `.${file.name.split(".").pop()?.toLowerCase()}`;
    const isValidType =
      BUKTI_ALLOWED_TYPES.includes(file.type) || BUKTI_ALLOWED_EXTS.includes(ext);

    if (!isValidType) {
      return "Format file bukti harus berupa foto JPG, JPEG, atau PNG";
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return `Ukuran file bukti melebihi 10 MB (ukuran saat ini: ${formatFileSize(file.size)})`;
    }
    return null;
  };

  const handleBuktiChange = (file: File | null) => {
    if (!file) {
      setBuktiFile(null);
      setBuktiPreview(null);
      return;
    }

    const err = validateBuktiFile(file);
    if (err) {
      setErrors((prev) => ({ ...prev, buktiKelengkapan: err }));
      return;
    }

    // Bersihkan error jika ada
    setErrors((prev) => {
      const newErr = { ...prev };
      delete newErr.buktiKelengkapan;
      return newErr;
    });

    setBuktiFile(file);
    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setBuktiPreview(url);
    } else {
      setBuktiPreview(null);
    }
  };

  // Validasi Berkas Identitas KTP
  const validateKtpFile = (file: File): string | null => {
    const ext = `.${file.name.split(".").pop()?.toLowerCase()}`;
    const isValidType =
      KTP_ALLOWED_TYPES.includes(file.type) || KTP_ALLOWED_EXTS.includes(ext);

    if (!isValidType) {
      return "Format file identitas KTP harus berupa JPG, JPEG, PNG, atau PDF";
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return `Ukuran file identitas melebihi 10 MB (ukuran saat ini: ${formatFileSize(file.size)})`;
    }
    return null;
  };

  const handleKtpChange = (file: File | null) => {
    if (!file) {
      setKtpFile(null);
      setKtpPreview(null);
      return;
    }

    const err = validateKtpFile(file);
    if (err) {
      setErrors((prev) => ({ ...prev, identitasKtp: err }));
      return;
    }

    // Bersihkan error jika ada
    setErrors((prev) => {
      const newErr = { ...prev };
      delete newErr.identitasKtp;
      return newErr;
    });

    setKtpFile(file);
    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setKtpPreview(url);
    } else {
      setKtpPreview(null);
    }
  };

  // Drag and drop handlers untuk Bukti Foto
  const handleBuktiDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingBukti(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleBuktiChange(e.dataTransfer.files[0]);
    }
  };

  // Drag and drop handlers untuk KTP
  const handleKtpDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingKtp(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleKtpChange(e.dataTransfer.files[0]);
    }
  };

  // Validasi Step 1: Data Identitas Pelapor
  const validateStep1 = () => {
    const errs: { [key: string]: string } = {};

    const cleanNik = formData.nik.trim().replace(/\D/g, "");
    if (!formData.nik.trim()) {
      errs.nik = "Nomor Induk Kependudukan (NIK) pelapor wajib diisi";
    } else if (cleanNik.length < 8 || cleanNik.length > 16) {
      errs.nik = "NIK harus terdiri dari 8 hingga 16 digit angka";
    }

    if (!formData.nama.trim()) {
      errs.nama = "Nama lengkap pelapor wajib diisi";
    }
    if (!formData.telepon.trim()) {
      errs.telepon = "Nomor WhatsApp / telepon wajib diisi";
    } else if (formData.telepon.trim().replace(/\D/g, "").length < 8) {
      errs.telepon = "Nomor telepon minimal 8 digit angka";
    }
    if (!formData.email.trim()) {
      errs.email = "Email aktif pelapor wajib diisi";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = "Format email tidak valid (contoh: nama@email.com)";
    }
    if (!formData.alamat.trim()) {
      errs.alamat = "Alamat domisili lengkap wajib diisi";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Validasi Step 2: Detail Pengaduan & Berkas
  const validateStep2 = () => {
    const errs: { [key: string]: string } = {};
    if (!formData.isiPengaduan.trim()) {
      errs.isiPengaduan = "Isi uraian pengaduan wajib diisi";
    } else if (formData.isiPengaduan.trim().length < 10) {
      errs.isiPengaduan = "Uraikan pengaduan lebih jelas dan rinci (minimal 10 karakter)";
    }

    if (!buktiFile) {
      errs.buktiKelengkapan = "Upload bukti kelengkapan pengaduan (foto) wajib dilampirkan";
    } else {
      const buktiErr = validateBuktiFile(buktiFile);
      if (buktiErr) errs.buktiKelengkapan = buktiErr;
    }

    if (!ktpFile) {
      errs.identitasKtp = "Upload identitas pelapor (KTP) wajib dilampirkan";
    } else {
      const ktpErr = validateKtpFile(ktpFile);
      if (ktpErr) errs.identitasKtp = ktpErr;
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
      const body = new FormData();
      body.append("nik", formData.nik);
      body.append("nama", formData.nama);
      body.append("telepon", formData.telepon);
      body.append("email", formData.email);
      body.append("alamat", formData.alamat);
      body.append("isiPengaduan", formData.isiPengaduan);
      if (buktiFile) body.append("buktiFile", buktiFile);
      if (ktpFile) body.append("ktpFile", ktpFile);

      const response = await submitPengaduanAction(body);
      if (response.success) {
        try { localStorage.setItem("ampera_new_submission_signal", String(Date.now())); } catch {}
        setSubmissionResult(response);
        window.scrollTo({ top: 200, behavior: "smooth" });
      } else {
        setSubmitError(response.message || "Gagal menyimpan laporan pengaduan ke sistem.");
        window.scrollTo({ top: 320, behavior: "smooth" });
      }
    } catch (err) {
      console.error("Gagal mengirim pengaduan:", err);
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
    setSubmitError(null);
    setCurrentStep(1);
    setFormData({
      nik: "",
      nama: "",
      email: "",
      alamat: "",
      telepon: "",
      isiPengaduan: "",
    });
    setBuktiFile(null);
    setBuktiPreview(null);
    setKtpFile(null);
    setKtpPreview(null);
    setNikLookupStatus({ status: "idle", message: "" });
    setErrors({});
  };

  // =========================================================================
  // TAMPILAN JIKA PENGADUAN TELAH BERHASIL (SUCCESS RECEIPT SCREEN)
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
              Laporan Pengaduan Terdaftar
            </span>
            <h2 className="font-brand font-extrabold text-2xl sm:text-3xl text-navy-900 dark:text-white">
              Tiket Registrasi <span className="text-brand-orange">Pengaduan</span> Terbit
            </h2>
            <p className="text-sm text-ink-soft dark:text-slate-400 mt-2">
              Laporan Anda telah berhasil masuk ke sistem pengawasan BBPOM di Palembang. Simpan nomor tiket pengaduan berikut untuk pelacakan status penanganan.
            </p>

            {/* Kode Pengaduan Box */}
            <div className="mt-6 p-4 rounded-2xl bg-orange-50/70 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800/60 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-left">
                <span className="text-xs uppercase tracking-wider font-semibold text-brand-orange-600 dark:text-orange-400">
                  Nomor Tiket Pengaduan Resmi
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
                <span>{copiedCode ? "Tersalin!" : "Salin Tiket"}</span>
              </button>
            </div>
          </div>

          {/* Rincian Data Pengaduan */}
          <div className="relative py-8 grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-slate-100 dark:border-slate-800 text-sm">
            {/* Sisi Kiri: Data Pelapor */}
            <div className="space-y-4">
              <h3 className="font-brand font-bold text-base text-navy-900 dark:text-white flex items-center gap-2">
                <User className="w-4 h-4 text-brand-orange" />
                <span>Data Pelapor</span>
              </h3>
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 space-y-2.5">
                <div>
                  <span className="text-xs text-ink-soft dark:text-slate-400 block">NIK:</span>
                  <span className="font-mono font-semibold text-navy-900 dark:text-white">{submissionResult.data.nik}</span>
                </div>
                <div>
                  <span className="text-xs text-ink-soft dark:text-slate-400 block">Nama Pelapor:</span>
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

            {/* Sisi Kanan: Uraian & Dokumen Terlampir */}
            <div className="space-y-4">
              <h3 className="font-brand font-bold text-base text-navy-900 dark:text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-brand-orange" />
                <span>Rincian Laporan & Berkas</span>
              </h3>
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 space-y-3">
                <div>
                  <span className="text-xs text-ink-soft dark:text-slate-400 block">Uraian Isi Pengaduan:</span>
                  <p className="font-normal text-slate-700 dark:text-slate-300 leading-relaxed text-xs sm:text-[13px] bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 mt-1 max-h-36 overflow-y-auto">
                    {submissionResult.data.isiPengaduan}
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                  <div>
                    <span className="text-xs text-ink-soft dark:text-slate-400 block">Bukti Kelengkapan (Foto):</span>
                    <span className="font-semibold text-navy-900 dark:text-white text-xs truncate block">
                      {submissionResult.data.namaBuktiFoto || "Foto Berhasil Terlampir"}
                    </span>
                    {submissionResult.data.ukuranBuktiFoto && (
                      <span className="text-[11px] text-slate-400 block">
                        Ukuran: {submissionResult.data.ukuranBuktiFoto}
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="text-xs text-ink-soft dark:text-slate-400 block">Identitas Pelapor (KTP):</span>
                    <span className="font-semibold text-navy-900 dark:text-white text-xs truncate block">
                      {submissionResult.data.namaKtp || "Berkas KTP Terlampir"}
                    </span>
                    {submissionResult.data.ukuranKtp && (
                      <span className="text-[11px] text-slate-400 block">
                        Ukuran: {submissionResult.data.ukuranKtp}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Petunjuk Langkah Selanjutnya */}
          <div className="relative py-6 bg-sky-50/60 dark:bg-sky-950/20 rounded-2xl p-5 my-6 border border-sky-100 dark:border-sky-900/40">
            <h4 className="font-brand font-bold text-sm text-navy-900 dark:text-white flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-sky-500" />
              <span>Petunjuk Tindak Lanjut Pengaduan Masyarakat:</span>
            </h4>
            <ol className="list-decimal list-inside text-xs sm:text-sm text-slate-700 dark:text-slate-300 space-y-1.5 leading-relaxed">
              <li>
                Laporan Anda telah tercatat pada <strong>Sistem Pengawasan BBPOM di Palembang</strong> dan akan diverifikasi oleh Tim Pemeriksa / Intelijen.
              </li>
              <li>
                Estimasi penelaahan berkas dan bukti membutuhkan waktu <strong>1 - 3 hari kerja</strong> sejak pendaftaran.
              </li>
              <li>
                Jika diperlukan klarifikasi atau pengambilan sampel lanjutan di lapangan, petugas resmi BBPOM akan menghubungi Anda secara langsung.
              </li>
              <li>
                Sesuai ketentuan, <strong>kerahasiaan identitas Anda sebagai pelapor dilindungi sepenuhnya</strong> oleh regulasi hukum perlindungan saksi dan pelapor.
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
                <span>Buat Pengaduan Lain</span>
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
  // TAMPILAN FORM UTAMA DENGAN STEPPER
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
              {/* Step 1: Data Pelapor */}
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
                  Data Pelapor
                </span>
              </button>

              {/* Step 2: Detail & Berkas */}
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
                  Detail & Berkas
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
            
            {/* Step 1: Data Identitas Pelapor */}
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
                Data Pelapor
              </span>
            </button>

            {/* Connecting Bar 1-2 */}
            <div
              className={`flex-1 h-0.5 mx-3 sm:mx-6 rounded-full transition-colors duration-500 ${
                currentStep >= 2 ? "bg-brand-orange" : "bg-slate-200 dark:bg-slate-800"
              }`}
            />

            {/* Step 2: Detail Pengaduan & Berkas */}
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
                Detail & Berkas
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
              <p className="font-bold">Pengaduan Gagal Diproses</p>
              <p className="mt-0.5 text-xs text-rose-700 dark:text-rose-300">{submitError}</p>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* 2. FORM BODY BERDASARKAN CURRENT STEP                               */}
        {/* =================================================================== */}
        <form onSubmit={handleSubmit} noValidate>
          {/* --------------------------------------------------------------- */}
          {/* STEP 1: DATA IDENTITAS PELAPOR                                  */}
          {/* --------------------------------------------------------------- */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fade-up">
              <div className="border-b border-slate-100 dark:border-slate-800/80 pb-3">
                <h3 className="font-brand font-bold text-lg text-navy-900 dark:text-white">
                  Data Identitas Pelapor
                </h3>
                <p className="text-xs sm:text-sm text-ink-soft dark:text-slate-400 mt-0.5">
                  Isi data identitas Anda secara akurat untuk keperluan verifikasi dan tindak lanjut laporan pengaduan oleh BBPOM Palembang.
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
          {/* STEP 2: DETAIL PENGADUAN & UPLOAD BERKAS                        */}
          {/* --------------------------------------------------------------- */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fade-up">
              <div className="border-b border-slate-100 dark:border-slate-800/80 pb-3">
                <h3 className="font-brand font-bold text-lg text-navy-900 dark:text-white">
                  Uraian & Berkas Pengaduan
                </h3>
                <p className="text-xs sm:text-sm text-ink-soft dark:text-slate-400 mt-0.5">
                  Jelaskan duduk perkara pengaduan dan unggah foto bukti kelengkapan serta kartu identitas pelapor.
                </p>
              </div>

              {/* Field: Isi Pengaduan (Textarea) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor="isiPengaduan"
                    className="block text-xs sm:text-[13px] font-bold text-navy-900 dark:text-slate-200"
                  >
                    Isi Pengaduan <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[11px] text-ink-soft dark:text-slate-400">
                    {formData.isiPengaduan.length} karakter (min. 10)
                  </span>
                </div>
                <p className="text-xs text-ink-soft dark:text-slate-400 mb-2 leading-relaxed">
                  Uraikan secara jelas kronologi, nama produk, nomor izin edar bila ada, nama toko/pasar/penjual, lokasi kejadian, dan bentuk pelanggaran (misal: produk tanpa izin edar, palsu, rusak, kedaluwarsa, atau efek samping membahayakan).
                </p>
                <div className="relative">
                  <textarea
                    id="isiPengaduan"
                    name="isiPengaduan"
                    rows={4}
                    value={formData.isiPengaduan}
                    onChange={handleChange}
                    placeholder="Contoh: Menemukan peredaran kosmetik pemutih tanpa izin edar BPOM dan tanpa nomor notifikasi yang dijual di Pasar 16 Ilir Palembang (Lapak Kosmetik Toko X). Produk beraroma menyengat logam dan menyebabkan kulit konsumen melepuh/iritasi setelah pemakaian..."
                    className={`w-full rounded-2xl border bg-white dark:bg-slate-950 px-4 py-3.5 text-sm text-navy-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden transition-all duration-200 resize-y leading-relaxed ${
                      errors.isiPengaduan
                        ? "border-red-400 focus:ring-2 focus:ring-red-400/20"
                        : "border-slate-200 dark:border-slate-700/80 focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20"
                    }`}
                  />
                </div>
                {errors.isiPengaduan && (
                  <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.isiPengaduan}</span>
                  </p>
                )}
              </div>

              {/* Grid 2 Kolom untuk Berkas Upload */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {/* 1. UPLOAD BUKTI KELENGKAPAN PENGADUAN (FOTO JPG, PNG, JPEG MAKS 10MB) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="buktiKelengkapanInput"
                      className="text-xs sm:text-[13px] font-bold text-navy-900 dark:text-slate-200"
                    >
                      Bukti Kelengkapan Pengaduan (Foto) <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[11px] font-medium text-brand-orange dark:text-orange-400">
                      Maks 10 MB
                    </span>
                  </div>
                  <p className="text-[11px] text-ink-soft dark:text-slate-400 mb-2">
                    Foto produk, kemasan, label, struk/nota, atau lokasi kejadian (JPG, JPEG, PNG).
                  </p>

                  <input
                    ref={buktiInputRef}
                    id="buktiKelengkapanInput"
                    type="file"
                    accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleBuktiChange(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />

                  {!buktiFile ? (
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDraggingBukti(true);
                      }}
                      onDragLeave={() => setIsDraggingBukti(false)}
                      onDrop={handleBuktiDrop}
                      onClick={() => buktiInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-2 ${
                        isDraggingBukti
                          ? "border-brand-orange bg-orange-50/50 dark:bg-orange-950/20"
                          : errors.buktiKelengkapan
                          ? "border-red-400 bg-red-50/30 dark:bg-red-950/10"
                          : "border-slate-200 dark:border-slate-700/80 hover:border-brand-orange hover:bg-orange-50/20 dark:hover:bg-slate-800/40"
                      }`}
                    >
                      <div className="w-12 h-12 rounded-2xl bg-orange-100/70 dark:bg-orange-950/50 text-brand-orange flex items-center justify-center">
                        <UploadCloud className="w-6 h-6 stroke-[2]" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-xs sm:text-sm font-bold text-navy-900 dark:text-white">
                          Pilih File Foto Bukti
                        </p>
                        <p className="text-[11px] text-ink-soft dark:text-slate-400">
                          atau tarik & letakkan file foto di sini
                        </p>
                      </div>
                      <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        JPG, JPEG, PNG • MAKS 10MB
                      </span>
                    </div>
                  ) : (
                    <div className="border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 bg-slate-50/70 dark:bg-slate-800/50 relative">
                      <div className="flex items-center gap-3">
                        {buktiPreview ? (
                          <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-200 shrink-0 border border-slate-200 dark:border-slate-700">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={buktiPreview}
                              alt="Pratinjau Bukti"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-brand-orange flex items-center justify-center shrink-0">
                            <FileCheck2 className="w-7 h-7" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0 pr-6">
                          <p className="text-xs sm:text-sm font-bold text-navy-900 dark:text-white truncate">
                            {buktiFile.name}
                          </p>
                          <p className="text-[11px] text-ink-soft dark:text-slate-400 mt-0.5">
                            {formatFileSize(buktiFile.size)} • Foto Bukti Siap Diunggah
                          </p>
                          <span className="inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60">
                            Valid Maks 10MB
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setBuktiFile(null);
                            setBuktiPreview(null);
                            if (buktiInputRef.current) buktiInputRef.current.value = "";
                          }}
                          className="absolute top-3 right-3 p-1 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                          title="Hapus / ganti foto"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                  {errors.buktiKelengkapan && (
                    <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{errors.buktiKelengkapan}</span>
                    </p>
                  )}
                </div>

                {/* 2. UPLOAD IDENTITAS PELAPOR (KTP) (JPG, PNG, JPEG, PDF MAKS 10MB) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="identitasKtpInput"
                      className="text-xs sm:text-[13px] font-bold text-navy-900 dark:text-slate-200"
                    >
                      Upload Identitas Pelapor (KTP) <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[11px] font-medium text-brand-orange dark:text-orange-400">
                      Maks 10 MB
                    </span>
                  </div>
                  <p className="text-[11px] text-ink-soft dark:text-slate-400 mb-2">
                    Foto atau scan dokumen KTP pelapor (JPG, JPEG, PNG, PDF).
                  </p>

                  <input
                    ref={ktpInputRef}
                    id="identitasKtpInput"
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleKtpChange(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />

                  {!ktpFile ? (
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDraggingKtp(true);
                      }}
                      onDragLeave={() => setIsDraggingKtp(false)}
                      onDrop={handleKtpDrop}
                      onClick={() => ktpInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-2 ${
                        isDraggingKtp
                          ? "border-brand-orange bg-orange-50/50 dark:bg-orange-950/20"
                          : errors.identitasKtp
                          ? "border-red-400 bg-red-50/30 dark:bg-red-950/10"
                          : "border-slate-200 dark:border-slate-700/80 hover:border-brand-orange hover:bg-orange-50/20 dark:hover:bg-slate-800/40"
                      }`}
                    >
                      <div className="w-12 h-12 rounded-2xl bg-sky-100/70 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                        <FileText className="w-6 h-6 stroke-[2]" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-xs sm:text-sm font-bold text-navy-900 dark:text-white">
                          Pilih Dokumen KTP
                        </p>
                        <p className="text-[11px] text-ink-soft dark:text-slate-400">
                          atau tarik & letakkan berkas KTP di sini
                        </p>
                      </div>
                      <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        JPG, PNG, JPEG, PDF • MAKS 10MB
                      </span>
                    </div>
                  ) : (
                    <div className="border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 bg-slate-50/70 dark:bg-slate-800/50 relative">
                      <div className="flex items-center gap-3">
                        {ktpPreview ? (
                          <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-200 shrink-0 border border-slate-200 dark:border-slate-700">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={ktpPreview}
                              alt="Pratinjau KTP"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                            <FileText className="w-7 h-7" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0 pr-6">
                          <p className="text-xs sm:text-sm font-bold text-navy-900 dark:text-white truncate">
                            {ktpFile.name}
                          </p>
                          <p className="text-[11px] text-ink-soft dark:text-slate-400 mt-0.5">
                            {formatFileSize(ktpFile.size)} • {ktpFile.name.toLowerCase().endsWith(".pdf") ? "Dokumen PDF" : "Foto KTP"}
                          </p>
                          <span className="inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60">
                            Valid Maks 10MB
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setKtpFile(null);
                            setKtpPreview(null);
                            if (ktpInputRef.current) ktpInputRef.current.value = "";
                          }}
                          className="absolute top-3 right-3 p-1 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                          title="Hapus / ganti KTP"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                  {errors.identitasKtp && (
                    <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{errors.identitasKtp}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Security notice regarding Whistleblower Identity */}
              <div className="p-4 rounded-2xl bg-orange-50/70 dark:bg-orange-950/30 border border-orange-200/80 dark:border-orange-800/50 flex items-start gap-3 mt-4">
                <ShieldCheck className="w-5 h-5 text-brand-orange shrink-0 mt-0.5" />
                <div className="text-xs text-navy-900 dark:text-slate-200 leading-relaxed">
                  <strong>Kerahasiaan Identitas Dijamin Penuh:</strong> Dokumen KTP diperlukan oleh BBPOM Palembang untuk memverifikasi keabsahan laporan serta mencegah laporan fiktif. Identitas pelapor dijamin kerahasiaannya dan dilindungi oleh perundang-undangan perlindungan saksi/pelapor.
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
                  Konfirmasi Pengajuan Laporan
                </h3>
                <p className="text-xs sm:text-sm text-ink-soft dark:text-slate-400 mt-0.5">
                  Tinjau kembali seluruh data dan kelengkapan dokumen pengaduan sebelum dikirimkan ke tim BBPOM Palembang.
                </p>
              </div>

              {/* Ringkasan Data Preview Card */}
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 space-y-6">
                {/* 1. Preview Data Pelapor */}
                <div>
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200/70 dark:border-slate-700">
                    <h4 className="font-brand font-bold text-sm text-brand-orange uppercase tracking-wider flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>Data Identitas Pelapor</span>
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
                      <span className="text-slate-400 block text-xs">NIK:</span>
                      <span className="font-mono font-semibold text-navy-900 dark:text-white">{formData.nik}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-xs">Nama Lengkap:</span>
                      <span className="font-semibold text-navy-900 dark:text-white">{formData.nama}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-xs">Nomor WhatsApp / Telepon:</span>
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

                {/* 2. Preview Detail Pengaduan & Berkas */}
                <div>
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200/70 dark:border-slate-700">
                    <h4 className="font-brand font-bold text-sm text-brand-orange uppercase tracking-wider flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4" />
                      <span>Uraian & Berkas Pengaduan</span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="text-xs font-semibold text-brand-orange hover:underline cursor-pointer"
                    >
                      Ubah Data
                    </button>
                  </div>
                  <div className="space-y-3 text-xs sm:text-sm">
                    <div>
                      <span className="text-slate-400 block text-xs">Isi Uraian Pengaduan:</span>
                      <p className="font-normal text-slate-700 dark:text-slate-300 italic bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700 mt-1 leading-relaxed">
                        "{formData.isiPengaduan}"
                      </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-orange-100 text-brand-orange dark:bg-orange-950/60 flex items-center justify-center shrink-0">
                          <UploadCloud className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[11px] text-slate-400 block">Bukti Kelengkapan (Foto):</span>
                          <span className="font-semibold text-navy-900 dark:text-white text-xs truncate block">
                            {buktiFile?.name || "Belum dipilih"}
                          </span>
                          {buktiFile && (
                            <span className="text-[10px] text-brand-orange block">
                              {formatFileSize(buktiFile.size)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-sky-100 text-sky-600 dark:bg-sky-950/60 flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[11px] text-slate-400 block">Identitas Pelapor (KTP):</span>
                          <span className="font-semibold text-navy-900 dark:text-white text-xs truncate block">
                            {ktpFile?.name || "Belum dipilih"}
                          </span>
                          {ktpFile && (
                            <span className="text-[10px] text-sky-600 dark:text-sky-400 block">
                              {formatFileSize(ktpFile.size)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fast Facts Badge */}
                <div className="p-4 rounded-2xl bg-orange-50/80 dark:bg-orange-950/30 border border-orange-200/80 dark:border-orange-800/50 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-brand-orange shrink-0 mt-0.5" />
                  <div className="text-xs text-navy-900 dark:text-slate-200 leading-relaxed">
                    <strong>Pernyataan Kebenaran Data:</strong> Dengan mengirimkan formulir ini, saya menyatakan bahwa informasi dan bukti yang disampaikan adalah benar adanya untuk ditindaklanjuti secara resmi oleh BBPOM di Palembang.
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
              Pastikan data yang diisi sudah lengkap dan akurat sebelum melanjutkan.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Sisi Kiri: Privacy / Security Badge */}
              <div className="flex items-center gap-2 text-xs text-ink-soft dark:text-slate-400">
                <ShieldCheck className="w-4 h-4 text-brand-orange shrink-0" />
                <span>Kerahasiaan data pengaduan Anda dijamin oleh BBPOM Palembang.</span>
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
                        <span>Mengirim Laporan...</span>
                      </>
                    ) : (
                      <>
                        <span>Kirim Pengaduan</span>
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

      {/* Overlay Loading Layar Penuh saat Proses Menyimpan */}
      <ServiceSavingOverlay
        isOpen={isSubmitting}
        serviceName="Layanan Pengaduan Masyarakat"
        title="Mengirim & Menyimpan Laporan Pengaduan..."
        description="Sistem sedang mengunggah foto bukti kelengkapan & identitas KTP, menyimpan laporan ke server BBPOM di Palembang, serta menerbitkan kode tiket pengaduan Anda."
        hasFileUpload={true}
      />
    </div>
  );
}

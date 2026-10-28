"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Calendar,
  MapPin,
  CreditCard,
  GraduationCap,
  Briefcase,
  Building2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Edit3,
  Save,
  X,
  Lock,
  LogOut,
  Award,
  BookOpen,
  Check,
  Clock,
  ArrowRight,
  FileText,
  Search,
  Sparkles,
} from "lucide-react";
import {
  PesertaCindo,
  JenisKelamin,
  Pendidikan,
  Pekerjaan,
  CindoUser,
  SesiCindo,
} from "@/data/cindo/cindoTypes";
import {
  getSesiCindo,
  getCurrentCindoUser,
  updateCindoPeserta,
  updateCindoPassword,
  logoutCindoUser,
  initSesiWithPeserta,
} from "@/data/cindo/cindoStorage";
import { lookupNikAction } from "@/app/actions/lookup-nik";

const PENDIDIKAN_LABELS: Record<Pendidikan, string> = {
  SD: "Sekolah Dasar (SD)",
  SMP: "SMP / MTs Sederajat",
  SMA_SEDERAJAT: "SMA / SMK / MA Sederajat",
  D3: "Diploma 3 (D3)",
  S1: "Sarjana (S1)",
  S2: "Magister (S2)",
  S3: "Doktor (S3)",
};

const PEKERJAAN_LABELS: Record<Pekerjaan, string> = {
  ASN: "Pegawai Negeri Sipil (ASN/PNS)",
  PEGAWAI_SWASTA: "Karyawan / Pegawai Swasta",
  WIRASWASTA: "Wiraswasta / Pelaku Usaha (UMKM)",
  MAHASISWA: "Pelajar / Mahasiswa",
  LAINNYA: "Lainnya",
};

export default function CindoProfilePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<CindoUser | null>(null);
  const [sesi, setSesi] = useState<SesiCindo | null>(null);

  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<PesertaCindo>({
    nama: "",
    tanggalTes: new Date().toISOString().slice(0, 10),
    alamat: "",
    nik: "",
    usia: 25,
    jenisKelamin: "LAKI_LAKI",
    pendidikan: "S1",
    pekerjaan: "ASN",
    instansi: "",
  });

  // Feedback notifications
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [copiedNik, setCopiedNik] = useState(false);

  // NIK Lookup states
  const [isLookingUpNik, setIsLookingUpNik] = useState(false);
  const [lookupMessage, setLookupMessage] = useState<string | null>(null);

  // Password Change State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadData = () => {
    const user = getCurrentCindoUser();
    const currentSesi = getSesiCindo();
    setCurrentUser(user);
    setSesi(currentSesi);

    const existingPeserta = currentSesi?.peserta || user?.peserta;
    if (existingPeserta) {
      setFormData(existingPeserta);
    } else {
      // Default initial form with today's date
      setFormData((prev) => ({
        ...prev,
        tanggalTes: new Date().toISOString().slice(0, 10),
      }));
      // Otomatis buka form jika data belum pernah diisi
      setIsEditing(true);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "usia" ? Number(value) : value,
    }));
  };

  const handleLookupNik = async () => {
    if (!formData.nik || formData.nik.length < 8) {
      setLookupMessage("Masukkan minimal 8-16 digit NIK untuk pencarian otomatis.");
      return;
    }
    setIsLookingUpNik(true);
    setLookupMessage("Mencari data dari sistem Ampera & Buku Tamu BBPOM...");
    try {
      const res = await lookupNikAction(formData.nik);
      if (res.found && res.data) {
        setFormData((prev) => ({
          ...prev,
          nama: res.data?.nama || prev.nama,
          alamat: res.data?.alamat || prev.alamat,
          usia: res.data?.umur ? Number(res.data.umur) : prev.usia,
          instansi: res.data?.asalInstansi || prev.instansi,
        }));
        setLookupMessage("✓ " + res.message);
      } else {
        setLookupMessage(res.message);
      }
    } catch {
      setLookupMessage("Gagal menghubungkan pencarian NIK. Silakan isi secara manual.");
    } finally {
      setIsLookingUpNik(false);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nama.trim() || !formData.nik.trim()) {
      alert("Nama Lengkap dan NIK wajib diisi!");
      return;
    }

    // Jika belum pernah punya soal, inisialisasi sesi peserta
    if (!sesi?.peserta) {
      initSesiWithPeserta(formData);
    } else {
      updateCindoPeserta(formData);
    }

    loadData();
    setIsEditing(false);
    setSaveSuccessMsg("Data identitas peserta berhasil disimpan! Anda sekarang sudah dapat memilih topik di menu Materi.");
    setTimeout(() => {
      setSaveSuccessMsg(null);
    }, 6000);
  };

  const handleCancelEdit = () => {
    if (sesi?.peserta) {
      setFormData(sesi.peserta);
    }
    setIsEditing(false);
  };

  const handleCopyNik = () => {
    if (formData.nik) {
      navigator.clipboard.writeText(formData.nik);
      setCopiedNik(true);
      setTimeout(() => setCopiedNik(false), 2000);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 4) {
      setPasswordMsg({ type: "error", text: "Password baru minimal 4 karakter." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: "error", text: "Konfirmasi password tidak cocok." });
      return;
    }

    const res = updateCindoPassword(newPassword);
    if (res.success) {
      setPasswordMsg({ type: "success", text: res.message });
      setTimeout(() => {
        setShowPasswordModal(false);
        setNewPassword("");
        setConfirmPassword("");
        setPasswordMsg(null);
      }, 1500);
    } else {
      setPasswordMsg({ type: "error", text: res.message });
    }
  };

  const handleLogout = () => {
    if (confirm("Apakah Anda yakin ingin keluar dari akun Cindo?")) {
      logoutCindoUser();
      router.push("/cindo/login");
    }
  };

  const peserta = sesi?.peserta;
  const isDataComplete = Boolean(peserta && peserta.nama && peserta.nik);

  // Calculate initials
  const rawName = peserta?.nama || currentUser?.username || "Peserta";
  const nameParts = rawName.trim().split(" ");
  const initials =
    nameParts.length > 1
      ? (nameParts[0][0] + nameParts[1][0]).toUpperCase()
      : nameParts[0].slice(0, 2).toUpperCase();

  // Learning progress calculations
  const totalBabs = 4;
  const completedBabsCount = sesi?.materiProgress?.completedBabIds?.length || 0;
  const materiPercent = Math.min(100, Math.round((completedBabsCount / totalBabs) * 100));

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Toast Notification */}
      {saveSuccessMsg && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800 shadow-sm dark:border-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-200 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
          <Link
            href="/cindo/materi"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-emerald-700 active:scale-95 transition-all"
          >
            <span>Pilih Topik Materi Sekarang</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {/* Hero Banner Profile Card */}
      <div className="relative overflow-hidden rounded-3xl border border-orange-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {/* Cover Gradient Background (Compact Height) */}
        <div className="h-16 sm:h-20 w-full bg-gradient-to-r from-[#0b2a6b] via-[#12429c] to-[#1e58c7] relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.15),transparent_70%)]" />
          <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-orange-400/10 blur-2xl" />
          <div className="absolute left-10 -bottom-10 h-32 w-32 rounded-full bg-amber-400/15 blur-xl" />

          {/* Quick decorative badge */}
          <div className="absolute right-4 top-2.5 hidden sm:flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 text-[11px] font-semibold text-white backdrop-blur-md">
            <ShieldCheck className="h-3.5 w-3.5 text-amber-300" />
            <span>Akun Resmi Peserta Cindo BBPOM</span>
          </div>
        </div>

        {/* Profile Info Row */}
        <div className="px-6 pb-6 pt-3 sm:pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Avatar & Basic Info */}
            <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4 text-center sm:text-left">
              <div className="relative -mt-10 sm:-mt-13 shrink-0">
                <div className="flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0b2a6b] via-brand-orange to-orange-500 text-2xl sm:text-3xl font-black text-white shadow-xl ring-4 ring-white dark:ring-slate-900">
                  {initials}
                </div>
                {isDataComplete && (
                  <div
                    title="Data Identitas Terverifikasi"
                    className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white ring-2 ring-white dark:ring-slate-900 shadow-sm"
                  >
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                  </div>
                )}
              </div>

              <div className="space-y-1.5 pt-1.5 sm:pt-2">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-navy-900 dark:text-white leading-tight">
                    {peserta?.nama || currentUser?.username || "Peserta Cindo"}
                  </h1>
                  {sesi?.postTest?.isPassed ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300/40">
                      <Award className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" /> Lulus Bersertifikat
                    </span>
                  ) : isDataComplete ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-bold text-brand-orange dark:bg-orange-950 dark:text-orange-300 border border-orange-200/60">
                      <CheckCircle2 className="h-3.5 w-3.5 text-brand-orange" /> Data Lengkap
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-bold text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                      <AlertCircle className="h-3.5 w-3.5 text-rose-600" /> Belum Lengkapi Data
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 flex items-center justify-center sm:justify-start gap-2">
                  <span>@{currentUser?.username || "username"}</span>
                  <span>•</span>
                  <span>{peserta?.instansi || "Peserta E-Learning"}</span>
                </p>
              </div>
            </div>

            {/* Action buttons (only show certificate link if passed) */}
            {sesi?.postTest?.isPassed && (
              <div className="flex items-center justify-center sm:justify-end gap-2 pt-2 sm:pt-0">
                <Link
                  href="/cindo/sertifikat"
                  className="inline-flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-500/10 px-4 py-2 text-xs sm:text-sm font-bold text-amber-800 hover:bg-amber-500/20 dark:border-amber-700/50 dark:bg-amber-950/40 dark:text-amber-300 transition-all active:scale-95"
                >
                  <Award className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <span>Lihat E-Sertifikat</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Alert if Participant Data is not yet filled */}
      {!isDataComplete && !isEditing && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 p-5 shadow-sm dark:border-amber-900/60 dark:from-amber-950/40 dark:to-orange-950/30">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-bold text-amber-900 dark:text-amber-200">
                Data Identitas Belum Lengkap!
              </h4>
              <p className="text-xs sm:text-sm text-amber-700 dark:text-amber-300">
                Lengkapi identitas diri Anda (NIK, Nama Sesuai KTP, Instansi) untuk kebutuhan penerbitan sertifikat resmi Cindo BBPOM.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow hover:bg-amber-700 active:scale-95 whitespace-nowrap"
          >
            <span>Lengkapi Sekarang</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* 4 Stat Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Identitas */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Identitas</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-brand-orange dark:bg-orange-950 dark:text-orange-400">
              <User className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-base sm:text-lg font-black text-slate-900 dark:text-white">
            {isDataComplete ? "Terverifikasi" : "Belum Diisi"}
          </div>
          <p className="text-[11px] font-medium text-slate-400 mt-0.5">
            {peserta?.nik ? `${peserta.nik.slice(0, 6)}******` : "NIK belum tercatat"}
          </p>
        </div>

        {/* Stat 2: Pre-Test */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Pre-Test</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
              <FileText className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-base sm:text-lg font-black text-slate-900 dark:text-white">
            {sesi?.preTest?.completed ? `${sesi.preTest.skor} Poin` : "Belum Ikut"}
          </div>
          <p className="text-[11px] font-medium text-purple-600 dark:text-purple-400 mt-0.5">
            {sesi?.preTest?.completed
              ? `${sesi.preTest.jumlahBenar} dari 10 soal benar`
              : "Asesmen awal materi"}
          </p>
        </div>

        {/* Stat 3: Materi */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Materi Edukasi</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-teal-600 dark:bg-teal-950 dark:text-teal-400">
              <BookOpen className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-base sm:text-lg font-black text-slate-900 dark:text-white">
            {completedBabsCount} / {totalBabs} Bab
          </div>
          <div className="mt-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-teal-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${materiPercent}%` }}
            />
          </div>
        </div>

        {/* Stat 4: Post-Test / Sertifikat */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Post-Test</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
              <Award className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-base sm:text-lg font-black text-slate-900 dark:text-white">
            {sesi?.postTest?.completed
              ? `${sesi.postTest.skor} Poin`
              : "Belum Dikerjakan"}
          </div>
          <p className="text-[11px] font-medium text-amber-600 dark:text-amber-400 mt-0.5">
            {sesi?.postTest?.isPassed
              ? "✓ Lulus (Standar ≥ 80)"
              : sesi?.postTest?.completed
              ? "Perlu Remedial"
              : "Syarat e-sertifikat"}
          </p>
        </div>
      </div>

      {/* Main Content Grid: Data User & Riwayat */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col (Data User / Form) - 8 Cols */}
        <div className="lg:col-span-8 space-y-6">
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-brand-orange dark:bg-orange-950/60 dark:text-orange-400">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-extrabold text-navy-900 dark:text-white">
                    {isEditing ? "Formulir Perubahan Data User" : "Data Identitas Peserta"}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {isEditing
                      ? "Perbarui informasi identitas Anda di bawah ini"
                      : "Data resmi peserta yang tercatat pada sistem Cindo E-Learning"}
                  </p>
                </div>
              </div>

              {!isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1.5 text-xs font-bold text-brand-orange hover:text-orange-600 dark:text-orange-400 transition-colors"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Ubah Data</span>
                </button>
              )}
            </div>

            {/* View Mode */}
            {!isEditing ? (
              <div className="mt-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* NIK */}
                  <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800/80 dark:bg-slate-800/40">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Nomor Induk Kependudukan (NIK)
                    </span>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-mono tracking-wide">
                        {peserta?.nik || "-"}
                      </span>
                      {peserta?.nik && (
                        <button
                          type="button"
                          onClick={handleCopyNik}
                          className="text-xs font-semibold text-brand-orange hover:text-orange-600 dark:text-orange-400 inline-flex items-center gap-1"
                          title="Salin NIK"
                        >
                          {copiedNik ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-emerald-600" />
                              <span className="text-emerald-600 text-[11px]">Tersalin</span>
                            </>
                          ) : (
                            <span className="text-[11px]">Salin</span>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Nama Lengkap */}
                  <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800/80 dark:bg-slate-800/40">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Nama Lengkap (Sesuai KTP)
                    </span>
                    <p className="mt-1 text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                      {peserta?.nama || "-"}
                    </p>
                  </div>

                  {/* Tanggal Tes */}
                  <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800/80 dark:bg-slate-800/40">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Tanggal Tes / Pendaftaran
                    </span>
                    <p className="mt-1 text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      <span>{peserta?.tanggalTes || "-"}</span>
                    </p>
                  </div>

                  {/* Usia & Jenis Kelamin */}
                  <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800/80 dark:bg-slate-800/40">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Usia & Jenis Kelamin
                    </span>
                    <p className="mt-1 text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                      {peserta?.usia ? `${peserta.usia} Tahun` : "-"} •{" "}
                      {peserta?.jenisKelamin === "LAKI_LAKI"
                        ? "Laki-laki"
                        : peserta?.jenisKelamin === "PEREMPUAN"
                        ? "Perempuan"
                        : "-"}
                    </p>
                  </div>

                  {/* Pendidikan */}
                  <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800/80 dark:bg-slate-800/40">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Pendidikan Terakhir
                    </span>
                    <p className="mt-1 text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-slate-400" />
                      <span>{peserta?.pendidikan ? PENDIDIKAN_LABELS[peserta.pendidikan] : "-"}</span>
                    </p>
                  </div>

                  {/* Pekerjaan */}
                  <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800/80 dark:bg-slate-800/40">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Pekerjaan
                    </span>
                    <p className="mt-1 text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-slate-400" />
                      <span>{peserta?.pekerjaan ? PEKERJAAN_LABELS[peserta.pekerjaan] : "-"}</span>
                    </p>
                  </div>

                  {/* Instansi */}
                  <div className="sm:col-span-2 rounded-xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800/80 dark:bg-slate-800/40">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Nama Instansi / Perusahaan / Kampus / Organisasi
                    </span>
                    <p className="mt-1 text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-slate-400" />
                      <span>{peserta?.instansi || "-"}</span>
                    </p>
                  </div>

                  {/* Alamat Domisili */}
                  <div className="sm:col-span-2 rounded-xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800/80 dark:bg-slate-800/40">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Alamat Domisili Lengkap
                    </span>
                    <p className="mt-1 text-sm sm:text-base font-medium text-slate-800 dark:text-slate-200 flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                      <span>{peserta?.alamat || "-"}</span>
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* Edit Mode Form */
              <form onSubmit={handleSaveProfile} className="mt-6 space-y-5">
                {/* Integration Notice */}
                <div className="flex items-center gap-2 rounded-xl border border-orange-200 bg-orange-50/70 p-3 text-xs text-orange-950 dark:border-orange-900/50 dark:bg-orange-950/40 dark:text-orange-200">
                  <Sparkles className="h-4 w-4 shrink-0 text-brand-orange dark:text-orange-400" />
                  <span>
                    <strong>Terhubung dengan Buku Tamu BBPOM:</strong> Masukkan NIK Anda lalu klik tombol &ldquo;Cek NIK&rdquo; untuk mengisi otomatis data profil Anda jika pernah berkunjung ke kantor BBPOM.
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* NIK Input with Cek NIK */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Nomor Induk Kependudukan (NIK) <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <CreditCard className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          name="nik"
                          required
                          maxLength={16}
                          value={formData.nik}
                          onChange={handleChange}
                          placeholder="16 Digit NIK KTP Anda..."
                          className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-xs sm:text-sm outline-none transition-all focus:border-brand-orange focus:ring-1 focus:ring-brand-orange dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleLookupNik}
                        disabled={isLookingUpNik}
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-slate-800 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-slate-900 active:scale-95 disabled:opacity-50 dark:bg-slate-700 dark:hover:bg-slate-600"
                      >
                        <Search className="h-4 w-4" />
                        <span>{isLookingUpNik ? "Memeriksa..." : "Cek NIK"}</span>
                      </button>
                    </div>
                    {lookupMessage && (
                      <p className="text-[11px] font-medium text-brand-orange dark:text-orange-400 mt-1">
                        {lookupMessage}
                      </p>
                    )}
                  </div>

                  {/* Nama Lengkap */}
                  <div className="space-y-1.5">
                    <label className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Nama Lengkap (Sesuai KTP) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        name="nama"
                        required
                        value={formData.nama}
                        onChange={handleChange}
                        placeholder="Nama Lengkap Anda..."
                        className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-xs sm:text-sm outline-none transition-all focus:border-brand-orange focus:ring-1 focus:ring-brand-orange dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Tanggal Tes */}
                  <div className="space-y-1.5">
                    <label className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Tanggal Tes <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                      <input
                        type="date"
                        name="tanggalTes"
                        required
                        value={formData.tanggalTes}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-xs sm:text-sm outline-none transition-all focus:border-brand-orange focus:ring-1 focus:ring-brand-orange dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Usia */}
                  <div className="space-y-1.5">
                    <label className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Usia (Tahun) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="usia"
                      min={12}
                      max={100}
                      required
                      value={formData.usia}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs sm:text-sm outline-none transition-all focus:border-brand-orange focus:ring-1 focus:ring-brand-orange dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>

                  {/* Jenis Kelamin */}
                  <div className="space-y-1.5">
                    <label className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Jenis Kelamin <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-4 pt-2">
                      <label className="flex items-center gap-2 cursor-pointer text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                        <input
                          type="radio"
                          name="jenisKelamin"
                          value="LAKI_LAKI"
                          checked={formData.jenisKelamin === "LAKI_LAKI"}
                          onChange={handleChange}
                          className="h-4 w-4 text-brand-orange focus:ring-brand-orange"
                        />
                        <span>Laki-laki</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                        <input
                          type="radio"
                          name="jenisKelamin"
                          value="PEREMPUAN"
                          checked={formData.jenisKelamin === "PEREMPUAN"}
                          onChange={handleChange}
                          className="h-4 w-4 text-brand-orange focus:ring-brand-orange"
                        />
                        <span>Perempuan</span>
                      </label>
                    </div>
                  </div>

                  {/* Pendidikan Terakhir */}
                  <div className="space-y-1.5">
                    <label className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Pendidikan Terakhir <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <GraduationCap className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                      <select
                        name="pendidikan"
                        value={formData.pendidikan}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-xs sm:text-sm outline-none transition-all focus:border-brand-orange focus:ring-1 focus:ring-brand-orange dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      >
                        <option value="SD">Sekolah Dasar (SD)</option>
                        <option value="SMP">SMP / MTs Sederajat</option>
                        <option value="SMA_SEDERAJAT">SMA / SMK / MA Sederajat</option>
                        <option value="D3">Diploma 3 (D3)</option>
                        <option value="S1">Sarjana (S1)</option>
                        <option value="S2">Magister (S2)</option>
                        <option value="S3">Doktor (S3)</option>
                      </select>
                    </div>
                  </div>

                  {/* Pekerjaan */}
                  <div className="space-y-1.5">
                    <label className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Pekerjaan <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Briefcase className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                      <select
                        name="pekerjaan"
                        value={formData.pekerjaan}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-xs sm:text-sm outline-none transition-all focus:border-brand-orange focus:ring-1 focus:ring-brand-orange dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      >
                        <option value="ASN">Pegawai Negeri Sipil (ASN/PNS)</option>
                        <option value="PEGAWAI_SWASTA">Karyawan / Pegawai Swasta</option>
                        <option value="WIRASWASTA">Wiraswasta / Pelaku Usaha (UMKM)</option>
                        <option value="MAHASISWA">Pelajar / Mahasiswa</option>
                        <option value="LAINNYA">Lainnya</option>
                      </select>
                    </div>
                  </div>

                  {/* Nama Instansi */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Nama Instansi / Perusahaan / Kampus / Organisasi <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        name="instansi"
                        required
                        value={formData.instansi}
                        onChange={handleChange}
                        placeholder="Contoh: Universitas Sriwijaya, UMKM Pempek Wong Kito, Pribadi..."
                        className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-xs sm:text-sm outline-none transition-all focus:border-brand-orange focus:ring-1 focus:ring-brand-orange dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Alamat Domisili */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Alamat Domisili Lengkap <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                      <textarea
                        name="alamat"
                        required
                        rows={3}
                        value={formData.alamat}
                        onChange={handleChange}
                        placeholder="Contoh: Jl. Jenderal Sudirman No. 12, Ilir Timur I, Kota Palembang..."
                        className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-xs sm:text-sm outline-none transition-all focus:border-brand-orange focus:ring-1 focus:ring-brand-orange dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="rounded-xl border border-slate-300 px-5 py-2.5 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 active:scale-95 transition-all"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-orange to-orange-600 px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow hover:from-orange-600 hover:to-orange-700 active:scale-95 transition-all"
                  >
                    <Save className="h-4 w-4" />
                    <span>Simpan Perubahan</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Right Col (Account Info, Certificate, Shortcuts) - 4 Cols */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card 1: Data Akun & Login */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
              <ShieldCheck className="h-5 w-5 text-brand-orange dark:text-orange-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Informasi Akun Cindo
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 dark:text-slate-500 font-medium">Username Login</span>
                <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 font-mono">
                  @{currentUser?.username || "tea"}
                </p>
              </div>

              <div>
                <span className="text-slate-400 dark:text-slate-500 font-medium">Role Pengguna</span>
                <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                  Peserta E-Learning BBPOM
                </p>
              </div>

              <div>
                <span className="text-slate-400 dark:text-slate-500 font-medium">Akun Dibuat</span>
                <p className="font-semibold text-slate-700 dark:text-slate-300 mt-0.5 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  <span>
                    {currentUser?.createdAt
                      ? new Date(currentUser.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : "Terdaftar"}
                  </span>
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setShowPasswordModal(true)}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition-colors"
              >
                <Lock className="h-3.5 w-3.5 text-slate-500" />
                <span>Ubah Password Akun</span>
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50/70 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-300 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
                <span>Keluar dari Akun</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-brand-orange dark:text-orange-400" />
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Ubah Password Akun
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordMsg(null);
                }}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Buat password baru untuk akun <strong>@{currentUser?.username}</strong>.
            </p>

            <form onSubmit={handlePasswordSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Password Baru
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 4 karakter..."
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs sm:text-sm outline-none transition-all focus:border-brand-orange focus:ring-1 focus:ring-brand-orange dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Konfirmasi Password Baru
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ketik ulang password baru..."
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs sm:text-sm outline-none transition-all focus:border-brand-orange focus:ring-1 focus:ring-brand-orange dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              {passwordMsg && (
                <p
                  className={`text-xs font-semibold ${
                    passwordMsg.type === "success"
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {passwordMsg.text}
                </p>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordMsg(null);
                  }}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-brand-orange to-orange-600 px-5 py-2 text-xs font-bold text-white shadow hover:from-orange-600 hover:to-orange-700"
                >
                  Simpan Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

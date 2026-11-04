"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  ShieldCheck,
  CloudUpload,
  Trash2,
  Sparkles,
  Lock,
  RotateCcw,
  CheckCircle2,
  Loader2,
} from "lucide-react";

export type AdminLoadingActionType =
  | "save"
  | "upload"
  | "delete"
  | "process"
  | "reset";

export interface AdminLoadingOverlayProps {
  /** Apakah loading overlay sedang aktif */
  isOpen: boolean;
  /** Tipe aksi yang sedang dijalankan untuk menyesuaikan icon dan warna */
  actionType?: AdminLoadingActionType;
  /** Judul proses utama */
  title?: string;
  /** Deskripsi penjelasan tambahan */
  description?: string;
  /** Teks badge kecil di atas kartu (default: "Sistem Admin AMPERA") */
  badgeText?: string;
}

/**
 * Komponen Fullscreen Blocking Loading Overlay untuk Admin AMPERA.
 * Menutup seluruh layar dengan z-index tinggi (z-[99999]), mematikan scroll,
 * dan mencegah admin melakukan klik ganda (double submit) atau keluar selama proses CRUD berlangsung.
 */
export function AdminLoadingOverlay({
  isOpen,
  actionType = "save",
  title,
  description,
  badgeText = "Sistem Admin AMPERA",
}: AdminLoadingOverlayProps) {
  const [mounted, setMounted] = useState(false);
  const [stageProgress, setStageProgress] = useState(35);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Kunci scroll halaman belakang dan jalankan animasi progress bar
  useEffect(() => {
    if (!isOpen) {
      setStageProgress(35);
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Progress bar halus bertahap
    const timer1 = setTimeout(() => setStageProgress(65), 700);
    const timer2 = setTimeout(() => setStageProgress(88), 1800);
    const timer3 = setTimeout(() => setStageProgress(96), 3500);

    // Mencegah penekanan tombol Escape menutup modal lain di bawahnya secara tidak sengaja
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    window.addEventListener("keydown", handleKeyDown, true);

    return () => {
      document.body.style.overflow = previousOverflow;
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      window.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  // Konfigurasi icon dan tema warna berdasarkan actionType
  let defaultTitle = "Menyimpan Data...";
  let defaultDescription =
    "Sistem sedang memproses dan mengamankan perubahan pada database BBPOM di Palembang.";
  let IconComponent = ShieldCheck;
  let iconGradient = "from-[#0b4fd1] via-[#2f86f6] to-[#ff7a1a]";
  let pingBg = "bg-blue-500/15 dark:bg-blue-500/10";
  let ringBorder = "border-t-[#0b4fd1] border-r-[#ff7a1a]";
  let progressGradient = "from-[#0b4fd1] via-[#2f86f6] to-[#ff7a1a]";

  if (actionType === "upload") {
    defaultTitle = "Mengunggah Berkas...";
    defaultDescription =
      "Sedang memproses dan mengunggah dokumen/gambar ke penyimpanan server BBPOM.";
    IconComponent = CloudUpload;
    iconGradient = "from-[#0284c7] via-[#0ea5e9] to-[#38bdf8]";
    pingBg = "bg-sky-500/15 dark:bg-sky-500/10";
    ringBorder = "border-t-sky-600 border-r-cyan-400";
    progressGradient = "from-[#0284c7] via-[#0ea5e9] to-[#38bdf8]";
  } else if (actionType === "delete") {
    defaultTitle = "Menghapus Data...";
    defaultDescription =
      "Sistem sedang menghapus data dari database server BBPOM.";
    IconComponent = Trash2;
    iconGradient = "from-[#e11d48] via-[#f43f5e] to-[#fb923c]";
    pingBg = "bg-rose-500/15 dark:bg-rose-500/10";
    ringBorder = "border-t-rose-600 border-r-orange-400";
    progressGradient = "from-[#e11d48] via-[#f43f5e] to-[#fb923c]";
  } else if (actionType === "reset") {
    defaultTitle = "Mereset ke Pengaturan Awal...";
    defaultDescription =
      "Sedang memulihkan data bawaan sistem BBPOM di Palembang.";
    IconComponent = RotateCcw;
    iconGradient = "from-[#7c3aed] via-[#a855f7] to-[#ec4899]";
    pingBg = "bg-purple-500/15 dark:bg-purple-500/10";
    ringBorder = "border-t-purple-600 border-r-pink-400";
    progressGradient = "from-[#7c3aed] via-[#a855f7] to-[#ec4899]";
  } else if (actionType === "process") {
    defaultTitle = "Memproses Permintaan...";
    defaultDescription =
      "Sedang menjalankan validasi dan pembaruan status data di sistem BBPOM.";
    IconComponent = Sparkles;
    iconGradient = "from-[#0b4fd1] via-[#3b82f6] to-[#10b981]";
    pingBg = "bg-emerald-500/15 dark:bg-emerald-500/10";
    ringBorder = "border-t-blue-600 border-r-emerald-400";
    progressGradient = "from-[#0b4fd1] via-[#3b82f6] to-[#10b981]";
  }

  const finalTitle = title || defaultTitle;
  const finalDescription = description || defaultDescription;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-live="assertive"
      aria-label={finalTitle}
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-hidden select-none"
    >
      {/* 1. Backdrop Gelap Transparan dengan Blur Penuh */}
      <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md transition-opacity duration-300 animate-fade-in" />

      {/* 2. Kartu Utama Loading */}
      <div className="relative z-10 w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.6)] p-6 sm:p-8 text-center animate-fade-up overflow-hidden">
        {/* Aksen Garis Gradien Atas */}
        <div
          className={`absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r ${progressGradient}`}
        />

        {/* Cahaya Dekoratif Latar */}
        <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 w-56 h-56 rounded-full bg-blue-500/10 dark:bg-blue-400/10 blur-3xl" />

        {/* Badge Pengenal Proses */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/60 text-[#0b4fd1] dark:text-blue-300 text-[11px] font-bold uppercase tracking-wider mb-5">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span>{badgeText}</span>
        </div>

        {/* Animasi Spinner Berlapis dengan Icon Tengah */}
        <div className="relative mx-auto w-24 h-24 flex items-center justify-center mb-6">
          {/* Ring Luar Berdenyut */}
          <div
            className={`absolute inset-0 rounded-full ${pingBg} animate-ping`}
            style={{ animationDuration: "2.2s" }}
          />

          {/* Ring Putar Luar */}
          <div className="absolute inset-1 rounded-full border-4 border-slate-100 dark:border-slate-800" />
          <div
            className={`absolute inset-1 rounded-full border-4 border-transparent ${ringBorder} animate-spin`}
          />

          {/* Kotak Icon Dalam */}
          <div
            className={`relative w-14 h-14 rounded-2xl bg-gradient-to-tr ${iconGradient} text-white flex items-center justify-center shadow-lg shadow-blue-500/25`}
          >
            <IconComponent className="w-7 h-7 animate-pulse" />
          </div>
        </div>

        {/* Judul & Deskripsi Interaktif */}
        <h3 className="font-brand font-extrabold text-lg sm:text-xl text-[#0f2257] dark:text-white tracking-tight">
          {finalTitle}
        </h3>
        <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          {finalDescription}
        </p>

        {/* Progress Bar Dinamis */}
        <div className="mt-6 w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden p-0.5">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${progressGradient} transition-all duration-700 ease-out`}
            style={{ width: `${stageProgress}%` }}
          />
        </div>

        {/* Catatan Anti-Panik & Kunci Layar */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-center gap-2 text-[11px] sm:text-xs font-semibold text-amber-700 dark:text-amber-400">
          <Lock className="w-3.5 h-3.5 shrink-0" />
          <span>Mohon jangan menutup atau memuat ulang halaman ini</span>
        </div>
      </div>
    </div>,
    document.body
  );
}


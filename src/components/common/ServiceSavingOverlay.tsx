"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  ShieldCheck,
  CloudUpload,
  CheckCircle2,
  Loader2,
  Lock,
  Sparkles,
} from "lucide-react";

export interface ServiceSavingOverlayProps {
  /** Status apakah proses penyimpanan sedang berlangsung */
  isOpen: boolean;
  /** Nama layanan yang sedang diproses (misal: "Permintaan Informasi", "Pengujian Cepat", "Pengaduan Masyarakat", "Keterbukaan Informasi PPID") */
  serviceName?: string;
  /** Judul utama pada tampilan loading */
  title?: string;
  /** Deskripsi tambahan di bawah judul */
  description?: string;
  /** Apakah layanan ini menyertakan upload dokumen/foto (menampilkan tahapan upload berkas) */
  hasFileUpload?: boolean;
}

/**
 * Komponen Tampilan Loading Layar Penuh (Blocking Overlay)
 * Menangani tampilan proses penyimpanan pada halaman Layanan agar halaman form
 * tidak tetap terbuka/interaktif dan pengguna mendapatkan umpan balik visual yang jelas.
 */
export function ServiceSavingOverlay({
  isOpen,
  serviceName = "Layanan Publik AMPERA",
  title = "Menyimpan Permohonan Layanan...",
  description = "Sistem sedang memproses dan menyimpan data permohonan Anda ke server resmi BBPOM di Palembang.",
  hasFileUpload = false,
}: ServiceSavingOverlayProps) {
  const [mounted, setMounted] = useState(false);
  const [activeStage, setActiveStage] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Kunci scroll halaman belakang dan jalankan animasi tahapan proses saat proses menyimpan aktif
  useEffect(() => {
    if (!isOpen) {
      setActiveStage(0);
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const timer1 = setTimeout(() => setActiveStage(1), 900);
    const timer2 = setTimeout(() => setActiveStage(2), 2200);

    return () => {
      document.body.style.overflow = previousOverflow;
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const stages = hasFileUpload
    ? [
        "Memvalidasi & mengenkripsi data identitas pemohon",
        "Mengunggah berkas lampiran ke penyimpanan aman",
        "Menerbitkan nomor tiket & mengirim notifikasi layanan",
      ]
    : [
        "Memvalidasi & mengenkripsi data identitas pemohon",
        "Menyimpan rincian pengajuan ke database BBPOM",
        "Menerbitkan nomor tiket & mengirim notifikasi layanan",
      ];

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-live="assertive"
      aria-label={title}
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6 overflow-hidden select-none"
    >
      {/* Lapisan Penutup Penuh (Menutup halaman form agar tidak bisa diklik selama menyimpan) */}
      <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md transition-opacity duration-300 animate-fade-in" />

      {/* Kartu Utama Loading Menyimpan */}
      <div className="relative z-10 w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.5)] p-6 sm:p-8 text-center animate-fade-up overflow-hidden">
        {/* Aksen Garis Gradient Atas */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#ff8a1f] via-amber-400 to-[#f26a0f]" />

        {/* Cahaya Dekoratif Latar */}
        <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 w-56 h-56 rounded-full bg-brand-orange/15 blur-3xl" />

        {/* Badge Kategori Layanan */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-orange-50 dark:bg-orange-950/60 border border-orange-200/80 dark:border-orange-800/60 text-brand-orange dark:text-orange-400 text-[11px] font-bold uppercase tracking-wider mb-5">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{serviceName}</span>
        </div>

        {/* Animasi Spinner Berlapis */}
        <div className="relative mx-auto w-24 h-24 flex items-center justify-center mb-6">
          {/* Ring Luar Berdenyut */}
          <div className="absolute inset-0 rounded-full bg-orange-500/15 dark:bg-orange-500/10 animate-ping" style={{ animationDuration: "2s" }} />
          {/* Ring Putar Luar */}
          <div className="absolute inset-1 rounded-full border-4 border-slate-100 dark:border-slate-800" />
          <div className="absolute inset-1 rounded-full border-4 border-transparent border-t-brand-orange border-r-amber-400 animate-spin" />
          {/* Lingkaran Dalam */}
          <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#ff8a1f] to-[#f26a0f] text-white flex items-center justify-center shadow-lg shadow-orange-500/30">
            {hasFileUpload ? (
              <CloudUpload className="w-7 h-7 animate-pulse" />
            ) : (
              <ShieldCheck className="w-7 h-7 animate-pulse" />
            )}
          </div>
        </div>

        {/* Judul & Deskripsi */}
        <h3 className="font-brand font-extrabold text-lg sm:text-xl text-navy-900 dark:text-white tracking-tight">
          {title}
        </h3>
        <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          {description}
        </p>

        {/* Progress Bar Berjalan */}
        <div className="mt-6 w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden p-0.5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#ff8a1f] via-amber-400 to-[#f26a0f] transition-all duration-700 ease-out"
            style={{
              width: activeStage === 0 ? "38%" : activeStage === 1 ? "72%" : "92%",
            }}
          />
        </div>

        {/* Daftar Tahapan Penyimpanan */}
        <div className="mt-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 p-4 text-left space-y-2.5">
          {stages.map((stageText, idx) => {
            const isDone = activeStage > idx;
            const isCurrent = activeStage === idx;

            return (
              <div
                key={idx}
                className={`flex items-center gap-2.5 text-xs transition-all duration-300 ${
                  isDone
                    ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                    : isCurrent
                    ? "text-navy-900 dark:text-white font-bold"
                    : "text-slate-400 dark:text-slate-500"
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-brand-orange animate-spin shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600 shrink-0" />
                )}
                <span className="leading-snug">{stageText}</span>
              </div>
            );
          })}
        </div>

        {/* Peringatan Jangan Tutup Halaman */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-center gap-2 text-[11px] sm:text-xs font-semibold text-amber-700 dark:text-amber-400">
          <Lock className="w-3.5 h-3.5 shrink-0" />
          <span>Mohon jangan menutup atau memuat ulang halaman ini</span>
        </div>
      </div>
    </div>,
    document.body
  );
}


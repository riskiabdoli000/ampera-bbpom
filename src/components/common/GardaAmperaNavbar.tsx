"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Sun,
  Moon,
  Menu,
  X,
  ArrowLeft,
  ShieldCheck,
  Award,
  BookOpen,
  GraduationCap,
  Info,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";

interface GardaAmperaNavbarProps {
  currentStepTitle?: string;
  showBackToPortal?: boolean;
}

export function GardaAmperaNavbar({
  currentStepTitle,
  showBackToPortal = true,
}: GardaAmperaNavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (savedTheme === "dark" || (!savedTheme && systemPrefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
    }

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  const guideSteps = [
    {
      no: 1,
      title: "Isi Biodata Peserta",
      desc: "Lengkapi NIK, nama lengkap, usia, dan data instansi untuk pencetakan sertifikat resmi.",
      icon: ShieldCheck,
      color: "text-blue-600 bg-blue-50 dark:bg-blue-950/70 border-blue-200 dark:border-blue-800",
    },
    {
      no: 2,
      title: "Pre-Test Diagnostik",
      desc: "Uji pemahaman awal Anda mengenai obat dan makanan aman. Tidak ada syarat batas nilai minimal.",
      icon: BookOpen,
      color: "text-amber-600 bg-amber-50 dark:bg-amber-950/70 border-amber-200 dark:border-amber-800",
    },
    {
      no: 3,
      title: "Pelajari 3 Modul Materi",
      desc: "Pelajari materi interaktif tentang Obat Aman, Kosmetik Berizin, dan Pangan Sehat bebas zat berbahaya.",
      icon: BookOpen,
      color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/70 border-emerald-200 dark:border-emerald-800",
    },
    {
      no: 4,
      title: "Post-Test (KKM 70)",
      desc: "Evaluasi akhir kompetensi dengan KKM minimal 70. Jika belum memenuhi, Anda dapat mengulang tes.",
      icon: GraduationCap,
      color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/70 border-indigo-200 dark:border-indigo-800",
    },
    {
      no: 5,
      title: "Evaluasi Pelatihan",
      desc: "Berikan masukan singkat untuk peningkatan kualitas materi edukasi BBPOM di Palembang.",
      icon: CheckCircle2,
      color: "text-purple-600 bg-purple-50 dark:bg-purple-950/70 border-purple-200 dark:border-purple-800",
    },
    {
      no: 6,
      title: "Unduh Sertifikat PDF Resmi",
      desc: "Dapatkan sertifikat kelulusan berkode verifikasi resmi langsung setelah menyelesaikan seluruh alur.",
      icon: Award,
      color: "text-brand-orange bg-orange-50 dark:bg-orange-950/70 border-orange-200 dark:border-orange-800",
    },
  ];

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-50 w-full transition-all duration-300 ${
          isScrolled
            ? "bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-[0_8px_30px_-18px_rgb(11_42_107/0.3)] py-3"
            : "bg-white/60 dark:bg-slate-950/60 backdrop-blur-xs py-4 sm:py-5"
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
          <div className="relative flex items-center justify-between gap-3">
            {/* Sisi Kiri: Logo & Identitas Garda Ampera */}
            <div className="flex items-center gap-3 sm:gap-4 z-20">
              <Link
                href="/"
                className="flex items-center gap-3 group focus:outline-hidden"
                aria-label="Kembali ke Beranda AMPERA BBPOM Palembang"
              >
                <div className="relative h-12 w-16 sm:h-14 sm:w-20 md:h-16 md:w-24 shrink-0 transition-transform duration-300 group-hover:scale-105">
                  <Image
                    src="/assets-landingpage/garda_ampera_logo.png"
                    alt="Logo Garda Ampera"
                    width={160}
                    height={106}
                    className="w-full h-full object-contain"
                    priority
                  />
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="font-brand font-extrabold text-base sm:text-lg lg:text-xl tracking-tight text-navy-900 dark:text-white whitespace-nowrap">
                    GARDA <span className="text-brand-orange">AMPERA</span>
                  </span>
                  {/* Teks kepanjangan disembunyikan di mobile agar navbar tetap ringkas dan tidak bertumpuk */}
                  <span className="hidden sm:inline-block font-brand font-medium text-[11px] lg:text-xs text-brand-orange dark:text-orange-400 tracking-wide mt-0.5 max-w-sm lg:max-w-xl leading-snug">
                    Gerakan Antisipasi Risiko, Deteksi, dan Aksi untuk Amankan Produk, Edukasi Masyarakat
                  </span>
                </div>
              </Link>

              {/* Status Step Pill (Jika Disediakan) */}
              {currentStepTitle && (
                <div className="hidden xl:flex items-center gap-2 pl-4 border-l border-slate-200 dark:border-slate-800">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    {currentStepTitle}
                  </span>
                </div>
              )}
            </div>

            {/* Sisi Kanan: Action Buttons */}
            <div className="flex items-center gap-2 sm:gap-2.5 z-20">
              {/* Tombol Panduan Alur & KKM (Tampil di sm ke atas) */}
              <button
                type="button"
                onClick={() => setShowGuideModal(true)}
                className="hidden sm:inline-flex items-center gap-1.5 font-brand rounded-full px-3.5 py-2 text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 border border-blue-200/80 dark:border-blue-800 transition-all cursor-pointer shadow-2xs hover:scale-102"
                title="Panduan Alur & KKM"
              >
                <Info className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Panduan Alur & KKM</span>
              </button>

              {/* Kembali ke Portal Utama AMPERA (Tampil di md ke atas) */}
              {showBackToPortal && (
                <Link
                  href="/"
                  className="hidden md:inline-flex items-center gap-1.5 font-brand text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-brand-orange dark:hover:text-brand-orange bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 px-3.5 py-2 rounded-full border border-slate-200 dark:border-slate-800 shadow-2xs transition-all hover:scale-102"
                  title="Kembali ke Portal Beranda AMPERA"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Portal AMPERA</span>
                </Link>
              )}

              {/* Theme Toggle Button (Tampil di sm ke atas) */}
              <button
                type="button"
                onClick={toggleTheme}
                className="hidden sm:flex w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-navy-900 dark:text-yellow-400 items-center justify-center shadow-xs hover:border-brand-orange hover:scale-105 active:scale-95 transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-brand-orange"
                aria-label={isDark ? "Ganti ke tema terang" : "Ganti ke tema gelap"}
              >
                {isDark ? (
                  <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700 dark:text-slate-200" />
                )}
              </button>

              {/* Mobile Menu Button (Hamburger) */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700 text-navy-900 dark:text-white flex items-center justify-center shadow-xs active:scale-95 cursor-pointer focus-visible:outline-2 focus-visible:outline-brand-orange"
                aria-label="Buka menu navigasi Garda Ampera"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? (
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <Menu className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Drawer */}
          {mobileMenuOpen && (
            <div className="mt-3 lg:hidden rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-4 sm:p-5 shadow-2xl animate-fade-up relative z-50">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-brand-orange" />
                  <span className="text-xs font-bold text-navy-900 dark:text-white uppercase tracking-wider">
                    Menu Garda Ampera
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/70 px-2 py-0.5 rounded-md">
                  KKM 70 • Sertifikat
                </span>
              </div>

              {/* Tombol Panduan di Mobile Drawer */}
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setShowGuideModal(true);
                }}
                className="w-full mb-2.5 flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200 text-xs font-bold transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Panduan Alur Belajar & KKM</span>
                </span>
                <span className="text-[10px] bg-blue-200/70 dark:bg-blue-800 px-1.5 py-0.5 rounded">
                  Buka
                </span>
              </button>

              {/* Night Mode Toggle di Mobile Drawer */}
              <button
                type="button"
                onClick={toggleTheme}
                className="w-full mb-3 flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-navy-900 dark:text-slate-100 transition-colors cursor-pointer hover:border-brand-orange"
                aria-label={isDark ? "Beralih ke mode terang" : "Beralih ke mode gelap"}
              >
                <span className="flex items-center gap-2.5 text-xs font-semibold">
                  {isDark ? (
                    <Sun className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Moon className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                  )}
                  <span>{isDark ? "Mode Terang" : "Mode Gelap"}</span>
                </span>
                <div
                  className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors duration-200 ${
                    isDark ? "bg-brand-orange" : "bg-slate-300 dark:bg-slate-600"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white shadow-xs transition-transform duration-200 ${
                      isDark ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </div>
              </button>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-800 py-2.5 text-xs font-bold text-navy-900 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Kembali ke Portal Beranda AMPERA</span>
                </Link>

                <Link
                  href="/#kontak"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#ff8a1f] to-[#f26a0f] py-2.5 text-xs font-bold text-white shadow-cta hover:shadow-orange-500/25 transition-all"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Pusat Bantuan & Kontak BBPOM</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Modal Panduan Alur Belajar & Syarat Sertifikat */}
      {showGuideModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
          onClick={() => setShowGuideModal(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Modal */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-navy-900 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <ShieldCheck className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="font-brand font-extrabold text-base sm:text-lg text-navy-900 dark:text-white leading-tight">
                    Panduan Alur Belajar & Sertifikasi
                  </h3>
                  <p className="text-xs text-brand-orange font-semibold mt-0.5">
                    Garda Ampera • BBPOM di Palembang
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
                aria-label="Tutup panduan"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Syarat Penting Kelulusan */}
            <div className="my-4 p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 flex items-start gap-3">
              <Award className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-bold text-amber-900 dark:text-amber-300">
                  Syarat Kelulusan & Perolehan Sertifikat:
                </p>
                <p className="text-amber-800/90 dark:text-amber-300/80 mt-1 leading-relaxed">
                  Peserta wajib mencapai nilai Post-Test minimal <strong>KKM 70</strong>. Jika belum mencapai KKM, peserta dapat mengulang kembali pengujian hingga lulus.
                </p>
              </div>
            </div>

            {/* List 6 Langkah Alur */}
            <div className="space-y-2.5">
              <p className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                6 Tahapan Pembelajaran
              </p>
              <div className="grid grid-cols-1 gap-2.5">
                {guideSteps.map((step) => {
                  const Icon = step.icon;
                  return (
                    <div
                      key={step.no}
                      className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60"
                    >
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-extrabold shrink-0 border ${step.color}`}
                      >
                        {step.no}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-navy-900 dark:text-white">
                            {step.title}
                          </h4>
                          <Icon className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tombol Tutup */}
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer text-center"
              >
                Saya Mengerti, Mulai Belajar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Alias exports for convenience
export { GardaAmperaNavbar as GardaNavbar, GardaAmperaNavbar as GardaSubNavbar };


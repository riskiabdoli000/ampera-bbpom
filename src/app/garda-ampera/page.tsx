import React from "react";
import type { Metadata } from "next";
import { GardaAmperaNavbar } from "@/components/common/GardaAmperaNavbar";
import { Footer } from "@/components/landing/Footer";
import { GardaAmperaContainer } from "@/components/garda-ampera/GardaAmperaContainer";
import { ShieldCheck, Award, BookOpen, GraduationCap, CheckCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Garda Ampera - Pre-Test, Edukasi & Sertifikasi Resmi | BBPOM di Palembang",
  description:
    "Portal terpadu edukasi masyarakat dan kader sadar obat dan makanan aman. Ikuti Pre-Test, pelajari 3 modul materi resmi, selesaikan Post-Test minimal KKM 70, dan unduh sertifikat kelulusan resmi BBPOM Palembang.",
};

export default function GardaAmperaPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#f2f7ff] via-white to-[#f0f6ff] dark:from-slate-950 dark:via-[#06122e]/40 dark:to-slate-950 text-slate-800 dark:text-slate-100 flex flex-col selection:bg-brand-orange selection:text-white overflow-x-hidden transition-colors duration-300">
      {/* 1. Navbar Subpage Khusus Garda Ampera POM */}
      <GardaAmperaNavbar />

      {/* 2. Container Halaman Utama */}
      <div className="flex-1 w-full pt-28 sm:pt-32 pb-16 sm:pb-24">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Title Section */}
          <div className="relative mb-8 sm:mb-12 max-w-3xl mx-auto text-center animate-fade-up">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 text-xs font-bold uppercase tracking-widest mb-3">
              <ShieldCheck className="w-4 h-4 text-brand-orange" />
              PORTAL E-LEARNING
            </div>

            <h1 className="font-brand font-extrabold text-3xl sm:text-4xl lg:text-[46px] leading-[1.15] tracking-tight text-navy-900 dark:text-white">
              Garda <span className="text-brand-orange">Ampera</span>
            </h1>

            <p className="text-sm sm:text-base font-semibold text-blue-700 dark:text-blue-300 mt-1 uppercase tracking-wide">
              Gerakan Antisipasi Risiko, Deteksi, dan Aksi untuk Amankan <br />Produk, Edukasi Masyarakat
            </p>

            <p className="mt-3 text-xs sm:text-sm text-ink-soft dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
              Ikuti pengujian awal (Pre-Test), pelajari 3 modul materi edukasi secara
              berjenjang, buktikan pemahaman Anda pada Post-Test (KKM 70), dan dapatkan Sertifikat
              Kelulusan Resmi dari Balai Besar POM di Palembang.
            </p>

            {/* Quick Feature Highlights */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs font-semibold">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-xs">
                <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
                Pre-Test Diagnostik
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-xs">
                <BookOpen className="w-3.5 h-3.5 text-amber-500" />
                3 Modul Slide Berjenjang
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-xs">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
                Post-Test KKM 70
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-xs">
                <Award className="w-3.5 h-3.5 text-emerald-600" />
                Sertifikat PDF Resmi
              </span>
            </div>
          </div>

          {/* 3. Main Garda Ampera Multi-step Interactive Container */}
          <GardaAmperaContainer />
        </div>
      </div>

      {/* 4. Footer Resmi */}
      <Footer />
    </main>
  );
}

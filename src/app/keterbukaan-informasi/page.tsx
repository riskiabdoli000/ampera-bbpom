import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Home, ChevronRight } from "lucide-react";
import { SubpageNavbar } from "@/components/common/SubpageNavbar";
import { KeterbukaanInformasiForm } from "./KeterbukaanInformasiForm";
import { Footer } from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: "Formulir Permohonan Keterbukaan Informasi Publik - BBPOM Palembang",
  description:
    "Formulir resmi permohonan informasi publik PPID BBPOM di Palembang sesuai amanat Undang-Undang No. 14 Tahun 2008 tentang Keterbukaan Informasi Publik.",
};

export default function KeterbukaanInformasiPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#f2f7ff] via-white to-[#f0f6ff] dark:from-slate-950 dark:via-[#06122e]/40 dark:to-slate-950 text-slate-800 dark:text-slate-100 flex flex-col selection:bg-brand-orange selection:text-white overflow-x-hidden transition-colors duration-300">
      {/* 1. Navbar Subpage Khusus Layanan */}
      <SubpageNavbar activePage="layanan" />

      {/* 2. Container Halaman Utama */}
      <div className="flex-1 w-full pt-28 sm:pt-32 pb-16 sm:pb-24">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-10 lg:px-14">


          {/* Header Section (Judul & Deskripsi Langsung Form) */}
          <div className="relative mb-8 sm:mb-10 max-w-3xl mx-auto text-center animate-fade-up">
            <span className="inline-block text-xs sm:text-sm font-extrabold uppercase tracking-[0.2em] text-brand-orange dark:text-orange-400 mb-2">
              LAYANAN PPID BBPOM
            </span>
            <h1 className="font-brand font-extrabold text-3xl sm:text-4xl lg:text-[44px] leading-[1.15] tracking-tight text-navy-900 dark:text-white">
              Formulir{" "}
              <span className="text-brand-orange">Keterbukaan Informasi</span>
            </h1>
            <p className="mt-3 text-sm sm:text-base text-ink-soft dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
              Akses transparan terhadap informasi resmi, dokumen publik, SOP pengawasan, anggaran, serta laporan kinerja PPID BBPOM di Palembang sesuai amanat UU No. 14 Tahun 2008.
            </p>
          </div>

          {/* Formulir Utama Keterbukaan Informasi */}
          <KeterbukaanInformasiForm />
        </div>
      </div>

      {/* 3. Footer */}
      <Footer />
    </main>
  );
}

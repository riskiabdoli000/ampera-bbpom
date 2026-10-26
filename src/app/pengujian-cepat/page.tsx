import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Home, ChevronRight } from "lucide-react";
import { SubpageNavbar } from "@/components/common/SubpageNavbar";
import { PengujianCepatForm } from "./PengujianCepatForm";
import { Footer } from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: "Formulir Pengujian Cepat AMPERA - BBPOM Palembang",
  description:
    "Formulir pengajuan layanan pengujian cepat (Rapid Test Kit) BBPOM di Palembang untuk mendeteksi bahan berbahaya pada produk pangan.",
};

export default function PengujianCepatPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#f2f7ff] via-white to-[#f0f6ff] dark:from-slate-950 dark:via-[#06122e]/40 dark:to-slate-950 text-slate-800 dark:text-slate-100 flex flex-col selection:bg-brand-orange selection:text-white overflow-x-hidden transition-colors duration-300">
      {/* 1. Navbar Subpage Khusus Layanan */}
      <SubpageNavbar activePage="layanan" />

      {/* 2. Container Halaman Utama */}
      <div className="flex-1 w-full pt-28 sm:pt-32 pb-16 sm:pb-24">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-10 lg:px-14">
          {/* Breadcrumb Navigasi */}
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-xs sm:text-sm text-ink-soft dark:text-slate-400 mb-8 animate-fade-up"
          >
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 hover:text-brand-orange transition-colors"
            >
              <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-orange" />
              <span>Beranda</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
            <Link
              href="/#layanan"
              className="hover:text-brand-orange transition-colors"
            >
              Layanan
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
            <span className="font-semibold text-navy-900 dark:text-white">
              Pengujian Cepat
            </span>
          </nav>

          {/* Header Section (Judul & Deskripsi Langsung Form) */}
          <div className="relative mb-8 sm:mb-10 max-w-3xl animate-fade-up">
            <span className="inline-block text-xs sm:text-sm font-extrabold uppercase tracking-[0.2em] text-brand-orange dark:text-orange-400 mb-2">
              LAYANAN AMPERA
            </span>
            <h1 className="font-brand font-extrabold text-3xl sm:text-4xl lg:text-[44px] leading-[1.15] tracking-tight text-navy-900 dark:text-white">
              Formulir{" "}
              <span className="text-brand-orange">Pengujian Cepat</span>
            </h1>
            <p className="mt-3 text-sm sm:text-base text-ink-soft dark:text-slate-300 leading-relaxed max-w-2xl">
              Lengkapi data berikut untuk mengajukan layanan pengujian cepat di BBPOM Palembang.
            </p>
          </div>

          {/* Formulir Utama Pengujian Cepat */}
          <PengujianCepatForm />
        </div>
      </div>

      {/* 3. Footer Resmi Portal BBPOM Palembang */}
      <Footer />
    </main>
  );
}

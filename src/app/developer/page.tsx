import React from "react";
import type { Metadata } from "next";
import { SubpageNavbar } from "@/components/common/SubpageNavbar";
import { Footer } from "@/components/landing/Footer";
import { DeveloperView } from "@/components/developer/DeveloperView";

export const metadata: Metadata = {
  title: "Tim Pengembang (Developers) - AMPERA BBPOM di Palembang",
  description:
    "Profil pengembang di balik aplikasi AMPERA Balai Besar Pengawas Obat dan Makanan di Palembang: Riski Abdoli (Backend) & Fatreisya Ayu Miranda / Tea (Frontend).",
};

export default function DeveloperPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#fffbf5] via-white to-[#fff8ee] dark:from-slate-950 dark:via-[#0c1324] dark:to-slate-950 text-slate-800 dark:text-slate-100 flex flex-col selection:bg-brand-orange selection:text-white overflow-x-hidden transition-colors duration-300">
      {/* 1. Navbar Subpage Khusus Developer (Hanya Logo, Tulisan AMPERA, Tombol Mode Siang/Malam, dan Tombol Kembali ke Beranda) */}
      <SubpageNavbar showNavLinks={false} showBackToHome={true} />

      {/* 2. Container Halaman Utama Developer */}
      <div className="flex-1 w-full pt-16 sm:pt-20">
        <DeveloperView />
      </div>

      {/* 3. Footer Resmi BBPOM Palembang */}
      <Footer />
    </main>
  );
}


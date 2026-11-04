import React from "react";
import type { Metadata } from "next";
import { SubpageNavbar } from "@/components/common/SubpageNavbar";
import { Footer } from "@/components/landing/Footer";
import { MateriEdukasiView } from "@/components/materi-edukasi/MateriEdukasiView";

export const metadata: Metadata = {
  title: "Materi Edukasi Obat & Makanan - BBPOM di Palembang",
  description:
    "Pusat materi edukasi resmi BBPOM di Palembang mengenai keamanan pangan, kosmetik, obat, dan obat tradisional untuk masyarakat.",
};

export default function EdukasiPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#f2f7ff] via-white to-[#f0f6ff] dark:from-slate-950 dark:via-[#06122e]/40 dark:to-slate-950 text-slate-800 dark:text-slate-100 flex flex-col selection:bg-brand-orange selection:text-white overflow-x-hidden transition-colors duration-300">
      {/* 1. Navbar Subpage Konsisten */}
      <SubpageNavbar activePage="edukasi" />

      {/* 2. Container Halaman Utama Materi Edukasi */}
      <div className="flex-1 w-full pt-24 sm:pt-28">
        <MateriEdukasiView />
      </div>

      {/* 3. Footer Resmi BBPOM Palembang */}
      <Footer />
    </main>
  );
}


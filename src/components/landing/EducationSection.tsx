"use client";

import React from "react";
import Image from "next/image";
import { BookOpen, GraduationCap, Lightbulb, Video, ArrowRight } from "lucide-react";

interface EducationCard {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  actionText: string;
  href: string;
}

const EDUCATION_CARDS: EducationCard[] = [
  {
    id: "artikel",
    title: "Ketersediaan Farmasi",
    description: "Baca informasi dan wawasan edukatif seputar keamanan obat & pangan.",
    icon: BookOpen,
    actionText: "Baca Artikel",
    href: "#edukasi",
  },
  {
    id: "panduan",
    title: "Keamanan Pangan",
    description: "Pelajari panduan praktis cara Cek KLIK, izin edar, dan higienitas.",
    icon: GraduationCap,
    actionText: "Lihat Panduan",
    href: "#edukasi",
  },
  {
    id: "tips",
    title: "Cek BPOM",
    description: "Temukan tips cerdas memilih produk yang aman dan teruji bermutu.",
    icon: Lightbulb,
    actionText: "Pelajari Tips",
    href: "#edukasi",
  },
  {
    id: "video",
    title: "Informasi Umum",
    description: "Belajar melalui konten visual menarik dan video animasi edukasi.",
    icon: Video,
    actionText: "Tonton Video",
    href: "#edukasi",
  },
];

export function EducationSection() {
  return (
    <section
      id="edukasi"
      className="relative w-full pt-14 sm:pt-20 pb-6 sm:pb-10 bg-gradient-to-b from-white via-sky-50/30 to-white dark:from-slate-950 dark:via-[#06122e]/20 dark:to-slate-950 transition-colors duration-300 overflow-hidden scroll-mt-20"
    >
      <div className="relative max-w-[1440px] mx-auto px-4 sm:px-10 lg:px-14">
        {/* ========================================================= */}
        {/* BANNER ATAS: Teks di Kiri + Foto hero2.png di Kanan       */}
        {/* ========================================================= */}
        <div className="relative w-full rounded-3xl min-h-[390px] sm:min-h-[420px] lg:min-h-[450px] pb-28 sm:pb-32 lg:pb-36 flex items-start overflow-hidden">
          {/* Foto hero2.png di Sisi Kanan menyatu langsung di belakang kartu */}
          <div className="absolute right-0 top-0 w-full sm:w-[65%] lg:w-[58%] h-full z-0 select-none">
            <Image
              src="/assets-landingpage/hero2.png"
              alt="Pusat Edukasi BBPOM Palembang"
              fill
              sizes="(max-width: 640px) 100vw, 58vw"
              className="object-cover object-[75%_center]"
            />
            {/* Gradien Fade Putih Halus dari Kiri agar Gambar Menyatu Sempurna dengan Teks */}
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/85 to-transparent dark:from-slate-950 dark:via-slate-950/85 dark:to-transparent pointer-events-none" />
          </div>

          {/* Konten Teks di Sisi Kiri */}
          <div className="relative z-10 max-w-xl pt-18 sm:pt-14 lg:pt-14 px-2 sm:px-0">
            <span className="block text-[11px] sm:text-xs md:text-sm font-extrabold uppercase tracking-wider sm:tracking-[0.2em] text-brand-orange-600 dark:text-orange-400 mb-1.5 sm:mb-3">
              Pusat Literasi Konsumen
            </span>
            <h2 className="font-brand font-extrabold text-navy-900 dark:text-white text-2xl sm:text-3xl md:text-4xl lg:text-[46px] leading-tight sm:leading-[1.12] tracking-tight">
              Pusat Edukasi{" "}
              <span className="block text-brand-orange">Informasi &amp; Pembelajaran</span>
            </h2>
            <p className="mt-2.5 sm:mt-4 text-xs sm:text-base text-ink-soft dark:text-slate-300 leading-relaxed max-w-lg">
              Akses berbagai informasi edukatif yang bermanfaat serta sumber belajar terpercaya untuk mendukung pemahaman masyarakat terhadap produk obat dan makanan yang aman.
            </p>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 4 KARTU KATEGORI EDUKASI (Menempel & Overlap ke Gambar)   */}
        {/* ========================================================= */}
        <div className="relative z-20 -mt-20 sm:-mt-24 lg:-mt-28 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {EDUCATION_CARDS.map((card) => {
            const IconComponent = card.icon;
            return (
              <div
                key={card.id}
                className="group rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-100 dark:border-slate-800 p-7 sm:p-8 flex flex-col items-center text-center shadow-[0_10px_35px_-15px_rgb(11_42_107/0.07)] hover:shadow-card hover:-translate-y-2 transition-all duration-300"
              >
                {/* Ikon Besar Berbingkai Lembut */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-orange-50 dark:bg-orange-500/15 border border-orange-100/70 dark:border-orange-500/20 text-brand-orange dark:text-orange-400 flex items-center justify-center group-hover:bg-brand-orange group-hover:text-white group-hover:scale-110 transition-all duration-300 shadow-xs">
                  <IconComponent className="w-7 h-7 stroke-[1.9]" />
                </div>

                {/* Judul Kartu */}
                <h3 className="font-brand font-bold text-lg sm:text-xl text-navy-900 dark:text-white mt-5 group-hover:text-brand-orange transition-colors">
                  {card.title}
                </h3>

                {/* Garis Aksen Pembatas Oranye */}
                <div className="w-10 h-0.5 rounded-full bg-brand-orange/40 my-3.5 group-hover:w-14 group-hover:bg-brand-orange transition-all duration-300" />

                {/* Deskripsi Singkat */}
                <p className="text-xs sm:text-[13px] text-ink-soft dark:text-slate-400 leading-relaxed max-w-[220px]">
                  {card.description}
                </p>

                {/* Link Aksi dengan Panah Interaktif */}
                <div className="mt-6">
                  <a
                    href={card.href}
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-brand-orange hover:text-brand-orange-600 transition-colors group/link"
                  >
                    <span>{card.actionText}</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover/link:translate-x-1" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

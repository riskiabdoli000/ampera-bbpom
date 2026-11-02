"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  GraduationCap,
  Lightbulb,
  Video,
  ArrowRight,
  ShieldCheck,
  FileText,
  Utensils,
  FlaskConical,
  Sparkles,
  CheckCircle2,
  HeartHandshake,
  Award,
} from "lucide-react";
import { EducationPdfModal } from "./EducationPdfModal";
import type { EdukasiItemData } from "@/app/actions/settings-edukasi";

const ICON_MAP: Record<string, React.ElementType> = {
  ShieldCheck,
  BookOpen,
  FileText,
  Utensils,
  FlaskConical,
  Sparkles,
  Lightbulb,
  CheckCircle2,
  HeartHandshake,
  Award,
};

interface EducationCard {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  actionText: string;
  href: string;
  isPdf?: boolean;
  pdfTitle?: string;
  pdfBadge?: string;
  pdfUrl?: string;
  pdfFilename?: string;
}

interface EducationSectionProps {
  initialData?: EdukasiItemData[];
}

export function EducationSection({ initialData }: EducationSectionProps) {
  const [selectedPdfCard, setSelectedPdfCard] = useState<EducationCard | null>(null);

  // Konversi daftar kartu edukasi yang dikelola Admin menjadi EducationCard
  const dynamicPdfCards: EducationCard[] =
    initialData && initialData.length > 0
      ? initialData.map((item) => ({
          id: `edukasi-${item.id}`,
          title: item.judul,
          description: item.deskripsi,
          icon: (item.icon && ICON_MAP[item.icon]) || ShieldCheck,
          actionText: "Baca Artikel",
          href: "#edukasi",
          isPdf: true,
          pdfTitle: item.judul,
          pdfBadge: `Materi Edukasi • ${item.judul}`,
          pdfUrl: item.pdfUrl || "/documents/materi-edukasi-bbpom.pdf",
          pdfFilename: item.pdfFilename || "Panduan-Keamanan-Pangan-BBPOM.pdf",
        }))
      : [
          {
            id: "panduan",
            title: "Keamanan Pangan",
            description:
              "Pelajari panduan praktis cara Cek KLIK, izin edar, dan higienitas.",
            icon: ShieldCheck,
            actionText: "Baca Artikel",
            href: "#edukasi",
            isPdf: true,
            pdfTitle: "Panduan Praktis Keamanan Pangan & Cek KLIK",
            pdfBadge: "Panduan Keamanan Pangan",
            pdfUrl: "/documents/materi-edukasi-bbpom.pdf",
            pdfFilename: "Panduan-Keamanan-Pangan-BBPOM.pdf",
          },
        ];

  const educationCards: EducationCard[] = [
    {
      id: "garda-ampera",
      title: "Garda Ampera",
      description:
        "Portal edukasi (E-learning) sadar obat & pangan aman, pelajari modul, ikuti kuis, dan raih sertifikat resmi.",
      icon: GraduationCap,
      actionText: "Akses Garda Ampera",
      href: "/garda-ampera",
    },
    ...dynamicPdfCards,
    {
      id: "tips",
      title: "Cek BPOM",
      description:
        "Temukan tips cerdas memilih produk yang aman dan teruji bermutu.",
      icon: Lightbulb,
      actionText: "Pelajari Tips",
      href: "https://cekbpom.pom.go.id",
    },
    {
      id: "video",
      title: "Informasi Umum",
      description:
        "Dapatkan informasi terbaru dan siaran pers dari Badan POM RI",
      icon: Video,
      actionText: "Lihat Informasi",
      href: "https://www.pom.go.id/siaran-pers",
    },
  ];

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
        {/* KARTU KATEGORI EDUKASI (Menempel & Overlap ke Gambar)     */}
        {/* ========================================================= */}
        <div className="relative z-20 -mt-20 sm:-mt-24 lg:-mt-28 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {educationCards.map((card) => {
            const IconComponent = card.icon;
            const isPdfCard = !!card.isPdf;

            return (
              <div
                key={card.id}
                onClick={
                  isPdfCard
                    ? () => setSelectedPdfCard(card)
                    : () => {
                        if (card.href.startsWith("http")) {
                          window.open(card.href, "_blank", "noopener,noreferrer");
                        } else if (card.href.startsWith("/")) {
                          window.location.href = card.href;
                        }
                      }
                }
                className={`group rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-100 dark:border-slate-800 p-4 sm:p-8 flex flex-col items-center text-center shadow-[0_10px_35px_-15px_rgb(11_42_107/0.07)] hover:shadow-card hover:-translate-y-2 transition-all duration-300 ${
                  "cursor-pointer"
                }`}
              >
                {/* Ikon Besar Berbingkai Lembut */}
                <div className="w-11 h-11 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-orange-50 dark:bg-orange-500/15 border border-orange-100/70 dark:border-orange-500/20 text-brand-orange dark:text-orange-400 flex items-center justify-center shrink-0 group-hover:bg-brand-orange group-hover:text-white group-hover:scale-110 transition-all duration-300 shadow-xs">
                  <IconComponent className="w-5 h-5 sm:w-7 sm:h-7 stroke-[1.9]" />
                </div>

                {/* Judul Kartu */}
                <h3 className="font-brand font-bold text-sm sm:text-xl leading-snug text-navy-900 dark:text-white mt-3 sm:mt-5 group-hover:text-brand-orange transition-colors">
                  {card.title}
                </h3>

                {/* Garis Aksen Pembatas Oranye */}
                <div className="w-8 sm:w-10 h-0.5 rounded-full bg-brand-orange/40 my-2 sm:my-3.5 group-hover:w-14 group-hover:bg-brand-orange transition-all duration-300" />

                {/* Deskripsi Singkat */}
                <p className="text-[11px] sm:text-[13px] text-ink-soft dark:text-slate-400 leading-relaxed max-w-[220px] line-clamp-4 sm:line-clamp-none">
                  {card.description}
                </p>

                {/* Link Aksi dengan Panah Interaktif */}
                <div className="mt-auto pt-3 sm:pt-6 [&_a]:text-[11px] [&_button]:text-[11px] sm:[&_a]:text-sm sm:[&_button]:text-sm [&_svg]:w-3.5 [&_svg]:h-3.5 sm:[&_svg]:w-4 sm:[&_svg]:h-4">
                  {isPdfCard ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPdfCard(card);
                      }}
                      className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-brand-orange hover:text-brand-orange-600 transition-colors group/link cursor-pointer"
                    >
                      <span>{card.actionText}</span>
                      <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover/link:translate-x-1" />
                    </button>
                  ) : card.href.startsWith("http") ? (
                    <a
                      href={card.href}
                      target={card.href.startsWith("http") ? "_blank" : undefined}
                      rel={card.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-brand-orange hover:text-brand-orange-600 transition-colors group/link"
                    >
                      <span>{card.actionText}</span>
                      <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover/link:translate-x-1" />
                    </a>
                  ) : (
                    <Link
                      href={card.href}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-brand-orange hover:text-brand-orange-600 transition-colors group/link cursor-pointer"
                    >
                      <span>{card.actionText}</span>
                      <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover/link:translate-x-1" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Preview & Unduh Materi Edukasi PDF */}
      <EducationPdfModal
        isOpen={!!selectedPdfCard}
        onClose={() => setSelectedPdfCard(null)}
        title={selectedPdfCard?.pdfTitle}
        badge={selectedPdfCard?.pdfBadge}
        pdfUrl={selectedPdfCard?.pdfUrl}
        filename={selectedPdfCard?.pdfFilename}
      />
    </section>
  );
}

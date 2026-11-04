"use client";

import React from "react";
import Image from "next/image";
import { ArrowRight, BookOpen, Sparkles } from "lucide-react";

export type KomoditasType = "Pangan" | "Kosmetik" | "Obat" | "Obat Tradisional";

export interface MateriEdukasiItem {
  id: string | number;
  judul: string;
  komoditas: KomoditasType;
  deskripsi: string;
  imageUrl: string;
  pdfUrl?: string | null;
  pdfFilename?: string | null;
}

interface MateriEdukasiCardProps {
  item: MateriEdukasiItem;
  onSelect: (item: MateriEdukasiItem) => void;
}

const KOMODITAS_BADGE_STYLE: Record<
  KomoditasType,
  { label: string; badgeClass: string }
> = {
  Pangan: {
    label: "Pangan",
    badgeClass:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800",
  },
  Kosmetik: {
    label: "Kosmetik",
    badgeClass:
      "bg-pink-50 text-pink-700 dark:bg-pink-950/70 dark:text-pink-300 border-pink-200/80 dark:border-pink-800",
  },
  Obat: {
    label: "Obat",
    badgeClass:
      "bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 border-blue-200/80 dark:border-blue-800",
  },
  "Obat Tradisional": {
    label: "Obat Tradisional",
    badgeClass:
      "bg-amber-50 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border-amber-200/80 dark:border-amber-800",
  },
};

export function MateriEdukasiCard({ item, onSelect }: MateriEdukasiCardProps) {
  const badgeInfo = KOMODITAS_BADGE_STYLE[item.komoditas] || {
    label: item.komoditas,
    badgeClass:
      "bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700",
  };

  return (
    <div
      onClick={() => onSelect(item)}
      className="group relative flex flex-col justify-between bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-card hover:border-brand-orange/40 hover:-translate-y-1.5 transition-all duration-300 p-5 sm:p-6 cursor-pointer"
    >
      <div className="flex flex-col-reverse sm:flex-row items-start justify-between gap-4">
        {/* Konten Kiri (Badge, Judul, Deskripsi) */}
        <div className="flex-1 min-w-0 pr-0 sm:pr-2">
          {/* Badge Komoditas */}
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold border tracking-wide mb-3 ${badgeInfo.badgeClass}`}
          >
            {badgeInfo.label}
          </span>

          {/* Judul Materi */}
          <h3 className="font-brand font-bold text-base sm:text-lg text-navy-900 dark:text-white leading-snug group-hover:text-brand-orange transition-colors line-clamp-2">
            {item.judul}
          </h3>

          {/* Deskripsi Materi */}
          <p className="mt-2 text-xs sm:text-[13px] text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
            {item.deskripsi}
          </p>
        </div>

        {/* Thumbnail Kanan (Bingkai Lengkung Artistik Sesuai Mockup) */}
        <div className="relative w-full sm:w-36 md:w-40 h-40 sm:h-32 rounded-2xl sm:rounded-r-2xl sm:rounded-tl-[44px] sm:rounded-bl-md overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60 shadow-2xs group-hover:scale-102 transition-transform duration-300">
          <Image
            src={item.imageUrl}
            alt={item.judul}
            fill
            sizes="(max-width: 640px) 100vw, 160px"
            className="object-cover object-center"
          />
        </div>
      </div>

      {/* Aksi Bawah: Lihat Materi */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/70 flex items-center justify-between">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(item);
          }}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-brand-orange hover:text-brand-orange-600 transition-colors group-hover:translate-x-0.5 cursor-pointer"
        >
          <span>Lihat Materi</span>
          <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
        </button>

        <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
          <BookOpen className="w-3.5 h-3.5" />
          Materi Resmi BBPOM
        </span>
      </div>
    </div>
  );
}


"use client";

import React from "react";
import { Zap, Clock, Users, ShieldCheck } from "lucide-react";

interface SpeedBadge {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
}

const SPEED_BADGES: SpeedBadge[] = [
  {
    id: "uji-cepat",
    title: "Uji Cepat Laboratorium",
    description: "Skrining sampel kimia & pangan dalam hitungan jam",
    icon: Zap,
  },
  {
    id: "respon-cepat",
    title: "Respon Cepat 1x24 Jam",
    description: "Tindak lanjut aduan & informasi secara tanggap",
    icon: Clock,
  },
  {
    id: "konsultasi-online",
    title: "Konsultasi Tanpa Antre",
    description: "Panduan izin edar langsung lewat portal AMPERA",
    icon: Users,
  },
  {
    id: "proses-pasti",
    title: "Proses Pasti & Transparan",
    description: "Standar waktu layanan pasti dan bebas pungutan liar",
    icon: ShieldCheck,
  },
];

export function SpeedBadgesSection() {
  return (
    <section className="relative w-full py-6 sm:py-8 bg-slate-50/70 dark:bg-slate-900/40 border-y border-slate-100 dark:border-slate-800/80 transition-colors duration-300">
      <div className="max-w-[1440px] mx-auto px-5 sm:px-10 lg:px-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 lg:gap-5">
          {SPEED_BADGES.map((badge) => {
            const IconComponent = badge.icon;
            return (
              <div
                key={badge.id}
                className="group rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-100 dark:border-slate-800 p-4 sm:p-4.5 shadow-[0_4px_20px_-8px_rgb(11_42_107/0.05)] hover:shadow-card hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-3.5"
              >
                {/* Kotak Ikon Peach/Oranye Lembut */}
                <div className="w-11 h-11 rounded-xl bg-orange-50 dark:bg-orange-500/15 border border-orange-100/70 dark:border-orange-500/20 text-brand-orange dark:text-orange-400 flex items-center justify-center shrink-0 group-hover:bg-brand-orange group-hover:text-white group-hover:scale-105 transition-all duration-300 shadow-xs">
                  <IconComponent className="w-5 h-5 stroke-[2.2]" />
                </div>

                {/* Teks Informasi */}
                <div className="min-w-0 flex-1">
                  <h3 className="font-brand font-bold text-sm text-navy-900 dark:text-white leading-tight truncate">
                    {badge.title}
                  </h3>
                  <p className="text-xs text-ink-soft dark:text-slate-400 mt-1 leading-snug line-clamp-2">
                    {badge.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

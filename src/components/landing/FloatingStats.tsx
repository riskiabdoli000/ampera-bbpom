import React from "react";
import { ShieldCheck, Clock, Users } from "lucide-react";

interface StatItem {
  icon: React.ElementType;
  title: string;
  description: string;
  iconBg: string;
  iconColor: string;
}

const STATS: StatItem[] = [
  {
    icon: ShieldCheck,
    title: "10 tahun",
    description: "Pengawasan dan perlindungan masyarakat",
    iconBg: "bg-teal-50 border-teal-100/80",
    iconColor: "text-teal-700",
  },
  {
    icon: Clock,
    title: "+ 1200 produk",
    description: "Obat dan makanan terawasi setiap tahun",
    iconBg: "bg-teal-50 border-teal-100/80",
    iconColor: "text-teal-700",
  },
  {
    icon: Users,
    title: "100%",
    description: "Komitmen untuk kesehatan masyarakat",
    iconBg: "bg-teal-50 border-teal-100/80",
    iconColor: "text-teal-700",
  },
];

export function FloatingStats() {
  return (
    <div className="w-full">
      {/* ========================================================================= */}
      {/* KHUSUS DESKTOP (lg: >= 1024px) - 100% PERSIS KODE AWAL ASLI TANPA DIUBAH */}
      {/* ========================================================================= */}
      <div className="hidden lg:grid grid-cols-3 gap-3">
        {STATS.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="group bg-white/95 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl px-3.5 py-2.5 border border-white/90 dark:border-slate-800/80 shadow-md shadow-slate-900/5 dark:shadow-black/30 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-3"
            >
              {/* Icon Container Mint/Teal Lebih Ringkas */}
              <div className="w-8.5 h-8.5 rounded-xl bg-[#e6f4f1] dark:bg-teal-950/70 text-[#00897b] dark:text-teal-300 flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105">
                <Icon className="w-4.5 h-4.5 stroke-[2]" />
              </div>

              {/* Text Info Lebih Rapi */}
              <div className="min-w-0">
                <div className="font-extrabold text-[13px] text-[#0b2942] dark:text-white tracking-tight leading-tight">
                  {stat.title}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-tight mt-0.5 line-clamp-2">
                  {stat.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* KHUSUS MOBILE (< 1024px) - 3 KOLOM SEJAJAR DI BAGIAN BAWAH HERO */}
      {/* ========================================================================= */}
      <div className="grid lg:hidden grid-cols-3 gap-1.5 xs:gap-2">
        {STATS.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="group bg-white/95 dark:bg-slate-900/90 backdrop-blur-md rounded-xl p-1.5 xs:p-2 border border-white/90 dark:border-slate-800/80 shadow-xs hover:shadow-md transition-all duration-200 flex items-center gap-1.5 xs:gap-2"
            >
              {/* Icon Container */}
              <div className="w-6 h-6 xs:w-7 xs:h-7 rounded-lg bg-[#e6f4f1] dark:bg-teal-950/70 text-[#00897b] dark:text-teal-300 flex items-center justify-center shrink-0">
                <Icon className="w-3 h-3 xs:w-3.5 xs:h-3.5 stroke-[2]" />
              </div>

              {/* Text Info */}
              <div className="min-w-0">
                <div className="font-extrabold text-[9.5px] xs:text-[11px] text-[#0b2942] dark:text-white tracking-tight leading-tight truncate">
                  {stat.title}
                </div>
                <p className="text-[7.5px] xs:text-[9px] text-slate-500 dark:text-slate-400 font-medium leading-tight mt-0.5 line-clamp-2">
                  {stat.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

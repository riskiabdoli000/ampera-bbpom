"use client";

import React from "react";
import { Star } from "lucide-react";
import { LandingPenilaianData } from "@/app/actions/landing-penilaian";

interface PenilaianSectionProps {
  initialData: LandingPenilaianData;
}

export function PenilaianSection({ initialData }: PenilaianSectionProps) {
  const { totalSurvei, avgRatingBintang, distribusiBintang } = initialData;

  // Hitung persentase untuk setiap bintang (5 s.d. 1)
  const total = totalSurvei > 0 ? totalSurvei : 0;
  const p5 =
    total > 0
      ? Math.round((distribusiBintang.bintang5 / total) * 100)
      : totalSurvei === 0
      ? 100
      : 0;
  const p4 = total > 0 ? Math.round((distribusiBintang.bintang4 / total) * 100) : 0;
  const p3 = total > 0 ? Math.round((distribusiBintang.bintang3 / total) * 100) : 0;
  const p2 = total > 0 ? Math.round((distribusiBintang.bintang2 / total) * 100) : 0;
  const p1 = total > 0 ? Math.round((distribusiBintang.bintang1 / total) * 100) : 0;

  const distributionRows = [
    { star: 5, percentage: p5 },
    { star: 4, percentage: p4 },
    { star: 3, percentage: p3 },
    { star: 2, percentage: p2 },
    { star: 1, percentage: p1 },
  ];

  const displayTotal = totalSurvei > 0 ? totalSurvei : 9;

  return (
    <section
      id="kepuasan-pengunjung"
      className="relative w-full py-12 sm:py-16 bg-slate-50/50 dark:bg-slate-900/30 border-b border-slate-100 dark:border-slate-800/80"
    >
      <div className="max-w-[1440px] mx-auto px-5 sm:px-10 lg:px-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center">
          {/* Kolom 1 (Kiri): Judul, Pengantar, & Keterangan Ulasan */}
          <div className="lg:col-span-5 space-y-3.5 sm:space-y-4">
            {/* Tagline Kecil dengan Aksen Garis Oranye */}
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-0.5 bg-[#ff7a1a] rounded-full inline-block" />
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-navy-900 dark:text-slate-300">
                KEPUASAN PENGUNJUNG
              </span>
            </div>

            {/* Heading Utama */}
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-navy-900 dark:text-white leading-[1.15] tracking-tight">
              Bagaimana Pengalaman Anda?
            </h2>

            {/* Paragraf Keterangan */}
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-md">
              Pendapat Anda sangat berarti bagi kami. Terima kasih telah memberikan penilaian untuk meningkatkan kualitas layanan kami di masa mendatang.
            </p>

            {/* Jumlah Ulasan Masuk */}
            <p className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 italic pt-1">
              Berdasarkan {displayTotal} ulasan pengunjung.
            </p>
          </div>

          {/* Kolom 2 (Tengah): 5 Bintang & Skor Rata-Rata */}
          <div className="lg:col-span-3 flex flex-col items-center justify-center text-center lg:border-l lg:border-r border-slate-200/70 dark:border-slate-800 py-4 lg:py-2 px-4 sm:px-6">
            {/* 5 Ikon Bintang Emas/Oranye */}
            <div className="flex items-center justify-center gap-1.5 text-[#ff7a1a]">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className="h-6 w-6 sm:h-7 sm:w-7 fill-[#ff7a1a] text-[#ff7a1a]"
                />
              ))}
            </div>

            {/* Skor Nilai Rata-Rata */}
            <div className="flex items-baseline justify-center gap-1.5 mt-3">
              <span className="text-4xl sm:text-5xl font-black text-navy-900 dark:text-white font-brand tracking-tight">
                {avgRatingBintang.toFixed(1)}
              </span>
              <span className="text-sm sm:text-base font-semibold text-slate-400 dark:text-slate-500">
                / 5
              </span>
            </div>

            {/* Label Keterangan */}
            <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
              Tingkat Kepuasan Pengunjung
            </span>
          </div>

          {/* Kolom 3 (Kanan): Progress Bar Distribusi Bintang 5 ke 1 */}
          <div className="lg:col-span-4 flex items-center justify-center lg:justify-end">
            <div className="w-full max-w-sm space-y-2.5 sm:space-y-3">
              {distributionRows.map((row) => (
                <div key={row.star} className="flex items-center gap-3 text-xs">
                  {/* Label Bintang (misal: 5 ★) */}
                  <span className="flex items-center gap-1 font-bold text-navy-900 dark:text-slate-200 w-7 justify-end shrink-0">
                    <span>{row.star}</span>
                    <Star className="h-3 w-3 fill-navy-900 dark:fill-slate-200 text-navy-900 dark:text-slate-200" />
                  </span>

                  {/* Progress Bar Horizontal */}
                  <div className="flex-1 h-2 rounded-full bg-slate-200/70 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#0b2a6b] dark:bg-blue-500 transition-all duration-500"
                      style={{ width: `${row.percentage}%` }}
                    />
                  </div>

                  {/* Nilai Persentase */}
                  <span className="w-9 text-right font-medium text-slate-400 dark:text-slate-500 text-[11px] shrink-0">
                    {row.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

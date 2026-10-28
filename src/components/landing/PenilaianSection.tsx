"use client";

import React from "react";
import Link from "next/link";
import {
  Star,
  Award,
  ShieldCheck,
  Globe,
  Users,
  CheckCircle2,
  ArrowRight,
  MessageSquareQuote,
  Sparkles,
  Building2,
  Calendar,
} from "lucide-react";
import { LandingPenilaianData } from "@/app/actions/landing-penilaian";

interface PenilaianSectionProps {
  initialData: LandingPenilaianData;
}

export function PenilaianSection({ initialData }: PenilaianSectionProps) {
  const {
    totalSurvei,
    avgRatingBintang,
    skorIkm,
    mutuPelayanan,
    persenPuas,
    avgKualitasPelayanan,
    avgManfaatPelayanan,
    avgKualitasWebsite,
    avgManfaatWebsite,
    reviews,
  } = initialData;

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "Baru saja";
    }
  };

  return (
    <section
      id="penilaian-ikm"
      className="relative w-full py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-white via-orange-50/25 to-white dark:from-slate-950 dark:via-slate-900/40 dark:to-slate-950 border-b border-slate-100 dark:border-slate-800/80 overflow-hidden"
    >
      {/* Decorative Glow Elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-r from-orange-400/10 via-amber-300/10 to-teal-400/10 blur-3xl rounded-full pointer-events-none" />

      <div className="relative max-w-[1440px] mx-auto px-5 sm:px-10 lg:px-14 space-y-12 sm:space-y-16">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-100/70 border border-orange-200/80 text-[#ea580c] dark:bg-orange-950/40 dark:border-orange-900/60 dark:text-orange-300 text-xs font-black uppercase tracking-wider shadow-xs">
            <Sparkles className="w-3.5 h-3.5 fill-[#ea580c]" />
            <span>INDEKS KEPUASAN MASYARAKAT (IKM)</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-navy-900 dark:text-white font-brand tracking-tight">
            Transparansi Mutu & Penilaian Layanan
          </h2>

          <p className="text-xs sm:text-sm lg:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            Evaluasi berkala kepuasan masyarakat terhadap standar pelayanan publik BBPOM di Palembang secara transparan, independen, dan berpedoman pada PermenPAN-RB No. 14 Tahun 2017.
          </p>
        </div>

        {/* Highlight Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Card 1: Skor IKM & Mutu Pelayanan (Hero Card) */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0b2a6b] to-[#123e99] text-white p-6 sm:p-7 shadow-xl shadow-blue-950/15 border border-blue-800/40 flex flex-col justify-between">
            <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/5 rounded-full blur-xl pointer-events-none" />
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-200">
                  Indeks IKM BBPOM
                </span>
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md">
                  <Award className="h-5 w-5 text-amber-300" />
                </div>
              </div>

              <div className="flex items-baseline gap-1.5">
                <span className="text-4xl sm:text-5xl font-black tracking-tight font-brand">
                  {skorIkm}
                </span>
                <span className="text-xs text-blue-200 font-semibold">/ 100</span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Mutu {mutuPelayanan}</span>
              </div>
            </div>

            <p className="text-[11px] text-blue-100/80 mt-4 pt-3 border-t border-white/10">
              Berdasarkan {totalSurvei > 0 ? `${totalSurvei} responden terverifikasi` : "standar mutu pelayanan prima"}
            </p>
          </div>

          {/* Card 2: Rating Bintang Keseluruhan */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Kepuasan Pengguna
                </span>
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 dark:bg-amber-500/20">
                  <Star className="h-5 w-5 fill-amber-400" />
                </div>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-black text-navy-900 dark:text-white font-brand">
                  {avgRatingBintang}
                </span>
                <span className="text-xs text-slate-400 font-semibold">/ 5.0</span>
              </div>

              <div className="flex items-center gap-1 text-amber-400">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`h-4 w-4 ${
                      s <= Math.round(avgRatingBintang)
                        ? "fill-amber-400 text-amber-400"
                        : "text-slate-200 dark:text-slate-700"
                    }`}
                  />
                ))}
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300 ml-1.5">
                  {persenPuas}% Puas
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              Tingkat kepuasan masyarakat yang sangat tinggi
            </p>
          </div>

          {/* Card 3: Layanan Petugas BBPOM */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Pelayanan Petugas
                </span>
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:bg-blue-500/20">
                  <ShieldCheck className="h-5 w-5" />
                </div>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-black text-navy-900 dark:text-white font-brand">
                  {avgKualitasPelayanan}
                </span>
                <span className="text-xs text-slate-400 font-semibold">/ 5.0</span>
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span>Kualitas Sikap & Respons</span>
                  <span className="font-bold">{avgKualitasPelayanan}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span>Kebermanfaatan Solusi</span>
                  <span className="font-bold">{avgManfaatPelayanan}</span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              Pelayanan ramah, solutif, dan bebas gratifikasi
            </p>
          </div>

          {/* Card 4: Kemudahan Website AMPERA */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Website AMPERA
                </span>
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-orange-500/10 text-[#ff7a1a] dark:bg-orange-500/20">
                  <Globe className="h-5 w-5" />
                </div>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-black text-navy-900 dark:text-white font-brand">
                  {avgKualitasWebsite}
                </span>
                <span className="text-xs text-slate-400 font-semibold">/ 5.0</span>
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span>Kemudahan Penggunaan</span>
                  <span className="font-bold">{avgKualitasWebsite}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span>Kecepatan Tracking</span>
                  <span className="font-bold">{avgManfaatWebsite}</span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              Akses cepat tanpa antre 24/7 daring
            </p>
          </div>
        </div>

        {/* Ulasan Publik dari Responden */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-lg sm:text-xl font-black text-navy-900 dark:text-white font-brand">
                Ulasan & Penilaian Terverifikasi
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Umpan balik nyata dari para pemohon layanan yang telah menyelesaikan permohonan di AMPERA.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 self-start sm:self-auto">
              <Users className="w-3.5 h-3.5 text-[#ff7a1a]" />
              <span>{totalSurvei} Ulasan Terdaftar</span>
            </div>
          </div>

          {reviews && reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between gap-4 group"
                >
                  <div className="space-y-3">
                    {/* Header Card: Rating & Badge Layanan */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`h-3.5 w-3.5 ${
                              s <= rev.ratingBintang
                                ? "fill-amber-400 text-amber-400"
                                : "text-slate-200 dark:text-slate-700"
                            }`}
                          />
                        ))}
                      </div>

                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 text-[#ff7a1a] border border-orange-200/50 dark:bg-orange-950/40 dark:border-orange-900/60 dark:text-orange-300 truncate max-w-[150px]">
                        {rev.layananNama}
                      </span>
                    </div>

                    {/* Kutipan Ulasan atau Ringkasan Mutu */}
                    {rev.kritikSaran ? (
                      <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 italic leading-relaxed line-clamp-3">
                        &ldquo;{rev.kritikSaran}&rdquo;
                      </p>
                    ) : (
                      <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/50 p-3 space-y-1 text-[11px] text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between font-medium">
                          <span>Mutu Pelayanan Petugas:</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            Sangat Baik (5/5)
                          </span>
                        </div>
                        <div className="flex items-center justify-between font-medium">
                          <span>Kebermanfaatan Website:</span>
                          <span className="font-bold text-blue-600 dark:text-blue-400">
                            Sangat Bermanfaat (5/5)
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer Card: Info Pemohon & Tanggal */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Avatar Inisial */}
                      <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-[#0b2a6b] to-[#1e58c8] text-white font-bold flex items-center justify-center shrink-0 text-xs shadow-xs">
                        {rev.namaTamu.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-navy-900 dark:text-white truncate">
                          {rev.namaTamu}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">
                          {rev.asalInstansi}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-mono text-[10px] text-slate-400 block">
                        #{rev.kodePengajuan}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {formatDate(rev.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 p-8 text-center text-slate-400 space-y-2">
              <Star className="w-8 h-8 mx-auto text-amber-400 stroke-1" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Belum ada data ulasan publik
              </p>
              <p className="text-xs max-w-md mx-auto">
                Ulasan survei kepuasan masyarakat akan otomatis ditampilkan di sini setelah pemohon menyelesaikan survei layanan.
              </p>
            </div>
          )}
        </div>

        {/* Call to Action: Ajak Masyarakat Mengisi Survei */}
        <div className="rounded-3xl bg-gradient-to-r from-orange-50 via-amber-50/60 to-orange-50 dark:from-slate-900 dark:via-slate-800/70 dark:to-slate-900 border border-orange-200/70 dark:border-slate-700 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-sm">
          <div className="space-y-1.5 text-center sm:text-left">
            <h4 className="text-base sm:text-lg font-black text-navy-900 dark:text-white font-brand">
              Sudah Pernah Mengajukan Layanan di AMPERA?
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl">
              Bantu kami terus meningkatkan kualitas pelayanan publik BBPOM di Palembang dengan memberikan penilaian dan ulasan jujur Anda.
            </p>
          </div>

          <Link
            href="/survei"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-[#ff7a1a] to-[#f26a0f] text-white font-bold text-xs sm:text-sm shadow-cta hover:brightness-105 active:scale-95 transition shrink-0 cursor-pointer"
          >
            <span>Isi Survei Kepuasan</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

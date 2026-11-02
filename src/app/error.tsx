"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  RotateCcw,
  Home,
  AlertTriangle,
  PhoneCall,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error untuk kebutuhan pemantauan teknis
    console.error("AMPERA Error Captured:", error);
  }, [error]);

  const [showDetail, setShowDetail] = React.useState(false);

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#fbfcfe] via-[#f4f7fc] to-[#eef3fb] dark:from-slate-950 dark:via-[#071330] dark:to-slate-950 text-slate-800 dark:text-slate-100 flex flex-col justify-between selection:bg-brand-orange selection:text-white transition-colors duration-300">
      {/* Header Minimalis */}
      <header className="w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-3 group focus:outline-hidden"
          >
            <div className="relative h-9 w-9 sm:h-10 sm:w-10 shrink-0 transition-transform group-hover:scale-105">
              <Image
                src="/assets-landingpage/logo-bpom.png"
                alt="Logo BPOM"
                width={40}
                height={40}
                className="h-full w-full object-contain"
                priority
              />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm sm:text-base font-extrabold tracking-tight text-navy-900 dark:text-white font-brand">
                AMPERA BBPOM
              </span>
              <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                Balai Besar POM di Palembang
              </span>
            </div>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-navy-900 dark:text-white hover:border-brand-orange hover:text-brand-orange transition-all shadow-xs"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Beranda</span>
          </Link>
        </div>
      </header>

      {/* Main Error Body */}
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6">
        <div className="max-w-2xl w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl shadow-slate-200/50 dark:shadow-none text-center space-y-6">
          {/* Icon Badge */}
          <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-amber-500/20 via-orange-500/20 to-red-500/20 border border-amber-300 dark:border-amber-800/60 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-inner">
            <AlertTriangle className="w-8 h-8 sm:w-10 sm:h-10 animate-pulse" />
          </div>

          <div className="space-y-2">
            <span className="inline-block text-[11px] font-bold tracking-wider uppercase px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/70 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300">
              Pemberitahuan Sistem
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-brand text-navy-900 dark:text-white tracking-tight">
              Terjadi Gangguan Sementara
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg mx-auto">
              Mohon maaf atas ketidaknyamanan ini. Halaman atau permintaan yang Anda akses mengalami kendala teknis tak terduga. Data Anda tetap aman.
            </p>
          </div>

          {/* Reference Digest jika ada */}
          {error.digest && (
            <div className="inline-block px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-[11px] font-mono text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
              Kode Referensi: <span className="font-semibold text-slate-700 dark:text-slate-200">{error.digest}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => reset()}
              type="button"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#ff8a1f] to-[#f26a0f] text-sm font-bold text-white shadow-cta hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Coba Muat Ulang</span>
            </button>

            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-bold text-navy-900 dark:text-white hover:border-brand-orange hover:text-brand-orange transition-all shadow-xs cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>Kembali ke Beranda</span>
            </Link>

            <Link
              href="/#kontak"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full border border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-navy-900 dark:hover:text-white transition-all cursor-pointer"
            >
              <PhoneCall className="w-3.5 h-3.5 text-brand-orange" />
              <span>Hubungi BBPOM</span>
            </Link>
          </div>

          {/* Keamanan & Garansi Data */}
          <div className="pt-4 flex items-center justify-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Sistem terlindungi dan transaksi data dienkripsi dengan aman.</span>
          </div>

          {/* Toggle Detail Error (untuk keperluan debugging jika diperlukan) */}
          {process.env.NODE_ENV !== "production" && error.message && (
            <div className="pt-2 text-left border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowDetail((prev) => !prev)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer"
              >
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${
                    showDetail ? "rotate-180" : ""
                  }`}
                />
                <span>Detail Teknis (Pengembang)</span>
              </button>

              {showDetail && (
                <div className="mt-2 p-3 bg-slate-900 text-rose-300 rounded-xl text-xs font-mono overflow-x-auto">
                  <p className="font-bold text-rose-400 mb-1">
                    {error.name}: {error.message}
                  </p>
                  {error.stack && (
                    <pre className="text-[10px] text-slate-400 whitespace-pre-wrap leading-relaxed">
                      {error.stack}
                    </pre>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer Minimalis */}
      <footer className="w-full border-t border-slate-200/80 dark:border-slate-800/80 bg-white/50 dark:bg-slate-950/50 py-4 text-center text-xs text-slate-500 dark:text-slate-400">
        <p>
          © {new Date().getFullYear()}{" "}
          <strong className="text-navy-900 dark:text-white font-semibold">
            AMPERA
          </strong>{" "}
          — Balai Besar POM di Palembang. Layanan Informasi dan Pengaduan Terpadu.
        </p>
      </footer>
    </main>
  );
}


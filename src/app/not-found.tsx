import React from "react";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import {
  Home,
  ArrowLeft,
  HelpCircle,
  FlaskConical,
  ShieldAlert,
  FileText,
  PhoneCall,
  Search,
  Sparkles,
} from "lucide-react";

export const metadata: Metadata = {
  title: "404 - Halaman Tidak Ditemukan | AMPERA BBPOM Palembang",
  description:
    "Halaman yang Anda tuju tidak ditemukan atau alamat URL yang dimasukkan kurang tepat pada portal resmi AMPERA BBPOM di Palembang.",
};

const QUICK_SERVICES = [
  {
    title: "Permintaan Informasi",
    desc: "Konsultasi regulasi obat, makanan & izin edar",
    href: "/permintaan-informasi",
    icon: HelpCircle,
    color: "from-blue-500 to-indigo-600",
  },
  {
    title: "Pengujian Cepat",
    desc: "Uji sampel dugaan bahan berbahaya pangan",
    href: "/pengujian-cepat",
    icon: FlaskConical,
    color: "from-amber-500 to-orange-600",
  },
  {
    title: "Layanan Pengaduan",
    desc: "Laporan peredaran produk ilegal & berbahaya",
    href: "/pengaduan",
    icon: ShieldAlert,
    color: "from-rose-500 to-red-600",
  },
  {
    title: "Keterbukaan Informasi",
    desc: "Permohonan salinan dokumen publik PPID",
    href: "/keterbukaan-informasi",
    icon: FileText,
    color: "from-emerald-500 to-teal-600",
  },
];

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#f2f7ff] via-white to-[#edf4fe] dark:from-slate-950 dark:via-[#06122e]/50 dark:to-slate-950 text-slate-800 dark:text-slate-100 flex flex-col justify-between selection:bg-brand-orange selection:text-white transition-colors duration-300">
      {/* Top Header Bar Minimalis */}
      <header className="w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
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
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-navy-900 dark:text-white hover:border-brand-orange hover:text-brand-orange transition-all shadow-xs"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Halaman Utama</span>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6">
        <div className="max-w-3xl w-full text-center space-y-8 animate-fade-up">
          {/* Badge & Visual Number */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-100/80 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-800 text-brand-orange text-xs font-bold uppercase tracking-widest shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Kesalahan Tautan Halaman (404)</span>
            </div>

            <div className="relative inline-block select-none">
              <span className="text-7xl sm:text-9xl font-extrabold font-brand tracking-tighter bg-gradient-to-r from-navy-900 via-blue-700 to-brand-orange bg-clip-text text-transparent drop-shadow-sm">
                404
              </span>
              <div className="absolute -bottom-2 inset-x-0 h-1 bg-gradient-to-r from-transparent via-brand-orange to-transparent opacity-80" />
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-brand text-navy-900 dark:text-white tracking-tight">
              Halaman Tidak Ditemukan
            </h1>

            <p className="max-w-xl mx-auto text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Alamat URL yang Anda tuju mungkin salah ketik, telah dipindahkan, atau tidak lagi tersedia pada sistem pelayanan terpadu AMPERA BBPOM Palembang.
            </p>
          </div>

          {/* Tombol Aksi Navigasi */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-gradient-to-r from-[#ff8a1f] to-[#f26a0f] text-sm font-bold text-white shadow-cta hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>Kembali ke Beranda</span>
            </Link>

            <Link
              href="/#kontak"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-bold text-navy-900 dark:text-white hover:border-brand-orange hover:text-brand-orange transition-all shadow-xs cursor-pointer"
            >
              <PhoneCall className="w-4 h-4 text-brand-orange" />
              <span>Bantuan & Kontak BBPOM</span>
            </Link>
          </div>

          {/* Akses Cepat 4 Layanan Resmi */}
          <div className="pt-6 border-t border-slate-200/80 dark:border-slate-800 text-left">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 text-center sm:text-left flex items-center justify-center sm:justify-start gap-1.5">
              <Search className="w-3.5 h-3.5" />
              <span>Atau Akses Cepat Layanan Resmi Kami:</span>
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {QUICK_SERVICES.map((srv) => {
                const Icon = srv.icon;
                return (
                  <Link
                    key={srv.href}
                    href={srv.href}
                    className="p-3.5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 hover:border-brand-orange dark:hover:border-brand-orange hover:shadow-md transition-all flex items-center gap-3 group"
                  >
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${srv.color} text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-bold text-navy-900 dark:text-white group-hover:text-brand-orange transition-colors truncate">
                        {srv.title}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {srv.desc}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Minimalis */}
      <footer className="w-full border-t border-slate-200/80 dark:border-slate-800/80 bg-white/50 dark:bg-slate-950/50 py-4 text-center text-xs text-slate-500 dark:text-slate-400">
        <p>
          © {new Date().getFullYear()}{" "}
          <strong className="text-navy-900 dark:text-white font-semibold">
            AMPERA
          </strong>{" "}
          — Balai Besar POM di Palembang. Melindungi Masyarakat dari Obat & Makanan Berbahaya.
        </p>
      </footer>
    </main>
  );
}


"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  HelpCircle,
  FlaskConical,
  ShieldAlert,
  FileText,
  ArrowRight,
} from "lucide-react";

interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  image: string;
  href: string;
  actionText: string;
}

const SERVICES: ServiceItem[] = [
  {
    id: "permintaan-informasi",
    title: "Permintaan Informasi",
    description:
      "Layanan konsultasi regulasi, perizinan edar, dan sertifikasi obat & makanan untuk masyarakat dan UMKM.",
    icon: HelpCircle,
    image: "/assets-landingpage/layanan/1.jpg",
    href: "/permintaan-informasi",
    actionText: "Akses Layanan",
  },
  {
    id: "pengujian-cepat",
    title: "Pengujian Cepat AMPERA",
    description:
      "Inovasi uji laboratorium cepat untuk mendeteksi bahan kimia berbahaya pada sampel pangan dan farmasi.",
    icon: FlaskConical,
    image: "/assets-landingpage/layanan/2.jpg",
    href: "/pengujian-cepat",
    actionText: "Uji Sekarang",
  },
  {
    id: "pengaduan",
    title: "Layanan Pengaduan",
    description:
      "Kanal resmi pelaporan dugaan peredaran obat dan makanan ilegal, palsu, rusak, atau kedaluwarsa.",
    icon: ShieldAlert,
    image: "/assets-landingpage/layanan/3.jpg",
    href: "/pengaduan",
    actionText: "Buat Pengaduan",
  },
  {
    id: "ppid",
    title: "Keterbukaan Informasi",
    description:
      "Akses transparan terhadap dokumen resmi publik, SOP pengawasan, anggaran, dan laporan kinerja PPID.",
    icon: FileText,
    image: "/assets-landingpage/layanan/4.jpg",
    href: "/keterbukaan-informasi",
    actionText: "Lihat Dokumen",
  },
];

export function ServicesSection() {
  return (
    <section
      id="layanan"
      className="relative w-full pt-16 sm:pt-24 pb-12 sm:pb-16 bg-gradient-to-b from-white via-sky-50/40 to-white dark:from-slate-950 dark:via-[#06122e]/30 dark:to-slate-950 transition-colors duration-300 overflow-hidden scroll-mt-20"
    >
      <div className="relative max-w-[1440px] mx-auto px-5 sm:px-10 lg:px-14">
        {/* ========================================================= */}
        {/* HEADER SECTION: Judul di Kiri + Tombol di Kanan           */}
        {/* ========================================================= */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
          {/* Sisi Kiri: Eyebrow + Display Headline */}
          <div className="max-w-2xl">
            <span className="block text-xs sm:text-sm font-extrabold uppercase tracking-[0.2em] text-brand-orange-600 dark:text-orange-400 mb-3">
              Layanan Utama AMPERA
            </span>
            <h2 className="font-brand font-extrabold text-navy-900 dark:text-white text-3xl sm:text-4xl lg:text-[44px] leading-[1.12] tracking-tight">
              Layanan Publik yang Sesuai{" "}
              <span className="text-brand-orange">Kebutuhan Anda</span>
            </h2>
          </div>

          {/* Sisi Kanan: Tombol View All */}
          <div className="shrink-0">
            <a
              href="#layanan"
              className="group inline-flex items-center gap-2.5 px-6 py-3 rounded-full border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900 text-sm font-bold text-navy-900 dark:text-white hover:border-brand-orange hover:text-brand-orange shadow-xs transition-all duration-300 hover:shadow-md cursor-pointer focus-visible:outline-2 focus-visible:outline-brand-orange"
            >
              <span>Lihat Semua Layanan</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </a>
          </div>
        </div>

        {/* ========================================================= */}
        {/* GRID 4 KARTU LAYANAN (Layout Persis Sesuai Gambar Acuan)  */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-6 mt-10 sm:mt-14">
          {SERVICES.map((service) => {
            const IconComponent = service.icon;
            return (
              <div
                key={service.id}
                className="group rounded-3xl bg-white dark:bg-slate-900/85 border border-slate-100 dark:border-slate-800/90 shadow-[0_10px_35px_-15px_rgb(11_42_107/0.08)] hover:shadow-card hover:-translate-y-2 transition-all duration-300 flex flex-col overflow-hidden"
              >
                {/* Bagian Atas: Gambar dan Badge Ikon Mengambang */}
                <div className="relative w-full">
                  {/* Container Foto dengan overflow-hidden khusus untuk efek zoom */}
                  <div className="relative w-full aspect-[4/3] bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <Image
                      src={service.image}
                      alt={service.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                    />

                    {/* Subtle Gradient Shadow di bawah foto */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />
                  </div>

                  {/* Overlapping Floating Icon Badge (Di luar overflow-hidden foto sehingga tampil utuh) */}
                  <div className="absolute -bottom-6 left-6 z-20 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white dark:bg-slate-800 border-4 border-white dark:border-slate-900 shadow-md flex items-center justify-center text-navy-900 dark:text-brand-orange group-hover:bg-brand-orange group-hover:text-white group-hover:scale-105 transition-all duration-300">
                    <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2]" />
                  </div>
                </div>

                {/* Bagian Bawah: Judul, Deskripsi, dan Link Aksi */}
                <div className="pt-9 pb-6 px-6 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Judul Layanan */}
                    <h3 className="font-brand font-bold text-lg text-navy-900 dark:text-white leading-snug group-hover:text-brand-orange transition-colors duration-200">
                      {service.title}
                    </h3>

                    {/* Deskripsi Singkat */}
                    <p className="text-xs sm:text-[13px] text-ink-soft dark:text-slate-400 mt-2 leading-relaxed line-clamp-3">
                      {service.description}
                    </p>
                  </div>

                  {/* Action Link dengan Panah */}
                  <div className="pt-5">
                    <Link
                      href={service.href}
                      className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-brand-orange hover:text-brand-orange-600 transition-colors group/link"
                    >
                      <span>{service.actionText}</span>
                      <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover/link:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

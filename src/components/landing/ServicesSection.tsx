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
import type { LandingServiceItem } from "@/app/actions/admin-layanan";

const ICON_MAP: Record<string, React.ElementType> = {
  HelpCircle,
  FlaskConical,
  ShieldAlert,
  FileText,
};

const DEFAULT_SERVICES: LandingServiceItem[] = [
  {
    id: "permintaan-informasi",
    kode: "INFO",
    title: "Permintaan Informasi",
    description:
      "Layanan konsultasi regulasi, perizinan edar, dan sertifikasi obat & makanan untuk masyarakat dan UMKM.",
    iconName: "HelpCircle",
    image: "/assets-landingpage/layanan/1.jpg",
    href: "/permintaan-informasi",
    actionText: "Akses Layanan",
  },
  {
    id: "pengujian-cepat",
    kode: "UJI_CEPAT",
    title: "Pengujian Cepat AMPERA",
    description:
      "Inovasi uji laboratorium cepat untuk mendeteksi bahan kimia berbahaya pada sampel pangan dan farmasi.",
    iconName: "FlaskConical",
    image: "/assets-landingpage/layanan/2.jpg",
    href: "/pengujian-cepat",
    actionText: "Uji Sekarang",
  },
  {
    id: "pengaduan",
    kode: "ADUAN",
    title: "Layanan Pengaduan",
    description:
      "Kanal resmi pelaporan dugaan peredaran obat dan makanan ilegal, palsu, rusak, atau kedaluwarsa.",
    iconName: "ShieldAlert",
    image: "/assets-landingpage/layanan/3.jpg",
    href: "/pengaduan",
    actionText: "Buat Pengaduan",
  },
  {
    id: "ppid",
    kode: "KIP",
    title: "Keterbukaan Informasi",
    description:
      "Akses transparan terhadap dokumen resmi publik, SOP pengawasan, anggaran, dan laporan kinerja PPID.",
    iconName: "FileText",
    image: "/assets-landingpage/layanan/4.jpg",
    href: "/keterbukaan-informasi",
    actionText: "Lihat Dokumen",
  },
];

interface ServicesSectionProps {
  initialData?: LandingServiceItem[];
}

export function ServicesSection({ initialData }: ServicesSectionProps) {
  const services = initialData && initialData.length > 0 ? initialData : DEFAULT_SERVICES;

  return (
    <section
      id="layanan"
      className="relative w-full pt-12 sm:pt-20 lg:pt-24 pb-12 sm:pb-16 bg-gradient-to-b from-white via-sky-50/40 to-white dark:from-slate-950 dark:via-[#06122e]/30 dark:to-slate-950 transition-colors duration-300 overflow-hidden scroll-mt-20"
    >
      <div className="relative max-w-[1440px] mx-auto px-4 sm:px-10 lg:px-14">
        {/* ========================================================= */}
        {/* HEADER SECTION: Judul di Kiri + Tombol di Kanan           */}
        {/* ========================================================= */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 pb-2">
          {/* Sisi Kiri: Eyebrow + Display Headline */}
          <div className="max-w-2xl">
            <span className="block text-[11px] sm:text-xs md:text-sm font-extrabold uppercase tracking-wider sm:tracking-[0.2em] text-brand-orange-600 dark:text-orange-400 mb-1.5 sm:mb-3">
              Layanan Utama AMPERA
            </span>
            <h2 className="font-brand font-extrabold text-navy-900 dark:text-white text-2xl sm:text-3xl md:text-4xl lg:text-[44px] leading-tight sm:leading-[1.12] tracking-tight">
              Layanan Publik yang Sesuai{" "}
              <span className="text-brand-orange">Kebutuhan Anda</span>
            </h2>
          </div>

          {/* Sisi Kanan: Tombol View All */}
          <div className="shrink-0">
            <a
              href="#layanan"
              className="group inline-flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 rounded-full border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900 text-xs sm:text-sm font-bold text-navy-900 dark:text-white hover:border-brand-orange hover:text-brand-orange shadow-xs transition-all duration-300 hover:shadow-md cursor-pointer focus-visible:outline-2 focus-visible:outline-brand-orange"
            >
              <span>Lihat Semua Layanan</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </a>
          </div>
        </div>

        {/* ========================================================= */}
        {/* GRID KARTU LAYANAN: 2 Kolom di Mobile, 4 di Desktop       */}
        {/* ========================================================= */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mt-7 sm:mt-12 lg:mt-14">
          {services.map((service) => {
            const IconComponent = ICON_MAP[service.iconName] || HelpCircle;
            return (
              <div
                key={service.id}
                className="group rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900/85 border border-slate-100 dark:border-slate-800/90 shadow-[0_4px_20px_-10px_rgb(11_42_107/0.06)] sm:shadow-[0_10px_35px_-15px_rgb(11_42_107/0.08)] hover:shadow-card hover:-translate-y-1.5 sm:hover:-translate-y-2 transition-all duration-300 flex flex-col overflow-hidden"
              >
                {/* Bagian Atas: Gambar dan Badge Ikon Mengambang */}
                <div className="relative w-full">
                  {/* Container Foto dengan overflow-hidden khusus untuk efek zoom */}
                  <div className="relative w-full aspect-[4/3] bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <Image
                      src={service.image}
                      alt={service.title}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                      unoptimized={service.image.startsWith("http")}
                    />

                    {/* Subtle Gradient Shadow di bawah foto */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />
                  </div>

                  {/* Overlapping Floating Icon Badge (Di luar overflow-hidden foto sehingga tampil utuh) */}
                  <div className="absolute -bottom-3.5 sm:-bottom-6 left-3 sm:left-6 z-20 w-8 h-8 sm:w-14 sm:h-14 rounded-full bg-orange-50 dark:bg-orange-500/20 border-2 sm:border-6 border-white dark:border-slate-800 flex items-center justify-center text-brand-orange dark:text-orange-400">
                    <IconComponent className="w-3.5 h-3.5 sm:w-6 sm:h-6 stroke-[2]" />
                  </div>
                </div>

                {/* Bagian Bawah: Judul, Deskripsi, dan Link Aksi */}
                <div className="pt-5 sm:pt-9 pb-3.5 sm:pb-6 px-3 sm:px-6 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Judul Layanan */}
                    <h3 className="font-brand font-bold text-xs sm:text-base lg:text-lg text-navy-900 dark:text-white leading-snug">
                      {service.title}
                    </h3>

                    {/* Deskripsi Singkat */}
                    <p className="text-[11px] sm:text-[13px] text-ink-soft dark:text-slate-400 mt-1 sm:mt-2 leading-relaxed line-clamp-2 sm:line-clamp-3">
                      {service.description}
                    </p>
                  </div>

                  {/* Action Link dengan Panah */}
                  <div className="pt-2.5 sm:pt-5">
                    <Link
                      href={service.href}
                      className="inline-flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-sm font-bold text-brand-orange hover:text-brand-orange-600 transition-colors group/link"
                    >
                      <span>{service.actionText}</span>
                      <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 shrink-0 transition-transform duration-200 group-hover/link:translate-x-1" />
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

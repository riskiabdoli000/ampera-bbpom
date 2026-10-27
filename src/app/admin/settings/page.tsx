import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  Sparkles,
  BookOpen,
  Video,
  PhoneCall,
  ArrowRight,
  Sliders,
  ExternalLink,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function WebsiteSettingsIndexPage() {
  const [activeSlidesCount, totalEdukasiCount] = await Promise.all([
    prisma.heroSlide.count({ where: { isActive: true } }),
    prisma.edukasi.count(),
  ]);

  const sections = [
    {
      title: "Hero Content Banner",
      desc: "Atur foto slider latar belakang, judul utama, deskripsi layanan, dan tombol CTA 'Mulai Pengujian Cepat'.",
      icon: Sparkles,
      href: "/admin/settings/hero",
      badge: `${activeSlidesCount} Slide Aktif`,
      color: "from-amber-500 to-orange-600",
    },
    {
      title: "Konten Edukasi Konsumen",
      desc: "Kelola artikel dan tips edukasi keamanan obat, pangan, kosmetik, serta kampanye Cek KLIK.",
      icon: BookOpen,
      href: "/admin/settings/edukasi",
      badge: `${totalEdukasiCount} Materi Siap`,
      color: "from-blue-600 to-cyan-600",
    },
    {
      title: "Video Profil BBPOM",
      desc: "Kelola link video YouTube profil resmi Balai Besar POM di Palembang dan video panduan pengujian.",
      icon: Video,
      href: "/admin/settings/video",
      badge: "YouTube Embed",
      color: "from-red-600 to-rose-600",
    },
    {
      title: "Kontak & Lokasi Kantor",
      desc: "Perbarui nomor WhatsApp pengaduan, alamat kantor, Google Maps, dan media sosial resmi.",
      icon: PhoneCall,
      href: "/admin/settings/kontak",
      badge: "Google Maps & Sosmed",
      color: "from-emerald-600 to-teal-600",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-orange">
            <Sliders className="h-3.5 w-3.5" />
            <span>Content Management System</span>
          </div>
          <h1 className="text-2xl font-extrabold text-navy-900 dark:text-white font-brand mt-1">
            Pengaturan Konten Website
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Kelola teks, foto slider, video profil, dan informasi kontak yang tersimpan di database.
          </p>
        </div>

        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-2 rounded-xl bg-navy-900 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-navy-700 transition-all dark:bg-sky-600 dark:hover:bg-sky-500"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          <span>Lihat Website Publik</span>
        </Link>
      </div>

      {/* Grid of 4 Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((section, idx) => {
          const Icon = section.icon;
          return (
            <div
              key={idx}
              className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:border-brand-orange hover:shadow-xl dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-orange"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr ${section.color} text-white shadow-md`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {section.badge}
                  </span>
                </div>

                <h2 className="mt-5 text-lg font-bold text-navy-900 dark:text-white group-hover:text-brand-orange transition-colors">
                  {section.title}
                </h2>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {section.desc}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <Link
                  href={section.href}
                  className="inline-flex items-center gap-2 text-xs font-bold text-navy-900 group-hover:text-brand-orange dark:text-sky-300 dark:group-hover:text-orange-400 transition-colors"
                >
                  <span>Buka Editor {section.title}</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

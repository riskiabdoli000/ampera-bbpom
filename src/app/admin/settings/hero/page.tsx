"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Sparkles,
  Save,
  CheckCircle,
  Eye,
  Plus,
  Trash2,
  Upload,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export default function AdminHeroSettingsPage() {
  const [title, setTitle] = useState(
    "Layanan Publik Cepat & Terpercaya BBPOM di Palembang"
  );
  const [subtitle, setSubtitle] = useState(
    "Satu portal terpadu untuk pengujian cepat sampel pangan, permintaan informasi, pengaduan konsumen, dan keterbukaan informasi publik."
  );
  const [ctaPrimaryText, setCtaPrimaryText] = useState("Mulai Pengujian Cepat");
  const [ctaSecondaryText, setCtaSecondaryText] = useState("Pelajari Layanan");
  const [isSaved, setIsSaved] = useState(false);

  const [slides, setSlides] = useState([
    {
      id: 1,
      image: "/assets-landingpage/hero2.png",
      title: "Jembatan Ampera & Sungai Musi",
      alt: "Landmark Ikonik Sumatera Selatan",
      active: true,
    },
    {
      id: 2,
      image: "/assets-landingpage/hero1.png",
      title: "Gedung Balai Besar POM di Palembang",
      alt: "Kantor Pelayanan Terpadu BBPOM",
      active: true,
    },
  ]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-orange">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Website Settings</span>
          </div>
          <h1 className="text-2xl font-extrabold text-navy-900 dark:text-white font-brand mt-1">
            Pengaturan Hero Banner
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Ubah judul utama, narasi hero, teks tombol panggilan aksi (CTA), dan foto slider.
          </p>
        </div>

        <button
          onClick={handleSave}
          type="button"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#ff7a1a] to-[#f26a0f] px-5 py-2.5 text-xs font-bold text-white shadow-cta hover:brightness-110 transition-all hover:-translate-y-0.5"
        >
          {isSaved ? (
            <>
              <CheckCircle className="h-4 w-4" />
              <span>Tersimpan!</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              <span>Simpan Perubahan</span>
            </>
          )}
        </button>
      </div>

      {/* Grid: Editor Form di Kiri & Live Preview di Kanan */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Editor Form (7 Kolom) */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSave} className="space-y-6">
            {/* Box 1: Teks Utama */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <h2 className="text-sm font-bold text-navy-900 dark:text-white uppercase tracking-wider">
                1. Teks Headline & Deskripsi
              </h2>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Judul Utama (Headline)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 focus:border-brand-orange focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  placeholder="Masukkan judul utama landing page..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Sub-judul / Narasi Pengantar
                </label>
                <textarea
                  rows={3}
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-brand-orange focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  placeholder="Masukkan deskripsi singkat..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Label Tombol CTA Utama
                  </label>
                  <input
                    type="text"
                    value={ctaPrimaryText}
                    onChange={(e) => setCtaPrimaryText(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs sm:text-sm text-slate-900 focus:border-brand-orange focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Label Tombol CTA Sekunder
                  </label>
                  <input
                    type="text"
                    value={ctaSecondaryText}
                    onChange={(e) => setCtaSecondaryText(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs sm:text-sm text-slate-900 focus:border-brand-orange focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Box 2: Slide Gambar Banner */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-navy-900 dark:text-white uppercase tracking-wider">
                  2. Slide Foto Hero ({slides.length} Slide)
                </h2>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-orange hover:text-brand-orange-600 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Tambah Slide</span>
                </button>
              </div>

              <div className="space-y-3">
                {slides.map((slide, idx) => (
                  <div
                    key={slide.id}
                    className="flex items-center gap-4 rounded-2xl border border-slate-200/80 p-3 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/50"
                  >
                    <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100">
                      <Image
                        src={slide.image}
                        alt={slide.alt}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-navy-900 dark:text-white truncate">
                          Slide #{idx + 1}: {slide.title}
                        </span>
                        <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                          Aktif
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">
                        File: {slide.image}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        className="p-1.5 text-slate-400 hover:text-navy-900 dark:hover:text-white transition-colors"
                        title="Upload gambar baru"
                      >
                        <Upload className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </form>
        </div>

        {/* Live Preview (5 Kolom) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
              <Eye className="h-4 w-4" />
              <span>Live Visual Preview</span>
            </span>
            <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500">
              Desktop Scaled
            </span>
          </div>

          <div className="relative overflow-hidden rounded-3xl border-2 border-slate-200/90 bg-gradient-to-br from-white via-sky-50 to-sky-100 p-6 shadow-md dark:border-slate-800 dark:from-slate-950 dark:via-[#06122e] dark:to-[#0b1f4d]">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-1 rounded-full bg-navy-900/10 px-2.5 py-1 text-[10px] font-bold text-navy-900 dark:bg-sky-400/20 dark:text-sky-300">
                <ShieldCheck className="h-3 w-3 text-brand-orange" />
                <span>BBPOM DI PALEMBANG</span>
              </div>

              <h3 className="text-base font-extrabold text-navy-900 dark:text-white font-brand leading-tight">
                {title || "Judul Utama Hero..."}
              </h3>

              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                {subtitle || "Deskripsi pengantar layanan..."}
              </p>

              {/* Action Buttons Mockup */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#ff7a1a] to-[#f26a0f] px-3 py-1.5 text-[11px] font-bold text-white shadow-cta">
                  <span>{ctaPrimaryText}</span>
                  <ArrowRight className="h-3 w-3" />
                </span>
                <span className="rounded-full border border-navy-900/30 px-3 py-1.5 text-[11px] font-bold text-navy-900 dark:border-white/30 dark:text-white">
                  {ctaSecondaryText}
                </span>
              </div>

              {/* Slider Preview Thumbnail */}
              <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Latar Foto Slide
                </span>
                <div className="relative h-28 w-full overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
                  <Image
                    src={slides[0]?.image || "/assets-landingpage/hero2.png"}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2">
                    <span className="text-[10px] font-semibold text-white">
                      {slides[0]?.title}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

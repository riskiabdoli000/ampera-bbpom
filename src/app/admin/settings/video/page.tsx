"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Video,
  Play,
  Save,
  CheckCircle,
  Eye,
  Star,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";

export default function AdminVideoSettingsPage() {
  const [videoTitle, setVideoTitle] = useState(
    "Mengenal Lebih Dekat Dedikasi & Layanan BBPOM di Palembang"
  );
  const [eyebrow, setEyebrow] = useState(
    "DEDIKASI, INTEGRITAS & PELAYANAN PUBLIK PRIMA"
  );
  const [videoUrl, setVideoUrl] = useState(
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  );
  const [description, setDescription] = useState(
    "Video profil resmi Balai Besar POM di Palembang: Garda terdepan pengawasan obat dan makanan di Sumatera Selatan."
  );
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-orange">
            <Video className="h-3.5 w-3.5" />
            <span>Website Settings</span>
          </div>
          <h1 className="text-2xl font-extrabold text-navy-900 dark:text-white font-brand mt-1">
            Pengaturan Video Profil
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Kelola URL video YouTube profil resmi dan tampilan cinematic player di landing page.
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

      {/* Grid: Editor & Visual Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Editor (7 Kolom) */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSave} className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <h2 className="text-sm font-bold text-navy-900 dark:text-white uppercase tracking-wider">
              Detail Video Profil Institusi
            </h2>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Tagline Atas (Eyebrow Uppercase)
              </label>
              <input
                type="text"
                value={eyebrow}
                onChange={(e) => setEyebrow(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-medium text-slate-900 focus:border-brand-orange focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Judul Utama Video Section
              </label>
              <input
                type="text"
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-semibold text-slate-900 focus:border-brand-orange focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                URL Video YouTube (Embed / Watch)
              </label>
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-mono text-slate-900 focus:border-brand-orange focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Keterangan Singkat Modal
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-900 focus:border-brand-orange focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/40 p-4 border border-amber-200/80 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-3">
              <Star className="h-5 w-5 fill-amber-400 text-amber-400 shrink-0" />
              <span>
                Rating 5 Bintang di landing page diaktifkan otomatis untuk mencerminkan predikat Pelayanan Prima BBPOM Palembang.
              </span>
            </div>
          </form>
        </div>

        {/* Live Preview (5 Kolom) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
              <Eye className="h-4 w-4" />
              <span>Live Visual Mockup</span>
            </span>
          </div>

          <div className="relative overflow-hidden rounded-3xl min-h-[360px] flex items-center justify-center text-center p-6 shadow-xl border border-slate-200 dark:border-slate-800">
            <Image
              src="/assets-landingpage/hero1.png"
              alt="Gedung BBPOM Palembang"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-navy-950/80 to-black/70" />

            <div className="relative z-10 flex flex-col items-center max-w-sm space-y-3">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-amber-400" />
                ))}
              </div>

              <span className="text-[9px] uppercase tracking-widest text-white/80 font-semibold">
                {eyebrow}
              </span>

              <h3 className="font-serif text-sm sm:text-base text-white font-normal leading-snug">
                {videoTitle}
              </h3>

              <div className="pt-2">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#ff8a1f] to-[#f26a0f] text-white flex items-center justify-center shadow-cta ring-4 ring-white/30">
                  <Play className="h-5 w-5 fill-current ml-0.5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

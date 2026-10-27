"use client";

import React, { useState, useTransition, useMemo, useEffect } from "react";
import Image from "next/image";
import {
  Video,
  Play,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  Star,
  ExternalLink,
  Loader2,
  X,
  ShieldCheck,
  Sparkles,
  Check,
  XCircle,
} from "lucide-react";
import { saveVideoSettingsAction } from "@/app/actions/settings-video";
import { extractYouTubeId } from "@/lib/youtube";

function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

interface VideoSettingsFormProps {
  initialData: {
    id: number;
    eyebrow: string;
    judul: string;
    deskripsi: string;
    youtubeUrl: string;
    youtubeId: string;
  };
}

export function VideoSettingsForm({ initialData }: VideoSettingsFormProps) {
  const [eyebrow, setEyebrow] = useState(initialData.eyebrow);
  const [judul, setJudul] = useState(initialData.judul);
  const [youtubeUrl, setYoutubeUrl] = useState(initialData.youtubeUrl);
  const [deskripsi, setDeskripsi] = useState(initialData.deskripsi);

  // Status & Feedback
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Auto-close feedback banner setelah 5 detik
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => {
        setFeedback(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  const [isPending, startTransition] = useTransition();

  // Modal uji putar video
  const [isPlayingTest, setIsPlayingTest] = useState(false);

  // Deteksi YouTube ID secara real-time
  const detectedYouTubeId = useMemo(() => {
    return extractYouTubeId(youtubeUrl);
  }, [youtubeUrl]);

  // Handle Simpan ke Database
  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setFeedback(null);

    if (!detectedYouTubeId) {
      setFeedback({
        type: "error",
        message:
          "URL YouTube tidak valid. Pastikan link YouTube yang dimasukkan benar sebelum menyimpan.",
      });
      return;
    }

    startTransition(async () => {
      const res = await saveVideoSettingsAction({
        eyebrow,
        judul,
        deskripsi,
        youtubeUrl,
      });

      if (res.success) {
        setFeedback({
          type: "success",
          message: "Pengaturan Video Profil berhasil disimpan ke database!",
        });
        setTimeout(() => setFeedback(null), 4000);
      } else {
        setFeedback({
          type: "error",
          message: res.error || "Gagal menyimpan pengaturan video.",
        });
      }
    });
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Feedback Toast Banner */}
      {feedback && (
        <div
          className={`flex items-center justify-between p-4 rounded-2xl border text-xs sm:text-sm font-medium animate-fade-in ${
            feedback.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300"
              : "bg-red-50 border-red-200 text-red-800 dark:bg-red-950/40 dark:border-red-800 dark:text-red-300"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === "success" ? (
              <Check className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <XCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-xs font-bold opacity-60 hover:opacity-100 transition-opacity ml-4 cursor-pointer"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-orange">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Pengaturan Video Profil</span>
          </div>
          <h1 className="text-2xl font-black text-navy-900 dark:text-white font-brand mt-1">
            Video Profil BBPOM
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Kelola judul, narasi pengantar, dan URL video YouTube resmi yang tampil di landing page.
          </p>
        </div>

        <button
          onClick={() => handleSave()}
          disabled={isPending}
          type="button"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#ff7a1a] to-[#f26a0f] px-5 py-2.5 text-xs font-bold text-white shadow-cta hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Menyimpan ke Database...</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              <span>Simpan Perubahan Video</span>
            </>
          )}
        </button>
      </div>

      {/* Grid: Editor Form & Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Kolom Kiri: Form Editor (7 Kolom) */}
        <div className="lg:col-span-7 space-y-6">
          <form
            onSubmit={handleSave}
            className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h2 className="text-xs font-extrabold text-navy-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-navy-900 text-white dark:bg-sky-500 text-[10px]">
                  1
                </span>
                <span>Detail Konten & Tautan YouTube</span>
              </h2>
              <span className="text-[10px] font-semibold text-slate-400">
                Tabel: VideoProfil
              </span>
            </div>

            {/* Tagline Eyebrow */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Tagline Atas (Eyebrow Uppercase)
              </label>
              <input
                type="text"
                value={eyebrow}
                onChange={(e) => setEyebrow(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs sm:text-sm font-semibold tracking-wider uppercase text-slate-900 focus:border-brand-orange focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white transition-colors"
                placeholder="DEDIKASI, INTEGRITAS & PELAYANAN PUBLIK PRIMA"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Teks label kecil di atas judul utama video profil.
              </p>
            </div>

            {/* Judul Utama Video */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Judul Utama Video Section
              </label>
              <input
                type="text"
                value={judul}
                onChange={(e) => setJudul(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 focus:border-brand-orange focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white transition-colors"
                placeholder="Mengenal Lebih Dekat Dedikasi & Layanan BBPOM di Palembang"
              />
            </div>

            {/* Input URL YouTube */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  URL Video YouTube (Tautan Video)
                </label>
                {detectedYouTubeId ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>ID: {detectedYouTubeId}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                    <AlertCircle className="h-3 w-3" />
                    <span>Format Belum Terdeteksi</span>
                  </span>
                )}
              </div>

              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-red-600">
                  <YouTubeIcon className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-xs sm:text-sm font-mono text-slate-900 focus:border-brand-orange focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white transition-colors"
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 mt-1.5">
                <p className="text-[11px] text-slate-400">
                  Mendukung format link YouTube standar (watch?v=), link pendek (youtu.be/), atau YouTube Shorts.
                </p>
                {youtubeUrl && (
                  <a
                    href={youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-orange hover:underline"
                  >
                    <span>Buka Tautan Asli</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>

            {/* Deskripsi Narasi */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Keterangan / Narasi Pengantar Video
              </label>
              <textarea
                rows={3}
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-brand-orange focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white transition-colors"
                placeholder="Tuliskan deskripsi narasi video..."
              />
            </div>

            {/* Info Rating 5 Bintang */}
            <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/40 p-4 border border-amber-200/80 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-3">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Rating 5 Bintang Pelayanan Prima</strong>
                <span className="text-[11px] text-amber-700 dark:text-amber-300">
                  Rating 5 Bintang di landing page diaktifkan secara otomatis untuk mencerminkan predikat Pelayanan Prima dan Akreditasi ISO BBPOM di Palembang.
                </span>
              </div>
            </div>
          </form>
        </div>

        {/* Kolom Kanan: Live Visual Mockup (5 Kolom) */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-6 self-start">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300">
              <Eye className="h-4 w-4 text-brand-orange" />
              <span>Pratinjau Sinematik Beranda</span>
            </span>

            {detectedYouTubeId && (
              <button
                type="button"
                onClick={() => setIsPlayingTest(true)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-orange hover:text-orange-600 bg-orange-50 dark:bg-orange-950/40 px-2.5 py-1 rounded-lg border border-orange-200 dark:border-orange-800 transition-colors"
              >
                <Play className="h-3 w-3 fill-current" />
                <span>Uji Putar Video</span>
              </button>
            )}
          </div>

          {/* Kotak Sinematik Sesuai Tampilan Landing Page VideoSection */}
          <div className="group relative overflow-hidden rounded-3xl min-h-[380px] sm:min-h-[420px] flex items-center justify-center text-center p-6 sm:p-8 shadow-xl border border-slate-200/90 dark:border-slate-800 transition-all select-none">
            {/* Foto Gedung Background */}
            <Image
              src="/assets-landingpage/hero1.png"
              alt="Gedung Balai Besar POM di Palembang"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />

            {/* Gradient Overlay Sinematik Gelap */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-navy-950/80 to-black/70 dark:from-black/95 dark:via-slate-950/85 dark:to-black/80" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.5)_100%)] pointer-events-none" />

            {/* Konten Pratinjau Teks & Play Button */}
            <div className="relative z-10 flex flex-col items-center max-w-sm space-y-3.5">
              {/* 5 Golden Stars */}
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-amber-400 drop-shadow" />
                ))}
              </div>

              {/* Eyebrow Tagline */}
              <span className="text-[9px] uppercase tracking-widest text-white/85 font-semibold">
                {eyebrow || "DEDIKASI, INTEGRITAS & PELAYANAN PUBLIK PRIMA"}
              </span>

              {/* Judul Utama Video (Font Serif) */}
              <h3 className="font-serif text-base sm:text-lg text-white font-normal leading-snug drop-shadow-sm">
                {judul || "Mengenal Lebih Dekat Dedikasi & Layanan BBPOM di Palembang"}
              </h3>

              {/* Deskripsi Singkat */}
              <p className="text-[10px] sm:text-[11px] text-white/75 leading-relaxed line-clamp-3 font-light max-w-xs">
                {deskripsi ||
                  "Saksikan dokumentasi resmi mengenai fasilitas laboratorium modern teruji dan komitmen insan BPOM Palembang."}
              </p>

              {/* Tombol Play Interaktif */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setIsPlayingTest(true)}
                  disabled={!detectedYouTubeId}
                  className="group/btn inline-flex items-center gap-2.5 text-white transition-all cursor-pointer hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Klik untuk uji putar video"
                >
                  <div className="relative h-11 w-11 rounded-full bg-gradient-to-br from-[#ff8a1f] to-[#f26a0f] text-white flex items-center justify-center shadow-cta ring-4 ring-white/30 group-hover/btn:ring-white/50 transition-all">
                    <Play className="h-4 w-4 fill-current ml-0.5" />
                  </div>
                  <span className="text-xs font-semibold text-white/95 group-hover/btn:underline">
                    Uji Putar Video
                  </span>
                </button>
              </div>
            </div>

            {/* Badge Status YouTube di Sudut Bawah */}
            <div className="absolute bottom-3 inset-x-3 flex items-center justify-between text-[10px] text-white/70 px-2 py-1 rounded-xl bg-black/40 backdrop-blur-xs">
              <span className="flex items-center gap-1 truncate">
                <YouTubeIcon className="h-3.5 w-3.5 text-red-500 shrink-0" />
                <span className="truncate">{detectedYouTubeId ? `ID: ${detectedYouTubeId}` : "Belum ada link"}</span>
              </span>
              <span className="text-emerald-400 font-semibold shrink-0">Live Preview</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Player Uji Putar Video YouTube */}
      {isPlayingTest && detectedYouTubeId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-navy-950/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-3xl rounded-3xl bg-slate-900 shadow-2xl border border-slate-800 overflow-hidden flex flex-col">
            {/* Header Modal Test */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/60 text-white">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 rounded-lg bg-red-600 text-white flex items-center justify-center shrink-0">
                  <Play className="w-3 h-3 fill-current ml-0.5" />
                </div>
                <span className="font-bold text-xs truncate">
                  Uji Player YouTube: {judul}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsPlayingTest(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                title="Tutup Player"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Iframe YouTube Responsif */}
            <div className="relative aspect-video w-full bg-black">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${detectedYouTubeId}?autoplay=1&rel=0`}
                title="YouTube Video Player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0 h-full w-full border-0"
              />
            </div>

            {/* Footer Modal Info */}
            <div className="px-5 py-3 bg-slate-950 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Video ID: <strong className="text-white font-mono">{detectedYouTubeId}</strong></span>
              <button
                type="button"
                onClick={() => setIsPlayingTest(false)}
                className="rounded-lg bg-slate-800 px-3 py-1 text-white hover:bg-slate-700 transition-colors"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

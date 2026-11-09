"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { Star, Play, ChevronLeft, ChevronRight } from "lucide-react";
import { VideoModal } from "./VideoModal";

export interface LandingVideoData {
  id?: number;
  eyebrow: string;
  judul: string;
  deskripsi: string;
  youtubeUrl: string;
  youtubeId: string;
  urutan?: number;
  isActive?: boolean;
}

const DEFAULT_VIDEO: LandingVideoData = {
  id: 1,
  eyebrow: "DEDIKASI, INTEGRITAS & PELAYANAN PUBLIK PRIMA",
  judul: "Mengenal Lebih Dekat Dedikasi & Layanan BBPOM di Palembang",
  deskripsi:
    "Saksikan dokumentasi resmi mengenai fasilitas laboratorium modern teruji, pengawasan peredaran terpadu, serta komitmen seluruh insan BPOM dalam melindungi kesehatan masyarakat Sumatera Selatan.",
  youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  youtubeId: "dQw4w9WgXcQ",
};

interface VideoSectionProps {
  initialData?: LandingVideoData[] | LandingVideoData | null;
}

export function VideoSection({ initialData }: VideoSectionProps) {
  // Normalisasi data menjadi array video
  const videos: LandingVideoData[] = Array.isArray(initialData)
    ? initialData.length > 0
      ? initialData
      : [DEFAULT_VIDEO]
    : initialData
    ? [initialData]
    : [DEFAULT_VIDEO];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);

  // Pastikan currentIndex selalu valid jika panjang array berubah
  const safeIndex = currentIndex < videos.length ? currentIndex : 0;
  const activeVideo = videos[safeIndex] || DEFAULT_VIDEO;
  const hasMultiple = videos.length > 1;

  // URL Thumbnail YouTube aktif (HD maxresdefault dengan fallback hqdefault & hero1)
  const [bgImg, setBgImg] = useState<string>(() => {
    return activeVideo.youtubeId
      ? `https://img.youtube.com/vi/${activeVideo.youtubeId}/maxresdefault.jpg`
      : "/assets-landingpage/hero1.png";
  });

  useEffect(() => {
    if (activeVideo.youtubeId) {
      setBgImg(`https://img.youtube.com/vi/${activeVideo.youtubeId}/maxresdefault.jpg`);
    } else {
      setBgImg("/assets-landingpage/hero1.png");
    }
  }, [activeVideo.youtubeId]);

  // Navigasi Slide
  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + videos.length) % videos.length);
  }, [videos.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % videos.length);
  }, [videos.length]);

  // Auto-slide setiap 7 detik jika lebih dari 1 video dan tidak sedang di-pause/hover
  useEffect(() => {
    if (isPaused || !hasMultiple || videoOpen) return;
    const timer = setInterval(() => {
      handleNext();
    }, 7000);
    return () => clearInterval(timer);
  }, [isPaused, hasMultiple, videoOpen, handleNext]);

  // Touch Swipe Handlers untuk perangkat mobile
  const touchStartRef = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartRef.current === null) return;
    const diff = touchStartRef.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 45) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    touchStartRef.current = null;
  };

  return (
    <>
      <section
        id="video"
        className="relative w-full pt-2 sm:pt-4 pb-16 sm:pb-24 bg-white dark:bg-slate-950 transition-colors scroll-mt-20 select-none"
      >
        <div className="max-w-[1440px] mx-auto px-5 sm:px-10 lg:px-14">
          {/* Cinematic Container Box */}
          <div
            className="relative rounded-3xl md:rounded-[2.5rem] overflow-hidden min-h-[480px] sm:min-h-[540px] lg:min-h-[600px] flex items-center justify-center text-center p-6 sm:p-12 md:p-16 shadow-[0_20px_50px_-15px_rgba(11,42,107,0.35)] group"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Background Thumbnail YouTube atau Fallback Gedung BBPOM */}
            <Image
              key={activeVideo.youtubeId || "default"}
              src={bgImg}
              alt={activeVideo.judul || "Video Profil BBPOM di Palembang"}
              fill
              unoptimized={Boolean(activeVideo.youtubeId)}
              onError={() => {
                if (activeVideo.youtubeId && !bgImg.includes("hqdefault")) {
                  setBgImg(`https://img.youtube.com/vi/${activeVideo.youtubeId}/hqdefault.jpg`);
                } else {
                  setBgImg("/assets-landingpage/hero1.png");
                }
              }}
              sizes="(max-width: 1280px) 100vw, 1280px"
              className="object-cover object-center scale-100 group-hover:scale-105 transition-transform duration-1000 ease-out"
              priority={false}
            />

            {/* Cinematic Moody Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/92 via-navy-950/80 to-black/65 dark:from-black/95 dark:via-slate-950/85 dark:to-black/75" />

            {/* Subtle Vignette & Radial Light */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_25%,rgba(0,0,0,0.55)_100%)] pointer-events-none" />

            {/* Content Wrapper (beranimasi halus saat slide berganti) */}
            <div
              key={activeVideo.id ?? safeIndex}
              className="relative z-10 max-w-4xl mx-auto flex flex-col items-center animate-fade-in"
            >
              {/* 5 Golden Stars Rating */}
              <div
                className="flex items-center gap-1.5 sm:gap-2 mb-4 sm:mb-5 text-amber-400"
                aria-label="Rating 5 Bintang Pelayanan Prima"
              >
                {[...Array(5)].map((_, index) => (
                  <Star
                    key={index}
                    className="w-4 h-4 sm:w-5 sm:h-5 fill-amber-400 text-amber-400 drop-shadow-[0_2px_8px_rgba(245,158,11,0.5)]"
                  />
                ))}
              </div>

              {/* Eyebrow / Tagline Uppercase */}
              <p className="text-[11px] sm:text-xs md:text-sm font-semibold tracking-[0.24em] sm:tracking-[0.28em] text-white/85 uppercase mb-3 sm:mb-4 px-4">
                {activeVideo.eyebrow || DEFAULT_VIDEO.eyebrow}
              </p>

              {/* Main Headline */}
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white font-normal tracking-tight leading-[1.18] drop-shadow-md max-w-3xl px-2">
                {activeVideo.judul || DEFAULT_VIDEO.judul}
              </h2>

              {/* Description Paragraph */}
              <p className="text-xs sm:text-sm md:text-base text-white/75 max-w-2xl mx-auto leading-relaxed mt-4 sm:mt-5 font-light px-4">
                {activeVideo.deskripsi || DEFAULT_VIDEO.deskripsi}
              </p>

              {/* Action Button: Interactive Watch Video Button */}
              <div className="flex items-center justify-center mt-8 sm:mt-10">
                <button
                  type="button"
                  onClick={() => setVideoOpen(true)}
                  className="group/video inline-flex items-center gap-3 text-white hover:text-white transition-all cursor-pointer active:scale-95 py-2 px-1 focus-visible:outline-2 focus-visible:outline-brand-orange rounded-full"
                >
                  {/* Circular Icon Ring */}
                  <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-full border border-white/70 group-hover/video:border-white flex items-center justify-center bg-white/10 group-hover/video:bg-brand-orange group-hover/video:shadow-[0_0_24px_rgba(255,122,26,0.7)] backdrop-blur-xs transition-all duration-300">
                    <Play className="w-4 h-4 sm:w-5 sm:h-5 text-white fill-current ml-0.5" />
                    {/* Ripple Ping Animation on Hover */}
                    <span className="absolute inset-0 rounded-full border border-white/50 animate-ping opacity-0 group-hover/video:opacity-75 pointer-events-none" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold tracking-wide text-white/95 group-hover/video:text-white underline-offset-4 group-hover/video:underline">
                    Tonton Video Profil
                  </span>
                </button>
              </div>
            </div>

            {/* Slider Controls (Hanya muncul jika lebih dari 1 video) */}
            {hasMultiple && (
              <>
                {/* Tombol Panah Kiri */}
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Video sebelumnya"
                  className="absolute left-3 sm:left-6 md:left-8 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/35 hover:bg-black/60 border border-white/20 hover:border-white/50 text-white flex items-center justify-center backdrop-blur-md transition-all active:scale-90 cursor-pointer shadow-lg hover:shadow-orange-500/20"
                >
                  <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>

                {/* Tombol Panah Kanan */}
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Video selanjutnya"
                  className="absolute right-3 sm:right-6 md:right-8 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/35 hover:bg-black/60 border border-white/20 hover:border-white/50 text-white flex items-center justify-center backdrop-blur-md transition-all active:scale-90 cursor-pointer shadow-lg hover:shadow-orange-500/20"
                >
                  <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>

                {/* Dots / Pagination Indicator */}
                <div className="absolute bottom-5 sm:bottom-7 inset-x-0 z-20 flex items-center justify-center gap-2">
                  {videos.map((vid, idx) => {
                    const isActive = idx === safeIndex;
                    return (
                      <button
                        key={vid.id ?? idx}
                        type="button"
                        onClick={() => setCurrentIndex(idx)}
                        aria-label={`Pindah ke video ${idx + 1}`}
                        className={`transition-all duration-300 rounded-full cursor-pointer h-2 ${
                          isActive
                            ? "w-8 bg-gradient-to-r from-[#ff8a1f] to-[#f26a0f] shadow-sm shadow-orange-500/50"
                            : "w-2 bg-white/40 hover:bg-white/70"
                        }`}
                      />
                    );
                  })}
                </div>

                {/* Badge Nomor Slide (Pojok Kanan Atas) */}
                <div className="absolute top-5 right-5 sm:top-7 sm:right-8 z-20 hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 border border-white/15 backdrop-blur-md text-[11px] font-bold text-white/80">
                  <span className="text-brand-orange">{safeIndex + 1}</span>
                  <span>/</span>
                  <span>{videos.length}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Video Modal Player Pop-up */}
      <VideoModal
        isOpen={videoOpen}
        onClose={() => setVideoOpen(false)}
        video={activeVideo}
      />
    </>
  );
}

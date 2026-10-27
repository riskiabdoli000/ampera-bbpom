"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Star, Play } from "lucide-react";
import { VideoModal } from "./VideoModal";

export interface LandingVideoData {
  id?: number;
  eyebrow: string;
  judul: string;
  deskripsi: string;
  youtubeUrl: string;
  youtubeId: string;
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
  initialData?: LandingVideoData | null;
}

export function VideoSection({ initialData }: VideoSectionProps) {
  const [videoOpen, setVideoOpen] = useState(false);
  const video = initialData || DEFAULT_VIDEO;

  return (
    <>
      <section
        id="video"
        className="relative w-full pt-2 sm:pt-4 pb-16 sm:pb-24 bg-white dark:bg-slate-950 transition-colors scroll-mt-20"
      >
        <div className="max-w-[1440px] mx-auto px-5 sm:px-10 lg:px-14">
          {/* Cinematic Container Box */}
          <div className="relative rounded-3xl md:rounded-[2.5rem] overflow-hidden min-h-[460px] sm:min-h-[520px] lg:min-h-[580px] flex items-center justify-center text-center p-6 sm:p-12 md:p-16 shadow-[0_20px_50px_-15px_rgba(11,42,107,0.35)] group">
            {/* Background Image */}
            <Image
              src="/assets-landingpage/hero1.png"
              alt="Gedung Balai Besar Pengawas Obat dan Makanan di Palembang"
              fill
              sizes="(max-width: 1280px) 100vw, 1280px"
              className="object-cover object-center scale-100 group-hover:scale-105 transition-transform duration-1000 ease-out"
              priority={false}
            />

            {/* Cinematic Moody Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-navy-950/75 to-black/60 dark:from-black/95 dark:via-slate-950/80 dark:to-black/70" />
            
            {/* Subtle Vignette & Radial Light */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.45)_100%)] pointer-events-none" />

            {/* Content Wrapper */}
            <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
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
              <p className="text-[11px] sm:text-xs md:text-sm font-semibold tracking-[0.24em] sm:tracking-[0.28em] text-white/85 uppercase mb-3 sm:mb-4">
                {video.eyebrow || DEFAULT_VIDEO.eyebrow}
              </p>

              {/* Main Headline */}
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white font-normal tracking-tight leading-[1.18] drop-shadow-md max-w-3xl">
                {video.judul || DEFAULT_VIDEO.judul}
              </h2>

              {/* Description Paragraph */}
              <p className="text-xs sm:text-sm md:text-base text-white/75 max-w-2xl mx-auto leading-relaxed mt-4 sm:mt-5 font-light">
                {video.deskripsi || DEFAULT_VIDEO.deskripsi}
              </p>

              {/* Action Button: Interactive Watch Video Button */}
              <div className="flex items-center justify-center mt-8 sm:mt-10">
                <button
                  type="button"
                  onClick={() => setVideoOpen(true)}
                  className="group/video inline-flex items-center gap-3 text-white hover:text-white transition-all cursor-pointer active:scale-95 py-2 px-1"
                >
                  {/* Circular Icon Ring */}
                  <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-white/70 group-hover/video:border-white flex items-center justify-center bg-white/10 group-hover/video:bg-brand-orange group-hover/video:shadow-[0_0_20px_rgba(255,122,26,0.6)] backdrop-blur-xs transition-all duration-300">
                    <Play className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white fill-current ml-0.5" />
                    {/* Ripple Ping Animation on Hover */}
                    <span className="absolute inset-0 rounded-full border border-white/50 animate-ping opacity-0 group-hover/video:opacity-75 pointer-events-none" />
                  </div>
                  <span className="text-xs sm:text-sm font-medium tracking-wide text-white/95 group-hover/video:text-white underline-offset-4 group-hover/video:underline">
                    Tonton Video Profil
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Modal Player Pop-up */}
      <VideoModal isOpen={videoOpen} onClose={() => setVideoOpen(false)} video={video} />
    </>
  );
}

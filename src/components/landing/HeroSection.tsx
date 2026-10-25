"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ArrowRight, ShieldCheck, Play } from "lucide-react";
import { VideoModal } from "./VideoModal";

const HERO_SLIDES = [
  {
    id: 1,
    image: "/assets-landingpage/hero2.png",
    // Fokus horizontal foto di mobile: jembatan Ampera berada di sisi kanan gambar
    mobilePosition: "80% center",
    alt: "Jembatan Ampera dan Sungai Musi Palembang",
    title: "Jembatan Ampera Palembang",
  },
  {
    id: 2,
    image: "/assets-landingpage/hero1.png",
    mobilePosition: "50% center",
    alt: "Gedung Balai Besar POM di Palembang",
    title: "Gedung BBPOM Palembang",
  },
];

const ctaClass =
  "group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#ff8a1f] to-[#f26a0f] px-6 py-3.5 text-sm sm:px-8 sm:py-4 sm:text-base font-bold text-white shadow-cta transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_28px_-8px_rgb(255_122_26/0.65)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-orange";

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);

  // Auto-slide setiap 6 detik
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isPaused]);

  return (
    <>
      <section
        className="relative w-full lg:min-h-screen flex flex-col overflow-hidden bg-gradient-to-r from-white via-sky-50 to-sky-200/70 dark:from-slate-950 dark:via-[#06122e] dark:to-[#0b1f4d]"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Clip-path foto desktop (dinormalisasi dari referensi 1024x485):
            sisi kiri cembung membulat besar, tepi atas berkelok-S naik ke kanan,
            dasar rata menyisakan strip putih tipis di bawah, kanan bleed. */}
        <svg width="0" height="0" className="absolute pointer-events-none" aria-hidden="true">
          <defs>
            <clipPath id="hero-blob-mask" clipPathUnits="objectBoundingBox">
              <path d="M 0.78 0 L 1 0 L 1 1 L 0.549 1 C 0.506 1, 0.47 0.903, 0.47 0.785 L 0.47 0.3 C 0.47 0.225, 0.513 0.172, 0.566 0.163 C 0.66 0.147, 0.78 0.11, 0.78 0 Z" />
            </clipPath>
            <clipPath id="hero-blob-mask-mobile" clipPathUnits="objectBoundingBox">
              <path d="M 0.08 0 H 0.92 C 0.97 0 1 0.04 1 0.1 V 0.9 C 1 0.96 0.97 1 0.92 1 H 0.2 C 0.06 1 0 0.9 0 0.7 V 0.12 C 0 0.05 0.03 0 0.08 0 Z" />
            </clipPath>
          </defs>
        </svg>

        {/* Blob dekoratif sudut */}
        <div aria-hidden="true" className="hidden lg:block pointer-events-none absolute -bottom-44 -left-34 w-72 h-72 rounded-full bg-gradient-to-tr from-[#ff8a1f] to-[#f26a0f] opacity-95 z-0" />
        {/* <div aria-hidden="true" className="hidden lg:block pointer-events-none absolute -top-16 -right-20 w-64 h-64 rounded-full bg-gradient-to-bl from-[#ff8a1f] to-[#f26a0f] z-[1]" /> */}
        {/* <div aria-hidden="true" className="pointer-events-none absolute -bottom-16 -right-12 w-44 h-44 rounded-full bg-sky-500 z-[1]" /> */}

        {/* Foto utama (desktop) */}
        <div
          className="hidden lg:block absolute inset-x-0 top-0 bottom-[4%] z-[1] select-none animate-slide-right"
          style={{ clipPath: "url(#hero-blob-mask)" }}
        >
          {HERO_SLIDES.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === currentSlide ? "opacity-100" : "opacity-0"
              }`}
            >
              <Image
                src={slide.image}
                alt={slide.alt}
                fill
                priority={index === 0}
                sizes="100vw"
                className="object-cover object-[68%_center]"
              />
            </div>
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-navy-900/25 via-transparent to-transparent" />
        </div>

    

        <div className="relative z-10 max-w-[1440px] mx-auto px-5 sm:px-10 lg:px-14 pt-24 sm:pt-32 lg:pt-32 pb-10 sm:pb-14 lg:pb-16 w-full flex-1 flex flex-col lg:flex-row lg:items-center">
          {/* Kolom kiri: teks */}
          <div className="w-full lg:w-[48%] flex flex-col items-start">
            <h1 className="font-brand font-extrabold text-navy-900 dark:text-white tracking-[-0.03em] leading-[1.02] text-[clamp(34px,10.5vw,56px)] lg:leading-[0.98] lg:text-[clamp(44px,6vw,76px)] animate-fade-up">
              Obat &amp; Pangan
              <br />
              yang Aman,
              <br />
              <span className="relative inline-block text-brand-orange">
                untuk Anda
                <svg
                  aria-hidden="true"
                  viewBox="0 0 360 24"
                  preserveAspectRatio="none"
                  className="absolute left-0 -bottom-2 sm:-bottom-3 w-[105%] h-3 sm:h-4"
                  fill="none"
                >
                  <path
                    d="M4 16 C 70 6, 170 4, 356 8 C 260 12, 130 14, 40 22"
                    stroke="currentColor"
                    strokeWidth="5"
                    strokeLinecap="round"
                    pathLength={1}
                    strokeDasharray={1}
                    className="animate-draw"
                  />
                </svg>
              </span>
            </h1>

            <p
              className="mt-7 sm:mt-10 max-w-[440px] lg:max-w-[400px] text-ink-soft dark:text-slate-300 text-sm sm:text-base leading-relaxed animate-fade-up [animation-delay:120ms]"
            >
              AMPERA adalah inovasi Balai Besar POM di Palembang untuk layanan informasi, pengaduan, dan pengujian cepat sediaan farmasi dan pangan olahan.
            </p>

            <a href="#layanan" className={`${ctaClass} mt-6 sm:mt-8 w-full sm:w-auto animate-fade-up [animation-delay:220ms]`}>
              <span>Akses Layanan AMPERA</span>
              <ArrowRight className="w-[18px] h-[18px] transition-transform duration-200 group-hover:translate-x-1" />
            </a>
          </div>

          {/* Foto (mobile/tablet) */}
          <div className="lg:hidden mt-8 sm:mt-10 w-full max-w-xl mx-auto">
            <div
              className="relative w-full h-72 sm:h-96 shadow-card animate-slide-right"
              style={{ clipPath: "url(#hero-blob-mask-mobile)" }}
            >
              {HERO_SLIDES.map((slide, index) => (
                <div
                  key={slide.id}
                  className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                    index === currentSlide ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <Image
                    src={slide.image}
                    alt={slide.alt}
                    fill
                    priority={index === 0}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                    style={{ objectPosition: slide.mobilePosition }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Kartu #2 (mobile): strip di bawah foto */}
          <div className="lg:hidden mt-4 w-full max-w-xl mx-auto">
            <VideoCard onOpen={() => setVideoOpen(true)} />
          </div>
        </div>

        {/* Kartu #2 (desktop, kanan bawah) */}
        <div className="hidden lg:block absolute bottom-[14%] right-12 xl:right-16 z-20 w-[360px] animate-slide-left [animation-delay:450ms]">
          <VideoCard onOpen={() => setVideoOpen(true)} />
        </div>
      </section>

      <VideoModal isOpen={videoOpen} onClose={() => setVideoOpen(false)} />
    </>
  );
}

function VideoCard({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group w-full text-left rounded-2xl bg-white/85 dark:bg-slate-900/80 backdrop-blur-xl p-2.5 sm:p-3 shadow-card border border-white/70 dark:border-slate-800 flex items-center gap-3 sm:gap-4 cursor-pointer transition-transform duration-300 hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-brand-orange"
      aria-label="Putar video profil BBPOM Palembang"
    >
      <div className="relative w-24 h-20 sm:w-28 sm:h-24 rounded-xl overflow-hidden shrink-0">
        <Image
          src="/assets-landingpage/hero1.png"
          alt="Gedung Balai Besar POM di Palembang"
          fill
          sizes="112px"
          className="object-cover"
        />
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="w-9 h-9 rounded-full bg-gradient-to-br from-[#ff8a1f] to-[#f26a0f] text-white flex items-center justify-center shadow-lg ring-4 ring-white/70 transition-transform duration-300 group-hover:scale-110">
            <Play className="w-4 h-4 fill-current ml-0.5" />
          </span>
        </span>
      </div>
      <div className="flex-1 min-w-0 pr-1">
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-ink-soft dark:text-slate-400">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-orange" />
          Info Terbaru
        </div>
        <div className="flex items-center justify-between gap-2 mt-1">
          <span className="font-brand font-bold text-sm text-navy-900 dark:text-white leading-snug">
            Profil Video AMPERA
          </span>
          <ArrowRight className="w-4 h-4 text-navy-900 dark:text-white shrink-0" />
        </div>
        <p className="text-[11px] sm:text-xs text-ink-soft dark:text-slate-400 mt-1 leading-relaxed line-clamp-2">
          Kenali layanan pengawasan obat dan makanan di Bumi Sriwijaya.
        </p>
      </div>
    </button>
  );
}

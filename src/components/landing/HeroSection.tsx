"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ArrowRight, Play, ChevronLeft, ChevronRight } from "lucide-react";
import { VideoModal } from "./VideoModal";

const HERO_SLIDES = [
  {
    id: 1,
    image: "/assets-landingpage/hero2.png",
    alt: "Jembatan Ampera dan Sungai Musi Palembang",
    title: "Jembatan Ampera Palembang",
    position: "object-[center_35%]",
  },
  {
    id: 2,
    image: "/assets-landingpage/hero1.png",
    alt: "Gedung Balai Besar POM di Palembang",
    title: "Gedung BBPOM Palembang",
    position: "object-[center_45%]",
  },
];

export function HeroSection() {
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-slide setiap 6 detik saat kursor tidak sedang di atas banner
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  return (
    <>
      <section
        className="relative overflow-hidden h-screen max-h-screen flex flex-col justify-between pt-20 sm:pt-24 pb-4 sm:pb-6 group"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Background Images Slider dengan Transisi Halus (Crossfade) */}
        <div className="absolute inset-0 z-0 select-none">
          {HERO_SLIDES.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === currentSlide ? "opacity-100 z-0" : "opacity-0 pointer-events-none"
              }`}
            >
              <Image
                src={slide.image}
                alt={slide.alt}
                fill
                priority={index === 0}
                sizes="100vw"
                className={`object-cover ${slide.position}`}
              />
            </div>
          ))}

          {/* Gradient Overlay: Gradasi Lembut Transparan di Kiri agar Foto Tetap Cerah & Terlihat Jelas */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/95 via-25% to-transparent dark:from-slate-950/90 dark:via-slate-950/50 dark:via-35% dark:to-transparent z-1" />

          {/* Vignette Bawah Tipis Transparan */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-900/10 to-transparent pointer-events-none z-1" />
        </div>

        {/* Hero Main Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 flex flex-col justify-between">
          {/* Main Headline & Call To Action (Healora Style) */}
          <div className="my-auto py-2 max-w-2xl lg:max-w-3xl flex flex-col items-start">
            {/* Badge Identitas Minimalis */}
            <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-white/90 dark:bg-slate-900/90 border border-slate-200/90 dark:border-white/10 shadow-xs backdrop-blur-md text-xs font-medium mb-3 sm:mb-4 animate-in fade-in duration-500">
              <span className="w-2 h-2 rounded-full bg-[#003874] dark:bg-teal-400 animate-pulse" />
              <span className="text-slate-600 dark:text-slate-300 font-medium">Balai Besar POM di </span>
              <span className="text-[#003874] dark:text-white font-bold">Palembang</span>
            </div>

            {/* Main Headline H1: Biru Tua Utama */}
            <h1 className="font-sans text-3xl sm:text-4xl md:text-5xl lg:text-[46px] xl:text-[52px] font-extrabold text-[#003874] dark:text-white tracking-tight leading-[1.15] mb-3 sm:mb-4">
              Pengawasan Mutu <br />
              Obat & Makanan Terpercaya
            </h1>

            {/* Subtitle Paragraf: Abu-abu Elegan */}
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl font-normal mb-5 sm:mb-6">
              Dari sertifikasi CPPOB & CDOB hingga pengujian laboratorium terakreditasi — BBPOM di Palembang hadir menjamin keamanan dan mutu produk untuk melindungi kesehatan masyarakat.
            </p>

            {/* CTA Group: Tombol Biru Tua Khas Healora dengan Lingkaran Panah Putih + Video Trigger */}
            <div className="flex flex-wrap items-center gap-3.5 sm:gap-4">
              {/* Primary CTA Button */}
              <a
                href="#layanan"
                className="group inline-flex items-center gap-3.5 pl-5 sm:pl-6 pr-2 sm:pr-2.5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold bg-[#003874] hover:bg-[#072e47] text-white shadow-md shadow-[#003874]/20 hover:shadow-lg hover:shadow-[#003874]/30 transition-all duration-200 active:scale-98 cursor-pointer"
              >
                <span>Mulai Layanan Sekarang</span>
                <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white text-[#003874] flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 shadow-xs">
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                </span>
              </a>

              {/* Secondary CTA: Video Modal Profil */}
              <button
                type="button"
                onClick={() => setVideoModalOpen(true)}
                className="group inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full bg-white/90 dark:bg-slate-900/90 hover:bg-white dark:hover:bg-slate-800 border border-slate-200 dark:border-white/15 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-medium transition-all active:scale-95 cursor-pointer shadow-xs"
              >
                <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[#003874] dark:text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Play className="w-3 h-3 fill-current ml-0.5" />
                </span>
                <span className="font-semibold text-[#003874] dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                  Tonton Profil
                </span>
              </button>
            </div>
          </div>

          {/* Baris Bawah: Info Slide & Slider Pagination Controls Minimalis */}
          <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-slate-200/80 dark:border-white/10">
            {/* Keterangan Slide yang Sedang Tampil */}
            <div className="flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-[#003874] dark:bg-teal-400" />
              <span className="font-semibold text-[#003874] dark:text-white">{HERO_SLIDES[currentSlide].title}</span>
              <span className="text-slate-500 dark:text-slate-400 hidden sm:inline">— {HERO_SLIDES[currentSlide].alt}</span>
            </div>

            {/* Slider Pagination Controls Minimalis */}
            <div className="flex items-center gap-1.5 bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-white/15 backdrop-blur-md px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-xs transition-colors">
              <button
                type="button"
                onClick={prevSlide}
                className="w-5 h-5 sm:w-6 sm:h-6 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:text-[#003874] dark:hover:text-white transition-colors cursor-pointer"
                aria-label="Slide sebelumnya"
                title="Slide sebelumnya"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center gap-1.5 px-1">
                {HERO_SLIDES.map((slide, idx) => (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                      idx === currentSlide
                        ? "w-4 sm:w-5 bg-[#003874] dark:bg-white"
                        : "w-1.5 bg-slate-300 hover:bg-slate-400 dark:bg-slate-700 dark:hover:bg-slate-600"
                    }`}
                    aria-label={`Pindah ke slide ${idx + 1}: ${slide.title}`}
                    title={slide.title}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={nextSlide}
                className="w-5 h-5 sm:w-6 sm:h-6 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:text-[#003874] dark:hover:text-white transition-colors cursor-pointer"
                aria-label="Slide berikutnya"
                title="Slide berikutnya"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Video Modal Profil BBPOM */}
      <VideoModal
        isOpen={videoModalOpen}
        onClose={() => setVideoModalOpen(false)}
      />
    </>
  );
}


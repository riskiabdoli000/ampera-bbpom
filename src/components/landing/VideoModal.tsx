"use client";

import React, { useEffect } from "react";
import { X, Play, Building2, MapPin, Award } from "lucide-react";
import Image from "next/image";

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const INFO_ITEMS = [
  { icon: Building2, label: "Balai Besar Pengawas Obat & Makanan" },
  { icon: MapPin, label: "Jakabaring, Palembang, Sumsel" },
  { icon: Award, label: "Pelayanan Prima & Akreditasi ISO" },
];

export function VideoModal({ isOpen, onClose }: VideoModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="video-modal-title"
    >
      {/* Backdrop navy */}
      <div
        className="fixed inset-0 bg-navy-900/70 backdrop-blur-md"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dekorasi blob oranye */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed -bottom-24 -left-24 w-72 h-72 rounded-full bg-gradient-to-tr from-[#ff8a1f] to-[#f26a0f] opacity-80 blur-sm hidden sm:block"
      />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-[0_30px_80px_-20px_rgb(11_42_107/0.55)] border border-white/70 dark:border-slate-800 animate-fade-up">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-5 sm:px-7 pt-5 sm:pt-6 pb-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ff8a1f] to-[#f26a0f] text-white flex items-center justify-center shrink-0 shadow-cta">
              <Play className="w-4 h-4 fill-current ml-0.5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-ink-soft dark:text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-orange" />
                Info Terbaru
              </div>
              <h3
                id="video-modal-title"
                className="font-brand font-extrabold text-base sm:text-xl text-navy-900 dark:text-white leading-tight tracking-tight"
              >
                Profil Balai Besar POM di Palembang
              </h3>
              <p className="text-xs sm:text-sm text-ink-soft dark:text-slate-400 mt-0.5">
                Sumatera Selatan — Integritas, Profesional, Melayani
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-sky-200/60 dark:bg-slate-800 text-navy-900 dark:text-white hover:bg-orange-tint hover:text-brand-orange-600 flex items-center justify-center shrink-0 transition-all active:scale-95 cursor-pointer focus-visible:outline-2 focus-visible:outline-brand-orange"
            aria-label="Tutup video profil"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Area Video */}
        <div className="px-3 sm:px-5">
          <div className="relative aspect-video w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-navy-900 group">
            <Image
              src="/assets-landingpage/hero1.png"
              alt="Gedung Balai Besar POM di Palembang"
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-900/85 via-navy-900/25 to-transparent" />

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-5">
              <button
                type="button"
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-[#ff8a1f] to-[#f26a0f] text-white flex items-center justify-center shadow-cta ring-8 ring-white/30 cursor-pointer transition-transform duration-300 hover:scale-110 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                aria-label="Putar video"
              >
                <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-current ml-1" />
              </button>
            </div>

            <div className="absolute bottom-0 inset-x-0 p-4 sm:p-6 text-white">
              <span className="inline-block text-[10px] sm:text-xs uppercase tracking-wider font-bold text-orange-300 mb-1">
                Video Resmi Profil Institusi
              </span>
              <h4 className="font-brand font-bold text-sm sm:text-lg leading-snug max-w-xl">
                BBPOM di Palembang: Garda Terdepan Perlindungan Obat &amp; Makanan
              </h4>
              <p className="hidden sm:block text-xs sm:text-sm text-white/80 mt-1 max-w-xl line-clamp-2">
                Mengenal lebih dekat pengawasan laboratorium, layanan sertifikasi UMKM, dan pengawalan pangan sehat di Bumi Sriwijaya.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 px-3 sm:px-5 pt-4 pb-5 sm:pb-6">
          {INFO_ITEMS.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2.5 rounded-2xl bg-sky-50 dark:bg-slate-800/70 border border-sky-200/60 dark:border-slate-700 px-3.5 py-2.5 text-xs font-semibold text-navy-900 dark:text-slate-200"
            >
              <span className="w-8 h-8 rounded-lg bg-orange-tint dark:bg-orange-500/20 text-brand-orange-600 dark:text-orange-300 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4" />
              </span>
              <span className="leading-snug">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

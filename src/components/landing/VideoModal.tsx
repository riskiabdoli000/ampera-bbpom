"use client";

import React, { useEffect } from "react";
import { X, Play, Building2, MapPin, Award } from "lucide-react";
import Image from "next/image";

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-3xl bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200 text-white">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center">
              <Play className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white">Profil Balai Besar POM di Palembang</h3>
              <p className="text-xs text-slate-400">Sumatera Selatan — Integritas, Profesional, Melayani</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Tutup video profil"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player Area */}
        <div className="relative aspect-video w-full bg-slate-950 flex items-center justify-center overflow-hidden group">
          {/* Official BPOM Building as Background */}
          <Image
            src="/assets-landingpage/hero1.png"
            alt="Gedung Balai Besar POM di Palembang"
            fill
            className="object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          {/* YouTube Video Embed or Interactive Overlay */}
          <div className="relative z-10 text-center px-4 max-w-lg">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-teal-600/90 hover:bg-teal-500 text-white flex items-center justify-center shadow-xl shadow-teal-500/30 cursor-pointer transform hover:scale-110 transition-all duration-300 mb-4">
              <Play className="w-8 h-8 fill-current ml-1" />
            </div>
            <span className="inline-block text-xs uppercase tracking-wider font-semibold text-teal-400 mb-1">
              Video Resmi Profil Institusi
            </span>
            <h4 className="text-lg sm:text-xl font-bold text-white mb-2">
              BBPOM di Palembang: Garda Terdepan Perlindungan Obat & Makanan
            </h4>
            <p className="text-xs sm:text-sm text-slate-300 line-clamp-2">
              Mengenal lebih dekat dedikasi pengawasan laboratorium, layanan sertifikasi UMKM, dan pengawalan pangan sehat di Bumi Sriwijaya.
            </p>
          </div>
        </div>

        {/* Footer Details */}
        <div className="px-6 py-4 bg-slate-950/90 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-teal-400 shrink-0" />
            <span>Balai Besar Pengawas Obat & Makanan</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Jakabaring, Palembang, Sumsel</span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Standar Pelayanan Prima & Akreditasi ISO</span>
          </div>
        </div>
      </div>
    </div>
  );
}

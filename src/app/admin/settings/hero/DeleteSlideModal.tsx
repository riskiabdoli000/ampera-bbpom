"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  AlertTriangle,
  X,
  Trash2,
  Loader2,
  ShieldAlert,
} from "lucide-react";

export interface HeroSlideData {
  id: number;
  title: string;
  alt: string;
  imageUrl: string;
  imagePath: string | null;
  isActive: boolean;
  urutan: number;
}

interface DeleteSlideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  slide: HeroSlideData | null;
  totalSlides: number;
  isPending: boolean;
}

export function DeleteSlideModal({
  isOpen,
  onClose,
  onConfirm,
  slide,
  totalSlides,
  isPending,
}: DeleteSlideModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen || !slide || !mounted) return null;

  const isLastSlide = totalSlides <= 1;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Fullscreen Backdrop */}
      <div
        onClick={() => !isPending && onClose()}
        className="fixed inset-0 bg-slate-950/65 backdrop-blur-md transition-opacity animate-fade-in"
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 z-10 animate-fade-up my-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-50 dark:bg-red-500/15 text-red-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-navy-900 dark:text-white font-brand">
                Hapus Slide Hero
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Konfirmasi penghapusan slide dari banner
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-navy-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="mt-5 space-y-3.5">
          {isLastSlide ? (
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-xs text-amber-800 dark:text-amber-300 leading-relaxed space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Tidak Dapat Menghapus Slide</span>
              </p>
              <p className="text-[11px] text-amber-700 dark:text-amber-400">
                Minimal harus ada <strong>1 slide banner tersisa</strong> agar halaman beranda tetap dapat menampilkan banner utama secara normal.
              </p>
            </div>
          ) : (
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Apakah Anda yakin ingin menghapus slide berikut dari banner beranda?
            </p>
          )}

          {/* Slide Preview Card */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700">
            {slide.imageUrl && (
              <div className="relative w-16 h-12 rounded-xl overflow-hidden shrink-0 bg-slate-200 border border-slate-200 dark:border-slate-700">
                <Image
                  src={slide.imageUrl}
                  alt={slide.alt || slide.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="text-xs sm:text-sm font-bold text-navy-900 dark:text-white truncate">
                {slide.title}
              </div>
              <div className="text-[11px] text-slate-400 truncate mt-0.5">
                {slide.alt || "Tanpa teks alternatif"}
              </div>
            </div>
          </div>

          {!isLastSlide && (
            <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed">
              Tindakan ini tidak dapat dibatalkan. Berkas gambar akan dihapus dari server penyimpanan dan database.
            </p>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-5 mt-6 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            {isLastSlide ? "Mengerti" : "Batal"}
          </button>

          {!isLastSlide && (
            <button
              type="button"
              onClick={onConfirm}
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 px-5 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:-translate-y-0.5 disabled:opacity-50 cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Menghapus...</span>
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  <span>Hapus Permanen</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

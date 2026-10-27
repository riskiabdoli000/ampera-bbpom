"use client";

import React, { useEffect } from "react";
import {
  X,
  Download,
  ExternalLink,
  BookOpen,
  Sparkles,
} from "lucide-react";

interface EducationPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  badge?: string;
  pdfUrl?: string;
  filename?: string;
}

const DEFAULT_PDF_URL = "/documents/materi-edukasi-bbpom.pdf";
const DEFAULT_PDF_FILENAME = "Materi-Edukasi-BBPOM-Palembang.pdf";

export function EducationPdfModal({
  isOpen,
  onClose,
  title = "Edukasi Keamanan Obat, Bahan Alam & Pangan",
  badge = "Materi Edukasi BBPOM",
  pdfUrl = DEFAULT_PDF_URL,
  filename = DEFAULT_PDF_FILENAME,
}: EducationPdfModalProps) {
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
      className="fixed inset-0 z-[70] flex items-center justify-center p-2 sm:p-4 md:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pdf-modal-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-navy-900/80 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Decorative Blob */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed -bottom-28 -left-28 w-80 h-80 rounded-full bg-gradient-to-tr from-[#ff8a1f] to-[#f26a0f] opacity-40 blur-2xl hidden md:block"
      />

      {/* Main Modal Box */}
      <div className="relative z-10 w-full max-w-5xl h-[94vh] sm:h-[90vh] flex flex-col rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden animate-fade-up">
        {/* ========================================================= */}
        {/* HEADER MODAL                                              */}
        {/* ========================================================= */}
        <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shrink-0">
          {/* Logo & Judul */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-[#ff8a1f] to-[#f26a0f] text-white flex items-center justify-center shrink-0 shadow-cta">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-orange-100 dark:bg-orange-500/20 text-brand-orange-600 dark:text-orange-400">
                  <Sparkles className="w-3 h-3" />
                  {badge}
                </span>
                <span className="hidden sm:inline-block text-[11px] text-slate-400 dark:text-slate-500">•</span>
                <span className="hidden sm:inline-block text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  Dokumen Resmi
                </span>
              </div>
              <h3
                id="pdf-modal-title"
                className="font-brand font-extrabold text-sm sm:text-lg md:text-xl text-navy-900 dark:text-white leading-tight truncate mt-0.5"
              >
                {title}
              </h3>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Unduh PDF Button */}
            <a
              href={pdfUrl}
              download={filename}
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-[#ff8a1f] to-[#f26a0f] text-white text-xs sm:text-sm font-bold shadow-cta hover:opacity-95 transition-all active:scale-95 cursor-pointer"
              title="Unduh File PDF Lengkap"
            >
              <Download className="w-4 h-4 stroke-[2.2]" />
              <span className="hidden md:inline">Unduh PDF</span>
            </a>

            {/* Buka di Tab Baru Button */}
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-all cursor-pointer"
              title="Buka PDF di Tab Baru"
              aria-label="Buka PDF di tab baru"
            >
              <ExternalLink className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </a>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 flex items-center justify-center transition-all cursor-pointer"
              title="Tutup Modal"
              aria-label="Tutup pratinjau"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* AREA KONTEN / PDF VIEWER                                  */}
        {/* ========================================================= */}
        <div className="relative flex-1 w-full h-full bg-slate-100 dark:bg-slate-950/70 overflow-hidden">
          <iframe
            src={`${pdfUrl}#toolbar=1`}
            title={title}
            className="w-full h-full border-0"
          />
        </div>

        {/* ========================================================= */}
        {/* FOOTER BAR                                                */}
        {/* ========================================================= */}
        <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-2.5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-navy-900 dark:text-slate-200">
              Balai Besar POM di Palembang
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">Pusat Informasi &amp; Literasi Keamanan Pangan</span>
          </div>

          <div className="text-[11px] text-slate-400 dark:text-slate-500">
            Format: PDF Resmi
          </div>
        </div>
      </div>
    </div>
  );
}

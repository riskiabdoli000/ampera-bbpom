"use client";

import React, { useState, useEffect } from "react";
import {
  BookOpen,
  CheckCircle2,
  Lock,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  Sparkles,
  FileText,
  ExternalLink,
  Award,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { ModulMateri } from "./types";
import { EducationPdfModal } from "@/components/landing/EducationPdfModal";
import { GardaPdfSlideViewer } from "./GardaPdfSlideViewer";

interface MateriViewerProps {
  modules: ModulMateri[];
  currentModulIndex: number;
  currentSlideIndex: Record<number, number>; // modulId -> 0-based slideIndex
  maxSlideReached: Record<number, number>; // modulId -> highest slide reached
  modul1Completed: boolean;
  modul2Completed: boolean;
  modul3Completed: boolean;
  onUpdateSlide: (modulId: number, slideIdx: number) => void;
  onCompleteModul: (modulId: number) => void;
  onProceedToPostTest: () => void;
  onFastForwardAll?: () => void;
}

export function MateriViewer({
  modules,
  currentModulIndex,
  currentSlideIndex,
  maxSlideReached,
  modul1Completed,
  modul2Completed,
  modul3Completed,
  onUpdateSlide,
  onCompleteModul,
  onProceedToPostTest,
}: MateriViewerProps) {
  const [activeModulId, setActiveModulId] = useState<number>(
    modules && modules.length > 0 ? modules[currentModulIndex]?.id || modules[0]?.id || 1 : 1
  );
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [showTextSummary, setShowTextSummary] = useState(false);
  const [detectedPages, setDetectedPages] = useState<Record<number, number>>({});

  // Sinkronisasi activeModulId jika data modules baru dimuat dari database
  useEffect(() => {
    if (modules && modules.length > 0) {
      const exists = modules.some((m) => m.id === activeModulId);
      if (!exists) {
        setActiveModulId(modules[currentModulIndex]?.id || modules[0].id);
      }
    }
  }, [modules, currentModulIndex, activeModulId]);

  const activeModul =
    modules && modules.length > 0
      ? modules.find((m) => m.id === activeModulId) || modules[0]
      : {
          id: 1,
          nomor: 1,
          judul: "Modul Pembelajaran",
          ringkasan: "",
          durasi: "",
          jumlahSlide: 1,
          pdfUrl: "/documents/materi-edukasi-bbpom.pdf",
          slides: [],
        };

  const slideIdx =
    currentSlideIndex[activeModul.id] ??
    currentSlideIndex[activeModul.nomor] ??
    0;

  const currentSlide =
    activeModul.slides && activeModul.slides.length > 0
      ? activeModul.slides[slideIdx] || activeModul.slides[0]
      : {
          id: 1,
          judul: activeModul.judul,
          subjudul: "Materi Pembelajaran",
          poin: ["Pelajari materi ini dengan teliti."],
          tips: "",
          badge: `Modul ${activeModul.nomor} • Slide 1/1`,
        };

  const totalSlides =
    detectedPages[activeModul.id] ||
    detectedPages[activeModul.nomor] ||
    activeModul.slides?.length ||
    1;
  const isLastSlide = slideIdx >= totalSlides - 1;

  const activeModulIndex = modules && modules.length > 0 ? modules.findIndex((m) => m.id === activeModul.id) : 0;
  const hasNextModul = modules && modules.length > 0 && activeModulIndex < modules.length - 1;
  const nextModul = hasNextModul && modules ? modules[activeModulIndex + 1] : null;

  // Cek apakah modul tertentu sudah selesai (mengakomodir id acak dari DB dan nomor 1, 2, 3)
  const isModulDone = (modulId: number): boolean => {
    if (!modules || modules.length === 0) return false;
    const m = modules.find((mod) => mod.id === modulId);
    const nomor = m?.nomor ?? modulId;
    if (nomor === 1 && modul1Completed) return true;
    if (nomor === 2 && modul2Completed) return true;
    if (nomor === 3 && modul3Completed) return true;
    if (!m) return false;
    const total = detectedPages[modulId] || detectedPages[nomor] || m.slides?.length || 1;
    const reached = maxSlideReached[modulId] ?? maxSlideReached[nomor] ?? 0;
    return reached >= total - 1;
  };

  // Cek apakah modul tertentu terkunci (wajib menyelesaikan modul sebelumnya sampai slide terakhir)
  const isModulLocked = (modulId: number): boolean => {
    if (!modules || modules.length === 0) return false;
    const idx = modules.findIndex((m) => m.id === modulId);
    if (idx <= 0) return false;
    const prevModul = modules[idx - 1];
    return !isModulDone(prevModul.id);
  };

  const handleNextSlide = () => {
    if (slideIdx < totalSlides - 1) {
      const nextIdx = slideIdx + 1;
      onUpdateSlide(activeModul.id, nextIdx);

      // Jika mencapai slide terakhir, tandai modul selesai
      if (nextIdx === totalSlides - 1) {
        onCompleteModul(activeModul.id);
      }
    }
  };

  const handlePrevSlide = () => {
    const prevIdx = Math.max(0, slideIdx - 1);
    onUpdateSlide(activeModul.id, prevIdx);
  };

  // Keyboard navigation untuk slide - selalu terpanggil setiap render tanpa syarat
  useEffect(() => {
    if (!modules || modules.length === 0) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" && slideIdx < totalSlides - 1) {
        handleNextSlide();
      } else if (e.key === "ArrowLeft" && slideIdx > 0) {
        handlePrevSlide();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [slideIdx, totalSlides, activeModulId, modules]);

  const handleSelectModul = (modulId: number) => {
    if (isModulLocked(modulId)) return;
    setActiveModulId(modulId);
  };

  const allModulesCompleted = Boolean(modules && modules.length > 0 && modules.every((m) => isModulDone(m.id)));

  // Tampilan ketika data modul masih kosong (di-render setelah semua hook selesai dipanggil)
  if (!modules || modules.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-12 text-center max-w-xl mx-auto shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-4">
          <BookOpen className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-extrabold text-navy-900 dark:text-white">
          Modul Materi Belum Tersedia
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
          Daftar materi pembelajaran saat ini masih kosong karena belum diinput ke database. Anda dapat menambahkan modul materi baru (PDF / PPT) melalui panel admin Garda Ampera.
        </p>
        <div className="mt-6">
          <button
            type="button"
            onClick={onProceedToPostTest}
            className="px-5 py-2.5 rounded-xl bg-navy-900 hover:bg-blue-800 text-white font-bold text-xs cursor-pointer"
          >
            Lanjut ke Tahap Berikutnya
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner Modul Edukasi */}
      <div className="bg-[#0b2a6b] dark:bg-[#06173d] rounded-2xl p-6 sm:p-8 text-white relative shadow-md border border-blue-900/50">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-sky-200 text-xs font-semibold mb-2">
              <BookOpen className="w-3.5 h-3.5" />
              Langkah 3 dari 6 • Modul Pembelajaran Terpadu ({modules.length} Modul)
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Materi Edukasi BBPOM di Palembang
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-2xl leading-relaxed">
              Anda wajib membaca setiap slide satu per satu hingga slide terakhir untuk membuka materi
              berikutnya. Setelah menuntaskan seluruh materi, akses Post-Test akan otomatis terbuka.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowPdfModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs border border-white/30 shadow-sm transition-all cursor-pointer backdrop-blur-xs"
            >
              <FileText className="w-4 h-4 text-amber-300" />
              Lihat Dokumen Lengkap
            </button>
          </div>
        </div>
      </div>

      {/* Modul Tabs / Selector (3 Materi) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {modules.map((m) => {
          const locked = isModulLocked(m.id);
          const done = isModulDone(m.id);
          const isActive = m.id === activeModulId;

          return (
            <button
              key={m.id}
              type="button"
              disabled={locked}
              onClick={() => handleSelectModul(m.id)}
              className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between cursor-pointer ${
                locked
                  ? "bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400 cursor-not-allowed opacity-75"
                  : isActive
                  ? "bg-white dark:bg-slate-800 border-blue-600 dark:border-blue-500 shadow-md ring-2 ring-blue-100 dark:ring-blue-900/50"
                  : done
                  ? "bg-white dark:bg-slate-900 border-emerald-300 dark:border-emerald-900/70 hover:border-emerald-400"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300"
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    locked
                      ? "bg-slate-200 dark:bg-slate-700 text-slate-500"
                      : done
                      ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                      : isActive
                      ? "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600"
                  }`}
                >
                  Materi {m.nomor} • {m.durasi}
                </span>

                {locked ? (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                    <Lock className="w-3.5 h-3.5" /> Terkunci
                  </span>
                ) : done ? (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Selesai
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                    Aktif
                  </span>
                )}
              </div>

              <h4
                className={`text-sm font-bold line-clamp-2 ${
                  locked
                    ? "text-slate-400 dark:text-slate-500"
                    : isActive
                    ? "text-navy-900 dark:text-white"
                    : "text-slate-800 dark:text-slate-200"
                }`}
              >
                {m.judul}
              </h4>

              <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                <span>{m.jumlahSlide} Slide Pembelajaran</span>
                {locked && (
                  <span className="text-amber-600 dark:text-amber-400 text-[10px] font-medium">
                    Selesaikan Modul {m.nomor - 1} dulu
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* ========================================================= */}
      {/* 1. VISUAL PRESENTATION READER (DOKUMEN PDF ASLI PER SLIDE) */}
      {/* ========================================================= */}
      <div className="space-y-4">
        {activeModul.pdfUrl ? (
          <GardaPdfSlideViewer
            pdfUrl={activeModul.pdfUrl}
            currentPage={slideIdx + 1}
            totalPages={totalSlides}
            maxPageReached={(maxSlideReached[activeModul.id] ?? 0) + 1}
            title={`Materi ${activeModul.nomor}: ${activeModul.judul}`}
            onPdfLoaded={(pagesCount) =>
              setDetectedPages((prev) => ({ ...prev, [activeModul.id]: pagesCount }))
            }
            onPageChange={(newPage) => {
              const targetIdx = newPage - 1;
              onUpdateSlide(activeModul.id, targetIdx);
              if (targetIdx >= totalSlides - 1) {
                onCompleteModul(activeModul.id);
              }
            }}
          />
        ) : (
          /* Fallback jika berkas PDF tidak tersedia */
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
            <h4 className="text-base font-bold text-navy-900 dark:text-white">
              Pratinjau Berkas Belum Tersedia
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Berkas PDF untuk modul ini belum diunggah. Silakan hubungi admin untuk memperbarui berkas materi.
            </p>
          </div>
        )}

        {/* Primary Progression Bar (Next / Prev / Finish Module) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            type="button"
            disabled={slideIdx === 0}
            onClick={handlePrevSlide}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Slide Sebelumnya
          </button>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
            <span>Slide {slideIdx + 1} dari {totalSlides}</span>
            <span>•</span>
            <span className={isLastSlide ? "text-emerald-600 dark:text-emerald-400" : "text-blue-600 dark:text-blue-400"}>
              {isLastSlide ? "Slide Terakhir Tercapai" : "Wajib membaca sampai slide terakhir"}
            </span>
          </div>

          {/* Next or Finish Slide button */}
          {!isLastSlide ? (
            <button
              type="button"
              onClick={handleNextSlide}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all hover:translate-x-0.5 cursor-pointer"
            >
              Slide Selanjutnya ({slideIdx + 2}/{totalSlides})
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : hasNextModul && nextModul ? (
            <button
              type="button"
              onClick={() => {
                onCompleteModul(activeModul.id);
                setActiveModulId(nextModul.id);
                window.scrollTo({ top: 150, behavior: "smooth" });
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all hover:translate-x-0.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              Selesai Modul {activeModul.nomor} • Buka Modul {nextModul.nomor}
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                onCompleteModul(activeModul.id);
                onProceedToPostTest();
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all hover:scale-105 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              Selesai Seluruh Modul • Lanjut ke Post-Test
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Collapsible Text Summary (Opsional) */}
        {currentSlide.poin && currentSlide.poin.length > 0 && (
          <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowTextSummary((prev) => !prev)}
              className="w-full px-5 py-3.5 flex items-center justify-between text-left text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Intisari & Catatan Slide {slideIdx + 1} ({currentSlide.judul})
              </span>
              {showTextSummary ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {showTextSummary && (
              <div className="px-5 pb-5 pt-1 space-y-3 border-t border-slate-200/60 dark:border-slate-700/60 text-xs">
                {currentSlide.subjudul && (
                  <p className="font-semibold text-slate-600 dark:text-slate-400">
                    {currentSlide.subjudul}
                  </p>
                )}
                <div className="space-y-2">
                  {currentSlide.poin.map((point, pIdx) => (
                    <div
                      key={pIdx}
                      className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60"
                    >
                      <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        {pIdx + 1}
                      </span>
                      <p className="text-slate-700 dark:text-slate-200 leading-relaxed">
                        {point}
                      </p>
                    </div>
                  ))}
                </div>
                {currentSlide.tips && (
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-amber-900 dark:text-amber-200 text-xs font-medium">
                    {currentSlide.tips}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Completion Banner (Opens Post-Test) */}
      {allModulesCompleted && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-6 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-up">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <Award className="w-6 h-6 text-amber-200" />
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-bold">
                Semua Materi Edukasi Telah Dituntaskan!
              </h4>
              <p className="text-xs sm:text-sm text-emerald-100">
                Akses Post-Test sekarang sudah terbuka. Siapkan diri Anda untuk mencapai nilai
                minimal 70.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onProceedToPostTest}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white text-emerald-900 font-extrabold text-sm shadow-md hover:bg-emerald-50 transition-all hover:scale-105 cursor-pointer"
          >
            Mulai Ujian Post-Test
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* PDF Viewer Modal */}
      <EducationPdfModal
        isOpen={showPdfModal}
        onClose={() => setShowPdfModal(false)}
        title={activeModul.judul || "Materi Edukasi BBPOM Palembang"}
        badge={`Modul ${activeModul.nomor} Resmi BBPOM`}
        pdfUrl={activeModul.pdfUrl || "/documents/materi-edukasi-bbpom.pdf"}
        filename={activeModul.pdfUrl?.split("/").pop() || "Materi-Edukasi-BBPOM.pdf"}
      />
    </div>
  );
}

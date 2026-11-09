"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Download,
  ExternalLink,
  BookOpen,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  RefreshCw,
  AlertCircle,
  FileText,
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
  const containerRef = useRef<HTMLDivElement | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const renderTaskRef = useRef<any>(null);

  const [pdfDoc, setPdfDoc] = useState<any | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [rendering, setRendering] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState<number>(1.0);
  const [reloadKey, setReloadKey] = useState<number>(0);

  // Drag & Pan saat di-zoom
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ startX: number; startY: number; scrollLeft: number; scrollTop: number }>({
    startX: 0,
    startY: 0,
    scrollLeft: 0,
    scrollTop: 0,
  });

  // Handle ESC key & overflow body
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

  // Muat dokumen PDF via PDF.js saat modal dibuka
  useEffect(() => {
    if (!isOpen) return;

    let isCancelled = false;

    async function loadPdf() {
      if (!pdfUrl) {
        setError("URL berkas PDF tidak tersedia.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      setCurrentPage(1);
      setScale(1.0);

      try {
        // @ts-ignore
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

        const loadingTask = pdfjs.getDocument({
          url: pdfUrl,
        });

        const doc = await loadingTask.promise;

        if (isCancelled) return;

        setPdfDoc(doc);
        setTotalPages(doc.numPages || 1);
        setLoading(false);
      } catch (err: any) {
        console.warn("[EducationPdfModal] Gagal memuat PDF via PDF.js:", err);
        if (!isCancelled) {
          setError(err.message || "Gagal memproses berkas PDF.");
          setLoading(false);
        }
      }
    }

    loadPdf();

    return () => {
      isCancelled = true;
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {}
      }
    };
  }, [isOpen, pdfUrl, reloadKey]);

  // Render halaman aktif ke Canvas
  useEffect(() => {
    if (!isOpen || !pdfDoc) return;

    let isCancelled = false;

    async function renderPage() {
      setRendering(true);

      try {
        if (renderTaskRef.current) {
          try {
            renderTaskRef.current.cancel();
          } catch {}
        }

        const targetPageNum = Math.min(Math.max(1, currentPage), totalPages);
        const page = await pdfDoc.getPage(targetPageNum);
        if (isCancelled) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext("2d", { alpha: false });
        if (!context) return;

        // Auto-scale sesuai lebar container
        const containerWidth = containerRef.current?.clientWidth || 700;
        const unscaledViewport = page.getViewport({ scale: 1 });
        const horizontalPadding = containerWidth < 640 ? 16 : 32;
        const availableWidth = Math.max(180, containerWidth - horizontalPadding);
        const fitScale = availableWidth / unscaledViewport.width;
        const effectiveScale = Math.max(0.2, Math.min(3.5, fitScale * scale));

        const viewport = page.getViewport({ scale: effectiveScale });
        const outputScale = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;

        canvas.width = Math.floor(viewport.width * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);

        const displayWidth = Math.floor(viewport.width);
        canvas.style.width = scale <= 1.0 ? "100%" : `${displayWidth}px`;
        canvas.style.maxWidth = scale <= 1.0 ? `${displayWidth}px` : "none";
        canvas.style.height = "auto";
        canvas.style.aspectRatio = `${unscaledViewport.width} / ${unscaledViewport.height}`;

        const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null;

        const renderContext: any = {
          canvasContext: context,
          viewport: viewport,
        };
        if (transform) {
          renderContext.transform = transform;
        }

        const renderTask = page.render(renderContext);
        renderTaskRef.current = renderTask;

        await renderTask.promise;
      } catch (err: any) {
        if (err?.name !== "RenderingCancelledException") {
          console.warn("[EducationPdfModal] Gagal merender halaman:", err);
        }
      } finally {
        if (!isCancelled) {
          setRendering(false);
        }
      }
    }

    renderPage();

    return () => {
      isCancelled = true;
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {}
      }
    };
  }, [isOpen, pdfDoc, currentPage, scale, totalPages]);

  // Drag & Pan Handlers saat di-zoom
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1.0 || !scrollAreaRef.current) return;
    setIsDragging(true);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      scrollLeft: scrollAreaRef.current.scrollLeft,
      scrollTop: scrollAreaRef.current.scrollTop,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || scale <= 1.0 || !scrollAreaRef.current) return;
    e.preventDefault();
    const dx = e.clientX - dragStartRef.current.startX;
    const dy = e.clientY - dragStartRef.current.startY;
    scrollAreaRef.current.scrollLeft = dragStartRef.current.scrollLeft - dx;
    scrollAreaRef.current.scrollTop = dragStartRef.current.scrollTop - dy;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (scale <= 1.0 || !scrollAreaRef.current || e.touches.length !== 1) return;
    setIsDragging(true);
    const touch = e.touches[0];
    dragStartRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      scrollLeft: scrollAreaRef.current.scrollLeft,
      scrollTop: scrollAreaRef.current.scrollTop,
    };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || scale <= 1.0 || !scrollAreaRef.current || e.touches.length !== 1) return;
    const touch = e.touches[0];
    const dx = touch.clientX - dragStartRef.current.startX;
    const dy = touch.clientY - dragStartRef.current.startY;
    scrollAreaRef.current.scrollLeft = dragStartRef.current.scrollLeft - dx;
    scrollAreaRef.current.scrollTop = dragStartRef.current.scrollTop - dy;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(2.5, +(prev + 0.25).toFixed(2)));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(0.75, +(prev - 0.25).toFixed(2)));
  };

  const handleResetZoom = () => {
    setScale(1.0);
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollLeft = 0;
      scrollAreaRef.current.scrollTop = 0;
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-4 md:p-6"
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

      {/* Main Modal Box: di HP tinggi menyesuaikan isi (maks 82dvh), di desktop tinggi tetap 86vh */}
      <div
        ref={containerRef}
        className="relative z-10 w-full max-w-4xl h-auto max-h-[82dvh] sm:h-[86vh] sm:max-h-[860px] flex flex-col rounded-xl sm:rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden animate-fade-up"
      >
        {/* ========================================================= */}
        {/* HEADER MODAL                                              */}
        {/* ========================================================= */}
        <div className="flex items-center justify-between gap-2 sm:gap-3 px-3 sm:px-6 py-2 sm:py-3.5 border-b border-slate-100 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shrink-0">
          {/* Logo & Judul */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="hidden sm:flex w-10 h-10 rounded-xl bg-gradient-to-br from-[#ff8a1f] to-[#f26a0f] text-white items-center justify-center shrink-0 shadow-cta">
              <BookOpen className="w-5 h-5 stroke-[2]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-xs font-bold bg-orange-100 dark:bg-orange-500/20 text-brand-orange-600 dark:text-orange-400 max-w-full min-w-0">
                  <Sparkles className="w-2.5 h-2.5 shrink-0" />
                  <span className="truncate">{badge}</span>
                </span>
                <span className="hidden sm:inline-block text-[11px] text-slate-400 dark:text-slate-500">•</span>
                <span className="hidden sm:inline-block text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  Dokumen Resmi
                </span>
              </div>
              <h3
                id="pdf-modal-title"
                className="font-brand font-bold text-xs sm:text-base text-navy-900 dark:text-white leading-tight truncate mt-0.5"
                title={title}
              >
                {title}
              </h3>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Unduh PDF Button */}
            <a
              href={pdfUrl}
              download={filename}
              className="inline-flex items-center gap-1 px-2 sm:px-3.5 py-1.5 sm:py-2 h-7 sm:h-auto rounded-lg sm:rounded-xl bg-gradient-to-r from-[#ff8a1f] to-[#f26a0f] text-white text-xs sm:text-sm font-bold shadow-cta hover:opacity-95 transition-all active:scale-95 cursor-pointer"
              title="Unduh File PDF Lengkap"
            >
              <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.2]" />
              <span className="hidden sm:inline">Unduh</span>
            </a>

            {/* Buka di Tab Baru Button */}
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-all cursor-pointer"
              title="Buka PDF di Tab Baru"
              aria-label="Buka PDF di tab baru"
            >
              <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </a>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 flex items-center justify-center transition-all cursor-pointer"
              title="Tutup Modal"
              aria-label="Tutup pratinjau"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* TOOLBAR CONTROLS (NAVIGASI & ZOOM)                        */}
        {/* ========================================================= */}
        <div className="flex items-center justify-between px-2.5 sm:px-6 py-1 sm:py-2 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 text-xs shrink-0 select-none">
          {/* Navigasi Halaman */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            <button
              type="button"
              disabled={currentPage <= 1 || loading || Boolean(error)}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1 sm:p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
              title="Halaman Sebelumnya"
              aria-label="Halaman sebelumnya"
            >
              <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <span className="text-[11px] sm:text-xs font-semibold text-slate-700 dark:text-slate-300 px-1 sm:px-2 min-w-[70px] text-center">
              Hal {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages || loading || Boolean(error)}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1 sm:p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
              title="Halaman Selanjutnya"
              aria-label="Halaman selanjutnya"
            >
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            <button
              type="button"
              disabled={scale <= 0.75 || loading || Boolean(error)}
              onClick={handleZoomOut}
              className="p-1 sm:p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
              title="Perkecil (-)"
              aria-label="Perkecil tampilan"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] sm:text-xs font-bold text-slate-600 dark:text-slate-300 w-9 sm:w-11 text-center">
              {Math.round(scale * 100)}%
            </span>
            <button
              type="button"
              disabled={scale >= 2.5 || loading || Boolean(error)}
              onClick={handleZoomIn}
              className="p-1 sm:p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
              title="Perbesar (+)"
              aria-label="Perbesar tampilan"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            {scale !== 1.0 && (
              <button
                type="button"
                onClick={handleResetZoom}
                className="p-1 sm:p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-all"
                title="Reset Ukuran Normal"
                aria-label="Reset ukuran normal"
              >
                <RotateCcw className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* AREA KONTEN / CANVAS PDF VIEWER                            */}
        {/* ========================================================= */}
        <div
          ref={scrollAreaRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className={`relative flex-1 w-full min-h-[220px] sm:h-full bg-slate-100 dark:bg-slate-950/80 overflow-auto p-1.5 sm:p-4 flex ${
            scale > 1.0 ? "cursor-grab active:cursor-grabbing select-none" : "items-center justify-center"
          }`}
          style={{ touchAction: scale > 1.0 ? "none" : "auto" }}
        >
          {/* Loading Indicator */}
          {(loading || rendering) && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/70 dark:bg-slate-950/70 backdrop-blur-xs text-navy-900 dark:text-white space-y-2.5">
              <RefreshCw className="w-6 h-6 text-brand-orange animate-spin" />
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                {loading ? "Memuat dokumen PDF..." : "Merender halaman..."}
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && !loading && (
            <div className="max-w-md p-6 bg-white dark:bg-slate-900 rounded-2xl border border-rose-200 dark:border-rose-900 shadow-lg text-center space-y-3 m-auto">
              <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
              <h4 className="font-bold text-sm text-navy-900 dark:text-white">
                Gagal Menampilkan Berkas
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Berkas PDF tidak dapat dimuat secara langsung di peramban ini. Anda dapat mengunduh berkas atau membukanya di jendela baru.
              </p>
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReloadKey((k) => k + 1)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Coba Lagi</span>
                </button>
                <a
                  href={pdfUrl}
                  download={filename}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-[#ff8a1f] to-[#f26a0f] text-white text-xs font-bold shadow-cta cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh PDF</span>
                </a>
              </div>
            </div>
          )}

          {/* Actual Canvas PDF Rendering */}
          {!error && (
            <div
              className={`relative shadow-lg rounded-xl bg-white border border-slate-200 dark:border-slate-800 m-auto transition-shadow ${
                scale > 1.0
                  ? "w-max max-w-none"
                  : "max-w-full overflow-hidden inline-flex items-center justify-center"
              }`}
            >
              <canvas
                ref={canvasRef}
                className="block h-auto object-contain pointer-events-none"
              />
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* FOOTER BAR                                                */}
        {/* ========================================================= */}
        <div className="hidden sm:flex items-center justify-between gap-2 px-3.5 sm:px-6 py-2 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2 truncate">
            <FileText className="w-3.5 h-3.5 text-brand-orange shrink-0" />
            <span className="font-semibold text-navy-900 dark:text-slate-200 truncate">
              BBPOM di Palembang
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline text-slate-400 truncate">
              Materi Edukasi &amp; Literasi Masyarakat
            </span>
          </div>

          <div className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500 shrink-0">
            PDF Resmi
          </div>
        </div>
      </div>
    </div>
  );
}

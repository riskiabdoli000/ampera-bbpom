"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  FileText,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  Download,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  Eye,
  CheckCircle2,
} from "lucide-react";

interface GardaPdfSlideViewerProps {
  pdfUrl: string;
  currentPage: number; // 1-indexed
  totalPages: number;
  maxPageReached: number; // 1-indexed
  onPageChange: (newPage: number) => void;
  title?: string;
  onPdfLoaded?: (detectedTotalPages: number) => void;
}

export function GardaPdfSlideViewer({
  pdfUrl,
  currentPage,
  totalPages,
  maxPageReached,
  onPageChange,
  title,
  onPdfLoaded,
}: GardaPdfSlideViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const renderTaskRef = useRef<any>(null);

  const [pdfDoc, setPdfDoc] = useState<any | null>(null);
  const [actualTotalPages, setActualTotalPages] = useState<number>(totalPages || 1);
  const [loading, setLoading] = useState<boolean>(true);
  const [rendering, setRendering] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState<number>(1.25);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [fallbackToIframe, setFallbackToIframe] = useState<boolean>(false);

  // 1. Inisialisasi & Muat Berkas PDF menggunakan PDF.js
  useEffect(() => {
    let isCancelled = false;

    async function loadPdf() {
      if (!pdfUrl) {
        setError("URL berkas PDF tidak tersedia.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Dynamic import PDF.js untuk browser environment
        // @ts-ignore
        const pdfjs = await import("pdfjs-dist");

        // Konfigurasi worker lokal dari public directory
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

        const loadingTask = pdfjs.getDocument({
          url: pdfUrl,
          cMapUrl: "/cmaps/",
          cMapPacked: true,
        });

        const doc = await loadingTask.promise;

        if (isCancelled) return;

        setPdfDoc(doc);
        const pagesCount = doc.numPages;
        setActualTotalPages(pagesCount);

        if (onPdfLoaded && pagesCount > 0) {
          onPdfLoaded(pagesCount);
        }

        setLoading(false);
      } catch (err: any) {
        console.warn("Gagal memuat PDF via canvas, mengaktifkan mode iframe fallback:", err);
        if (!isCancelled) {
          setError(err.message || "Gagal memproses dokumen PDF.");
          setLoading(false);
          setFallbackToIframe(true);
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
  }, [pdfUrl]);

  // 2. Render Halaman Aktif ke HTML5 Canvas
  useEffect(() => {
    let isCancelled = false;

    async function renderPage() {
      if (!pdfDoc || fallbackToIframe) return;

      const targetPageNum = Math.min(Math.max(1, currentPage), actualTotalPages);
      setRendering(true);

      try {
        if (renderTaskRef.current) {
          try {
            renderTaskRef.current.cancel();
          } catch {}
        }

        const page = await pdfDoc.getPage(targetPageNum);
        if (isCancelled) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext("2d", { alpha: false });
        if (!context) return;

        // Auto-scale sesuai lebar container pada tampilan layar kecil
        const containerWidth = containerRef.current?.clientWidth || 800;
        const unscaledViewport = page.getViewport({ scale: 1 });
        const fitScale = (containerWidth - 32) / unscaledViewport.width;
        const effectiveScale = Math.max(0.6, Math.min(2.5, fitScale * scale));

        const viewport = page.getViewport({ scale: effectiveScale });

        // High DPI Canvas support (Retina/Mobile display)
        const outputScale = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
        canvas.width = Math.floor(viewport.width * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

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
          console.warn("Gagal merender halaman PDF:", err);
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
  }, [pdfDoc, currentPage, scale, actualTotalPages, fallbackToIframe]);

  // Handle Fullscreen Toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Zoom Handlers
  const handleZoomIn = () => setScale((prev) => Math.min(2.0, prev + 0.15));
  const handleZoomOut = () => setScale((prev) => Math.max(0.7, prev - 0.15));
  const handleResetZoom = () => setScale(1.25);

  const effectiveTotal = Math.max(actualTotalPages, totalPages);
  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= effectiveTotal;

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-700/80 transition-all ${
        isFullscreen ? "p-0 rounded-none h-screen w-screen" : "w-full"
      }`}
    >
      {/* ========================================================= */}
      {/* 1. TOP TOOLBAR DOKUMEN PDF                                */}
      {/* ========================================================= */}
      <div className="bg-slate-950/90 backdrop-blur-md px-4 sm:px-6 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-500/40 text-blue-400 flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                Dokumen PDF Materi
              </span>
              <span className="text-[10px] text-slate-500">•</span>
              <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Halaman {currentPage} dari {effectiveTotal}
              </span>
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-white truncate max-w-xs sm:max-w-md">
              {title || "Berkas Edukasi BBPOM di Palembang"}
            </h4>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Zoom In & Out */}
          <div className="flex items-center bg-slate-800/80 rounded-xl border border-slate-700/60 p-0.5">
            <button
              type="button"
              onClick={handleZoomOut}
              disabled={scale <= 0.75}
              className="p-1.5 text-slate-300 hover:text-white disabled:opacity-30 transition-colors cursor-pointer"
              title="Perkecil Tampilan"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-bold text-slate-300 px-1.5">
              {Math.round(scale * 100)}%
            </span>
            <button
              type="button"
              onClick={handleZoomIn}
              disabled={scale >= 2.0}
              className="p-1.5 text-slate-300 hover:text-white disabled:opacity-30 transition-colors cursor-pointer"
              title="Perbesar Tampilan"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleResetZoom}
              className="p-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer border-l border-slate-700/60"
              title="Reset Ukuran Normal"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          {/* Toggle Mode Viewer (Slide Canvas vs Embedded PDF Viewer) */}
          <button
            type="button"
            onClick={() => setFallbackToIframe((prev) => !prev)}
            className={`p-2 rounded-xl border transition-colors cursor-pointer text-xs font-semibold flex items-center gap-1.5 ${
              fallbackToIframe
                ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                : "bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700/60"
            }`}
            title={fallbackToIframe ? "Kembali ke Tampilan Slide Presentasi" : "Buka Tampilan Dokumen PDF Lengkap"}
          >
            <Eye className="w-4 h-4" />
            <span className="hidden xl:inline">
              {fallbackToIframe ? "Mode Slide" : "Mode PDF Lengkap"}
            </span>
          </button>

          {/* Toggle Fullscreen */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors cursor-pointer"
            title={isFullscreen ? "Keluar Layar Penuh" : "Tampilan Layar Penuh"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Unduh & Buka Tab Baru */}
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors cursor-pointer"
            title="Buka PDF di Tab Baru"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
          <a
            href={pdfUrl}
            download={pdfUrl.split("/").pop() || "Materi-BBPOM.pdf"}
            className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-colors cursor-pointer"
            title="Unduh Berkas PDF Asli"
          >
            <Download className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. PROGRESS STRIP PERSENTASE SLIDE                        */}
      {/* ========================================================= */}
      <div className="w-full bg-slate-800 h-1 relative overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 via-sky-400 to-emerald-400 transition-all duration-300"
          style={{ width: `${Math.round((currentPage / effectiveTotal) * 100)}%` }}
        />
      </div>

      {/* ========================================================= */}
      {/* 3. AREA PRESENTASI KANVAS PDF                             */}
      {/* ========================================================= */}
      <div
        className={`relative flex-1 flex items-center justify-center p-3 sm:p-6 overflow-auto bg-slate-950/80 min-h-[460px] sm:min-h-[580px] max-h-[80vh] ${
          isFullscreen ? "max-h-[calc(100vh-120px)]" : ""
        }`}
      >
        {/* Loading Spinner */}
        {(loading || rendering) && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/70 backdrop-blur-xs text-white space-y-3">
            <RefreshCw className="w-7 h-7 text-blue-400 animate-spin" />
            <p className="text-xs font-semibold text-slate-300 tracking-wide">
              {loading ? "Memuat berkas PDF asli..." : "Merender halaman slide..."}
            </p>
          </div>
        )}

        {/* Fallback to Iframe jika browser memblokir Canvas / WebWorker */}
        {fallbackToIframe ? (
          <div className="w-full h-full min-h-[550px] bg-white rounded-xl overflow-hidden">
            <iframe
              src={`${pdfUrl}#page=${currentPage}&toolbar=0&navpanes=0`}
              title={title}
              className="w-full h-full min-h-[550px] border-0"
            />
          </div>
        ) : (
          /* Actual PDF Page Canvas */
          <div className="relative flex items-center justify-center shadow-2xl rounded-xl overflow-hidden bg-white border border-slate-700/50">
            <canvas ref={canvasRef} className="block max-w-full h-auto" />
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 4. BOTTOM NAVIGATION STRIP (SLIDE PER SLIDE CONTROL)      */}
      {/* ========================================================= */}
      <div className="bg-slate-950 px-4 sm:px-6 py-3.5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
        {/* Navigasi Mundur (Slide Sebelumnya) */}
        <button
          type="button"
          disabled={isFirstPage}
          onClick={() => onPageChange(currentPage - 1)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold transition-all cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Halaman Sebelumnya</span>
        </button>

        {/* Halaman Dots Indicator */}
        <div className="flex items-center gap-1.5 max-w-xs overflow-x-auto py-1 px-2">
          {Array.from({ length: effectiveTotal }).map((_, idx) => {
            const pageNum = idx + 1;
            const isDotActive = pageNum === currentPage;
            const isDotPassed = pageNum <= maxPageReached;

            return (
              <button
                key={pageNum}
                type="button"
                onClick={() => {
                  if (pageNum <= maxPageReached) {
                    onPageChange(pageNum);
                  }
                }}
                disabled={!isDotPassed}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  isDotActive
                    ? "w-7 bg-blue-500 shadow-sm shadow-blue-500/50"
                    : isDotPassed
                    ? "w-2.5 bg-emerald-500/80 hover:bg-emerald-400"
                    : "w-2 bg-slate-700/60 cursor-not-allowed"
                }`}
                title={
                  isDotPassed
                    ? `Buka Halaman ${pageNum}`
                    : `Selesaikan halaman sebelumnya terlebih dahulu`
                }
              />
            );
          })}
        </div>

        {/* Navigasi Maju (Slide Selanjutnya) */}
        <button
          type="button"
          disabled={isLastPage}
          onClick={() => onPageChange(currentPage + 1)}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            isLastPage
              ? "bg-slate-800 text-slate-500 cursor-not-allowed opacity-50"
              : "bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30 hover:translate-x-0.5"
          }`}
        >
          <span>Halaman Selanjutnya</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

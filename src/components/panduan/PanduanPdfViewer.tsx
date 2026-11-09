"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy, RenderTask } from "pdfjs-dist";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  Maximize2,
  Minimize2,
  RefreshCw,
  RotateCcw,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

interface PanduanPdfViewerProps {
  pdfUrl: string;
  downloadName: string;
  title: string;
}

const MIN_SCALE = 0.5;
const MAX_SCALE = 2.5;
const MAX_BASE_WIDTH = 920;

/* -------------------------------------------------------------------------- */
/* Halaman PDF tunggal (dirender lazy saat mendekati viewport)                */
/* -------------------------------------------------------------------------- */
interface PdfPageProps {
  pdfDoc: PDFDocumentProxy;
  pageNumber: number;
  width: number;
  aspectRatio: number;
  scrollRoot: HTMLElement | null;
}

function PdfPage({ pdfDoc, pageNumber, width, aspectRatio, scrollRoot }: PdfPageProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const renderTaskRef = useRef<RenderTask | null>(null);
  const [isNear, setIsNear] = useState(false);
  const [rendered, setRendered] = useState(false);
  const [pageRatio, setPageRatio] = useState(aspectRatio);

  // Tandai halaman saat mendekati area tampilan
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsNear(true);
          observer.disconnect();
        }
      },
      { root: scrollRoot, rootMargin: "800px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [scrollRoot]);

  // Render (ulang) ke canvas saat terlihat atau lebar berubah
  useEffect(() => {
    if (!isNear || !pdfDoc || width <= 0) return;
    let cancelled = false;

    async function render() {
      try {
        if (renderTaskRef.current) {
          try {
            renderTaskRef.current.cancel();
          } catch {}
        }
        const page = await pdfDoc.getPage(pageNumber);
        if (cancelled) return;

        const baseViewport = page.getViewport({ scale: 1 });
        setPageRatio(baseViewport.height / baseViewport.width);

        const cssScale = width / baseViewport.width;
        const viewport = page.getViewport({ scale: cssScale });
        const outputScale = Math.min(window.devicePixelRatio || 1, 2);

        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = Math.floor(viewport.width * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

        const task = page.render({
          canvas,
          viewport,
          transform: outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : undefined,
        });
        renderTaskRef.current = task;
        await task.promise;
        if (!cancelled) setRendered(true);
      } catch (err: unknown) {
        if ((err as { name?: string } | null)?.name !== "RenderingCancelledException") {
          console.warn(`[PanduanPdfViewer] Gagal merender halaman ${pageNumber}:`, err);
        }
      }
    }

    render();
    return () => {
      cancelled = true;
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {}
      }
    };
  }, [isNear, pdfDoc, pageNumber, width]);

  return (
    <div
      ref={wrapperRef}
      data-page={pageNumber}
      className="relative mx-auto bg-white rounded-lg shadow-[0_10px_30px_-12px_rgb(11_42_107/0.35)] border border-slate-200 dark:border-slate-700 overflow-hidden"
      style={{ width, height: Math.floor(width * pageRatio) }}
    >
      {!rendered && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-50 text-slate-400">
          <RefreshCw className="w-5 h-5 animate-spin text-brand-orange" />
          <span className="text-[11px] font-semibold">Halaman {pageNumber}</span>
        </div>
      )}
      <canvas ref={canvasRef} className="block" aria-label={`Halaman ${pageNumber}`} />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Viewer utama                                                               */
/* -------------------------------------------------------------------------- */
export function PanduanPdfViewer({ pdfUrl, downloadName, title }: PanduanPdfViewerProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [scrollEl, setScrollEl] = useState<HTMLDivElement | null>(null);

  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [aspectRatio, setAspectRatio] = useState(1.414);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [scale, setScale] = useState(1);
  const [containerWidth, setContainerWidth] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Muat dokumen PDF
  useEffect(() => {
    let cancelled = false;
    let loadedDoc: PDFDocumentProxy | null = null;

    async function load() {
      setLoading(true);
      setError(null);
      setPdfDoc(null);
      setNumPages(0);
      setCurrentPage(1);

      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
        const doc = await pdfjs.getDocument({ url: pdfUrl }).promise;
        loadedDoc = doc;
        if (cancelled) {
          doc.destroy?.();
          return;
        }
        const firstPage = await doc.getPage(1);
        const vp = firstPage.getViewport({ scale: 1 });
        if (cancelled) return;

        setAspectRatio(vp.height / vp.width);
        setPdfDoc(doc);
        setNumPages(doc.numPages || 1);
        setLoading(false);
      } catch (err: unknown) {
        console.warn("[PanduanPdfViewer] Gagal memuat PDF:", err);
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Gagal memuat berkas PDF.");
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
      loadedDoc?.destroy?.();
    };
  }, [pdfUrl, reloadKey]);

  // Pantau lebar container untuk auto-fit
  useEffect(() => {
    if (!scrollEl) return;
    const update = () => setContainerWidth(scrollEl.clientWidth);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(scrollEl);
    return () => observer.disconnect();
  }, [scrollEl]);

  // Pantau status fullscreen
  useEffect(() => {
    const onChange = () => setIsFullscreen(document.fullscreenElement === rootRef.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  // Deteksi halaman aktif berdasarkan posisi scroll
  const handleScroll = useCallback(() => {
    if (!scrollEl) return;
    const pages = scrollEl.querySelectorAll<HTMLElement>("[data-page]");
    const anchor = scrollEl.scrollTop + scrollEl.clientHeight * 0.35;
    let active = 1;
    pages.forEach((el) => {
      if (el.offsetTop <= anchor) active = Number(el.dataset.page);
    });
    setCurrentPage(active);
  }, [scrollEl]);

  const goToPage = (page: number) => {
    if (!scrollEl) return;
    const target = Math.min(Math.max(1, page), numPages || 1);
    const el = scrollEl.querySelector<HTMLElement>(`[data-page="${target}"]`);
    if (el) scrollEl.scrollTo({ top: el.offsetTop - 12, behavior: "smooth" });
  };

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await rootRef.current?.requestFullscreen();
      }
    } catch {
      // Fullscreen tidak didukung (mis. iOS Safari) — buka PDF di tab baru sebagai alternatif
      window.open(pdfUrl, "_blank", "noopener,noreferrer");
    }
  };

  const horizontalPadding = containerWidth < 640 ? 16 : 48;
  const baseWidth = Math.max(200, Math.min(MAX_BASE_WIDTH, containerWidth - horizontalPadding));
  const pageWidth = Math.floor(baseWidth * scale);

  const toolbarBtn =
    "inline-flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors";

  return (
    <div
      ref={rootRef}
      className={`flex flex-col overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-[0_24px_60px_-28px_rgb(11_42_107/0.35)] ${
        isFullscreen ? "h-screen w-screen rounded-none" : "rounded-2xl sm:rounded-3xl"
      }`}
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-5 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900 select-none">
        {/* Navigasi halaman */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            className={toolbarBtn}
            onClick={() => goToPage(currentPage - 1)}
            disabled={loading || !!error || currentPage <= 1}
            aria-label="Halaman sebelumnya"
            title="Halaman sebelumnya"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 min-w-[78px] text-center">
            {loading ? "Memuat..." : `Hal ${currentPage} / ${numPages}`}
          </span>
          <button
            type="button"
            className={toolbarBtn}
            onClick={() => goToPage(currentPage + 1)}
            disabled={loading || !!error || currentPage >= numPages}
            aria-label="Halaman selanjutnya"
            title="Halaman selanjutnya"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Zoom */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            className={toolbarBtn}
            onClick={() => setScale((s) => Math.max(MIN_SCALE, +(s - 0.25).toFixed(2)))}
            disabled={loading || !!error || scale <= MIN_SCALE}
            aria-label="Perkecil tampilan"
            title="Perkecil"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-slate-600 dark:text-slate-300 w-11 text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            type="button"
            className={toolbarBtn}
            onClick={() => setScale((s) => Math.min(MAX_SCALE, +(s + 0.25).toFixed(2)))}
            disabled={loading || !!error || scale >= MAX_SCALE}
            aria-label="Perbesar tampilan"
            title="Perbesar"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          {scale !== 1 && (
            <button
              type="button"
              className={toolbarBtn}
              onClick={() => setScale(1)}
              aria-label="Reset ukuran"
              title="Reset ukuran"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Aksi */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            className={toolbarBtn}
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? "Keluar layar penuh" : "Layar penuh"}
            title={isFullscreen ? "Keluar layar penuh" : "Layar penuh"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={toolbarBtn}
            aria-label="Buka PDF di tab baru"
            title="Buka di tab baru"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
          <a
            href={pdfUrl}
            download={downloadName}
            className="inline-flex items-center gap-1.5 h-8 sm:h-9 px-3 sm:px-4 rounded-lg bg-gradient-to-r from-[#ff8a1f] to-[#f26a0f] text-white text-xs sm:text-sm font-bold shadow-cta hover:opacity-95 active:scale-95 transition-all"
            title={`Unduh ${title}`}
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Unduh PDF</span>
          </a>
        </div>
      </div>

      {/* Area dokumen */}
      <div
        ref={setScrollEl}
        onScroll={handleScroll}
        className={`relative overflow-auto bg-slate-100 dark:bg-slate-950/80 ${
          isFullscreen ? "flex-1" : "h-[72dvh] sm:h-[78vh] min-h-[420px] max-h-[1100px]"
        }`}
      >
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-navy-900 dark:text-white">
            <RefreshCw className="w-7 h-7 text-brand-orange animate-spin" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Memuat dokumen panduan...</p>
          </div>
        )}

        {error && !loading && (
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="max-w-md p-6 bg-white dark:bg-slate-900 rounded-2xl border border-rose-200 dark:border-rose-900 shadow-lg text-center space-y-3">
              <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
              <h3 className="font-bold text-sm text-navy-900 dark:text-white">Gagal Menampilkan Dokumen</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Dokumen tidak dapat ditampilkan di peramban ini. Silakan coba lagi, unduh berkas, atau buka di tab baru.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setReloadKey((k) => k + 1)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Coba Lagi
                </button>
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-200"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Buka di Tab Baru
                </a>
                <a
                  href={pdfUrl}
                  download={downloadName}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-[#ff8a1f] to-[#f26a0f] text-white text-xs font-bold shadow-cta"
                >
                  <Download className="w-3.5 h-3.5" />
                  Unduh PDF
                </a>
              </div>
            </div>
          </div>
        )}

        {pdfDoc && !error && containerWidth > 0 && (
          <div className="flex flex-col gap-4 sm:gap-6 py-4 sm:py-6 px-2 sm:px-6 w-max min-w-full">
            {Array.from({ length: numPages }, (_, i) => (
              <PdfPage
                key={`${pdfUrl}-${i + 1}`}
                pdfDoc={pdfDoc}
                pageNumber={i + 1}
                width={pageWidth}
                aspectRatio={aspectRatio}
                scrollRoot={scrollEl}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


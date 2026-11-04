"use client";

/**
 * Helper untuk me-render Halaman 1 berkas PDF menjadi gambar thumbnail di sisi Client (Browser).
 * Berkas worker diambil dari /pdf.worker.min.mjs yang sudah disalin ke folder public.
 */
export async function renderFirstPagePdfToBlob(
  file: File,
  scale = 1.2
): Promise<{ blob: Blob; dataUrl: string; width: number; height: number }> {
  const arrayBuffer = await file.arrayBuffer();

  // Dynamic import agar tidak dieksekusi di Node.js / SSR
  const pdfjsLib = await import("pdfjs-dist");

  if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  }

  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
  });

  const pdf = await loadingTask.promise;
  const page = await pdf.getPage(1);
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Gagal menginisialisasi Canvas Context");
  }

  canvas.width = viewport.width;
  canvas.height = viewport.height;

  await page.render({
    canvasContext: context,
    viewport,
    canvas,
  }).promise;

  const dataUrl = canvas.toDataURL("image/webp", 0.85);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) resolve(b);
        else reject(new Error("Gagal mengonversi canvas ke Blob"));
      },
      "image/webp",
      0.85
    );
  });

  return {
    blob,
    dataUrl,
    width: viewport.width,
    height: viewport.height,
  };
}

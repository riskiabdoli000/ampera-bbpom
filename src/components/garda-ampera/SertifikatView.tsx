"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Download,
  Printer,
  CheckCircle2,
  Calendar,
  Building2,
  User,
  Award,
} from "lucide-react";
import { BiodataGarda } from "./types";
import { generateGardaCertificatePdf, printGardaCertificatePdf } from "./certificate-generator";

const CERT_BASE_WIDTH = 896;
const CERT_BASE_HEIGHT = 634; // Rasio A4 Landscape (896 / 1.414)

interface SertifikatViewProps {
  biodata: BiodataGarda;
  postTestScore: number;
  nomorSertifikat: string;
  tanggalLulus: string;
  onResetAll?: () => void;
}

export function SertifikatView({
  biodata,
  postTestScore,
  nomorSertifikat,
  tanggalLulus,
}: SertifikatViewProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [scale, setScale] = useState(1);
  const previewWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = previewWrapperRef.current;
    if (!el) return;

    const updateScale = () => {
      const availableWidth = el.clientWidth;
      if (availableWidth > 0) {
        setScale(Math.min(1, availableWidth / CERT_BASE_WIDTH));
      }
    };

    updateScale();

    const observer = new ResizeObserver(() => {
      updateScale();
    });
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  const handleDownloadPdf = async () => {
    try {
      setIsDownloading(true);
      await generateGardaCertificatePdf({
        biodata,
        postTestScore,
        nomorSertifikat,
        tanggalLulus,
      });
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error("Gagal men-generate PDF sertifikat:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = async () => {
    try {
      setIsPrinting(true);
      await printGardaCertificatePdf({
        biodata,
        postTestScore,
        nomorSertifikat,
        tanggalLulus,
      });
    } catch (err) {
      console.error("Gagal mencetak sertifikat:", err);
      window.print();
    } finally {
      setIsPrinting(false);
    }
  };

  const predikat =
    postTestScore >= 90
      ? "Sangat Baik (Dengan Pujian)"
      : postTestScore >= 80
      ? "Sangat Baik"
      : "Baik (Lulus)";

  return (
    <div className="space-y-6">
      {/* Top Banner Kelulusan */}
      <div className="no-print bg-gradient-to-r from-emerald-600 via-teal-700 to-navy-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold mb-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" />
              Langkah 6 dari 6 • Sertifikat Resmi Siap Diunduh
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Selamat, {biodata.nama}!
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 mt-1 max-w-xl">
              Anda telah menyelesaikan seluruh tahapan modul inovasi Garda Ampera dan dinyatakan{" "}
              <strong>LULUS</strong> dengan perolehan nilai Post-Test <strong>{postTestScore}/100</strong>.
            </p>
          </div>

          {/* Action Download & Cetak */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-navy-950 font-extrabold text-sm shadow-lg shadow-amber-400/20 transition-all hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {isDownloading ? "Memproses PDF..." : "Unduh Sertifikat (PDF)"}
            </button>

            {/* <button
              type="button"
              onClick={handlePrint}
              disabled={isPrinting || isDownloading}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 transition-all cursor-pointer disabled:opacity-50"
              title="Cetak Lembar E-Sertifikat Resmi"
            >
              <Printer className="w-4 h-4" />
              {isPrinting ? "Menyiapkan Cetak..." : "Cetak"}
            </button> */}
          </div>
        </div>

        {downloadSuccess && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/30 border border-emerald-300/40 text-xs text-white flex items-center gap-2 animate-fade-up">
            <CheckCircle2 className="w-4 h-4 text-amber-300 shrink-0" />
            Berkas E-Sertifikat resmi berhasil diunduh ke perangkat Anda!
          </div>
        )}
      </div>

      {/* Visual Live Certificate Preview (Exact Standard Design A4 Landscape) */}
      <div className="bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-6 shadow-inner print:!bg-transparent print:!border-none print:!p-0 print:!shadow-none">
        <div className="no-print flex items-center justify-between mb-3 px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Pratinjau E-Sertifikat Resmi Garda Ampera
          </span>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Standar BBPOM di Palembang • A4 Landscape
          </span>
        </div>

        {/* Responsive Scaled Wrapper */}
        <div
          ref={previewWrapperRef}
          className="w-full max-w-4xl mx-auto overflow-hidden rounded-xl sm:rounded-2xl shadow-2xl print:!h-auto print:!overflow-visible print:!shadow-none print:!rounded-none print:!max-w-none"
          style={{ height: `${Math.round(CERT_BASE_HEIGHT * scale)}px` }}
        >
          {/* Certificate Sheet (Fixed Desktop Canvas 896x634 Scaled Proportionally) */}
          <div
            className="certificate-print-area relative bg-white border border-slate-300 rounded-2xl overflow-hidden select-none print:!transform-none print:!border-none print:!rounded-none"
            style={{
              width: `${CERT_BASE_WIDTH}px`,
              height: `${CERT_BASE_HEIGHT}px`,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }}
          >
            {/* Watermark Logo GARDA AMPERA in the background */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
              <img
                src="/sertifikat/assets/garda-ampera-logo.png"
                alt="Garda Ampera Watermark"
                className="w-7/12 object-contain opacity-[0.10] transform translate-y-3"
              />
            </div>

            {/* Wave Bottom Asset */}
            <img
              src="/sertifikat/assets/wave-bottom.jpg"
              alt="Wave Decoration"
              className="absolute bottom-0 left-0 w-full object-fill pointer-events-none z-0"
              style={{ height: "24%" }}
            />

            {/* Content Overlay */}
            <div className="relative z-10 w-full h-full flex flex-col justify-between py-8 px-14 text-center">
              {/* Header: Logo, Title, Nomor */}
              <div className="space-y-1">
                <div className="flex justify-center pt-1">
                  <img
                    src="/sertifikat/assets/logo-bpom.png"
                    alt="Logo Badan POM"
                    className="h-20 object-contain"
                  />
                </div>
                <h1 className="font-times text-4xl font-bold tracking-wide text-slate-900 uppercase pt-1">
                  SERTIFIKAT
                </h1>
                <p className="font-times text-sm font-normal text-slate-800">
                  Nomor :  {nomorSertifikat}
                </p>
              </div>

              {/* Body: Intro, Nama Peserta, Narasi Kelulusan */}
              <div className="space-y-2 my-auto">
                <p className="font-times text-base text-slate-700 font-normal">
                  Sertifikat ini menerangkan bahwa:
                </p>
                <h2 className="font-times text-5xl font-bold text-slate-900 tracking-normal py-1">
                  {biodata.nama || "Peserta Garda Ampera"}
                </h2>
                <p className="font-times text-[15px] font-bold text-slate-900 max-w-2xl mx-auto leading-tight">
                  Telah menyelesaikan modul Gerakan Antisipasi Risiko, Deteksi, dan Aksi pada inovasi GARDA AMPERA. Semoga partisipasi ini menjadi langkah nyata bersama dalam mewujudkan keamanan pangan dan pengawasan obat dan makanan yang lebih baik.
                </p>
              </div>

              {/* Footer / Signature Block */}
              <div className="space-y-0.5 mb-2">
                <p className="font-times text-sm text-slate-800">
                  Palembang, {tanggalLulus || "29 Oktober 2026"}
                </p>
                <p className="font-trebuchet text-sm text-slate-800">
                  Kepala Balai Besar Pengawas Obat dan Makanan
                </p>
                <p className="font-trebuchet text-sm text-slate-800">
                  di Palembang
                </p>

                {/* Signature + Stamp */}
                <div className="relative h-24 flex items-center justify-center my-0.5">
                  {/* Cap BBPOM Palembang */}
                  <img
                    src="/sertifikat/assets/cap-bpom.png"
                    alt="Cap BBPOM Palembang"
                    className="absolute h-32 object-contain transform -translate-x-20 -translate-y-2 opacity-95 pointer-events-none"
                  />
                  {/* TTE Bu Yani */}
                  <img
                    src="/sertifikat/assets/tte-bu-yani.png"
                    alt="TTE Bu Yani"
                    className="absolute h-28 object-contain transform translate-x-2 pointer-events-none"
                  />
                </div>

                {/* Pejabat: Yani Ardiyanti, SF, Apt.,M.Sc (Tanpa NIP) */}
                <p className="font-trebuchet text-base font-bold text-slate-900 pt-0.5">
                  Yani Ardiyanti, SF, Apt.,M.Sc
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Card Peserta & Hasil Kelulusan */}
      <div className="no-print bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Award className="w-4 h-4 text-emerald-600" />
          Rincian Data Kepesertaan & Status Kelulusan
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
            <span className="text-slate-400 block mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> Nama & NIK
            </span>
            <p className="font-bold text-slate-800 dark:text-slate-100">{biodata.nama || "-"}</p>
            <p className="font-mono text-slate-500 text-[11px]">{biodata.nik || "-"}</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
            <span className="text-slate-400 block mb-1 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" /> Instansi / Pekerjaan
            </span>
            <p className="font-bold text-slate-800 dark:text-slate-100">{biodata.instansi || "-"}</p>
            <p className="text-slate-500 text-[11px]">{biodata.pekerjaan || "-"}</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
            <span className="text-slate-400 block mb-1 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" /> Skor Ujian & Predikat
            </span>
            <p className="font-extrabold text-emerald-600 text-sm">{postTestScore} / 100</p>
            <p className="text-slate-500 text-[11px]">{predikat}</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
            <span className="text-slate-400 block mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> Waktu Penerbitan
            </span>
            <p className="font-bold text-slate-800 dark:text-slate-100">{tanggalLulus || "-"}</p>
            <p className="font-mono text-emerald-700 dark:text-emerald-400 text-[11px] font-semibold">Tersertifikasi Sah</p>
          </div>
        </div>
      </div>
    </div>
  );
}

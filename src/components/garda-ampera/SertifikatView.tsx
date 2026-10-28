"use client";

import React, { useState } from "react";
import {
  Award,
  Download,
  Printer,
  RotateCcw,
  CheckCircle2,
  Share2,
  Calendar,
  Building2,
  FileCheck,
  ShieldCheck,
  Sparkles,
  QrCode,
} from "lucide-react";
import { BiodataGarda } from "./types";
import { generateGardaCertificatePdf } from "./certificate-generator";

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
  onResetAll,
}: SertifikatViewProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

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

  const handlePrint = () => {
    window.print();
  };

  const predikat =
    postTestScore >= 90
      ? "SANGAT BAIK (DENGAN PUJIAN)"
      : postTestScore >= 80
      ? "SANGAT BAIK"
      : "BAIK (LULUS)";

  return (
    <div className="space-y-6">
      {/* Top Banner Kelulusan */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-navy-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
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
              Anda telah berhasil menyelesaikan seluruh tahapan program Garda Ampera dan
              dinyatakan <strong>LULUS</strong> dengan nilai Post-Test <strong>{postTestScore}/100</strong>.
            </p>
          </div>

          {/* Action Download Utama */}
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

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Cetak
            </button>
          </div>
        </div>

        {downloadSuccess && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/30 border border-emerald-300/40 text-xs text-white flex items-center gap-2 animate-fade-up">
            <CheckCircle2 className="w-4 h-4 text-amber-300 shrink-0" />
            File sertifikat resmi telah berhasil diunduh ke perangkat Anda!
          </div>
        )}
      </div>

      {/* Visual Live Certificate Preview Card (Landscape Certificate Design) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden p-4 sm:p-8">
        <div className="text-center mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Pratinjau Sertifikat Resmi (A4 Landscape)
          </span>
        </div>

        {/* Certificate Frame */}
        <div className="relative bg-[#fefefc] dark:bg-slate-950 border-4 border-navy-900 dark:border-blue-900 p-6 sm:p-10 rounded-xl shadow-inner max-w-4xl mx-auto overflow-hidden text-slate-800 dark:text-slate-100">
          {/* Inner Gold Border */}
          <div className="border border-amber-500/80 p-6 sm:p-8 relative rounded-lg">
            {/* Corner Embellishments */}
            <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-amber-600" />
            <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-amber-600" />
            <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-amber-600" />
            <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-amber-600" />

            {/* Kop Sertifikat */}
            <div className="text-center space-y-1 mb-6">
              <p className="text-xs sm:text-sm font-extrabold tracking-wider text-navy-900 dark:text-blue-400 uppercase">
                Badan Pengawas Obat dan Makanan Republik Indonesia
              </p>
              <h3 className="text-sm sm:text-base font-bold text-navy-950 dark:text-white uppercase tracking-wide">
                Balai Besar Pengawas Obat dan Makanan di Palembang
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Jl. Pangeran Ratu, Jakabaring, Palembang • Portal Layanan AMPERA
              </p>
              <div className="w-48 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto mt-2" />
            </div>

            {/* Title */}
            <div className="text-center space-y-1 my-6">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-black tracking-wide text-navy-900 dark:text-blue-200 uppercase">
                Sertifikat Kelulusan
              </h2>
              <p className="text-xs sm:text-sm font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">
                Program Garda Ampera (Gerakan Sadar Obat & Makanan Aman)
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                Nomor: {nomorSertifikat}
              </p>
            </div>

            {/* Recipient */}
            <div className="text-center space-y-2 my-6">
              <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                Diberikan dengan penuh kehormatan kepada:
              </p>
              <h1 className="text-xl sm:text-3xl font-extrabold text-navy-950 dark:text-white underline decoration-amber-500 underline-offset-8">
                {biodata.nama || "Peserta Garda Ampera"}
              </h1>
              <p className="text-xs text-slate-600 dark:text-slate-300 pt-2 font-medium">
                NIK: <span className="font-mono">{biodata.nik || "-"}</span> • Instansi:{" "}
                <strong>{biodata.instansi || "Masyarakat Umum"}</strong>
              </p>
            </div>

            {/* Narrative & Predicate */}
            <div className="text-center max-w-2xl mx-auto my-6 space-y-2">
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Telah mengikuti Pre-Test, menyelesaikan 3 Modul Materi Edukasi Pangan Aman,
                Regulasi Obat, dan Kosmetik Sehat, serta dinyatakan <strong>LULUS</strong> pada Ujian
                Post-Test dengan Nilai <strong>{postTestScore}/100</strong>.
              </p>
              <div className="inline-block px-4 py-1 rounded-full bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800 text-navy-900 dark:text-blue-300 text-xs font-bold uppercase tracking-wider">
                Predikat: {predikat}
              </div>
            </div>

            {/* Footer / Signature Block */}
            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-200 dark:border-slate-800 mt-8 items-end">
              {/* QR Code Verification */}
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center p-1">
                  <QrCode className="w-8 h-8 text-navy-900 dark:text-white" />
                  <span className="text-[8px] font-mono font-bold text-slate-500">VERIFIED</span>
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 space-y-0.5">
                  <p className="font-bold text-slate-700 dark:text-slate-300">
                    Verifikasi Dokumen Digital
                  </p>
                  <p>Kode: {nomorSertifikat.split("/").pop()}</p>
                  <p>BBPOM di Palembang</p>
                </div>
              </div>

              {/* Signature */}
              <div className="text-center space-y-1">
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Palembang, {tanggalLulus}
                </p>
                <p className="text-xs font-bold text-navy-900 dark:text-slate-200">
                  Kepala Balai Besar POM di Palembang
                </p>
                <div className="py-2">
                  <span className="inline-block px-3 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-700 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                    ✓ Ditandatangani Secara Elektronik
                  </span>
                </div>
                <p className="text-xs font-extrabold text-navy-950 dark:text-white underline">
                  Drs. Zulkifli, Apt.
                </p>
                <p className="text-[10px] text-slate-500">NIP. 19680415 199403 1 002</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviewer / Reset Options */}
      {onResetAll && (
        <div className="text-center pt-4">
          <button
            type="button"
            onClick={onResetAll}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-navy-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Uji Coba Ulang Seluruh Alur (Reset Data Demo)
          </button>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Award,
  Printer,
  Download,
  ArrowLeft,
  CheckCircle2,
  Share2,
  ShieldCheck,
} from "lucide-react";
import { getSesiCindo } from "@/data/cindo/cindoStorage";
import { SesiCindo } from "@/data/cindo/cindoTypes";

export default function CindoSertifikatPage() {
  const router = useRouter();
  const [sesi, setSesi] = useState<SesiCindo | null>(null);

  useEffect(() => {
    const s = getSesiCindo();
    if (!s.peserta || !s.postTest?.isPassed) {
      router.push("/cindo/tes/identitas");
      return;
    }
    setSesi(s);
  }, [router]);

  if (!sesi || !sesi.postTest?.isPassed) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto" />
          <p className="mt-3 text-xs text-slate-500">Memeriksa status sertifikat...</p>
        </div>
      </div>
    );
  }

  const cert = sesi.certificate;
  const peserta = sesi.peserta!;
  const skor = sesi.postTest.skor;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Action Header (Hidden during print) */}
      <div className="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div>
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            <CheckCircle2 className="h-3.5 w-3.5" /> Terverifikasi Resmi
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
            E-Sertifikat Kelulusan Cindo
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Simpan atau cetak sertifikat kelulusan resmi Anda sebagai bukti kompetensi.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/cindo"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-emerald-700 active:scale-95"
          >
            <Printer className="h-4 w-4" />
            <span>Cetak / Unduh PDF</span>
          </button>
        </div>
      </div>

      {/* Official Certificate Paper Container */}
      <div className="relative overflow-hidden rounded-3xl border-8 border-double border-amber-600/40 bg-[#fffdf9] p-8 sm:p-14 text-slate-900 shadow-2xl print:border-4 print:p-8 print:shadow-none print:m-0 print:w-full print:rounded-none">
        {/* Background Watermark Pattern */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.035]">
          <Image
            src="/assets-landingpage/logo-bpom.png"
            alt="Watermark BPOM"
            width={600}
            height={600}
            className="object-contain"
          />
        </div>

        {/* Certificate Inner Border */}
        <div className="relative z-10 border-2 border-amber-500/30 p-6 sm:p-10 rounded-2xl flex flex-col items-center text-center space-y-6">
          {/* Header Logos */}
          <div className="flex items-center justify-center gap-6">
            <div className="relative h-16 w-16 sm:h-20 sm:w-20">
              <Image
                src="/assets-landingpage/logo-bpom.png"
                alt="Logo BPOM"
                fill
                className="object-contain"
              />
            </div>
            <div className="text-left border-l-2 border-slate-200 pl-5">
              <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-[#0b2a6b]">
                BADAN PENGAWAS OBAT DAN MAKANAN
              </h2>
              <h3 className="text-sm sm:text-base font-black text-slate-800">
                BALAI BESAR POM DI PALEMBANG
              </h3>
              <p className="text-[10px] sm:text-xs text-slate-500">
                Portal Layanan Publik & Inovasi Ampera BBPOM Palembang
              </p>
            </div>
          </div>

          <div className="w-24 border-b-2 border-amber-500/60 my-1" />

          {/* Certificate Title */}
          <div className="space-y-1">
            <div className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-amber-700">
              SERTIFIKAT KELULUSAN E-LEARNING
            </div>
            <h1 className="text-2xl sm:text-4xl font-serif font-black tracking-tight text-[#0b2a6b]">
              CINDO BBPOM PALEMBANG
            </h1>
            <p className="text-[11px] sm:text-xs font-mono font-medium text-slate-500">
              Nomor Registrasi: {cert?.nomorSertifikat || "CINDO/BBPOM/202610/001"}
            </p>
          </div>

          {/* Recipient */}
          <div className="w-full space-y-2 pt-2">
            <p className="text-xs sm:text-sm text-slate-600 italic">
              Dengan bangga diberikan kepada:
            </p>
            <div className="text-2xl sm:text-4xl font-serif font-extrabold text-slate-900 border-b border-slate-300 pb-2 max-w-xl mx-auto uppercase tracking-wide">
              {peserta.nama}
            </div>
            <p className="text-xs sm:text-sm font-mono text-slate-600">
              NIK: {peserta.nik} | Instansi: {peserta.instansi || "Masyarakat Umum"}
            </p>
          </div>

          {/* Description */}
          <p className="max-w-2xl text-xs sm:text-sm text-slate-700 leading-relaxed">
            Atas dedikasi, partisipasi aktif, dan keberhasilan menyelesaikan seluruh tahapan asesmen mandiri, pembelajaran materi komprehensif, serta evaluasi akhir dalam program:
          </p>

          <div className="rounded-xl bg-blue-50/80 px-6 py-2.5 border border-blue-200">
            <span className="text-xs sm:text-base font-bold text-[#0b2a6b]">
              &ldquo;Edukasi Keamanan Obat, Pangan, Kosmetik, & Inovasi Ampera BBPOM&rdquo;
            </span>
          </div>

          {/* Score Badge */}
          <div className="flex items-center gap-4 text-xs sm:text-sm">
            <span className="font-semibold text-slate-600">Nilai Kelulusan:</span>
            <span className="rounded-full bg-emerald-100 px-3 py-1 font-extrabold text-emerald-800 border border-emerald-300">
              {skor} / 100 (Predikat: {skor >= 90 ? "Sangat Memuaskan" : "Memuaskan"})
            </span>
          </div>

          {/* Signatures & Verification Row */}
          <div className="w-full pt-8 flex flex-col sm:flex-row items-center justify-between gap-6 sm:px-8 border-t border-slate-200/80">
            {/* Left: Verification QR Code Mockup */}
            <div className="flex items-center gap-3 text-left">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-slate-300 bg-white p-1 shadow-sm">
                <div className="h-full w-full bg-[radial-gradient(#0b2a6b_1px,transparent_1px)] [background-size:4px_4px]" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Valid & Terverifikasi</span>
                </div>
                <div className="text-[10px] text-slate-500">
                  Diterbitkan: {cert?.tanggalTerbit}
                </div>
                <div className="text-[9px] font-mono text-slate-400">
                  ampera.pom.go.id/cindo
                </div>
              </div>
            </div>

            {/* Right: Signature Box */}
            <div className="text-center sm:text-right space-y-1">
              <div className="text-xs text-slate-600">Palembang, {cert?.tanggalTerbit}</div>
              <div className="text-xs font-bold text-slate-800">
                Kepala Balai Besar POM di Palembang
              </div>
              {/* Digital Stamp Simulation */}
              <div className="relative py-2 flex justify-center sm:justify-end">
                <div className="rounded-full border-2 border-blue-600/60 px-4 py-1 text-[10px] font-extrabold uppercase text-blue-700 tracking-wider rotate-[-6deg]">
                  ✓ TERVERIFIKASI DIGITAL BBPOM
                </div>
              </div>
              <div className="text-xs font-bold text-slate-900 underline">
                BBPOM Operator & Penjamin Mutu
              </div>
              <div className="text-[10px] font-mono text-slate-500">
                NIP. 19780824 200212 1 002
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

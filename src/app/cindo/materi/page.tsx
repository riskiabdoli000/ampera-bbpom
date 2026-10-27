"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Volume2,
  Printer,
  BookOpen,
  Search,
  Info,
  HelpCircle,
  X,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { CindoChapterCard } from "@/components/cindo/CindoChapterCard";
import { CindoBottomBar } from "@/components/cindo/CindoBottomBar";
import { DAFTAR_MATERI_CINDO } from "@/data/cindo/materiData";
import { BabMateri, SesiCindo } from "@/data/cindo/cindoTypes";
import {
  getSesiCindo,
  markBabCompleted,
} from "@/data/cindo/cindoStorage";

export default function CindoMateriPage() {
  const [sesi, setSesi] = useState<SesiCindo | null>(null);
  const [selectedBab, setSelectedBab] = useState<BabMateri | null>(null);
  const [isReadingAudio, setIsReadingAudio] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTabNotice, setActiveTabNotice] = useState<string | null>(null);

  useEffect(() => {
    setSesi(getSesiCindo());
  }, []);

  const hasPeserta = !!sesi?.peserta;
  const isPreTestDone = !!sesi?.preTest?.completed;
  const completedBabIds = sesi?.materiProgress?.completedBabIds || [];
  const activeBabId = sesi?.materiProgress?.activeBabId || 1;

  const totalBab = DAFTAR_MATERI_CINDO.length;
  const completedCount = completedBabIds.length;
  const allCompleted = completedCount >= totalBab;

  // Find currently active bab object
  const currentBabIndex = DAFTAR_MATERI_CINDO.findIndex(
    (b) => b.id === (selectedBab?.id || activeBabId)
  );
  const currentBabNumber = (currentBabIndex >= 0 ? currentBabIndex : 0) + 1;

  const handleOpenBab = (bab: BabMateri) => {
    setSelectedBab(bab);
    // auto update active bab in storage
    const updated = markBabCompleted(bab.id);
    setSesi(updated);
  };

  const handleMarkFinishedAndNext = (babId: number) => {
    const updated = markBabCompleted(babId);
    setSesi(updated);

    // Buka bab berikutnya jika ada
    const nextIdx = DAFTAR_MATERI_CINDO.findIndex((b) => b.id === babId) + 1;
    if (nextIdx < DAFTAR_MATERI_CINDO.length) {
      setSelectedBab(DAFTAR_MATERI_CINDO[nextIdx]);
    } else {
      setSelectedBab(null); // Semua selesai
    }
  };

  const handlePrev = () => {
    if (currentBabIndex > 0) {
      setSelectedBab(DAFTAR_MATERI_CINDO[currentBabIndex - 1]);
    }
  };

  const handleNext = () => {
    if (currentBabIndex < totalBab - 1) {
      const nextBab = DAFTAR_MATERI_CINDO[currentBabIndex + 1];
      // Pastikan bab sebelumnya sudah selesai
      if (completedBabIds.includes(DAFTAR_MATERI_CINDO[currentBabIndex].id)) {
        setSelectedBab(nextBab);
      } else {
        alert("Selesaikan membaca materi bab saat ini terlebih dahulu sebelum berpindah ke bab berikutnya.");
      }
    }
  };

  // Text-To-Speech audio simulation
  const toggleAudio = (text?: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Fitur Text-to-Speech tidak didukung pada peramban Anda.");
      return;
    }
    if (isReadingAudio) {
      window.speechSynthesis.cancel();
      setIsReadingAudio(false);
    } else {
      const content =
        text ||
        selectedBab?.bacaanLengkap.join(". ") ||
        "Modul Edukasi Keamanan Pangan dan Obat BBPOM Palembang.";
      const utterance = new SpeechSynthesisUtterance(content);
      utterance.lang = "id-ID";
      utterance.onend = () => setIsReadingAudio(false);
      utterance.onerror = () => setIsReadingAudio(false);
      window.speechSynthesis.speak(utterance);
      setIsReadingAudio(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Utility Header matching Image 3 (GMP:READY LE2 style) */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-4 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-base sm:text-lg font-black tracking-tighter text-[#0b2a6b] dark:text-blue-400">
              CINDO<span className="text-brand-orange-500">:READY</span>
            </span>
            <span className="hidden sm:inline text-xs font-semibold text-slate-400">|</span>
            <span className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300">
              LE2 – Keamanan Pangan & Obat Palembang
            </span>
          </div>
        </div>

        {/* Top Action Icons matching Image 3 */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => toggleAudio()}
            className={`flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 transition-colors dark:border-slate-800 ${
              isReadingAudio
                ? "bg-blue-600 text-white"
                : "bg-white text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300"
            }`}
            title={isReadingAudio ? "Hentikan Suara" : "Putar Audio / Suara Pembaca"}
          >
            <Volume2 className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
            title="Cetak Halaman"
          >
            <Printer className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() =>
              setActiveTabNotice(
                "Glosarium Singkatan: BBPOM (Balai Besar POM), KLIK (Kemasan, Label, Izin Edar, Kedaluwarsa), BKO (Bahan Kimia Obat), P-IRT (Pangan Industri Rumah Tangga)."
              )
            }
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
            title="Glosarium Istilah A-Z"
          >
            <span className="text-[11px] font-bold">A-Z</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const q = prompt("Cari materi berdasarkan kata kunci (contoh: Boraks, Formalin, KLIK):");
              if (q) setSearchQuery(q);
            }}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
            title="Pencarian Materi"
          >
            <Search className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() =>
              setActiveTabNotice(
                "Informasi: Materi pembelajaran ini disusun resmi oleh tim edukasi BBPOM di Palembang untuk pengawasan partisipatif keamanan obat dan makanan."
              )
            }
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
            title="Informasi Modul"
          >
            <Info className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() =>
              setActiveTabNotice(
                "Panduan Belajar: Baca materi secara berurutan dari Bab 1 hingga Bab 8. Bab berikutnya akan terbuka otomatis setelah bab saat ini diselesaikan."
              )
            }
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
            title="Bantuan Navigasi"
          >
            <HelpCircle className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Info notice bar if opened */}
      {activeTabNotice && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-xs text-blue-900 dark:border-blue-900 dark:bg-blue-950/70 dark:text-blue-200">
          <span>{activeTabNotice}</span>
          <button
            type="button"
            onClick={() => setActiveTabNotice(null)}
            className="text-blue-600 hover:text-blue-900 dark:text-blue-400"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Mandatory Identity & Pre-Test Check before Materi Access */}
      {!hasPeserta ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-blue-300/80 bg-blue-50/90 p-4 sm:p-5 shadow-sm dark:border-blue-800 dark:bg-blue-950/50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-blue-900 dark:text-blue-200">
                Lengkapi Data Identitas Terlebih Dahulu
              </h3>
              <p className="mt-0.5 text-xs text-blue-800 dark:text-blue-300">
                Sesuai ketentuan, Anda diminta untuk melengkapi data identitas terlebih dahulu sebelum dapat mengakses materi pembelajaran dan evaluasi.
              </p>
            </div>
          </div>
          <Link
            href="/cindo/tes/identitas"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#1664e8] px-4 py-2 text-xs font-bold text-white shadow transition-all hover:bg-blue-700 active:scale-95"
          >
            <span>Lengkapi Identitas Sekarang</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      ) : !isPreTestDone ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-amber-300/80 bg-amber-50/90 p-4 sm:p-5 shadow-sm dark:border-amber-800 dark:bg-amber-950/50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                Peringatan: Pre-Test Wajib Diisi Terlebih Dahulu
              </h3>
              <p className="mt-0.5 text-xs text-amber-800 dark:text-amber-300">
                Sesuai aturan sistem Cindo, Anda wajib mengerjakan Pre-Test (10 soal) sebelum materi dibuka secara bertahap.
              </p>
            </div>
          </div>
          <Link
            href="/cindo/tes/pre-test"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow transition-all hover:bg-amber-700 active:scale-95"
          >
            <span>Mulai Pre-Test Sekarang</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      ) : null}

      {/* Main Section Header matching Image 3 */}
      <div>
        <div className="text-xs font-extrabold uppercase tracking-widest text-[#1664e8] dark:text-blue-400">
          2.0 MODUL EDUKASI - BBPOM DI PALEMBANG
        </div>
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mt-1">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-brand-orange-500">
            Kapitelübersicht
            <span className="ml-2 text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-200">
              (Daftar Bab Pembelajaran)
            </span>
          </h1>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {completedCount} dari {totalBab} Bab Selesai
          </span>
        </div>
      </div>

      {/* Search Filter Notice */}
      {searchQuery && (
        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
          <span>Menampilkan hasil pencarian untuk: &ldquo;{searchQuery}&rdquo;</span>
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="text-blue-600 underline font-bold"
          >
            Reset
          </button>
        </div>
      )}

      {/* 8 Chapters Grid matching Image 3 (4 cols x 2 rows) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {DAFTAR_MATERI_CINDO.map((bab, index) => {
          const isCompleted = completedBabIds.includes(bab.id);
          const isActive = bab.id === activeBabId;
          // Bab terkunci jika pretest belum diisi ATAU bab sebelumnya belum diselesaikan
          const isPreviousCompleted =
            index === 0 ? (hasPeserta && isPreTestDone) : completedBabIds.includes(DAFTAR_MATERI_CINDO[index - 1].id);
          const isLocked = !hasPeserta || !isPreTestDone || (!isCompleted && !isActive && !isPreviousCompleted);

          let status: "completed" | "active" | "locked" = "locked";
          if (isCompleted) status = "completed";
          else if (isActive && !isLocked) status = "active";
          else if (!isLocked) status = "active";

          return (
            <CindoChapterCard
              key={bab.id}
              materi={bab}
              status={status}
              onClick={() => handleOpenBab(bab)}
            />
          );
        })}
      </div>

      {/* Chapter Reader Modal when a chapter is selected */}
      {selectedBab && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col rounded-3xl bg-white shadow-2xl overflow-hidden dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            {/* Modal Header */}
            <div className="relative h-44 sm:h-52 w-full shrink-0 overflow-hidden bg-slate-900">
              <Image
                src={selectedBab.gambarThumbnail}
                alt={selectedBab.judul}
                fill
                className="object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

              <button
                type="button"
                onClick={() => setSelectedBab(null)}
                className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors"
                title="Tutup Bacaan"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="absolute bottom-4 left-5 right-5 text-white">
                <span className="inline-block rounded-full bg-blue-600 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-widest">
                  {selectedBab.nomor}
                </span>
                <h2 className="mt-1 text-lg sm:text-2xl font-black leading-tight">
                  {selectedBab.judul}
                </h2>
                {selectedBab.subjudul && (
                  <p className="text-xs text-blue-200 mt-0.5 line-clamp-1">
                    {selectedBab.subjudul}
                  </p>
                )}
              </div>
            </div>

            {/* Modal Body Content */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-5 text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
              {/* Audio Listen Bar */}
              <div className="flex items-center justify-between rounded-xl border border-slate-200/90 bg-slate-50 px-4 py-2.5 dark:border-slate-800 dark:bg-slate-800/60">
                <div className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Dengarkan narasi bacaan otomatis
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    toggleAudio(
                      `${selectedBab.judul}. ${selectedBab.bacaanLengkap.join(" ")}`
                    )
                  }
                  className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-bold text-white hover:bg-blue-700"
                >
                  {isReadingAudio ? "Hentikan Audio" : "Putar Audio"}
                </button>
              </div>

              {/* Poin-poin penting */}
              <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4 dark:border-blue-900/50 dark:bg-blue-950/40">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4" />
                  Poin-Poin Utama Pembahasan:
                </h4>
                <ul className="space-y-1.5 text-xs sm:text-sm">
                  {selectedBab.kontenPoin.map((pt, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Paragraf Bacaan Lengkap */}
              <div className="space-y-3.5">
                {selectedBab.bacaanLengkap.map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>

              {/* Tips Penting BBPOM */}
              {selectedBab.tipsPenting && (
                <div className="rounded-2xl border-l-4 border-amber-500 bg-amber-50 p-4 text-xs sm:text-sm text-amber-900 dark:bg-amber-950/50 dark:text-amber-200">
                  <strong className="font-bold">Tips Cerdas BBPOM: </strong>
                  {selectedBab.tipsPenting}
                </div>
              )}
            </div>

            {/* Modal Footer Action */}
            <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-5 py-4 dark:border-slate-800 dark:bg-slate-900/90">
              <button
                type="button"
                onClick={() => setSelectedBab(null)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Tutup Sementara
              </button>

              <button
                type="button"
                onClick={() => handleMarkFinishedAndNext(selectedBab.id)}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-xs sm:text-sm font-bold text-white shadow hover:bg-emerald-700 active:scale-95"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Tandai Selesai & Buka Bab Selanjutnya</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Progress Bar matching Image 3 */}
      <CindoBottomBar
        currentBabNumber={currentBabNumber}
        totalBab={totalBab}
        completedCount={completedCount}
        allCompleted={allCompleted}
        onPrev={handlePrev}
        onNext={handleNext}
        canPrev={currentBabIndex > 0}
        canNext={currentBabIndex < totalBab - 1}
      />
    </div>
  );
}

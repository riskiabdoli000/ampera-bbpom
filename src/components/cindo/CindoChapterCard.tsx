"use client";

import React from "react";
import Image from "next/image";
import {
  CheckCircle2,
  Lock,
  Clock,
  BookOpen,
  FileQuestion,
  Award,
  FileText,
  Video,
  Sparkles,
  ArrowRight,
  Download,
  ClipboardCheck,
} from "lucide-react";
import { BabMateri, TopikModuleProgress } from "@/data/cindo/cindoTypes";

interface CindoChapterCardProps {
  materi: BabMateri;
  progress?: TopikModuleProgress;
  isSelected?: boolean;
  onClick: () => void;
  onDownloadCertificate?: (materi: BabMateri, e: React.MouseEvent) => void;
}

export function CindoChapterCard({
  materi,
  progress,
  isSelected,
  onClick,
  onDownloadCertificate,
}: CindoChapterCardProps) {
  const preDone = Boolean(progress?.preTest?.completed);
  const materiDone = Boolean(progress?.materi?.completed);
  const postDone = Boolean(progress?.postTest?.completed && progress?.postTest?.isPassed);
  const surveyDone = Boolean(progress?.survey?.completed);

  // Hitung jumlah tahapan selesai (0-4: Pre-Test -> Materi -> Post-Test -> Survei)
  let stepsCompleted = 0;
  if (preDone) stepsCompleted += 1;
  if (materiDone) stepsCompleted += 1;
  if (postDone) stepsCompleted += 1;
  if (surveyDone) stepsCompleted += 1;

  const percent = Math.round((stepsCompleted / 4) * 100);
  const isFullyCompleted = stepsCompleted === 4;

  return (
    <div
      onClick={onClick}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border transition-all duration-300 select-none cursor-pointer hover:shadow-xl hover:-translate-y-1 ${
        isSelected
          ? "border-brand-orange bg-white ring-4 ring-orange-500/20 shadow-xl dark:border-brand-orange dark:bg-slate-900"
          : isFullyCompleted
          ? "border-emerald-300 bg-white shadow-sm hover:border-emerald-400 dark:border-emerald-800/80 dark:bg-slate-900"
          : stepsCompleted > 0
          ? "border-orange-200/90 bg-white shadow-sm hover:border-brand-orange dark:border-orange-950 dark:bg-slate-900"
          : "border-slate-200/90 bg-white hover:border-brand-orange dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-orange"
      }`}
    >
      {/* Thumbnail Area */}
      <div className="relative h-36 sm:h-40 w-full overflow-hidden bg-slate-900">
        <Image
          src={materi.gambarThumbnail}
          alt={materi.judul}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover opacity-85 transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

        {/* Format Badge Top Left */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-white shadow border border-white/10">
            {materi.tipeMateri === "both" ? (
              <>
                <FileText className="h-3 w-3 text-amber-400" />
                <span className="text-white/40">/</span>
                <Video className="h-3 w-3 text-brand-orange" />
                <span>PDF & Video</span>
              </>
            ) : materi.tipeMateri === "video" ? (
              <>
                <Video className="h-3 w-3 text-brand-orange" />
                <span>Video Edukasi</span>
              </>
            ) : (
              <>
                <FileText className="h-3 w-3 text-amber-400" />
                <span>Dokumen PDF</span>
              </>
            )}
          </span>
        </div>

        {/* Time estimate Top Right */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-md px-2.5 py-1 text-[10px] font-semibold text-white shadow border border-white/10">
          <Clock className="h-3 w-3 text-amber-300" />
          <span>{materi.estimasiMenit} mnt</span>
        </div>

        {/* Bottom Banner inside Image: Topik & Kategori */}
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white">
          <span className="rounded-md bg-gradient-to-r from-brand-orange to-orange-600 px-2 py-0.5 text-[10px] font-extrabold tracking-wider uppercase shadow-sm">
            {materi.nomor}
          </span>
          <span className="rounded-md bg-white/20 backdrop-blur-sm px-2 py-0.5 text-[10px] font-medium text-slate-100 truncate max-w-[140px]">
            {materi.kategori}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
        <div>
          <h3 className="text-sm sm:text-base font-extrabold text-navy-900 group-hover:text-brand-orange dark:text-white dark:group-hover:text-brand-orange transition-colors line-clamp-2 leading-snug">
            {materi.judul}
          </h3>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {materi.deskripsiSingkat}
          </p>
        </div>

        {/* Sequential 3 Modules Indicator */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-bold text-slate-700 dark:text-slate-300">
              Alur 3 Modul:
            </span>
            <span
              className={`font-extrabold ${
                isFullyCompleted
                  ? "text-emerald-600 dark:text-emerald-400"
                  : stepsCompleted > 0
                  ? "text-brand-orange dark:text-orange-400"
                  : "text-slate-400"
              }`}
            >
              {stepsCompleted} / 4 Tahap ({percent}%)
            </span>
          </div>

          {/* Stepper Grid (Pre-Test -> Materi -> Post-Test -> Survei) */}
          <div className="grid grid-cols-4 gap-1 text-[9px]">
            {/* Modul 1: Pre-Test */}
            <div
              className={`flex items-center gap-1 rounded-lg px-1.5 py-1.5 font-semibold transition-colors ${
                preDone
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900"
                  : "bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300 border border-orange-200 dark:border-orange-900/60"
              }`}
            >
              {preDone ? (
                <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-600" />
              ) : (
                <FileQuestion className="h-3 w-3 shrink-0 text-brand-orange" />
              )}
              <span className="truncate">1. Pre</span>
            </div>

            {/* Modul 2: Materi */}
            <div
              className={`flex items-center gap-1 rounded-lg px-1.5 py-1.5 font-semibold transition-colors ${
                materiDone
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900"
                  : preDone
                  ? "bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300 border border-orange-200 dark:border-orange-900/60"
                  : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 border border-transparent"
              }`}
            >
              {materiDone ? (
                <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-600" />
              ) : preDone ? (
                <BookOpen className="h-3 w-3 shrink-0 text-brand-orange" />
              ) : (
                <Lock className="h-3 w-3 shrink-0 text-slate-400" />
              )}
              <span className="truncate">2. Materi</span>
            </div>

            {/* Modul 3: Post-Test */}
            <div
              className={`flex items-center gap-1 rounded-lg px-1.5 py-1.5 font-semibold transition-colors ${
                postDone
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900"
                  : materiDone
                  ? "bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border border-purple-200 dark:border-purple-900"
                  : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 border border-transparent"
              }`}
            >
              {postDone ? (
                <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-600" />
              ) : (
                <Lock className="h-3 w-3 shrink-0 text-slate-400" />
              )}
              <span className="truncate">3. Post</span>
            </div>

            {/* Modul 4: Survei Kepuasan */}
            <div
              className={`flex items-center gap-1 rounded-lg px-1.5 py-1.5 font-semibold transition-colors ${
                surveyDone
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900"
                  : postDone
                  ? "bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300 border border-teal-200 dark:border-teal-900"
                  : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 border border-transparent"
              }`}
            >
              {surveyDone ? (
                <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-600" />
              ) : postDone ? (
                <ClipboardCheck className="h-3 w-3 shrink-0 text-teal-600" />
              ) : (
                <Lock className="h-3 w-3 shrink-0 text-slate-400" />
              )}
              <span className="truncate">4. Survei</span>
            </div>
          </div>

          {/* Progress bar line */}
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                isFullyCompleted
                  ? "bg-emerald-500"
                  : stepsCompleted > 0
                  ? "bg-gradient-to-r from-brand-orange to-amber-400"
                  : "bg-transparent"
              }`}
              style={{ width: `${percent}%` }}
            />
          </div>

          {/* Action Footer Button */}
          <div className="pt-1">
            {isFullyCompleted ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDownloadCertificate?.(materi, e);
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 py-2 px-3 text-xs font-bold text-white shadow-md shadow-emerald-600/20 transition-all active:scale-95"
                  title="Unduh E-Sertifikat Topik Ini"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Unduh Sertifikat</span>
                </button>
                <button
                  type="button"
                  onClick={onClick}
                  className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 transition-colors"
                  title="Lihat Alur Tahapan"
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : postDone && !surveyDone ? (
              <button
                type="button"
                onClick={onClick}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 py-2 text-xs font-bold text-white transition-all shadow-md shadow-teal-600/20 active:scale-95"
              >
                <ClipboardCheck className="h-3.5 w-3.5" />
                <span>Lanjut: Isi Survei Kepuasan</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                type="button"
                className={`w-full flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold transition-all shadow-sm ${
                  stepsCompleted > 0
                    ? "bg-gradient-to-r from-brand-orange to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-md shadow-orange-500/25"
                    : "bg-slate-100 text-slate-700 hover:bg-orange-50 hover:text-brand-orange hover:border-orange-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                <span>
                  {stepsCompleted > 0
                    ? "Lanjutkan Tahapan"
                    : "Buka Topik Ini"}
                </span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import Image from "next/image";
import { CheckCircle2, Lock, Clock, BookOpen } from "lucide-react";
import { BabMateri } from "@/data/cindo/cindoTypes";

interface CindoChapterCardProps {
  materi: BabMateri;
  status: "completed" | "active" | "locked";
  onClick: () => void;
}

export function CindoChapterCard({
  materi,
  status,
  onClick,
}: CindoChapterCardProps) {
  const isCompleted = status === "completed";
  const isActive = status === "active";
  const isLocked = status === "locked";

  return (
    <div
      onClick={isLocked ? undefined : onClick}
      className={`group relative flex flex-col overflow-hidden rounded-xl border transition-all duration-200 select-none ${
        isActive
          ? "border-[#1664e8] bg-white ring-4 ring-blue-500/20 shadow-lg cursor-pointer scale-[1.02] dark:border-blue-500 dark:bg-slate-900"
          : isCompleted
          ? "border-emerald-300/80 bg-white shadow-sm hover:shadow-md cursor-pointer dark:border-emerald-800/80 dark:bg-slate-900"
          : "border-slate-200/80 bg-slate-50/70 opacity-60 grayscale cursor-not-allowed dark:border-slate-800 dark:bg-slate-900/50"
      }`}
    >
      {/* Thumbnail Area */}
      <div className="relative h-28 sm:h-32 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        <Image
          src={materi.gambarThumbnail}
          alt={materi.judul}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className={`object-cover transition-transform duration-300 ${
            !isLocked && "group-hover:scale-105"
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Lock Overlay if locked */}
        {isLocked && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px]">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white shadow">
              <Lock className="h-4 w-4" />
            </div>
          </div>
        )}

        {/* Time estimate pill */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
          <Clock className="h-3 w-3" />
          <span>{materi.estimasiMenit} mnt</span>
        </div>
      </div>

      {/* Info Container matching Image 3 (Kapitel style) */}
      <div
        className={`flex flex-1 flex-col justify-between p-3.5 sm:p-4 ${
          isActive
            ? "bg-[#1664e8] text-white"
            : "bg-white text-slate-800 dark:bg-slate-900 dark:text-slate-100"
        }`}
      >
        <div>
          <div
            className={`text-[11px] font-bold uppercase tracking-wider ${
              isActive ? "text-blue-100" : "text-slate-500 dark:text-slate-400"
            }`}
          >
            {materi.nomor}
          </div>
          <h3
            className={`mt-0.5 text-xs sm:text-sm font-bold line-clamp-2 leading-snug ${
              isActive ? "text-white" : "text-slate-800 dark:text-slate-100"
            }`}
          >
            {materi.judul}
          </h3>
        </div>

        {/* Status Bottom Indicator */}
        <div className="mt-3 flex items-center justify-between pt-2 border-t border-black/10 dark:border-white/10">
          <span
            className={`text-[10px] font-semibold ${
              isActive
                ? "text-blue-100"
                : isCompleted
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-slate-400 dark:text-slate-500"
            }`}
          >
            {isCompleted ? "Sudah Dibaca" : isActive ? "Sedang Dibaca" : "Terkunci"}
          </span>

          {isCompleted ? (
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm">
              <CheckCircle2 className="h-4 w-4 stroke-[2.5]" />
            </div>
          ) : isActive ? (
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[#1664e8] shadow-sm">
              <BookOpen className="h-3 w-3" />
            </div>
          ) : (
            <div className="flex h-5 w-5 items-center justify-center rounded-full border border-slate-300 dark:border-slate-700 text-slate-400">
              <Lock className="h-2.5 w-2.5" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

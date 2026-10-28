"use client";

import React from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, CheckCircle2, ArrowRight } from "lucide-react";

interface CindoBottomBarProps {
  currentBabNumber: number;
  totalBab: number;
  completedCount: number;
  allCompleted: boolean;
  onPrev: () => void;
  onNext: () => void;
  canPrev: boolean;
  canNext: boolean;
}

export function CindoBottomBar({
  currentBabNumber,
  totalBab,
  completedCount,
  allCompleted,
  onPrev,
  onNext,
  canPrev,
  canNext,
}: CindoBottomBarProps) {
  const percent = Math.round((completedCount / totalBab) * 100);

  return (
    <div className="sticky bottom-0 z-20 flex w-full items-center justify-between bg-[#1664e8] px-4 py-3 sm:px-8 text-white shadow-xl">
      {/* Left Progress Info matching "Seite 1/5" in Image 3 */}
      <div className="flex items-center gap-3">
        <div className="text-xs sm:text-sm font-extrabold tracking-wide">
          Materi {currentBabNumber}/{totalBab}
        </div>
        <div className="hidden sm:flex items-center gap-2 border-l border-white/20 pl-3">
          <div className="h-2 w-24 overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full bg-amber-300 transition-all duration-300 rounded-full"
              style={{ width: `${percent}%` }}
            />
          </div>
          <span className="text-[11px] font-semibold text-blue-100">
            {completedCount} dari {totalBab} selesai ({percent}%)
          </span>
        </div>
      </div>

      {/* Right Controls: Prev & Next buttons matching < and > in Image 3 */}
      <div className="flex items-center gap-2">
        {allCompleted ? (
          <Link
            href="/cindo/tes/post-test"
            className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3.5 py-1.5 text-xs font-bold text-white shadow transition-transform hover:bg-emerald-600 active:scale-95"
          >
            <span>Lanjut ke Post-Test</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        ) : (
          <span className="hidden md:inline text-[11px] font-medium text-blue-100 mr-2">
            Buka bab berurutan untuk lanjut
          </span>
        )}

        <button
          type="button"
          onClick={onPrev}
          disabled={!canPrev}
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 text-white transition-all hover:bg-white/25 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          title="Bab Sebelumnya"
          aria-label="Bab Sebelumnya"
        >
          <ChevronLeft className="h-5 w-5 stroke-[2.5]" />
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={!canNext}
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 text-white transition-all hover:bg-white/25 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          title="Bab Selanjutnya"
          aria-label="Bab Selanjutnya"
        >
          <ChevronRight className="h-5 w-5 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
}

import React from "react";
import { Loader2 } from "lucide-react";

export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Banner Skeleton */}
      <div className="relative overflow-hidden rounded-3xl border border-[#dce8fb] dark:border-slate-800/90 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2.5">
            <div className="h-5 w-36 rounded-full bg-slate-200 dark:bg-slate-800" />
            <div className="h-7 w-64 sm:w-80 rounded-xl bg-slate-200 dark:bg-slate-800" />
            <div className="h-4 w-72 sm:w-96 rounded-lg bg-slate-100 dark:bg-slate-800/70" />
          </div>
          <div className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/60 text-xs font-bold text-[#1664e8] dark:text-blue-400 self-start sm:self-center">
            <Loader2 className="h-4 w-4 animate-spin text-brand-orange" />
            <span>Memuat data halaman...</span>
          </div>
        </div>
      </div>

      {/* Summary Metric Cards Skeleton (4 Cards) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-[#e2ecfb] dark:border-slate-800/90 bg-white dark:bg-slate-900 p-5 shadow-xs flex items-center justify-between"
          >
            <div className="space-y-2.5">
              <div className="h-3.5 w-24 rounded-md bg-slate-200 dark:bg-slate-800" />
              <div className="h-7 w-16 rounded-lg bg-slate-200 dark:bg-slate-800" />
              <div className="h-3 w-32 rounded-md bg-slate-100 dark:bg-slate-800/60" />
            </div>
            <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800" />
          </div>
        ))}
      </div>

      {/* Main Table / Content Card Skeleton */}
      <div className="rounded-3xl border border-[#e2ecfb] dark:border-slate-800/90 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xs space-y-5">
        {/* Toolbar Filter & Search Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="h-10 w-full sm:w-80 rounded-xl bg-slate-100 dark:bg-slate-800" />
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-28 rounded-xl bg-slate-100 dark:bg-slate-800" />
            <div className="h-10 w-32 rounded-xl bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>

        {/* Table Rows Skeleton */}
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6].map((row) => (
            <div
              key={row}
              className="h-14 w-full rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/60 flex items-center justify-between px-4 gap-4"
            >
              <div className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-4 flex-1 max-w-xs rounded bg-slate-200 dark:bg-slate-700" />
              <div className="hidden md:block h-4 w-32 rounded bg-slate-100 dark:bg-slate-800" />
              <div className="h-6 w-24 rounded-full bg-slate-200 dark:bg-slate-700" />
              <div className="h-8 w-20 rounded-xl bg-slate-100 dark:bg-slate-800" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


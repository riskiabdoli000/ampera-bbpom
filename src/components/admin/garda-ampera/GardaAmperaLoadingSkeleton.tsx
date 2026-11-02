"use client";

import React from "react";

/**
 * Skeleton untuk 4 Top Summary Stat Cards di Halaman Utama Garda Ampera
 */
export function GardaStatCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center justify-between"
        >
          <div className="space-y-2">
            <div className="h-3 w-24 bg-slate-200 dark:bg-slate-800 rounded-md" />
            <div className="h-7 w-20 bg-slate-200 dark:bg-slate-800 rounded-lg" />
            <div className="h-2.5 w-28 bg-slate-100 dark:bg-slate-800/70 rounded-md" />
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800" />
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton untuk Filter Bar & Tabel Peserta & Kelulusan
 */
export function GardaPesertaTableSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Filter Bar Skeleton */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <div className="h-10 flex-1 min-w-[240px] bg-slate-100 dark:bg-slate-800 rounded-xl" />
          <div className="flex flex-wrap items-center gap-2">
            <div className="h-10 w-32 bg-slate-100 dark:bg-slate-800 rounded-xl" />
            <div className="h-10 w-28 bg-slate-100 dark:bg-slate-800 rounded-xl" />
            <div className="h-10 w-28 bg-slate-100 dark:bg-slate-800 rounded-xl" />
          </div>
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="h-4 w-40 bg-slate-200 dark:bg-slate-800 rounded-md" />
          <div className="h-4 w-24 bg-slate-100 dark:bg-slate-800 rounded-md" />
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {[1, 2, 3, 4, 5, 6].map((row) => (
            <div
              key={row}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 shrink-0" />
                <div className="space-y-1.5">
                  <div className="h-4 w-36 sm:w-48 bg-slate-200 dark:bg-slate-800 rounded-md" />
                  <div className="h-3 w-28 sm:w-36 bg-slate-100 dark:bg-slate-800/60 rounded-md" />
                </div>
              </div>

              <div className="flex items-center gap-4 sm:gap-6">
                <div className="h-4 w-24 bg-slate-100 dark:bg-slate-800 hidden md:block rounded-md" />
                <div className="h-6 w-16 bg-slate-200 dark:bg-slate-800 rounded-lg text-center" />
                <div className="h-6 w-16 bg-slate-200 dark:bg-slate-800 rounded-lg text-center" />
                <div className="h-6 w-20 bg-slate-200 dark:bg-slate-800 rounded-full" />
                <div className="h-8 w-16 bg-slate-100 dark:bg-slate-800 rounded-xl" />
              </div>
            </div>
          ))}
        </div>

        {/* Footer Pagination Skeleton */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="h-3.5 w-32 bg-slate-200 dark:bg-slate-800 rounded-md" />
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-slate-200 dark:bg-slate-800 rounded-lg" />
            <div className="h-8 w-8 bg-slate-200 dark:bg-slate-800 rounded-lg" />
            <div className="h-8 w-8 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton untuk Tab Kelola Bank Soal
 */
export function GardaSoalSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Toolbar Skeleton */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="h-10 w-full sm:w-80 bg-slate-100 dark:bg-slate-800 rounded-xl" />
        <div className="flex items-center gap-2">
          <div className="h-10 w-28 bg-slate-100 dark:bg-slate-800 rounded-xl" />
          <div className="h-10 w-36 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        </div>
      </div>

      {/* Question Cards Skeleton */}
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-5 w-16 bg-slate-200 dark:bg-slate-800 rounded-md" />
                <div className="h-5 w-24 bg-slate-100 dark:bg-slate-800 rounded-md" />
              </div>
              <div className="h-6 w-20 bg-slate-100 dark:bg-slate-800 rounded-full" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-md" />
              <div className="h-4 w-1/2 bg-slate-100 dark:bg-slate-800 rounded-md" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
              {[1, 2, 3, 4].map((opt) => (
                <div
                  key={opt}
                  className="h-9 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton untuk Tab Modul Materi
 */
export function GardaMateriSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Toolbar Skeleton */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
        <div className="h-4 w-48 bg-slate-200 dark:bg-slate-800 rounded-md" />
        <div className="h-10 w-36 bg-slate-200 dark:bg-slate-800 rounded-xl" />
      </div>

      {/* Materi Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-6 w-20 bg-slate-200 dark:bg-slate-800 rounded-full" />
                <div className="h-6 w-16 bg-slate-100 dark:bg-slate-800 rounded-md" />
              </div>
              <div className="h-5 w-4/5 bg-slate-200 dark:bg-slate-800 rounded-md" />
              <div className="space-y-1.5">
                <div className="h-3 w-full bg-slate-100 dark:bg-slate-800/60 rounded-md" />
                <div className="h-3 w-3/4 bg-slate-100 dark:bg-slate-800/60 rounded-md" />
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="h-8 w-24 bg-slate-100 dark:bg-slate-800 rounded-xl" />
              <div className="flex items-center gap-1.5">
                <div className="h-8 w-8 bg-slate-100 dark:bg-slate-800 rounded-xl" />
                <div className="h-8 w-8 bg-slate-100 dark:bg-slate-800 rounded-xl" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton untuk Halaman Evaluasi Peserta (/admin/garda-ampera/evaluasi)
 */
export function GardaEvaluasiSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* 5 KPI Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded-md" />
              <div className="h-6 w-6 rounded-lg bg-slate-100 dark:bg-slate-800" />
            </div>
            <div className="h-7 w-16 bg-slate-200 dark:bg-slate-800 rounded-lg" />
            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full" />
          </div>
        ))}
      </div>

      {/* Search & Filter Skeleton */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="h-10 w-full sm:w-80 bg-slate-100 dark:bg-slate-800 rounded-xl" />
        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <div className="h-10 w-28 bg-slate-100 dark:bg-slate-800 rounded-xl" />
          <div className="h-10 w-32 bg-slate-100 dark:bg-slate-800 rounded-xl" />
        </div>
      </div>

      {/* Evaluasi List Skeleton */}
      <div className="space-y-3.5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800" />
                <div className="space-y-1.5">
                  <div className="h-4 w-36 bg-slate-200 dark:bg-slate-800 rounded-md" />
                  <div className="h-3 w-48 bg-slate-100 dark:bg-slate-800 rounded-md" />
                </div>
              </div>
              <div className="h-6 w-28 bg-slate-100 dark:bg-slate-800 rounded-full" />
            </div>
            <div className="h-14 bg-slate-50 dark:bg-slate-800/40 rounded-xl p-3 border border-slate-100 dark:border-slate-800/60" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton untuk Halaman Dashboard Analitik (/admin/garda-ampera/dashboard)
 */
export function GardaDashboardSkeleton() {
  return (
    <div className="space-y-6 sm:space-y-8 animate-pulse">
      {/* Filter Card Skeleton */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="h-5 w-44 bg-slate-200 dark:bg-slate-800 rounded-md" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 bg-slate-100 dark:bg-slate-800 rounded-xl" />
          ))}
        </div>
      </div>

      {/* Main Chart Skeleton */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <div className="h-5 w-48 bg-slate-200 dark:bg-slate-800 rounded-md" />
            <div className="h-3 w-64 bg-slate-100 dark:bg-slate-800 rounded-md" />
          </div>
          <div className="h-8 w-28 bg-slate-100 dark:bg-slate-800 rounded-xl" />
        </div>
        <div className="h-64 sm:h-80 w-full bg-slate-50 dark:bg-slate-800/40 rounded-2xl flex items-end justify-between p-6 gap-2">
          {[40, 65, 30, 85, 55, 90, 70, 45, 60, 80, 50, 95].map((h, idx) => (
            <div
              key={idx}
              className="flex-1 bg-slate-200 dark:bg-slate-700/60 rounded-t-lg transition-all"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>

      {/* Secondary Demographic Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4"
          >
            <div className="h-5 w-36 bg-slate-200 dark:bg-slate-800 rounded-md" />
            <div className="h-44 bg-slate-50 dark:bg-slate-800/40 rounded-2xl" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Default Component Skeleton untuk loading.tsx
 */
export default function GardaAmperaPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="h-16 w-full bg-slate-100 dark:bg-slate-800/60 rounded-2xl animate-pulse" />
      <GardaStatCardsSkeleton />
      <GardaPesertaTableSkeleton />
    </div>
  );
}


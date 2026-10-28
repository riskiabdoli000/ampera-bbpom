"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, Check, Calendar } from "lucide-react";

export interface DashboardSubmissionItem {
  id: number;
  status: string;
  createdAt: string | Date;
}

interface AdminWeeklyAnalyticsCardProps {
  submissions: DashboardSubmissionItem[];
}

type FilterOption = "7_HARI" | "30_HARI" | "TAHUN_INI" | "SEMUA";

interface BarItem {
  label: string;
  subLabel?: string;
  count: number;
  heightPct: number;
  isMax: boolean;
  tooltipText: string;
}

export function AdminWeeklyAnalyticsCard({ submissions }: AdminWeeklyAnalyticsCardProps) {
  const [filter, setFilter] = useState<FilterOption>("7_HARI");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filterLabels: Record<FilterOption, string> = {
    "7_HARI": "Minggu Ini (7 Hari)",
    "30_HARI": "Bulan Ini (30 Hari)",
    "TAHUN_INI": "Tahun Ini (12 Bulan)",
    "SEMUA": "Semua Waktu",
  };

  // Kalkulasi data batang bar chart berdasarkan filter
  const { bars, maxCount, subtitle } = useMemo(() => {
    const now = new Date();
    let sub = "7 Hari Terakhir";

    const formatBarsWithHeadroom = (
      rawItems: { label: string; count: number; fullTooltip: string }[]
    ) => {
      const rawMax = Math.max(...rawItems.map((b) => b.count), 0);
      // Headroom agar batang tertinggi berkisar 70%-75% tinggi area chart
      // sehingga badge angka dan tooltip tidak menabrak tombol filter di header
      const yScaleMax = rawMax > 0 ? Math.max(Math.ceil(rawMax * 1.35), rawMax + 1) : 4;

      const formattedBars: BarItem[] = rawItems.map((b) => ({
        label: b.label,
        count: b.count,
        heightPct: b.count > 0 ? Math.max(10, Math.round((b.count / yScaleMax) * 100)) : 6,
        isMax: b.count === rawMax && b.count > 0,
        tooltipText: b.fullTooltip,
      }));

      return { formattedBars, yScaleMax };
    };

    if (filter === "7_HARI") {
      sub = "7 Hari Terakhir";
      const dayNamesShort = ["M", "S", "S", "R", "K", "J", "S"];
      const dayFullNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
      const tempBars: { label: string; count: number; fullTooltip: string }[] = [];

      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
        const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

        const count = submissions.filter((p) => {
          const t = new Date(p.createdAt).getTime();
          return t >= dayStart.getTime() && t <= dayEnd.getTime();
        }).length;

        tempBars.push({
          label: dayNamesShort[d.getDay()],
          count,
          fullTooltip: `${dayFullNames[d.getDay()]}, ${d.getDate()} ${d.toLocaleDateString("id-ID", { month: "short" })}: ${count} Tiket`,
        });
      }

      const { formattedBars, yScaleMax } = formatBarsWithHeadroom(tempBars);
      return { bars: formattedBars, maxCount: yScaleMax, subtitle: sub };
    } else if (filter === "30_HARI") {
      sub = "30 Hari Terakhir";
      // Bagi 30 hari menjadi 5 blok mingguan (interval 6 hari)
      const tempBars: { label: string; count: number; fullTooltip: string }[] = [];
      for (let i = 4; i >= 0; i--) {
        const startDayOffset = (i + 1) * 6;
        const endDayOffset = i * 6;

        const dStart = new Date(now);
        dStart.setDate(dStart.getDate() - startDayOffset);
        dStart.setHours(0, 0, 0, 0);

        const dEnd = new Date(now);
        dEnd.setDate(dEnd.getDate() - endDayOffset);
        dEnd.setHours(23, 59, 59, 999);

        const count = submissions.filter((p) => {
          const t = new Date(p.createdAt).getTime();
          return t >= dStart.getTime() && t <= dEnd.getTime();
        }).length;

        const label = `Mg ${5 - i}`;
        const rangeStr = `${dStart.getDate()}/${dStart.getMonth() + 1} - ${dEnd.getDate()}/${dEnd.getMonth() + 1}`;
        tempBars.push({
          label,
          count,
          fullTooltip: `${rangeStr}: ${count} Tiket`,
        });
      }

      const { formattedBars, yScaleMax } = formatBarsWithHeadroom(tempBars);
      return { bars: formattedBars, maxCount: yScaleMax, subtitle: sub };
    } else if (filter === "TAHUN_INI") {
      sub = `Tahun ${now.getFullYear()}`;
      const monthShorts = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
      const currentYear = now.getFullYear();
      const tempBars: { label: string; count: number; fullTooltip: string }[] = [];

      for (let m = 0; m < 12; m++) {
        const mStart = new Date(currentYear, m, 1, 0, 0, 0, 0);
        const mEnd = new Date(currentYear, m + 1, 0, 23, 59, 59, 999);

        const count = submissions.filter((p) => {
          const t = new Date(p.createdAt).getTime();
          return t >= mStart.getTime() && t <= mEnd.getTime();
        }).length;

        tempBars.push({
          label: monthShorts[m],
          count,
          fullTooltip: `${monthShorts[m]} ${currentYear}: ${count} Tiket`,
        });
      }

      const { formattedBars, yScaleMax } = formatBarsWithHeadroom(tempBars);
      return { bars: formattedBars, maxCount: yScaleMax, subtitle: sub };
    } else {
      // SEMUA WAKTU
      sub = "Semua Riwayat";
      const yearsSet = new Set<number>();
      yearsSet.add(now.getFullYear());
      submissions.forEach((p) => {
        yearsSet.add(new Date(p.createdAt).getFullYear());
      });
      const sortedYears = Array.from(yearsSet).sort((a, b) => a - b);

      const tempBars = sortedYears.map((yr) => {
        const yStart = new Date(yr, 0, 1, 0, 0, 0, 0);
        const yEnd = new Date(yr, 11, 31, 23, 59, 59, 999);
        const count = submissions.filter((p) => {
          const t = new Date(p.createdAt).getTime();
          return t >= yStart.getTime() && t <= yEnd.getTime();
        }).length;
        return {
          label: String(yr),
          count,
          fullTooltip: `Tahun ${yr}: ${count} Tiket`,
        };
      });

      const { formattedBars, yScaleMax } = formatBarsWithHeadroom(tempBars);
      return { bars: formattedBars, maxCount: yScaleMax, subtitle: sub };
    }
  }, [submissions, filter]);

  return (
    <div className="rounded-2xl border border-[#e3ecfa] bg-white p-5 dark:border-slate-800 dark:bg-slate-900 xl:col-span-5 flex flex-col justify-between">
      <div>
        {/* Header dengan Dropdown Filter Interaktif */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#0f2257] dark:text-white">Analitik Pengajuan</h2>
            <p className="text-[11px] text-[#7b8aa8] mt-0.5">{subtitle}</p>
          </div>

          <div className="relative z-30" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#e3ecfa] bg-white px-3 py-1.5 text-xs font-semibold text-[#0f2257] shadow-xs hover:bg-[#f8fbff] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition-all cursor-pointer"
            >
              <Calendar className="h-3.5 w-3.5 text-[#1664e8]" />
              <span>{filterLabels[filter]}</span>
              <ChevronDown
                className={`h-3 w-3 text-[#7b8aa8] transition-transform duration-200 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Menu Popover Dropdown */}
            {isOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-52 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-900/10 dark:border-slate-700 dark:bg-slate-800 z-30 animate-fade-in">
                {(Object.keys(filterLabels) as FilterOption[]).map((key) => {
                  const isSelected = filter === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        setFilter(key);
                        setIsOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-blue-50 text-[#1664e8] font-bold dark:bg-blue-950/60 dark:text-blue-300"
                          : "text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700/60"
                      }`}
                    >
                      <span>{filterLabels[key]}</span>
                      {isSelected && <Check className="h-3.5 w-3.5 text-[#1664e8] dark:text-blue-400" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Diagram Batang Grafis */}
        <div className="mt-6 pt-2 flex gap-3">
          {/* Sumbu Y Angka */}
          <div className="flex h-44 flex-col justify-between pb-6 text-[11px] text-[#7b8aa8]">
            <span>{maxCount}</span>
            <span>{Math.max(1, Math.round(maxCount / 2))}</span>
            <span>0</span>
          </div>

          {/* Area Bar Batang */}
          <div className="flex h-44 flex-1 items-end justify-between gap-1.5 sm:gap-2 border-b border-[#eef3fb] dark:border-slate-800">
            {bars.map((b, i) => (
              <div
                key={b.label + i}
                className="group relative flex h-full flex-1 flex-col items-center justify-end"
              >
                {/* Tooltip Hover Callout */}
                <span className="pointer-events-none absolute z-20 opacity-0 group-hover:opacity-100 transition-opacity rounded-md bg-[#0f2257] px-2 py-1 text-[10.5px] font-bold text-white shadow-md whitespace-nowrap bottom-full mb-1">
                  {b.tooltipText}
                </span>

                {/* Badge Tertinggi Tetap */}
                {b.isMax && (
                  <span
                    className="absolute z-10 rounded-md bg-[#ea580c] px-1.5 py-0.5 text-[10px] font-bold text-white shadow-sm shadow-orange-500/20"
                    style={{ bottom: `calc(${b.heightPct}% + 6px)` }}
                  >
                    {b.count}
                  </span>
                )}

                {/* Batang Visual Bar */}
                <div
                  className="w-full max-w-[34px] rounded-full transition-all duration-300 group-hover:brightness-95"
                  style={{
                    height: `${b.heightPct}%`,
                    background: b.isMax
                      ? "#ea580c"
                      : b.count > 0
                      ? "linear-gradient(180deg, #f97316, #fdba74)"
                      : "repeating-linear-gradient(135deg, #fed7aa 0, #fed7aa 3px, #fff7ed 3px, #fff7ed 7px)",
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Sumbu X Label */}
        <div className="ml-8 mt-2 flex justify-between gap-1.5 sm:gap-2 text-[11px] text-[#7b8aa8]">
          {bars.map((d, i) => (
            <span key={i} className="flex-1 text-center truncate">
              {d.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

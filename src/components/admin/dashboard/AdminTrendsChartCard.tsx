"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, Check, Calendar } from "lucide-react";
import { DashboardSubmissionItem } from "./AdminWeeklyAnalyticsCard";

interface AdminTrendsChartCardProps {
  submissions: DashboardSubmissionItem[];
}

type TrendFilterOption = "1_BULAN" | "3_BULAN" | "6_BULAN" | "TAHUN_INI" | "SEMUA";

function createSmoothPath(points: Array<{ x: number; y: number }>): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const cpX1 = p0.x + (p1.x - p0.x) / 2;
    const cpY1 = p0.y;
    const cpX2 = p0.x + (p1.x - p0.x) / 2;
    const cpY2 = p1.y;
    d += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
  }
  return d;
}

export function AdminTrendsChartCard({ submissions }: AdminTrendsChartCardProps) {
  const [filter, setFilter] = useState<TrendFilterOption>("1_BULAN");
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
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

  const filterLabels: Record<TrendFilterOption, string> = {
    "1_BULAN": "Bulan Ini (1 Bulan)",
    "3_BULAN": "3 Bulan Terakhir",
    "6_BULAN": "6 Bulan Terakhir",
    "TAHUN_INI": "Tahun Ini (12 Bulan)",
    "SEMUA": "Semua Periode",
  };

  // Kalkulasi data tren berdasarkan filter
  const {
    monthlyData,
    maxVal,
    yLabels,
    pointsMasuk,
    pointsSelesai,
    lineMasukPath,
    areaMasukPath,
    lineSelesaiPath,
    areaSelesaiPath,
    maxMasukVal,
    maxMasukIndex,
    maxSelesaiVal,
    maxSelesaiIndex,
    xCoords,
    subtitle,
  } = useMemo(() => {
    const now = new Date();
    interface MonthItem {
      label: string;
      fullName: string;
      masuk: number;
      selesai: number;
    }

    const mData: MonthItem[] = [];
    let sub = "Bulan Ini";

    if (filter === "1_BULAN") {
      const monthFullName = now.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
      const monthShortName = now.toLocaleDateString("id-ID", { month: "short" });
      sub = `Bulan Ini (${monthFullName})`;
      const year = now.getFullYear();
      const month = now.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      const weekIntervals = [
        { start: 1, end: 7, label: "Mg 1", full: `Mg 1 (1 - 7 ${monthShortName})` },
        { start: 8, end: 14, label: "Mg 2", full: `Mg 2 (8 - 14 ${monthShortName})` },
        { start: 15, end: 21, label: "Mg 3", full: `Mg 3 (15 - 21 ${monthShortName})` },
        { start: 22, end: 28, label: "Mg 4", full: `Mg 4 (22 - 28 ${monthShortName})` },
        ...(daysInMonth > 28
          ? [{ start: 29, end: daysInMonth, label: "Mg 5", full: `Mg 5 (29 - ${daysInMonth} ${monthShortName})` }]
          : []),
      ];

      for (const interval of weekIntervals) {
        const cStart = new Date(year, month, interval.start, 0, 0, 0, 0);
        const cEnd = new Date(year, month, interval.end, 23, 59, 59, 999);

        const masukCount = submissions.filter((p) => {
          const t = new Date(p.createdAt).getTime();
          return t >= cStart.getTime() && t <= cEnd.getTime();
        }).length;

        const selesaiCount = submissions.filter((p) => {
          const t = new Date(p.createdAt).getTime();
          return p.status === "SELESAI" && t >= cStart.getTime() && t <= cEnd.getTime();
        }).length;

        mData.push({
          label: interval.label,
          fullName: interval.full,
          masuk: masukCount,
          selesai: selesaiCount,
        });
      }
    } else if (filter === "3_BULAN") {
      sub = "3 Bulan Terakhir";
      for (let i = 2; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const mStart = new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
        const mEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);

        const masukCount = submissions.filter((p) => {
          const t = new Date(p.createdAt).getTime();
          return t >= mStart.getTime() && t <= mEnd.getTime();
        }).length;

        const selesaiCount = submissions.filter((p) => {
          const t = new Date(p.createdAt).getTime();
          return p.status === "SELESAI" && t >= mStart.getTime() && t <= mEnd.getTime();
        }).length;

        mData.push({
          label: d.toLocaleDateString("id-ID", { month: "short" }),
          fullName: d.toLocaleDateString("id-ID", { month: "long", year: "numeric" }),
          masuk: masukCount,
          selesai: selesaiCount,
        });
      }
    } else if (filter === "6_BULAN") {
      sub = "6 Bulan Terakhir";
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const mStart = new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
        const mEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);

        const masukCount = submissions.filter((p) => {
          const t = new Date(p.createdAt).getTime();
          return t >= mStart.getTime() && t <= mEnd.getTime();
        }).length;

        const selesaiCount = submissions.filter((p) => {
          const t = new Date(p.createdAt).getTime();
          return p.status === "SELESAI" && t >= mStart.getTime() && t <= mEnd.getTime();
        }).length;

        mData.push({
          label: d.toLocaleDateString("id-ID", { month: "short" }),
          fullName: d.toLocaleDateString("id-ID", { month: "long", year: "numeric" }),
          masuk: masukCount,
          selesai: selesaiCount,
        });
      }
    } else if (filter === "TAHUN_INI") {
      const year = now.getFullYear();
      sub = `Tahun ${year} (Jan - Des)`;
      for (let m = 0; m < 12; m++) {
        const mStart = new Date(year, m, 1, 0, 0, 0, 0);
        const mEnd = new Date(year, m + 1, 0, 23, 59, 59, 999);

        const masukCount = submissions.filter((p) => {
          const t = new Date(p.createdAt).getTime();
          return t >= mStart.getTime() && t <= mEnd.getTime();
        }).length;

        const selesaiCount = submissions.filter((p) => {
          const t = new Date(p.createdAt).getTime();
          return p.status === "SELESAI" && t >= mStart.getTime() && t <= mEnd.getTime();
        }).length;

        const d = new Date(year, m, 1);
        mData.push({
          label: d.toLocaleDateString("id-ID", { month: "short" }),
          fullName: d.toLocaleDateString("id-ID", { month: "long", year: "numeric" }),
          masuk: masukCount,
          selesai: selesaiCount,
        });
      }
    } else {
      // SEMUA PERIODE: Ambil rentang tahun dari data atau minimal 12 bulan terakhir
      sub = "Semua Riwayat";
      const yearsSet = new Set<number>();
      yearsSet.add(now.getFullYear());
      submissions.forEach((p) => {
        yearsSet.add(new Date(p.createdAt).getFullYear());
      });
      const sortedYears = Array.from(yearsSet).sort((a, b) => a - b);

      if (sortedYears.length > 1) {
        // Jika data mencakup beberapa tahun, tampilkan tren per tahun
        sortedYears.forEach((yr) => {
          const yStart = new Date(yr, 0, 1, 0, 0, 0, 0);
          const yEnd = new Date(yr, 11, 31, 23, 59, 59, 999);

          const masukCount = submissions.filter((p) => {
            const t = new Date(p.createdAt).getTime();
            return t >= yStart.getTime() && t <= yEnd.getTime();
          }).length;

          const selesaiCount = submissions.filter((p) => {
            const t = new Date(p.createdAt).getTime();
            return p.status === "SELESAI" && t >= yStart.getTime() && t <= yEnd.getTime();
          }).length;

          mData.push({
            label: String(yr),
            fullName: `Tahun ${yr}`,
            masuk: masukCount,
            selesai: selesaiCount,
          });
        });
      } else {
        // Jika hanya 1 tahun, tampilkan 12 bulan penuh
        const year = sortedYears[0];
        for (let m = 0; m < 12; m++) {
          const mStart = new Date(year, m, 1, 0, 0, 0, 0);
          const mEnd = new Date(year, m + 1, 0, 23, 59, 59, 999);

          const masukCount = submissions.filter((p) => {
            const t = new Date(p.createdAt).getTime();
            return t >= mStart.getTime() && t <= mEnd.getTime();
          }).length;

          const selesaiCount = submissions.filter((p) => {
            const t = new Date(p.createdAt).getTime();
            return p.status === "SELESAI" && t >= mStart.getTime() && t <= mEnd.getTime();
          }).length;

          const d = new Date(year, m, 1);
          mData.push({
            label: d.toLocaleDateString("id-ID", { month: "short" }),
            fullName: d.toLocaleDateString("id-ID", { month: "long", year: "numeric" }),
            masuk: masukCount,
            selesai: selesaiCount,
          });
        }
      }
    }

    const calculatedMaxRaw = Math.max(
      ...mData.map((m) => Math.max(m.masuk, m.selesai)),
      4
    );
    // Genapkan skala atas agar rapi
    const calculatedMax = Math.max(calculatedMaxRaw, 4);

    const labelsY = [
      calculatedMax,
      Math.max(1, Math.round(calculatedMax * 0.75)),
      Math.max(1, Math.round(calculatedMax * 0.5)),
      Math.max(1, Math.round(calculatedMax * 0.25)),
    ];

    const count = mData.length;
    const startX = 80;
    const endX = 680;
    const stepX = count > 1 ? (endX - startX) / (count - 1) : 0;
    const coordsX = mData.map((_, i) => (count > 1 ? startX + i * stepX : (startX + endX) / 2));

    const getY = (val: number) => 220 - (val / calculatedMax) * 160;

    const pMasuk = mData.map((m, i) => ({
      x: coordsX[i],
      y: getY(m.masuk),
      val: m.masuk,
    }));

    const pSelesai = mData.map((m, i) => ({
      x: coordsX[i],
      y: getY(m.selesai),
      val: m.selesai,
    }));

    const lMasuk = createSmoothPath(pMasuk);
    const aMasuk =
      pMasuk.length > 0
        ? `${lMasuk} L ${pMasuk[pMasuk.length - 1].x} 220 L ${pMasuk[0].x} 220 Z`
        : "";

    const lSelesai = createSmoothPath(pSelesai);
    const aSelesai =
      pSelesai.length > 0
        ? `${lSelesai} L ${pSelesai[pSelesai.length - 1].x} 220 L ${pSelesai[0].x} 220 Z`
        : "";

    const mMasukVal = Math.max(...mData.map((m) => m.masuk));
    const mMasukIdx = mData.findIndex((m) => m.masuk === mMasukVal);

    const mSelesaiVal = Math.max(...mData.map((m) => m.selesai));
    const mSelesaiIdx = mData.findIndex((m) => m.selesai === mSelesaiVal);

    return {
      monthlyData: mData,
      maxVal: calculatedMax,
      yLabels: labelsY,
      pointsMasuk: pMasuk,
      pointsSelesai: pSelesai,
      lineMasukPath: lMasuk,
      areaMasukPath: aMasuk,
      lineSelesaiPath: lSelesai,
      areaSelesaiPath: aSelesai,
      maxMasukVal: mMasukVal,
      maxMasukIndex: mMasukIdx,
      maxSelesaiVal: mSelesaiVal,
      maxSelesaiIndex: mSelesaiIdx,
      xCoords: coordsX,
      subtitle: sub,
    };
  }, [submissions, filter]);

  return (
    <div className="rounded-2xl border border-[#e3ecfa] bg-white p-5 dark:border-slate-800 dark:bg-slate-900 xl:col-span-8">
      {/* Header dengan Dropdown Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-sm font-bold text-[#0f2257] dark:text-white">
              Statistik Tren Layanan
            </h2>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 font-medium text-[#f97316]">
                <span className="h-2 w-2 rounded-full bg-[#f97316]" />
                Pengajuan Masuk
              </span>
              <span className="flex items-center gap-1.5 font-medium text-[#1664e8]">
                <span className="h-2 w-2 rounded-full bg-[#1664e8]" />
                Layanan Selesai
              </span>
            </div>
          </div>
          <p className="mt-0.5 text-xs text-[#7b8aa8]">
            {subtitle} • Perbandingan permohonan masuk vs layanan diselesaikan
          </p>
        </div>

        {/* Dropdown Filter Interaktif */}
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

          {/* Menu Dropdown Popover */}
          {isOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-52 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-900/10 dark:border-slate-700 dark:bg-slate-800 z-30 animate-fade-in">
              {(Object.keys(filterLabels) as TrendFilterOption[]).map((key) => {
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

      {/* Area Kurva SVG */}
      <div className="mt-4 w-full overflow-x-auto">
        <div className="min-w-[560px]">
          <svg viewBox="0 0 720 260" className="h-auto w-full select-none overflow-visible">
            <defs>
              {/* Gradasi Oranye untuk Pengajuan Masuk */}
              <linearGradient id="gradient-orange-trend" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f97316" stopOpacity="0.32" />
                <stop offset="60%" stopColor="#fdba74" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#fdba74" stopOpacity="0" />
              </linearGradient>
              {/* Gradasi Biru untuk Layanan Selesai */}
              <linearGradient id="gradient-blue-trend" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1664e8" stopOpacity="0.28" />
                <stop offset="70%" stopColor="#3b82f6" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Garis Grid Horizontal Putus-putus */}
            <line x1="55" y1="60" x2="685" y2="60" stroke="#94a3b8" strokeOpacity="0.25" strokeDasharray="4 4" />
            <line x1="55" y1="100" x2="685" y2="100" stroke="#94a3b8" strokeOpacity="0.25" strokeDasharray="4 4" />
            <line x1="55" y1="140" x2="685" y2="140" stroke="#94a3b8" strokeOpacity="0.25" strokeDasharray="4 4" />
            <line x1="55" y1="180" x2="685" y2="180" stroke="#94a3b8" strokeOpacity="0.25" strokeDasharray="4 4" />
            <line x1="55" y1="220" x2="685" y2="220" stroke="#e2e8f0" strokeOpacity="0.8" />

            {/* Label Sumbu Y */}
            <text x="45" y="64" textAnchor="end" fill="#7b8aa8" fontSize="11" fontWeight="500">
              {yLabels[0]}
            </text>
            <text x="45" y="104" textAnchor="end" fill="#7b8aa8" fontSize="11" fontWeight="500">
              {yLabels[1]}
            </text>
            <text x="45" y="144" textAnchor="end" fill="#7b8aa8" fontSize="11" fontWeight="500">
              {yLabels[2]}
            </text>
            <text x="45" y="184" textAnchor="end" fill="#7b8aa8" fontSize="11" fontWeight="500">
              {yLabels[3]}
            </text>
            <text x="45" y="224" textAnchor="end" fill="#7b8aa8" fontSize="11" fontWeight="500">
              0
            </text>

            {/* Area Fill Oranye */}
            {areaMasukPath && <path d={areaMasukPath} fill="url(#gradient-orange-trend)" />}

            {/* Area Fill Biru */}
            {areaSelesaiPath && <path d={areaSelesaiPath} fill="url(#gradient-blue-trend)" />}

            {/* Garis Kurva Oranye */}
            {lineMasukPath && (
              <path
                d={lineMasukPath}
                fill="none"
                stroke="#f97316"
                strokeWidth="2.5"
                strokeLinecap="round"
                className="transition-all duration-300"
              />
            )}

            {/* Garis Kurva Biru */}
            {lineSelesaiPath && (
              <path
                d={lineSelesaiPath}
                fill="none"
                stroke="#1664e8"
                strokeWidth="2.5"
                strokeLinecap="round"
                className="transition-all duration-300"
              />
            )}

            {/* Titik-titik Interaktif Masuk (Oranye) */}
            {pointsMasuk.map((p, i) => (
              <circle
                key={`masuk-pt-${i}`}
                cx={p.x}
                cy={p.y}
                r={hoveredIdx === i ? 6 : 4}
                fill="#f97316"
                stroke="#ffffff"
                strokeWidth="2"
                className="transition-all cursor-pointer"
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            ))}

            {/* Titik-titik Interaktif Selesai (Biru) */}
            {pointsSelesai.map((p, i) => (
              <circle
                key={`selesai-pt-${i}`}
                cx={p.x}
                cy={p.y}
                r={hoveredIdx === i ? 6 : 4}
                fill="#1664e8"
                stroke="#ffffff"
                strokeWidth="2"
                className="transition-all cursor-pointer"
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            ))}

            {/* Callout Statis Puncak Tertinggi Masuk (bila tidak sedang hover titik lain) */}
            {hoveredIdx === null && maxMasukVal > 0 && maxMasukIndex !== -1 && (
              <g
                className="transition-transform hover:scale-105 pointer-events-none"
                style={{
                  transformOrigin: `${pointsMasuk[maxMasukIndex].x}px ${pointsMasuk[maxMasukIndex].y}px`,
                }}
              >
                <circle
                  cx={pointsMasuk[maxMasukIndex].x}
                  cy={pointsMasuk[maxMasukIndex].y}
                  r="5"
                  fill="#f97316"
                  stroke="#ffffff"
                  strokeWidth="2.5"
                />
                <rect
                  x={pointsMasuk[maxMasukIndex].x - 65}
                  y={Math.max(12, pointsMasuk[maxMasukIndex].y - 38)}
                  width="130"
                  height="24"
                  rx="6"
                  fill="#ea580c"
                />
                <path
                  d={`M ${pointsMasuk[maxMasukIndex].x - 5} ${
                    Math.max(12, pointsMasuk[maxMasukIndex].y - 38) + 24
                  } L ${pointsMasuk[maxMasukIndex].x + 5} ${
                    Math.max(12, pointsMasuk[maxMasukIndex].y - 38) + 24
                  } L ${pointsMasuk[maxMasukIndex].x} ${
                    Math.max(12, pointsMasuk[maxMasukIndex].y - 38) + 30
                  } Z`}
                  fill="#ea580c"
                />
                <text
                  x={pointsMasuk[maxMasukIndex].x}
                  y={Math.max(12, pointsMasuk[maxMasukIndex].y - 38) + 16}
                  fill="#ffffff"
                  fontSize="10"
                  fontWeight="700"
                  textAnchor="middle"
                >
                  Tertinggi Masuk: {maxMasukVal}
                </text>
              </g>
            )}

            {/* Callout Statis Puncak Tertinggi Selesai (bila tidak sedang hover titik lain) */}
            {hoveredIdx === null && maxSelesaiVal > 0 && maxSelesaiIndex !== -1 && (
              <g
                className="transition-transform hover:scale-105 pointer-events-none"
                style={{
                  transformOrigin: `${pointsSelesai[maxSelesaiIndex].x}px ${pointsSelesai[maxSelesaiIndex].y}px`,
                }}
              >
                <circle
                  cx={pointsSelesai[maxSelesaiIndex].x}
                  cy={pointsSelesai[maxSelesaiIndex].y}
                  r="5"
                  fill="#1664e8"
                  stroke="#ffffff"
                  strokeWidth="2.5"
                />
                <rect
                  x={pointsSelesai[maxSelesaiIndex].x - 65}
                  y={Math.max(12, pointsSelesai[maxSelesaiIndex].y - 38)}
                  width="130"
                  height="24"
                  rx="6"
                  fill="#0b55d9"
                />
                <path
                  d={`M ${pointsSelesai[maxSelesaiIndex].x - 5} ${
                    Math.max(12, pointsSelesai[maxSelesaiIndex].y - 38) + 24
                  } L ${pointsSelesai[maxSelesaiIndex].x + 5} ${
                    Math.max(12, pointsSelesai[maxSelesaiIndex].y - 38) + 24
                  } L ${pointsSelesai[maxSelesaiIndex].x} ${
                    Math.max(12, pointsSelesai[maxSelesaiIndex].y - 38) + 30
                  } Z`}
                  fill="#0b55d9"
                />
                <text
                  x={pointsSelesai[maxSelesaiIndex].x}
                  y={Math.max(12, pointsSelesai[maxSelesaiIndex].y - 38) + 16}
                  fill="#ffffff"
                  fontSize="10"
                  fontWeight="700"
                  textAnchor="middle"
                >
                  Tertinggi Selesai: {maxSelesaiVal}
                </text>
              </g>
            )}

            {/* Tooltip Dinamis Saat Titik Dihover */}
            {hoveredIdx !== null && (
              <g className="pointer-events-none animate-fade-in">
                {/* Garis Vertikal Indicator */}
                <line
                  x1={xCoords[hoveredIdx]}
                  y1="50"
                  x2={xCoords[hoveredIdx]}
                  y2="220"
                  stroke="#64748b"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />
                {/* Tooltip Box */}
                <rect
                  x={Math.max(50, Math.min(540, xCoords[hoveredIdx] - 80))}
                  y="20"
                  width="160"
                  height="46"
                  rx="8"
                  fill="#0f2257"
                  className="shadow-xl"
                />
                <text
                  x={Math.max(50, Math.min(540, xCoords[hoveredIdx] - 80)) + 80}
                  y="36"
                  fill="#e2e8f0"
                  fontSize="10"
                  fontWeight="600"
                  textAnchor="middle"
                >
                  {monthlyData[hoveredIdx].fullName}
                </text>
                <text
                  x={Math.max(50, Math.min(540, xCoords[hoveredIdx] - 80)) + 80}
                  y="52"
                  fill="#ffffff"
                  fontSize="10.5"
                  fontWeight="700"
                  textAnchor="middle"
                >
                  <tspan fill="#f97316">Masuk: {monthlyData[hoveredIdx].masuk}</tspan>
                  {"  |  "}
                  <tspan fill="#60a5fa">Selesai: {monthlyData[hoveredIdx].selesai}</tspan>
                </text>
              </g>
            )}

            {/* Label Sumbu X (Bulan / Periode) */}
            {monthlyData.map((m, i) => (
              <text
                key={m.label + i}
                x={xCoords[i]}
                y="244"
                textAnchor="middle"
                fill={hoveredIdx === i ? "#0f2257" : "#7b8aa8"}
                fontSize="11"
                fontWeight={hoveredIdx === i ? "700" : "500"}
                className="transition-colors cursor-pointer"
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {m.label}
              </text>
            ))}
          </svg>
        </div>
      </div>
    </div>
  );
}

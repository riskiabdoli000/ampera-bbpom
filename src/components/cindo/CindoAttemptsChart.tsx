"use client";

import React, { useState } from "react";

interface DataPoint {
  date: string;
  attempts: number;
}

const DEFAULT_DATA: DataPoint[] = [
  { date: "2026-10-21", attempts: 11 },
  { date: "2026-10-22", attempts: 18 },
  { date: "2026-10-23", attempts: 15 },
  { date: "2026-10-24", attempts: 24 },
  { date: "2026-10-25", attempts: 31 },
  { date: "2026-10-26", attempts: 32 },
  { date: "2026-10-27", attempts: 30 },
];

export function CindoAttemptsChart() {
  const [hoveredPoint, setHoveredPoint] = useState<DataPoint | null>(null);

  // SVG dimensions
  const width = 580;
  const height = 220;
  const paddingLeft = 35;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 35;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const maxVal = 32;

  // Compute coordinates for 7 points
  const points = DEFAULT_DATA.map((d, i) => {
    const x = paddingLeft + (i / (DEFAULT_DATA.length - 1)) * chartWidth;
    const y = paddingTop + chartHeight - (d.attempts / maxVal) * chartHeight;
    return { x, y, ...d };
  });

  // Generate smooth cubic bezier SVG path
  const generateSmoothPath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return "";
    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const cx = (p0.x + p1.x) / 2;
      path += ` C ${cx} ${p0.y}, ${cx} ${p1.y}, ${p1.x} ${p1.y}`;
    }
    return path;
  };

  const linePath = generateSmoothPath(points);
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${
    paddingTop + chartHeight
  } L ${points[0].x} ${paddingTop + chartHeight} Z`;

  const yTicks = [32, 24, 16, 8, 0];

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            Quiz Attempts
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Daily quiz attempts over the last week
          </p>
        </div>
        {hoveredPoint && (
          <div className="inline-flex items-center gap-1.5 rounded-lg bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700 dark:bg-teal-950/60 dark:text-teal-300">
            <span>{hoveredPoint.date}:</span>
            <span className="font-extrabold">{hoveredPoint.attempts} attempts</span>
          </div>
        )}
      </div>

      {/* Responsive SVG Chart */}
      <div className="w-full overflow-x-auto">
        <div className="min-w-[480px]">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto overflow-visible select-none"
          >
            <defs>
              <linearGradient id="cindoWaveGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines & Y-Axis Labels */}
            {yTicks.map((tick) => {
              const y = paddingTop + chartHeight - (tick / maxVal) * chartHeight;
              return (
                <g key={tick}>
                  <text
                    x={paddingLeft - 10}
                    y={y + 3}
                    textAnchor="end"
                    className="text-[10px] font-medium fill-slate-400 dark:fill-slate-500"
                  >
                    {tick}
                  </text>
                  <line
                    x1={paddingLeft}
                    y1={y}
                    x2={width - paddingRight}
                    y2={y}
                    stroke="currentColor"
                    className="text-slate-100 dark:text-slate-800/80"
                    strokeDasharray={tick === 0 ? "none" : "3 3"}
                  />
                </g>
              );
            })}

            {/* Area Fill */}
            <path d={areaPath} fill="url(#cindoWaveGradient)" />

            {/* Wave Line */}
            <path
              d={linePath}
              fill="none"
              stroke="#14b8a6"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Points & Hover Interactivity */}
            {points.map((pt, idx) => (
              <g key={idx}>
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={hoveredPoint?.date === pt.date ? "5" : "3.5"}
                  className="fill-white stroke-teal-500 transition-all duration-150 cursor-pointer"
                  strokeWidth="2.5"
                  onMouseEnter={() => setHoveredPoint(pt)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
                {/* X-axis date label */}
                <text
                  x={pt.x}
                  y={height - 10}
                  textAnchor="middle"
                  className="text-[9px] font-medium fill-slate-400 dark:fill-slate-500"
                >
                  {pt.date}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>
    </div>
  );
}

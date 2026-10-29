"use client";

import React from "react";
import { Briefcase, Users, GraduationCap, Download } from "lucide-react";
import { GardaStatBarItem } from "@/app/actions/garda-ampera";

interface GardaDemographicChartsGridProps {
  pekerjaanStats: GardaStatBarItem[];
  genderStats: {
    lakiLaki: number;
    perempuan: number;
    total: number;
    persenLaki: number;
    persenPerempuan: number;
  };
  pendidikanStats: GardaStatBarItem[];
}

// Helper untuk menghitung SVG Arc path
function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return ["M", start.x, start.y, "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y].join(" ");
}

export function GardaDemographicChartsGrid({
  pekerjaanStats,
  genderStats,
  pendidikanStats,
}: GardaDemographicChartsGridProps) {
  // Download handler untuk menyimpan grafik demografi dalam bentuk gambar PNG
  const handleDownloadStats = (type: "pekerjaan" | "gender" | "pendidikan") => {
    try {
      const canvas = document.createElement("canvas");
      const width = 800;
      const height = 540;
      const scale = 2; // Retina 2x

      canvas.width = width * scale;
      canvas.height = height * scale;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.scale(scale, scale);

      // 1. Background Kartu Putih
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(0.75, 0.75, width - 1.5, height - 1.5);

      // 2. Header
      let title = "";
      let subtitle = "";
      let filename = "";

      if (type === "pekerjaan") {
        title = "Tamu Berdasarkan Pekerjaan";
        subtitle = "Distribusi peserta/tamu Garda Ampera berdasarkan jenis pekerjaan";
        filename = "Grafik-Pekerjaan-Garda-Ampera";
      } else if (type === "gender") {
        title = "Tamu Berdasarkan Jenis Kelamin";
        subtitle = "Persentase peserta/tamu Garda Ampera berdasarkan jenis kelamin";
        filename = "Grafik-Gender-Garda-Ampera";
      } else {
        title = "Tamu Berdasarkan Pendidikan Terakhir";
        subtitle = "Distribusi peserta/tamu Garda Ampera berdasarkan jenjang pendidikan";
        filename = "Grafik-Pendidikan-Garda-Ampera";
      }

      // Title
      ctx.fillStyle = "#0f172a";
      ctx.font = "bold 20px Inter, -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
      ctx.fillText(title, 40, 50);

      // Subtitle
      ctx.fillStyle = "#64748b";
      ctx.font = "12px Inter, -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText(subtitle, 40, 72);

      // Header Divider
      ctx.strokeStyle = "#f1f5f9";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(40, 95);
      ctx.lineTo(width - 40, 95);
      ctx.stroke();

      // 3. Render Chart Content
      if (type === "pekerjaan") {
        const startY = 140;
        const rowHeight = 72;
        const barWidthMax = 520;

        pekerjaanStats.forEach((item, idx) => {
          const y = startY + idx * rowHeight;

          // Label
          ctx.fillStyle = "#334155";
          ctx.font = "bold 13px Inter, -apple-system, BlinkMacSystemFont, sans-serif";
          ctx.textAlign = "left";
          ctx.fillText(item.label, 40, y);

          // Count & Percentage
          ctx.fillStyle = "#0f172a";
          ctx.font = "bold 13px Inter, -apple-system, BlinkMacSystemFont, sans-serif";
          ctx.textAlign = "right";
          ctx.fillText(`${item.count} orang (${item.percentage}%)`, 40 + barWidthMax, y);

          // Background Bar
          ctx.fillStyle = "#f1f5f9";
          ctx.fillRect(40, y + 8, barWidthMax, 14);

          // Active Colored Bar
          const activeW = Math.max((item.percentage / 100) * barWidthMax, 10);
          ctx.fillStyle = item.color;
          ctx.fillRect(40, y + 8, activeW, 14);
        });
      } else if (type === "gender") {
        const centerX = 240;
        const centerY = 270;
        const radius = 95;
        const innerRadius = 60;

        const total = genderStats.total || 1;
        const maleAngle = (genderStats.lakiLaki / total) * Math.PI * 2;

        // Male Arc
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, -Math.PI / 2, -Math.PI / 2 + maleAngle);
        ctx.arc(centerX, centerY, innerRadius, -Math.PI / 2 + maleAngle, -Math.PI / 2, true);
        ctx.closePath();
        ctx.fillStyle = "#1877f2";
        ctx.fill();

        // Female Arc
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, -Math.PI / 2 + maleAngle, -Math.PI / 2 + Math.PI * 2);
        ctx.arc(centerX, centerY, innerRadius, -Math.PI / 2 + Math.PI * 2, -Math.PI / 2 + maleAngle, true);
        ctx.closePath();
        ctx.fillStyle = "#e83e8c";
        ctx.fill();

        // Center Total
        ctx.fillStyle = "#64748b";
        ctx.font = "bold 11px Inter, -apple-system, BlinkMacSystemFont, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("TOTAL", centerX, centerY - 10);

        ctx.fillStyle = "#0f172a";
        ctx.font = "900 22px Inter, -apple-system, BlinkMacSystemFont, sans-serif";
        ctx.fillText(genderStats.total.toString(), centerX, centerY + 14);

        // Legend Right
        const legendX = 420;
        // Laki-laki
        ctx.fillStyle = "#1877f2";
        ctx.fillRect(legendX, 230, 16, 16);
        ctx.fillStyle = "#1e293b";
        ctx.font = "bold 14px Inter, -apple-system, BlinkMacSystemFont, sans-serif";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText(`Laki-laki: ${genderStats.lakiLaki} orang (${genderStats.persenLaki}%)`, legendX + 26, 238);

        // Perempuan
        ctx.fillStyle = "#e83e8c";
        ctx.fillRect(legendX, 275, 16, 16);
        ctx.fillStyle = "#1e293b";
        ctx.font = "bold 14px Inter, -apple-system, BlinkMacSystemFont, sans-serif";
        ctx.fillText(`Perempuan: ${genderStats.perempuan} orang (${genderStats.persenPerempuan}%)`, legendX + 26, 283);
      } else {
        // Pendidikan Pie Chart
        const centerX = 240;
        const centerY = 270;
        const radius = 100;

        let startA = -Math.PI / 2;
        pendidikanStats.forEach((item) => {
          const sliceA = (item.percentage / 100) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.arc(centerX, centerY, radius, startA, startA + sliceA);
          ctx.closePath();
          ctx.fillStyle = item.color;
          ctx.fill();
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 2.5;
          ctx.stroke();

          startA += sliceA;
        });

        // Legend Right
        const legendX = 410;
        const legendStartY = 200;
        pendidikanStats.forEach((item, idx) => {
          const y = legendStartY + idx * 38;
          ctx.fillStyle = item.color;
          ctx.fillRect(legendX, y, 16, 16);

          ctx.fillStyle = "#1e293b";
          ctx.font = "bold 13px Inter, -apple-system, BlinkMacSystemFont, sans-serif";
          ctx.textAlign = "left";
          ctx.textBaseline = "middle";
          ctx.fillText(`${item.label}: ${item.count} orang (${item.percentage}%)`, legendX + 26, y + 8);
        });
      }

      // 4. Footer Branding
      ctx.strokeStyle = "#f1f5f9";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(40, height - 55);
      ctx.lineTo(width - 40, height - 55);
      ctx.stroke();

      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
      ctx.font = "11px Inter, -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillStyle = "#94a3b8";
      ctx.fillText("Garda Ampera • Balai Besar Pengawas Obat dan Makanan (BBPOM) di Palembang", 40, height - 30);

      ctx.textAlign = "right";
      const dateStr = new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      ctx.fillText(`Diunduh pada: ${dateStr}`, width - 40, height - 30);

      // Download PNG
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `${filename}-${new Date().toISOString().split("T")[0]}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Gagal mengunduh gambar grafik demografi:", err);
    }
  };

  // Kalkulasi Donut Chart untuk Gender
  const circumference = 2 * Math.PI * 40; // radius 40
  const maleStrokeLength = (genderStats.persenLaki / 100) * circumference;
  const femaleStrokeLength = (genderStats.persenPerempuan / 100) * circumference;

  // Kalkulasi Pie Chart untuk Pendidikan
  let currentAngle = 0;
  const pieSlices = pendidikanStats.map((item) => {
    const sliceAngle = (item.percentage / 100) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;
    currentAngle += sliceAngle;

    // Hitung posisi label persentase di tengah irisan
    const midAngle = startAngle + sliceAngle / 2;
    const labelPos = polarToCartesian(70, 70, 42, midAngle);

    // SVG Slice path
    const startPoint = polarToCartesian(70, 70, 60, endAngle);
    const endPoint = polarToCartesian(70, 70, 60, startAngle);
    const largeArc = sliceAngle > 180 ? 1 : 0;
    const pathD = [
      "M",
      70,
      70,
      "L",
      startPoint.x,
      startPoint.y,
      "A",
      60,
      60,
      0,
      largeArc,
      0,
      endPoint.x,
      endPoint.y,
      "Z",
    ].join(" ");

    return {
      ...item,
      pathD,
      labelPos,
      sliceAngle,
    };
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* ======================================================== */}
      {/* CARD 1: PESERTA BERDASARKAN PEKERJAAN                    */}
      {/* ======================================================== */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xs flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Briefcase className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-extrabold text-navy-900 dark:text-white leading-tight">
                  Peserta Berdasarkan Pekerjaan
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Distribusi peserta berdasarkan jenis pekerjaan
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleDownloadStats("pekerjaan")}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"
              title="Unduh Gambar Grafik Pekerjaan"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>

          {/* Horizontal Progress Bars */}
          <div className="space-y-4 my-2">
            {pekerjaanStats.map((item) => (
              <div key={item.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[170px] sm:max-w-[200px]">
                    {item.label}
                  </span>
                  <span className="font-black text-slate-900 dark:text-white">
                    {item.count}
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.max(item.percentage, 4)}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom scale ticks */}
        <div className="mt-6 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between text-[10px] font-bold text-slate-400">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* CARD 2: PESERTA BERDASARKAN JENIS KELAMIN (DONUT CHART)  */}
      {/* ======================================================== */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xs flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-extrabold text-navy-900 dark:text-white leading-tight">
                  Peserta Berdasarkan Jenis Kelamin
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Persentase Peserta berdasarkan jenis kelamin
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleDownloadStats("gender")}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"
              title="Unduh Gambar Grafik Gender"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>

          {/* Donut Chart and Legend */}
          <div className="flex items-center justify-around gap-4 my-4">
            {/* SVG Donut */}
            <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="16"
                  className="dark:stroke-slate-800"
                />

                {/* Male Segment (Blue) */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#1877f2"
                  strokeWidth="16"
                  strokeDasharray={`${maleStrokeLength} ${circumference}`}
                  strokeDashoffset="0"
                  className="transition-all duration-700"
                />

                {/* Female Segment (Pink) */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#e83e8c"
                  strokeWidth="16"
                  strokeDasharray={`${femaleStrokeLength} ${circumference}`}
                  strokeDashoffset={`-${maleStrokeLength}`}
                  className="transition-all duration-700"
                />
              </svg>

              {/* Center Info Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Total
                </span>
                <span className="text-xl font-black text-navy-900 dark:text-white leading-none mt-0.5">
                  {genderStats.total}
                </span>
              </div>
            </div>

            {/* Legend Right */}
            <div className="space-y-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-[#1877f2] shrink-0" />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Laki-laki
                </span>
                <span className="text-xs font-black text-navy-900 dark:text-white ml-2">
                  {genderStats.lakiLaki}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-[#e83e8c] shrink-0" />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Perempuan
                </span>
                <span className="text-xs font-black text-navy-900 dark:text-white ml-2">
                  {genderStats.perempuan}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Percent Badges */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between text-xs font-bold">
          <span className="text-[#1877f2]">Laki-laki: {genderStats.persenLaki}%</span>
          <span className="text-[#e83e8c]">Perempuan: {genderStats.persenPerempuan}%</span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* CARD 3: PESERTA BERDASARKAN PENDIDIKAN TERAKHIR (PIE)    */}
      {/* ======================================================== */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xs flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-extrabold text-navy-900 dark:text-white leading-tight">
                  Peserta Berdasarkan Pendidikan Terakhir
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Distribusi peserta berdasarkan pendidikan terakhir
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleDownloadStats("pendidikan")}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"
              title="Unduh Gambar Grafik Pendidikan"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>

          {/* Pie Chart and Legend */}
          <div className="flex items-center justify-around gap-4 my-3">
            {/* SVG Pie */}
            <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 140 140">
                {pieSlices.map((slice) => (
                  <g key={slice.label}>
                    <path
                      d={slice.pathD}
                      fill={slice.color}
                      stroke="#ffffff"
                      strokeWidth="2"
                      className="transition-all duration-300 hover:opacity-90 cursor-pointer"
                    />
                    {slice.percentage >= 8 && (
                      <text
                        x={slice.labelPos.x}
                        y={slice.labelPos.y}
                        textAnchor="middle"
                        dominantBaseline="central"
                        className="text-[10px] font-black fill-white pointer-events-none drop-shadow-xs"
                      >
                        {slice.percentage}%
                      </text>
                    )}
                  </g>
                ))}
              </svg>
            </div>

            {/* Legend Right */}
            <div className="space-y-2.5 shrink-0">
              {pendidikanStats.map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 w-16">
                    {item.label}
                  </span>
                  <span className="text-xs font-black text-navy-900 dark:text-white">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom summary text */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] font-medium text-slate-500 text-center">
          Dominasi jenjang pendidikan tertinggi:{" "}
          <strong className="text-brand-orange">
            {pendidikanStats.filter((p) => p.count > 0).slice().sort((a, b) => b.count - a.count)[0]?.label || "Belum ada data"}
          </strong>
        </div>
      </div>
    </div>
  );
}

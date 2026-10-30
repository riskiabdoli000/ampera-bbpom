"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Calendar, RotateCcw, ChevronDown } from "lucide-react";

interface GardaSecondaryFilterCardProps {
  years: string[];
  currentBulan?: string;
  currentTahun?: string;
  currentTanggal?: string;
  onApply: (filters: { secondaryBulan: string; secondaryTahun: string; secondaryTanggal: string }) => void;
  isLoading?: boolean;
}

export function GardaSecondaryFilterCard({
  years,
  currentBulan = "ALL",
  currentTahun = "ALL",
  currentTanggal = "ALL",
  onApply,
  isLoading = false,
}: GardaSecondaryFilterCardProps) {
  const [bulan, setBulan] = useState(currentBulan);
  const [tahun, setTahun] = useState(currentTahun);
  const [tanggal, setTanggal] = useState(currentTanggal);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);

  // Close calendar popover on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setIsDatePickerOpen(false);
      }
    };

    if (isDatePickerOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDatePickerOpen]);

  // Hitung jumlah hari dalam bulan & tahun yang dipilih
  const maxDays = useMemo(() => {
    if (bulan === "ALL") return 31;
    const m = parseInt(bulan, 10);
    const y = tahun !== "ALL" ? parseInt(tahun, 10) : new Date().getFullYear();
    return new Date(y, m, 0).getDate();
  }, [bulan, tahun]);

  const daysList = useMemo(() => {
    return Array.from({ length: maxDays }, (_, i) => i + 1);
  }, [maxDays]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onApply({
      secondaryBulan: bulan,
      secondaryTahun: tahun,
      secondaryTanggal: tanggal,
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xs">
      <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Icon & Title */}
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-orange-50 dark:bg-orange-950/60 border border-orange-200/80 dark:border-orange-900/40 text-brand-orange flex items-center justify-center shrink-0 shadow-2xs">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-navy-900 dark:text-white tracking-tight">
              Filter Grafik Lainnya
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Filter berlaku untuk 3 grafik di bawah ini
            </p>
          </div>
        </div>

        {/* Right: Filters & Action Button */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
          {/* 1. Bulan */}
          <div className="w-full sm:w-36">
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
              Bulan
            </label>
            <select
              value={bulan}
              onChange={(e) => setBulan(e.target.value)}
              className="w-full h-10 px-3 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 font-medium focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-hidden transition-all"
            >
              <option value="ALL">Semua Bulan</option>
              <option value="1">Januari</option>
              <option value="2">Februari</option>
              <option value="3">Maret</option>
              <option value="4">April</option>
              <option value="5">Mei</option>
              <option value="6">Juni</option>
              <option value="7">Juli</option>
              <option value="8">Agustus</option>
              <option value="9">September</option>
              <option value="10">Oktober</option>
              <option value="11">November</option>
              <option value="12">Desember</option>
            </select>
          </div>

          {/* 2. Tahun */}
          <div className="w-full sm:w-32">
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
              Tahun
            </label>
            <select
              value={tahun}
              onChange={(e) => setTahun(e.target.value)}
              className="w-full h-10 px-3 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 font-medium focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-hidden transition-all"
            >
              <option value="ALL">Semua Tahun</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Tanggal (Custom Popover Picker sesuai desain referensi) */}
          <div className="relative w-full sm:w-40" ref={datePickerRef}>
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
              Tanggal
            </label>

            {/* Trigger Button */}
            <button
              type="button"
              onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
              className="w-full h-10 px-3 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 font-medium flex items-center justify-between gap-1.5 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-hidden transition-all cursor-pointer shadow-2xs hover:border-orange-400"
            >
              <span className="truncate">
                {tanggal === "ALL" ? "Semua Tanggal" : `Tanggal ${tanggal}`}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${
                  isDatePickerOpen ? "rotate-180 text-brand-orange" : ""
                }`}
              />
            </button>

            {/* Popover Dropdown Kalender Tanggal */}
            {isDatePickerOpen && (
              <div className="absolute right-0 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 top-full mt-2.5 z-50 w-[285px] sm:w-[305px] bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-2xl shadow-slate-900/15 animate-in fade-in zoom-in-95 duration-150">
                {/* Tombol Utama: Semua Tanggal (Pill Oranye) */}
                <button
                  type="button"
                  onClick={() => {
                    setTanggal("ALL");
                    setIsDatePickerOpen(false);
                  }}
                  className={`w-full py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center ${
                    tanggal === "ALL"
                      ? "bg-gradient-to-r from-[#ff7a1a] to-[#f26a0f] text-white shadow-lg shadow-orange-500/35 hover:brightness-105"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-orange-50 hover:text-brand-orange dark:hover:bg-slate-750"
                  }`}
                >
                  Semua Tanggal
                </button>

                {/* Grid 7 Kolom Tanggal (1-31) */}
                <div className="grid grid-cols-7 gap-y-3.5 gap-x-1 text-center mt-5 mb-1">
                  {daysList.map((d) => {
                    const isSelected = tanggal === d.toString();
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => {
                          setTanggal(d.toString());
                          setIsDatePickerOpen(false);
                        }}
                        className={`w-9 h-9 mx-auto rounded-full text-xs sm:text-sm font-semibold flex items-center justify-center transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#ff7a1a] text-white font-black shadow-md shadow-orange-500/35 scale-110"
                            : "text-slate-800 dark:text-slate-200 hover:bg-orange-50 dark:hover:bg-slate-800 hover:text-brand-orange"
                        }`}
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 4. Tombol Terapkan */}
          <div className="self-end w-full sm:w-auto">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto h-10 px-5 bg-brand-orange hover:bg-[#f26a0f] active:bg-[#d95605] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-orange-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>Terapkan Filter</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

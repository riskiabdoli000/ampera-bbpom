"use client";

import React, { useState } from "react";
import { Filter, RotateCcw } from "lucide-react";
import { GardaDashboardFilterInput } from "@/app/actions/garda-ampera";

interface GardaDashboardFilterCardProps {
  options: {
    pekerjaanList: string[];
    pendidikanList: string[];
    tahunList: string[];
  };
  currentFilter: GardaDashboardFilterInput;
  onApplyFilter: (newFilter: GardaDashboardFilterInput) => void;
  isLoading?: boolean;
}

export function GardaDashboardFilterCard({
  options,
  currentFilter,
  onApplyFilter,
  isLoading = false,
}: GardaDashboardFilterCardProps) {
  const [pekerjaan, setPekerjaan] = useState(currentFilter.pekerjaan || "ALL");
  const [pendidikan, setPendidikan] = useState(currentFilter.pendidikan || "ALL");
  const [jenisKelamin, setJenisKelamin] = useState(currentFilter.jenisKelamin || "ALL");
  const [rentangUmur, setRentangUmur] = useState(currentFilter.rentangUmur || "ALL");
  const [bulan, setBulan] = useState(currentFilter.bulan || "ALL");
  const [tahun, setTahun] = useState(currentFilter.tahun || "ALL");

  const handleApply = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onApplyFilter({
      pekerjaan,
      pendidikan,
      jenisKelamin,
      rentangUmur,
      bulan,
      tahun,
    });
  };

  const handleReset = () => {
    setPekerjaan("ALL");
    setPendidikan("ALL");
    setJenisKelamin("ALL");
    setRentangUmur("ALL");
    setBulan("ALL");
    setTahun("ALL");
    onApplyFilter({
      pekerjaan: "ALL",
      pendidikan: "ALL",
      jenisKelamin: "ALL",
      rentangUmur: "ALL",
      bulan: "ALL",
      tahun: "ALL",
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xs">
      {/* Title */}
      <div className="flex items-center gap-2 mb-4 text-[#ea580c] dark:text-orange-400 font-extrabold text-base">
        <Filter className="w-5 h-5 text-brand-orange" />
        <span>Filter</span>
      </div>

      <form onSubmit={handleApply}>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 sm:gap-4 items-end">
          {/* 1. Pekerjaan */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
              Pekerjaan
            </label>
            <select
              value={pekerjaan}
              onChange={(e) => setPekerjaan(e.target.value)}
              className="w-full h-10 px-3 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 font-medium focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-hidden transition-all truncate"
            >
              <option value="ALL">Semua Pekerjaan</option>
              {options.pekerjaanList.map((job) => (
                <option key={job} value={job}>
                  {job}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Pendidikan Terakhir */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
              Pendidikan Terakhir
            </label>
            <select
              value={pendidikan}
              onChange={(e) => setPendidikan(e.target.value)}
              className="w-full h-10 px-3 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 font-medium focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-hidden transition-all truncate"
            >
              <option value="ALL">Semua Pendidikan</option>
              {options.pendidikanList.map((edu) => (
                <option key={edu} value={edu}>
                  {edu}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Jenis Kelamin */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
              Jenis Kelamin
            </label>
            <select
              value={jenisKelamin}
              onChange={(e) => setJenisKelamin(e.target.value)}
              className="w-full h-10 px-3 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 font-medium focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-hidden transition-all"
            >
              <option value="ALL">Semua Jenis Kelamin</option>
              <option value="Laki-laki">Laki-laki</option>
              <option value="Perempuan">Perempuan</option>
            </select>
          </div>

          {/* 4. Rentang Umur */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
              Rentang Umur
            </label>
            <select
              value={rentangUmur}
              onChange={(e) => setRentangUmur(e.target.value)}
              className="w-full h-10 px-3 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 font-medium focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-hidden transition-all"
            >
              <option value="ALL">Semua Umur</option>
              <option value="<20">&lt; 20 Tahun</option>
              <option value="20-29">20 - 29 Tahun</option>
              <option value="30-39">30 - 39 Tahun</option>
              <option value="40-49">40 - 49 Tahun</option>
              <option value=">=50">≥ 50 Tahun</option>
            </select>
          </div>

          {/* 5. Bulan */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
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

          {/* 6. Tahun */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
              Tahun
            </label>
            <select
              value={tahun}
              onChange={(e) => setTahun(e.target.value)}
              className="w-full h-10 px-3 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 font-medium focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-hidden transition-all"
            >
              <option value="ALL">Semua Tahun</option>
              {options.tahunList.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>

          {/* 7. Action Button */}
          <div className="col-span-2 sm:col-span-1">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 px-4 bg-brand-orange hover:bg-[#f26a0f] active:bg-[#d95605] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-orange-500/20 transition-all cursor-pointer disabled:opacity-50"
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

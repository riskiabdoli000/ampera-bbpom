"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ShieldCheck } from "lucide-react";
import {
  getAdminGardaDashboardAnalyticsAction,
  GardaDashboardAnalyticsData,
  GardaDashboardFilterInput,
} from "@/app/actions/garda-ampera";
import { GardaDashboardFilterCard } from "@/components/admin/garda-ampera/dashboard/GardaDashboardFilterCard";
import { GardaTimeTrendChartCard } from "@/components/admin/garda-ampera/dashboard/GardaTimeTrendChartCard";
import { GardaSecondaryFilterCard } from "@/components/admin/garda-ampera/dashboard/GardaSecondaryFilterCard";
import { GardaDemographicChartsGrid } from "@/components/admin/garda-ampera/dashboard/GardaDemographicChartsGrid";

export default function AdminGardaDashboardPage() {
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<GardaDashboardFilterInput>({
    pekerjaan: "ALL",
    pendidikan: "ALL",
    jenisKelamin: "ALL",
    rentangUmur: "ALL",
    bulan: "ALL",
    tahun: "ALL",
    secondaryBulan: "ALL",
    secondaryTahun: "ALL",
    secondaryTanggal: "ALL",
  });

  const [data, setData] = useState<GardaDashboardAnalyticsData>({
    timeSeries: [
      { monthIndex: 0, monthLabel: "Jan", fullMonthName: "Januari", count: 0 },
      { monthIndex: 1, monthLabel: "Feb", fullMonthName: "Februari", count: 0 },
      { monthIndex: 2, monthLabel: "Mar", fullMonthName: "Maret", count: 0 },
      { monthIndex: 3, monthLabel: "Apr", fullMonthName: "April", count: 0 },
      { monthIndex: 4, monthLabel: "Mei", fullMonthName: "Mei", count: 0 },
      { monthIndex: 5, monthLabel: "Jun", fullMonthName: "Juni", count: 0 },
      { monthIndex: 6, monthLabel: "Jul", fullMonthName: "Juli", count: 0 },
      { monthIndex: 7, monthLabel: "Agu", fullMonthName: "Agustus", count: 0 },
      { monthIndex: 8, monthLabel: "Sep", fullMonthName: "September", count: 0 },
      { monthIndex: 9, monthLabel: "Okt", fullMonthName: "Oktober", count: 0 },
      { monthIndex: 10, monthLabel: "Nov", fullMonthName: "November", count: 0 },
      { monthIndex: 11, monthLabel: "Des", fullMonthName: "Desember", count: 0 },
    ],
    totalFilteredPeserta: 0,
    totalAllPeserta: 0,
    pekerjaanStats: [],
    genderStats: {
      lakiLaki: 0,
      perempuan: 0,
      total: 0,
      persenLaki: 0,
      persenPerempuan: 0,
    },
    pendidikanStats: [],
    options: {
      pekerjaanList: [
        "Pegawai Negeri Sipil / ASN",
        "Pegawai Swasta",
        "Wiraswasta / Usahawan",
        "Mahasiswa / Pelajar",
      ],
      pendidikanList: ["SMA/SMK", "D3", "S1", "S2"],
      tahunList: ["2026", "2025"],
    },
  });

  const fetchData = async (currentFilter: GardaDashboardFilterInput) => {
    setLoading(true);
    try {
      const res = await getAdminGardaDashboardAnalyticsAction(currentFilter);
      setData(res);
    } catch (e) {
      console.error("Gagal memuat analitik dashboard:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(filter);
  }, []);

  const handleApplyMainFilter = (newFilter: GardaDashboardFilterInput) => {
    const merged = { ...filter, ...newFilter };
    setFilter(merged);
    fetchData(merged);
  };

  const handleApplySecondaryFilter = (secondary: {
    secondaryBulan: string;
    secondaryTahun: string;
    secondaryTanggal: string;
  }) => {
    const merged = { ...filter, ...secondary };
    setFilter(merged);
    fetchData(merged);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* ======================================================== */}
      {/* 1. TOP HEADER BANNER DENGAN FOTO HERO2 & GRADASI         */}
      {/* ======================================================== */}
      <div className="bg-[#0b2a6b] dark:bg-[#071d49] rounded-3xl p-6 sm:p-8 text-white relative shadow-lg overflow-hidden border border-blue-900/60 min-h-[145px] flex items-center">
        {/* Foto hero2.png di Kanan dengan gradasi halus menyatu di sebelah kiri */}
        <div className="absolute right-0 top-0 bottom-0 w-full sm:w-[50%] md:w-[45%] lg:w-[40%] h-full z-0 select-none pointer-events-none">
          <Image
            src="/assets-landingpage/hero2.png"
            alt="Hero Garda Ampera"
            fill
            priority
            sizes="(max-width: 640px) 100vw, 40vw"
            className="object-cover object-[80%_center]"
          />
          {/* Gradasi lembut dari sebelah kiri agar gambar menyatu mulus dengan latar biru */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b2a6b] via-[#0b2a6b]/80 to-transparent dark:from-[#071d49] dark:via-[#071d49]/80" />
        </div>

        {/* Konten Teks di Kiri */}
        <div className="relative z-10 max-w-xl sm:max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-sky-200 text-xs font-semibold mb-2.5 backdrop-blur-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-orange" />
            <span>Portal Administrator • Garda Ampera BBPOM di Palembang</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Dashboard Analitik Garda Ampera
          </h1>
          <p className="text-xs sm:text-sm text-blue-100/90 mt-1 leading-relaxed">
            Pantau peserta yang mengikuti Garda Ampera untuk mendapatkan sertifikat secara real-time.
          </p>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. CARD FILTER UTAMA (PEKERJAAN, PENDIDIKAN, UMUR, DLL)  */}
      {/* ======================================================== */}
      <GardaDashboardFilterCard
        options={data.options}
        currentFilter={filter}
        onApplyFilter={handleApplyMainFilter}
        isLoading={loading}
      />

      {/* ======================================================== */}
      {/* 3. GRAFIK UTAMA: JUMLAH TAMU PER WAKTU (BATANG / GARIS)  */}
      {/* ======================================================== */}
      <GardaTimeTrendChartCard
        timeSeries={data.timeSeries}
        totalCount={data.totalFilteredPeserta}
        periodText={
          filter.tahun && filter.tahun !== "ALL"
            ? `Jumlah peserta/tamu berdasarkan periode tahun ${filter.tahun}`
            : "Jumlah peserta/tamu berdasarkan periode yang dipilih"
        }
      />

      {/* ======================================================== */}
      {/* 4. FILTER GRAFIK LAINNYA (BULAN, TAHUN, TANGGAL)         */}
      {/* ======================================================== */}
      <GardaSecondaryFilterCard
        years={data.options.tahunList}
        currentBulan={filter.secondaryBulan}
        currentTahun={filter.secondaryTahun}
        currentTanggal={filter.secondaryTanggal}
        onApply={handleApplySecondaryFilter}
        isLoading={loading}
      />

      {/* ======================================================== */}
      {/* 5. GRID 3 GRAFIK DEMOGRAFI (PEKERJAAN, GENDER, PENDIDIKAN) */}
      {/* ======================================================== */}
      <GardaDemographicChartsGrid
        pekerjaanStats={data.pekerjaanStats}
        genderStats={data.genderStats}
        pendidikanStats={data.pendidikanStats}
      />
    </div>
  );
}

"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Star,
  Users,
  Search,
  Download,
  Eye,
  Trash2,
  AlertCircle,
  CheckCircle2,
  FileSpreadsheet,
  ShieldCheck,
  Globe,
  Award,
  RotateCcw,
  Calendar,
  ChevronDown,
} from "lucide-react";
import { PenilaianItem, PenilaianStats } from "@/app/actions/admin-penilaian";
import { PenilaianDetailModal } from "./PenilaianDetailModal";
import { DeletePenilaianModal } from "./DeletePenilaianModal";
import { exportPenilaianExcel, exportPenilaianPdf } from "./export-penilaian";
import { AdminPagination } from "@/components/admin/AdminPagination";

interface AdminPenilaianClientProps {
  initialList: PenilaianItem[];
  initialStats: PenilaianStats;
}

const BULAN_OPTIONS = [
  { value: "1", label: "Januari" },
  { value: "2", label: "Februari" },
  { value: "3", label: "Maret" },
  { value: "4", label: "April" },
  { value: "5", label: "Mei" },
  { value: "6", label: "Juni" },
  { value: "7", label: "Juli" },
  { value: "8", label: "Agustus" },
  { value: "9", label: "September" },
  { value: "10", label: "Oktober" },
  { value: "11", label: "November" },
  { value: "12", label: "Desember" },
];

const TANGGAL_OPTIONS = Array.from({ length: 31 }, (_, i) => (i + 1).toString());

export function AdminPenilaianClient({
  initialList,
  initialStats,
}: AdminPenilaianClientProps) {
  const [list, setList] = useState<PenilaianItem[]>(initialList);
  const [stats, setStats] = useState<PenilaianStats>(initialStats);

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLayanan, setFilterLayanan] = useState("ALL");
  const [filterBintang, setFilterBintang] = useState("ALL");
  const [filterTahun, setFilterTahun] = useState("ALL");
  const [filterBulan, setFilterBulan] = useState("ALL");
  const [filterTanggal, setFilterTanggal] = useState("ALL");
  const [filterSort, setFilterSort] = useState("NEWEST");
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);

  // Tutup date picker saat klik di luar
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target as Node)
      ) {
        setIsDatePickerOpen(false);
      }
    }
    if (isDatePickerOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDatePickerOpen]);

  // Pagination (Maksimum 10 item per halaman)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modals
  const [detailItem, setDetailItem] = useState<PenilaianItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [deleteItem, setDeleteItem] = useState<PenilaianItem | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Notification Toast
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Ekstrak daftar tahun yang tersedia dari data
  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years = new Set<number>([currentYear]);
    list.forEach((item) => {
      const y = new Date(item.createdAt).getFullYear();
      if (!isNaN(y)) years.add(y);
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [list]);

  // Filter & Search Logic (Teks, Layanan, Bintang, Tahun, Bulan, Tanggal)
  const filteredList = useMemo(() => {
    return list
      .filter((item) => {
        // 1. Search text
        if (searchTerm.trim()) {
          const query = searchTerm.toLowerCase();
          const matchKode = item.pengajuan.kodePengajuan.toLowerCase().includes(query);
          const matchNama = item.pengajuan.tamu.nama.toLowerCase().includes(query);
          const matchInstansi = (
            item.pengajuan.tamu.asalInstansi ||
            item.pengajuan.tamu.alamat ||
            ""
          )
            .toLowerCase()
            .includes(query);
          if (!matchKode && !matchNama && !matchInstansi) return false;
        }

        // 2. Filter Layanan
        if (filterLayanan !== "ALL") {
          if (item.pengajuan.layanan.kode !== filterLayanan) return false;
        }

        // 3. Filter Rating Bintang
        if (filterBintang !== "ALL") {
          if (item.ratingBintang !== parseInt(filterBintang, 10)) return false;
        }

        // 4. Filter Waktu (Tahun, Bulan, Tanggal)
        const itemDate = new Date(item.createdAt);
        if (filterTahun !== "ALL") {
          if (itemDate.getFullYear().toString() !== filterTahun) return false;
        }
        if (filterBulan !== "ALL") {
          if ((itemDate.getMonth() + 1).toString() !== filterBulan) return false;
        }
        if (filterTanggal !== "ALL") {
          if (itemDate.getDate().toString() !== filterTanggal) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (filterSort === "NEWEST") {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (filterSort === "OLDEST") {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        if (filterSort === "RATING_DESC") {
          return b.ratingBintang - a.ratingBintang;
        }
        if (filterSort === "RATING_ASC") {
          return a.ratingBintang - b.ratingBintang;
        }
        return 0;
      });
  }, [
    list,
    searchTerm,
    filterLayanan,
    filterBintang,
    filterTahun,
    filterBulan,
    filterTanggal,
    filterSort,
  ]);

  // Paginated List (Maksimum 10 per page)
  const totalPages = Math.ceil(filteredList.length / itemsPerPage);
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredList.slice(start, start + itemsPerPage);
  }, [filteredList, currentPage]);

  // Handler Hapus Item
  const handleItemDeleted = (deletedId: number) => {
    setList((prev) => {
      const updated = prev.filter((p) => p.id !== deletedId);
      // Recalculate stats
      const total = updated.length;
      let sumBintang = 0;
      let sumKualitasPelayanan = 0;
      let sumManfaatPelayanan = 0;
      let sumKualitasWebsite = 0;
      let sumManfaatWebsite = 0;

      const dist = {
        bintang5: 0,
        bintang4: 0,
        bintang3: 0,
        bintang2: 0,
        bintang1: 0,
      };

      updated.forEach((i) => {
        sumBintang += i.ratingBintang;
        sumKualitasPelayanan += i.kualitasPelayanan;
        sumManfaatPelayanan += i.manfaatPelayanan;
        sumKualitasWebsite += i.kualitasWebsite;
        sumManfaatWebsite += i.manfaatWebsite;

        if (i.ratingBintang === 5) dist.bintang5++;
        else if (i.ratingBintang === 4) dist.bintang4++;
        else if (i.ratingBintang === 3) dist.bintang3++;
        else if (i.ratingBintang === 2) dist.bintang2++;
        else if (i.ratingBintang === 1) dist.bintang1++;
      });

      const avgRating = total > 0 ? Number((sumBintang / total).toFixed(2)) : 0;
      const avgKualitasPel = total > 0 ? Number((sumKualitasPelayanan / total).toFixed(2)) : 0;
      const avgManfaatPel = total > 0 ? Number((sumManfaatPelayanan / total).toFixed(2)) : 0;
      const avgKualitasWeb = total > 0 ? Number((sumKualitasWebsite / total).toFixed(2)) : 0;
      const avgManfaatWeb = total > 0 ? Number((sumManfaatWebsite / total).toFixed(2)) : 0;

      const rerata =
        total > 0
          ? (avgRating + avgKualitasPel + avgManfaatPel + avgKualitasWeb + avgManfaatWeb) / 5
          : 0;
      const skorIkm = Number(((rerata / 5) * 100).toFixed(1));

      let mutu: "A (Sangat Baik)" | "B (Baik)" | "C (Kurang Baik)" | "D (Tidak Baik)" =
        "A (Sangat Baik)";
      if (skorIkm >= 88.31) mutu = "A (Sangat Baik)";
      else if (skorIkm >= 76.61) mutu = "B (Baik)";
      else if (skorIkm >= 65.0) mutu = "C (Kurang Baik)";
      else mutu = "D (Tidak Baik)";

      setStats({
        totalSurvei: total,
        avgRatingBintang: avgRating,
        avgKualitasPelayanan: avgKualitasPel,
        avgManfaatPelayanan: avgManfaatPel,
        avgKualitasWebsite: avgKualitasWeb,
        avgManfaatWebsite: avgManfaatWeb,
        skorIkm,
        mutuPelayanan: mutu,
        distribusiBintang: dist,
      });

      return updated;
    });

    if (detailItem && detailItem.id === deletedId) {
      setIsDetailOpen(false);
      setDetailItem(null);
    }
  };

  const resetFilter = () => {
    setSearchTerm("");
    setFilterLayanan("ALL");
    setFilterBintang("ALL");
    setFilterTahun("ALL");
    setFilterBulan("ALL");
    setFilterTanggal("ALL");
    setFilterSort("NEWEST");
    setIsDatePickerOpen(false);
    setCurrentPage(1);
  };

  const isFiltered =
    searchTerm !== "" ||
    filterLayanan !== "ALL" ||
    filterBintang !== "ALL" ||
    filterTahun !== "ALL" ||
    filterBulan !== "ALL" ||
    filterTanggal !== "ALL" ||
    filterSort !== "NEWEST";

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-up">
      {/* Toast Notifikasi */}
      {notification && (
        <div
          className={`fixed top-5 right-5 z-70 flex items-center gap-2 rounded-2xl px-5 py-3.5 shadow-xl border text-sm font-bold animate-fade-in ${
            notification.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-800"
              : "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950 dark:text-rose-200 dark:border-rose-800"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header Halaman & Tombol Ekspor (HANYA IKON SAJA) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-[#ff7a1a] block">
            EVALUASI KEPUASAN MASYARAKAT
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-navy-900 dark:text-white font-brand mt-0.5">
            Data Penilaian & Indeks IKM
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Hasil survei kepuasan masyarakat terhadap mutu pelayanan petugas dan website AMPERA BBPOM Palembang berdasarkan PermenPAN-RB No. 14 Tahun 2017.
          </p>
        </div>

        {/* Action Buttons: Ekspor Excel & PDF (Hanya Ikon Saja Sesuai Permintaan) */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => exportPenilaianExcel(filteredList, stats)}
            disabled={filteredList.length === 0}
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-emerald-600 hover:bg-emerald-50 hover:border-emerald-300 dark:border-slate-700 dark:bg-slate-800 dark:text-emerald-400 dark:hover:bg-emerald-950/40 shadow-xs transition disabled:opacity-50 cursor-pointer"
            title="Ekspor Laporan ke Excel (.xlsx)"
            aria-label="Ekspor Laporan ke Excel"
          >
            <FileSpreadsheet className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={() => exportPenilaianPdf(filteredList, stats)}
            disabled={filteredList.length === 0}
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-r from-[#ff7a1a] to-[#f26a0f] text-white shadow-cta hover:brightness-105 active:scale-95 transition disabled:opacity-50 cursor-pointer"
            title="Cetak Laporan ke PDF"
            aria-label="Cetak Laporan ke PDF"
          >
            <Download className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* 5 KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Card 1: Total Responden */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Responden
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:bg-blue-500/20">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-navy-900 dark:text-white font-brand">
            {stats.totalSurvei}
          </p>
          <span className="text-[11px] text-slate-400 block truncate">
            Ulasan IKM Masuk
          </span>
        </div>

        {/* Card 2: Rata-Rata Bintang */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Rating Bintang
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 dark:bg-amber-500/20">
              <Star className="h-4 w-4 fill-amber-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <p className="text-2xl sm:text-3xl font-black text-navy-900 dark:text-white font-brand">
              {stats.avgRatingBintang}
            </p>
            <span className="text-xs text-slate-400 font-semibold">/ 5.0</span>
          </div>
          <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold block truncate">
            ★ {stats.distribusiBintang.bintang5} Responden (5★)
          </span>
        </div>

        {/* Card 3: Skor IKM & Mutu */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Skor Mutu IKM
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20">
              <Award className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-brand">
              {stats.skorIkm}
            </p>
            <span className="text-xs text-slate-400 font-semibold">/ 100</span>
          </div>
          <span className="inline-block text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
            {stats.mutuPelayanan}
          </span>
        </div>

        {/* Card 4: Indeks Pelayanan Petugas */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Pelayanan Petugas
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:bg-blue-500/20">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <p className="text-2xl sm:text-3xl font-black text-navy-900 dark:text-white font-brand">
              {stats.avgKualitasPelayanan}
            </p>
            <span className="text-xs text-slate-400 font-semibold">/ 5.0</span>
          </div>
          <span className="text-[11px] text-slate-400 block truncate">
            Manfaat: {stats.avgManfaatPelayanan} / 5.0
          </span>
        </div>

        {/* Card 5: Indeks Website AMPERA */}
        <div className="col-span-2 lg:col-span-1 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Website AMPERA
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Globe className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <p className="text-2xl sm:text-3xl font-black text-navy-900 dark:text-white font-brand">
              {stats.avgKualitasWebsite}
            </p>
            <span className="text-xs text-slate-400 font-semibold">/ 5.0</span>
          </div>
          <span className="text-[11px] text-slate-400 block truncate">
            Manfaat: {stats.avgManfaatWebsite} / 5.0
          </span>
        </div>
      </div>

      {/* Toolbar Filter & Pencarian (Termasuk Filter Tahun, Bulan, Tanggal) */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        {/* Baris 1: Pencarian Teks, Layanan, dan Rating */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari No. Tiket, Nama Pemohon, Instansi..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#ff7a1a] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800/60 dark:text-white transition"
            />
          </div>

          {/* Filter Layanan */}
          <div>
            <select
              value={filterLayanan}
              onChange={(e) => {
                setFilterLayanan(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 focus:border-[#ff7a1a] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800/60 dark:text-white transition cursor-pointer"
            >
              <option value="ALL">Semua Jenis Layanan</option>
              <option value="UJI_CEPAT">Pengujian Cepat</option>
              <option value="INFO">Permintaan Informasi</option>
              <option value="ADUAN">Layanan Pengaduan</option>
              <option value="KIP">Keterbukaan Informasi Publik</option>
            </select>
          </div>

          {/* Filter Rating Bintang */}
          <div>
            <select
              value={filterBintang}
              onChange={(e) => {
                setFilterBintang(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 focus:border-[#ff7a1a] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800/60 dark:text-white transition cursor-pointer"
            >
              <option value="ALL">Semua Rating Bintang</option>
              <option value="5">⭐⭐⭐⭐⭐ (5 Bintang)</option>
              <option value="4">⭐⭐⭐⭐ (4 Bintang)</option>
              <option value="3">⭐⭐⭐ (3 Bintang)</option>
              <option value="2">⭐⭐ (2 Bintang)</option>
              <option value="1">⭐ (1 Bintang)</option>
            </select>
          </div>
        </div>

        {/* Baris 2: Filter Waktu Berdasarkan Tahun, Bulan, Tanggal & Urutan */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          {/* Filter Tahun */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0 w-16">
              Tahun:
            </span>
            <select
              value={filterTahun}
              onChange={(e) => {
                setFilterTahun(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs text-slate-800 focus:border-[#ff7a1a] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800/60 dark:text-white transition cursor-pointer"
            >
              <option value="ALL">Semua Tahun</option>
              {availableYears.map((year) => (
                <option key={year} value={year.toString()}>
                  Tahun {year}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Bulan */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0 w-16">
              Bulan:
            </span>
            <select
              value={filterBulan}
              onChange={(e) => {
                setFilterBulan(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs text-slate-800 focus:border-[#ff7a1a] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800/60 dark:text-white transition cursor-pointer"
            >
              <option value="ALL">Semua Bulan</option>
              {BULAN_OPTIONS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Tanggal (Custom Popover Date Picker Sesuai Referensi Gambar) */}
          <div className="flex items-center gap-2 relative" ref={datePickerRef}>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0 w-16">
              Tanggal:
            </span>
            <button
              type="button"
              onClick={() => setIsDatePickerOpen((prev) => !prev)}
              className="w-full flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs text-slate-800 hover:border-slate-300 focus:border-[#ff7a1a] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800/60 dark:text-white transition cursor-pointer"
              aria-expanded={isDatePickerOpen}
            >
              <span className="font-medium truncate">
                {filterTanggal === "ALL" ? "Semua Tanggal" : `Tanggal ${filterTanggal}`}
              </span>
              <ChevronDown
                className={`h-3.5 w-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${
                  isDatePickerOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Popover Grid Tanggal */}
            {isDatePickerOpen && (
              <div className="absolute top-full left-0 sm:left-auto sm:right-0 mt-2 z-50 w-[270px] sm:w-[285px] rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-700 shadow-2xl p-4 animate-fade-in select-none">
                {/* Tombol Utama: Semua Tanggal (Warna Orange AMPERA) */}
                <button
                  type="button"
                  onClick={() => {
                    setFilterTanggal("ALL");
                    setCurrentPage(1);
                    setIsDatePickerOpen(false);
                  }}
                  className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm text-white transition cursor-pointer flex items-center justify-center tracking-wide bg-gradient-to-r from-[#ff7a1a] to-[#f26a0f] hover:brightness-105 active:scale-[0.99] shadow-cta ${
                    filterTanggal === "ALL"
                      ? "ring-2 ring-orange-300 dark:ring-orange-800"
                      : ""
                  }`}
                >
                  Semua Tanggal
                </button>

                {/* Grid 7 Kolom Tanggal 1 s.d. 31 */}
                <div className="grid grid-cols-7 gap-1 sm:gap-1.5 mt-3.5 text-center">
                  {TANGGAL_OPTIONS.map((day) => {
                    const isSelected = filterTanggal === day;
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => {
                          setFilterTanggal(day);
                          setCurrentPage(1);
                          setIsDatePickerOpen(false);
                        }}
                        className={`h-8 w-8 sm:h-9 sm:w-9 mx-auto flex items-center justify-center rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
                          isSelected
                            ? "bg-gradient-to-r from-[#ff7a1a] to-[#f26a0f] text-white font-bold shadow-xs"
                            : "text-slate-700 dark:text-slate-200 hover:bg-orange-50 dark:hover:bg-slate-800 hover:text-[#ff7a1a] active:scale-95"
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Filter Urutan */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0 w-16">
              Urutan:
            </span>
            <select
              value={filterSort}
              onChange={(e) => setFilterSort(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs text-slate-800 focus:border-[#ff7a1a] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800/60 dark:text-white transition cursor-pointer"
            >
              <option value="NEWEST">Terbaru Diisi</option>
              <option value="OLDEST">Terlama Diisi</option>
              <option value="RATING_DESC">Rating Tertinggi</option>
              <option value="RATING_ASC">Rating Terendah</option>
            </select>
          </div>
        </div>

        {/* Indicator Filter Aktif & Reset */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
          <span>
            Menampilkan <strong>{filteredList.length}</strong> data evaluasi kepuasan masyarakat
          </span>

          {isFiltered && (
            <button
              onClick={resetFilter}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#ea580c] hover:underline cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" /> Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Tabel Data Penilaian (Maksimum 10 baris per halaman) */}
      <div className="rounded-3xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-800/50 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-4 px-4 text-center w-12">No</th>
                <th className="py-4 px-4">Waktu Submit</th>
                <th className="py-4 px-4">Nomor Tiket</th>
                <th className="py-4 px-4">Pemohon & Instansi</th>
                <th className="py-4 px-4">Jenis Layanan</th>
                <th className="py-4 px-4 text-center">Rating</th>
                <th className="py-4 px-4 text-center">Pelayanan</th>
                <th className="py-4 px-4 text-center">Website</th>
                <th className="py-4 px-4 text-center w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {paginatedList.length > 0 ? (
                paginatedList.map((item, idx) => {
                  const nomorUrut = (currentPage - 1) * itemsPerPage + idx + 1;
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition"
                    >
                      {/* No */}
                      <td className="py-3.5 px-4 text-center text-slate-400 font-mono">
                        {nomorUrut}
                      </td>

                      {/* Tanggal */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="text-slate-800 dark:text-slate-200 block font-semibold">
                          {new Date(item.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(item.createdAt).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          WIB
                        </span>
                      </td>

                      {/* Nomor Tiket */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-[#ff7a1a] bg-orange-50 px-2 py-0.5 rounded-md border border-orange-100 dark:bg-orange-950/40 dark:border-orange-900/60 dark:text-orange-300">
                          {item.pengajuan.kodePengajuan}
                        </span>
                      </td>

                      {/* Pemohon & Instansi */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-navy-900 dark:text-white block truncate max-w-[180px]">
                          {item.pengajuan.tamu.nama}
                        </span>
                        <span className="text-[11px] text-slate-400 block truncate max-w-[180px]">
                          {item.pengajuan.tamu.asalInstansi || item.pengajuan.tamu.alamat || "-"}
                        </span>
                      </td>

                      {/* Jenis Layanan */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {item.pengajuan.layanan.nama}
                        </span>
                      </td>

                      {/* Rating Bintang */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-0.5 text-amber-400">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`h-3.5 w-3.5 ${
                                s <= item.ratingBintang
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-slate-200 dark:text-slate-700"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 mt-0.5 block">
                          ({item.ratingBintang}/5)
                        </span>
                      </td>

                      {/* Skor Pelayanan (Kualitas / Manfaat) */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          K: {item.kualitasPelayanan}/5
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          M: {item.manfaatPelayanan}/5
                        </span>
                      </td>

                      {/* Skor Website (Kualitas / Manfaat) */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          K: {item.kualitasWebsite}/5
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          M: {item.manfaatWebsite}/5
                        </span>
                      </td>

                      {/* Aksi */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setDetailItem(item);
                              setIsDetailOpen(true);
                            }}
                            className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:border-[#ff7a1a] hover:text-[#ff7a1a] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 transition cursor-pointer"
                            title="Lihat Detail Penilaian"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setDeleteItem(item);
                              setIsDeleteOpen(true);
                            }}
                            className="flex h-8 w-8 items-center justify-center rounded-xl border border-rose-200 bg-white text-rose-600 hover:bg-rose-50 dark:border-rose-900/60 dark:bg-slate-800 dark:text-rose-400 transition cursor-pointer"
                            title="Hapus Penilaian"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <Star className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-700 mb-2 stroke-1" />
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                      Belum ada data evaluasi kepuasan masyarakat
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {isFiltered
                        ? "Tidak ada hasil yang sesuai dengan kriteria filter Anda."
                        : "Data survei akan otomatis muncul setelah pemohon mengisi kuesioner."}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination (Selalu Tampil Jika Ada Data, Maksimal 10 Baris per Halaman) */}
        {filteredList.length > 0 && (
          <AdminPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredList.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {/* Detail Modal */}
      <PenilaianDetailModal
        item={detailItem}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setDetailItem(null);
        }}
        onDeleteClick={(item) => {
          setIsDetailOpen(false);
          setDeleteItem(item);
          setIsDeleteOpen(true);
        }}
      />

      {/* Delete Modal */}
      <DeletePenilaianModal
        item={deleteItem}
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setDeleteItem(null);
        }}
        onSuccess={handleItemDeleted}
        onNotify={showNotification}
      />
    </div>
  );
}

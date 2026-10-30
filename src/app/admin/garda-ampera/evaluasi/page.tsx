"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import {
  Star,
  Users,
  Search,
  Filter,
  Calendar,
  ChevronDown,
  RotateCcw,
  FileSpreadsheet,
  FileText,
  Eye,
  Trash2,
  X,
  Layers,
  BookOpen,
  HelpCircle,
  ShieldCheck,
  MessageSquareHeart,
  Quote,
  LayoutGrid,
  Table as TableIcon,
  CheckCircle2,
  TrendingUp,
  Award,
} from "lucide-react";
import {
  getAdminGardaEvaluasiAction,
  adminDeletePesertaAction,
  GardaEvaluasiRecord,
  GardaEvaluasiSummaryStats,
} from "@/app/actions/garda-ampera";
import { exportEvaluasiToExcel, exportEvaluasiToPdf } from "./export-evaluasi";
import {
  ToastContainer,
  ConfirmDialogModal,
  ToastItem,
  ConfirmDialogConfig,
  ToastType,
} from "@/components/garda-ampera/GardaNotificationModal";

const MONTHS_LIST = [
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

const DAYS_LIST = Array.from({ length: 31 }, (_, i) => (i + 1).toString());

export default function AdminGardaEvaluasiPage() {
  const [loading, setLoading] = useState(true);
  const [evaluasiList, setEvaluasiList] = useState<GardaEvaluasiRecord[]>([]);
  const [stats, setStats] = useState<GardaEvaluasiSummaryStats>({
    totalResponden: 0,
    rataRataKeseluruhan: 0,
    rataRataKemudahan: 0,
    rataRataMateri: 0,
    rataRataSoal: 0,
    rataRataManfaat: 0,
    persentaseSangatPuas: 0,
    persentasePuas: 0,
    distribusiBintang: {
      bintang5: 0,
      bintang4: 0,
      bintang3: 0,
      bintang2: 0,
      bintang1: 0,
    },
  });

  // Filter & Search State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRating, setFilterRating] = useState<string>("all");
  const [filterTahun, setFilterTahun] = useState<string>("all");
  const [filterBulan, setFilterBulan] = useState<string>("all");
  const [filterTanggal, setFilterTanggal] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"card" | "table">("card");

  // Popover Date Picker
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);

  // Modal Detail
  const [selectedItem, setSelectedItem] = useState<GardaEvaluasiRecord | null>(null);

  // Toast & Confirm Dialog State
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [confirmConfig, setConfirmConfig] = useState<ConfirmDialogConfig | null>(null);

  const showToast = (title: string, message?: string, type: ToastType = "info") => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 6);
    setToasts((prev) => [...prev, { id, title, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const showConfirm = (params: {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: "danger" | "warning" | "info";
    onConfirm: () => void | Promise<void>;
  }) => {
    setConfirmConfig({
      isOpen: true,
      title: params.title,
      message: params.message,
      confirmText: params.confirmText,
      cancelText: params.cancelText,
      type: params.type || "danger",
      onCancel: () => setConfirmConfig(null),
      onConfirm: async () => {
        setConfirmConfig((prev) => (prev ? { ...prev, isLoading: true } : null));
        try {
          await params.onConfirm();
        } finally {
          setConfirmConfig(null);
        }
      },
    });
  };

  // Close date picker popover on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setIsDatePickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getAdminGardaEvaluasiAction();
      setEvaluasiList(res.evaluasiList);
      setStats(res.stats);
    } catch (err) {
      console.error("Gagal mengambil data evaluasi Garda Ampera:", err);
      showToast("Gagal Memuat Data", "Terjadi kesalahan saat memuat data evaluasi.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Available Years
  const availableYears = useMemo(() => {
    const yearsSet = new Set<string>();
    const currentYear = new Date().getFullYear().toString();
    yearsSet.add(currentYear);

    evaluasiList.forEach((e) => {
      if (e.tanggalTes || e.createdAt) {
        const d = new Date(e.tanggalTes || e.createdAt);
        if (!isNaN(d.getTime())) {
          yearsSet.add(d.getFullYear().toString());
        }
      }
    });

    return Array.from(yearsSet).sort((a, b) => b.localeCompare(a));
  }, [evaluasiList]);

  // Filtering Logic
  const filteredList = useMemo(() => {
    return evaluasiList.filter((e) => {
      const query = searchTerm.toLowerCase();
      const matchSearch =
        searchTerm.trim() === "" ||
        e.nama.toLowerCase().includes(query) ||
        e.nik.includes(searchTerm) ||
        e.instansi.toLowerCase().includes(query) ||
        e.pekerjaan.toLowerCase().includes(query) ||
        (e.kritikSaran && e.kritikSaran.toLowerCase().includes(query));

      const matchRating =
        filterRating === "all"
          ? true
          : Math.round(e.rataRata).toString() === filterRating;

      const itemDate = new Date(e.tanggalTes || e.createdAt);
      const isValidDate = !isNaN(itemDate.getTime());

      const matchTahun =
        filterTahun === "all"
          ? true
          : isValidDate && itemDate.getFullYear().toString() === filterTahun;

      const matchBulan =
        filterBulan === "all"
          ? true
          : isValidDate && (itemDate.getMonth() + 1).toString() === filterBulan;

      const matchTanggal =
        filterTanggal === "all"
          ? true
          : isValidDate && itemDate.getDate().toString() === filterTanggal;

      return matchSearch && matchRating && matchTahun && matchBulan && matchTanggal;
    });
  }, [evaluasiList, searchTerm, filterRating, filterTahun, filterBulan, filterTanggal]);

  const isFilterActive =
    searchTerm.trim() !== "" ||
    filterRating !== "all" ||
    filterTahun !== "all" ||
    filterBulan !== "all" ||
    filterTanggal !== "all";

  const handleResetFilter = () => {
    setSearchTerm("");
    setFilterRating("all");
    setFilterTahun("all");
    setFilterBulan("all");
    setFilterTanggal("all");
    setIsDatePickerOpen(false);
  };

  // Export handlers
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const handleExportExcel = async () => {
    setIsExportingExcel(true);
    try {
      const exportData = isFilterActive ? filteredList : evaluasiList;
      if (exportData.length === 0) {
        showToast("Tidak Ada Data", "Tidak ada data evaluasi yang sesuai filter untuk diekspor.", "error");
        return;
      }

      await exportEvaluasiToExcel(exportData, stats);
      showToast(
        "Ekspor Excel Berhasil",
        `Laporan rekapitulasi evaluasi (${exportData.length} data) berhasil diunduh.`,
        "success"
      );
    } catch (err: any) {
      showToast("Gagal Ekspor", err.message || "Terjadi kesalahan saat mengekspor Excel.", "error");
    } finally {
      setIsExportingExcel(false);
    }
  };

  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    try {
      const exportData = isFilterActive ? filteredList : evaluasiList;
      if (exportData.length === 0) {
        showToast("Tidak Ada Data", "Tidak ada data evaluasi yang sesuai filter untuk diekspor.", "error");
        return;
      }

      await exportEvaluasiToPdf(exportData, stats);
      showToast(
        "Ekspor PDF Berhasil",
        `Laporan PDF evaluasi (${exportData.length} data) berhasil diunduh.`,
        "success"
      );
    } catch (err: any) {
      showToast("Gagal Ekspor", err.message || "Terjadi kesalahan saat mengekspor PDF.", "error");
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Delete participant/evaluation
  const handleDeletePeserta = (item: GardaEvaluasiRecord) => {
    showConfirm({
      title: "Hapus Data Evaluasi Peserta?",
      message: `Apakah Anda yakin ingin menghapus data peserta "${item.nama}" (NIK: ${item.nik}) beserta hasil evaluasinya? Tindakan ini permanen.`,
      confirmText: "Ya, Hapus Data",
      cancelText: "Batal",
      type: "danger",
      onConfirm: async () => {
        try {
          const res = await adminDeletePesertaAction(item.pesertaId);
          if (res.success) {
            showToast("Data Berhasil Dihapus", res.message || "Data evaluasi peserta berhasil dihapus.", "success");
            setSelectedItem(null);
            fetchData();
          } else {
            showToast("Gagal Menghapus", res.message || "Gagal menghapus data evaluasi.", "error");
          }
        } catch (err: any) {
          showToast("Gagal Menghapus", err.message, "error");
        }
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Title & Export Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-orange">
              SURVEI & EVALUASI SISTEM
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-xs font-semibold text-slate-500">
              PROGRAM GARDA AMPERA
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 dark:text-white">
            Hasil Evaluasi Peserta
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Monitoring indeks kepuasan, analisis 4 pilar materi pembelajaran, serta masukan konstruktif masyarakat terhadap program e-learning Garda Ampera.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Ekspor Excel */}
          <button
            type="button"
            onClick={handleExportExcel}
            disabled={isExportingExcel}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02] cursor-pointer disabled:opacity-60"
            title="Unduh Rekapitulasi Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{isExportingExcel ? "Menyiapkan Excel..." : "Unduh Excel (.xlsx)"}</span>
          </button>

          {/* Ekspor PDF */}
          <button
            type="button"
            onClick={handleExportPdf}
            disabled={isExportingPdf}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition-all hover:scale-[1.02] cursor-pointer disabled:opacity-60"
            title="Unduh Laporan Resmi PDF (.pdf)"
          >
            <FileText className="w-4 h-4" />
            <span>{isExportingPdf ? "Menyiapkan PDF..." : "Unduh PDF (.pdf)"}</span>
          </button>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards (5 Kartu) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Card 1: Rata-rata Keseluruhan */}
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-4 text-white shadow-lg shadow-orange-500/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-100">
                Indeks Kepuasan
              </span>
              <Award className="w-4 h-4 text-amber-200" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-black">{stats.rataRataKeseluruhan}</span>
              <span className="text-xs text-amber-100 font-semibold">/ 5.0</span>
            </div>
            <div className="flex items-center gap-1 mt-1 text-amber-200">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-3.5 h-3.5 ${
                    star <= Math.round(stats.rataRataKeseluruhan)
                      ? "fill-white text-white"
                      : "text-amber-200/50"
                  }`}
                />
              ))}
            </div>
          </div>
          <div className="pt-3 mt-3 border-t border-white/20 flex items-center justify-between text-[11px] text-amber-100 font-medium">
            <span>{stats.totalResponden} Responden</span>
            <span className="font-bold text-white bg-black/20 px-2 py-0.5 rounded-full text-[10px]">
              {stats.persentasePuas}% Puas
            </span>
          </div>
        </div>

        {/* Card 2: Pilar 1 - Kemudahan */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                1. Antarmuka
              </span>
              <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Layers className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-2xl font-black text-navy-900 dark:text-white">
                {stats.rataRataKemudahan}
              </span>
              <span className="text-xs text-slate-400">/ 5.0</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
              Kemudahan Navigasi
            </p>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-3">
            <div
              className="bg-blue-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${(stats.rataRataKemudahan / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Card 3: Pilar 2 - Materi */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                2. Kualitas Materi
              </span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <BookOpen className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-2xl font-black text-navy-900 dark:text-white">
                {stats.rataRataMateri}
              </span>
              <span className="text-xs text-slate-400">/ 5.0</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
              Kejelasan Slide Modul
            </p>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-3">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${(stats.rataRataMateri / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Card 4: Pilar 3 - Bobot Soal */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                3. Bobot Soal
              </span>
              <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <HelpCircle className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-2xl font-black text-navy-900 dark:text-white">
                {stats.rataRataSoal}
              </span>
              <span className="text-xs text-slate-400">/ 5.0</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
              Relevansi Soal Asesmen
            </p>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-3">
            <div
              className="bg-indigo-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${(stats.rataRataSoal / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Card 5: Pilar 4 - Manfaat */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                4. Manfaat Program
              </span>
              <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-2xl font-black text-navy-900 dark:text-white">
                {stats.rataRataManfaat}
              </span>
              <span className="text-xs text-slate-400">/ 5.0</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
              Dampak Edukasi &amp; Literasi
            </p>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-3">
            <div
              className="bg-purple-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${(stats.rataRataManfaat / 5) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3. Distribusi Bintang & Karakteristik Responden Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Distribusi Bintang Responden */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-navy-900 dark:text-white flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                Distribusi Kepuasan Responden
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Persentase responden berdasarkan skala bintang 1 sampai 5
              </p>
            </div>
            <span className="text-xs font-bold text-slate-400">
              {stats.totalResponden} Evaluasi Masuk
            </span>
          </div>

          <div className="space-y-2.5">
            {[
              { star: 5, label: "5 Bintang (Sangat Puas)", count: stats.distribusiBintang.bintang5, color: "bg-emerald-500" },
              { star: 4, label: "4 Bintang (Puas)", count: stats.distribusiBintang.bintang4, color: "bg-blue-500" },
              { star: 3, label: "3 Bintang (Cukup)", count: stats.distribusiBintang.bintang3, color: "bg-amber-500" },
              { star: 2, label: "2 Bintang (Kurang)", count: stats.distribusiBintang.bintang2, color: "bg-orange-500" },
              { star: 1, label: "1 Bintang (Sangat Kurang)", count: stats.distribusiBintang.bintang1, color: "bg-rose-500" },
            ].map((row) => {
              const pct = stats.totalResponden > 0 ? Math.round((row.count / stats.totalResponden) * 100) : 0;
              return (
                <div key={row.star} className="flex items-center gap-3 text-xs">
                  <div className="w-36 text-slate-600 dark:text-slate-300 font-medium truncate shrink-0">
                    {row.label}
                  </div>
                  <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`${row.color} h-full rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="w-20 text-right text-slate-500 font-mono text-[11px] shrink-0">
                    <strong>{row.count}</strong> ({pct}%)
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Ringkasan Insight & Komitmen Mutu */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/40 text-amber-700 dark:text-amber-300 text-[10px] font-bold mb-3">
              <MessageSquareHeart className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              KOMITMEN PELAYANAN BBPOM
            </div>
            <h4 className="text-base font-extrabold text-navy-900 dark:text-white leading-snug">
              Analisis Umpan Balik Peserta E-Learning
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Seluruh kritik dan saran yang disampaikan peserta digunakan sebagai dasar perbaikan berkelanjutan materi edukasi, pemutakhiran bank soal, dan keandalan sistem Garda Ampera.
            </p>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-3 text-center">
            <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 rounded-xl p-3">
              <p className="text-[10px] uppercase font-bold text-slate-400">Sangat Puas (≥4.5)</p>
              <p className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">{stats.persentaseSangatPuas}%</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 rounded-xl p-3">
              <p className="text-[10px] uppercase font-bold text-slate-400">Total Masukan</p>
              <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {evaluasiList.filter((e) => e.kritikSaran && e.kritikSaran.trim().length > 0).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Filter Bar & View Mode Toggle */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama, NIK, instansi, kritik & masukan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all placeholder:text-slate-400"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Controls Group */}
          <div className="flex flex-wrap items-center gap-2">
            {/* 1. Rating Bintang Filter */}
            <div className="flex items-center gap-1.5">
              <select
                value={filterRating}
                onChange={(e) => setFilterRating(e.target.value)}
                className="h-10 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer transition-all"
              >
                <option value="all">Semua Rating</option>
                <option value="5">★ 5 Bintang (Sangat Puas)</option>
                <option value="4">★ 4 Bintang (Puas)</option>
                <option value="3">★ 3 Bintang (Cukup)</option>
                <option value="2">★ 2 Bintang (Kurang)</option>
                <option value="1">★ 1 Bintang (Sangat Kurang)</option>
              </select>
            </div>

            {/* 2. Tahun Filter */}
            <div className="flex items-center gap-1.5">
              <select
                value={filterTahun}
                onChange={(e) => setFilterTahun(e.target.value)}
                className="h-10 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer transition-all"
              >
                <option value="all">Semua Tahun</option>
                {availableYears.map((year) => (
                  <option key={year} value={year}>
                    Tahun {year}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Bulan Filter */}
            <div className="flex items-center gap-1.5">
              <select
                value={filterBulan}
                onChange={(e) => setFilterBulan(e.target.value)}
                className="h-10 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer transition-all"
              >
                <option value="all">Semua Bulan</option>
                {MONTHS_LIST.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Tanggal Filter (Popover Grid 7-Kolom) */}
            <div className="relative" ref={datePickerRef}>
              <button
                type="button"
                onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                className={`h-10 px-3 rounded-xl border text-xs font-medium flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all cursor-pointer ${
                  filterTanggal !== "all"
                    ? "border-orange-500 bg-orange-50/60 dark:bg-orange-950/30 text-brand-orange font-bold"
                    : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-orange-400"
                }`}
              >
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  {filterTanggal === "all" ? "Semua Tanggal" : `Tanggal ${filterTanggal}`}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                    isDatePickerOpen ? "rotate-180 text-brand-orange" : ""
                  }`}
                />
              </button>

              {/* Popover Dropdown Kalender Tanggal */}
              {isDatePickerOpen && (
                <div className="absolute right-0 top-full mt-2 z-50 w-[285px] sm:w-[305px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-2xl shadow-slate-900/15 animate-in fade-in zoom-in-95 duration-150">
                  <button
                    type="button"
                    onClick={() => {
                      setFilterTanggal("all");
                      setIsDatePickerOpen(false);
                    }}
                    className={`w-full py-2.5 px-4 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center ${
                      filterTanggal === "all"
                        ? "bg-gradient-to-r from-[#ff7a1a] to-[#f26a0f] text-white shadow-md shadow-orange-500/35 hover:brightness-105"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-orange-50 hover:text-brand-orange dark:hover:bg-slate-750"
                    }`}
                  >
                    Semua Tanggal
                  </button>

                  <div className="grid grid-cols-7 gap-y-2.5 gap-x-1 text-center mt-4 mb-1">
                    {DAYS_LIST.map((d) => {
                      const isSelected = filterTanggal === d;
                      return (
                        <button
                          key={d}
                          type="button"
                          onClick={() => {
                            setFilterTanggal(d);
                            setIsDatePickerOpen(false);
                          }}
                          className={`w-8 h-8 mx-auto rounded-full text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
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

            {/* 5. View Mode Switcher */}
            <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setViewMode("card")}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === "card"
                    ? "bg-white dark:bg-slate-900 text-brand-orange shadow-xs font-bold"
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
                title="Tampilan Feed Kartu Ulasan"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === "table"
                    ? "bg-white dark:bg-slate-900 text-brand-orange shadow-xs font-bold"
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
                title="Tampilan Tabel Rekapitulasi"
              >
                <TableIcon className="w-4 h-4" />
              </button>
            </div>

            {/* 6. Reset Filter Button */}
            {isFilterActive && (
              <button
                type="button"
                onClick={handleResetFilter}
                className="h-10 px-3 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-1.5 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-all cursor-pointer"
                title="Reset semua filter"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Active Filter Indicators & Count */}
        <div className="flex flex-wrap items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span>
              Menampilkan <strong className="text-slate-800 dark:text-slate-200">{filteredList.length}</strong> dari{" "}
              <strong className="text-slate-800 dark:text-slate-200">{evaluasiList.length}</strong> ulasan evaluasi
            </span>
            {isFilterActive && (
              <span className="text-brand-orange font-bold">• Filter aktif</span>
            )}
          </div>
          {isFilterActive && (
            <div className="flex items-center gap-1 flex-wrap mt-1 sm:mt-0">
              {filterRating !== "all" && (
                <span className="px-2 py-0.5 rounded-md bg-slate-150 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-[10px]">
                  Rating: ★ {filterRating} Bintang
                </span>
              )}
              {filterTahun !== "all" && (
                <span className="px-2 py-0.5 rounded-md bg-slate-150 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-[10px]">
                  Tahun: {filterTahun}
                </span>
              )}
              {filterBulan !== "all" && (
                <span className="px-2 py-0.5 rounded-md bg-slate-150 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-[10px]">
                  Bulan: {MONTHS_LIST.find((m) => m.value === filterBulan)?.label}
                </span>
              )}
              {filterTanggal !== "all" && (
                <span className="px-2 py-0.5 rounded-md bg-slate-150 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-[10px]">
                  Tanggal: {filterTanggal}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 5. Konten Evaluasi: Card Feed OR Table View */}
      {filteredList.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center shadow-xs">
          <div className="flex flex-col items-center justify-center space-y-2 max-w-md mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center">
              <MessageSquareHeart className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 mt-2">
              {isFilterActive ? "Tidak Ada Evaluasi yang Cocok" : "Belum Ada Hasil Evaluasi"}
            </h4>
            <p className="text-xs text-slate-400">
              {isFilterActive
                ? "Tidak ditemukan ulasan evaluasi peserta yang memenuhi kriteria pencarian atau tanggal yang dipilih."
                : "Belum ada peserta yang menyelesaikan tahapan asesmen dan mengisi formulir evaluasi Garda Ampera."}
            </p>
            {isFilterActive && (
              <button
                type="button"
                onClick={handleResetFilter}
                className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-brand-orange text-xs font-bold hover:bg-orange-100 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filter</span>
              </button>
            )}
          </div>
        </div>
      ) : viewMode === "card" ? (
        /* ===================================================================== */
        /* VIEW 1: FEED KARTU TESTIMONI & ULASAN PESERTA */
        /* ===================================================================== */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredList.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Header Card: User Info & Overall Rating */}
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="min-w-0">
                    <p className="font-extrabold text-sm text-navy-900 dark:text-white truncate">
                      {item.nama}
                    </p>
                    <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                      {item.instansi}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {new Date(item.tanggalTes || item.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/40 text-amber-600 dark:text-amber-400 font-black text-xs">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                      <span>{item.rataRata}</span>
                      <span className="text-[10px] font-normal text-slate-400">/5</span>
                    </div>
                  </div>
                </div>

                {/* 4 Pilar Badges */}
                <div className="grid grid-cols-2 gap-1.5 py-3 text-[10px]">
                  <div className="px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-between">
                    <span className="truncate">Kemudahan:</span>
                    <strong className="text-navy-900 dark:text-white font-mono">{item.ratingKemudahan}★</strong>
                  </div>
                  <div className="px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-between">
                    <span className="truncate">Materi Slide:</span>
                    <strong className="text-navy-900 dark:text-white font-mono">{item.ratingMateri}★</strong>
                  </div>
                  <div className="px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-between">
                    <span className="truncate">Bobot Soal:</span>
                    <strong className="text-navy-900 dark:text-white font-mono">{item.ratingSoal}★</strong>
                  </div>
                  <div className="px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-between">
                    <span className="truncate">Manfaat:</span>
                    <strong className="text-navy-900 dark:text-white font-mono">{item.ratingManfaat}★</strong>
                  </div>
                </div>

                {/* Kritik & Saran Quote Box */}
                <div className="p-3.5 rounded-xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30 relative">
                  <Quote className="w-4 h-4 text-amber-400/60 absolute top-2 right-2" />
                  <p className="text-xs text-slate-700 dark:text-slate-200 italic leading-relaxed line-clamp-4 pr-4">
                    &ldquo;{item.kritikSaran || "Tidak ada kritik atau saran tambahan yang dituliskan."}&rdquo;
                  </p>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="flex items-center justify-between pt-3 mt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
                <span className="text-[11px] font-mono text-slate-400">
                  NIK: {item.nik.slice(0, 6)}******{item.nik.slice(-4)}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedItem(item)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-semibold text-blue-600 dark:text-blue-400 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Detail</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeletePeserta(item)}
                    className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
                    title="Hapus Data"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* ===================================================================== */
        /* VIEW 2: TABEL REKAPITULASI EVALUASI */
        /* ===================================================================== */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-bold">
                <tr>
                  <th className="py-3 px-4">No</th>
                  <th className="py-3 px-4">Peserta &amp; Instansi</th>
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-3 text-center">1. Kemudahan</th>
                  <th className="py-3 px-3 text-center">2. Materi</th>
                  <th className="py-3 px-3 text-center">3. Soal</th>
                  <th className="py-3 px-3 text-center">4. Manfaat</th>
                  <th className="py-3 px-3 text-center">Rata-rata</th>
                  <th className="py-3 px-4">Saran &amp; Masukan</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredList.map((item, idx) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-bold text-slate-400">{idx + 1}</td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-navy-900 dark:text-white">{item.nama}</p>
                      <p className="text-[11px] text-slate-500">{item.instansi}</p>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(item.tanggalTes || item.createdAt).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3.5 px-3 text-center font-bold font-mono text-slate-700 dark:text-slate-300">
                      {item.ratingKemudahan} ★
                    </td>
                    <td className="py-3.5 px-3 text-center font-bold font-mono text-slate-700 dark:text-slate-300">
                      {item.ratingMateri} ★
                    </td>
                    <td className="py-3.5 px-3 text-center font-bold font-mono text-slate-700 dark:text-slate-300">
                      {item.ratingSoal} ★
                    </td>
                    <td className="py-3.5 px-3 text-center font-bold font-mono text-slate-700 dark:text-slate-300">
                      {item.ratingManfaat} ★
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        {item.rataRata}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs text-slate-600 dark:text-slate-300 italic truncate">
                      {item.kritikSaran || "-"}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedItem(item)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-semibold text-blue-600 dark:text-blue-400 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Detail</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePeserta(item)}
                          className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
                          title="Hapus Data"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL DETAIL HASIL EVALUASI PESERTA */}
      {/* ===================================================================== */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-up">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-orange">
                  DETAIL HASIL EVALUASI
                </span>
                <h3 className="text-lg font-extrabold text-navy-900 dark:text-white">
                  {selectedItem.nama}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Biodata Singkat Peserta */}
            <div className="grid grid-cols-2 gap-3 text-xs p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div>
                <p className="text-slate-400">NIK (KTP):</p>
                <p className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {selectedItem.nik}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Instansi / Organisasi:</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  {selectedItem.instansi}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Profesi / Pekerjaan:</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  {selectedItem.pekerjaan}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Tanggal Asesmen:</p>
                <p className="text-slate-800 dark:text-slate-200">
                  {new Date(selectedItem.tanggalTes || selectedItem.createdAt).toLocaleDateString(
                    "id-ID",
                    { day: "numeric", month: "long", year: "numeric" }
                  )}
                </p>
              </div>
            </div>

            {/* 4 Pilar Rating Detail */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Penilaian 4 Pilar Pelayanan:
                </span>
                <span className="text-xs font-black text-amber-500">
                  Rata-rata: {selectedItem.rataRata} / 5.0 ★
                </span>
              </div>

              {[
                { label: "1. Kemudahan Antarmuka & Navigasi", val: selectedItem.ratingKemudahan },
                { label: "2. Kualitas & Kejelasan Materi Slide", val: selectedItem.ratingMateri },
                { label: "3. Bobot & Relevansi Soal Ujian", val: selectedItem.ratingSoal },
                { label: "4. Manfaat & Dampak Program Edukasi", val: selectedItem.ratingManfaat },
              ].map((pilar, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between text-xs"
                >
                  <span className="text-slate-700 dark:text-slate-300 font-medium">{pilar.label}</span>
                  <div className="flex items-center gap-1 text-amber-500 font-bold shrink-0">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= pilar.val ? "fill-amber-400 text-amber-500" : "text-slate-200 dark:text-slate-700"
                        }`}
                      />
                    ))}
                    <span className="ml-1 text-[11px] font-mono text-slate-500">({pilar.val})</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Kritik & Masukan Lengkap */}
            <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-300">
                <Quote className="w-4 h-4 text-amber-600" />
                <span>Kritik, Masukan &amp; Aspirasi Peserta:</span>
              </div>
              <p className="text-slate-700 dark:text-slate-200 italic leading-relaxed pt-1">
                &ldquo;{selectedItem.kritikSaran || "Peserta tidak menyertakan saran atau masukan tertulis."}&rdquo;
              </p>
            </div>

            {/* Modal Actions Footer */}
            <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => handleDeletePeserta(selectedItem)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 font-bold text-xs border border-rose-200 dark:border-rose-900/50 shadow-xs transition-all cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Hapus Data Peserta</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-all cursor-pointer text-center"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Confirmation Dialog Modal */}
      <ConfirmDialogModal config={confirmConfig} />
    </div>
  );
}

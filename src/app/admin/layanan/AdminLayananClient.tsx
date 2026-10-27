"use client";

import React, { useState, useMemo, useTransition, useEffect } from "react";
import {
  ClipboardList,
  Search,
  Plus,
  Edit2,
  Trash2,
  FileText,
  Check,
  XCircle,
  FileStack,
  Clock,
  CheckCircle2,
  Layers,
} from "lucide-react";
import {
  toggleLayananStatusAction,
} from "@/app/actions/admin-layanan";
import { LayananModal, LayananItem } from "./LayananModal";
import { DeleteLayananModal } from "./DeleteLayananModal";

interface AdminLayananClientProps {
  initialData: LayananItem[];
}

export function AdminLayananClient({ initialData }: AdminLayananClientProps) {
  const [layananList, setLayananList] = useState<LayananItem[]>(initialData);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLayanan, setEditingLayanan] = useState<LayananItem | null>(null);

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [layananToDelete, setLayananToDelete] = useState<LayananItem | null>(null);

  // Feedback Banner
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Auto-close feedback banner setelah 5 detik
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => {
        setFeedback(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [, startTransition] = useTransition();

  // Summary Metrics
  const stats = useMemo(() => {
    const total = layananList.length;
    const active = layananList.filter((l) => l.isAktif).length;
    const inactive = total - active;
    const totalSubmissions = layananList.reduce(
      (acc, curr) => acc + (curr._count?.pengajuan ?? 0),
      0
    );
    return { total, active, inactive, totalSubmissions };
  }, [layananList]);

  // Filtered List
  const filteredList = useMemo(() => {
    return layananList.filter((item) => {
      const matchSearch =
        item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.kode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.deskripsi && item.deskripsi.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchStatus =
        statusFilter === "ALL"
          ? true
          : statusFilter === "ACTIVE"
          ? item.isAktif
          : !item.isAktif;

      return matchSearch && matchStatus;
    });
  }, [layananList, searchQuery, statusFilter]);

  // Handlers
  const handleOpenAdd = () => {
    setEditingLayanan(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: LayananItem) => {
    setEditingLayanan(item);
    setIsModalOpen(true);
  };

  const handleOpenDelete = (item: LayananItem) => {
    setLayananToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const handleModalSuccess = (savedItem?: LayananItem) => {
    if (!savedItem) return;

    setLayananList((prev) => {
      const idx = prev.findIndex((l) => l.id === savedItem.id);
      if (idx !== -1) {
        // Update existing item
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          ...savedItem,
          _count: updated[idx]._count, // preserve counts
        };
        return updated;
      } else {
        // Add new item
        return [...prev, { ...savedItem, _count: { pengajuan: 0 } }];
      }
    });

    setFeedback({
      type: "success",
      message: editingLayanan
        ? `Layanan "${savedItem.nama}" berhasil diperbarui.`
        : `Layanan baru "${savedItem.nama}" berhasil ditambahkan.`,
    });
  };

  const handleDeleteSuccess = (deletedId: number) => {
    setLayananList((prev) => prev.filter((l) => l.id !== deletedId));
    setFeedback({
      type: "success",
      message: "Layanan berhasil dihapus dari sistem.",
    });
  };

  const handleQuickToggle = (id: number, currentStatus: boolean, nama: string) => {
    setTogglingId(id);
    startTransition(async () => {
      const res = await toggleLayananStatusAction(id);
      setTogglingId(null);
      if (res.success && res.data) {
        setLayananList((prev) =>
          prev.map((l) => (l.id === id ? { ...l, isAktif: res.data.isAktif } : l))
        );
        setFeedback({
          type: "success",
          message: `Status layanan "${nama}" diubah menjadi ${
            res.data.isAktif ? "Aktif" : "Nonaktif"
          }.`,
        });
      } else {
        setFeedback({
          type: "error",
          message: res.error || "Gagal mengubah status layanan.",
        });
      }
    });
  };


  const getServiceBadgeStyle = (kode: string) => {
    switch (kode) {
      case "UJI_CEPAT":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800";
      case "INFO":
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800";
      case "ADUAN":
        return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800";
      case "KIP":
        return "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800";
      default:
        return "bg-orange-50 text-brand-orange border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 dark:bg-orange-500/15 text-brand-orange shadow-2xs">
              <ClipboardList className="h-6 w-6 stroke-[2.2]" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-navy-900 dark:text-white font-brand">
                Master Data Layanan Publik
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Kelola katalog layanan publik resmi BBPOM Palembang (tambah, edit deskripsi, atur visibilitas, dan hapus).
              </p>
            </div>
          </div>
        </div>

        {/* Action Button: Tambah Layanan */}
        <div className="shrink-0">
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#ff7a1a] to-[#f26a0f] px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-cta hover:brightness-110 transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer whitespace-nowrap"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>Tambah Layanan Baru</span>
          </button>
        </div>
      </div>

      {/* Feedback Toast Banner */}
      {feedback && (
        <div
          className={`flex items-center justify-between p-4 rounded-2xl border text-xs sm:text-sm font-medium animate-fade-in ${
            feedback.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300"
              : "bg-red-50 border-red-200 text-red-800 dark:bg-red-950/40 dark:border-red-800 dark:text-red-300"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === "success" ? (
              <Check className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <XCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-xs font-bold opacity-60 hover:opacity-100 transition-opacity ml-4 cursor-pointer"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Overview Stat Cards (Matching Modern Reference Design) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Layanan (Blue Squircle) */}
        <div className="rounded-3xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none hover:shadow-md transition-all flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#1d68f6] text-white flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/30">
            <Layers className="w-7 h-7 stroke-[2.2]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
              Total Katalog Layanan
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-brand mt-0.5 leading-tight">
              {stats.total}
            </p>
            <div className="flex items-center gap-1.5 mt-1 text-[11px]">
              <span className="font-bold text-[#1d68f6] dark:text-blue-400">Hari Ini</span>
              <span className="text-slate-400 dark:text-slate-500 font-medium">Live Data</span>
            </div>
          </div>
        </div>

        {/* Card 2: Layanan Nonaktif (Orange Squircle) */}
        <div className="rounded-3xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none hover:shadow-md transition-all flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#ff9500] text-white flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/30">
            <Clock className="w-7 h-7 stroke-[2.2]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
              Layanan Nonaktif
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-brand mt-0.5 leading-tight">
              {stats.inactive}
            </p>
            <div className="flex items-center gap-1.5 mt-1 text-[11px]">
              <span className="font-bold text-[#ff9500] dark:text-amber-400">Hari Ini</span>
              <span className="text-slate-400 dark:text-slate-500 font-medium">Live Data</span>
            </div>
          </div>
        </div>

        {/* Card 3: Total Pengajuan Masuk (Blue Squircle) */}
        <div className="rounded-3xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none hover:shadow-md transition-all flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#2563eb] text-white flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/30">
            <FileText className="w-7 h-7 stroke-[2.2]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
              Total Pengajuan Masuk
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-brand mt-0.5 leading-tight">
              {stats.totalSubmissions}
            </p>
            <div className="flex items-center gap-1.5 mt-1 text-[11px]">
              <span className="font-bold text-[#2563eb] dark:text-blue-400">Hari Ini</span>
              <span className="text-slate-400 dark:text-slate-500 font-medium">Live Data</span>
            </div>
          </div>
        </div>

        {/* Card 4: Layanan Aktif (Emerald Squircle) */}
        <div className="rounded-3xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none hover:shadow-md transition-all flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#00c076] text-white flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/30">
            <CheckCircle2 className="w-7 h-7 stroke-[2.2]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
              Layanan Aktif Publik
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-brand mt-0.5 leading-tight">
              {stats.active}
            </p>
            <div className="flex items-center gap-1.5 mt-1 text-[11px]">
              <span className="font-bold text-[#00c076] dark:text-emerald-400">Hari Ini</span>
              <span className="text-slate-400 dark:text-slate-500 font-medium">Live Data</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama, kode unik, atau deskripsi layanan..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-brand-orange focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
            >
              &times;
            </button>
          )}
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setStatusFilter("ALL")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              statusFilter === "ALL"
                ? "bg-white dark:bg-slate-700 text-navy-900 dark:text-white shadow-2xs font-bold"
                : "text-slate-500 hover:text-navy-900 dark:hover:text-white"
            }`}
          >
            Semua ({stats.total})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("ACTIVE")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              statusFilter === "ACTIVE"
                ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-2xs font-bold"
                : "text-slate-500 hover:text-navy-900 dark:hover:text-white"
            }`}
          >
            Aktif ({stats.active})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("INACTIVE")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              statusFilter === "INACTIVE"
                ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 shadow-2xs font-bold"
                : "text-slate-500 hover:text-navy-900 dark:hover:text-white"
            }`}
          >
            Nonaktif ({stats.inactive})
          </button>
        </div>
      </div>

      {/* Master Data Layanan: Table Layout */}
      <div className="rounded-3xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <tr>
                <th className="py-4 px-6 w-16 text-center">No</th>
                <th className="py-4 px-6 whitespace-nowrap">Kode</th>
                <th className="py-4 px-6 min-w-[220px]">Nama Layanan</th>
                <th className="py-4 px-6 min-w-[280px]">Deskripsi</th>
                <th className="py-4 px-6 text-center whitespace-nowrap">Pengajuan</th>
                <th className="py-4 px-6 text-center whitespace-nowrap">Status Publikasi</th>
                <th className="py-4 px-6 text-right whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredList.map((layanan, index) => {
                const isToggling = togglingId === layanan.id;

                return (
                  <tr
                    key={layanan.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Index */}
                    <td className="py-4 px-6 text-center text-xs font-semibold text-slate-400">
                      {index + 1}
                    </td>

                    {/* Kode Layanan */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-lg text-xs font-mono font-bold border tracking-wider ${getServiceBadgeStyle(
                          layanan.kode
                        )}`}
                      >
                        {layanan.kode}
                      </span>
                    </td>

                    {/* Nama Layanan */}
                    <td className="py-4 px-6 font-bold text-navy-900 dark:text-white text-xs sm:text-sm">
                      {layanan.nama}
                    </td>

                    {/* Deskripsi */}
                    <td className="py-4 px-6 text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-md">
                      {layanan.deskripsi ? (
                        <p className="line-clamp-2">{layanan.deskripsi}</p>
                      ) : (
                        <span className="text-slate-400 italic">Tidak ada deskripsi</span>
                      )}
                    </td>

                    {/* Total Pengajuan */}
                    <td className="py-4 px-6 text-center whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-navy-900 dark:text-white">
                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                        {layanan._count?.pengajuan ?? 0}
                      </span>
                    </td>

                    {/* Status Publikasi Switch */}
                    <td className="py-4 px-6 text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-2.5">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={layanan.isAktif}
                          disabled={isToggling}
                          onClick={() =>
                            handleQuickToggle(layanan.id, layanan.isAktif, layanan.nama)
                          }
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 ${
                            layanan.isAktif
                              ? "bg-emerald-500"
                              : "bg-slate-300 dark:bg-slate-700"
                          }`}
                          title={
                            layanan.isAktif
                              ? "Layanan aktif (Klik untuk menonaktifkan)"
                              : "Layanan nonaktif (Klik untuk mengaktifkan)"
                          }
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                              layanan.isAktif ? "translate-x-5" : "translate-x-0"
                            }`}
                          />
                        </button>
                        <span
                          className={`text-xs font-bold ${
                            layanan.isAktif
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-slate-400"
                          }`}
                        >
                          {layanan.isAktif ? "Aktif" : "Nonaktif"}
                        </span>
                      </div>
                    </td>

                    {/* Aksi */}
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(layanan)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:border-brand-orange hover:text-brand-orange transition-all shadow-2xs cursor-pointer"
                          title="Edit Layanan"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenDelete(layanan)}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50/70 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white transition-all shadow-2xs cursor-pointer"
                          title="Hapus Layanan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredList.length === 0 && (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-500/15 text-brand-orange flex items-center justify-center mx-auto mb-3">
              <ClipboardList className="w-6 h-6 stroke-1" />
            </div>
            <h3 className="text-sm font-bold text-navy-900 dark:text-white font-brand">
              Tidak Ada Data Layanan Ditemukan
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              {searchQuery
                ? `Tidak ada layanan yang cocok dengan kata kunci "${searchQuery}". Coba kata kunci lain.`
                : "Belum ada data master layanan di dalam sistem."}
            </p>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="mt-4 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-navy-900 dark:text-white hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Reset Pencarian
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal Add / Edit Layanan (Mounted into document.body via Portal) */}
      <LayananModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
        layananToEdit={editingLayanan}
      />

      {/* Modal Delete Layanan (Mounted into document.body via Portal) */}
      <DeleteLayananModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onSuccess={handleDeleteSuccess}
        layanan={layananToDelete}
      />
    </div>
  );
}

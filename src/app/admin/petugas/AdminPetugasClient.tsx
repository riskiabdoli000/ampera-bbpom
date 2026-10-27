"use client";

import React, { useState, useMemo, useTransition, useEffect } from "react";
import Image from "next/image";
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  Check,
  XCircle,
  Clock,
  CheckCircle2,
  Phone,
  User,
  Camera,
} from "lucide-react";
import {
  PetugasRecord,
  togglePetugasStatusAction,
  LayananOption,
} from "@/app/actions/admin-petugas";
import { PetugasModal } from "./PetugasModal";
import { DeletePetugasModal } from "./DeletePetugasModal";

interface AdminPetugasClientProps {
  initialData: PetugasRecord[];
  layananOptions: LayananOption[];
}

export function AdminPetugasClient({
  initialData,
  layananOptions,
}: AdminPetugasClientProps) {
  const [petugasList, setPetugasList] = useState<PetugasRecord[]>(initialData);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPetugas, setEditingPetugas] = useState<PetugasRecord | null>(null);

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [petugasToDelete, setPetugasToDelete] = useState<PetugasRecord | null>(null);

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
    const total = petugasList.length;
    const active = petugasList.filter((p) => p.isAktif).length;
    const inactive = total - active;
    const withPhoto = petugasList.filter((p) => Boolean(p.fotoUrl)).length;
    return { total, active, inactive, withPhoto };
  }, [petugasList]);

  // Filtered List
  const filteredList = useMemo(() => {
    return petugasList.filter((item) => {
      const matchSearch =
        item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.nip.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.jabatan && item.jabatan.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.layananKode && item.layananKode.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.layananNama && item.layananNama.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.telepon && item.telepon.includes(searchQuery));

      const matchStatus =
        statusFilter === "ALL"
          ? true
          : statusFilter === "ACTIVE"
          ? item.isAktif
          : !item.isAktif;

      return matchSearch && matchStatus;
    });
  }, [petugasList, searchQuery, statusFilter]);

  // Handlers
  const handleOpenAdd = () => {
    setEditingPetugas(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: PetugasRecord) => {
    setEditingPetugas(item);
    setIsModalOpen(true);
  };

  const handleOpenDelete = (item: PetugasRecord) => {
    setPetugasToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const handleModalSuccess = (savedItem: PetugasRecord) => {
    setPetugasList((prev) => {
      const idx = prev.findIndex((p) => p.id === savedItem.id);
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = savedItem;
        return updated;
      } else {
        return [...prev, savedItem];
      }
    });

    setFeedback({
      type: "success",
      message: editingPetugas
        ? `Data petugas "${savedItem.nama}" berhasil diperbarui.`
        : `Petugas baru "${savedItem.nama}" berhasil ditambahkan.`,
    });
  };

  const handleDeleteSuccess = (deletedId: number) => {
    setPetugasList((prev) => prev.filter((p) => p.id !== deletedId));
    setFeedback({
      type: "success",
      message: "Data petugas berhasil dihapus dari sistem.",
    });
  };

  const handleQuickToggle = (id: number, currentStatus: boolean, nama: string) => {
    setTogglingId(id);
    startTransition(async () => {
      const res = await togglePetugasStatusAction(id);
      setTogglingId(null);
      if (res.success && res.data) {
        setPetugasList((prev) =>
          prev.map((p) => (p.id === id ? { ...p, isAktif: res.data.isAktif } : p))
        );
        setFeedback({
          type: "success",
          message: `Status petugas "${nama}" diubah menjadi ${
            res.data.isAktif ? "Aktif" : "Nonaktif"
          }.`,
        });
      } else {
        setFeedback({
          type: "error",
          message: res.error || "Gagal mengubah status petugas.",
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 dark:bg-orange-500/15 text-brand-orange shadow-2xs">
              <Users className="h-6 w-6 stroke-[2.2]" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-navy-900 dark:text-white font-brand">
                Master Data Petugas Pelayanan
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Kelola data profil petugas pelayanan publik BBPOM Palembang (NIP, nama, kontak WhatsApp, foto, dan status tugas).
              </p>
            </div>
          </div>
        </div>

        {/* Action Button: Tambah Petugas */}
        <div className="shrink-0">
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#ff7a1a] to-[#f26a0f] px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-cta hover:brightness-110 transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer whitespace-nowrap"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>Tambah Petugas Baru</span>
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
        {/* Card 1: Total Petugas (Blue Squircle) */}
        <div className="rounded-3xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none hover:shadow-md transition-all flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#1d68f6] text-white flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/30">
            <Users className="w-7 h-7 stroke-[2.2]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
              Total Petugas Terdaftar
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-brand mt-0.5 leading-tight">
              {stats.total}
            </p>
            <div className="flex items-center gap-1.5 mt-1 text-[11px]">
              <span className="font-bold text-[#1d68f6] dark:text-blue-400">Pegawai</span>
              <span className="text-slate-400 dark:text-slate-500 font-medium">BBPOM</span>
            </div>
          </div>
        </div>

        {/* Card 2: Petugas Nonaktif (Orange Squircle) */}
        <div className="rounded-3xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none hover:shadow-md transition-all flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#ff9500] text-white flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/30">
            <Clock className="w-7 h-7 stroke-[2.2]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
              Petugas Nonaktif
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-brand mt-0.5 leading-tight">
              {stats.inactive}
            </p>
            <div className="flex items-center gap-1.5 mt-1 text-[11px]">
              <span className="font-bold text-[#ff9500] dark:text-amber-400">Status</span>
              <span className="text-slate-400 dark:text-slate-500 font-medium">Cuti / Nonaktif</span>
            </div>
          </div>
        </div>

        {/* Card 3: Berfoto Profil (Blue Squircle) */}
        <div className="rounded-3xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none hover:shadow-md transition-all flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#2563eb] text-white flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/30">
            <Camera className="w-7 h-7 stroke-[2.2]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
              Lengkap dengan Foto
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-brand mt-0.5 leading-tight">
              {stats.withPhoto}
            </p>
            <div className="flex items-center gap-1.5 mt-1 text-[11px]">
              <span className="font-bold text-[#2563eb] dark:text-blue-400">Profil</span>
              <span className="text-slate-400 dark:text-slate-500 font-medium">Terverifikasi</span>
            </div>
          </div>
        </div>

        {/* Card 4: Petugas Aktif (Emerald Squircle) */}
        <div className="rounded-3xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none hover:shadow-md transition-all flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#00c076] text-white flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/30">
            <CheckCircle2 className="w-7 h-7 stroke-[2.2]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
              Petugas Aktif Bertugas
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-brand mt-0.5 leading-tight">
              {stats.active}
            </p>
            <div className="flex items-center gap-1.5 mt-1 text-[11px]">
              <span className="font-bold text-[#00c076] dark:text-emerald-400">Siap</span>
              <span className="text-slate-400 dark:text-slate-500 font-medium">Melayani</span>
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
            placeholder="Cari nama petugas, NIP, jabatan, layanan, atau WhatsApp..."
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

      {/* Master Data Petugas: Table Layout */}
      <div className="rounded-3xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <tr>
                <th className="py-4 px-6 w-16 text-center">No</th>
                <th className="py-4 px-6 min-w-[240px]">Petugas Pelayanan</th>
                <th className="py-4 px-6 whitespace-nowrap">NIP Pegawai</th>
                <th className="py-4 px-6 min-w-[190px]">Penugasan Layanan</th>
                <th className="py-4 px-6 min-w-[170px]">Nomor WhatsApp</th>
                <th className="py-4 px-6 text-center whitespace-nowrap">Status Tugas</th>
                <th className="py-4 px-6 text-right whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredList.map((petugas, index) => {
                const isToggling = togglingId === petugas.id;

                return (
                  <tr
                    key={petugas.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Index */}
                    <td className="py-4 px-6 text-center text-xs font-semibold text-slate-400">
                      {index + 1}
                    </td>

                    {/* Petugas Pelayanan (Foto + Nama + Jabatan) */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3.5">
                        {petugas.fotoUrl ? (
                          <div className="relative w-11 h-11 rounded-2xl overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700 shadow-2xs">
                            <Image
                              src={petugas.fotoUrl}
                              alt={petugas.nama}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-800 dark:to-slate-700 text-blue-700 dark:text-blue-300 font-black text-sm flex items-center justify-center shrink-0 border border-blue-200/60 dark:border-slate-600 shadow-2xs">
                            {petugas.nama.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="font-bold text-navy-900 dark:text-white text-xs sm:text-sm">
                            {petugas.nama}
                          </div>
                          {petugas.jabatan ? (
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-xs">
                              {petugas.jabatan}
                            </div>
                          ) : (
                            <div className="text-[11px] text-slate-400 italic mt-0.5">
                              Petugas Ampera BBPOM
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* NIP */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-mono font-bold border tracking-wider bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700">
                        {petugas.nip}
                      </span>
                    </td>

                    {/* Penugasan Layanan */}
                    <td className="py-4 px-6">
                      {petugas.layananKode ? (
                        <div className="inline-flex flex-col gap-0.5">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/70 w-fit">
                            <span className="font-mono text-[11px] font-black tracking-wider uppercase">
                              [{petugas.layananKode}]
                            </span>
                          </span>
                          <span
                            className="text-[11px] text-slate-600 dark:text-slate-400 font-medium truncate max-w-[200px] mt-0.5"
                            title={petugas.layananNama || ""}
                          >
                            {petugas.layananNama || "Layanan Terkait"}
                          </span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200/70 dark:border-slate-700 w-fit">
                          Semua Layanan
                        </span>
                      )}
                    </td>

                    {/* Nomor WhatsApp */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      {petugas.telepon ? (
                        <span className="inline-flex items-center gap-2 text-sm font-mono font-bold text-slate-800 dark:text-slate-200">
                          <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                          <span>{petugas.telepon}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-sm font-semibold">-</span>
                      )}
                    </td>

                    {/* Status Tugas Switch */}
                    <td className="py-4 px-6 text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-2.5">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={petugas.isAktif}
                          disabled={isToggling}
                          onClick={() =>
                            handleQuickToggle(petugas.id, petugas.isAktif, petugas.nama)
                          }
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 ${
                            petugas.isAktif
                              ? "bg-emerald-500"
                              : "bg-slate-300 dark:bg-slate-700"
                          }`}
                          title={
                            petugas.isAktif
                              ? "Petugas aktif (Klik untuk menonaktifkan)"
                              : "Petugas nonaktif (Klik untuk mengaktifkan)"
                          }
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                              petugas.isAktif ? "translate-x-5" : "translate-x-0"
                            }`}
                          />
                        </button>
                        <span
                          className={`text-xs font-bold ${
                            petugas.isAktif
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-slate-400"
                          }`}
                        >
                          {petugas.isAktif ? "Aktif" : "Nonaktif"}
                        </span>
                      </div>
                    </td>

                    {/* Aksi */}
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(petugas)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:border-brand-orange hover:text-brand-orange transition-all shadow-2xs cursor-pointer"
                          title="Edit Petugas"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenDelete(petugas)}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50/70 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white transition-all shadow-2xs cursor-pointer"
                          title="Hapus Petugas"
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
              <Users className="w-6 h-6 stroke-1" />
            </div>
            <h3 className="text-sm font-bold text-navy-900 dark:text-white font-brand">
              Tidak Ada Data Petugas Ditemukan
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              {searchQuery
                ? `Tidak ada petugas yang cocok dengan kata kunci "${searchQuery}". Coba kata kunci lain.`
                : "Belum ada data petugas yang ditambahkan ke sistem. Klik tombol Tambah Petugas Baru di atas."}
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

      {/* Modal Add / Edit Petugas (Mounted into document.body via Portal) */}
      <PetugasModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
        petugasToEdit={editingPetugas}
        layananOptions={layananOptions}
      />

      {/* Modal Delete Petugas (Mounted into document.body via Portal) */}
      <DeletePetugasModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onSuccess={handleDeleteSuccess}
        petugas={petugasToDelete}
      />
    </div>
  );
}

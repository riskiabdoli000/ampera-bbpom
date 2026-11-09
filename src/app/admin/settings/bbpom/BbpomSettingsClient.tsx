"use client";

import React, { useState, useEffect, useTransition } from "react";
import { createPortal } from "react-dom";
import {
  Building2,
  Globe,
  Landmark,
  ExternalLink,
  Plus,
  Edit2,
  Trash2,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Link2,
  Shield,
  Layers,
} from "lucide-react";
import {
  BbpomTautanItem,
  createBbpomTautanAction,
  updateBbpomTautanAction,
  deleteBbpomTautanAction,
  toggleBbpomTautanStatusAction,
  resetToDefaultBbpomTautanAction,
} from "@/app/actions/settings-bbpom";
import { useAdminLoading } from "@/context/AdminLoadingContext";

interface BbpomSettingsClientProps {
  initialList: BbpomTautanItem[];
}

const AVAILABLE_ICONS = [
  { id: "globe", label: "Globe (Global/Pusat)", icon: Globe },
  { id: "landmark", label: "Landmark (Balai Daerah)", icon: Landmark },
  { id: "building", label: "Gedung Kantor", icon: Building2 },
  { id: "link", label: "Tautan Standar", icon: Link2 },
];

function getIconComponent(iconName: string) {
  switch (iconName?.toLowerCase()) {
    case "landmark":
      return Landmark;
    case "building":
      return Building2;
    case "link":
      return Link2;
    case "globe":
    default:
      return Globe;
  }
}

export function BbpomSettingsClient({ initialList }: BbpomSettingsClientProps) {
  const [mounted, setMounted] = useState(false);
  const [list, setList] = useState<BbpomTautanItem[]>(initialList);
  const { showLoading, hideLoading } = useAdminLoading();

  useEffect(() => {
    setMounted(true);
  }, []);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BbpomTautanItem | null>(null);

  // Form State
  const [formJudul, setFormJudul] = useState("");
  const [formDeskripsi, setFormDeskripsi] = useState("");
  const [formUrl, setFormUrl] = useState("");
  const [formIkon, setFormIkon] = useState("globe");
  const [formBadge, setFormBadge] = useState("");
  const [formUrutan, setFormUrutan] = useState(1);
  const [formIsActive, setFormIsActive] = useState(true);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);

  // Delete Confirm State
  const [deletingItem, setDeletingItem] = useState<BbpomTautanItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Reset to Default Confirm State
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Status Toggling State
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [, startTransition] = useTransition();

  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback((prev) => (prev?.message === message ? null : prev));
    }, 6000);
  };

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormJudul("");
    setFormDeskripsi("");
    setFormUrl("https://");
    setFormIkon("globe");
    setFormBadge("");
    setFormUrutan(list.length + 1);
    setFormIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: BbpomTautanItem) => {
    setEditingItem(item);
    setFormJudul(item.judul);
    setFormDeskripsi(item.deskripsi);
    setFormUrl(item.url);
    setFormIkon(item.ikon || "globe");
    setFormBadge(item.badge || "");
    setFormUrutan(item.urutan);
    setFormIsActive(item.isActive);
    setIsModalOpen(true);
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formJudul.trim() || !formUrl.trim()) {
      showFeedback("error", "Judul tautan dan URL web tujuan wajib diisi.");
      return;
    }

    setIsFormSubmitting(true);
    showLoading({
      actionType: "save",
      title: editingItem ? "Menyimpan Perubahan Tautan..." : "Menambahkan Tautan Baru...",
      description: "Sedang memvalidasi dan menyimpan tautan website ke database BBPOM...",
    });

    try {
      if (editingItem) {
        // Edit existing
        const res = await updateBbpomTautanAction(editingItem.id, {
          judul: formJudul,
          deskripsi: formDeskripsi,
          url: formUrl,
          ikon: formIkon,
          badge: formBadge,
          urutan: Number(formUrutan),
          isActive: formIsActive,
        });

        if (res.success && res.data) {
          setList((prev) =>
            prev.map((item) => (item.id === editingItem.id ? res.data! : item))
          );
          showFeedback("success", res.message || "Tautan berhasil diperbarui.");
          setIsModalOpen(false);
        } else {
          showFeedback("error", res.error || "Gagal memperbarui tautan.");
        }
      } else {
        // Create new
        const res = await createBbpomTautanAction({
          judul: formJudul,
          deskripsi: formDeskripsi,
          url: formUrl,
          ikon: formIkon,
          badge: formBadge,
          urutan: Number(formUrutan),
          isActive: formIsActive,
        });

        if (res.success && res.data) {
          setList((prev) => [...prev, res.data!].sort((a, b) => a.urutan - b.urutan));
          showFeedback("success", res.message || "Tautan baru berhasil ditambahkan.");
          setIsModalOpen(false);
        } else {
          showFeedback("error", res.error || "Gagal menambahkan tautan.");
        }
      }
    } catch {
      showFeedback("error", "Terjadi gangguan saat menyimpan ke server.");
    } finally {
      setIsFormSubmitting(false);
      hideLoading();
    }
  };

  const handleToggleStatus = (item: BbpomTautanItem) => {
    setTogglingId(item.id);
    showLoading({
      actionType: "process",
      title: "Mengubah Status Tautan...",
      description: `Sedang memperbarui status aktif tautan "${item.judul}"...`,
    });
    startTransition(async () => {
      try {
        const res = await toggleBbpomTautanStatusAction(item.id);
        if (res.success && res.data) {
          const nextStatus = res.data.isActive;
          setList((prev) =>
            prev.map((i) => (i.id === item.id ? { ...i, isActive: nextStatus } : i))
          );
          showFeedback(
            "success",
            `Tautan "${item.judul}" kini ${nextStatus ? "Aktif" : "Nonaktif"}.`
          );
        } else {
          showFeedback("error", res.error || "Gagal mengubah status.");
        }
      } catch {
        showFeedback("error", "Gagal memperbarui status.");
      } finally {
        setTogglingId(null);
        hideLoading();
      }
    });
  };

  const handleDelete = async () => {
    if (!deletingItem) return;
    setIsDeleting(true);
    showLoading({
      actionType: "delete",
      title: "Menghapus Tautan Website...",
      description: `Sedang menghapus tautan "${deletingItem.judul}" dari sistem BBPOM...`,
    });
    try {
      const res = await deleteBbpomTautanAction(deletingItem.id);
      if (res.success) {
        setList((prev) => prev.filter((i) => i.id !== deletingItem.id));
        showFeedback("success", res.message || "Tautan berhasil dihapus.");
        setDeletingItem(null);
      } else {
        showFeedback("error", res.error || "Gagal menghapus tautan.");
      }
    } catch {
      showFeedback("error", "Terjadi kesalahan saat menghapus tautan.");
    } finally {
      setIsDeleting(false);
      hideLoading();
    }
  };

  const handleResetToDefault = async () => {
    setIsResetting(true);
    showLoading({
      actionType: "reset",
      title: "Mereset Tautan Website...",
      description: "Sedang mengembalikan daftar tautan ke setelan bawaan sistem...",
    });
    try {
      const res = await resetToDefaultBbpomTautanAction();
      if (res.success && res.data) {
        setList(res.data);
        showFeedback("success", res.message || "Tautan berhasil di-reset ke default.");
        setIsResetConfirmOpen(false);
      } else {
        showFeedback("error", res.error || "Gagal mereset ke default.");
      }
    } catch {
      showFeedback("error", "Gagal melakukan reset tautan.");
    } finally {
      setIsResetting(false);
      hideLoading();
    }
  };

  const activeLinks = list.filter((i) => i.isActive);

  return (
    <div className="space-y-6 animate-fade-up">
      {/* 1. Header Page */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-6 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-orange">
            <Building2 className="h-4 w-4" />
            <span>Pengaturan Website • Navigasi BBPOM</span>
          </div>
          <h1 className="mt-1 text-2xl font-black text-[#0f2257] dark:text-white font-brand">
            Pengaturan Tautan Portal BBPOM
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#7b8aa8] dark:text-slate-400">
            Kelola tautan portal eksternal pada menu dropdown BBPOM di navbar publik AMPERA.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsResetConfirmOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-xs transition hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            title="Kembalikan tautan ke 2 pilihan resmi bawaan"
          >
            <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
            <span>Reset ke Default</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#ff8a1f] to-[#f26a0f] px-4 py-2.5 text-xs font-bold text-white shadow-cta transition hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>Tambah Tautan Baru</span>
          </button>
        </div>
      </div>

      {/* 2. Feedback Alert */}
      {feedback && (
        <div
          className={`flex items-start justify-between gap-3 rounded-2xl border p-4 text-xs transition-all animate-fade-in ${
            feedback.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300"
              : "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
            )}
            <span className="font-semibold">{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            ✕
          </button>
        </div>
      )}

      {/* 3. Main Content: List & Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Kiri: Tabel / Daftar Tautan */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl border border-[#e3ecfa] bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-brand-orange" />
                <h3 className="text-sm font-bold text-[#0f2257] dark:text-white">
                  Daftar Tautan Dropdown BBPOM
                </h3>
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-extrabold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {list.length} Tautan
              </span>
            </div>

            {list.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <Building2 className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Belum ada tautan BBPOM
                </p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
                  Klik tombol &quot;Reset ke Default&quot; untuk mengisi otomatis 2 portal resmi BBPOM.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {list.map((item) => {
                  const Icon = getIconComponent(item.ikon);
                  const isToggling = togglingId === item.id;

                  return (
                    <div
                      key={item.id}
                      className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition hover:bg-slate-50/50 dark:hover:bg-slate-800/40 rounded-xl px-2"
                    >
                      <div className="flex items-start gap-3.5 min-w-0">
                        {/* Nomor Urutan & Ikon */}
                        <div className="flex flex-col items-center gap-1 shrink-0">
                          <span className="text-[10px] font-black text-slate-400">
                            #{item.urutan}
                          </span>
                          <span className="w-10 h-10 rounded-xl flex items-center justify-center bg-orange-50 text-brand-orange dark:bg-orange-500/10 dark:text-orange-400 border border-orange-200/60 dark:border-orange-500/20 shadow-xs">
                            <Icon className="w-5 h-5" />
                          </span>
                        </div>

                        {/* Rincian Teks */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-xs sm:text-sm text-[#0f2257] dark:text-white truncate">
                              {item.judul}
                            </h4>
                            {item.badge && (
                              <span className="inline-block rounded-md bg-blue-100 dark:bg-blue-950/60 px-1.5 py-0.5 text-[10px] font-bold text-blue-700 dark:text-blue-300">
                                {item.badge}
                              </span>
                            )}
                            <span
                              className={`inline-block rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                                item.isActive
                                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                                  : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                              }`}
                            >
                              {item.isActive ? "Aktif" : "Nonaktif"}
                            </span>
                          </div>

                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                            {item.deskripsi || "Tanpa deskripsi"}
                          </p>

                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1664e8] dark:text-sky-400 hover:underline mt-1.5"
                          >
                            <span className="truncate max-w-[260px] sm:max-w-md">{item.url}</span>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                        </div>
                      </div>

                      {/* Tombol Aksi */}
                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        {/* Switch Status Toggle */}
                        <button
                          type="button"
                          disabled={isToggling}
                          onClick={() => handleToggleStatus(item)}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            item.isActive ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
                          }`}
                          title={item.isActive ? "Klik untuk menonaktifkan" : "Klik untuk mengaktifkan"}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                              item.isActive ? "translate-x-5" : "translate-x-0"
                            }`}
                          />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(item)}
                          className="p-2 rounded-xl text-slate-500 hover:text-[#1664e8] hover:bg-blue-50 dark:hover:bg-slate-800 transition"
                          title="Edit Tautan"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeletingItem(item)}
                          className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition"
                          title="Hapus Tautan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Kolom Kanan: Pratinjau Langsung (Live Mockup) */}
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-2xl border border-blue-200/80 bg-gradient-to-b from-blue-50/70 to-white p-5 shadow-xs dark:border-blue-900/40 dark:from-slate-900 dark:to-slate-900">
            <div className="flex items-center gap-2 text-xs font-bold text-[#0f2257] dark:text-blue-300 mb-3">
              <Shield className="w-4 h-4 text-brand-orange" />
              <span>Pratinjau Tampilan Navbar</span>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
              Berikut adalah simulasi tampilan panel dropdown BBPOM saat disorot oleh pengunjung website:
            </p>

            {/* Mockup Card */}
            <div className="w-full rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-3 shadow-lg">
              <div className="px-2 pt-1 pb-2 flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-brand-orange">
                <div className="flex items-center gap-1.5">
                  <Building2 className="w-3 h-3" />
                  <span>Portal Resmi BBPOM</span>
                </div>
                <span className="text-[9px] text-slate-400 lowercase font-normal">preview</span>
              </div>

              {activeLinks.length === 0 ? (
                <div className="py-6 text-center text-[11px] text-slate-400">
                  Tidak ada tautan aktif yang akan tampil.
                </div>
              ) : (
                <div className="space-y-1 mt-1">
                  {activeLinks.map((item) => {
                    const Icon = getIconComponent(item.ikon);
                    return (
                      <div
                        key={item.id}
                        className="flex items-start gap-2.5 rounded-xl p-2 bg-slate-50/80 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800"
                      >
                        <span className="mt-0.5 w-7 h-7 shrink-0 rounded-lg flex items-center justify-center bg-orange-50 text-brand-orange dark:bg-orange-500/10 dark:text-orange-400">
                          <Icon className="w-3.5 h-3.5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="block text-xs font-bold text-navy-900 dark:text-white truncate">
                              {item.judul}
                            </span>
                            <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                          </div>
                          <span className="block text-[10.5px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                            {item.deskripsi}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-[11px] text-amber-800 dark:text-amber-300">
              💡 <strong>Tips:</strong> Pengunjung akan langsung dialihkan ke website tujuan di tab baru saat mengklik salah satu menu di atas.
            </div>
          </div>
        </div>
      </div>

      {/* 4. Modal Tambah / Edit Tautan */}
      {mounted && isModalOpen && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
        >
          {/* Fullscreen Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity animate-fade-in"
            onClick={() => {
              if (!isFormSubmitting) setIsModalOpen(false);
            }}
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 bg-white p-6 shadow-2xl dark:bg-slate-900 z-10 my-auto animate-fade-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-50 text-brand-orange flex items-center justify-center">
                  {editingItem ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </div>
                <h3 className="text-base font-bold text-[#0f2257] dark:text-white">
                  {editingItem ? "Edit Tautan BBPOM" : "Tambah Tautan Baru"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                disabled={isFormSubmitting}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="mt-5 space-y-4">
              {/* Judul Tautan */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                  Judul Tautan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formJudul}
                  onChange={(e) => setFormJudul(e.target.value)}
                  placeholder="Contoh: Badan POM RI (Pusat)"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:border-brand-orange focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              {/* Deskripsi */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                  Deskripsi Singkat
                </label>
                <input
                  type="text"
                  value={formDeskripsi}
                  onChange={(e) => setFormDeskripsi(e.target.value)}
                  placeholder="Contoh: Portal Resmi Badan POM Republik Indonesia"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:border-brand-orange focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              {/* URL Tujuan */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                  Alamat URL Web Tujuan <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="url"
                    required
                    value={formUrl}
                    onChange={(e) => setFormUrl(e.target.value)}
                    placeholder="https://www.pom.go.id"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2.5 pl-3.5 pr-9 text-xs font-medium text-slate-800 focus:border-brand-orange focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                  <ExternalLink className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Pilihan Ikon */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                  Pilihan Ikon Tautan
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {AVAILABLE_ICONS.map((opt) => {
                    const IconComp = opt.icon;
                    const isSelected = formIkon === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setFormIkon(opt.id)}
                        className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left text-xs font-semibold transition cursor-pointer ${
                          isSelected
                            ? "border-brand-orange bg-orange-50/80 text-brand-orange dark:bg-orange-500/15"
                            : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                        }`}
                      >
                        <IconComp className="w-4 h-4 shrink-0" />
                        <span className="truncate">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Badge Label */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    Label Badge (Opsional)
                  </label>
                  <input
                    type="text"
                    value={formBadge}
                    onChange={(e) => setFormBadge(e.target.value)}
                    placeholder="Misal: Pusat, Sumsel"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:border-brand-orange focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                {/* Urutan */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    Nomor Urut Tampil
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formUrutan}
                    onChange={(e) => setFormUrutan(parseInt(e.target.value) || 1)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:border-brand-orange focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Status Aktif */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-white">Status Publikasi</p>
                  <p className="text-[11px] text-slate-500">Tampilkan pada menu dropdown website</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormIsActive(!formIsActive)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    formIsActive ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      formIsActive ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Tombol Simpan */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  disabled={isFormSubmitting}
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isFormSubmitting}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#ff8a1f] to-[#f26a0f] px-5 py-2 text-xs font-bold text-white shadow-cta hover:opacity-90 disabled:opacity-50 transition cursor-pointer"
                >
                  {isFormSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>{editingItem ? "Simpan Perubahan" : "Tambahkan Tautan"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* 5. Modal Konfirmasi Hapus */}
      {mounted && deletingItem && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
        >
          {/* Fullscreen Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity animate-fade-in"
            onClick={() => {
              if (!isDeleting) setDeletingItem(null);
            }}
          />

          {/* Dialog Container */}
          <div className="relative w-full max-w-sm rounded-3xl border border-slate-200 dark:border-slate-800 bg-white p-6 shadow-2xl dark:bg-slate-900 text-center z-10 my-auto animate-fade-up">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 mx-auto flex items-center justify-center mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Hapus Tautan BBPOM?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
              Apakah Anda yakin ingin menghapus tautan &quot;{deletingItem.judul}&quot;? Tautan ini tidak akan tampil lagi di navbar website.
            </p>
            <div className="mt-5 flex items-center justify-center gap-2.5">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeletingItem(null)}
                className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDelete}
                className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 transition cursor-pointer"
              >
                {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>Ya, Hapus</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* 6. Modal Konfirmasi Reset ke Default */}
      {mounted && isResetConfirmOpen && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
        >
          {/* Fullscreen Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity animate-fade-in"
            onClick={() => {
              if (!isResetting) setIsResetConfirmOpen(false);
            }}
          />

          {/* Dialog Container */}
          <div className="relative w-full max-w-sm rounded-3xl border border-slate-200 dark:border-slate-800 bg-white p-6 shadow-2xl dark:bg-slate-900 text-center z-10 my-auto animate-fade-up">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center mb-3">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Reset ke Tautan Default?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
              Tindakan ini akan mengatur ulang seluruh tautan dropdown BBPOM menjadi 2 portal resmi bawaan (Badan POM RI Pusat & BBPOM di Palembang).
            </p>
            <div className="mt-5 flex items-center justify-center gap-2.5">
              <button
                type="button"
                disabled={isResetting}
                onClick={() => setIsResetConfirmOpen(false)}
                className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isResetting}
                onClick={handleResetToDefault}
                className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white hover:bg-amber-700 transition cursor-pointer"
              >
                {isResetting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>Ya, Reset Sekarang</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}


"use client";

import React, { useState, useTransition, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  RotateCcw,
  Edit2,
  Trash2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Upload,
  FileText,
  Sparkles,
  Eye,
  Check,
  Image as ImageIcon,
  Shield,
  Layers,
} from "lucide-react";
import {
  MateriEdukasiItemData,
  KomoditasType,
  createMateriEdukasiAction,
  updateMateriEdukasiAction,
  deleteMateriEdukasiAction,
  toggleMateriEdukasiStatusAction,
  resetToDefaultMateriEdukasiAction,
} from "@/app/actions/settings-edukasi";
import { renderFirstPagePdfToBlob } from "@/lib/pdf-thumbnail";
import { EducationPdfModal } from "@/components/landing/EducationPdfModal";

interface EdukasiSettingsFormProps {
  initialItems: MateriEdukasiItemData[];
}

const KOMODITAS_OPTIONS: {
  key: KomoditasType;
  label: string;
  badgeClass: string;
}[] = [
  {
    key: "Pangan",
    label: "Pangan",
    badgeClass:
      "bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60",
  },
  {
    key: "Kosmetik",
    label: "Kosmetik",
    badgeClass:
      "bg-pink-50 text-pink-700 border-pink-200/80 dark:bg-pink-950/40 dark:text-pink-300 dark:border-pink-800/60",
  },
  {
    key: "Obat",
    label: "Obat",
    badgeClass:
      "bg-blue-50 text-blue-700 border-blue-200/80 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60",
  },
  {
    key: "Obat Tradisional",
    label: "Obat Tradisional",
    badgeClass:
      "bg-amber-50 text-amber-800 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60",
  },
];

export function EdukasiSettingsForm({ initialItems }: EdukasiSettingsFormProps) {
  const [mounted, setMounted] = useState(false);
  const [items, setItems] = useState<MateriEdukasiItemData[]>(initialItems);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [filterKomoditas, setFilterKomoditas] = useState<string>("semua");
  const [filterStatus, setFilterStatus] = useState<"semua" | "aktif" | "nonaktif">("semua");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MateriEdukasiItemData | null>(null);

  // Form Input State
  const [formJudul, setFormJudul] = useState("");
  const [formKomoditas, setFormKomoditas] = useState<KomoditasType>("Pangan");
  const [formDeskripsi, setFormDeskripsi] = useState("");
  const [formUrutan, setFormUrutan] = useState(1);
  const [formIsPublished, setFormIsPublished] = useState(true);

  // File Uploads & Live Previews
  const [selectedPdfFile, setSelectedPdfFile] = useState<File | null>(null);
  const [customCoverFile, setCustomCoverFile] = useState<File | null>(null);
  const [generatedCoverBlob, setGeneratedCoverBlob] = useState<Blob | null>(null);
  const [previewCoverUrl, setPreviewCoverUrl] = useState<string>("");
  const [coverSource, setCoverSource] = useState<"existing" | "generated" | "custom">("existing");
  const [isExtractingPdfCover, setIsExtractingPdfCover] = useState(false);

  const pdfInputRef = useRef<HTMLInputElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  // Actions & Feedbacks
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingItem, setDeletingItem] = useState<MateriEdukasiItemData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [previewPdfItem, setPreviewPdfItem] = useState<MateriEdukasiItemData | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );

  const [, startTransition] = useTransition();

  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback((prev) => (prev?.message === message ? null : prev));
    }, 6000);
  };

  // Statistik Ringkasan Komoditas
  const stats = useMemo(() => {
    return {
      total: items.length,
      pangan: items.filter((i) => i.komoditas === "Pangan").length,
      kosmetik: items.filter((i) => i.komoditas === "Kosmetik").length,
      obat: items.filter((i) => i.komoditas === "Obat").length,
      tradisional: items.filter((i) => i.komoditas === "Obat Tradisional").length,
    };
  }, [items]);

  // Filtered Items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // 1. Filter Komoditas
      if (filterKomoditas !== "semua" && item.komoditas !== filterKomoditas) {
        return false;
      }
      // 2. Filter Status Publikasi
      if (filterStatus === "aktif" && !item.isPublished) return false;
      if (filterStatus === "nonaktif" && item.isPublished) return false;

      // 3. Filter Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = item.judul.toLowerCase().includes(q);
        const matchDesc = item.deskripsi.toLowerCase().includes(q);
        const matchKomoditas = item.komoditas.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchKomoditas) return false;
      }

      return true;
    });
  }, [items, filterKomoditas, filterStatus, searchQuery]);

  // Handler Buka Modal Tambah
  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormJudul("");
    setFormKomoditas("Pangan");
    setFormDeskripsi("");
    setFormUrutan(items.length + 1);
    setFormIsPublished(true);
    setSelectedPdfFile(null);
    setCustomCoverFile(null);
    setGeneratedCoverBlob(null);
    setPreviewCoverUrl("/assets-landingpage/layanan/1.jpg");
    setCoverSource("existing");
    if (pdfInputRef.current) pdfInputRef.current.value = "";
    if (imageInputRef.current) imageInputRef.current.value = "";
    setIsModalOpen(true);
  };

  // Handler Buka Modal Edit
  const handleOpenEditModal = (item: MateriEdukasiItemData) => {
    setEditingItem(item);
    setFormJudul(item.judul);
    setFormKomoditas(item.komoditas);
    setFormDeskripsi(item.deskripsi);
    setFormUrutan(item.urutan);
    setFormIsPublished(item.isPublished);
    setSelectedPdfFile(null);
    setCustomCoverFile(null);
    setGeneratedCoverBlob(null);
    setPreviewCoverUrl(item.imageUrl || "/assets-landingpage/layanan/1.jpg");
    setCoverSource("existing");
    if (pdfInputRef.current) pdfInputRef.current.value = "";
    if (imageInputRef.current) imageInputRef.current.value = "";
    setIsModalOpen(true);
  };

  // Handler Pemilihan File PDF & Ekstraksi Otomatis Halaman 1 ke Gambar
  const handlePdfChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
      showFeedback("error", "Berkas materi wajib berformat PDF (.pdf)");
      e.target.value = "";
      return;
    }

    setSelectedPdfFile(file);
    setIsExtractingPdfCover(true);

    try {
      // Ekstraksi Halaman 1 PDF via Canvas
      const result = await renderFirstPagePdfToBlob(file, 1.4);
      setGeneratedCoverBlob(result.blob);
      setPreviewCoverUrl(result.dataUrl);
      setCoverSource("generated");
      // Reset custom cover jika ada
      setCustomCoverFile(null);
      if (imageInputRef.current) imageInputRef.current.value = "";
    } catch (err) {
      console.warn("Gagal mengekstrak halaman 1 PDF secara otomatis:", err);
      // Fallback tetap mengizinkan file PDF tanpa error fatal
    } finally {
      setIsExtractingPdfCover(false);
    }
  };

  // Handler Upload Gambar Cover Kustom Sendiri
  const handleCustomImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showFeedback("error", "Harap pilih berkas gambar yang valid (JPG, PNG, atau WebP)");
      e.target.value = "";
      return;
    }

    setCustomCoverFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewCoverUrl(objectUrl);
    setCoverSource("custom");
  };

  // Handler Simpan Data (Tambah atau Update)
  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formJudul.trim()) {
      showFeedback("error", "Judul materi edukasi wajib diisi.");
      return;
    }
    if (!formDeskripsi.trim()) {
      showFeedback("error", "Deskripsi materi wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      if (editingItem) {
        formData.append("id", String(editingItem.id));
      }
      formData.append("judul", formJudul.trim());
      formData.append("komoditas", formKomoditas);
      formData.append("deskripsi", formDeskripsi.trim());
      formData.append("urutan", String(formUrutan));
      formData.append("isPublished", String(formIsPublished));

      // Berkas PDF
      if (selectedPdfFile) {
        formData.append("pdfFile", selectedPdfFile);
      }

      // Berkas Cover Gambar (dari kustom upload atau hasil render halaman 1 PDF)
      if (coverSource === "custom" && customCoverFile) {
        formData.append("coverImage", customCoverFile);
      } else if (coverSource === "generated" && generatedCoverBlob) {
        const coverFile = new File([generatedCoverBlob], "pdf-cover.webp", {
          type: "image/webp",
        });
        formData.append("coverImage", coverFile);
      } else if (editingItem) {
        formData.append("defaultCoverUrl", editingItem.imageUrl || "");
      }

      const res = editingItem
        ? await updateMateriEdukasiAction(formData)
        : await createMateriEdukasiAction(formData);

      if (res.success && res.data) {
        if (editingItem) {
          setItems((prev) =>
            prev.map((i) => (i.id === res.data!.id ? res.data! : i))
          );
        } else {
          setItems((prev) => [...prev, res.data!]);
        }
        showFeedback("success", res.message || "Materi edukasi berhasil disimpan.");
        setIsModalOpen(false);
      } else {
        showFeedback("error", res.error || "Gagal menyimpan materi edukasi.");
      }
    } catch (err) {
      console.error(err);
      showFeedback("error", "Terjadi kesalahan saat menyimpan data materi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler Hapus Materi
  const handleDelete = async () => {
    if (!deletingItem) return;
    setIsDeleting(true);
    try {
      const res = await deleteMateriEdukasiAction(deletingItem.id);
      if (res.success) {
        setItems((prev) => prev.filter((i) => i.id !== deletingItem.id));
        showFeedback("success", res.message || "Materi edukasi berhasil dihapus.");
        setDeletingItem(null);
      } else {
        showFeedback("error", res.error || "Gagal menghapus materi edukasi.");
      }
    } catch {
      showFeedback("error", "Terjadi kesalahan saat menghapus materi.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Handler Toggle Status Publikasi
  const handleToggleStatus = (item: MateriEdukasiItemData) => {
    setTogglingId(item.id);
    startTransition(async () => {
      const res = await toggleMateriEdukasiStatusAction(item.id);
      if (res.success && res.data) {
        setItems((prev) =>
          prev.map((i) =>
            i.id === item.id ? { ...i, isPublished: res.data!.isPublished } : i
          )
        );
        showFeedback(
          "success",
          `Status publikasi materi "${item.judul}" berhasil diubah.`
        );
      } else {
        showFeedback("error", res.error || "Gagal mengubah status publikasi.");
      }
      setTogglingId(null);
    });
  };

  // Handler Reset ke Data Default
  const handleResetToDefault = async () => {
    setIsResetting(true);
    try {
      const res = await resetToDefaultMateriEdukasiAction();
      if (res.success && res.data) {
        setItems(res.data);
        showFeedback(
          "success",
          res.message || "Materi berhasil dikembalikan ke data bawaan."
        );
        setIsResetConfirmOpen(false);
      } else {
        showFeedback("error", res.error || "Gagal mereset materi ke default.");
      }
    } catch {
      showFeedback("error", "Terjadi kesalahan saat mereset materi edukasi.");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Tombol Aksi Utama */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-100 text-brand-orange dark:bg-orange-500/20 dark:text-orange-300">
              <BookOpen className="w-3 h-3" />
              Konten Edukasi Publik
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#0f2257] dark:text-white mt-1">
            Pengelolaan Materi Edukasi
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Kelola panduan materi edukasi obat &amp; makanan yang tampil pada halaman publik{" "}
            <a
              href="/edukasi"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#1664e8] hover:underline font-bold inline-flex items-center gap-1"
            >
              /edukasi
              <ExternalLink className="w-3 h-3" />
            </a>
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setIsResetConfirmOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-2xs transition cursor-pointer"
            title="Reset ke 12 materi bawaan resmi BPOM"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">Reset Default</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#ff8a1f] to-[#f26a0f] px-4 py-2.5 text-xs font-bold text-white shadow-cta hover:opacity-90 transition cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Tambah Materi Baru</span>
          </button>
        </div>
      </div>

      {/* Alert Feedback Notifikasi */}
      {feedback && (
        <div
          className={`flex items-center justify-between gap-3 p-4 rounded-2xl text-xs font-medium border animate-fade-in ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
              : "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. Kartu Ringkasan Statistik Komoditas */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Total Materi
          </p>
          <p className="text-xl sm:text-2xl font-black text-navy-900 dark:text-white mt-0.5">
            {stats.total}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 shadow-2xs">
          <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
            Pangan
          </p>
          <p className="text-xl sm:text-2xl font-black text-emerald-800 dark:text-emerald-200 mt-0.5">
            {stats.pangan}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-pink-50/50 dark:bg-pink-950/20 border border-pink-100 dark:border-pink-900/40 shadow-2xs">
          <p className="text-[11px] font-bold text-pink-700 dark:text-pink-300 uppercase tracking-wider">
            Kosmetik
          </p>
          <p className="text-xl sm:text-2xl font-black text-pink-800 dark:text-pink-200 mt-0.5">
            {stats.kosmetik}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 shadow-2xs">
          <p className="text-[11px] font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">
            Obat
          </p>
          <p className="text-xl sm:text-2xl font-black text-blue-800 dark:text-blue-200 mt-0.5">
            {stats.obat}
          </p>
        </div>
        <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 shadow-2xs">
          <p className="text-[11px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
            Obat Tradisional
          </p>
          <p className="text-xl sm:text-2xl font-black text-amber-900 dark:text-amber-200 mt-0.5">
            {stats.tradisional}
          </p>
        </div>
      </div>

      {/* 3. Toolbar Pencarian & Filter Tab Komoditas */}
      <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul, deskripsi, atau komoditas..."
              className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 bg-slate-50/60 dark:bg-slate-800 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:border-brand-orange"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Status Publikasi Tabs */}
          <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
            <span className="text-[11px] font-semibold text-slate-400 mr-1 hidden sm:inline">
              Status:
            </span>
            {(["semua", "aktif", "nonaktif"] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition cursor-pointer ${
                  filterStatus === st
                    ? "bg-[#0f2257] dark:bg-blue-600 text-white shadow-2xs"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Filter Komoditas Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <button
            type="button"
            onClick={() => setFilterKomoditas("semua")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition shrink-0 cursor-pointer ${
              filterKomoditas === "semua"
                ? "bg-brand-orange text-white shadow-2xs"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
            }`}
          >
            Semua Komoditas ({items.length})
          </button>

          {KOMODITAS_OPTIONS.map((kom) => {
            const count = items.filter((i) => i.komoditas === kom.key).length;
            const isSelected = filterKomoditas === kom.key;
            return (
              <button
                key={kom.key}
                type="button"
                onClick={() => setFilterKomoditas(kom.key)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition shrink-0 cursor-pointer ${
                  isSelected
                    ? "bg-[#0f2257] dark:bg-blue-600 text-white border-transparent shadow-2xs"
                    : `${kom.badgeClass} hover:opacity-90`
                }`}
              >
                {kom.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Daftar Kartu Materi Edukasi */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-brand-orange flex items-center justify-center mx-auto mb-3">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">
              Tidak Ada Materi Edukasi yang Cocok
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Coba sesuaikan kata kunci pencarian atau ubah filter komoditas.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredItems.map((item) => {
              const badgeOpt =
                KOMODITAS_OPTIONS.find((k) => k.key === item.komoditas) ||
                KOMODITAS_OPTIONS[0];

              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-2xs flex flex-col justify-between hover:border-brand-orange/40 transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    {/* Sisi Kiri: Badge, Judul, Deskripsi */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${badgeOpt.badgeClass}`}
                        >
                          {item.komoditas}
                        </span>
                        <span className="text-[11px] font-bold text-slate-400">
                          Urutan #{item.urutan}
                        </span>
                      </div>

                      <h3 className="text-sm sm:text-base font-bold text-navy-900 dark:text-white leading-snug line-clamp-2">
                        {item.judul}
                      </h3>

                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed line-clamp-2">
                        {item.deskripsi}
                      </p>
                    </div>

                    {/* Sisi Kanan: Thumbnail Cover Gambar */}
                    <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl sm:rounded-tl-3xl overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                      <Image
                        src={
                          item.imageUrl && !item.imageUrl.toLowerCase().endsWith(".pdf")
                            ? item.imageUrl
                            : "/assets-landingpage/layanan/1.jpg"
                        }
                        alt={item.judul}
                        fill
                        sizes="(max-width: 640px) 96px, 112px"
                        className="object-cover object-center"
                        unoptimized={item.imageUrl?.startsWith("/uploads/")}
                      />
                    </div>
                  </div>

                  {/* Bagian Bawah: Aksi, Dokumen PDF & Switch Publikasi */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                    {/* Status PDF & Pratinjau */}
                    <div className="flex items-center gap-2">
                      {item.pdfUrl ? (
                        <button
                          type="button"
                          onClick={() => setPreviewPdfItem(item)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 text-[11px] font-bold hover:bg-blue-100 transition cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Pratinjau PDF</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">
                          Belum ada PDF
                        </span>
                      )}
                    </div>

                    {/* Switch & Tombol Aksi */}
                    <div className="flex items-center gap-2">
                      {/* Toggle Publikasi */}
                      <button
                        type="button"
                        disabled={togglingId === item.id}
                        onClick={() => handleToggleStatus(item)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          item.isPublished
                            ? "bg-emerald-500"
                            : "bg-slate-300 dark:bg-slate-700"
                        }`}
                        title={
                          item.isPublished
                            ? "Klik untuk menonaktifkan"
                            : "Klik untuk mempublikasikan"
                        }
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                            item.isPublished ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(item)}
                        className="p-2 rounded-xl text-slate-500 hover:text-[#1664e8] hover:bg-blue-50 dark:hover:bg-slate-800 transition cursor-pointer"
                        title="Edit Materi"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeletingItem(item)}
                        className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition cursor-pointer"
                        title="Hapus Materi"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 5. MODAL FORM TAMBAH / EDIT (createPortal + z-[9999])     */}
      {/* ========================================================= */}
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
              if (!isSubmitting) setIsModalOpen(false);
            }}
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-xl rounded-3xl border border-slate-200 dark:border-slate-800 bg-white p-6 sm:p-7 shadow-2xl dark:bg-slate-900 z-10 my-auto animate-fade-up max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-50 text-brand-orange flex items-center justify-center">
                  {editingItem ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5 stroke-[2.5]" />}
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[#0f2257] dark:text-white">
                    {editingItem ? "Edit Materi Edukasi" : "Tambah Materi Edukasi Baru"}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {editingItem
                      ? `Mengubah materi ID #${editingItem.id}`
                      : "Materi baru akan tampil pada rute /edukasi"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="mt-5 space-y-4">
              {/* Judul Materi */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                  Judul Materi Edukasi <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formJudul}
                  onChange={(e) => setFormJudul(e.target.value)}
                  placeholder="Contoh: Kenali Bahaya Formalin dan Boraks pada Pangan"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:border-brand-orange focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              {/* Pilihan Komoditas */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                  Kategori Komoditas <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {KOMODITAS_OPTIONS.map((kom) => {
                    const isSelected = formKomoditas === kom.key;
                    return (
                      <button
                        key={kom.key}
                        type="button"
                        onClick={() => setFormKomoditas(kom.key)}
                        className={`p-2.5 rounded-xl border text-center text-xs font-bold transition cursor-pointer ${
                          isSelected
                            ? "border-brand-orange bg-orange-50 text-brand-orange-700 dark:bg-orange-500/20 dark:text-orange-300 shadow-2xs"
                            : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                        }`}
                      >
                        {kom.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Upload Berkas Dokumen PDF */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                  Berkas Dokumen PDF Materi
                </label>
                <div className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 p-4 bg-slate-50/50 dark:bg-slate-800/40 text-center">
                  <input
                    ref={pdfInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handlePdfChange}
                    className="hidden"
                    id="materi-pdf-input"
                  />
                  <label
                    htmlFor="materi-pdf-input"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:border-brand-orange hover:text-brand-orange transition cursor-pointer shadow-2xs"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{selectedPdfFile ? "Ganti File PDF" : "Pilih File PDF Materi"}</span>
                  </label>

                  {selectedPdfFile ? (
                    <div className="mt-2 text-xs text-slate-600 dark:text-slate-300">
                      📄 Terpilih: <strong>{selectedPdfFile.name}</strong> ({(selectedPdfFile.size / (1024 * 1024)).toFixed(2)} MB)
                    </div>
                  ) : editingItem?.pdfFilename ? (
                    <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                      Berkas saat ini: <strong>{editingItem.pdfFilename}</strong>
                    </div>
                  ) : (
                    <p className="mt-1.5 text-[11px] text-slate-400">
                      Unggah dokumen panduan materi PDF (Maksimal 15 MB).
                    </p>
                  )}

                  {isExtractingPdfCover && (
                    <div className="mt-2.5 inline-flex items-center gap-2 text-xs font-bold text-brand-orange animate-pulse">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sedang mengekstrak Halaman 1 PDF menjadi Cover...</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bagian Pratinjau & Pengaturan Cover Thumbnail */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/70 dark:bg-slate-800/50">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-brand-orange" />
                    Cover Thumbnail Kartu
                  </label>

                  {coverSource === "generated" && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full">
                      <Check className="w-3 h-3" />
                      Otomatis dari Halaman 1 PDF
                    </span>
                  )}
                  {coverSource === "custom" && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-full">
                      <Sparkles className="w-3 h-3" />
                      Gambar Kustom
                    </span>
                  )}
                </div>

                <div className="flex items-start gap-4">
                  {/* Pratinjau Gambar Cover */}
                  <div className="relative w-28 h-28 rounded-xl sm:rounded-tl-3xl overflow-hidden shrink-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xs">
                    {previewCoverUrl ? (
                      <Image
                        src={
                          previewCoverUrl && !previewCoverUrl.toLowerCase().endsWith(".pdf")
                            ? previewCoverUrl
                            : "/assets-landingpage/layanan/1.jpg"
                        }
                        alt="Preview Cover"
                        fill
                        className="object-cover object-center"
                        unoptimized={
                          previewCoverUrl?.startsWith("data:") ||
                          previewCoverUrl?.startsWith("blob:") ||
                          previewCoverUrl?.startsWith("/uploads/")
                        }
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <ImageIcon className="w-8 h-8 opacity-40" />
                      </div>
                    )}
                  </div>

                  {/* Tombol Opsi Cover */}
                  <div className="flex-1 space-y-2">
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      Thumbnail cover kartu akan otomatis diambil dari <strong>Halaman 1 PDF</strong> saat Anda memilih berkas PDF. Anda juga bisa mengunggah gambar sendiri di bawah ini jika diinginkan.
                    </p>

                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleCustomImageChange}
                      className="hidden"
                      id="custom-cover-input"
                    />

                    <label
                      htmlFor="custom-cover-input"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-brand-orange hover:text-brand-orange transition cursor-pointer shadow-2xs"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Ganti dengan Gambar Sendiri</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Deskripsi Singkat */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                  Deskripsi Singkat <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={formDeskripsi}
                  onChange={(e) => setFormDeskripsi(e.target.value)}
                  placeholder="Ringkasan penjelasan mengenai materi ini (akan tampil pada kartu)..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:border-brand-orange focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              {/* Urutan & Status Publikasi */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    Nomor Urut Tampil
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formUrutan}
                    onChange={(e) => setFormUrutan(parseInt(e.target.value) || 1)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2 text-xs font-medium text-slate-800 focus:border-brand-orange focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div className="flex flex-col justify-end">
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      Status Publikasi
                    </span>
                    <button
                      type="button"
                      onClick={() => setFormIsPublished(!formIsPublished)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        formIsPublished ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          formIsPublished ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {formIsPublished ? "Tampil di website /edukasi" : "Disimpan sebagai draft"}
                  </span>
                </div>
              </div>

              {/* Tombol Simpan & Batal */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isExtractingPdfCover}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#ff8a1f] to-[#f26a0f] px-5 py-2 text-xs font-bold text-white shadow-cta hover:opacity-90 disabled:opacity-50 transition cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>{editingItem ? "Simpan Perubahan" : "Tambahkan Materi"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ========================================================= */}
      {/* 6. MODAL KONFIRMASI HAPUS (createPortal + z-[9999])       */}
      {/* ========================================================= */}
      {mounted && deletingItem && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
        >
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity animate-fade-in"
            onClick={() => {
              if (!isDeleting) setDeletingItem(null);
            }}
          />

          <div className="relative w-full max-w-sm rounded-3xl border border-slate-200 dark:border-slate-800 bg-white p-6 shadow-2xl dark:bg-slate-900 text-center z-10 my-auto animate-fade-up">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 mx-auto flex items-center justify-center mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Hapus Materi Edukasi?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
              Apakah Anda yakin ingin menghapus materi &quot;{deletingItem.judul}&quot;? Berkas gambar dan PDF yang terkait juga akan dihapus.
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

      {/* ========================================================= */}
      {/* 7. MODAL RESET KE DEFAULT (createPortal + z-[9999])       */}
      {/* ========================================================= */}
      {mounted && isResetConfirmOpen && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
        >
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity animate-fade-in"
            onClick={() => {
              if (!isResetting) setIsResetConfirmOpen(false);
            }}
          />

          <div className="relative w-full max-w-sm rounded-3xl border border-slate-200 dark:border-slate-800 bg-white p-6 shadow-2xl dark:bg-slate-900 text-center z-10 my-auto animate-fade-up">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center mb-3">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Reset ke 12 Materi Bawaan?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
              Tindakan ini akan mengatur ulang daftar materi menjadi 12 panduan materi resmi bawaan BBPOM (Pangan, Kosmetik, Obat, dan Obat Tradisional).
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

      {/* ========================================================= */}
      {/* 8. MODAL PRATINJAU PDF                                    */}
      {/* ========================================================= */}
      <EducationPdfModal
        isOpen={Boolean(previewPdfItem)}
        onClose={() => setPreviewPdfItem(null)}
        title={previewPdfItem?.judul}
        badge={`Materi Edukasi • ${previewPdfItem?.komoditas}`}
        pdfUrl={previewPdfItem?.pdfUrl || "/documents/materi-edukasi-bbpom.pdf"}
        filename={previewPdfItem?.pdfFilename || "Materi-Edukasi-BBPOM.pdf"}
      />
    </div>
  );
}

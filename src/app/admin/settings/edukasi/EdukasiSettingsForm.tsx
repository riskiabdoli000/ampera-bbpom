"use client";

import React, { useState, useTransition, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  ShieldCheck,
  BookOpen,
  FileText,
  Utensils,
  FlaskConical,
  Sparkles,
  Lightbulb,
  CheckCircle2,
  HeartHandshake,
  Award,
  Save,
  Loader2,
  Upload,
  Eye,
  ArrowRight,
  Check,
  XCircle,
  ExternalLink,
  Trash2,
  Info,
  Plus,
  Pencil,
  X,
  AlertTriangle,
} from "lucide-react";
import {
  createEdukasiAction,
  updateEdukasiAction,
  toggleEdukasiStatusAction,
  deleteEdukasiAction,
  type EdukasiItemData,
} from "@/app/actions/settings-edukasi";
import { EducationPdfModal } from "@/components/landing/EducationPdfModal";

export const EDUKASI_ICON_OPTIONS: {
  name: string;
  label: string;
  icon: React.ElementType;
}[] = [
  { name: "ShieldCheck", label: "Perisai Aman", icon: ShieldCheck },
  { name: "BookOpen", label: "Buku Artikel", icon: BookOpen },
  { name: "FileText", label: "Dokumen PDF", icon: FileText },
  { name: "Utensils", label: "Pangan", icon: Utensils },
  { name: "FlaskConical", label: "Farmasi / Uji", icon: FlaskConical },
  { name: "Sparkles", label: "Edukasi Utama", icon: Sparkles },
  { name: "Lightbulb", label: "Tips Cerdas", icon: Lightbulb },
  { name: "CheckCircle2", label: "Cek KLIK", icon: CheckCircle2 },
  { name: "HeartHandshake", label: "Peduli Konsumen", icon: HeartHandshake },
  { name: "Award", label: "Standar Mutu", icon: Award },
];

export function getEdukasiIconComponent(iconName?: string): React.ElementType {
  const found = EDUKASI_ICON_OPTIONS.find((item) => item.name === iconName);
  return found ? found.icon : ShieldCheck;
}

interface EdukasiSettingsFormProps {
  initialItems: EdukasiItemData[];
}

export function EdukasiSettingsForm({ initialItems }: EdukasiSettingsFormProps) {
  const [mounted, setMounted] = useState(false);
  const [items, setItems] = useState<EdukasiItemData[]>(initialItems);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Modal Form State (Tambah Baru / Edit)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EdukasiItemData | null>(null);

  const [judul, setJudul] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("ShieldCheck");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewObjectUrl, setPreviewObjectUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Modal Konfirmasi Hapus
  const [itemToDelete, setItemToDelete] = useState<EdukasiItemData | null>(null);

  // Modal Preview PDF
  const [previewPdfData, setPreviewPdfData] = useState<{
    title: string;
    pdfUrl: string;
    filename: string;
  } | null>(null);

  // Status & Feedback
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [isPending, startTransition] = useTransition();
  const [togglingId, setTogglingId] = useState<number | null>(null);

  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewObjectUrl(null);
      return;
    }
    const objUrl = URL.createObjectURL(selectedFile);
    setPreviewObjectUrl(objUrl);
    return () => {
      URL.revokeObjectURL(objUrl);
    };
  }, [selectedFile]);

  // Buka Modal Tambah Edukasi Baru
  const handleOpenCreateModal = () => {
    setEditingItem(null);
    setJudul("");
    setDeskripsi("");
    setSelectedIcon("BookOpen");
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setIsFormModalOpen(true);
  };

  // Buka Modal Edit Edukasi
  const handleOpenEditModal = (item: EdukasiItemData) => {
    setEditingItem(item);
    setJudul(item.judul);
    setDeskripsi(item.deskripsi);
    setSelectedIcon(item.icon || "ShieldCheck");
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    if (isPending) return;
    setIsFormModalOpen(false);
    setEditingItem(null);
    setSelectedFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;

    if (
      !file.name.toLowerCase().endsWith(".pdf") &&
      file.type !== "application/pdf"
    ) {
      setFeedback({
        type: "error",
        message: "Hanya berkas berformat PDF (.pdf) yang diperbolehkan.",
      });
      e.target.value = "";
      return;
    }

    setSelectedFile(file);
  };

  // Submit Tambah Baru atau Edit
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!editingItem && !selectedFile) {
      setFeedback({
        type: "error",
        message: "Harap pilih berkas dokumen PDF (.pdf) untuk materi edukasi baru.",
      });
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      if (editingItem) {
        formData.append("id", String(editingItem.id));
      }
      formData.append("judul", judul);
      formData.append("deskripsi", deskripsi);
      formData.append("icon", selectedIcon);
      if (selectedFile) {
        formData.append("pdfFile", selectedFile);
      }

      const res = editingItem
        ? await updateEdukasiAction(formData)
        : await createEdukasiAction(formData);

      if (res.success && res.data) {
        const savedItem = res.data;
        if (editingItem) {
          setItems((prev) =>
            prev.map((it) => (it.id === savedItem.id ? savedItem : it))
          );
        } else {
          setItems((prev) => [...prev, savedItem]);
        }
        setIsFormModalOpen(false);
        setEditingItem(null);
        setSelectedFile(null);
        setFeedback({
          type: "success",
          message:
            res.message ||
            "Data Kartu Edukasi berhasil disimpan dan diperbarui di Landing Page!",
        });
      } else {
        setFeedback({
          type: "error",
          message: res.error || "Gagal menyimpan kartu edukasi.",
        });
      }
    });
  };

  // Toggle Aktif / Nonaktif Kartu Edukasi
  const handleToggleStatus = async (item: EdukasiItemData) => {
    const nextStatus = !item.isPublished;
    setTogglingId(item.id);
    setItems((prev) =>
      prev.map((it) =>
        it.id === item.id ? { ...it, isPublished: nextStatus } : it
      )
    );

    const res = await toggleEdukasiStatusAction(item.id, nextStatus);
    if (res.success) {
      setFeedback({
        type: "success",
        message: `Kartu edukasi "${item.judul}" ${
          nextStatus ? "ditampilkan" : "disembunyikan"
        } di Landing Page.`,
      });
    } else {
      // Rollback
      setItems((prev) =>
        prev.map((it) =>
          it.id === item.id ? { ...it, isPublished: item.isPublished } : it
        )
      );
      setFeedback({
        type: "error",
        message: res.error || "Gagal mengubah status tampil kartu edukasi.",
      });
    }
    setTogglingId(null);
  };

  // Konfirmasi Hapus Kartu Edukasi
  const handleConfirmDelete = () => {
    if (!itemToDelete) return;
    const target = itemToDelete;

    startTransition(async () => {
      const res = await deleteEdukasiAction(target.id);
      if (res.success) {
        setItems((prev) => prev.filter((it) => it.id !== target.id));
        setItemToDelete(null);
        setFeedback({
          type: "success",
          message:
            res.message || `Kartu edukasi "${target.judul}" berhasil dihapus.`,
        });
      } else {
        setFeedback({
          type: "error",
          message: res.error || "Gagal menghapus kartu edukasi.",
        });
      }
    });
  };

  const ActiveFormIconComponent = getEdukasiIconComponent(selectedIcon);
  const modalPreviewPdfUrl =
    previewObjectUrl ||
    editingItem?.pdfUrl ||
    "/documents/materi-edukasi-bbpom.pdf";
  const modalPreviewPdfFilename = selectedFile
    ? selectedFile.name
    : editingItem?.pdfFilename || "Materi-Edukasi-BBPOM.pdf";

  return (
    <div className="space-y-6 animate-fade-up">
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

      {/* Header Halaman + Tombol Tambah Edukasi Baru */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-orange">
            <BookOpen className="h-3.5 w-3.5" />
            <span>Website Settings &bull; Konten Edukasi</span>
          </div>
          <h1 className="text-2xl font-black text-navy-900 dark:text-white font-brand mt-1">
            Manajemen Kartu Edukasi (Artikel PDF)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Tambah, ubah, atau hapus kartu artikel edukasi PDF di Landing Page. Tombol aksi pada kartu ini otomatis menggunakan <strong>&ldquo;Baca Artikel&rdquo;</strong>.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#ff7a1a] to-[#f26a0f] px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-cta hover:brightness-110 active:scale-95 transition-all cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>Tambah Edukasi Baru</span>
        </button>
      </div>

      {/* Info Banner Penyimpanan Lokal */}
      {/* <div className="flex items-start gap-3 rounded-2xl bg-sky-50/80 dark:bg-sky-950/30 border border-sky-200/70 dark:border-sky-800/50 p-4 text-xs text-sky-900 dark:text-sky-200">
        <Info className="h-4 w-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-bold">
            Penyimpanan PDF Lokal (<code className="font-mono">public/uploads/edukasi</code>) &bull; Hemat Database
          </p>
          <p className="text-[11px] text-sky-800/90 dark:text-sky-300/90 leading-relaxed">
            Berkas PDF disimpan di folder lokal server dan tidak dimasukkan ke database. Apabila Anda mengedit kartu dan mengganti berkas PDF-nya (atau menghapus kartu), <strong>berkas PDF lama otomatis terhapus</strong> dari folder <code className="font-mono">/uploads/edukasi</code>. Tiga kartu lainnya (<em>Garda Ampera</em>, <em>Cek BPOM</em>, <em>Informasi Umum</em>) tetap tampil permanen (hardcode).
          </p>
        </div>
      </div> */}

      {/* Daftar Kartu Edukasi yang Dikelola Admin */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => {
          const IconComp = getEdukasiIconComponent(item.icon);

          return (
            <div
              key={item.id}
              className={`rounded-3xl border bg-white dark:bg-slate-900 p-6 flex flex-col justify-between shadow-sm transition-all ${
                item.isPublished
                  ? "border-slate-200/80 dark:border-slate-800"
                  : "border-slate-200/50 opacity-65 dark:border-slate-800/60"
              }`}
            >
              <div>
                {/* Baris Atas: Status Toggle & Tombol Edit / Hapus */}
                <div className="flex items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      role="switch"
                      disabled={togglingId === item.id}
                      aria-checked={item.isPublished}
                      onClick={() => handleToggleStatus(item)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 ${
                        item.isPublished
                          ? "bg-emerald-500"
                          : "bg-slate-300 dark:bg-slate-700"
                      }`}
                      title={
                        item.isPublished
                          ? "Klik untuk menyembunyikan dari Landing Page"
                          : "Klik untuk menampilkan di Landing Page"
                      }
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${
                          item.isPublished ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                    <span
                      className={`text-[11px] font-bold ${
                        item.isPublished
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-slate-400"
                      }`}
                    >
                      {item.isPublished ? "Aktif di Beranda" : "Disembunyikan"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(item)}
                      className="inline-flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:border-brand-orange hover:text-brand-orange transition-colors cursor-pointer"
                      title="Edit Kartu Edukasi"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setItemToDelete(item)}
                      className="inline-flex items-center justify-center h-8 w-8 rounded-xl border border-rose-200/80 dark:border-rose-900/50 bg-rose-50/70 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-colors cursor-pointer"
                      title="Hapus Kartu Edukasi"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Visual Kartu Persis Seperti di Landing Page */}
                <div
                  onClick={() =>
                    setPreviewPdfData({
                      title: item.judul,
                      pdfUrl: item.pdfUrl,
                      filename: item.pdfFilename,
                    })
                  }
                  className="mt-5 group rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 p-6 flex flex-col items-center text-center hover:border-brand-orange/40 transition-all cursor-pointer"
                >
                  <div className="w-14 h-14 rounded-2xl bg-orange-50 dark:bg-orange-500/15 border border-orange-100/70 dark:border-orange-500/20 text-brand-orange dark:text-orange-400 flex items-center justify-center group-hover:bg-brand-orange group-hover:text-white transition-all duration-300 shadow-xs">
                    <IconComp className="w-7 h-7 stroke-[1.9]" />
                  </div>

                  <h3 className="font-brand font-bold text-lg text-navy-900 dark:text-white mt-4 group-hover:text-brand-orange transition-colors">
                    {item.judul}
                  </h3>

                  <div className="w-10 h-0.5 rounded-full bg-brand-orange/40 my-3 group-hover:w-14 group-hover:bg-brand-orange transition-all duration-300" />

                  <p className="text-xs text-ink-soft dark:text-slate-400 leading-relaxed max-w-[220px]">
                    {item.deskripsi}
                  </p>

                  <div className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-brand-orange">
                    <span>Baca Artikel</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              {/* Footer Info Berkas PDF */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="h-4 w-4 text-brand-orange shrink-0" />
                  <span
                    className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 truncate"
                    title={item.pdfFilename}
                  >
                    {item.pdfFilename}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setPreviewPdfData({
                      title: item.judul,
                      pdfUrl: item.pdfUrl,
                      filename: item.pdfFilename,
                    })
                  }
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-orange hover:underline shrink-0 cursor-pointer"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Lihat PDF</span>
                </button>
              </div>
            </div>
          );
        })}

        {/* Card Shortcut Tambah Edukasi Baru */}
        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="min-h-[320px] rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-brand-orange dark:hover:border-brand-orange bg-slate-50/50 dark:bg-slate-900/40 hover:bg-orange-50/30 dark:hover:bg-orange-950/10 p-6 flex flex-col items-center justify-center text-center gap-3 transition-all group cursor-pointer"
        >
          <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 group-hover:text-brand-orange group-hover:border-brand-orange/40 flex items-center justify-center shadow-xs transition-all group-hover:scale-110">
            <Plus className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-bold text-navy-900 dark:text-white group-hover:text-brand-orange transition-colors">
              + Tambah Kartu Edukasi Baru
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[220px]">
              Buat kartu edukasi baru dengan judul, deskripsi, pilihan icon, dan dokumen PDF.
            </p>
          </div>
        </button>
      </div>

      {/* ========================================================= */}
      {/* MODAL TAMBAH / EDIT KARTU EDUKASI (DI ATAS SEMUA ELEMEN)  */}
      {/* ========================================================= */}
      {mounted &&
        isFormModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-navy-950/75 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-4xl max-h-[92vh] rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden">
            {/* Header Modal */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-500/15 text-brand-orange flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-navy-900 dark:text-white font-brand">
                    {editingItem
                      ? `Edit Kartu Edukasi: ${editingItem.judul}`
                      : "Tambah Kartu Edukasi Baru"}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Isi judul, deskripsi, pilih icon kartu, dan unggah dokumen PDF materi edukasi.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCloseFormModal}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body Modal */}
            <form
              onSubmit={handleSaveForm}
              className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
            >
              {/* Kolom Kiri: Input Form (7 Kolom) */}
              <div className="lg:col-span-7 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Judul Kartu Edukasi *
                  </label>
                  <input
                    type="text"
                    value={judul}
                    onChange={(e) => setJudul(e.target.value)}
                    required
                    placeholder="Contoh: Ketersediaan Farmasi / Keamanan Pangan"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs sm:text-sm font-bold text-navy-900 focus:border-brand-orange focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Deskripsi Singkat Kartu *
                  </label>
                  <textarea
                    rows={3}
                    value={deskripsi}
                    onChange={(e) => setDeskripsi(e.target.value)}
                    required
                    placeholder="Contoh: Baca informasi dan wawasan edukatif seputar keamanan obat & pangan."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-brand-orange focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white leading-relaxed"
                  />
                </div>

                {/* Pilihan Icon Kartu */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Pilih Icon Kartu *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {EDUKASI_ICON_OPTIONS.map((opt) => {
                      const IconComp = opt.icon;
                      const isSelected = selectedIcon === opt.name;
                      return (
                        <button
                          key={opt.name}
                          type="button"
                          onClick={() => setSelectedIcon(opt.name)}
                          className={`flex flex-col items-center justify-center gap-1 p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                            isSelected
                              ? "border-brand-orange bg-orange-50 text-brand-orange ring-2 ring-brand-orange/20 dark:bg-orange-500/15 dark:border-orange-400 dark:text-orange-400"
                              : "border-slate-200 bg-slate-50/70 text-slate-600 hover:bg-white dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300"
                          }`}
                        >
                          <IconComp className="w-4 h-4 stroke-[1.9]" />
                          <span className="text-[10px] font-bold leading-tight">
                            {opt.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Upload File PDF */}
                <div className="space-y-2.5 pt-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Unggah Dokumen PDF {editingItem ? "(Opsional jika tidak ganti file)" : "*"}
                  </label>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf,.pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    id="modal-edukasi-pdf-input"
                  />

                  <div className="flex flex-wrap items-center gap-2.5">
                    <label
                      htmlFor="modal-edukasi-pdf-input"
                      className="inline-flex items-center gap-2 rounded-xl border-2 border-dashed border-brand-orange/60 bg-orange-50/50 hover:bg-orange-50 px-4 py-2.5 text-xs font-bold text-brand-orange transition-all cursor-pointer dark:border-orange-500/40 dark:bg-orange-500/10 dark:text-orange-400"
                    >
                      <Upload className="h-4 w-4" />
                      <span>
                        {selectedFile
                          ? "Ganti Pilihan File PDF"
                          : editingItem
                          ? "Ganti Berkas PDF (.pdf)"
                          : "Pilih Berkas PDF (.pdf)"}
                      </span>
                    </label>

                    {(selectedFile || editingItem) && (
                      <button
                        type="button"
                        onClick={() =>
                          setPreviewPdfData({
                            title: judul || editingItem?.judul || "Pratinjau Materi Edukasi",
                            pdfUrl: modalPreviewPdfUrl,
                            filename: modalPreviewPdfFilename,
                          })
                        }
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:border-brand-orange hover:text-brand-orange transition-colors cursor-pointer"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Uji Pratinjau PDF</span>
                      </button>
                    )}
                  </div>

                  {selectedFile ? (
                    <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      ✓ File dipilih: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                      {editingItem && " — File PDF lama akan otomatis dihapus saat disimpan."}
                    </p>
                  ) : editingItem ? (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      File saat ini: <strong className="text-slate-700 dark:text-slate-200">{editingItem.pdfFilename}</strong>
                    </p>
                  ) : (
                    <p className="text-[11px] text-slate-400">
                      Berkas akan disimpan ke <code className="font-mono">/uploads/edukasi</code>.
                    </p>
                  )}
                </div>
              </div>

              {/* Kolom Kanan: Live Preview Kartu (5 Kolom) */}
              <div className="lg:col-span-5 flex flex-col items-center">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
                  Pratinjau Tampilan Kartu
                </span>
                <div className="w-full rounded-3xl bg-slate-100/80 dark:bg-slate-950/60 p-6 border border-slate-200/80 dark:border-slate-800 flex flex-col items-center">
                  <div className="w-full max-w-[260px] rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 flex flex-col items-center text-center shadow-md">
                    <div className="w-14 h-14 rounded-2xl bg-orange-50 dark:bg-orange-500/15 border border-orange-100/70 dark:border-orange-500/20 text-brand-orange dark:text-orange-400 flex items-center justify-center">
                      <ActiveFormIconComponent className="w-7 h-7 stroke-[1.9]" />
                    </div>
                    <h3 className="font-brand font-bold text-lg text-navy-900 dark:text-white mt-4">
                      {judul || "Judul Edukasi"}
                    </h3>
                    <div className="w-10 h-0.5 rounded-full bg-brand-orange/40 my-3" />
                    <p className="text-xs text-ink-soft dark:text-slate-400 leading-relaxed max-w-[210px]">
                      {deskripsi || "Deskripsi singkat kartu edukasi akan tampil di sini."}
                    </p>
                    <div className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-brand-orange">
                      <span>Baca Artikel</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Tombol Simpan */}
              <div className="lg:col-span-12 flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleCloseFormModal}
                  disabled={isPending}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#ff7a1a] to-[#f26a0f] px-5 py-2.5 text-xs font-bold text-white shadow-cta hover:brightness-110 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>
                        {editingItem ? "Simpan Perubahan" : "Simpan Edukasi Baru"}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ========================================================= */}
      {/* MODAL KONFIRMASI HAPUS (DI ATAS SEMUA ELEMEN)             */}
      {/* ========================================================= */}
      {mounted &&
        itemToDelete &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-navy-950/75 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-navy-900 dark:text-white">
                    Hapus Kartu Edukasi?
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Kartu <strong>&ldquo;{itemToDelete.judul}&rdquo;</strong> beserta berkas PDF-nya di <code className="font-mono">/uploads/edukasi</code> akan dihapus permanen.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => setItemToDelete(null)}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={handleConfirmDelete}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 px-4 py-2 text-xs font-bold text-white shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Menghapus...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Ya, Hapus</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Modal Preview & Unduh Materi Edukasi PDF (Di Atas Semua Elemen) */}
      {mounted &&
        createPortal(
          <EducationPdfModal
            isOpen={!!previewPdfData}
            onClose={() => setPreviewPdfData(null)}
            title={previewPdfData?.title}
            badge={`Materi Edukasi • ${previewPdfData?.title || "BBPOM"}`}
            pdfUrl={previewPdfData?.pdfUrl}
            filename={previewPdfData?.filename}
          />,
          document.body
        )}
    </div>
  );
}

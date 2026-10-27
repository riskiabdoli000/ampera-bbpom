"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import {
  X,
  Upload,
  Plus,
  Loader2,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

interface AddSlideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
  isPending: boolean;
  isStorageConfigured: boolean;
}

export function AddSlideModal({
  isOpen,
  onClose,
  onSubmit,
  isPending,
  isStorageConfigured,
}: AddSlideModalProps) {
  const [title, setTitle] = useState("");
  const [alt, setAlt] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setFilePreview(URL.createObjectURL(selectedFile));
    if (!title) {
      // Otomatis isi judul dari nama file jika belum ada
      const cleanName = selectedFile.name
        .replace(/\.[^/.]+$/, "")
        .replace(/[-_]/g, " ");
      setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Masukkan judul slide terlebih dahulu.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("alt", alt.trim() || title.trim());
    if (file) {
      formData.append("imageFile", file);
    }

    await onSubmit(formData);
    // Reset state setelah sukses
    setTitle("");
    setAlt("");
    setFile(null);
    setFilePreview(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-navy-950/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-900 space-y-6 overflow-hidden">
        {/* Glow Accent Header */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-500 via-brand-orange to-[#f26a0f]" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-brand-orange dark:bg-orange-950/60 dark:text-orange-400 border border-orange-200/80 dark:border-orange-900/40">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-navy-900 dark:text-white">
                Tambah Slide Hero Baru
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isStorageConfigured
                  ? "Tersimpan di Supabase Storage"
                  : "Tersimpan di penyimpanan lokal (fallback)"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Section: Upload Area */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Foto Slide Banner <span className="text-red-500">*</span>
              </label>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                <Sparkles className="h-3 w-3" />
                <span>Auto-kompres ~200KB</span>
              </span>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/jpg"
              className="hidden"
              onChange={(e) => {
                const selected = e.target.files?.[0];
                if (selected) handleFileSelect(selected);
              }}
            />

            {filePreview ? (
              <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-900 group">
                <div className="relative h-44 w-full">
                  <Image
                    src={filePreview}
                    alt="Preview Unggahan"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                </div>

                <div className="absolute bottom-0 inset-x-0 p-3.5 flex items-center justify-between text-white">
                  <div className="min-w-0 pr-3">
                    <p className="text-xs font-bold truncate">{file?.name}</p>
                    <p className="text-[11px] text-slate-300">
                      Ukuran Asli: {file ? formatFileSize(file.size) : "-"} •{" "}
                      <span className="text-emerald-300 font-semibold">
                        Akan dikompres ke ~200KB
                      </span>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="shrink-0 rounded-xl bg-white/20 backdrop-blur-md px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/30 transition-all border border-white/20"
                  >
                    Ganti Foto
                  </button>
                </div>
              </div>
            ) : (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-7 text-center cursor-pointer transition-all ${
                  isDragging
                    ? "border-brand-orange bg-orange-50/50 dark:bg-orange-950/20"
                    : "border-slate-300 dark:border-slate-700 hover:border-brand-orange hover:bg-slate-50/50 dark:hover:bg-slate-800/40"
                }`}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-brand-orange dark:bg-orange-950/80 mb-3 shadow-inner">
                  <Upload className="h-6 w-6" />
                </div>
                <p className="text-xs font-bold text-navy-900 dark:text-white">
                  Klik untuk memilih foto atau seret ke sini
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Mendukung JPG, PNG, WEBP ukuran bebas (otomatis dikompres ke 200KB).
                </p>
              </div>
            )}
          </div>

          {/* Section: Text Inputs */}
          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Judul Slide <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Cth: Layanan Pengujian Cepat Mobil Laboratorium"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-900 focus:border-brand-orange focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Teks Alt / Keterangan Gambar
              </label>
              <input
                type="text"
                value={alt}
                onChange={(e) => setAlt(e.target.value)}
                placeholder="Cth: Petugas BBPOM sedang melakukan uji sampel di pasar"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-brand-orange focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          {/* Modal Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="rounded-xl px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#ff7a1a] to-[#f26a0f] px-5 py-2.5 text-xs font-bold text-white shadow-cta hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Mengompres & Menyimpan...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Simpan Slide</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

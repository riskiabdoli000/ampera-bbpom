"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  X,
  Upload,
  Plus,
  Loader2,
  Sparkles,
  AlertCircle,
  Save,
  ImageIcon,
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
  const [mounted, setMounted] = useState(false);
  const [title, setTitle] = useState("");
  const [alt, setAlt] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset state when modal opens or closes
  useEffect(() => {
    if (!isOpen) {
      setTitle("");
      setAlt("");
      setFile(null);
      setFilePreview(null);
      setErrorMessage(null);
    }
  }, [isOpen]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const handleFileSelect = (selectedFile: File) => {
    setErrorMessage(null);
    setFile(selectedFile);
    setFilePreview(URL.createObjectURL(selectedFile));
    if (!title) {
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
    setErrorMessage(null);

    if (!file) {
      setErrorMessage("Silakan pilih berkas foto untuk banner slide.");
      return;
    }

    if (!title.trim()) {
      setErrorMessage("Judul slide banner wajib diisi.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("alt", alt.trim() || title.trim());
    formData.append("imageFile", file);

    try {
      await onSubmit(formData);
      onClose();
    } catch {
      setErrorMessage("Gagal mengunggah slide. Silakan coba kembali.");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Fullscreen Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/65 backdrop-blur-md transition-opacity animate-fade-in"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 z-10 animate-fade-up my-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-50 dark:bg-orange-500/15 text-brand-orange flex items-center justify-center shrink-0">
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-navy-900 dark:text-white font-brand">
                Tambah Slide Hero Baru
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isStorageConfigured
                  ? "Tersimpan otomatis di Cloud Storage (Supabase)"
                  : "Tersimpan di direktori lokal server"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-navy-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mt-4 p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Section: Upload Area */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
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
                    unoptimized
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
                    className="shrink-0 rounded-xl bg-white/20 backdrop-blur-md px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/30 transition-all border border-white/20 cursor-pointer"
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
                className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-all ${
                  isDragging
                    ? "border-brand-orange bg-orange-50/50 dark:bg-orange-950/20"
                    : "border-slate-300 dark:border-slate-700 hover:border-brand-orange hover:bg-slate-50/50 dark:hover:bg-slate-800/40"
                }`}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-brand-orange dark:bg-orange-500/15 mb-2.5 shadow-2xs">
                  <Upload className="h-5 w-5" />
                </div>
                <p className="text-xs font-bold text-navy-900 dark:text-white">
                  Klik untuk memilih foto atau seret ke sini
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Mendukung JPG, PNG, WEBP (otomatis dikompres web-friendly ~200KB).
                </p>
              </div>
            )}
          </div>

          {/* Section: Text Inputs */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Judul Slide Banner <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Cth: Layanan Pengujian Cepat Mobil Laboratorium"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs sm:text-sm font-bold text-navy-900 dark:text-white focus:border-brand-orange focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800"
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
              placeholder="Cth: Petugas BBPOM sedang melakukan uji sampel pangan"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:border-brand-orange focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800"
            />
          </div>

          {/* Modal Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#ff7a1a] to-[#f26a0f] px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-cta hover:brightness-110 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Mengompres & Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Simpan Slide</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

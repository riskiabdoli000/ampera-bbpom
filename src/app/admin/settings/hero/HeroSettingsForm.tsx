"use client";

import React, { useState, useTransition, useRef, useEffect } from "react";
import Image from "next/image";
import {
  Sparkles,
  Save,
  CheckCircle2,
  Eye,
  Plus,
  Trash2,
  Upload,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Cloud,
  HardDrive,
  X,
  Smartphone,
  Monitor,
  ChevronLeft,
  ChevronRight,
  Check,
  XCircle,
} from "lucide-react";
import {
  saveHeroKontenAction,
  createHeroSlideAction,
  updateHeroSlideAction,
  replaceHeroSlideImageAction,
  deleteHeroSlideAction,
} from "@/app/actions/settings-hero";
import { AddSlideModal } from "./AddSlideModal";
import { DeleteSlideModal } from "./DeleteSlideModal";

interface HeroSlideData {
  id: number;
  title: string;
  alt: string;
  imageUrl: string;
  imagePath: string | null;
  isActive: boolean;
  urutan: number;
}

interface HeroSettingsFormProps {
  initialKonten: {
    id: number;
    judul: string;
    subjudul: string;
    ctaUtamaLabel: string;
    ctaSekunderLabel?: string | null;
  };
  initialSlides: HeroSlideData[];
  isStorageConfigured: boolean;
}

export function HeroSettingsForm({
  initialKonten,
  initialSlides,
  isStorageConfigured,
}: HeroSettingsFormProps) {
  // Konten Hero State
  const [judul, setJudul] = useState(initialKonten.judul);
  const [subjudul, setSubjudul] = useState(initialKonten.subjudul);
  const [ctaUtamaLabel, setCtaUtamaLabel] = useState(initialKonten.ctaUtamaLabel);

  // Slides State
  const [slides, setSlides] = useState<HeroSlideData[]>(initialSlides);
  const [activePreviewIndex, setActivePreviewIndex] = useState(0);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");

  // Status & Feedback State
  const [feedback, setFeedback] = useState<{
    type: "success" | "error" | "info";
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

  const [isSavingKonten, startSaveKonten] = useTransition();
  const [isSlideActionPending, startSlideAction] = useTransition();

  // Modal Tambah Slide State (komponen terpisah)
  const [showAddModal, setShowAddModal] = useState(false);

  // Modal Hapus Slide State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [slideToDelete, setSlideToDelete] = useState<HeroSlideData | null>(null);

  // File input ref for replacing an existing slide's image
  const replaceFileInputRef = useRef<HTMLInputElement>(null);
  const [targetSlideIdForReplace, setTargetSlideIdForReplace] = useState<number | null>(null);

  // Handle Simpan Teks Utama ke Database
  const handleSaveKonten = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setFeedback(null);

    startSaveKonten(async () => {
      const res = await saveHeroKontenAction({
        judul,
        subjudul,
        ctaUtamaLabel,
      });

      if (res.success) {
        setFeedback({
          type: "success",
          message: "Perubahan teks Hero Banner berhasil disimpan ke database!",
        });
        setTimeout(() => setFeedback(null), 4000);
      } else {
        setFeedback({
          type: "error",
          message: res.error || "Gagal menyimpan teks hero.",
        });
      }
    });
  };

  // Handle Toggle Aktif / Nonaktif Slide
  const handleToggleSlide = (slide: HeroSlideData) => {
    setFeedback(null);
    const newStatus = !slide.isActive;

    // Optimistic UI update
    setSlides((prev) =>
      prev.map((s) => (s.id === slide.id ? { ...s, isActive: newStatus } : s))
    );

    startSlideAction(async () => {
      const res = await updateHeroSlideAction(slide.id, { isActive: newStatus });
      if (!res.success) {
        // Rollback
        setSlides((prev) =>
          prev.map((s) => (s.id === slide.id ? { ...s, isActive: slide.isActive } : s))
        );
        setFeedback({
          type: "error",
          message: res.error || "Gagal mengubah status slide.",
        });
      } else {
        setFeedback({
          type: "success",
          message: `Slide "${slide.title}" sekarang ${newStatus ? "Aktif" : "Nonaktif"}.`,
        });
        setTimeout(() => setFeedback(null), 3000);
      }
    });
  };

  // Handle Trigger Replace Foto Slide
  const handleTriggerReplaceImage = (slideId: number) => {
    setTargetSlideIdForReplace(slideId);
    replaceFileInputRef.current?.click();
  };

  const handleFileChangeForReplace = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || targetSlideIdForReplace === null) return;

    setFeedback(null);
    const slideId = targetSlideIdForReplace;

    const formData = new FormData();
    formData.append("imageFile", file);

    startSlideAction(async () => {
      const res = await replaceHeroSlideImageAction(slideId, formData);
      if (res.success && res.data) {
        setSlides((prev) =>
          prev.map((s) => (s.id === slideId ? (res.data as HeroSlideData) : s))
        );
        setFeedback({
          type: "success",
          message: res.message || "Gambar slide berhasil diperbarui dan dikompresi ke ~200KB!",
        });
        setTimeout(() => setFeedback(null), 5000);
      } else {
        setFeedback({
          type: "error",
          message: res.error || "Gagal mengganti foto slide.",
        });
      }
      setTargetSlideIdForReplace(null);
      if (replaceFileInputRef.current) replaceFileInputRef.current.value = "";
    });
  };

  // Handle Buka Modal Hapus Slide
  const handleDeleteSlide = (slide: HeroSlideData) => {
    setSlideToDelete(slide);
    setShowDeleteModal(true);
  };

  // Eksekusi Konfirmasi Hapus Slide
  const handleConfirmDeleteSlide = async () => {
    if (!slideToDelete) return;
    const targetSlide = slideToDelete;

    setFeedback(null);
    startSlideAction(async () => {
      const res = await deleteHeroSlideAction(targetSlide.id);
      if (res.success) {
        setSlides((prev) => prev.filter((s) => s.id !== targetSlide.id));
        if (activePreviewIndex >= slides.length - 1) {
          setActivePreviewIndex(0);
        }
        setShowDeleteModal(false);
        setSlideToDelete(null);
        setFeedback({
          type: "success",
          message: `Slide "${targetSlide.title}" berhasil dihapus dari database & storage.`,
        });
        setTimeout(() => setFeedback(null), 3000);
      } else {
        setFeedback({
          type: "error",
          message: res.error || "Gagal menghapus slide.",
        });
      }
    });
  };

  // Handle Tambah Slide Baru dari Modal
  const handleAddSlideFromModal = async (formData: FormData) => {
    const res = await createHeroSlideAction(formData);
    if (res.success && res.data) {
      setSlides((prev) => [...prev, res.data as HeroSlideData]);
      setShowAddModal(false);
      setFeedback({
        type: "success",
        message: res.message || "Slide baru berhasil ditambahkan!",
      });
      setTimeout(() => setFeedback(null), 5000);
    } else {
      setFeedback({
        type: "error",
        message: res.error || "Gagal menambahkan slide.",
      });
    }
  };

  const currentPreviewSlide = slides[activePreviewIndex] || slides[0];

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Hidden File Input for Image Replacement */}
      <input
        ref={replaceFileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/jpg"
        className="hidden"
        onChange={handleFileChangeForReplace}
      />

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


      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-orange">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Pengaturan Hero Section</span>
          </div>
          <h1 className="text-2xl font-black text-navy-900 dark:text-white font-brand mt-1">
            Hero Banner & Slider
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Kelola judul utama, teks pengantar, tombol CTA, dan galeri slide foto beranda.
          </p>
        </div>

        <button
          onClick={() => handleSaveKonten()}
          disabled={isSavingKonten}
          type="button"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#ff7a1a] to-[#f26a0f] px-5 py-2.5 text-xs font-bold text-white shadow-cta hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
        >
          {isSavingKonten ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Menyimpan ke Database...</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              <span>Simpan Perubahan Teks</span>
            </>
          )}
        </button>
      </div>

      {/* Main Grid: Form di Kiri & Live Preview di Kanan */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Editor Form (7 Kolom) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Box 1: Teks Utama Headline & CTA */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h2 className="text-xs font-extrabold text-navy-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-navy-900 text-white dark:bg-sky-500 text-[10px]">
                  1
                </span>
                <span>Teks Headline & Tombol Panggilan Aksi (CTA)</span>
              </h2>
              <span className="text-[10px] font-semibold text-slate-400">
                Tabel: HeroKonten
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Judul Utama (Headline)
              </label>
              <input
                type="text"
                value={judul}
                onChange={(e) => setJudul(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 focus:border-brand-orange focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white transition-colors"
                placeholder="Masukkan judul utama..."
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Sub-judul / Narasi Pengantar Layanan
              </label>
              <textarea
                rows={3}
                value={subjudul}
                onChange={(e) => setSubjudul(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-brand-orange focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white transition-colors"
                placeholder="Masukkan deskripsi pengantar..."
              />
            </div>

            <div className="pt-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Label Tombol CTA Hero
              </label>
              <input
                type="text"
                value={ctaUtamaLabel}
                onChange={(e) => setCtaUtamaLabel(e.target.value)}
                placeholder="Akses Layanan AMPERA"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 focus:border-brand-orange focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white transition-colors"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Tombol tunggal aksi hero yang mengarahkan pengunjung ke daftar layanan AMPERA (default: &quot;Akses Layanan AMPERA&quot;).
              </p>
            </div>
          </div>

          {/* Box 2: Slide Foto Banner */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div>
                <h2 className="text-xs font-extrabold text-navy-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-navy-900 text-white dark:bg-sky-500 text-[10px]">
                    2
                  </span>
                  <span>Daftar Slide Foto Hero ({slides.length} Slide)</span>
                </h2>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Foto slider akan otomatis dikompresi ke ~200KB saat diunggah.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800/60 px-3.5 py-2 text-xs font-bold text-brand-orange hover:bg-brand-orange hover:text-white transition-all shadow-xs"
              >
                <Plus className="h-4 w-4" />
                <span>Tambah Slide Baru</span>
              </button>
            </div>

            {/* List of Slide Cards */}
            <div className="space-y-3.5">
              {slides.map((slide, idx) => (
                <div
                  key={slide.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border p-4 transition-all ${
                    activePreviewIndex === idx
                      ? "border-brand-orange bg-orange-50/25 dark:border-orange-500/50 dark:bg-orange-950/20 ring-1 ring-brand-orange/30 shadow-sm"
                      : "border-slate-200/80 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/40 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Thumbnail dengan Preview Trigger */}
                    <button
                      type="button"
                      onClick={() => setActivePreviewIndex(idx)}
                      title="Klik untuk melihat di Live Preview"
                      className="group relative h-16 w-24 sm:h-18 sm:w-28 shrink-0 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-900 shadow-2xs"
                    >
                      <Image
                        src={slide.imageUrl}
                        alt={slide.alt || slide.title}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Eye className="h-4 w-4 text-white" />
                      </div>
                      <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1 py-0.5 text-[9px] font-bold text-white">
                        #{idx + 1}
                      </span>
                    </button>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-navy-900 dark:text-white truncate">
                          {slide.title}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-400 truncate" title={slide.alt}>
                        {slide.alt || "Tanpa deskripsi alt"}
                      </p>

                 
                    </div>
                  </div>

                  {/* Right side of slide card: Toggle Status & Actions */}
                  <div className="flex items-center gap-3 self-end sm:self-center shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 w-full sm:w-auto justify-between sm:justify-end">
                    {/* Switch Toggle Aktif */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleSlide(slide)}
                        disabled={isSlideActionPending}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          slide.isActive ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
                        }`}
                        title={slide.isActive ? "Klik untuk menonaktifkan" : "Klik untuk mengaktifkan"}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            slide.isActive ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                      <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                        {slide.isActive ? "Aktif" : "Mati"}
                      </span>
                    </div>

                    <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleTriggerReplaceImage(slide.id)}
                        disabled={isSlideActionPending}
                        className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors shadow-2xs"
                        title="Ganti foto slide ini (otomatis dikompres ~200KB)"
                      >
                        <Upload className="h-3.5 w-3.5 text-brand-orange" />
                        <span>Ganti Foto</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteSlide(slide)}
                        disabled={isSlideActionPending}
                        className="rounded-xl border border-red-200 bg-red-50/60 p-2 text-red-600 hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-900/60 transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-2xs cursor-pointer"
                        title="Hapus slide"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Live Visual Preview (5 Kolom) */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-6 self-start">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300">
              <Eye className="h-4 w-4 text-brand-orange" />
              <span>Pratinjau Tampilan Beranda</span>
            </span>

            {/* Toggle Preview Device */}
            <div className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl text-slate-500">
              <button
                type="button"
                onClick={() => setPreviewDevice("desktop")}
                className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
                  previewDevice === "desktop"
                    ? "bg-white dark:bg-slate-900 text-navy-900 dark:text-white shadow-xs"
                    : "hover:text-slate-900 dark:hover:text-white"
                }`}
                title="Tampilan Desktop"
              >
                <Monitor className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice("mobile")}
                className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
                  previewDevice === "mobile"
                    ? "bg-white dark:bg-slate-900 text-navy-900 dark:text-white shadow-xs"
                    : "hover:text-slate-900 dark:hover:text-white"
                }`}
                title="Tampilan Ponsel"
              >
                <Smartphone className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Scaled Preview Frame */}
          <div
            className={`relative overflow-hidden rounded-3xl border-2 border-slate-200/90 bg-gradient-to-br from-white via-sky-50 to-sky-100 shadow-md dark:border-slate-800 dark:from-slate-950 dark:via-[#06122e] dark:to-[#0b1f4d] transition-all mx-auto ${
              previewDevice === "mobile" ? "max-w-[320px] p-4" : "w-full p-6"
            }`}
          >
            <div className="space-y-4">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-navy-900/10 px-2.5 py-1 text-[10px] font-bold text-navy-900 dark:bg-sky-400/20 dark:text-sky-300">
                <ShieldCheck className="h-3 w-3 text-brand-orange" />
                <span>BBPOM DI PALEMBANG</span>
              </div>

              <h3
                className={`font-black text-navy-900 dark:text-white font-brand leading-tight ${
                  previewDevice === "mobile" ? "text-sm" : "text-base"
                }`}
              >
                {judul || "Judul Utama Hero..."}
              </h3>

              <p
                className={`text-slate-600 dark:text-slate-300 leading-relaxed ${
                  previewDevice === "mobile" ? "text-[10px] line-clamp-2" : "text-[11px] line-clamp-3"
                }`}
              >
                {subjudul || "Deskripsi pengantar layanan..."}
              </p>

              {/* Action Button Mockup (Sesuai Tombol Tunggal di Hero Section) */}
              <div className="pt-1">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#ff7a1a] to-[#f26a0f] px-4 py-2 text-[10px] sm:text-[11px] font-bold text-white shadow-cta">
                  <span>{ctaUtamaLabel || "Akses Layanan AMPERA"}</span>
                  <ArrowRight className="h-3 w-3" />
                </span>
              </div>

              {/* Slider Preview Thumbnail dengan Tombol Navigasi Slide Lengkap */}
              <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Foto Slider Terpilih (#{activePreviewIndex + 1}/{slides.length})
                  </span>

                  {/* Tombol Slide di Header (Tombol Prev, Titik Indikator, Tombol Next) */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        setActivePreviewIndex((prev) => (prev - 1 + slides.length) % slides.length)
                      }
                      className="p-1 rounded-lg hover:bg-slate-200/80 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                      title="Slide Sebelumnya"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </button>

                    <div className="flex gap-1 items-center">
                      {slides.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActivePreviewIndex(idx)}
                          className={`h-2 rounded-full transition-all ${
                            activePreviewIndex === idx
                              ? "w-5 bg-brand-orange"
                              : "w-2 bg-slate-300 dark:bg-slate-700"
                          }`}
                          title={`Lihat slide #${idx + 1}`}
                        />
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setActivePreviewIndex((prev) => (prev + 1) % slides.length)
                      }
                      className="p-1 rounded-lg hover:bg-slate-200/80 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                      title="Slide Selanjutnya"
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Box Foto Slider dengan Tombol Slide Melayang (Floating Slide Buttons) */}
                <div className="group relative h-40 sm:h-48 w-full overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-900 shadow-inner">
                  {currentPreviewSlide?.imageUrl && (
                    <Image
                      src={currentPreviewSlide.imageUrl}
                      alt={currentPreviewSlide.alt || "Preview"}
                      fill
                      className="object-cover transition-all duration-500"
                    />
                  )}

                  {/* Tombol Slide Melayang Kiri & Kanan di atas foto */}
                  {slides.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          setActivePreviewIndex((prev) => (prev - 1 + slides.length) % slides.length)
                        }
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-xs transition-all shadow-md hover:scale-110 active:scale-95"
                        title="Slide Sebelumnya"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setActivePreviewIndex((prev) => (prev + 1) % slides.length)
                        }
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-xs transition-all shadow-md hover:scale-110 active:scale-95"
                        title="Slide Selanjutnya"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </>
                  )}

                  {/* Caption Judul & Deskripsi Slide */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-3.5 pointer-events-none">
                    <span className="text-xs font-bold text-white drop-shadow-xs">
                      {currentPreviewSlide?.title || "Judul Slide"}
                    </span>
                    <span className="text-[10px] text-slate-300 truncate drop-shadow-xs">
                      {currentPreviewSlide?.alt || "Deskripsi alt"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Terpisah Tambah Slide */}
      <AddSlideModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddSlideFromModal}
        isPending={isSlideActionPending}
        isStorageConfigured={isStorageConfigured}
      />

      {/* Modal Kustom Hapus Slide */}
      <DeleteSlideModal
        isOpen={showDeleteModal}
        onClose={() => {
          if (!isSlideActionPending) {
            setShowDeleteModal(false);
            setSlideToDelete(null);
          }
        }}
        onConfirm={handleConfirmDeleteSlide}
        slide={slideToDelete}
        totalSlides={slides.length}
        isPending={isSlideActionPending}
      />
    </div>
  );
}

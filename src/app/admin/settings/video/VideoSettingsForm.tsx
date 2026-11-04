"use client";

import React, { useState, useTransition, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  Video,
  Play,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  Star,
  ExternalLink,
  Loader2,
  X,
  Sparkles,
  Check,
  XCircle,
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Film,
} from "lucide-react";
import {
  createVideoAction,
  updateVideoAction,
  deleteVideoAction,
  toggleVideoStatusAction,
  type VideoItemData,
} from "@/app/actions/settings-video";
import { extractYouTubeId } from "@/lib/youtube";
import { useAdminLoading } from "@/context/AdminLoadingContext";

function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

interface VideoSettingsFormProps {
  initialList?: VideoItemData[];
  initialData?: VideoItemData;
}

export function VideoSettingsForm({ initialList, initialData }: VideoSettingsFormProps) {
  // Inisialisasi daftar video
  const [videos, setVideos] = useState<VideoItemData[]>(() => {
    if (initialList && initialList.length > 0) return initialList;
    if (initialData) return [initialData];
    return [];
  });

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // State Feedback Banner
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const { showLoading, hideLoading } = useAdminLoading();

  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  const [isPending, startTransition] = useTransition();

  // State Modal Tambah / Edit Video
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<VideoItemData | null>(null);

  // Form Fields di dalam Modal
  const [formEyebrow, setFormEyebrow] = useState("");
  const [formJudul, setFormJudul] = useState("");
  const [formYoutubeUrl, setFormYoutubeUrl] = useState("");
  const [formDeskripsi, setFormDeskripsi] = useState("");
  const [formUrutan, setFormUrutan] = useState(1);
  const [formIsActive, setFormIsActive] = useState(true);

  // Deteksi YouTube ID di dalam Modal Form
  const formYouTubeId = useMemo(() => {
    return extractYouTubeId(formYoutubeUrl);
  }, [formYoutubeUrl]);

  // State Modal Hapus Video
  const [deleteTarget, setDeleteTarget] = useState<VideoItemData | null>(null);

  // State Modal Uji Putar Video
  const [playingVideo, setPlayingVideo] = useState<VideoItemData | null>(null);

  // Index Pratinjau Slider Sinematik di Kolom Kanan
  const [previewIndex, setPreviewIndex] = useState(0);
  const activePreviewVideo = videos[previewIndex] || videos[0];

  // Kunci scroll body saat salah satu modal sedang terbuka
  useEffect(() => {
    if (isModalOpen || Boolean(deleteTarget) || Boolean(playingVideo)) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isModalOpen, deleteTarget, playingVideo]);

  // Buka Modal Tambah
  const handleOpenAddModal = () => {
    setEditingVideo(null);
    setFormEyebrow("DEDIKASI, INTEGRITAS & PELAYANAN PUBLIK PRIMA");
    setFormJudul("");
    setFormYoutubeUrl("");
    setFormDeskripsi("");
    setFormUrutan(videos.length + 1);
    setFormIsActive(true);
    setIsModalOpen(true);
  };

  // Buka Modal Edit
  const handleOpenEditModal = (video: VideoItemData) => {
    setEditingVideo(video);
    setFormEyebrow(video.eyebrow);
    setFormJudul(video.judul);
    setFormYoutubeUrl(video.youtubeUrl);
    setFormDeskripsi(video.deskripsi);
    setFormUrutan(video.urutan);
    setFormIsActive(video.isActive);
    setIsModalOpen(true);
  };

  // Simpan Video (Tambah Baru / Edit)
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!formYouTubeId) {
      setFeedback({
        type: "error",
        message: "Format URL YouTube tidak valid. Pastikan link YouTube yang dimasukkan benar.",
      });
      return;
    }

    showLoading({
      actionType: "save",
      title: editingVideo ? "Menyimpan Perubahan Video..." : "Menambahkan Video Baru...",
      description: "Sedang memvalidasi dan menyimpan metadata video YouTube ke database BBPOM...",
    });

    startTransition(async () => {
      try {
        if (editingVideo) {
          // Edit video yang sudah ada
          const res = await updateVideoAction(editingVideo.id, {
            eyebrow: formEyebrow,
            judul: formJudul,
            deskripsi: formDeskripsi,
            youtubeUrl: formYoutubeUrl,
            urutan: formUrutan,
            isActive: formIsActive,
          });

          if (res.success && res.data) {
            setVideos((prev) =>
              prev.map((v) => (v.id === editingVideo.id ? (res.data as VideoItemData) : v))
            );
            setIsModalOpen(false);
            setFeedback({
              type: "success",
              message: `Video "${res.data.judul}" berhasil diperbarui!`,
            });
          } else {
            setFeedback({
              type: "error",
              message: res.error || "Gagal memperbarui video.",
            });
          }
        } else {
          // Tambah video baru
          const res = await createVideoAction({
            eyebrow: formEyebrow,
            judul: formJudul,
            deskripsi: formDeskripsi,
            youtubeUrl: formYoutubeUrl,
            urutan: formUrutan,
            isActive: formIsActive,
          });

          if (res.success && res.data) {
            setVideos((prev) => [...prev, res.data as VideoItemData]);
            setIsModalOpen(false);
            setFeedback({
              type: "success",
              message: `Video baru "${res.data.judul}" berhasil ditambahkan!`,
            });
          } else {
            setFeedback({
              type: "error",
              message: res.error || "Gagal menambahkan video baru.",
            });
          }
        }
      } finally {
        hideLoading();
      }
    });
  };

  // Toggle Status Aktif / Non-Aktif
  const handleToggleStatus = (video: VideoItemData) => {
    showLoading({
      actionType: "process",
      title: "Mengubah Status Video...",
      description: `Sedang memperbarui status video "${video.judul}"...`,
    });
    startTransition(async () => {
      try {
        const res = await toggleVideoStatusAction(video.id);
        if (res.success) {
          setVideos((prev) =>
            prev.map((v) => (v.id === video.id ? { ...v, isActive: !v.isActive } : v))
          );
          setFeedback({
            type: "success",
            message: `Status video "${video.judul}" diubah menjadi ${
              !video.isActive ? "Aktif" : "Non-Aktif"
            }.`,
          });
        } else {
          setFeedback({
            type: "error",
            message: res.error || "Gagal mengubah status video.",
          });
        }
      } finally {
        hideLoading();
      }
    });
  };

  // Konfirmasi & Eksekusi Hapus Video
  const handleConfirmDelete = () => {
    if (!deleteTarget) return;

    showLoading({
      actionType: "delete",
      title: "Menghapus Video...",
      description: `Sedang menghapus video "${deleteTarget.judul}" dari database BBPOM...`,
    });
    startTransition(async () => {
      try {
        const res = await deleteVideoAction(deleteTarget.id);
        if (res.success) {
          setVideos((prev) => prev.filter((v) => v.id !== deleteTarget.id));
          setDeleteTarget(null);
          if (previewIndex >= videos.length - 1) {
            setPreviewIndex(Math.max(0, videos.length - 2));
          }
          setFeedback({
            type: "success",
            message: `Video "${deleteTarget.judul}" berhasil dihapus.`,
          });
        } else {
          setFeedback({
            type: "error",
            message: res.error || "Gagal menghapus video.",
          });
        }
      } finally {
        hideLoading();
      }
    });
  };

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

      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-orange">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Pengaturan Video Profil &amp; Dokumentasi</span>
          </div>
          <h1 className="text-2xl font-black text-navy-900 dark:text-white font-brand mt-1">
            Kelola Video Profil
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Kelola daftar video YouTube resmi BBPOM Palembang yang tampil sebagai slider sinematik di halaman depan.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          type="button"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#ff7a1a] to-[#f26a0f] px-5 py-2.5 text-xs font-bold text-white shadow-cta hover:brightness-110 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Video Baru</span>
        </button>
      </div>

      {/* Layout Grid: Daftar Video (Kiri 7 Kolom) & Pratinjau Slider Sinematik (Kanan 5 Kolom) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Kolom Kiri: Daftar Video Cards (7 Kolom) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-navy-900 dark:text-white flex items-center gap-2">
              <Film className="w-4 h-4 text-brand-orange" />
              <span>Daftar Video ({videos.length} Item)</span>
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {videos.filter((v) => v.isActive).length} Video Aktif Tampil di Slider
            </span>
          </div>

          {videos.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 p-8 text-center bg-white dark:bg-slate-900 dark:border-slate-800">
              <Film className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-navy-900 dark:text-white">Belum Ada Video</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
                Tambahkan video profil YouTube pertama untuk ditampilkan di landing page.
              </p>
              <button
                type="button"
                onClick={handleOpenAddModal}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-orange px-4 py-2 text-xs font-bold text-white shadow-cta"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Video Sekarang</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3.5">
              {videos.map((video, idx) => {
                const isSelectedForPreview = idx === previewIndex;
                return (
                  <div
                    key={video.id}
                    className={`rounded-2xl border transition-all p-4 bg-white dark:bg-slate-900 ${
                      isSelectedForPreview
                        ? "border-brand-orange ring-1 ring-brand-orange shadow-md"
                        : "border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row gap-4 items-start">
                      {/* Thumbnail YouTube Preview */}
                      <div
                        onClick={() => setPlayingVideo(video)}
                        className="relative w-full sm:w-44 aspect-video rounded-xl overflow-hidden bg-slate-950 shrink-0 cursor-pointer group shadow-sm"
                        title="Klik untuk putar video"
                      >
                        <Image
                          src={`https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`}
                          alt={video.judul}
                          fill
                          unoptimized
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-center justify-center transition-colors">
                          <div className="w-9 h-9 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <Play className="w-4 h-4 fill-current ml-0.5" />
                          </div>
                        </div>
                        <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-black/70 text-[9px] font-bold text-white">
                          #{video.urutan}
                        </div>
                      </div>

                      {/* Info Video */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-orange truncate">
                            {video.eyebrow}
                          </span>
                          {/* Toggle Active Badge */}
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(video)}
                            disabled={isPending}
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                              video.isActive
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-200"
                                : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-300"
                            }`}
                            title="Klik untuk mengubah status aktif"
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                video.isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                              }`}
                            />
                            <span>{video.isActive ? "Aktif" : "Non-Aktif"}</span>
                          </button>
                        </div>

                        <h3 className="font-bold text-sm text-navy-900 dark:text-white leading-snug line-clamp-2">
                          {video.judul}
                        </h3>

                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {video.deskripsi}
                        </p>

                        <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                          {/* External Link */}
                          <a
                            href={video.youtubeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-brand-orange truncate max-w-[180px]"
                          >
                            <YouTubeIcon className="w-3.5 h-3.5 text-red-600 shrink-0" />
                            <span className="truncate">Buka Link</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>

                          {/* Tombol Aksi */}
                          <div className="flex items-center gap-1.5">
                            {/* Tombol Pilih untuk Preview Mockup */}
                            <button
                              type="button"
                              onClick={() => setPreviewIndex(idx)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                                isSelectedForPreview
                                  ? "bg-brand-orange text-white"
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                              }`}
                              title="Tampilkan di Pratinjau Slider Sebelah Kanan"
                            >
                              Pratinjau
                            </button>

                            {/* Tombol Edit */}
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(video)}
                              className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors cursor-pointer"
                              title="Edit Video"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>

                            {/* Tombol Hapus */}
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(video)}
                              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                              title="Hapus Video"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Kolom Kanan: Pratinjau Sinematik Slider (5 Kolom) */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-6 self-start">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300">
              <Eye className="h-4 w-4 text-brand-orange" />
              <span>Pratinjau Slider Sinematik</span>
            </span>

            {/* Slider Switcher Controls */}
            {videos.length > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    setPreviewIndex((prev) => (prev - 1 + videos.length) % videos.length)
                  }
                  className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 cursor-pointer"
                  title="Slide Sebelumnya"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 px-1">
                  {previewIndex + 1} / {videos.length}
                </span>
                <button
                  type="button"
                  onClick={() => setPreviewIndex((prev) => (prev + 1) % videos.length)}
                  className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 cursor-pointer"
                  title="Slide Berikutnya"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Kotak Sinematik Sesuai Tampilan Landing Page VideoSection */}
          {activePreviewVideo ? (
            <div className="group relative overflow-hidden rounded-3xl min-h-[380px] sm:min-h-[420px] flex items-center justify-center text-center p-6 sm:p-8 shadow-xl border border-slate-200/90 dark:border-slate-800 transition-all select-none">
              {/* Foto Thumbnail YouTube / Background */}
              <Image
                key={activePreviewVideo.youtubeId || "default"}
                src={
                  activePreviewVideo.youtubeId
                    ? `https://img.youtube.com/vi/${activePreviewVideo.youtubeId}/hqdefault.jpg`
                    : "/assets-landingpage/hero1.png"
                }
                alt={activePreviewVideo.judul || "Gedung Balai Besar POM di Palembang"}
                fill
                unoptimized={Boolean(activePreviewVideo.youtubeId)}
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />

              {/* Gradient Overlay Sinematik Gelap */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-navy-950/80 to-black/70 dark:from-black/95 dark:via-slate-950/85 dark:to-black/80" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.5)_100%)] pointer-events-none" />

              {/* Konten Pratinjau Teks & Play Button */}
              <div
                key={activePreviewVideo.id}
                className="relative z-10 flex flex-col items-center max-w-sm space-y-3.5 animate-fade-in"
              >
                {/* 5 Golden Stars */}
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-amber-400 drop-shadow" />
                  ))}
                </div>

                {/* Eyebrow Tagline */}
                <span className="text-[9px] uppercase tracking-widest text-white/85 font-semibold px-2">
                  {activePreviewVideo.eyebrow}
                </span>

                {/* Judul Utama Video (Font Serif) */}
                <h3 className="font-serif text-base sm:text-lg text-white font-normal leading-snug drop-shadow-sm px-2">
                  {activePreviewVideo.judul}
                </h3>

                {/* Deskripsi Singkat */}
                <p className="text-[10px] sm:text-[11px] text-white/75 leading-relaxed line-clamp-3 font-light max-w-xs px-2">
                  {activePreviewVideo.deskripsi}
                </p>

                {/* Tombol Play Interaktif */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setPlayingVideo(activePreviewVideo)}
                    className="group/btn inline-flex items-center gap-2.5 text-white transition-all cursor-pointer hover:scale-105 active:scale-95"
                    title="Klik untuk uji putar video"
                  >
                    <div className="relative h-11 w-11 rounded-full bg-gradient-to-br from-[#ff8a1f] to-[#f26a0f] text-white flex items-center justify-center shadow-cta ring-4 ring-white/30 group-hover/btn:ring-white/50 transition-all">
                      <Play className="h-4 w-4 fill-current ml-0.5" />
                    </div>
                    <span className="text-xs font-semibold text-white/95 group-hover/btn:underline">
                      Tonton Video Profil
                    </span>
                  </button>
                </div>
              </div>

              {/* Badge Status YouTube di Sudut Bawah */}
              <div className="absolute bottom-3 inset-x-3 flex items-center justify-between text-[10px] text-white/70 px-2 py-1 rounded-xl bg-black/40 backdrop-blur-xs">
                <span className="flex items-center gap-1 truncate">
                  <YouTubeIcon className="h-3.5 w-3.5 text-red-500 shrink-0" />
                  <span className="truncate">ID: {activePreviewVideo.youtubeId}</span>
                </span>
                <span className="text-emerald-400 font-semibold shrink-0">Live Mockup</span>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL TAMBAH / EDIT VIDEO                                                 */}
      {/* ========================================================================= */}
      {mounted && isModalOpen && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 bg-navy-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 flex flex-col">
            {/* Header Modal */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#ff7a1a] to-[#f26a0f] text-white flex items-center justify-center shadow-cta">
                  <Video className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-navy-900 dark:text-white">
                    {editingVideo ? "Edit Video Profil" : "Tambah Video Baru"}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {editingVideo
                      ? "Perbarui informasi dan tautan video"
                      : "Masukkan tautan YouTube dan keterangan pengantar"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmitForm} className="p-6 space-y-4">
              {/* URL YouTube */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    URL Video YouTube *
                  </label>
                  {formYouTubeId ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>ID: {formYouTubeId}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                      <AlertCircle className="h-3 w-3" />
                      <span>Masukkan Link YouTube</span>
                    </span>
                  )}
                </div>

                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-red-600">
                    <YouTubeIcon className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={formYoutubeUrl}
                    onChange={(e) => setFormYoutubeUrl(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-xs sm:text-sm font-mono text-slate-900 focus:border-brand-orange focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white transition-colors"
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Mendukung format link YouTube standar (watch?v=), link pendek (youtu.be/), atau YouTube Shorts.
                </p>
              </div>

              {/* Tagline Eyebrow */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Tagline Atas (Eyebrow Uppercase) *
                </label>
                <input
                  type="text"
                  required
                  value={formEyebrow}
                  onChange={(e) => setFormEyebrow(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs sm:text-sm font-semibold tracking-wider uppercase text-slate-900 focus:border-brand-orange focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white transition-colors"
                  placeholder="DEDIKASI, INTEGRITAS & PELAYANAN PUBLIK PRIMA"
                />
              </div>

              {/* Judul Utama Video */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Judul Video *
                </label>
                <input
                  type="text"
                  required
                  value={formJudul}
                  onChange={(e) => setFormJudul(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 focus:border-brand-orange focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white transition-colors"
                  placeholder="Mengenal Lebih Dekat Dedikasi & Layanan BBPOM di Palembang"
                />
              </div>

              {/* Deskripsi Narasi */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Deskripsi / Narasi Pengantar *
                </label>
                <textarea
                  rows={3}
                  required
                  value={formDeskripsi}
                  onChange={(e) => setFormDeskripsi(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-brand-orange focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white transition-colors"
                  placeholder="Tuliskan ringkasan mengenai isi video dokumentasi ini..."
                />
              </div>

              {/* Baris Bawah: Urutan & Status Aktif */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Urutan Tampil Slide (1, 2, 3...)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formUrutan}
                    onChange={(e) => setFormUrutan(parseInt(e.target.value) || 1)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-brand-orange focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Status Tampil di Beranda
                  </label>
                  <label className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsActive}
                      onChange={(e) => setFormIsActive(e.target.checked)}
                      className="w-4 h-4 rounded text-brand-orange focus:ring-brand-orange"
                    />
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {formIsActive ? "Aktif (Tampil di Slider)" : "Non-Aktif (Disembunyikan)"}
                    </span>
                  </label>
                </div>
              </div>

              {/* Footer Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending || !formYouTubeId}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#ff7a1a] to-[#f26a0f] text-xs font-bold text-white shadow-cta hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{editingVideo ? "Simpan Perubahan" : "Tambahkan Video"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ========================================================================= */}
      {/* MODAL KONFIRMASI HAPUS                                                    */}
      {/* ========================================================================= */}
      {mounted && deleteTarget && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-base text-navy-900 dark:text-white">
                Hapus Video Ini?
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Apakah Anda yakin ingin menghapus video{" "}
                <strong className="text-slate-800 dark:text-slate-200">
                  &quot;{deleteTarget.judul}&quot;
                </strong>
                ? Video ini tidak akan lagi tampil pada slider sinematik landing page.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={handleConfirmDelete}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-rose-600 text-xs font-bold text-white hover:bg-rose-700 active:scale-95 transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Hapus Sekarang</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ========================================================================= */}
      {/* MODAL UJI PUTAR VIDEO YOUTUBE                                             */}
      {/* ========================================================================= */}
      {mounted && playingVideo && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 bg-navy-950/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-3xl rounded-3xl bg-slate-900 shadow-2xl border border-slate-800 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/60 text-white">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 rounded-lg bg-red-600 text-white flex items-center justify-center shrink-0">
                  <Play className="w-3 h-3 fill-current ml-0.5" />
                </div>
                <span className="font-bold text-xs truncate">
                  Uji Player YouTube: {playingVideo.judul}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPlayingVideo(null)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
                title="Tutup Player"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="relative aspect-video w-full bg-black">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${playingVideo.youtubeId}?autoplay=1&rel=0`}
                title="YouTube Video Player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0 h-full w-full border-0"
              />
            </div>

            <div className="px-5 py-3 bg-slate-950 text-[11px] text-slate-400 flex items-center justify-between">
              <span>
                Video ID: <strong className="text-white font-mono">{playingVideo.youtubeId}</strong>
              </span>
              <button
                type="button"
                onClick={() => setPlayingVideo(null)}
                className="rounded-lg bg-slate-800 px-3 py-1 text-white hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

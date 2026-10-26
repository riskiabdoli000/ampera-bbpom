"use client";

import React, { useState } from "react";
import {
  BookOpen,
  GraduationCap,
  Lightbulb,
  Video,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  Save,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface EduCard {
  id: string;
  title: string;
  description: string;
  category: string;
  actionText: string;
  isAktif: boolean;
}

export default function AdminEdukasiSettingsPage() {
  const [cards, setCards] = useState<EduCard[]>([
    {
      id: "farmasi",
      title: "Ketersediaan Farmasi",
      description: "Baca informasi dan wawasan edukatif seputar keamanan obat & pangan.",
      category: "Obat & Farmasi",
      actionText: "Baca Artikel",
      isAktif: true,
    },
    {
      id: "pangan",
      title: "Keamanan Pangan",
      description: "Pelajari panduan praktis cara Cek KLIK, izin edar, dan higienitas.",
      category: "Pangan Olahan",
      actionText: "Lihat Panduan",
      isAktif: true,
    },
    {
      id: "cek-bpom",
      title: "Cek BPOM (KLIK)",
      description: "Temukan tips cerdas memilih produk yang aman dan teruji bermutu.",
      category: "Konsumen Cerdas",
      actionText: "Pelajari Tips",
      isAktif: true,
    },
    {
      id: "info-umum",
      title: "Informasi Umum & Video",
      description: "Belajar melalui konten visual menarik dan video animasi edukasi.",
      category: "Media & Edukasi",
      actionText: "Tonton Video",
      isAktif: true,
    },
  ]);

  const [isSaved, setIsSaved] = useState(false);
  const [editingCard, setEditingCard] = useState<EduCard | null>(null);

  const toggleStatus = (id: string) => {
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isAktif: !c.isAktif } : c))
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-orange">
            <BookOpen className="h-3.5 w-3.5" />
            <span>Website Settings</span>
          </div>
          <h1 className="text-2xl font-extrabold text-navy-900 dark:text-white font-brand mt-1">
            Pengaturan Konten Edukasi
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Kelola modul dan kartu literasi keamanan obat dan makanan untuk masyarakat di landing page.
          </p>
        </div>

        <button
          onClick={handleSave}
          type="button"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#ff7a1a] to-[#f26a0f] px-5 py-2.5 text-xs font-bold text-white shadow-cta hover:brightness-110 transition-all hover:-translate-y-0.5"
        >
          {isSaved ? (
            <>
              <CheckCircle className="h-4 w-4" />
              <span>Tersimpan!</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              <span>Simpan Perubahan</span>
            </>
          )}
        </button>
      </div>

      {/* Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cards.map((item, idx) => (
          <div
            key={item.id}
            className={`rounded-3xl border bg-white p-6 shadow-sm transition-all duration-200 dark:bg-slate-900 ${
              item.isAktif
                ? "border-slate-200/80 dark:border-slate-800"
                : "border-slate-200/40 opacity-60 bg-slate-50 dark:bg-slate-950"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-sky-50 px-3 py-1 text-[11px] font-bold text-navy-900 dark:bg-sky-950/60 dark:text-sky-300">
                {item.category}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleStatus(item.id)}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-full transition-colors ${
                    item.isAktif
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                      : "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                  }`}
                >
                  {item.isAktif ? "Tayang" : "Nonaktif"}
                </button>
              </div>
            </div>

            <h3 className="mt-4 text-base font-bold text-navy-900 dark:text-white font-brand">
              {item.title}
            </h3>

            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {item.description}
            </p>

            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-orange">
                <span>{item.actionText}</span>
                <ArrowRight className="h-3 w-3" />
              </span>

              <button
                type="button"
                onClick={() => setEditingCard(item)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-navy-900 dark:text-slate-400 dark:hover:text-white"
              >
                <Edit2 className="h-3 w-3" />
                <span>Edit</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal (Mockup) */}
      {editingCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 animate-fade-up">
            <h3 className="text-base font-bold text-navy-900 dark:text-white font-brand">
              Edit Konten Edukasi: {editingCard.title}
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Judul Kartu
              </label>
              <input
                type="text"
                value={editingCard.title}
                onChange={(e) =>
                  setEditingCard({ ...editingCard, title: e.target.value })
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Deskripsi Singkat
              </label>
              <textarea
                rows={3}
                value={editingCard.description}
                onChange={(e) =>
                  setEditingCard({ ...editingCard, description: e.target.value })
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingCard(null)}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  setCards((prev) =>
                    prev.map((c) => (c.id === editingCard.id ? editingCard : c))
                  );
                  setEditingCard(null);
                }}
                className="rounded-xl bg-gradient-to-r from-[#ff7a1a] to-[#f26a0f] px-4 py-2 text-xs font-bold text-white shadow-cta hover:brightness-110"
              >
                Terapkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

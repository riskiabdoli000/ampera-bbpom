"use client";

import React, { useState, useEffect } from "react";
import { Search, X, ArrowRight, HelpCircle, FlaskConical, MessageSquareWarning, FileText } from "lucide-react";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SEARCH_ITEMS = [
  {
    title: "Layanan Permintaan Informasi",
    category: "Layanan",
    desc: "Konsultasi regulasi obat, makanan, kosmetik, izin edar MD/TR/NA",
    href: "#layanan",
    icon: HelpCircle,
    color: "text-blue-600 bg-blue-50",
  },
  {
    title: "Pengujian Cepat Ampera",
    category: "Layanan Unggulan",
    desc: "Uji cepat formalin, boraks, rhodamin B pada pangan khas lokal Palembang",
    href: "#layanan",
    icon: FlaskConical,
    color: "text-emerald-600 bg-emerald-50",
  },
  {
    title: "Layanan Pengaduan Masyarakat",
    category: "Pengaduan",
    desc: "Laporkan obat ilegal, kosmetik bermerkuri, makanan tanpa izin edar",
    href: "#layanan",
    icon: MessageSquareWarning,
    color: "text-rose-600 bg-rose-50",
  },
  {
    title: "Keterbukaan Informasi Publik (KIP)",
    category: "PPID",
    desc: "Permohonan informasi resmi PPID BBPOM di Palembang",
    href: "#layanan",
    icon: FileText,
    color: "text-indigo-600 bg-indigo-50",
  },
  {
    title: "Formulir Pendaftaran NIK Terintegrasi",
    category: "Formulir",
    desc: "Pengisian online mandiri terhubung dengan database Buku Tamu",
    href: "#daftar",
    icon: ArrowRight,
    color: "text-amber-600 bg-amber-50",
  },
];

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredItems = SEARCH_ITEMS.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.desc.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Cari layanan, informasi izin edar, pengujian cepat, atau pengaduan..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full text-sm sm:text-base text-slate-800 placeholder-slate-400 focus:outline-hidden"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Tutup pencarian"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-2">
          {filteredItems.length > 0 ? (
            filteredItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <a
                  key={idx}
                  href={item.href}
                  onClick={onClose}
                  className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group"
                >
                  <div className={`p-2.5 rounded-lg shrink-0 ${item.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 text-sm group-hover:text-teal-700 transition-colors">
                        {item.title}
                      </span>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{item.desc}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-teal-600 transition-colors self-center shrink-0" />
                </a>
              );
            })
          ) : (
            <div className="text-center py-10">
              <p className="text-sm text-slate-500">Tidak ada hasil yang sesuai dengan kata kunci &quot;{query}&quot;</p>
              <p className="text-xs text-slate-400 mt-1">Coba kata kunci lain seperti &quot;uji cepat&quot;, &quot;izin edar&quot;, atau &quot;layanan&quot;.</p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Tekan <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[11px] font-mono">ESC</kbd> untuk menutup</span>
          <span className="text-teal-700 font-medium">BBPOM di Palembang</span>
        </div>
      </div>
    </div>
  );
}

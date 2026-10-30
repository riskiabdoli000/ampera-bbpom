"use client";

import React, { useState } from "react";
import {
  Star,
  MessageSquareCheck,
  Lock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Award,
  AlertCircle,
} from "lucide-react";
import { EvaluasiGarda } from "./types";

interface EvaluasiFormProps {
  initialData?: EvaluasiGarda | null;
  onSubmit: (data: EvaluasiGarda) => void;
}

export function EvaluasiForm({ initialData, onSubmit }: EvaluasiFormProps) {
  const [ratingKemudahan, setRatingKemudahan] = useState(initialData?.ratingKemudahan || 0);
  const [ratingMateri, setRatingMateri] = useState(initialData?.ratingMateri || 0);
  const [ratingSoal, setRatingSoal] = useState(initialData?.ratingSoal || 0);
  const [ratingManfaat, setRatingManfaat] = useState(initialData?.ratingManfaat || 0);
  const [kritikSaran, setKritikSaran] = useState(initialData?.kritikSaran || "");

  const isRatingComplete =
    ratingMateri > 0 && ratingSoal > 0 && ratingKemudahan > 0 && ratingManfaat > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isRatingComplete) return;
    onSubmit({
      ratingKemudahan,
      ratingMateri,
      ratingSoal,
      ratingManfaat,
      kritikSaran: kritikSaran.trim(),
    });
  };

  // Helper render rating bintang
  const renderStarRating = (
    label: string,
    sublabel: string,
    value: number,
    onChange: (val: number) => void
  ) => {
    return (
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h4 className="text-sm font-bold text-navy-900 dark:text-white">{label}</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{sublabel}</p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              className="p-1 hover:scale-125 transition-transform cursor-pointer"
              title={`${star} Bintang`}
            >
              <Star
                className={`w-6 h-6 transition-colors ${
                  star <= value
                    ? "fill-amber-400 text-amber-500 drop-shadow-sm"
                    : "text-slate-300 dark:text-slate-600 hover:text-amber-200"
                }`}
              />
            </button>
          ))}
          <span className="ml-2 text-xs font-bold text-amber-600 dark:text-amber-400 min-w-16 text-right">
            {value > 0 ? `${value} / 5` : "Pilih bintang"}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-md overflow-hidden transition-all">
      {/* Top Banner Penjelasan Wajib Evaluasi */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 p-6 sm:p-8 text-white relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/20 text-white text-xs font-semibold mb-2">
              <Lock className="w-3.5 h-3.5" />
              Sertifikat Masih Terkunci
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Penilaian & Evaluasi Sistem Garda Ampera
            </h2>
            <p className="text-xs sm:text-sm text-amber-100 mt-1 max-w-xl leading-relaxed">
              Anda wajib melengkapi formulir evaluasi ini terlebih dahulu. Setelah evaluasi
              dikirimkan, <strong>Sertifikat Kelulusan Resmi</strong> akan langsung terbuka dan
              dapat diunduh dalam format PDF.
            </p>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
        <div className="space-y-4">
          {renderStarRating(
            "1. Kualitas & Kejelasan Materi Slide",
            "Apakah 3 modul materi edukasi BBPOM Palembang mudah dipahami dan menarik dibaca?",
            ratingMateri,
            setRatingMateri
          )}

          {renderStarRating(
            "2. Bobot & Relevansi Soal Ujian",
            "Apakah soal Pre-Test dan Post-Test sesuai dengan materi edukasi yang disampaikan?",
            ratingSoal,
            setRatingSoal
          )}

          {renderStarRating(
            "3. Kemudahan Antarmuka & Navigasi",
            "Seberapa mudah Anda memahami alur pengisian data, pengerjaan kuis, dan navigasi slide?",
            ratingKemudahan,
            setRatingKemudahan
          )}

          {renderStarRating(
            "4. Manfaat Program Garda Ampera",
            "Seberapa bermanfaat program ini dalam meningkatkan kesadaran Anda terhadap keamanan obat dan makanan?",
            ratingManfaat,
            setRatingManfaat
          )}
        </div>

        {/* Saran / Masukan */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
            Saran & Masukan untuk Penyempurnaan Garda Ampera
          </label>
          <textarea
            rows={3}
            value={kritikSaran}
            onChange={(e) => setKritikSaran(e.target.value)}
            placeholder="Tuliskan kesan, pesan, atau usulan materi tambahan yang Anda butuhkan..."
            className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
          />
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Umpan balik Anda sangat berharga bagi evaluasi pelayanan BBPOM di Palembang.
          </p>

          <button
            type="submit"
            disabled={!isRatingComplete}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${
              isRatingComplete
                ? "bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-600/20 hover:scale-[1.01] cursor-pointer"
                : "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
            }`}
          >
            {isRatingComplete ? "Kirim Evaluasi & Buka Sertifikat" : "Berikan Penilaian pada 4 Aspek di Atas"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}

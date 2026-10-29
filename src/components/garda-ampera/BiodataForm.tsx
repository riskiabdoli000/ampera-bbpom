"use client";

import React, { useState } from "react";
import {
  User,
  CreditCard,
  Calendar,
  MapPin,
  Briefcase,
  Building2,
  GraduationCap,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { BiodataGarda } from "./types";
import { CONTOH_BIODATA_DEMO } from "./data/mock-data";
import { lookupGardaTamuByNikAction } from "@/app/actions/garda-ampera";

interface BiodataFormProps {
  initialData: BiodataGarda;
  onSubmit: (data: BiodataGarda) => void;
}

const PENDIDIKAN_OPTIONS = [
  "SMA / SMK / Sederajat",
  "Diploma (D3 / D4)",
  "Sarjana (S1)",
  "Magister (S2)",
  "Doktor (S3)",
  "SMP / Sederajat",
  "SD / Sederajat",
  "Lainnya",
];

const PEKERJAAN_OPTIONS = [
  "Apoteker / Tenaga Teknis Kefarmasian",
  "Tenaga Kesehatan (Dokter / Perawat / Bidan / Sanitarian)",
  "Pelaku Usaha / UMKM Pangan & Kosmetik",
  "Aparatur Sipil Negara (ASN / PNS / PPPK)",
  "Karyawan Swasta",
  "Mahasiswa / Pelajar",
  "Kader Sadar Pangan / PKK",
  "Wiraswasta / Wirausaha",
  "Masyarakat Umum / Lainnya",
];

export function BiodataForm({ initialData, onSubmit }: BiodataFormProps) {
  const [formData, setFormData] = useState<BiodataGarda>(initialData);
  const [errors, setErrors] = useState<Partial<Record<keyof BiodataGarda, string>>>({});
  const [isSearchingNik, setIsSearchingNik] = useState(false);
  const [tamuMatchNotice, setTamuMatchNotice] = useState<string | null>(null);

  const handleLookupNik = async (nikToLookup?: string) => {
    const rawNik = nikToLookup ?? formData.nik;
    const cleanNik = (rawNik || "").trim().replace(/\D/g, "");

    if (!cleanNik || cleanNik.length < 8) return;

    setIsSearchingNik(true);
    setTamuMatchNotice(null);

    try {
      const res = await lookupGardaTamuByNikAction(cleanNik);
      if (res.found && res.data) {
        const rawJk = res.data.jenisKelamin;
        const validJk: "" | "Laki-laki" | "Perempuan" =
          rawJk === "Laki-laki" || rawJk === "Perempuan" ? rawJk : "";

        setFormData((prev) => ({
          ...prev,
          nik: cleanNik,
          nama: res.data?.nama || prev.nama,
          alamat: res.data?.alamat || prev.alamat,
          instansi: res.data?.instansi || prev.instansi,
          usia: res.data?.usia || prev.usia,
          jenisKelamin: validJk || prev.jenisKelamin,
          pendidikan: res.data?.pendidikan || prev.pendidikan,
          pekerjaan: res.data?.pekerjaan || prev.pekerjaan,
        }));

        setErrors((prev) => {
          const copy = { ...prev };
          if (res.data?.nama) delete copy.nama;
          if (res.data?.alamat) delete copy.alamat;
          if (res.data?.instansi) delete copy.instansi;
          if (res.data?.usia) delete copy.usia;
          if (res.data?.jenisKelamin) delete copy.jenisKelamin;
          if (res.data?.pendidikan) delete copy.pendidikan;
          if (res.data?.pekerjaan) delete copy.pekerjaan;
          delete copy.nik;
          return copy;
        });

        setTamuMatchNotice(
          `Data tamu cocok di database (${res.data.nama})! Biodata otomatis disinkronkan.`
        );
      }
    } catch (err) {
      console.warn("Gagal lookup NIK:", err);
    } finally {
      setIsSearchingNik(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof BiodataGarda]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }

    if (name === "nik") {
      setTamuMatchNotice(null);
      const digitsOnly = value.replace(/\D/g, "");
      if (digitsOnly.length === 16) {
        handleLookupNik(digitsOnly);
      }
    }
  };

  const handleQuickFill = () => {
    setFormData(CONTOH_BIODATA_DEMO);
    setErrors({});
    setTamuMatchNotice(null);
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof BiodataGarda, string>> = {};

    if (!formData.nik.trim()) {
      newErrors.nik = "Nomor NIK wajib diisi.";
    } else if (!/^\d{16}$/.test(formData.nik.trim())) {
      newErrors.nik = "NIK harus tepat 16 digit angka sesuai KTP.";
    }

    if (!formData.nama.trim()) {
      newErrors.nama = "Nama lengkap wajib diisi.";
    } else if (formData.nama.trim().length < 3) {
      newErrors.nama = "Nama lengkap minimal 3 karakter.";
    }

    if (!formData.tanggalTes) {
      newErrors.tanggalTes = "Tanggal tes wajib dipilih.";
    }

    if (!formData.alamat.trim()) {
      newErrors.alamat = "Alamat domisili wajib diisi.";
    }

    if (!formData.usia || Number(formData.usia) < 12 || Number(formData.usia) > 95) {
      newErrors.usia = "Masukkan usia yang valid (12 - 95 tahun).";
    }

    if (!formData.jenisKelamin) {
      newErrors.jenisKelamin = "Pilih jenis kelamin.";
    }

    if (!formData.pendidikan) {
      newErrors.pendidikan = "Pilih jenjang pendidikan.";
    }

    if (!formData.pekerjaan) {
      newErrors.pekerjaan = "Pilih pekerjaan Anda.";
    }

    if (!formData.instansi.trim()) {
      newErrors.instansi = "Nama instansi/organisasi wajib diisi (isi '-' jika umum).";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-md overflow-hidden transition-all">
      {/* Header Form */}
      <div className="bg-gradient-to-r from-navy-900 via-blue-900 to-navy-700 p-6 sm:p-8 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-semibold mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              Langkah 1 dari 6 • Pendaftaran Peserta
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Identitas Diri Peserta Garda Ampera
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-xl">
              Mohon isi data diri Anda dengan benar dan akurat. Data ini akan tercantum
              secara resmi pada Sertifikat Kelulusan Anda.
            </p>
          </div>

          {/* Quick Fill Button untuk Reviewer */}
          <button
            type="button"
            onClick={handleQuickFill}
            className="self-start sm:self-center inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-navy-950 font-bold text-xs shadow-md transition-transform active:scale-95 cursor-pointer whitespace-nowrap"
            title="Isi otomatis data untuk mempercepat proses peninjauan"
          >
            <Sparkles className="w-4 h-4" />
            ⚡ Isi Contoh Data Demo
          </button>
        </div>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* NIK */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                NIK (Nomor Induk Kependudukan) <span className="text-red-500">*</span>
              </label>
              {formData.nik.trim().length >= 8 && (
                <button
                  type="button"
                  onClick={() => handleLookupNik()}
                  disabled={isSearchingNik}
                  className="text-[11px] text-blue-600 dark:text-blue-400 font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  {isSearchingNik ? (
                    <>
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      Mencari Data...
                    </>
                  ) : (
                    <>⚡ Cek Database Tamu</>
                  )}
                </button>
              )}
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <CreditCard className="w-4 h-4" />
              </div>
              <input
                type="text"
                name="nik"
                maxLength={16}
                value={formData.nik}
                onChange={handleChange}
                placeholder="16 digit NIK sesuai KTP"
                className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                  tamuMatchNotice
                    ? "border-emerald-500 focus:ring-emerald-200 bg-emerald-50/20 dark:bg-emerald-950/10 text-slate-900 dark:text-white"
                    : errors.nik
                    ? "border-red-500 focus:ring-red-300 bg-red-50/30 dark:bg-red-950/20 text-slate-900 dark:text-white"
                    : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-blue-600 focus:ring-blue-200 dark:focus:ring-blue-900/40 text-slate-900 dark:text-white"
                }`}
              />
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                {isSearchingNik ? (
                  <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
                ) : tamuMatchNotice ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : null}
              </div>
            </div>

            {tamuMatchNotice && (
              <div className="mt-2 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center justify-between gap-2 animate-fade-up">
                <div className="flex items-center gap-1.5 min-w-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">{tamuMatchNotice}</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full shrink-0">
                  Autofill Aktif
                </span>
              </div>
            )}

            {errors.nik && (
              <p className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400 mt-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.nik}
              </p>
            )}
          </div>

          {/* Nama Lengkap */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Nama Lengkap & Gelar (Jika Ada) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                name="nama"
                value={formData.nama}
                onChange={handleChange}
                placeholder="Contoh: Siti Rahmawati, S.Farm"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                  errors.nama
                    ? "border-red-500 focus:ring-red-300 bg-red-50/30 dark:bg-red-950/20"
                    : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-blue-600 focus:ring-blue-200 dark:focus:ring-blue-900/40 text-slate-900 dark:text-white"
                }`}
              />
            </div>
            {errors.nama && (
              <p className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400 mt-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.nama}
              </p>
            )}
          </div>

          {/* Tanggal Pre/Post Test */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Tanggal Pelaksanaan Pre/Post Test <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Calendar className="w-4 h-4" />
              </div>
              <input
                type="date"
                name="tanggalTes"
                value={formData.tanggalTes}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                  errors.tanggalTes
                    ? "border-red-500 focus:ring-red-300 bg-red-50/30 dark:bg-red-950/20"
                    : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-blue-600 focus:ring-blue-200 dark:focus:ring-blue-900/40 text-slate-900 dark:text-white"
                }`}
              />
            </div>
            {errors.tanggalTes && (
              <p className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400 mt-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.tanggalTes}
              </p>
            )}
          </div>

          {/* Usia & Jenis Kelamin (2 Kolom) */}
          <div className="grid grid-cols-2 gap-4">
            {/* Usia */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Usia (Tahun) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="usia"
                min={12}
                max={95}
                value={formData.usia}
                onChange={handleChange}
                placeholder="25"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                  errors.usia
                    ? "border-red-500 focus:ring-red-300 bg-red-50/30 dark:bg-red-950/20"
                    : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-blue-600 focus:ring-blue-200 dark:focus:ring-blue-900/40 text-slate-900 dark:text-white"
                }`}
              />
              {errors.usia && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  {errors.usia}
                </p>
              )}
            </div>

            {/* Jenis Kelamin */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Jenis Kelamin <span className="text-red-500">*</span>
              </label>
              <select
                name="jenisKelamin"
                value={formData.jenisKelamin}
                onChange={handleChange}
                className={`w-full px-3 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                  errors.jenisKelamin
                    ? "border-red-500 focus:ring-red-300 bg-red-50/30 dark:bg-red-950/20"
                    : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-blue-600 focus:ring-blue-200 dark:focus:ring-blue-900/40 text-slate-900 dark:text-white"
                }`}
              >
                <option value="">-- Pilih --</option>
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
              {errors.jenisKelamin && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  {errors.jenisKelamin}
                </p>
              )}
            </div>
          </div>

          {/* Pendidikan */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Pendidikan Terakhir <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <GraduationCap className="w-4 h-4" />
              </div>
              <select
                name="pendidikan"
                value={formData.pendidikan}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                  errors.pendidikan
                    ? "border-red-500 focus:ring-red-300 bg-red-50/30 dark:bg-red-950/20"
                    : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-blue-600 focus:ring-blue-200 dark:focus:ring-blue-900/40 text-slate-900 dark:text-white"
                }`}
              >
                <option value="">-- Pilih Pendidikan --</option>
                {PENDIDIKAN_OPTIONS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            {errors.pendidikan && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-1.5">
                {errors.pendidikan}
              </p>
            )}
          </div>

          {/* Pekerjaan */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Pekerjaan / Profesi <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Briefcase className="w-4 h-4" />
              </div>
              <select
                name="pekerjaan"
                value={formData.pekerjaan}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                  errors.pekerjaan
                    ? "border-red-500 focus:ring-red-300 bg-red-50/30 dark:bg-red-950/20"
                    : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-blue-600 focus:ring-blue-200 dark:focus:ring-blue-900/40 text-slate-900 dark:text-white"
                }`}
              >
                <option value="">-- Pilih Pekerjaan --</option>
                {PEKERJAAN_OPTIONS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            {errors.pekerjaan && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-1.5">
                {errors.pekerjaan}
              </p>
            )}
          </div>

          {/* Nama Instansi / Organisasi */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Nama Instansi / Perusahaan / Organisasi / Komunitas <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Building2 className="w-4 h-4" />
              </div>
              <input
                type="text"
                name="instansi"
                value={formData.instansi}
                onChange={handleChange}
                placeholder="Contoh: Puskesmas Merdeka Palembang / UMKM Pempek Wong Kito / Umum"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                  errors.instansi
                    ? "border-red-500 focus:ring-red-300 bg-red-50/30 dark:bg-red-950/20"
                    : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-blue-600 focus:ring-blue-200 dark:focus:ring-blue-900/40 text-slate-900 dark:text-white"
                }`}
              />
            </div>
            {errors.instansi && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-1.5">
                {errors.instansi}
              </p>
            )}
          </div>

          {/* Alamat Domisili */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Alamat Domisili Lengkap <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute top-3 left-3 text-slate-400 pointer-events-none">
                <MapPin className="w-4 h-4" />
              </div>
              <textarea
                name="alamat"
                rows={2}
                value={formData.alamat}
                onChange={handleChange}
                placeholder="Jl. Nama Jalan, Kelurahan, Kecamatan, Kota/Kabupaten"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                  errors.alamat
                    ? "border-red-500 focus:ring-red-300 bg-red-50/30 dark:bg-red-950/20"
                    : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-blue-600 focus:ring-blue-200 dark:focus:ring-blue-900/40 text-slate-900 dark:text-white"
                }`}
              />
            </div>
            {errors.alamat && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-1.5">
                {errors.alamat}
              </p>
            )}
          </div>
        </div>

        {/* Footer / Action */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Data dienkripsi dan terlindungi sesuai ketentuan BBPOM di Palembang.
          </p>

          <button
            type="submit"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl bg-navy-900 hover:bg-blue-800 text-white font-bold text-xs sm:text-sm shadow-md shadow-navy-900/20 transition-all hover:translate-x-0.5 cursor-pointer whitespace-nowrap"
          >
            Simpan & Mulai Pre-Test
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}

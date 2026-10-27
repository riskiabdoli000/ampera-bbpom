"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Calendar,
  MapPin,
  CreditCard,
  GraduationCap,
  Briefcase,
  Building2,
  CheckCircle2,
  ArrowRight,
  Search,
  Sparkles,
  Info,
} from "lucide-react";
import {
  PesertaCindo,
  JenisKelamin,
  Pendidikan,
  Pekerjaan,
} from "@/data/cindo/cindoTypes";
import {
  getSesiCindo,
  initSesiWithPeserta,
} from "@/data/cindo/cindoStorage";
import { lookupNikAction } from "@/app/actions/lookup-nik";

export default function CindoIdentitasPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<PesertaCindo>({
    nama: "",
    tanggalTes: new Date().toISOString().slice(0, 10),
    alamat: "",
    nik: "",
    usia: 25,
    jenisKelamin: "LAKI_LAKI",
    pendidikan: "S1",
    pekerjaan: "ASN",
    instansi: "",
  });

  const [isLookingUpNik, setIsLookingUpNik] = useState(false);
  const [lookupMessage, setLookupMessage] = useState<string | null>(null);

  useEffect(() => {
    const sesi = getSesiCindo();
    if (sesi?.peserta) {
      setFormData(sesi.peserta);
    }
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "usia" ? Number(value) : value,
    }));
  };

  const handleLookupNik = async () => {
    if (!formData.nik || formData.nik.length < 8) {
      setLookupMessage("Masukkan minimal 8-16 digit NIK untuk pencarian otomatis.");
      return;
    }
    setIsLookingUpNik(true);
    setLookupMessage("Mencari data dari sistem Ampera & Buku Tamu BBPOM...");
    try {
      const res = await lookupNikAction(formData.nik);
      if (res.found && res.data) {
        setFormData((prev) => ({
          ...prev,
          nama: res.data?.nama || prev.nama,
          alamat: res.data?.alamat || prev.alamat,
          usia: res.data?.umur ? Number(res.data.umur) : prev.usia,
          instansi: res.data?.asalInstansi || prev.instansi,
        }));
        setLookupMessage("✓ " + res.message);
      } else {
        setLookupMessage(res.message);
      }
    } catch {
      setLookupMessage("Gagal menghubungkan pencarian NIK. Silakan isi secara manual.");
    } finally {
      setIsLookingUpNik(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nama.trim() || !formData.nik.trim()) {
      alert("Nama Lengkap dan NIK wajib diisi!");
      return;
    }

    // Inisialisasi sesi & generate 10 soal acak unik (Pre-Test = Post-Test)
    initSesiWithPeserta(formData);
    router.push("/cindo/tes/pre-test");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Form */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
            <User className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Langkah 1 dari 4: Identitas Peserta
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Formulir Identitas E-Learning Cindo
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Data ini digunakan untuk pencatatan asesmen dan penerbitan E-Sertifikat resmi BBPOM Palembang.
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50/70 p-3 text-xs text-blue-900 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-200">
          <Sparkles className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
          <span>
            <strong>Terhubung dengan Buku Tamu BBPOM:</strong> Masukkan NIK Anda lalu klik tombol &ldquo;Cek NIK&rdquo; untuk mengisi otomatis data profil Anda.
          </span>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* NIK Input with Lookup */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                Nomor Induk Kependudukan (NIK) <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <CreditCard className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    name="nik"
                    required
                    maxLength={16}
                    value={formData.nik}
                    onChange={handleChange}
                    placeholder="16 Digit NIK KTP Anda..."
                    className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-xs sm:text-sm outline-none transition-all focus:border-blue-600 focus:ring-1 focus:ring-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleLookupNik}
                  disabled={isLookingUpNik}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-800 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-slate-900 active:scale-95 disabled:opacity-50 dark:bg-slate-700 dark:hover:bg-slate-600"
                >
                  <Search className="h-4 w-4" />
                  <span>{isLookingUpNik ? "Memeriksa..." : "Cek NIK"}</span>
                </button>
              </div>
              {lookupMessage && (
                <p className="text-[11px] font-medium text-blue-600 dark:text-blue-400">
                  {lookupMessage}
                </p>
              )}
            </div>

            {/* Nama Lengkap */}
            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                Nama Lengkap (Sesuai KTP) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  name="nama"
                  required
                  value={formData.nama}
                  onChange={handleChange}
                  placeholder="Nama Lengkap Anda..."
                  className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-xs sm:text-sm outline-none transition-all focus:border-blue-600 focus:ring-1 focus:ring-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            {/* Tanggal Tes */}
            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                Tanggal Tes <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="date"
                  name="tanggalTes"
                  required
                  value={formData.tanggalTes}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-xs sm:text-sm outline-none transition-all focus:border-blue-600 focus:ring-1 focus:ring-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            {/* Usia */}
            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                Usia (Tahun) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="usia"
                min={12}
                max={100}
                required
                value={formData.usia}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs sm:text-sm outline-none transition-all focus:border-blue-600 focus:ring-1 focus:ring-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            {/* Jenis Kelamin (Sesuai Buku Tamu) */}
            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                Jenis Kelamin <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                  <input
                    type="radio"
                    name="jenisKelamin"
                    value="LAKI_LAKI"
                    checked={formData.jenisKelamin === "LAKI_LAKI"}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span>Laki-laki</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                  <input
                    type="radio"
                    name="jenisKelamin"
                    value="PEREMPUAN"
                    checked={formData.jenisKelamin === "PEREMPUAN"}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span>Perempuan</span>
                </label>
              </div>
            </div>

            {/* Pendidikan Terakhir (Sesuai Buku Tamu) */}
            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                Pendidikan Terakhir <span className="text-red-500">*</span>
              </label>
              <select
                name="pendidikan"
                required
                value={formData.pendidikan}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs sm:text-sm outline-none transition-all focus:border-blue-600 focus:ring-1 focus:ring-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="SD">SD / Sederajat</option>
                <option value="SMP">SMP / Sederajat</option>
                <option value="SMA_SEDERAJAT">SMA / Sederajat</option>
                <option value="D3">Diploma (D3)</option>
                <option value="S1">Sarjana (S1)</option>
                <option value="S2">Magister (S2)</option>
                <option value="S3">Doktor (S3)</option>
              </select>
            </div>

            {/* Pekerjaan (Sesuai Buku Tamu) */}
            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                Pekerjaan <span className="text-red-500">*</span>
              </label>
              <select
                name="pekerjaan"
                required
                value={formData.pekerjaan}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs sm:text-sm outline-none transition-all focus:border-blue-600 focus:ring-1 focus:ring-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="ASN">Pegawai Negeri Sipil (ASN/PNS)</option>
                <option value="PEGAWAI_SWASTA">Pegawai Swasta</option>
                <option value="WIRASWASTA">Wiraswasta</option>
                <option value="MAHASISWA">Mahasiswa / Pelajar</option>
                <option value="LAINNYA">Lainnya</option>
              </select>
            </div>

            {/* Nama Instansi / Organisasi */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                Nama Instansi / Perusahaan / Kampus / Organisasi <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  name="instansi"
                  required
                  value={formData.instansi}
                  onChange={handleChange}
                  placeholder="Contoh: Universitas Sriwijaya, UMKM Pempek Wong Kito, Pribadi..."
                  className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-xs sm:text-sm outline-none transition-all focus:border-blue-600 focus:ring-1 focus:ring-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            {/* Alamat Domisili */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                Alamat Domisili Lengkap <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <textarea
                  name="alamat"
                  required
                  rows={2}
                  value={formData.alamat}
                  onChange={handleChange}
                  placeholder="Alamat tempat tinggal / kota domisili Anda..."
                  className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2 text-xs sm:text-sm outline-none transition-all focus:border-blue-600 focus:ring-1 focus:ring-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-2xl bg-[#1664e8] px-6 py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:bg-blue-700 active:scale-95"
          >
            <span>Simpan Identitas & Mulai Pre-Test</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}

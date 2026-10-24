"use client";

import React, { useState, useTransition } from "react";
import { lookupNikAction, LookupResult } from "@/app/actions/lookup-nik";
import { 
  Search, 
  CheckCircle2, 
  User, 
  Phone, 
  MapPin, 
  FileCheck, 
  Loader2, 
  Database,
  ArrowRight,
  FlaskConical,
  MessageSquareWarning,
  HelpCircle,
  FileText,
  Upload
} from "lucide-react";

export type LayananType = "INFO" | "UJI_CEPAT" | "ADUAN" | "KIP";

const DAFTAR_PRODUK_BERBAHAYA = [
  "Pempek, tekwan, model",
  "Kerupuk/Kemplang",
  "Tahu",
  "Mie basah",
  "Bakso",
  "Ikan asin atau sejenisnya",
  "Makanan berwarna mencolok (pink/kuning)",
];

const DAFTAR_ALASAN_KECURIGAAN = [
  "Produk tahan lama",
  "Perbedaan tekstur, rasa, dan/atau bau",
];

export function RegistrationForm() {
  const [selectedLayanan, setSelectedLayanan] = useState<LayananType>("UJI_CEPAT");

  // Data Universal Pemohon
  const [nik, setNik] = useState("");
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [telepon, setTelepon] = useState("");
  const [alamat, setAlamat] = useState("");
  const [asalInstansi, setAsalInstansi] = useState("");
  const [umur, setUmur] = useState<string>("");

  // Spesifik Layanan 1 (Permintaan Informasi)
  const [informasiDibutuhkan, setInformasiDibutuhkan] = useState("");

  // Spesifik Layanan 2 (Pengujian Cepat Ampera)
  const [produkDipilih, setProdukDipilih] = useState<string[]>([]);
  const [isProdukLainnya, setIsProdukLainnya] = useState(false);
  const [produkLainnyaText, setProdukLainnyaText] = useState("");

  const [alasanDipilih, setAlasanDipilih] = useState<string[]>([]);
  const [isAlasanLainnya, setIsAlasanLainnya] = useState(false);
  const [alasanLainnyaText, setAlasanLainnyaText] = useState("");

  const [rincianProduk, setRincianProduk] = useState("");

  // Spesifik Layanan 3 (Pengaduan)
  const [isiPengaduan, setIsiPengaduan] = useState("");
  const [buktiFoto, setBuktiFoto] = useState<string>("");

  // Spesifik Layanan 4 (Keterbukaan Informasi Publik)
  const [rincianKip, setRincianKip] = useState("");
  const [tujuanKip, setTujuanKip] = useState("");

  const [lookupState, setLookupState] = useState<LookupResult | null>(null);
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);
  const [kodeTiketGenerated, setKodeTiketGenerated] = useState("");

  // Fungsi Lookup NIK Terintegrasi (Buku Tamu & Ampera)
  const handleLookup = () => {
    if (!nik.trim() || nik.length < 8) return;

    startTransition(async () => {
      const result = await lookupNikAction(nik);
      setLookupState(result);

      if (result.found && result.data) {
        if (result.data.nama) setNama(result.data.nama);
        if (result.data.telepon) setTelepon(result.data.telepon);
        if (result.data.alamat) setAlamat(result.data.alamat);
        if (result.data.asalInstansi) setAsalInstansi(result.data.asalInstansi);
        if (result.data.umur) setUmur(result.data.umur.toString());
        if (result.data.email) setEmail(result.data.email);
      }
    });
  };

  const handleToggleProduk = (item: string) => {
    setProdukDipilih((prev) =>
      prev.includes(item) ? prev.filter((p) => p !== item) : [...prev, item]
    );
  };

  const handleToggleAlasan = (item: string) => {
    setAlasanDipilih((prev) =>
      prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const prefix = selectedLayanan === "INFO" ? "AMP-INF" : selectedLayanan === "UJI_CEPAT" ? "AMP-UJI" : selectedLayanan === "ADUAN" ? "AMP-ADU" : "AMP-KIP";
    const generated = `${prefix}-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    setKodeTiketGenerated(generated);
    setSubmitted(true);
  };

  const resetForm = () => {
    setSubmitted(false);
    setNik("");
    setNama("");
    setEmail("");
    setTelepon("");
    setAlamat("");
    setAsalInstansi("");
    setUmur("");
    setInformasiDibutuhkan("");
    setProdukDipilih([]);
    setIsProdukLainnya(false);
    setProdukLainnyaText("");
    setAlasanDipilih([]);
    setIsAlasanLainnya(false);
    setAlasanLainnyaText("");
    setRincianProduk("");
    setIsiPengaduan("");
    setBuktiFoto("");
    setRincianKip("");
    setTujuanKip("");
    setLookupState(null);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden">
      {/* Header Form */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 px-6 py-5 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Dual-Database Bridge Aktif
            </span>
            <h3 className="text-xl font-bold tracking-tight">Formulir Layanan Mandiri BBPOM Palembang</h3>
            <p className="text-xs text-blue-200 mt-1">
              Data terintegrasi otomatis dengan sistem Buku Tamu BBPOM via NIK.
            </p>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 text-xs text-blue-200 self-start sm:self-auto">
            <Database className="w-4 h-4 text-emerald-400" />
            <span>Sync via NIK</span>
          </div>
        </div>

        {/* Tab Navigasi 4 Layanan */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-6 pt-5 border-t border-white/10">
          <button
            type="button"
            onClick={() => setSelectedLayanan("UJI_CEPAT")}
            className={`px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              selectedLayanan === "UJI_CEPAT"
                ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30"
                : "bg-white/10 text-slate-300 hover:bg-white/20"
            }`}
          >
            <FlaskConical className="w-4 h-4" />
            <span>2. Uji Cepat Ampera</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedLayanan("INFO")}
            className={`px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              selectedLayanan === "INFO"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
                : "bg-white/10 text-slate-300 hover:bg-white/20"
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>1. Permintaan Info</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedLayanan("ADUAN")}
            className={`px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              selectedLayanan === "ADUAN"
                ? "bg-rose-600 text-white shadow-md shadow-rose-500/30"
                : "bg-white/10 text-slate-300 hover:bg-white/20"
            }`}
          >
            <MessageSquareWarning className="w-4 h-4" />
            <span>3. Pengaduan</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedLayanan("KIP")}
            className={`px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              selectedLayanan === "KIP"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/30"
                : "bg-white/10 text-slate-300 hover:bg-white/20"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>4. Keterbukaan Info (KIP)</span>
          </button>
        </div>
      </div>

      <div className="p-6 md:p-8">
        {submitted ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-2xl font-bold text-slate-900 mb-2">Permohonan Berhasil Dikirim!</h4>
            <p className="text-slate-600 max-w-md mx-auto text-sm mb-4">
              Terima kasih <strong className="text-slate-900">{nama}</strong>. Laporan/permohonan Anda telah tercatat pada database Ampera-BBPOM dengan nomor registrasi tiket:
            </p>
            <div className="inline-block bg-slate-100 border border-slate-300 px-5 py-2.5 rounded-xl font-mono text-indigo-700 font-extrabold text-lg mb-6 shadow-xs">
              {kodeTiketGenerated}
            </div>
            <p className="text-xs text-slate-500 mb-6 max-w-sm mx-auto">
              Simpan kode tiket ini untuk memantau status tindak lanjut petugas di halaman Tracking Status.
            </p>
            <div>
              <button
                type="button"
                onClick={resetForm}
                className="text-sm font-semibold text-blue-700 hover:text-blue-800 underline"
              >
                ← Isi Formulir Baru
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Bagian 1: Identifikasi NIK Terintegrasi (Universal) */}
            <div className="bg-slate-50/80 p-4 sm:p-5 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="nik" className="block text-sm font-semibold text-slate-800">
                  Nomor Induk Kependudukan (NIK) <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-slate-500">Cukup 1x input untuk autofill</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <input
                    id="nik"
                    type="text"
                    value={nik}
                    maxLength={16}
                    onChange={(e) => {
                      setNik(e.target.value.replace(/\D/g, ""));
                      if (lookupState) setLookupState(null);
                    }}
                    placeholder="Masukkan 16 digit NIK KTP..."
                    className="w-full pl-4 pr-10 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm font-mono tracking-wide"
                    required
                  />
                  {isPending && (
                    <div className="absolute right-3 top-3">
                      <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleLookup}
                  disabled={isPending || nik.length < 8}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-700 hover:bg-blue-800 disabled:bg-slate-300 text-white text-sm font-medium rounded-lg transition-colors shadow-sm cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                  <span>Cek & Tarik Data</span>
                </button>
              </div>

              {/* Status Lookup Feedback */}
              {lookupState && (
                <div
                  className={`mt-3 p-3 rounded-lg text-xs flex items-start gap-2.5 ${
                    lookupState.found
                      ? lookupState.source === "buku_tamu"
                        ? "bg-sky-50 border border-sky-200 text-sky-900"
                        : "bg-emerald-50 border border-emerald-200 text-emerald-900"
                      : "bg-amber-50 border border-amber-200 text-amber-900"
                  }`}
                >
                  {lookupState.found ? (
                    <CheckCircle2 className="w-4 h-4 text-current shrink-0 mt-0.5" />
                  ) : (
                    <User className="w-4 h-4 text-current shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="font-semibold">{lookupState.message}</p>
                    {lookupState.found && (
                      <p className="mt-0.5 opacity-80">
                        Kolom profil telah diisi otomatis dari database kunjungan.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Bagian 2: Profil Identitas Pemohon */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    placeholder="Nama sesuai KTP"
                    required
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Aktif <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contoh@email.com"
                  required
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* Telepon (Wajib pada Layanan 2, 3, 4) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor Telepon / WhatsApp {selectedLayanan !== "INFO" && <span className="text-rose-500">*</span>}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={telepon}
                    onChange={(e) => setTelepon(e.target.value)}
                    placeholder="081234567890"
                    required={selectedLayanan !== "INFO"}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
                  />
                </div>
              </div>

              {/* Umur (Khusus Layanan 1) */}
              {selectedLayanan === "INFO" ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Umur (Tahun) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={umur}
                    onChange={(e) => setUmur(e.target.value)}
                    placeholder="Contoh: 28"
                    required
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              ) : null}

              {/* Alamat / Asal Instansi */}
              <div className={selectedLayanan === "INFO" ? "md:col-span-2" : "md:col-span-2"}>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {selectedLayanan === "INFO" ? "Alamat / Asal Instansi" : "Alamat Lengkap"} <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={selectedLayanan === "INFO" ? (asalInstansi || alamat) : alamat}
                    onChange={(e) => {
                      setAlamat(e.target.value);
                      if (selectedLayanan === "INFO") setAsalInstansi(e.target.value);
                    }}
                    placeholder={selectedLayanan === "INFO" ? "Alamat domisili atau nama kampus / instansi / perusahaan" : "Alamat lengkap jalan, RT/RW, kelurahan, kecamatan"}
                    required
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>
            </div>

            {/* Bagian 3: FORMULIR SPESIFIK SESUAI LAYANAN YANG DIPILIH */}
            <div className="border-t border-slate-200 pt-5">
              {/* === FORM 1: PERMINTAAN INFORMASI === */}
              {selectedLayanan === "INFO" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
                    <HelpCircle className="w-4 h-4 text-blue-600" />
                    <span>Rincian Informasi yang Dibutuhkan</span>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                      Informasi yang dibutuhkan <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={4}
                      value={informasiDibutuhkan}
                      onChange={(e) => setInformasiDibutuhkan(e.target.value)}
                      placeholder="Jelaskan secara detail informasi regulasi, izin edar BPOM, sertifikasi, atau ketentuan obat/makanan yang ingin Anda konsultasikan..."
                      required
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>
              )}

              {/* === FORM 2: PENGUJIAN CEPAT AMPERA === */}
              {selectedLayanan === "UJI_CEPAT" && (
                <div className="space-y-5">
                  <div className="flex items-center gap-2 text-emerald-950 font-bold text-sm">
                    <FlaskConical className="w-4 h-4 text-emerald-600" />
                    <span>Kriteria Sampel Pengujian Cepat Ampera</span>
                  </div>

                  {/* Checklist Produk */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-2">
                      Produk yang dicurigai mengandung bahan berbahaya <span className="text-rose-500">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {DAFTAR_PRODUK_BERBAHAYA.map((item) => (
                        <label
                          key={item}
                          className="flex items-center gap-2.5 p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-100 cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={produkDipilih.includes(item)}
                            onChange={() => handleToggleProduk(item)}
                            className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                          />
                          <span className="text-slate-800">{item}</span>
                        </label>
                      ))}

                      {/* Opsi Yang Lain */}
                      <label className="flex items-center gap-2.5 p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-100 cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={isProdukLainnya}
                          onChange={(e) => setIsProdukLainnya(e.target.checked)}
                          className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-slate-800 font-medium">Yang lain</span>
                      </label>
                    </div>

                    {isProdukLainnya && (
                      <div className="mt-2">
                        <input
                          type="text"
                          value={produkLainnyaText}
                          onChange={(e) => setProdukLainnyaText(e.target.value)}
                          placeholder="Sebutkan jenis makanan/produk lainnya..."
                          required={isProdukLainnya}
                          className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                        />
                      </div>
                    )}
                  </div>

                  {/* Checklist Alasan Kecurigaan */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-2">
                      Alasan kecurigaan <span className="text-rose-500">*</span>
                    </label>
                    <div className="space-y-2 text-xs">
                      {DAFTAR_ALASAN_KECURIGAAN.map((item) => (
                        <label
                          key={item}
                          className="flex items-center gap-2.5 p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-100 cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={alasanDipilih.includes(item)}
                            onChange={() => handleToggleAlasan(item)}
                            className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                          />
                          <span className="text-slate-800">{item}</span>
                        </label>
                      ))}

                      {/* Alasan Yang Lain */}
                      <label className="flex items-center gap-2.5 p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-100 cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={isAlasanLainnya}
                          onChange={(e) => setIsAlasanLainnya(e.target.checked)}
                          className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-slate-800 font-medium">Yang lain</span>
                      </label>
                    </div>

                    {isAlasanLainnya && (
                      <div className="mt-2">
                        <input
                          type="text"
                          value={alasanLainnyaText}
                          onChange={(e) => setAlasanLainnyaText(e.target.value)}
                          placeholder="Tuliskan indikasi atau alasan kecurigaan lainnya..."
                          required={isAlasanLainnya}
                          className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                        />
                      </div>
                    )}
                  </div>

                  {/* Rincian Produk & Lokasi Pasar */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                      Rincian produk yang dicurigai (Sebutkan tempat/pasar/penjual dan informasi penting lainnya) <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={rincianProduk}
                      onChange={(e) => setRincianProduk(e.target.value)}
                      placeholder="Contoh: Dibeli di Pasar 16 Ilir Palembang pada kios Ibu X dekat lorong basah, tanggal pembelian 22 Oktober, kondisi kenyal tidak wajar..."
                      required
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>
              )}

              {/* === FORM 3: LAYANAN PENGADUAN === */}
              {selectedLayanan === "ADUAN" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-rose-900 font-bold text-sm">
                    <MessageSquareWarning className="w-4 h-4 text-rose-600" />
                    <span>Materi Pengaduan & Bukti Kelengkapan</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                      Isi pengaduan <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={4}
                      value={isiPengaduan}
                      onChange={(e) => setIsiPengaduan(e.target.value)}
                      placeholder="Jelaskan secara kronologis pengaduan produk, nama merk, nomor izin edar yang tertera (jika ada), efek samping dialami, atau pelanggaran yang ditemukan..."
                      required
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                      Bukti kelengkapan pengaduan (foto produk / kemasan / nota)
                    </label>
                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:bg-slate-50 transition-colors">
                      <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                      <p className="text-xs text-slate-600 font-medium">Unggah Foto Bukti Fisik</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Format JPG/PNG/PDF (Maks. 5MB)</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            setBuktiFoto(e.target.files[0].name);
                          }
                        }}
                        className="mt-2 text-xs text-slate-500"
                      />
                      {buktiFoto && (
                        <p className="mt-2 text-xs font-semibold text-emerald-600">File terpilih: {buktiFoto}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* === FORM 4: KETERBUKAAN INFORMASI PUBLIK (KIP) === */}
              {selectedLayanan === "KIP" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    <span>Permohonan Informasi Publik (PPID)</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                      Rincian Informasi Publik yang Diminta <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={rincianKip}
                      onChange={(e) => setRincianKip(e.target.value)}
                      placeholder="Sebutkan secara spesifik dokumen, laporan berkala, atau data publik BBPOM yang Anda perlukan..."
                      required
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                      Tujuan Penggunaan Informasi <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={2}
                      value={tujuanKip}
                      onChange={(e) => setTujuanKip(e.target.value)}
                      placeholder="Tuliskan tujuan penggunaan informasi (misal: penulisan skripsi/tesis, penelitian akademis, advokasi masyarakat)..."
                      required
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Tombol Submit Dinamis */}
            <button
              type="submit"
              className={`w-full py-3.5 px-6 font-semibold text-white rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                selectedLayanan === "UJI_CEPAT"
                  ? "bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 shadow-emerald-500/20"
                  : selectedLayanan === "INFO"
                  ? "bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 shadow-blue-500/20"
                  : selectedLayanan === "ADUAN"
                  ? "bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-700 hover:to-red-800 shadow-rose-500/20"
                  : "bg-gradient-to-r from-indigo-600 to-blue-700 hover:from-indigo-700 hover:to-blue-800 shadow-indigo-500/20"
              }`}
            >
              <FileCheck className="w-5 h-5" />
              <span>
                {selectedLayanan === "UJI_CEPAT"
                  ? "Kirim Laporan Pengujian Cepat"
                  : selectedLayanan === "INFO"
                  ? "Kirim Permintaan Informasi"
                  : selectedLayanan === "ADUAN"
                  ? "Kirim Laporan Pengaduan"
                  : "Kirim Permohonan Informasi Publik"}
              </span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

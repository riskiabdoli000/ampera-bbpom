import React from "react";
import { 
  FlaskConical, 
  HelpCircle, 
  MessageSquareWarning, 
  FileText, 
  ArrowRight, 
  Database, 
  Cpu, 
  Sparkles,
  PhoneCall,
  MapPin,
  Clock
} from "lucide-react";
import { RegistrationForm } from "@/components/RegistrationForm";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Bar Informasi Resmi */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white text-xs py-2 px-4 border-b border-blue-900/50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Balai Besar Pengawas Obat dan Makanan (BBPOM) di Palembang</span>
          </div>
          <div className="flex items-center gap-4 text-slate-300">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              Senin - Jumat: 08.00 - 16.00 WIB
            </span>
            <span className="hidden md:inline text-slate-600">|</span>
            <span className="hidden md:flex items-center gap-1">
              <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
              Halo BPOM: 1500533 / Pengaduan BBPOM Palembang
            </span>
          </div>
        </div>
      </div>

      {/* Header Utama / Navigasi */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-600/30 font-black text-xl tracking-tighter">
              BP
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg text-slate-900 tracking-tight">AMPERA</span>
                <span className="text-xs px-2 py-0.5 rounded font-bold bg-blue-100 text-blue-800">BBPOM</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Aplikasi Manajemen Pelayanan & Pengujian Cepat Balai Besar POM Palembang
              </p>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#layanan" className="hover:text-blue-700 transition-colors">4 Layanan Utama</a>
            <a href="#daftar" className="hover:text-blue-700 transition-colors">Formulir Mandiri</a>
            <a href="#arsitektur" className="hover:text-blue-700 transition-colors">Integrasi Buku Tamu</a>
            <a href="#kontak" className="hover:text-blue-700 transition-colors">Kontak & Lokasi</a>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="#daftar"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-blue-700 hover:bg-blue-800 text-white transition-all shadow-sm hover:shadow"
            >
              <span>Ajukan Layanan</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-16 lg:pb-28 bg-gradient-to-b from-blue-50/60 via-white to-slate-50">
        <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.15] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-100/80 text-emerald-900 border border-emerald-200 mb-6">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Portal Resmi Layanan Terpadu BBPOM di Palembang</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-6">
              Pelayanan Publik & Pengujian Cepat Pangan Ampera
            </h1>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Sampaikan permintaan informasi, ajukan uji cepat sampel makanan khas Palembang yang dicurigai mengandung bahan berbahaya, laporkan aduan obat/makanan, dan akses keterbukaan informasi publik secara terintegrasi.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <a
                href="#daftar"
                className="px-6 py-3.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-semibold text-sm shadow-lg shadow-blue-700/25 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Mulai Isi Formulir Layanan</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#layanan"
                className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-semibold text-sm border border-slate-300 transition-all shadow-xs"
              >
                Pelajari 4 Jenis Layanan
              </a>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-blue-700 mb-1">Info Publik</div>
              <p className="text-xs text-slate-500 font-medium">Konsultasi & Regulasi</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mb-1">Uji Cepat</div>
              <p className="text-xs text-slate-500 font-medium">Bahan Berbahaya Pangan</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-rose-600 mb-1">Pengaduan</div>
              <p className="text-xs text-slate-500 font-medium">Aduan Bukti Foto</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-indigo-600 mb-1">KIP</div>
              <p className="text-xs text-slate-500 font-medium">PPID Informasi Resmi</p>
            </div>
          </div>
        </div>
      </section>

      {/* Grid 4 Layanan Resmi */}
      <section id="layanan" className="py-20 bg-white border-t border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-700 mb-2">Pilihan Pelayanan BBPOM Palembang</h2>
            <h3 className="text-3xl font-bold text-slate-900 tracking-tight">4 Layanan Utama yang Dapat Diajukan</h3>
            <p className="text-slate-600 text-sm mt-3">
              Pilih layanan yang Anda butuhkan untuk mengisi formulir secara cepat dengan dukungan sinkronisasi NIK Buku Tamu.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Kartu 1: Permintaan Informasi */}
            <div className="p-7 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-400 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-1">Layanan 1</div>
              <h4 className="text-xl font-bold text-slate-900 mb-2">Layanan Permintaan Informasi</h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-5">
                Konsultasi regulasi obat dan makanan, prosedur pendaftaran nomor izin edar (BPOM MD/TR/SD/NA), dan ketentuan sertifikasi sarana.
              </p>
              <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
                <div className="font-semibold text-slate-800">Kolom yang Diisi:</div>
                <p>• NIK, Nama, Umur, Email, Alamat/Asal Instansi, dan Informasi yang Dibutuhkan</p>
              </div>
            </div>

            {/* Kartu 2: Pengujian Cepat Ampera */}
            <div className="p-7 rounded-2xl bg-emerald-50/50 border border-emerald-200 hover:border-emerald-400 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <FlaskConical className="w-6 h-6" />
              </div>
              <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">Layanan 2 (Unggulan)</div>
              <h4 className="text-xl font-bold text-slate-900 mb-2">Layanan Pengujian Cepat Ampera</h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-5">
                Uji cepat sampel makanan khas lokal (Pempek, tekwan, tahu, kemplang, mie basah, bakso, ikan asin) yang dicurigai mengandung formalin, boraks, atau pewarna tekstil.
              </p>
              <div className="bg-white p-3 rounded-xl border border-emerald-200 text-xs text-slate-600 space-y-1">
                <div className="font-semibold text-slate-800">Kolom yang Diisi:</div>
                <p>• NIK, Nama, Email, Alamat, Telepon, Pilihan Produk, Alasan Kecurigaan, & Rincian Pasar/Penjual</p>
              </div>
            </div>

            {/* Kartu 3: Layanan Pengaduan */}
            <div className="p-7 rounded-2xl bg-rose-50/40 border border-rose-200 hover:border-rose-400 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <MessageSquareWarning className="w-6 h-6" />
              </div>
              <div className="text-xs font-bold text-rose-700 uppercase tracking-wider mb-1">Layanan 3</div>
              <h4 className="text-xl font-bold text-slate-900 mb-2">Layanan Pengaduan</h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-5">
                Kanal pelaporan masyarakat terhadap obat ilegal/berbahaya, kosmetik bermerkuri, makanan berjamur/kadaluarsa yang beredar di wilayah Sumatera Selatan.
              </p>
              <div className="bg-white p-3 rounded-xl border border-rose-200 text-xs text-slate-600 space-y-1">
                <div className="font-semibold text-slate-800">Kolom yang Diisi:</div>
                <p>• NIK, Nama, Email, Alamat, Telepon, Isi Uraian Pengaduan, & Bukti Kelengkapan (Foto)</p>
              </div>
            </div>

            {/* Kartu 4: Keterbukaan Informasi Publik */}
            <div className="p-7 rounded-2xl bg-indigo-50/40 border border-indigo-200 hover:border-indigo-400 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <div className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-1">Layanan 4</div>
              <h4 className="text-xl font-bold text-slate-900 mb-2">Layanan Keterbukaan Informasi Publik (KIP)</h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-5">
                Layanan permohonan informasi publik resmi Pejabat Pengelola Informasi dan Dokumentasi (PPID) sesuai amanat UU No. 14 Tahun 2008.
              </p>
              <div className="bg-white p-3 rounded-xl border border-indigo-200 text-xs text-slate-600 space-y-1">
                <div className="font-semibold text-slate-800">Kolom yang Diisi:</div>
                <p>• NIK, Nama, Email, Alamat, Telepon, Rincian Informasi Diminta, & Tujuan Penggunaan</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Formulir Pendaftaran Terpadu */}
      <section id="daftar" className="py-20 bg-gradient-to-b from-slate-100 to-slate-200/70 border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <span className="text-xs font-bold text-blue-700 tracking-wider uppercase mb-2 inline-block">
              Pendaftaran Online Mandiri
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Formulir Layanan Terintegrasi NIK
            </h2>
            <p className="text-sm text-slate-600 mt-2 max-w-xl mx-auto">
              Pilih jenis layanan di bawah ini, masukkan NIK Anda, dan data profil Anda yang pernah tercatat di Buku Tamu kantor BBPOM akan langsung terisi otomatis.
            </p>
          </div>

          {/* Form Component dengan 4 Layanan Terpisah */}
          <RegistrationForm />
        </div>
      </section>

      {/* Bagian Penjelasan Arsitektur Interkoneksi Dual-Database */}
      <section id="arsitektur" className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-indigo-600 tracking-wider uppercase mb-2 inline-block">
              Mekanisme Saling Panggil Data NIK
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Arsitektur Database Terpisah yang Tetap Terhubung
            </h2>
            <p className="text-sm text-slate-600 mt-3 leading-relaxed">
              Sesuai arahan mentor, <strong>AMPERA-BBPOM</strong> dan <strong>BUKU-TAMU</strong> memiliki database Supabase PostgreSQL masing-masing demi keamanan data, namun tetap bisa saling memanggil data tamu melalui API Bridge.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm mb-4">
                01
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-600" />
                Database Buku-Tamu
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Menyimpan data tamu yang datang langsung ke kantor BBPOM (NIK, nama, telepon, umur, antrean fisik, foto selfie resepsionis, survei kepuasan).
              </p>
            </div>

            <div className="bg-indigo-50/60 p-6 rounded-2xl border border-indigo-200">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm mb-4">
                02
              </div>
              <h3 className="text-base font-bold text-indigo-950 mb-2 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-indigo-600" />
                API Bridge Dua Arah
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Jalur penghubung aman berkecepatan tinggi dengan validasi token rahasia <code>x-service-api-key</code>. Menarik profil instan berdasar 16 digit NIK.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm mb-4">
                03
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-600" />
                Database Ampera-BBPOM
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Menyimpan 4 transaksi layanan online: Permintaan Informasi, Uji Cepat Ampera (sampel makanan berbahaya), Aduan foto produk, dan KIP.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="kontak" className="bg-slate-950 text-slate-400 text-xs py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-sm">
                BP
              </div>
              <span className="font-bold text-sm text-white">AMPERA BBPOM</span>
            </div>
            <p className="leading-relaxed text-slate-400">
              Portal Pelayanan Publik & Pengujian Cepat Bahan Berbahaya Balai Besar Pengawas Obat dan Makanan di Palembang.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white text-sm mb-3">Alamat Pelayanan</h4>
            <div className="space-y-2">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>Jl. Pangeran Ratu No. 1, Jakabaring, Kota Palembang, Sumatera Selatan</span>
              </p>
              <p className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>(0711) 510042 / 510043</span>
              </p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white text-sm mb-3">Integrasi Sistem</h4>
            <p className="leading-relaxed mb-3">
              Terhubung dengan data Pelayanan Terpadu Satu Pintu (PTSP) Buku Tamu BBPOM Palembang.
            </p>
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="text-slate-300">Decoupled Architecture Ready</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 pt-6 border-t border-slate-900 text-center text-slate-600">
          &copy; 2026 Balai Besar Pengawas Obat dan Makanan di Palembang. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

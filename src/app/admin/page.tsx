import React from "react";
import Link from "next/link";
import Image from "next/image";
import WaStatusBadge from "@/components/admin/WaStatusBadge";
import { prisma } from "@/lib/prisma";
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  Sparkles,
  Video,
  PhoneCall,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  ChevronDown,
} from "lucide-react";

export const dynamic = "force-dynamic";

const card =
  "rounded-2xl border border-[#e3ecfa] bg-white dark:border-slate-800 dark:bg-slate-900";

export default async function AdminDashboardPage() {
  // Query data live dari database PostgreSQL / Supabase
  let totalPengajuan = 0;
  let menungguVerifikasi = 0;
  let sedangDiproses = 0;
  let selesai = 0;
  let rawRecent: Array<{
    id: number;
    kodePengajuan: string;
    status: string;
    createdAt: Date;
    produkDicurigai: string | null;
    informasiDibutuhkan: string | null;
    isiPengaduan: string | null;
    rincianInformasiKip: string | null;
    tamu: { nama: string; nik: string };
    layanan: { nama: string };
  }> = [];

  try {
    const [tCount, mCount, pCount, sCount, recents] = await Promise.all([
      prisma.pengajuanLayanan.count(),
      prisma.pengajuanLayanan.count({ where: { status: "MENUNGGU_VERIFIKASI" } }),
      prisma.pengajuanLayanan.count({ where: { status: "DIPROSES" } }),
      prisma.pengajuanLayanan.count({ where: { status: "SELESAI" } }),
      prisma.pengajuanLayanan.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        include: {
          tamu: true,
          layanan: true,
        },
      }),
    ]);
    totalPengajuan = tCount;
    menungguVerifikasi = mCount;
    sedangDiproses = pCount;
    selesai = sCount;
    rawRecent = recents;
  } catch (err) {
    console.warn("[Admin Dashboard] Gagal membaca data pengajuan database:", err);
  }

  const recentSubmissions = rawRecent.map((p) => {
    const sampel =
      p.produkDicurigai ||
      p.informasiDibutuhkan ||
      p.isiPengaduan ||
      p.rincianInformasiKip ||
      "Permohonan Layanan";

    const diffMs = Date.now() - new Date(p.createdAt).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    let waktu = "Baru saja";
    if (diffMins < 60) {
      waktu = `${Math.max(1, diffMins)} menit lalu`;
    } else if (diffHours < 24) {
      waktu = `${diffHours} jam lalu`;
    } else if (diffDays === 1) {
      waktu = "Kemarin";
    } else {
      waktu = `${diffDays} hari lalu`;
    }

    let statusKey: "MENUNGGU" | "DIPROSES" | "SELESAI" | "DITOLAK" = "MENUNGGU";
    if (p.status === "SEDANG_DIPROSES") statusKey = "DIPROSES";
    else if (p.status === "SELESAI") statusKey = "SELESAI";
    else if (p.status === "DITOLAK") statusKey = "DITOLAK";

    return {
      id: p.kodePengajuan,
      nama: p.tamu.nama,
      layanan: p.layanan.nama,
      sampel,
      status: statusKey,
      waktu,
    };
  });

  const stats = [
    {
      title: "Total Pengajuan",
      value: String(totalPengajuan),
      subtext: "Semua kanal layanan",
      icon: ClipboardList,
      primary: true,
      iconColor: "bg-white text-[#1664e8]",
    },
    {
      title: "Menunggu Verifikasi",
      value: String(menungguVerifikasi),
      subtext: "Butuh tindakan petugas",
      icon: AlertCircle,
      iconColor:
        "border border-amber-200/90 bg-amber-50 text-amber-600 dark:border-amber-800/60 dark:bg-amber-950/50 dark:text-amber-400",
    },
    {
      title: "Sedang Diproses",
      value: String(sedangDiproses),
      subtext: "Uji cepat & verifikasi",
      icon: Clock,
      iconColor:
        "border border-sky-200/90 bg-sky-50 text-sky-600 dark:border-sky-800/60 dark:bg-sky-950/50 dark:text-sky-400",
    },
    {
      title: "Selesai",
      value: String(selesai),
      subtext: "Tuntas dilayani",
      icon: CheckCircle2,
      iconColor:
        "border border-emerald-200/90 bg-emerald-50 text-emerald-600 dark:border-emerald-800/60 dark:bg-emerald-950/50 dark:text-emerald-400",
    },
  ];

  const quickSettings = [
    { title: "Hero Banner", desc: "2 slide aktif", icon: Sparkles, href: "/admin/settings/hero", status: "Aktif" },
    { title: "Video Profil", desc: "Embed YouTube resmi BBPOM", icon: Video, href: "/admin/settings/video", status: "Terkoneksi" },
    { title: "Kontak & Lokasi", desc: "WhatsApp, alamat, lokasi peta", icon: PhoneCall, href: "/admin/settings/kontak", status: "Updated" },
  ];

  const weekly = [
    { d: "S", v: 55, solid: false },
    { d: "S", v: 90, solid: true },
    { d: "R", v: 72, solid: true, tip: "72%" },
    { d: "K", v: 88, solid: true, dark: true },
    { d: "J", v: 62, solid: false },
    { d: "S", v: 45, solid: false },
    { d: "M", v: 58, solid: false },
  ];
  const dayLabels = ["S", "S", "R", "K", "J", "S", "M"];

  const totalForCalc = totalPengajuan > 0 ? totalPengajuan : 1;
  const selesaiPct = totalPengajuan > 0 ? Math.round((selesai / totalForCalc) * 100) : 0;
  const diprosesPct = totalPengajuan > 0 ? Math.round((sedangDiproses / totalForCalc) * 100) : 0;
  const menungguPct = totalPengajuan > 0 ? Math.max(0, 100 - selesaiPct - diprosesPct) : 0;

  const progress = [
    { label: "Selesai", pct: selesaiPct, color: "#1664e8" },
    { label: "Diproses", pct: diprosesPct, color: "#8ebcf8" },
    { label: "Menunggu", pct: menungguPct, color: "#cfe1fb" },
  ];

  let acc = 0;
  const arcs = progress.map((p) => {
    const start = acc;
    acc += p.pct;
    return { ...p, start };
  });

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Top Section with Atmospheric Hero Image Flowing Behind Top-Right & Stat Cards */}
      <div className="relative">
        {/* Foto hero2.png menyatu dari pojok kanan atas hingga ke belakang 2 card di sebelah kanan */}
        <div className="pointer-events-none absolute -right-6 -top-16 sm:-top-20 z-0 h-[320px] sm:h-[350px] w-3/4 sm:w-2/3 md:w-3/5 lg:w-[560px] xl:w-[620px]">
          <div
            className="relative h-full w-full"
            style={{
              WebkitMaskImage:
                "radial-gradient(ellipse 95% 90% at 85% 15%, black 20%, transparent 80%)",
              maskImage:
                "radial-gradient(ellipse 95% 90% at 85% 15%, black 20%, transparent 80%)",
            }}
          >
            <Image
              src="/assets-landingpage/hero2.png"
              alt="Jembatan Ampera Palembang"
              fill
              priority
              sizes="(max-width: 1024px) 500px, 620px"
              className="object-cover object-right-top opacity-90 transition-opacity"
            />
            {/* Gradasi lembut agar menyatu dengan latar belakang */}
            <div className="absolute inset-0 bg-gradient-to-l from-transparent via-[#f7faff]/30 to-[#f7faff] dark:via-slate-950/40 dark:to-slate-950" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#f7faff] via-transparent to-transparent dark:from-slate-950" />
          </div>
        </div>

        {/* Content sitting on top of the hero image */}
        <div className="relative z-10 space-y-6">
          {/* Title */}
          <div>
            <h1 className="text-3xl font-black tracking-tight text-[#0f2257] dark:text-white">
              Dashboard AMPERA
            </h1>
            <p className="mt-1 text-sm text-[#5d6c8c] dark:text-slate-400">
              Pantau pengajuan layanan publik dan kelola konten landing page dengan mudah.
            </p>
            {/* Status WhatsApp Gateway */}
            <WaStatusBadge />
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.title}
                  className={`relative overflow-hidden rounded-xl p-4 transition-all hover:-translate-y-0.5 hover:shadow-md ${
                    s.primary
                      ? "bg-gradient-to-br from-[#0b55d9] to-[#2f86f6] text-white shadow-md shadow-blue-500/20"
                      : "border border-[#e3ecfa]/90 bg-white/80 backdrop-blur-md shadow-xs hover:bg-white/95 dark:border-slate-800/90 dark:bg-slate-900/80 dark:hover:bg-slate-900/95"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`text-xs font-semibold leading-snug sm:text-[13px] ${
                        s.primary ? "text-white" : "text-[#0f2257] dark:text-white"
                      }`}
                    >
                      {s.title}
                    </span>
                    <div
                      className={`flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-full transition-colors ${
                        s.iconColor ||
                        (s.primary
                          ? "bg-white text-[#1664e8]"
                          : "border border-[#e3ecfa] text-[#0f2257] dark:border-slate-700 dark:text-white")
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                  <div
                    className={`mt-2 text-2xl font-bold sm:text-3xl ${
                      s.primary ? "" : "text-[#0f2257] dark:text-white"
                    }`}
                  >
                    {s.value}
                  </div>
                  <p
                    className={`mt-2 flex items-center gap-1.5 text-[11px] sm:text-xs ${
                      s.primary ? "text-blue-100" : "font-medium text-[#1664e8] dark:text-blue-400"
                    }`}
                  >
                    <span
                      className={`flex h-4.5 w-4.5 items-center justify-center rounded-md ${
                        s.primary ? "bg-white/25" : "bg-[#e8f1fe] text-[#1664e8] dark:bg-blue-950/60 dark:text-blue-300"
                      }`}
                    >
                      <TrendingUp className="h-2.5 w-2.5" />
                    </span>
                    {s.subtext}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Row: analytics + reminder + settings */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className={`${card} p-5 xl:col-span-5`}>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#0f2257] dark:text-white">Analitik Pengajuan</h2>
            <span className="inline-flex items-center gap-1 rounded-lg border border-[#e3ecfa] px-3 py-1.5 text-xs text-[#5d6c8c] dark:border-slate-700">
              Minggu Ini <ChevronDown className="h-3 w-3" />
            </span>
          </div>
          <div className="mt-4 flex gap-3">
            <div className="flex h-44 flex-col justify-between pb-6 text-[11px] text-[#7b8aa8]">
              <span>100</span>
              <span>50</span>
              <span>0</span>
            </div>
            <div className="flex h-44 flex-1 items-end justify-between gap-2 border-b border-[#eef3fb] dark:border-slate-800">
              {weekly.map((b, i) => (
                <div key={i} className="relative flex h-full flex-1 flex-col items-center justify-end">
                  {b.tip && (
                    <span
                      className="absolute z-10 rounded-md bg-[#ea580c] px-2 py-0.5 text-[11px] font-bold text-white shadow-sm shadow-orange-500/20"
                      style={{ bottom: `calc(${b.v}% + 6px)` }}
                    >
                      {b.tip}
                    </span>
                  )}
                  <div
                    className="w-full max-w-[34px] rounded-full transition-all hover:opacity-85"
                    style={{
                      height: `${b.v}%`,
                      background: b.dark
                        ? "#ea580c"
                        : b.solid
                        ? "linear-gradient(180deg, #f97316, #fdba74)"
                        : "repeating-linear-gradient(135deg, #fed7aa 0, #fed7aa 3px, #fff7ed 3px, #fff7ed 7px)",
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="ml-8 mt-2 flex justify-between gap-2 text-[11px] text-[#7b8aa8]">
            {dayLabels.map((d, i) => (
              <span key={i} className="flex-1 text-center">{d}</span>
            ))}
          </div>
        </div>

        <div className={`${card} flex flex-col p-5 xl:col-span-3`}>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#0f2257] dark:text-white">Pengingat</h2>
            <Link href="/admin/layanan" className="text-xs font-semibold text-[#1664e8]">Lihat Semua</Link>
          </div>
          <div className="mt-4 flex-1 rounded-xl border border-[#e3ecfa] p-4 dark:border-slate-700">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#e8f1fe] text-[#1664e8]">
                <ShieldCheck className="h-[18px] w-[18px]" />
              </div>
              <div>
                <p className="text-sm font-bold leading-snug text-[#0f2257] dark:text-white">SOP Pelayanan Cepat BBPOM</p>
                <p className="mt-1.5 text-xs leading-relaxed text-[#5d6c8c] dark:text-slate-400">
                  Pengujian Cepat selesai dalam <strong>15–30 menit</strong> di lokasi atau lab keliling.
                </p>
              </div>
            </div>
          </div>
          <Link
            href="/admin/layanan"
            className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-[#1664e8] py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:bg-[#0f55cc]"
          >
            <ClipboardList className="h-4 w-4" /> Verifikasi Sekarang
          </Link>
        </div>

        <div className={`${card} p-5 xl:col-span-4`}>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#0f2257] dark:text-white">Pengaturan Landing Page</h2>
            <span className="rounded-lg border border-[#e3ecfa] px-2.5 py-1 text-xs text-[#5d6c8c] dark:border-slate-700">4 Modul</span>
          </div>
          <div className="mt-3 space-y-1">
            {quickSettings.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex items-center justify-between rounded-xl p-2.5 transition-colors hover:bg-[#f1f6ff] dark:hover:bg-slate-800"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e8f1fe] text-[#1664e8]">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#0f2257] dark:text-white">{item.title}</p>
                      <p className="text-[11px] text-[#7b8aa8]">{item.desc}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[#7b8aa8] transition-transform group-hover:translate-x-1 group-hover:text-[#1664e8]" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Row: table + progress */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className={`${card} p-5 xl:col-span-8`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-sm font-bold text-[#0f2257] dark:text-white">
                  Statistik Tren Layanan
                </h2>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1.5 font-medium text-[#f97316]">
                    <span className="h-2 w-2 rounded-full bg-[#f97316]" />
                    Pengajuan Masuk
                  </span>
                  <span className="flex items-center gap-1.5 font-medium text-[#1664e8]">
                    <span className="h-2 w-2 rounded-full bg-[#1664e8]" />
                    Layanan Selesai
                  </span>
                </div>
              </div>
              <p className="mt-0.5 text-xs text-[#7b8aa8]">
                Statistik perbandingan permohonan masuk vs layanan diselesaikan
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#e3ecfa] bg-white px-3 py-1.5 text-xs font-medium text-[#5d6c8c] shadow-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                6 Bulan Terakhir <ChevronDown className="h-3 w-3 text-[#7b8aa8]" />
              </span>
            </div>
          </div>

          <div className="mt-4 w-full overflow-x-auto">
            <div className="min-w-[560px]">
              <svg viewBox="0 0 720 260" className="h-auto w-full select-none overflow-visible">
                <defs>
                  {/* Gradasi Oranye untuk Pengajuan Masuk (sesuai palette Analitik Pengajuan) */}
                  <linearGradient id="gradient-orange" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" stopOpacity="0.32" />
                    <stop offset="60%" stopColor="#fdba74" stopOpacity="0.12" />
                    <stop offset="100%" stopColor="#fdba74" stopOpacity="0" />
                  </linearGradient>
                  {/* Gradasi Biru untuk Layanan Selesai */}
                  <linearGradient id="gradient-blue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1664e8" stopOpacity="0.28" />
                    <stop offset="70%" stopColor="#3b82f6" stopOpacity="0.08" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Garis Grid Horizontal Putus-putus */}
                <line x1="55" y1="45" x2="685" y2="45" stroke="#94a3b8" strokeOpacity="0.3" strokeDasharray="4 4" />
                <line x1="55" y1="95" x2="685" y2="95" stroke="#94a3b8" strokeOpacity="0.3" strokeDasharray="4 4" />
                <line x1="55" y1="145" x2="685" y2="145" stroke="#94a3b8" strokeOpacity="0.3" strokeDasharray="4 4" />
                <line x1="55" y1="195" x2="685" y2="195" stroke="#94a3b8" strokeOpacity="0.3" strokeDasharray="4 4" />

                {/* Label Sumbu Y */}
                <text x="45" y="49" textAnchor="end" fill="#7b8aa8" fontSize="11" fontWeight="500">40k</text>
                <text x="45" y="99" textAnchor="end" fill="#7b8aa8" fontSize="11" fontWeight="500">30k</text>
                <text x="45" y="149" textAnchor="end" fill="#7b8aa8" fontSize="11" fontWeight="500">20k</text>
                <text x="45" y="199" textAnchor="end" fill="#7b8aa8" fontSize="11" fontWeight="500">10k</text>

                {/* Area Fill Oranye */}
                <path
                  d="M 80 135 C 130 125, 130 125, 180 125 C 230 125, 230 165, 280 165 C 330 165, 330 140, 380 140 C 430 140, 430 95, 480 95 C 530 95, 530 130, 580 130 C 630 130, 630 110, 680 110 L 680 220 L 80 220 Z"
                  fill="url(#gradient-orange)"
                />

                {/* Area Fill Biru */}
                <path
                  d="M 80 130 C 130 130, 130 165, 180 165 C 230 165, 230 145, 280 145 C 330 145, 330 155, 380 155 C 430 155, 430 115, 480 115 C 530 115, 530 80, 580 80 C 630 80, 630 50, 680 50 L 680 220 L 80 220 Z"
                  fill="url(#gradient-blue)"
                />

                {/* Garis Kurva Oranye */}
                <path
                  d="M 80 135 C 130 125, 130 125, 180 125 C 230 125, 230 165, 280 165 C 330 165, 330 140, 380 140 C 430 140, 430 95, 480 95 C 530 95, 530 130, 580 130 C 630 130, 630 110, 680 110"
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Garis Kurva Biru */}
                <path
                  d="M 80 130 C 130 130, 130 165, 180 165 C 230 165, 230 145, 280 145 C 330 145, 330 155, 380 155 C 430 155, 430 115, 480 115 C 530 115, 530 80, 580 80 C 630 80, 630 50, 680 50"
                  fill="none"
                  stroke="#1664e8"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Puncak Oranye: Titik & Tooltip Callout */}
                <circle cx="480" cy="95" r="4.5" fill="#f97316" stroke="#ffffff" strokeWidth="2.5" />
                <g className="cursor-pointer transition-transform hover:scale-105" style={{ transformOrigin: "480px 62px" }}>
                  <rect x="420" y="47" width="120" height="24" rx="6" fill="#ea580c" />
                  <path d="M 475 71 L 485 71 L 480 77 Z" fill="#ea580c" />
                  <text x="480" y="63" fill="#ffffff" fontSize="10.5" fontWeight="700" textAnchor="middle">
                    Tertinggi Pengajuan
                  </text>
                </g>

                {/* Puncak Biru: Titik & Tooltip Callout */}
                <circle cx="680" cy="50" r="4.5" fill="#1664e8" stroke="#ffffff" strokeWidth="2.5" />
                <g className="cursor-pointer transition-transform hover:scale-105" style={{ transformOrigin: "630px 18px" }}>
                  <rect x="580" y="5" width="102" height="24" rx="6" fill="#0b55d9" />
                  <path d="M 674 29 L 684 29 L 680 35 Z" fill="#0b55d9" />
                  <text x="631" y="21" fill="#ffffff" fontSize="10.5" fontWeight="700" textAnchor="middle">
                    Tertinggi Selesai
                  </text>
                </g>

                {/* Label Sumbu X (Bulan) */}
                <text x="80" y="244" textAnchor="middle" fill="#7b8aa8" fontSize="11" fontWeight="500">Des</text>
                <text x="180" y="244" textAnchor="middle" fill="#7b8aa8" fontSize="11" fontWeight="500">Jan</text>
                <text x="280" y="244" textAnchor="middle" fill="#7b8aa8" fontSize="11" fontWeight="500">Feb</text>
                <text x="380" y="244" textAnchor="middle" fill="#7b8aa8" fontSize="11" fontWeight="500">Mar</text>
                <text x="480" y="244" textAnchor="middle" fill="#7b8aa8" fontSize="11" fontWeight="500">April</text>
                <text x="580" y="244" textAnchor="middle" fill="#7b8aa8" fontSize="11" fontWeight="500">Mei</text>
                <text x="680" y="244" textAnchor="middle" fill="#7b8aa8" fontSize="11" fontWeight="500">Jun</text>
              </svg>
            </div>
          </div>
        </div>

        <div className={`${card} p-5 xl:col-span-4`}>
          <h2 className="text-sm font-bold text-[#0f2257] dark:text-white">Progres Pengajuan</h2>
          <div className="relative mx-auto mt-4 w-full max-w-[240px]">
            <svg viewBox="0 0 200 110" className="w-full">
              {arcs.map((a) => (
                <path
                  key={a.label}
                  d="M 20 100 A 80 80 0 0 1 180 100"
                  pathLength={100}
                  fill="none"
                  stroke={a.color}
                  strokeWidth={22}
                  strokeDasharray={`${a.pct - 1} 100`}
                  strokeDashoffset={-a.start}
                />
              ))}
            </svg>
            <div className="absolute inset-x-0 bottom-0 text-center">
              <div className="text-3xl font-bold text-[#0f2257] dark:text-white">{selesaiPct}%</div>
              <div className="text-[11px] text-[#7b8aa8]">Pengajuan Selesai</div>
            </div>
          </div>
          <div className="mt-5 space-y-2.5">
            {progress.map((p) => (
              <div key={p.label} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-[#5d6c8c] dark:text-slate-400">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: p.color }} />
                  {p.label}
                </span>
                <span className="font-bold text-[#0f2257] dark:text-white">{p.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row: Pengajuan Layanan Terkini Table Card (Full Width) */}
      <div className={`${card} p-5`}>
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#0f2257] dark:text-white">
            Pengajuan Layanan Terkini
          </h2>
          <Link
            href="/admin/data-ampera"
            className="text-xs font-semibold text-[#1664e8] transition hover:underline"
          >
            Lihat Semua
          </Link>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#eef3fb] text-[#7b8aa8] dark:border-slate-800">
              <tr>
                <th className="pb-3 pr-4 font-semibold">Pemohon</th>
                <th className="pb-3 pr-4 font-semibold">Layanan</th>
                <th className="pb-3 pr-4 font-semibold">Status</th>
                <th className="pb-3 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef3fb] dark:divide-slate-800">
              {recentSubmissions.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="py-10 text-center text-xs text-slate-400 dark:text-slate-500"
                  >
                    Belum ada pengajuan layanan yang tercatat dalam sistem database.
                  </td>
                </tr>
              ) : (
                recentSubmissions.map((row) => {
                let badge = "bg-slate-100 text-slate-600";
                let label: string = row.status;
                if (row.status === "MENUNGGU") {
                  badge = "bg-rose-50 text-rose-500 dark:bg-rose-950/40 dark:text-rose-400";
                  label = "Menunggu";
                } else if (row.status === "DIPROSES") {
                  badge = "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400";
                  label = "Diproses";
                } else if (row.status === "SELESAI") {
                  badge = "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400";
                  label = "Selesai";
                }
                return (
                  <tr
                    key={row.id}
                    className="transition-colors hover:bg-[#f7faff] dark:hover:bg-slate-800/40"
                  >
                    <td className="py-3.5 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e8f1fe] text-xs font-bold text-[#1664e8]">
                          {row.nama.charAt(0)}
                        </div>
                        <div>
                          <div className="text-[13px] font-semibold text-[#0f2257] dark:text-white">
                            {row.nama}
                          </div>
                          <div className="text-[11px] text-[#7b8aa8]">
                            {row.id} • {row.waktu}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 pr-4">
                      <div className="font-semibold text-[#0f2257] dark:text-slate-200">
                        {row.layanan}
                      </div>
                      <div className="line-clamp-1 text-[11px] text-[#7b8aa8]">
                        {row.sampel}
                      </div>
                    </td>
                    <td className="py-3.5 pr-4">
                      <span className={`inline-block rounded-full px-3.5 py-1 text-[11px] font-semibold ${badge}`}>
                        {label}
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      <Link
                        href="/admin/data-ampera"
                        className="inline-flex items-center gap-1 rounded-lg border border-[#e3ecfa] bg-white px-3 py-1.5 font-semibold text-[#0f2257] transition hover:border-[#1664e8] hover:text-[#1664e8] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                      >
                        Detail <ArrowUpRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

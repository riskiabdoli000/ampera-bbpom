import React from "react";
import Link from "next/link";
import Image from "next/image";
import WaStatusBadge from "@/components/admin/WaStatusBadge";
import { prisma } from "@/lib/prisma";
import { AdminWeeklyAnalyticsCard } from "@/components/admin/dashboard/AdminWeeklyAnalyticsCard";
import { AdminTrendsChartCard } from "@/components/admin/dashboard/AdminTrendsChartCard";
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  ChevronDown,
  Users,
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
  let ditolak = 0;
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

  let rawPetugas: Array<{
    id: number;
    nip: string;
    nama: string;
    jabatan: string | null;
    fotoUrl: string | null;
    isAktif: boolean;
    layananNama: string | null;
  }> = [];
  let totalPetugas = 0;
  let petugasAktif = 0;
  let allSubmissions: Array<{
    id: number;
    status: string;
    createdAt: Date;
  }> = [];

  // Rentang waktu hari ini (Zona Waktu Indonesia Barat / Asia/Jakarta)
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const todayStr = formatter.format(now);
  const startOfToday = new Date(`${todayStr}T00:00:00+07:00`);
  const endOfToday = new Date(`${todayStr}T23:59:59.999+07:00`);

  try {
    const [tCount, mCount, pCount, sCount, dCount, recents, pList, pTotal, pAktif, allList] =
      await Promise.all([
        prisma.pengajuanLayanan.count(),
        prisma.pengajuanLayanan.count({ where: { status: "MENUNGGU_VERIFIKASI" } }),
        prisma.pengajuanLayanan.count({ where: { status: "DIPROSES" } }),
        prisma.pengajuanLayanan.count({ where: { status: "SELESAI" } }),
        prisma.pengajuanLayanan.count({ where: { status: "DITOLAK" } }),
        prisma.pengajuanLayanan.findMany({
          where: {
            createdAt: {
              gte: startOfToday,
              lte: endOfToday,
            },
          },
          orderBy: { createdAt: "desc" },
          include: {
            tamu: true,
            layanan: true,
          },
        }),
        prisma.$queryRawUnsafe<any[]>(`
          SELECT p.id, p.nip, p.nama, p.jabatan, p."isAktif", p."fotoUrl", l.nama as "layananNama"
          FROM "Petugas" p
          LEFT JOIN "Layanan" l ON p."layananId" = l.id
          ORDER BY p."isAktif" DESC, p.id ASC
          LIMIT 3;
        `).catch(() => []),
        prisma.$queryRawUnsafe<any[]>('SELECT COUNT(*)::text as count FROM "Petugas"').catch(() => [{ count: "0" }]),
        prisma.$queryRawUnsafe<any[]>('SELECT COUNT(*)::text as count FROM "Petugas" WHERE "isAktif" = true').catch(() => [{ count: "0" }]),
        prisma.pengajuanLayanan.findMany({
          select: {
            id: true,
            status: true,
            createdAt: true,
          },
        }),
      ]);
    totalPengajuan = tCount;
    menungguVerifikasi = mCount;
    sedangDiproses = pCount;
    selesai = sCount;
    ditolak = dCount;
    rawRecent = recents;
    rawPetugas = pList || [];
    totalPetugas = Number(pTotal[0]?.count || 0);
    petugasAktif = Number(pAktif[0]?.count || 0);
    allSubmissions = allList;
  } catch (err) {
    console.warn("[Admin Dashboard] Gagal membaca data pengajuan/petugas database:", err);
  }

  const recentSubmissions = rawRecent.map((p) => {
    const sampel =
      p.produkDicurigai ||
      p.informasiDibutuhkan ||
      p.isiPengaduan ||
      p.rincianInformasiKip ||
      "Permohonan Layanan";

    const jamWib = new Date(p.createdAt).toLocaleTimeString("id-ID", {
      timeZone: "Asia/Jakarta",
      hour: "2-digit",
      minute: "2-digit",
    });

    const diffMs = Date.now() - new Date(p.createdAt).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);

    let waktu = `${jamWib} WIB`;
    if (diffMins < 60) {
      waktu = `${Math.max(1, diffMins)} menit lalu (${jamWib} WIB)`;
    } else if (diffHours < 24) {
      waktu = `${diffHours} jam lalu (${jamWib} WIB)`;
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

  // Serialisasi data pengajuan untuk komponen client analitik & grafik tren
  const serializedSubmissions = allSubmissions.map((p) => ({
    id: p.id,
    status: p.status,
    createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : String(p.createdAt),
  }));

  // Progres Pengajuan Real
  const totalForCalc = totalPengajuan > 0 ? totalPengajuan : 1;
  const selesaiPct = totalPengajuan > 0 ? Math.round((selesai / totalForCalc) * 100) : 0;
  const diprosesPct = totalPengajuan > 0 ? Math.round((sedangDiproses / totalForCalc) * 100) : 0;
  const menungguPct = totalPengajuan > 0 ? Math.round((menungguVerifikasi / totalForCalc) * 100) : 0;
  const ditolakPct = totalPengajuan > 0 ? Math.max(0, 100 - selesaiPct - diprosesPct - menungguPct) : 0;

  const progress = [
    { label: "Selesai", count: selesai, pct: selesaiPct, color: "#1664e8" },
    { label: "Diproses", count: sedangDiproses, pct: diprosesPct, color: "#8ebcf8" },
    { label: "Menunggu", count: menungguVerifikasi, pct: menungguPct, color: "#cfe1fb" },
    ...(ditolak > 0 ? [{ label: "Ditolak", count: ditolak, pct: ditolakPct, color: "#fda4af" }] : []),
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
        <AdminWeeklyAnalyticsCard submissions={serializedSubmissions} />

        <div className={`${card} flex flex-col p-5 xl:col-span-3 justify-between`}>
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#0f2257] dark:text-white">Pengingat Tugas</h2>
              <Link href="/admin/data-ampera" className="text-xs font-semibold text-[#1664e8] hover:underline">
                Lihat Data
              </Link>
            </div>
            <div className="mt-4 rounded-xl border border-[#e3ecfa] p-4 dark:border-slate-700 bg-[#f8fbff] dark:bg-slate-800/40">
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                    menungguVerifikasi > 0
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400"
                      : "bg-[#e8f1fe] text-[#1664e8]"
                  }`}
                >
                  <ShieldCheck className="h-[18px] w-[18px]" />
                </div>
                <div>
                  <p className="text-sm font-bold leading-snug text-[#0f2257] dark:text-white">
                    {menungguVerifikasi > 0 ? "Perlu Verifikasi Petugas" : "Layanan Berjalan Normal"}
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed text-[#5d6c8c] dark:text-slate-400">
                    {menungguVerifikasi > 0 ? (
                      <>
                        Terdapat <strong>{menungguVerifikasi} permohonan</strong> berstatus Menunggu Verifikasi. Segera tindak lanjuti untuk menjaga standar SLA respon cepat BBPOM.
                      </>
                    ) : (
                      <>
                        Semua tiket permohonan telah ditindaklanjuti. Pertahankan kinerja prima dan SOP pelayanan publik BBPOM di Palembang.
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <Link
            href="/admin/data-ampera"
            className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-[#1664e8] py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:bg-[#0f55cc]"
          >
            <ClipboardList className="h-4 w-4" /> {menungguVerifikasi > 0 ? "Verifikasi Sekarang" : "Buka Data Ampera"}
          </Link>
        </div>

        <div className={`${card} p-5 xl:col-span-4 flex flex-col justify-between`}>
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-[#1664e8] dark:bg-blue-950/50 dark:text-blue-400">
                  <Users className="h-4 w-4" />
                </div>
                <h2 className="text-sm font-bold text-[#0f2257] dark:text-white">Data Petugas</h2>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200/90 bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {petugasAktif} Aktif
              </span>
            </div>

            <div className="mt-3 space-y-1.5">
              {rawPetugas.length === 0 ? (
                <div className="py-7 text-center text-xs text-slate-400 dark:text-slate-500">
                  Belum ada master data petugas terdaftar.
                </div>
              ) : (
                rawPetugas.map((petugas) => (
                  <Link
                    key={petugas.id}
                    href="/admin/petugas"
                    className="group flex items-center justify-between rounded-xl p-2 transition-colors hover:bg-[#f1f6ff] dark:hover:bg-slate-800"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-xl bg-slate-100 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 flex items-center justify-center">
                        {petugas.fotoUrl ? (
                          <Image
                            src={petugas.fotoUrl}
                            alt={petugas.nama}
                            fill
                            className="object-cover"
                            sizes="36px"
                          />
                        ) : (
                          <span className="text-xs font-black text-slate-500 dark:text-slate-400">
                            {petugas.nama.slice(0, 2).toUpperCase()}
                          </span>
                        )}
                        {petugas.isAktif && (
                          <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full border border-white bg-emerald-500 dark:border-slate-900" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-[#0f2257] group-hover:text-[#1664e8] dark:text-white transition-colors">
                          {petugas.nama}
                        </p>
                        <p className="truncate text-[11px] text-[#7b8aa8]">
                          {petugas.layananNama || petugas.jabatan || `NIP. ${petugas.nip}`}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-[#7b8aa8] transition-transform group-hover:translate-x-1 group-hover:text-[#1664e8]" />
                  </Link>
                ))
              )}
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 text-[11px]">
              Total: <strong className="text-[#0f2257] dark:text-white">{totalPetugas}</strong> petugas
            </span>
            <Link
              href="/admin/petugas"
              className="font-bold text-[#1664e8] hover:underline inline-flex items-center gap-1 text-[11px]"
            >
              Kelola Petugas <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Row: table + progress */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <AdminTrendsChartCard submissions={serializedSubmissions} />

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
                <span className="font-bold text-[#0f2257] dark:text-white">
                  {p.count} tiket ({p.pct}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row: Pengajuan Layanan Terkini Table Card (Full Width) */}
      <div className={`${card} p-5`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-bold text-[#0f2257] dark:text-white">
              Pengajuan Layanan Terkini
            </h2>
            <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-[#1664e8] dark:bg-blue-950/60 dark:text-blue-300">
              Hari Ini ({recentSubmissions.length})
            </span>
          </div>
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
                    Belum ada pengajuan layanan yang masuk pada hari ini.
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

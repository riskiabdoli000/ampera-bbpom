import React from "react";
import { getServiceLaporanData } from "@/app/actions/data-ampera";
import { ServiceReportClient } from "../ServiceReportClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Laporan Keterbukaan Informasi Publik (KIP) | Admin AMPERA BBPOM",
  description:
    "Data laporan dan permohonan resmi Keterbukaan Informasi Publik (KIP) melalui Pejabat Pengelola Informasi dan Dokumentasi (PPID) BBPOM di Palembang.",
};

export default async function LaporanKipPage() {
  const { pengajuanList, penggunaList, stats } =
    await getServiceLaporanData("KIP");

  return (
    <ServiceReportClient
      serviceCode="KIP"
      title="Data Laporan Keterbukaan Informasi Publik (KIP)"
      subtitle="Rekapitulasi permohonan dokumen dan informasi publik resmi masyarakat melalui portal PPID BBPOM di Palembang."
      serviceName="Keterbukaan Informasi (KIP)"
      initialPengajuan={pengajuanList}
      initialPengguna={penggunaList}
      initialStats={stats}
    />
  );
}

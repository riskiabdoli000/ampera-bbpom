import React from "react";
import { getServiceLaporanData } from "@/app/actions/data-ampera";
import { ServiceReportClient } from "../ServiceReportClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Laporan Pengujian Cepat | Admin AMPERA BBPOM",
  description:
    "Data laporan dan hasil pengujian cepat sampel pangan masyarakat (Boraks, Formalin, Rhodamin B, Metanil Yellow).",
};

export default async function LaporanPengujianCepatPage() {
  const { pengajuanList, penggunaList, stats } =
    await getServiceLaporanData("UJI_CEPAT");

  return (
    <ServiceReportClient
      serviceCode="UJI_CEPAT"
      title="Data Laporan Pengujian Cepat Ampera"
      subtitle="Rekapitulasi pengajuan uji cepat sampel makanan/minuman yang dicurigai mengandung bahan berbahaya kimia."
      serviceName="Pengujian Cepat"
      initialPengajuan={pengajuanList}
      initialPengguna={penggunaList}
      initialStats={stats}
    />
  );
}

import React from "react";
import { getServiceLaporanData } from "@/app/actions/data-ampera";
import { ServiceReportClient } from "../ServiceReportClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Laporan Permintaan Informasi | Admin AMPERA BBPOM",
  description:
    "Data laporan dan rekapitulasi permohonan informasi publik masyarakat di Balai Besar POM di Palembang.",
};

export default async function LaporanInformasiPage() {
  const { pengajuanList, penggunaList, stats } =
    await getServiceLaporanData("INFO");

  return (
    <ServiceReportClient
      serviceCode="INFO"
      title="Data Laporan Permintaan Informasi"
      subtitle="Rekapitulasi permohonan informasi regulasi obat dan makanan, izin edar, serta konsultasi publik."
      serviceName="Permintaan Informasi"
      initialPengajuan={pengajuanList}
      initialPengguna={penggunaList}
      initialStats={stats}
    />
  );
}

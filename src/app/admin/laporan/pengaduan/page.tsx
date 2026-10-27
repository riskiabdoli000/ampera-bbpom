import React from "react";
import { getServiceLaporanData } from "@/app/actions/data-ampera";
import { ServiceReportClient } from "../ServiceReportClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Laporan Pengaduan Masyarakat | Admin AMPERA BBPOM",
  description:
    "Data laporan pengaduan masyarakat mengenai peredaran obat, makanan, kosmetik, atau suplemen ilegal/berbahaya.",
};

export default async function LaporanPengaduanPage() {
  const { pengajuanList, penggunaList, stats } =
    await getServiceLaporanData("ADUAN");

  return (
    <ServiceReportClient
      serviceCode="ADUAN"
      title="Data Laporan Pengaduan Masyarakat"
      subtitle="Rekapitulasi laporan pengaduan dugaan pelanggaran produk obat dan makanan ilegal atau membahayakan kesehatan."
      serviceName="Pengaduan Masyarakat"
      initialPengajuan={pengajuanList}
      initialPengguna={penggunaList}
      initialStats={stats}
    />
  );
}

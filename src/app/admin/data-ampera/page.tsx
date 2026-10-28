import React from "react";
import { getDataAmperaOverview } from "@/app/actions/data-ampera";
import { AdminDataAmperaClient } from "./AdminDataAmperaClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Data Ampera (Pengguna & Layanan) | Admin AMPERA BBPOM",
  description:
    "Manajemen data pemohon/pengguna masyarakat dan seluruh formulir pengajuan layanan publik yang telah tersimpan di sistem BBPOM Palembang.",
};

export default async function AdminDataAmperaPage() {
  const { pengajuanList, penggunaList, stats } = await getDataAmperaOverview();

  return (
    <AdminDataAmperaClient
      initialPengajuan={pengajuanList}
      initialPengguna={penggunaList}
      initialStats={stats}
    />
  );
}

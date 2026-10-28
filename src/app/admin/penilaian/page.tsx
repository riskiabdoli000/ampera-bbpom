import React from "react";
import { getAdminPenilaianOverviewAction } from "@/app/actions/admin-penilaian";
import { AdminPenilaianClient } from "./AdminPenilaianClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Data Penilaian & Indeks IKM | Admin AMPERA BBPOM",
  description:
    "Monitoring dan pengelolaan data hasil evaluasi survei kepuasan masyarakat (IKM) pada pelayanan publik Balai Besar POM di Palembang.",
};

export default async function AdminPenilaianPage() {
  const overview = await getAdminPenilaianOverviewAction();

  return (
    <AdminPenilaianClient
      initialList={overview.list}
      initialStats={overview.stats}
    />
  );
}

import React from "react";
import { getBbpomTautanAdminListAction } from "@/app/actions/settings-bbpom";
import { BbpomSettingsClient } from "./BbpomSettingsClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Kelola Tautan BBPOM | Admin AMPERA BBPOM",
  description:
    "Pengaturan tautan navigasi portal BBPOM Pusat dan BBPOM Palembang pada website AMPERA.",
};

export default async function AdminBbpomSettingsPage() {
  const initialList = await getBbpomTautanAdminListAction();

  return <BbpomSettingsClient initialList={initialList} />;
}


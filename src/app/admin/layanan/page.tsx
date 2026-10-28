import React from "react";
import { getAdminLayananList } from "@/app/actions/admin-layanan";
import { AdminLayananClient } from "./AdminLayananClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Kelola Master Data Layanan | Admin AMPERA BBPOM",
  description: "Manajemen data master layanan publik BBPOM di Palembang (Tambah, Edit, Hapus, dan Status Aktif).",
};

export default async function AdminLayananPage() {
  const list = await getAdminLayananList();

  return <AdminLayananClient initialData={list} />;
}

import React from "react";
import { getAdminPetugasList, getLayananOptions } from "@/app/actions/admin-petugas";
import { AdminPetugasClient } from "./AdminPetugasClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Kelola Master Data Petugas | Admin AMPERA BBPOM",
  description: "Manajemen data master petugas pelayanan publik BBPOM di Palembang (Tambah, Edit, Hapus, Foto Profil, dan Status Tugas).",
};

export default async function AdminPetugasPage() {
  const [list, layananOptions] = await Promise.all([
    getAdminPetugasList(),
    getLayananOptions(),
  ]);

  return <AdminPetugasClient initialData={list} layananOptions={layananOptions} />;
}


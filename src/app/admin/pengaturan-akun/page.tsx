import React from "react";
import { redirect } from "next/navigation";
import { getAdminAccountDataAction } from "@/app/actions/admin-account";
import { AdminPengaturanAkunClient } from "./AdminPengaturanAkunClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Pengaturan Akun & Manajemen Operator | Admin AMPERA BBPOM",
  description:
    "Kelola kata sandi akun admin, tambah akun operator baru, serta reset kata sandi akses sistem pelayanan publik BBPOM di Palembang.",
};

export default async function AdminPengaturanAkunPage() {
  const result = await getAdminAccountDataAction();

  if (!result.success || !result.data) {
    redirect("/admin/login");
  }

  return (
    <AdminPengaturanAkunClient
      initialCurrentAdmin={result.data.currentAdmin}
      initialAccounts={result.data.accounts}
    />
  );
}

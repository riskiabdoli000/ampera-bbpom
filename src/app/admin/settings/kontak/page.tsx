import React from "react";
import { getKontakSettings } from "@/app/actions/settings-kontak";
import { KontakSettingsForm } from "./KontakSettingsForm";

export const dynamic = "force-dynamic";

export default async function AdminKontakSettingsPage() {
  const kontak = await getKontakSettings();

  return <KontakSettingsForm initialData={kontak} />;
}

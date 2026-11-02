import React from "react";
import { getEdukasiList } from "@/app/actions/settings-edukasi";
import { EdukasiSettingsForm } from "./EdukasiSettingsForm";

export const dynamic = "force-dynamic";

export default async function AdminEdukasiSettingsPage() {
  const items = await getEdukasiList();

  return <EdukasiSettingsForm initialItems={items} />;
}

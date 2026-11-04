import React from "react";
import { getMateriEdukasiAdminListAction } from "@/app/actions/settings-edukasi";
import { EdukasiSettingsForm } from "./EdukasiSettingsForm";

export const dynamic = "force-dynamic";

export default async function AdminEdukasiSettingsPage() {
  const items = await getMateriEdukasiAdminListAction();

  return <EdukasiSettingsForm initialItems={items} />;
}

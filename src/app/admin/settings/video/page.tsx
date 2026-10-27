import React from "react";
import { getVideoSettings } from "@/app/actions/settings-video";
import { VideoSettingsForm } from "./VideoSettingsForm";

export const dynamic = "force-dynamic";

export default async function AdminVideoSettingsPage() {
  const video = await getVideoSettings();

  return <VideoSettingsForm initialData={video} />;
}

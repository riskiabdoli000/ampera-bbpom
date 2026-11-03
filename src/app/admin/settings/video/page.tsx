import React from "react";
import { getVideoSettingsList } from "@/app/actions/settings-video";
import { VideoSettingsForm } from "./VideoSettingsForm";

export const dynamic = "force-dynamic";

export default async function AdminVideoSettingsPage() {
  const videoList = await getVideoSettingsList();

  return <VideoSettingsForm initialList={videoList} />;
}

import React from "react";
import { getHeroSettings } from "@/app/actions/settings-hero";
import { HeroSettingsForm } from "./HeroSettingsForm";

export const dynamic = "force-dynamic";

export default async function AdminHeroSettingsPage() {
  const { konten, slides, isStorageConfigured } = await getHeroSettings();

  return (
    <HeroSettingsForm
      initialKonten={konten}
      initialSlides={slides}
      isStorageConfigured={isStorageConfigured}
    />
  );
}

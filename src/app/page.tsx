import React from "react";
import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { SpeedBadgesSection } from "@/components/landing/SpeedBadgesSection";
import { ServicesSection } from "@/components/landing/ServicesSection";
import { EducationSection } from "@/components/landing/EducationSection";
import { VideoSection } from "@/components/landing/VideoSection";
import { ContactSection } from "@/components/landing/ContactSection";
import { Footer } from "@/components/landing/Footer";
import { getLandingHeroData } from "@/app/actions/settings-hero";
import { getLandingServicesData } from "@/app/actions/admin-layanan";
import { getVideoSettings } from "@/app/actions/settings-video";
import { getKontakSettings } from "@/app/actions/settings-kontak";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [heroData, servicesData, videoData, contactData] = await Promise.all([
    getLandingHeroData(),
    getLandingServicesData(),
    getVideoSettings(),
    getKontakSettings(),
  ]);

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col selection:bg-teal-700 selection:text-white overflow-x-hidden transition-colors duration-300">
      {/* Navbar Resmi BPOM Sumatera Selatan */}
      <Navbar />

      {/* Hero Section Utama Jembatan Ampera */}
      <HeroSection initialData={heroData} />

      {/* Section 4 Layanan Utama AMPERA */}
      <ServicesSection initialData={servicesData} />

      {/* Badge Kecepatan Layanan (Compact Strip) */}
      <SpeedBadgesSection />

      {/* Section Edukasi & Literasi Konsumen */}
      <EducationSection />

      {/* Section Video Profil & Dokumentasi Resmi BBPOM Palembang */}
      <VideoSection initialData={videoData} />

      {/* Section Kontak & Peta Lokasi Kantor */}
      <ContactSection initialData={contactData} />

      {/* Footer Resmi BBPOM di Palembang */}
      <Footer contactData={contactData} />
    </main>
  );
}

import React from "react";
import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";

export default function Home() {
  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col selection:bg-teal-700 selection:text-white overflow-x-hidden transition-colors duration-300">
      {/* Navbar Resmi BPOM Sumatera Selatan */}
      <Navbar />

      {/* Hero Section Utama Jembatan Ampera */}
      <HeroSection />
    </main>
  );
}

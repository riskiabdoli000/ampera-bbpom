"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Minus,
  Plus,
  Volume2,
  Link2,
  Type,
  MoveHorizontal,
  RotateCcw,
} from "lucide-react";

type ColorMode = "normal" | "high-contrast" | "inverted" | "grayscale";

interface A11ySettings {
  fontSizeScale: number; // default: 100 (rentang 80 - 120 agar 100% tepat di tengah slider)
  colorMode: ColorMode;
  voiceMode: boolean;
  underlineLinks: boolean;
  boldText: boolean;
  textSpacing: boolean;
}

const DEFAULT_SETTINGS: A11ySettings = {
  fontSizeScale: 100,
  colorMode: "normal",
  voiceMode: false,
  underlineLinks: false,
  boldText: false,
  textSpacing: false,
};

const STORAGE_KEY = "ampera_a11y_settings_v1";

/**
 * Ilustrasi pemandangan pantai/sunset mini seperti pada referensi Colour Contrast
 */
function SunsetBeachPreview({ filterStyle }: { filterStyle?: React.CSSProperties }) {
  return (
    <div
      className="w-full h-[46px] rounded-[6px] overflow-hidden relative border border-black/10"
      style={filterStyle}
    >
      <svg
        viewBox="0 0 120 75"
        className="w-full h-full object-cover block"
        preserveAspectRatio="none"
      >
        <defs>
          {/* Langit senja (Sunset Sky) */}
          <linearGradient id="skyGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#8fa8be" />
            <stop offset="45%" stopColor="#e29d7e" />
            <stop offset="85%" stopColor="#f5884c" />
            <stop offset="100%" stopColor="#f9a152" />
          </linearGradient>
          {/* Laut (Ocean) */}
          <linearGradient id="seaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1e4258" />
            <stop offset="40%" stopColor="#3d6478" />
            <stop offset="80%" stopColor="#7a939e" />
            <stop offset="100%" stopColor="#cbbba8" />
          </linearGradient>
        </defs>

        {/* Langit */}
        <rect x="0" y="0" width="120" height="40" fill="url(#skyGrad)" />

        {/* Awan tipis di cakrawala */}
        <path
          d="M0 32 Q 30 28, 65 33 T 120 30 L 120 40 L 0 40 Z"
          fill="#d97f54"
          opacity="0.55"
        />

        {/* Garis Cakrawala & Laut */}
        <rect x="0" y="38" width="120" height="37" fill="url(#seaGrad)" />

        {/* Ombak putih berlapis */}
        <path
          d="M0 45 Q 20 43, 40 45 T 80 44 T 120 46"
          stroke="#e2e8f0"
          strokeWidth="1.5"
          fill="none"
          opacity="0.7"
        />
        <path
          d="M0 53 Q 25 50, 55 53 T 100 52 T 120 54"
          stroke="#f1f5f9"
          strokeWidth="2"
          fill="none"
          opacity="0.85"
        />
        <path
          d="M0 62 Q 30 59, 60 63 T 120 61"
          stroke="#ffffff"
          strokeWidth="2.2"
          fill="none"
          opacity="0.9"
        />
        {/* Buih pantai bawah */}
        <path
          d="M0 69 Q 35 66, 70 70 T 120 68 L 120 75 L 0 75 Z"
          fill="#e7dec8"
          opacity="0.85"
        />
      </svg>
    </div>
  );
}

export function AccessibilityWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<A11ySettings>(DEFAULT_SETTINGS);
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastSpokenRef = useRef<string>("");

  // Fungsi pembantu membacakan teks menggunakan Web Speech API (id-ID)
  const speakText = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    const cleanText = text.replace(/\s+/g, " ").trim();
    if (!cleanText) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "id-ID";
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const idVoice = voices.find(
      (v) =>
        v.lang.toLowerCase().includes("id-id") ||
        v.lang.toLowerCase().includes("id_id") ||
        v.lang.toLowerCase() === "id"
    );
    if (idVoice) {
      utterance.voice = idVoice;
    }

    window.speechSynthesis.speak(utterance);
  };

  // Load saved settings from localStorage on mount
  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<A11ySettings>;
        setSettings({
          fontSizeScale:
            typeof parsed.fontSizeScale === "number"
              ? Math.min(120, Math.max(80, parsed.fontSizeScale))
              : 100,
          colorMode: parsed.colorMode || "normal",
          voiceMode: Boolean(parsed.voiceMode),
          underlineLinks: Boolean(parsed.underlineLinks),
          boldText: Boolean(parsed.boldText),
          textSpacing: Boolean(parsed.textSpacing),
        });
      }
    } catch {
      // Abaikan jika gagal parse localStorage
    }
  }, []);

  // Apply settings to documentElement (<html>) and save to localStorage
  useEffect(() => {
    if (!mounted) return;

    const html = document.documentElement;

    // 1. Ukuran Teks
    if (settings.fontSizeScale === 100) {
      html.style.removeProperty("font-size");
    } else {
      html.style.fontSize = `${settings.fontSizeScale}%`;
    }

    // 2. Garis Bawahi Tautan
    if (settings.underlineLinks) {
      html.classList.add("a11y-underline-links");
    } else {
      html.classList.remove("a11y-underline-links");
    }

    // 3. Pertegas Teks (Bold)
    if (settings.boldText) {
      html.classList.add("a11y-bold-text");
    } else {
      html.classList.remove("a11y-bold-text");
    }

    // 4. Spasi Teks
    if (settings.textSpacing) {
      html.classList.add("a11y-text-spacing");
    } else {
      html.classList.remove("a11y-text-spacing");
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Abaikan jika storage penuh
    }
  }, [settings, mounted]);

  // Close panel on click outside or pressing Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Listener Blok / Seleksi Kalimat untuk Mode Suara (Text-to-Voice)
  useEffect(() => {
    if (!mounted) return;

    if (!settings.voiceMode) {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      lastSpokenRef.current = "";
      return;
    }

    let timeoutId: ReturnType<typeof setTimeout>;

    const handleSelectionSpeak = (event: Event) => {
      // Abaikan jika interaksi berasal dari dalam widget aksesibilitas
      if (
        containerRef.current &&
        event.target instanceof Node &&
        containerRef.current.contains(event.target)
      ) {
        return;
      }

      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const selectedText = window.getSelection()?.toString().trim() || "";
        if (selectedText.length > 0) {
          if (selectedText !== lastSpokenRef.current) {
            lastSpokenRef.current = selectedText;
            speakText(selectedText);
          }
        } else {
          // Jika seleksi dibatalkan / klik area kosong, hentikan pembacaan
          if (lastSpokenRef.current !== "") {
            lastSpokenRef.current = "";
            if ("speechSynthesis" in window) {
              window.speechSynthesis.cancel();
            }
          }
        }
      }, 40);
    };

    document.addEventListener("mouseup", handleSelectionSpeak);
    document.addEventListener("touchend", handleSelectionSpeak);
    document.addEventListener("keyup", handleSelectionSpeak);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("mouseup", handleSelectionSpeak);
      document.removeEventListener("touchend", handleSelectionSpeak);
      document.removeEventListener("keyup", handleSelectionSpeak);
    };
  }, [settings.voiceMode, mounted]);

  // Handlers
  const handleIncreaseText = () => {
    setSettings((prev) => ({
      ...prev,
      fontSizeScale: Math.min(120, prev.fontSizeScale + 5),
    }));
  };

  const handleDecreaseText = () => {
    setSettings((prev) => ({
      ...prev,
      fontSizeScale: Math.max(80, prev.fontSizeScale - 5),
    }));
  };

  const handleSliderTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setSettings((prev) => ({
      ...prev,
      fontSizeScale: Math.min(120, Math.max(80, val)),
    }));
  };

  const handleColorMode = (mode: ColorMode) => {
    setSettings((prev) => ({
      ...prev,
      colorMode: mode,
    }));
  };

  const toggleVoiceMode = () => {
    setSettings((prev) => {
      const nextVoiceMode = !prev.voiceMode;
      if (nextVoiceMode) {
        speakText("Mode suara aktif. Silakan blok teks yang ingin dibacakan.");
      } else if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      return {
        ...prev,
        voiceMode: nextVoiceMode,
      };
    });
  };

  const toggleUnderlineLinks = () => {
    setSettings((prev) => ({
      ...prev,
      underlineLinks: !prev.underlineLinks,
    }));
  };

  const toggleBoldText = () => {
    setSettings((prev) => ({
      ...prev,
      boldText: !prev.boldText,
    }));
  };

  const toggleTextSpacing = () => {
    setSettings((prev) => ({
      ...prev,
      textSpacing: !prev.textSpacing,
    }));
  };

  const handleReset = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    lastSpokenRef.current = "";
    setSettings(DEFAULT_SETTINGS);
  };

  // Hitung filter CSS untuk layer warna halaman
  const getBackdropFilterValue = (): string | undefined => {
    switch (settings.colorMode) {
      case "high-contrast":
        return "contrast(150%) saturate(135%)";
      case "inverted":
        return "invert(100%)";
      case "grayscale":
        return "grayscale(100%)";
      default:
        return undefined;
    }
  };

  const backdropFilterValue = getBackdropFilterValue();

  const colorOptions: {
    id: ColorMode;
    label: string;
    previewFilter?: React.CSSProperties;
  }[] = [
    {
      id: "normal",
      label: "Normal",
      previewFilter: undefined,
    },
    {
      id: "high-contrast",
      label: "High Contrast",
      previewFilter: { filter: "contrast(165%) saturate(145%)" },
    },
    {
      id: "inverted",
      label: "Inverted",
      previewFilter: { filter: "invert(100%)" },
    },
    {
      id: "grayscale",
      label: "Black & White",
      previewFilter: { filter: "grayscale(100%)" },
    },
  ];

  const isFontSizeModified = settings.fontSizeScale !== 100;
  // Persentase posisi slider (80% = 0%, 100% = 50% tepat di tengah, 120% = 100%)
  const sliderPercentage = ((settings.fontSizeScale - 80) / (120 - 80)) * 100;

  return (
    <>
      {/* Layer Filter Warna Halaman (Real-time, tidak merusak fixed element & tidak mem-blur halaman) */}
      {mounted && backdropFilterValue && (
        <div
          aria-hidden="true"
          className="fixed inset-0 pointer-events-none z-[9998] no-print"
          style={{
            backdropFilter: backdropFilterValue,
            WebkitBackdropFilter: backdropFilterValue,
          }}
        />
      )}

      {/* Container Utama Widget Aksesibilitas di Pojok Kanan Bawah */}
      <div
        ref={containerRef}
        data-a11y-widget="true"
        className="fixed bottom-6 right-6 z-[9999] no-print font-sans select-none"
        style={{ fontSize: "14px", lineHeight: "1.4" }}
      >
        {/* Panel Menu Aksesibilitas (Muncul tepat di atas tombol tanpa blur halaman belakang) */}
        {isOpen && (
          <div
            role="dialog"
            aria-label="Menu Aksesibilitas"
            className="absolute bottom-[64px] right-0 w-[320px] sm:w-[356px] rounded-[20px] bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-700 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.28)] p-4 text-slate-900 dark:text-slate-100 animate-fade-up"
          >
            {/* 1. Bagian Pemilihan Warna Halaman (Colour Contrast) */}
            <div className="mb-3.5 pb-3.5 border-b border-slate-100 dark:border-slate-800">
              <span className="block text-[13px] font-bold text-slate-900 dark:text-white mb-2.5">
                Colour Contrast
              </span>

              <div className="grid grid-cols-4 gap-1.5">
                {colorOptions.map((option) => {
                  const isActive = settings.colorMode === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => handleColorMode(option.id)}
                      className={`flex flex-col justify-between rounded-[10px] p-1.5 text-center transition-all cursor-pointer border ${
                        isActive
                          ? "bg-[#1a3bff] text-white border-[#1a3bff] shadow-sm ring-2 ring-[#1a3bff]/30"
                          : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-slate-400"
                      }`}
                    >
                      <span
                        className={`text-[10px] font-bold leading-tight mb-1.5 min-h-[24px] flex items-center justify-center ${
                          isActive ? "text-white" : "text-slate-800 dark:text-slate-200"
                        }`}
                      >
                        {option.label}
                      </span>
                      <SunsetBeachPreview filterStyle={option.previewFilter} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Daftar Pengaturan Teks & Tautan */}
            <div className="flex flex-col gap-1.5">
              {/* Bar Ukuran Teks (Slider + Persentase + Tombol Minus & Plus) */}
              <div
                className={`w-full flex items-center justify-between rounded-[10px] overflow-hidden transition-all ${
                  isFontSizeModified
                    ? "border border-slate-900 dark:border-white bg-slate-50 dark:bg-slate-800/90"
                    : "border border-slate-200/90 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-800/50"
                }`}
              >
                <div className="flex items-center gap-2.5 flex-1 pl-3 pr-2.5 py-2">
                  <span className="text-[13px] font-semibold text-slate-800 dark:text-slate-100 whitespace-nowrap">
                    Ukuran Teks
                  </span>

                  {/* Slider Track Interaktif */}
                  <div className="relative flex-1 flex items-center h-5 min-w-[64px]">
                    {/* Garis Track Latar */}
                    <div className="w-full h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 overflow-hidden">
                      {/* Garis Biru Aktif */}
                      <div
                        className="h-full bg-[#1a3bff] rounded-full transition-all duration-150"
                        style={{ width: `${sliderPercentage}%` }}
                      />
                    </div>
                    {/* Titik Lingkaran Putih (Thumb) */}
                    <div
                      className="absolute w-3.5 h-3.5 rounded-full bg-white border-2 border-[#1a3bff] shadow-xs pointer-events-none -translate-x-1/2 transition-all duration-150"
                      style={{ left: `${sliderPercentage}%` }}
                    />
                    {/* Input Range Transparan untuk Dragging */}
                    <input
                      type="range"
                      min={80}
                      max={120}
                      step={5}
                      value={settings.fontSizeScale}
                      onChange={handleSliderTextChange}
                      aria-label="Pengatur ukuran teks"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>

                  {/* Angka Persentase */}
                  <span className="text-[12px] font-bold text-slate-700 dark:text-slate-200 tabular-nums min-w-[36px] text-right">
                    {settings.fontSizeScale}%
                  </span>
                </div>

                {/* Tombol Minus (-) dan Plus (+) dengan Garis Pemisah Vertikal */}
                <div className="flex items-center self-stretch border-l border-slate-200/90 dark:border-slate-700/80">
                  <button
                    type="button"
                    onClick={handleDecreaseText}
                    disabled={settings.fontSizeScale <= 80}
                    aria-label="Perkecil ukuran teks"
                    title="Perkecil Teks"
                    className="w-9 h-full min-h-[38px] flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-700/70 active:bg-slate-200 transition-colors cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed"
                  >
                    <Minus className="w-3.5 h-3.5 stroke-[2.4]" />
                  </button>
                  <button
                    type="button"
                    onClick={handleIncreaseText}
                    disabled={settings.fontSizeScale >= 120}
                    aria-label="Perbesar ukuran teks"
                    title="Perbesar Teks"
                    className="w-9 h-full min-h-[38px] border-l border-slate-200/90 dark:border-slate-700/80 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-700/70 active:bg-slate-200 transition-colors cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.4]" />
                  </button>
                </div>
              </div>

              {/* Mode Suara (Text-to-Voice saat Blok / Seleksi Kalimat) */}
              <button
                type="button"
                onClick={toggleVoiceMode}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-[14px] font-medium transition-all cursor-pointer text-left ${
                  settings.voiceMode
                    ? "border border-slate-900 dark:border-white bg-slate-50 dark:bg-slate-800/90 font-semibold"
                    : "border border-transparent hover:bg-slate-100/80 dark:hover:bg-slate-800/60"
                }`}
              >
                <Volume2 className="w-[18px] h-[18px] stroke-[2] shrink-0" />
                <span>Mode Suara</span>
              </button>

              {/* Garis Bawahi Tautan */}
              <button
                type="button"
                onClick={toggleUnderlineLinks}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-[14px] font-medium transition-all cursor-pointer text-left ${
                  settings.underlineLinks
                    ? "border border-slate-900 dark:border-white bg-slate-50 dark:bg-slate-800/90 font-semibold"
                    : "border border-transparent hover:bg-slate-100/80 dark:hover:bg-slate-800/60"
                }`}
              >
                <Link2 className="w-[18px] h-[18px] stroke-[2] shrink-0" />
                <span>Garis Bawahi Tautan</span>
              </button>

              {/* Pertegas Teks (Bold) */}
              <button
                type="button"
                onClick={toggleBoldText}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-[14px] font-medium transition-all cursor-pointer text-left ${
                  settings.boldText
                    ? "border border-slate-900 dark:border-white bg-slate-50 dark:bg-slate-800/90 font-semibold"
                    : "border border-transparent hover:bg-slate-100/80 dark:hover:bg-slate-800/60"
                }`}
              >
                <Type className="w-[18px] h-[18px] stroke-[2] shrink-0" />
                <span>Pertegas Teks</span>
              </button>

              {/* Spasi Teks */}
              <button
                type="button"
                onClick={toggleTextSpacing}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-[14px] font-medium transition-all cursor-pointer text-left ${
                  settings.textSpacing
                    ? "border border-slate-900 dark:border-white bg-slate-50 dark:bg-slate-800/90 font-semibold"
                    : "border border-transparent hover:bg-slate-100/80 dark:hover:bg-slate-800/60"
                }`}
              >
                <MoveHorizontal className="w-[18px] h-[18px] stroke-[2] shrink-0" />
                <span>Spasi Teks</span>
              </button>

              {/* Atur Ulang (Reset) */}
              <div className="pt-1.5 mt-1 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-[14px] font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition-all cursor-pointer text-left"
                >
                  <RotateCcw className="w-[18px] h-[18px] stroke-[2] shrink-0" />
                  <span>Atur Ulang</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tombol Pemicu (Floating Trigger Button) di Pojok Kanan Bawah */}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label="Buka Menu Aksesibilitas"
          aria-expanded={isOpen}
          title="Menu Aksesibilitas"
          className="w-13 h-13 rounded-2xl bg-[#0066ff] hover:bg-[#0052cc] text-white shadow-[0_8px_25px_-4px_rgba(0,102,255,0.55)] flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0066ff]"
        >
          {/* Ikon Kursi Roda Aksesibilitas (SVG Bersih sesuai referensi) */}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-7 h-7"
          >
            <circle cx="11" cy="4.5" r="2" />
            <path d="M11 7v6h5.5l2 5.5" />
            <path d="M11 10.5h4" />
            <path d="M14.5 16.5a5 5 0 1 1-6.2-6.2" />
          </svg>
        </button>
      </div>
    </>
  );
}


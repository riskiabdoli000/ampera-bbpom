"use client";

import React from "react";
import {
  UserCheck,
  ClipboardList,
  BookOpen,
  GraduationCap,
  MessageSquareCheck,
  Award,
  Check,
  Lock,
} from "lucide-react";
import { StepGarda } from "./types";

interface StepProgressProps {
  currentStep: StepGarda;
  completedSteps: Set<StepGarda>;
  onStepClick?: (step: StepGarda) => void;
}

interface StepItem {
  key: StepGarda;
  title: string;
  shortTitle: string;
  icon: React.ElementType;
}

const STEPS: StepItem[] = [
  { key: "biodata", title: "1. Data Diri", shortTitle: "Biodata", icon: UserCheck },
  { key: "pre-test", title: "2. Pre-Test", shortTitle: "Pre-Test", icon: ClipboardList },
  { key: "materi", title: "3. Materi (3 Slide)", shortTitle: "Materi", icon: BookOpen },
  { key: "post-test", title: "4. Post-Test", shortTitle: "Post-Test", icon: GraduationCap },
  { key: "evaluasi", title: "5. Evaluasi", shortTitle: "Evaluasi", icon: MessageSquareCheck },
  { key: "sertifikat", title: "6. Sertifikat", shortTitle: "Sertifikat", icon: Award },
];

export function StepProgress({ currentStep, completedSteps, onStepClick }: StepProgressProps) {
  const currentIndex = STEPS.findIndex((s) => s.key === currentStep);

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm mb-8 transition-all">
      {/* Mobile Bar */}
      <div className="block lg:hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-navy-900 dark:bg-blue-600 text-white text-xs font-bold">
              {currentIndex + 1}
            </span>
            <span className="text-sm font-bold text-navy-900 dark:text-white">
              {STEPS[currentIndex]?.title}
            </span>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
            Langkah {currentIndex + 1} dari {STEPS.length}
          </span>
        </div>
        {/* Progress Bar Line */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-600 to-amber-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${((currentIndex + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Desktop Stepper */}
      <div className="hidden lg:grid grid-cols-6 relative items-start">
        {/* Connecting track line (Tepat di tengah sumbu lingkaran icon: h-11 / 2 = 22px) */}
        <div
          className="absolute top-[22px] -translate-y-1/2 h-1 bg-slate-200 dark:bg-slate-800 z-0 pointer-events-none rounded-full"
          style={{
            left: "8.333%",
            right: "8.333%",
          }}
        />

        {/* Active Progress fill line */}
        <div
          className="absolute top-[22px] -translate-y-1/2 h-1 bg-gradient-to-r from-blue-600 via-sky-500 to-amber-500 transition-all duration-500 z-0 pointer-events-none rounded-full"
          style={{
            left: "8.333%",
            width: `${(Math.max(0, currentIndex) / (STEPS.length - 1)) * 83.333}%`,
          }}
        />

        {STEPS.map((step, idx) => {
          const isCurrent = step.key === currentStep;
          const isDone = completedSteps.has(step.key);
          const isLocked = !isDone && !isCurrent && idx > currentIndex;
          const Icon = step.icon;

          return (
            <button
              key={step.key}
              type="button"
              disabled={isLocked || !onStepClick}
              onClick={() => onStepClick && !isLocked && onStepClick(step.key)}
              className={`relative z-10 flex flex-col items-center group transition-all text-center px-1 ${
                isLocked ? "cursor-not-allowed opacity-60" : "cursor-pointer"
              }`}
            >
              {/* Circle Icon Badge */}
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center font-bold shrink-0 transition-all duration-300 ${
                  isDone
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-4 ring-emerald-50 dark:ring-emerald-950/40"
                    : isCurrent
                    ? "bg-navy-900 dark:bg-blue-600 text-white shadow-lg shadow-blue-900/30 ring-4 ring-blue-100 dark:ring-blue-950 scale-110"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700"
                }`}
              >
                {isDone ? (
                  <Check className="w-5 h-5 stroke-[2.5]" />
                ) : isLocked ? (
                  <Lock className="w-4 h-4" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>

              {/* Step Label */}
              <div className="mt-2.5 text-center w-full">
                <span
                  className={`block text-xs font-bold transition-colors leading-tight ${
                    isCurrent
                      ? "text-navy-900 dark:text-white"
                      : isDone
                      ? "text-emerald-700 dark:text-emerald-400"
                      : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {step.title}
                </span>
                <span className="block text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                  {isDone ? "Selesai" : isCurrent ? "Aktif" : "Terkunci"}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

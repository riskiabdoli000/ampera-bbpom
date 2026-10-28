"use client";

import React from "react";
import { TrendingUp, LucideIcon } from "lucide-react";

interface CindoStatCardProps {
  title: string;
  value: string | number;
  subtext: string;
  icon: LucideIcon;
  iconBgColor: string;
  iconColor: string;
}

export function CindoStatCard({
  title,
  value,
  subtext,
  icon: Icon,
  iconBgColor,
  iconColor,
}: CindoStatCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconBgColor} ${iconColor}`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex items-center text-emerald-500">
          <TrendingUp className="h-4 w-4" />
        </div>
      </div>

      <div className="mt-4">
        <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {value}
        </div>
        <div className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
          {title}
        </div>
        <div className="text-[11px] sm:text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1.5 flex items-center gap-1">
          {subtext}
        </div>
      </div>
    </div>
  );
}

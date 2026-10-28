"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileQuestion,
  Users,
  BarChart3,
  CheckCircle2,
  BookOpen,
  Award,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { CindoStatCard } from "@/components/cindo/CindoStatCard";
import { CindoAttemptsChart } from "@/components/cindo/CindoAttemptsChart";
import { CindoRecentQuizzes } from "@/components/cindo/CindoRecentQuizzes";
import { getSesiCindo, getCurrentCindoUser } from "@/data/cindo/cindoStorage";
import { SesiCindo } from "@/data/cindo/cindoTypes";

export default function CindoDashboardPage() {
  const [sesi, setSesi] = useState<SesiCindo | null>(null);

  useEffect(() => {
    setSesi(getSesiCindo());
  }, []);

  const currentUser = getCurrentCindoUser();
  const pesertaNama = sesi?.peserta?.nama || currentUser?.username || "Peserta";

  return (
    <div className="space-y-6">
      {/* Top Welcome Bar matching Image 2 without the CTA button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-navy-900 dark:text-white">
            Welcome back, <span className="text-brand-orange">{pesertaNama}</span>! 👋
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Here&apos;s what&apos;s happening with your quizzes today.
          </p>
        </div>
      </div>

      {/* 4 Stat Cards Row matching Image 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <CindoStatCard
          title="Total Quizzes"
          value="5"
          subtext="+3 this week"
          icon={FileQuestion}
          iconBgColor="bg-orange-50 dark:bg-orange-950/60"
          iconColor="text-brand-orange dark:text-orange-400"
        />

        <CindoStatCard
          title="Total Attempts"
          value="546"
          subtext="+156 today"
          icon={Users}
          iconBgColor="bg-purple-50 dark:bg-purple-950/60"
          iconColor="text-purple-600 dark:text-purple-400"
        />

        <CindoStatCard
          title="Avg. Score"
          value="75.4%"
          subtext="+2.3% from last week"
          icon={BarChart3}
          iconBgColor="bg-amber-50 dark:bg-amber-950/60"
          iconColor="text-amber-600 dark:text-amber-400"
        />

        <CindoStatCard
          title="Completion Rate"
          value="92%"
          subtext="+5% improvement"
          icon={CheckCircle2}
          iconBgColor="bg-emerald-50 dark:bg-emerald-950/60"
          iconColor="text-emerald-600 dark:text-emerald-400"
        />
      </div>

      {/* Main 2-Column Section matching Image 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left (approx 60-65%): Quiz Attempts Wave Chart */}
        <div className="lg:col-span-7 xl:col-span-8">
          <CindoAttemptsChart />
        </div>

        {/* Right (approx 35-40%): Recent Quizzes List */}
        <div className="lg:col-span-5 xl:col-span-4">
          <CindoRecentQuizzes />
        </div>
      </div>
    </div>
  );
}

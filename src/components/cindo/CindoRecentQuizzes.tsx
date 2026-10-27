"use client";

import React from "react";
import Link from "next/link";
import { FileQuestion, ExternalLink, ArrowRight, CheckCircle2 } from "lucide-react";

interface QuizItem {
  id: string;
  title: string;
  status: "published" | "draft";
  questionsCount: number;
  attempts: number;
  href: string;
}

const RECENT_QUIZZES: QuizItem[] = [
  {
    id: "q-1",
    title: "Pre-Test & Post-Test Terpadu Cindo",
    status: "published",
    questionsCount: 10,
    attempts: 248,
    href: "/cindo/tes/identitas",
  },
  {
    id: "q-2",
    title: "Asesmen Keamanan Pangan & Cek KLIK",
    status: "published",
    questionsCount: 10,
    attempts: 156,
    href: "/cindo/materi",
  },
  {
    id: "q-3",
    title: "Identifikasi Formalin & Boraks pada Tahu/Mie",
    status: "published",
    questionsCount: 10,
    attempts: 89,
    href: "/cindo/materi",
  },
  {
    id: "q-4",
    title: "Regulasi Notifikasi Kosmetik & Bahaya Merkuri",
    status: "published",
    questionsCount: 10,
    attempts: 67,
    href: "/cindo/materi",
  },
  {
    id: "q-5",
    title: "Evaluasi Survei Pemahaman Masyarakat BBPOM",
    status: "draft",
    questionsCount: 5,
    attempts: 0,
    href: "/cindo/materi",
  },
];

export function CindoRecentQuizzes() {
  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            Recent Quizzes
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Your recently updated quizzes
          </p>
        </div>
        <Link
          href="/cindo/materi"
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400 transition-colors"
        >
          <span>View all</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="space-y-3.5">
        {RECENT_QUIZZES.map((quiz) => (
          <Link
            key={quiz.id}
            href={quiz.href}
            className="group flex items-center justify-between rounded-xl p-2.5 transition-all hover:bg-slate-50 dark:hover:bg-slate-800/60"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-950/70 dark:text-teal-400 group-hover:scale-105 transition-transform">
                <FileQuestion className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 truncate group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                  {quiz.title}
                </h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className={`inline-block rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                      quiz.status === "published"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                    }`}
                  >
                    {quiz.status}
                  </span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500">
                    {quiz.questionsCount} questions
                  </span>
                </div>
              </div>
            </div>

            <div className="shrink-0 pl-3 text-right">
              <div className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200">
                {quiz.attempts}
              </div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500">
                attempts
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

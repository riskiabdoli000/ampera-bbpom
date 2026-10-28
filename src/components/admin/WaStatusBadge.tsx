"use client";

import React, { useEffect, useState } from "react";
import { getWaConnectionStatus } from "@/app/actions/waStatus";
import { RefreshCw, MessageSquare } from "lucide-react";

export default function WaStatusBadge() {
  const [status, setStatus] = useState<"loading" | "connected" | "disconnected">("loading");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const checkStatus = async () => {
    setIsRefreshing(true);
    try {
      const res = await getWaConnectionStatus();
      setStatus(res.connected ? "connected" : "disconnected");
    } catch {
      setStatus("disconnected");
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  return (
    <div className="mt-2.5 inline-flex items-center">
      <div
        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border shadow-xs transition-all ${
          status === "loading"
            ? "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800/60 dark:text-slate-400 dark:border-slate-700"
            : status === "connected"
            ? "bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60"
            : "bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/60"
        }`}
      >
        <span className="relative flex h-2 w-2">
          {status === "connected" && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          )}
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${
              status === "loading"
                ? "bg-slate-400"
                : status === "connected"
                ? "bg-emerald-500"
                : "bg-rose-500"
            }`}
          ></span>
        </span>

        <span className="flex items-center gap-1.5 font-medium">
          <MessageSquare className="w-3.5 h-3.5" />
          {status === "loading"
            ? "Memeriksa status WA..."
            : status === "connected"
            ? "WhatsApp: Aktif"
            : "WhatsApp: Terputus"}
        </span>


        <button
          type="button"
          onClick={checkStatus}
          disabled={isRefreshing}
          title="Segarkan status WhatsApp"
          className="ml-1 p-0.5 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${isRefreshing ? "animate-spin" : ""}`} />
        </button>
      </div>
    </div>
  );
}

"use server";

import { verifyAdminSession } from "@/lib/auth/session";

export async function getWaConnectionStatus() {
  const session = await verifyAdminSession();
  if (!session) {
    return { connected: false };
  }
  const waUrl = process.env.WA_SERVER_URL || "http://127.0.0.1:3006";
  const waSecret = process.env.INTERNAL_WA_SECRET || "";

  try {
    const res = await fetch(`${waUrl}/status`, {
      method: "GET",
      headers: {
        "x-api-key": waSecret,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return { connected: false };
    }

    const data = await res.json();
    return { connected: Boolean(data.connected) };
  } catch {
    return { connected: false };
  }
}

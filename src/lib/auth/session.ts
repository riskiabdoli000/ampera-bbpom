import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secretKey =
  process.env.SESSION_SECRET || "default-secret-key-ampera-bbpom-palembang-2026-min-32-chars";
const encodedKey = new TextEncoder().encode(secretKey);

export interface AdminSessionPayload {
  id: number;
  username: string;
  nama: string;
  role: string;
  expiresAt: string;
}

const COOKIE_NAME = "ampera_admin_session";

export async function encrypt(payload: Omit<AdminSessionPayload, "expiresAt">) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 hari
  return new SignJWT({ ...payload, expiresAt: expiresAt.toISOString() })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey);
}

export async function decrypt(session: string | undefined = ""): Promise<AdminSessionPayload | null> {
  if (!session) return null;
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload as unknown as AdminSessionPayload;
  } catch {
    return null;
  }
}

export async function createSession(admin: {
  id: number;
  username: string;
  nama: string;
  role: string;
}) {
  const session = await encrypt(admin);
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    sameSite: "lax",
    path: "/",
  });
}

export async function getSession(): Promise<AdminSessionPayload | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get(COOKIE_NAME)?.value;
  return await decrypt(session);
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function verifyAdminSession(): Promise<AdminSessionPayload> {
  const session = await getSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

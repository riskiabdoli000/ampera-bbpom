import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secretKey =
  process.env.SESSION_SECRET ||
  "default-secret-key-ampera-bbpom-palembang-2026-min-32-chars";
const encodedKey = new TextEncoder().encode(secretKey);

async function isValidAdminToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, encodedKey, {
      algorithms: ["HS256"],
    });
    return Boolean(payload && (payload.id || payload.username));
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get("ampera_admin_session")?.value;

  // Hanya periksa rute dalam /admin
  if (pathname.startsWith("/admin")) {
    const isLoginPage = pathname === "/admin/login";
    const isAuthenticated = await isValidAdminToken(sessionCookie);

    // Jika belum login (atau token kadaluarsa/palsu) dan mengakses halaman admin selain login, redirect ke /admin/login
    if (!isAuthenticated && !isLoginPage) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      const response = NextResponse.redirect(loginUrl);
      if (sessionCookie) {
        response.cookies.delete("ampera_admin_session");
      }
      return response;
    }

    // Jika sudah terautentikasi valid dan mengakses /admin/login, redirect ke /admin
    if (isAuthenticated && isLoginPage) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};

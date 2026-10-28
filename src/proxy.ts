import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get("ampera_admin_session")?.value;

  // Hanya periksa rute dalam /admin
  if (pathname.startsWith("/admin")) {
    const isLoginPage = pathname === "/admin/login";

    // Jika belum login dan mengakses halaman admin selain login, redirect ke /admin/login
    if (!sessionCookie && !isLoginPage) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Jika sudah login dan mengakses /admin/login, redirect ke /admin
    if (sessionCookie && isLoginPage) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};

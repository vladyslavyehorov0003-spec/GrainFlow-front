import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PREFIX = "/app";
const PUBLIC_AUTH_PATHS = ["/login", "/register"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  const isProtected = pathname.startsWith(PROTECTED_PREFIX);
  const isAuthPage = PUBLIC_AUTH_PATHS.some((p) => pathname.startsWith(p));

  // No token → redirect to login for protected routes
  if (isProtected && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Has token → redirect away from auth pages to app
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL("/app", request.url));
  }

  // Forward pathname to server components via header
  const response = NextResponse.next();
  response.headers.set("x-pathname", pathname);
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};

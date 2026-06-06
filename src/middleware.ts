import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME } from "@/lib/auth-cookie";
import { verifyTokenEdge } from "@/lib/edge-jwt";

const protectedRoutes = ["/dashboard", "/tasks", "/routine", "/habits", "/goals", "/timer", "/activity", "/analytics", "/ai-insights", "/profile"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));
  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/register");
  const user = await verifyTokenEdge(request.cookies.get(COOKIE_NAME)?.value);

  if (isProtected && !user && process.env.NODE_ENV === "production") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js).*)"],
};

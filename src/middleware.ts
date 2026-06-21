import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

const roleHome: Record<string, string> = {
  student: "/student/dashboard",
  teacher: "/teacher/dashboard",
  admin: "/admin/dashboard",
};

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  const isProtected =
    pathname.startsWith("/student") || pathname.startsWith("/teacher") || pathname.startsWith("/admin");

  if (!isProtected) return NextResponse.next();

  if (!session?.user) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = session.user.role;
  const ownsRoute = pathname.startsWith(`/${role}`);

  if (!ownsRoute) {
    return NextResponse.redirect(new URL(roleHome[role] ?? "/", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/student/:path*", "/teacher/:path*", "/admin/:path*"],
};

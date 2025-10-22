import { type NextRequest, NextResponse } from "next/server";

/**
 * Middleware untuk route protection dan redirect
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes yang tidak memerlukan auth
  const publicRoutes = [
    "/",
    "/login",
    "/register",
    "/forgot-password",
    "/api/auth",
  ];

  // Check if route is public
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Get auth token dari cookies
  const token = request.cookies.get("auth-token")?.value;

  // If protected route and no token, redirect to login
  if (!isPublicRoute && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If logged in and trying to access auth pages, redirect to dashboard
  if (token && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};

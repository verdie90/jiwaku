import { NextResponse } from "next/server";

/**
 * Middleware untuk route protection dan redirect
 * Note: Since auth tokens are stored in localStorage (client-side only),
 * we cannot check them in middleware (server-side). 
 * Route protection is handled by client-side layout components.
 */
export async function middleware() {
  // Auth token is stored in localStorage (client-side only)
  // Cannot access it in middleware (server-side)
  // Client-side route protection is handled in layout.client.tsx components
  
  // Just let all requests pass through
  // Client components will handle auth redirects based on user state
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

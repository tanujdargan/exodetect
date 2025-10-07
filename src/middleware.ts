import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check for the __session cookie set by Auth0
  const sessionCookie = request.cookies.get('__session');

  // Allow requests to pass through if they have the session cookie
  if (sessionCookie) {
    return NextResponse.next();
  }

  // Redirect unauthenticated users to landing page
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/landing', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
  ],
};

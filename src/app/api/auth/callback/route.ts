import { Auth0Client } from '@auth0/nextjs-auth0/server';
import { NextRequest, NextResponse } from 'next/server';

const auth0 = new Auth0Client({
  routes: {
    callback: '/api/auth/callback',
    login: '/api/auth/login',
    logout: '/api/auth/logout',
  },
  signInReturnToPath: '/dashboard',
});

export async function GET(req: NextRequest) {
  const response = await auth0.middleware(req);

  // If it's a redirect, change location to dashboard but keep all cookies
  if (response.status === 302 || response.status === 307) {
    // Create new redirect to dashboard while preserving all headers including cookies
    const redirectResponse = NextResponse.redirect(new URL('/dashboard', req.url));

    // Copy all headers from original response (including set-cookie headers)
    response.headers.forEach((value, key) => {
      if (key !== 'location') {
        redirectResponse.headers.set(key, value);
      }
    });

    // Ensure set-cookie headers are properly copied
    const setCookieHeaders = response.headers.getSetCookie();
    setCookieHeaders.forEach(cookie => {
      redirectResponse.headers.append('set-cookie', cookie);
    });

    return redirectResponse;
  }

  return response;
}

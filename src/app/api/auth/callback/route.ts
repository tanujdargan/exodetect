import { Auth0Client } from '@auth0/nextjs-auth0/server';
import { NextRequest, NextResponse } from 'next/server';

const auth0 = new Auth0Client();

export async function GET(req: NextRequest) {
  try {
    // Handle the OAuth callback
    const response = await auth0.middleware(req);

    // After successful authentication, redirect to dashboard
    if (response.status === 302 || response.status === 307) {
      return response;
    }

    // If we get here, redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard', req.url));
  } catch (error) {
    console.error('Auth callback error:', error);
    return NextResponse.redirect(new URL('/landing?error=auth_failed', req.url));
  }
}

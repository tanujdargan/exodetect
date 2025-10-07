import { Auth0Client } from '@auth0/nextjs-auth0/server';
import { NextRequest } from 'next/server';

const auth0 = new Auth0Client({
  routes: {
    callback: '/api/auth/callback',
    login: '/api/auth/login',
    logout: '/api/auth/logout',
  },
  signInReturnToPath: '/dashboard',
});

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const connection = searchParams.get('connection');

  const options: { authorizationParameters?: { connection?: string; screen_hint?: string } } = {};
  if (connection) {
    options.authorizationParameters = { connection };
  }

  return auth0.startInteractiveLogin(options);
}

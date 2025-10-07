import { Auth0Client } from '@auth0/nextjs-auth0/server';

const auth0 = new Auth0Client({
  routes: {
    callback: '/api/auth/callback',
    login: '/api/auth/login',
    logout: '/api/auth/logout',
  },
  signInReturnToPath: '/dashboard',
});

export async function GET() {
  return auth0.startInteractiveLogin({
    authorizationParameters: {
      screen_hint: 'signup'
    }
  });
}

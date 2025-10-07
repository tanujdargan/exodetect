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
  try {
    const session = await auth0.getSession();

    if (!session) {
      return Response.json({ error: 'Not authenticated' }, { status: 401 });
    }

    return Response.json(session.user);
  } catch (error) {
    console.error('Error getting session:', error);
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

import { Auth0Client } from '@auth0/nextjs-auth0/server';
import { NextRequest } from 'next/server';

const auth0 = new Auth0Client();

export async function GET(req: NextRequest) {
  try {
    return await auth0.middleware(req);
  } catch (error) {
    console.error('Auth0 GET error:', error);
    return new Response(JSON.stringify({ error: 'Authentication error', details: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    return await auth0.middleware(req);
  } catch (error) {
    console.error('Auth0 POST error:', error);
    return new Response(JSON.stringify({ error: 'Authentication error', details: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

'use client';

import { Auth0Provider } from '@auth0/nextjs-auth0';

export function UserProvider({ children }: { children: React.ReactNode }) {
  return <Auth0Provider>{children}</Auth0Provider>;
}

import { Outlet } from '@remix-run/react';
import type { LoaderFunction } from '@remix-run/server-runtime';

import { AppContainer } from '../components/main/AppContainer';
import { authenticator } from '../models/auth.server';
import { getUrl } from '../utils/routes';

export const loader: LoaderFunction = async ({ request }) => {
  await authenticator.isAuthenticated(request, {
    failureRedirect: getUrl('/login'),
  });
  return null;
};

export default function AppPage() {
  return (
    <AppContainer>
      <Outlet />
    </AppContainer>
  );
}

import { Outlet } from '@remix-run/react';
import type { LoaderFunction } from '@remix-run/server-runtime';

import { AppContainer } from '../components/main/AppContainer';
import { requireUserId } from '../session.server';
import { internalRedirect } from '../utils/routes';

export const loader: LoaderFunction = async ({ request }) => {
  // require auth
  await requireUserId(request);
  return internalRedirect('/actions');
};

export default function AppPage() {
  return (
    <AppContainer>
      <Outlet />
    </AppContainer>
  );
}

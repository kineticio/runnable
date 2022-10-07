import { Outlet } from '@remix-run/react';
import type { LoaderFunction, MetaFunction } from '@remix-run/server-runtime';
import { json } from '@remix-run/server-runtime';

import { AppContainer } from '../components/main/AppContainer';
import { requireUserId } from '../session.server';

type LoaderData = {
  userId: string;
};

export const meta: MetaFunction = () => {
  return {
    title: 'Actions',
  };
};

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  return json<LoaderData>({ userId });
};

export default function AppPage() {
  return (
    <AppContainer>
      <Outlet />
    </AppContainer>
  );
}

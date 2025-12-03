import { Outlet } from 'react-router';
import type {
  AppLoadContext,
  LoaderFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from 'react-router';

import { AppContainer } from '../components/main/AppContainer';
import { isAuthenticated } from '../models/auth.server';
import { getUrl } from '../utils/routes';

export const meta: MetaFunction = () => {
  return [
    {
      title: 'Runnable',
    },
  ];
};

export const loader: LoaderFunction = async ({ request }: LoaderFunctionArgs<AppLoadContext>) => {
  await isAuthenticated(request, {
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

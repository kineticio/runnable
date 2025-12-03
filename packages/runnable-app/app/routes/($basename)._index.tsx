import { AppLoadContext, LoaderFunctionArgs, Outlet } from 'react-router';

import { AppContainer } from '../components/main/AppContainer';
import { isAuthenticated } from '../models/auth.server';
import { getUrl } from '../utils/routes';

export const loader = async ({ request }: LoaderFunctionArgs<AppLoadContext>) => {
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

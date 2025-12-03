import { ActionFunctionArgs } from 'react-router';
import { logout } from '../models/auth.server';

import { internalRedirect } from '../utils/internalRedirect';
import { getUrl } from '../utils/routes';

export const action = async ({ request }: ActionFunctionArgs) => {
  return await logout(request, { redirectTo: getUrl('/login') });
};

export const loader = async () => {
  return internalRedirect('/');
};

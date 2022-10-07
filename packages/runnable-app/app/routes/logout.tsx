import type { ActionFunction, LoaderFunction } from '@remix-run/node';

import { internalRedirect } from '../utils/routes';
import { logout } from '~/session.server';

export const action: ActionFunction = async ({ request }) => {
  return logout(request);
};

export const loader: LoaderFunction = async () => {
  return internalRedirect('/');
};

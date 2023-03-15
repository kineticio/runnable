import type { ActionArgs, LoaderFunction } from '@remix-run/node';
import { authenticator } from '../models/auth.server';

import { internalRedirect } from '../utils/internalRedirect';
import { getUrl } from '../utils/routes';

export async function action({ request }: ActionArgs) {
  await authenticator.logout(request, { redirectTo: getUrl('/login') });
}

export const loader: LoaderFunction = async () => {
  return internalRedirect('/');
};

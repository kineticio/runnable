import { LoaderArgs } from '@remix-run/server-runtime';
import { authenticator } from '../models/auth.server';
import { getUrl } from '../utils/routes';

export const loader = async ({ request }: LoaderArgs) => {
  return authenticator.authenticate('google', request, {
    successRedirect: getUrl('/actions'),
    failureRedirect: getUrl('/login'),
  });
};

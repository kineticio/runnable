import { User } from '../api/context';
import { getUrl } from '../utils/routes';
import { authenticator } from './auth.server';

export async function getUser(request: Request): Promise<User | null> {
  return await authenticator.isAuthenticated(request);
}

export async function getRequiredUser(request: Request): Promise<User> {
  return await authenticator.isAuthenticated(request, {
    failureRedirect: getUrl('/login'),
  });
}

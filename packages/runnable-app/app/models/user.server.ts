import { User } from '@runnablejs/api';
import { getUrl } from '../utils/routes';
import { isAuthenticated } from './auth.server';

export async function getUser(request: Request): Promise<User | null> {
  return await isAuthenticated(request);
}

export async function getRequiredUser(request: Request): Promise<User> {
  const user = await isAuthenticated(request, {
    failureRedirect: getUrl('/login'),
  });
  // TypeScript knows user is not null here because failureRedirect will throw
  return user!;
}

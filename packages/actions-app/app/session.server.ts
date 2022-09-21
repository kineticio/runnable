import { createCookieSessionStorage } from '@remix-run/node';
import type { ActionsAppContext } from './api/context';
import { internalRedirect } from './utils/routes';

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: '__session',
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secrets: process.env.SESSION_SECRET ? [process.env.SESSION_SECRET] : [],
    secure: process.env.NODE_ENV === 'production',
  },
});

const USER_SESSION_KEY = 'userId';

export async function getSession(request: Request) {
  const cookie = request.headers.get('Cookie');
  return sessionStorage.getSession(cookie);
}

export async function getUserId(request: Request): Promise<string | undefined> {
  const session = await getSession(request);
  const userId = session.get(USER_SESSION_KEY);
  return userId;
}

export async function getUser(request: Request, authContext: ActionsAppContext) {
  const userId = await getUserId(request);
  if (userId === undefined) return null;

  const user = await authContext.auth.getUserById({ id: userId });
  if (user) return user;

  throw await logout(request);
}

export async function requireUserId(request: Request, redirectTo: string = new URL(request.url).pathname) {
  const userId = await getUserId(request);
  if (!userId) {
    const searchParams = new URLSearchParams([['redirectTo', redirectTo]]);
    throw internalRedirect(`/login?${searchParams}`);
  }
  return userId;
}

export async function requireUser(request: Request, authContext: ActionsAppContext) {
  const userId = await requireUserId(request);

  const user = await authContext.auth.getUserById({ id: userId });
  if (user) return user;

  throw await logout(request);
}

export async function createUserSession({
  request,
  userId,
  remember,
  redirectTo,
}: {
  request: Request;
  userId: string;
  remember: boolean;
  redirectTo: string;
}) {
  const session = await getSession(request);
  session.set(USER_SESSION_KEY, userId);
  return internalRedirect(redirectTo as any, {
    headers: {
      'Set-Cookie': await sessionStorage.commitSession(session, {
        maxAge: remember
          ? 60 * 60 * 24 * 7 // 7 days
          : undefined,
      }),
    },
  });
}

export async function logout(request: Request) {
  const session = await getSession(request);
  return internalRedirect('/', {
    headers: {
      'Set-Cookie': await sessionStorage.destroySession(session),
    },
  });
}

import { createCookieSessionStorage, Session } from '@remix-run/node';
import { internalRedirect } from '../utils/internalRedirect';

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: '__session',
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secrets: [process.env.RUNNABLE_SECRET, process.env.SESSION_SECRET].filter<string>((v): v is string => !!v),
    secure: process.env.NODE_ENV === 'production',
  },
});

const USER_SESSION_KEY = 'userId';

export async function getSession(request: Request): Promise<Session> {
  const cookie = request.headers.get('Cookie');
  return sessionStorage.getSession(cookie);
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

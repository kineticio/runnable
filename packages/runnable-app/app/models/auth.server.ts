import { FormStrategy } from 'remix-auth-form';
import { Authenticator } from 'remix-auth';
import { User } from '@runnablejs/api';
import { redirect } from 'react-router';
import { sessionStorage } from './session.server';
import { env } from './env';

import { getUrl } from '../utils/routes';
import { GoogleStrategy } from '../auth/google';
import { getRunnableContext } from '../api/context';

export const authenticator = new Authenticator<User>();

/**
 * Check if the user is authenticated by reading from session storage.
 * Handles success and failure redirects similar to the old authenticator.isAuthenticated API.
 */
export async function isAuthenticated(
  request: Request,
  options?: {
    successRedirect?: string;
    failureRedirect?: string;
  },
): Promise<User | null> {
  const session = await sessionStorage.getSession(request.headers.get('cookie'));
  const user = session.get('user') as User | undefined;

  if (user) {
    // User is authenticated
    if (options?.successRedirect) {
      throw redirect(options.successRedirect);
    }
    return user;
  } else {
    // User is not authenticated
    if (options?.failureRedirect) {
      throw redirect(options.failureRedirect);
    }
    return null;
  }
}

/**
 * Logout the user by destroying their session.
 */
export async function logout(
  request: Request,
  options?: {
    redirectTo?: string;
  },
): Promise<Response> {
  const session = await sessionStorage.getSession(request.headers.get('cookie'));
  return redirect(options?.redirectTo || '/', {
    headers: {
      'Set-Cookie': await sessionStorage.destroySession(session),
    },
  });
}

const strategies: string[] = [];

if (env.RUNNABLE_AUTH_PROVIDER_FORM) {
  console.log('Configuring form authentication strategy');
  authenticator.use(
    new FormStrategy(async ({ form }) => {
      const email = form.get('email');
      const password = form.get('password');
      const context = getRunnableContext();

      if (!context?.auth.form) {
        throw new Error('Form authentication is not configured');
      }

      return context.auth.form
        .verifyLogin({
          email: typeof email === 'string' ? email : '',
          password: typeof password === 'string' ? password : '',
        })
        .then((user) => {
          if (!user) {
            throw new Error('Invalid credentials');
          }
          return user;
        })
        .catch((error) => {
          console.error('Form authentication error:', error);
          throw new Error('Authentication failed');
        });
    }),
    'form',
  );
  strategies.push('form');
}

// Fake form strategy for development
if (!env.RUNNABLE_AUTH_PROVIDER_FORM && process.env.NODE_ENV === 'development') {
  console.warn('Using fake form authentication strategy for development');
  authenticator.use(
    new FormStrategy(async ({ form }) => {
      const email = form.get('email');
      if (typeof email !== 'string') throw new Error('Invalid email');
      return {
        id: email,
        name: email,
        email: email,
      };
    }),
    'form',
  );
  strategies.push('form');
}

if (
  env.RUNNABLE_AUTH_PROVIDER_GOOGLE_CLIENT_ID &&
  env.RUNNABLE_AUTH_PROVIDER_GOOGLE_CLIENT_SECRET
) {
  authenticator.use(
    new GoogleStrategy(
      {
        clientID: env.RUNNABLE_AUTH_PROVIDER_GOOGLE_CLIENT_ID,
        clientSecret: env.RUNNABLE_AUTH_PROVIDER_GOOGLE_CLIENT_SECRET,
        callbackURL:
          process.env.NODE_ENV === 'development'
            ? `http://localhost:3000${getUrl('/auth/callback/google')}`
            : `${env.RUNNABLE_AUTH_PROVIDER_GOOGLE_HOSTNAME}/auth/callback/google`,
        hd: env.RUNNABLE_AUTH_PROVIDER_GOOGLE_HD,
      },
      async ({ profile }) => {
        return {
          id: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
        };
      },
    ),
    'google',
  );
  strategies.push('google');
}

export { strategies };

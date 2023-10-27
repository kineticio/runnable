import { FormStrategy } from 'remix-auth-form';
import { Authenticator } from 'remix-auth';
import { GoogleStrategy } from 'remix-auth-google';
import { User } from '@runnablejs/api';
import { getUrl } from '../utils/routes';
import { sessionStorage } from './session.server';
import { env } from './env';

export const authenticator = new Authenticator<User>(sessionStorage);

const strategies: string[] = [];

if (env.RUNNABLE_AUTH_PROVIDER_FORM) {
  authenticator.use(
    new FormStrategy(async ({ form, context }) => {
      const email = form.get('email');
      const password = form.get('password');
      if (context?.auth?.form === undefined) throw new Error('Cannot login using email and password');
      if (typeof email !== 'string' || typeof password !== 'string') throw new Error('Invalid email or password');
      const user = await context.auth.form.verifyLogin({ email, password });
      return user;
    }),
    'form'
  );
  strategies.push('form');
}

// Fake form strategy for development
if (!env.RUNNABLE_AUTH_PROVIDER_FORM && process.env.NODE_ENV === 'development') {
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
    'form'
  );
  strategies.push('form');
}

if (env.RUNNABLE_AUTH_PROVIDER_GOOGLE_CLIENT_ID && env.RUNNABLE_AUTH_PROVIDER_GOOGLE_CLIENT_SECRET) {
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
      }
    ),
    'google'
  );
  strategies.push('google');
}

export { strategies };

import type { AppLoadContext } from '@remix-run/server-runtime';
import { DEFAULT_ACTIONS } from './default-actions.server';

export const DEFAULT_CONTEXT: AppLoadContext = {
  actions: DEFAULT_ACTIONS,
  auth: {
    verifyLogin: async ({ email, password }) => {
      if (password === 'secret') {
        return {
          id: '123',
          email: 'test@test.com',
        };
      }

      throw new Error("Invalid credentials. Try 'secret' as the password");
    },
    getUserById: async ({ id }) => {
      return {
        id: '123',
        email: 'test@test.com',
      };
    },
  },
};

export function defaultContext(context: AppLoadContext) {
  if (Object.values(context).length === 0) {
    return DEFAULT_CONTEXT;
  }
  return context;
}

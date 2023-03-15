import { components } from '@runnablejs/api';

export interface RunnableAppContext {
  logger?: typeof console;
  /**
   * Authentication
   */
  auth: {
    form?: {
      verifyLogin: (payload: { email: string; password: string }) => Promise<User>;
      getUserById: (payload: { id: string }) => Promise<User>;
    };
  };
}

export interface RunnableContext {
  logger: typeof console;
  user: User;
}

export type User = components['schemas']['User'];

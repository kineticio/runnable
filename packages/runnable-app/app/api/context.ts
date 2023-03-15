import { components, Logger } from '@runnablejs/api';

export interface RunnableAppContext {
  logger?: Logger;
  /**
   * Authentication
   */
  auth: {
    form?: {
      verifyLogin: (payload: { email: string; password: string }) => Promise<User>;
    };
  };
}

export interface RunnableContext {
  logger: Logger;
  user: User;
}

export type User = components['schemas']['User'];

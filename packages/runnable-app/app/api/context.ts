import type { Logger, User } from '@runnablejs/api';
import { AsyncLocalStorage } from 'async_hooks';

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

declare global {
  var __runnableContext: RunnableAppContext | undefined;
}

const asyncLocalStorage = new AsyncLocalStorage<RunnableAppContext>();

/**
 * Set the Runnable context for the current request.
 */
export function setRunnableContext(context: RunnableAppContext): void {
  globalThis.__runnableContext = context;
  asyncLocalStorage.enterWith(context);
}

/**
 * Get the Runnable context for the current request.
 * Returns undefined if not set.
 */
export function getRunnableContext(): RunnableAppContext | undefined {
  return asyncLocalStorage.getStore() || globalThis.__runnableContext;
}

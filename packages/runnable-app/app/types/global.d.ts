import type { RunnableAppContext, LoadContext } from '../api/context';
import type { IRunnableClient } from '@runnablejs/api';

declare module '@remix-run/server-runtime' {
  interface AppLoadContext extends RunnableAppContext {
    client: IRunnableClient;
  }
}

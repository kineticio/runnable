import type { IRunnableClient } from '@runnablejs/api';
import type { LoadContext, RunnableAppContext } from '../api/context';

declare module 'react-router' {
  interface AppLoadContext extends RunnableAppContext {
    client: IRunnableClient;
  }
}

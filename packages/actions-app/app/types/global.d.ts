import type { ActionsAppContext, LoadContext } from '../api/context';
import { Actions } from '../types';

declare module '@remix-run/server-runtime' {
  interface AppLoadContext extends ActionsAppContext {
    actions: Actions;
  }
}

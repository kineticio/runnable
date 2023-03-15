import { Logger } from '@runnablejs/api';

export interface RunnableAppContext {
  /**
   * Websocket
   * @example ws://localhost:8080
   */
  wsUrl: string;

  logger?: Logger;
}

export interface RunnableContext {
  logger: Logger;
  user: User;
}

export interface User {
  id: string;
  name?: string;
  email: string;
}

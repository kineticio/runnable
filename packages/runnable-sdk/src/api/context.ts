export interface RunnableAppContext {
  /**
   * Websocket
   * @example ws://localhost:8080
   */
  wsUrl: string;

  logger?: typeof console;
}

export interface RunnableContext {
  logger: typeof console;
  user: User;
}

export interface User {
  id: string;
  name?: string;
  email: string;
}

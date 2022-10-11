export interface RunnableAppContext {
  /**
   * Authentication
   */
  auth: {
    verifyLogin: (payload: { email: string; password: string }) => Promise<User>;
    getUserById: (payload: { id: string }) => Promise<User>;
  };
}

export interface RunnableContext {
  user: User;
}

export interface User {
  id: string;
  name?: string;
  email: string;
}

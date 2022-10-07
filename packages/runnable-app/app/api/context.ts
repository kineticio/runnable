import { User } from '../models/user';

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

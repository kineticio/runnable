export interface ActionsAppContext {
  auth: {
    verifyLogin: (payload: { email: string; password: string }) => Promise<{
      id: string;
      email: string;
    }>;
    getUserById: (payload: { id: string }) => Promise<{
      id: string;
      email: string;
    }>;
  };
}

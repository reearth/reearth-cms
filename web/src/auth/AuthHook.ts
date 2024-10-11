type AuthHook = {
  user: unknown; // TODO: Replace 'unknown' with your user type
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  getAccessToken: () => Promise<string>;
  login: () => void;
  logout: () => void;
};

export default AuthHook;

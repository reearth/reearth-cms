type AuthHook = {
  error: null | string;
  getAccessToken: () => Promise<string>;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
  user: unknown; // TODO: Replace 'unknown' with your user type
};

export default AuthHook;

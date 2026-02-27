import { useAuth0 } from "@auth0/auth0-react";

import { logOutFromTenant } from "@reearth-cms/config";

import AuthHook from "./AuthHook";

export const errorKey = "reeartherror";

export const useAuth0Auth = (): AuthHook => {
  const {
    error,
    getAccessTokenSilently,
    isAuthenticated,
    isLoading,
    loginWithRedirect,
    logout,
    user,
  } = useAuth0();

  return {
    error: error?.message ?? null,
    getAccessToken: () => getAccessTokenSilently(),
    isAuthenticated: !!window.REEARTH_E2E_ACCESS_TOKEN || (isAuthenticated && !error),
    isLoading,
    login: () => {
      logOutFromTenant();
      return loginWithRedirect();
    },
    logout: () => {
      logOutFromTenant();
      return logout({
        logoutParams: {
          returnTo: error
            ? `${window.location.origin}?${errorKey}=${encodeURIComponent(error?.message)}`
            : window.location.origin,
        },
      });
    },
    user,
  };
};

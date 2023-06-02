import { Auth0Provider } from "@auth0/auth0-react";
import React, { createContext, ReactNode } from "react";

import { useAuth0Auth } from "./Auth0Auth";
import AuthHook from "./AuthHook";
import { useCognitoAuth } from "./CognitoAuth";

export const AuthContext = createContext<AuthHook | null>(null);

const Auth0Wrapper = ({ children }: { children: ReactNode }) => {
  const auth = useAuth0Auth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

const CognitoWrapper = ({ children }: { children: ReactNode }) => {
  const auth = useCognitoAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const authProvider = window.REEARTH_CONFIG?.authProvider;

  if (authProvider === "auth0") {
    const domain = window.REEARTH_CONFIG?.auth0Domain;
    const clientId = window.REEARTH_CONFIG?.auth0ClientId;
    const audience = window.REEARTH_CONFIG?.auth0Audience;

    return domain && clientId ? (
      <Auth0Provider
        domain={domain}
        clientId={clientId}
        audience={audience}
        useRefreshTokens
        scope="openid profile email"
        cacheLocation="localstorage"
        redirectUri={window.location.origin}>
        <Auth0Wrapper>{children}</Auth0Wrapper>
      </Auth0Provider>
    ) : null;
  }

  if (authProvider === "cognito") {
    // No specific provider needed for Cognito/AWS Amplify
    return <CognitoWrapper>{children}</CognitoWrapper>;
  }

  return <>{children}</>; // or some default fallback
};

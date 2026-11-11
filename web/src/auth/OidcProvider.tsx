import { UserManager } from "oidc-client-ts";
import type { UserManagerSettings } from "oidc-client-ts";
import { useCallback, useEffect, useMemo, useRef } from "react";
import type { PropsWithChildren } from "react";
import { AuthProvider as OidcAuthProvider, useAuth as useOidcAuth } from "react-oidc-context";
import type { AuthContextProps } from "react-oidc-context";

import { getSignInCallbackUrl, logOutFromTenant } from "@reearth-cms/config";
import type { AuthInfo } from "@reearth-cms/config/authInfo";

import { AuthContext } from "./AuthProvider";

export const DEFAULT_OIDC_SCOPE = "openid profile email offline_access";

export type OidcTokenType = "id_token" | "access_token";

export function oidcTokenType(authInfo: AuthInfo): OidcTokenType {
  return authInfo.oidcTokenType === "access_token" ? "access_token" : "id_token";
}

export function oidcSettings(authInfo: AuthInfo, redirectUri: string): UserManagerSettings {
  if (!authInfo.oidcAuthority || !authInfo.oidcClientId) {
    throw new Error("OIDC requires REEARTH_CMS_OIDC_AUTHORITY and REEARTH_CMS_OIDC_CLIENT_ID.");
  }
  return {
    authority: authInfo.oidcAuthority,
    client_id: authInfo.oidcClientId,
    redirect_uri: redirectUri,
    post_logout_redirect_uri: redirectUri,
    response_type: "code",
    scope: authInfo.oidcScope || DEFAULT_OIDC_SCOPE,
    // Some providers (e.g. Auth0, Okta custom servers) need an audience to issue a JWT access token.
    extraQueryParams: authInfo.oidcAudience ? { audience: authInfo.oidcAudience } : undefined,
    automaticSilentRenew: true,
    // Standard profile claims are read from the ID token; no userinfo request is needed.
    loadUserInfo: false,
  };
}

export function cleanOidcCallback() {
  const url = new URL(window.location.href);
  for (const key of [
    "code",
    "state",
    "session_state",
    "iss",
    "error",
    "error_description",
    "error_uri",
  ]) {
    url.searchParams.delete(key);
  }
  window.history.replaceState(null, document.title, `${url.pathname}${url.search}${url.hash}`);
}

function isSettled(auth: AuthContextProps) {
  return !auth.isLoading && !auth.activeNavigator;
}

export function OidcAuthBridge({
  tokenType = "id_token",
  getEndSessionEndpoint,
  children,
}: PropsWithChildren<{
  tokenType?: OidcTokenType;
  /** Resolves the provider's end_session_endpoint from discovery, if it advertises one. */
  getEndSessionEndpoint?: () => Promise<string | undefined>;
}>) {
  const auth = useOidcAuth();
  const settled = isSettled(auth);

  // API calls can start while the sign-in callback is still being processed. Keep the
  // latest auth state in a ref and let getAccessToken wait until it settles instead of
  // failing with the (still empty) user captured at render time.
  const authRef = useRef(auth);
  const waitersRef = useRef<(() => void)[]>([]);
  useEffect(() => {
    authRef.current = auth;
    if (settled) waitersRef.current.splice(0).forEach(resolve => resolve());
  }, [auth, settled]);

  const getAccessToken = useCallback(async () => {
    if (!isSettled(authRef.current)) {
      await new Promise<void>(resolve => waitersRef.current.push(resolve));
    }
    let user = authRef.current.user;
    if (user?.expired) user = (await authRef.current.signinSilent()) ?? undefined;
    // The CMS server verifies this JWT against the configured issuer/audience/JWKS.
    const token = user?.[tokenType];
    if (!token || user?.expired) throw new Error("OIDC login required.");
    return token;
  }, [tokenType]);

  const value = useMemo(
    () => ({
      user: auth.user?.profile,
      isAuthenticated: auth.isAuthenticated,
      isLoading: !settled,
      error: null,
      getAccessToken,
      login: () => {
        void auth.signinRedirect().catch(() => undefined);
      },
      // Sign out at the provider only when it advertises an end-session endpoint.
      // Some providers (e.g. Dex) have none; calling signoutRedirect there would
      // surface "No end session endpoint" as an auth error, so just clear the local
      // session and let the app start a fresh login.
      logout: () => {
        logOutFromTenant();
        void (async () => {
          const endSession = await getEndSessionEndpoint?.().catch(() => undefined);
          if (endSession) await auth.signoutRedirect();
          else await auth.removeUser();
        })().catch(() => undefined);
      },
    }),
    [auth, settled, getAccessToken, getEndSessionEndpoint],
  );

  if (auth.error) {
    return (
      <div role="alert">
        <p>Login failed: {auth.error.message}</p>
        <button onClick={() => window.location.assign(getSignInCallbackUrl())}>Try again</button>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default function OidcProvider({
  authInfo,
  children,
}: PropsWithChildren<{ authInfo: AuthInfo }>) {
  const result = useMemo(() => {
    try {
      return { userManager: new UserManager(oidcSettings(authInfo, getSignInCallbackUrl())) };
    } catch (error) {
      return { error: error instanceof Error ? error.message : String(error) };
    }
  }, [authInfo]);
  const { userManager } = result;
  const getEndSessionEndpoint = useCallback(
    async () => userManager?.metadataService.getEndSessionEndpoint(),
    [userManager],
  );

  if (!userManager) return <div role="alert">{result.error}</div>;
  return (
    <OidcAuthProvider userManager={userManager} onSigninCallback={cleanOidcCallback}>
      <OidcAuthBridge
        tokenType={oidcTokenType(authInfo)}
        getEndSessionEndpoint={getEndSessionEndpoint}>
        {children}
      </OidcAuthBridge>
    </OidcAuthProvider>
  );
}

import { UserManager } from "oidc-client-ts";
import type { User, UserManagerSettings } from "oidc-client-ts";
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
    // Started by OidcProvider once its UserManager is mounted, so a manager that React
    // discards (e.g. StrictMode double render) never renews the session in parallel.
    automaticSilentRenew: false,
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

// Treat tokens this close to expiry as expired, so they don't lapse in flight.
const EXPIRY_SKEW_SECONDS = 30;

function jwtExpiry(token: string): number | undefined {
  try {
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const { exp } = JSON.parse(atob(payload)) as { exp?: unknown };
    return typeof exp === "number" ? exp : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Returns the bearer token selected by tokenType, or undefined when it is missing or
 * expired. `user.expired` only reflects the access token, so the ID token's own `exp`
 * claim is checked; it can expire first and is retained when a refresh omits it.
 */
export function validToken(
  user: User | null | undefined,
  tokenType: OidcTokenType,
): string | undefined {
  const token = user?.[tokenType];
  if (!token) return undefined;
  const expiresAt = tokenType === "id_token" ? jwtExpiry(token) : user.expires_at;
  if (expiresAt !== undefined && expiresAt - EXPIRY_SKEW_SECONDS <= Date.now() / 1000) {
    return undefined;
  }
  return token;
}

/** Background or on-demand renewal failures are handled by getAccessToken, not shown as fatal. */
function isRenewalError(error: AuthContextProps["error"]) {
  return error?.source === "renewSilent" || error?.source === "signinSilent";
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

  // Concurrent callers share one renewal: with refresh-token rotation, a second
  // parallel exchange of the same refresh token would fail.
  const renewalRef = useRef<Promise<User | null> | null>(null);

  const getAccessToken = useCallback(async () => {
    if (!isSettled(authRef.current)) {
      await new Promise<void>(resolve => waitersRef.current.push(resolve));
    }
    // The CMS server verifies this JWT against the configured issuer/audience/JWKS.
    const current = validToken(authRef.current.user, tokenType);
    if (current) return current;
    if (!authRef.current.user) throw new Error("OIDC login required.");

    renewalRef.current ??= authRef.current.signinSilent().finally(() => {
      renewalRef.current = null;
    });
    const renewed = await renewalRef.current.catch(() => null);
    const token = validToken(renewed, tokenType);
    if (token) return token;

    // Renewal failed or kept an expired token: drop the session so the app starts a
    // fresh login instead of sending a token the server will reject.
    await authRef.current.removeUser().catch(() => undefined);
    throw new Error("OIDC login required.");
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

  if (auth.error && !isRenewalError(auth.error)) {
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
  useEffect(() => {
    if (!userManager) return;
    userManager.startSilentRenew();
    return () => userManager.stopSilentRenew();
  }, [userManager]);
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

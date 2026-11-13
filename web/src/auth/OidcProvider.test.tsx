import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useContext } from "react";
import { AuthContext as OidcContext } from "react-oidc-context";
import type { AuthContextProps } from "react-oidc-context";
import { beforeEach, expect, test, vi } from "vitest";

import { AuthContext } from "./AuthProvider";
import OidcProvider, {
  cleanOidcCallback,
  DEFAULT_OIDC_SCOPE,
  OidcAuthBridge,
  oidcSettings,
  oidcTokenType,
} from "./OidcProvider";

function jwt(name: string, expiresInSeconds: number) {
  const encode = (value: object) => btoa(JSON.stringify(value)).replace(/=+$/, "");
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  return `${encode({ alg: "RS256" })}.${encode({ sub: name, exp })}.signature`;
}

const ID_TOKEN = jwt("id", 3600);
const EXPIRED_ID_TOKEN = jwt("expired-id", -60);
const RENEWED_ID_TOKEN = jwt("renewed-id", 3600);

const { auth } = vi.hoisted(() => ({
  auth: {
    user: {
      profile: { sub: "oidc-user" },
      id_token: "",
      access_token: "jwt-access-token",
      expires_at: undefined as number | undefined,
    },
    isAuthenticated: true,
    isLoading: false,
    activeNavigator: undefined as string | undefined,
    error: undefined as (Error & { source?: string }) | undefined,
    signinSilent: vi.fn(),
    signinRedirect: vi.fn().mockResolvedValue(undefined),
    signoutRedirect: vi.fn().mockResolvedValue(undefined),
    removeUser: vi.fn().mockResolvedValue(undefined),
  },
}));
const endSessionEndpoint = vi.fn<() => Promise<string | undefined>>();

function Bridge({
  children,
  tokenType,
}: {
  children: React.ReactNode;
  tokenType?: "id_token" | "access_token";
}) {
  return (
    <OidcContext.Provider value={auth as unknown as AuthContextProps}>
      <OidcAuthBridge tokenType={tokenType} getEndSessionEndpoint={endSessionEndpoint}>
        {children}
      </OidcAuthBridge>
    </OidcContext.Provider>
  );
}

function Consumer() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("Missing CMS auth context");
  return (
    <>
      <button
        onClick={async () => {
          try {
            document.title = await context.getAccessToken();
          } catch (error) {
            document.title = `error: ${(error as Error).message}`;
          }
        }}>
        Token
      </button>
      <button onClick={context.login}>Login</button>
      <button onClick={context.logout}>Logout</button>
      <span>{context.isLoading ? "loading" : "ready"}</span>
    </>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  auth.error = undefined;
  auth.user.id_token = ID_TOKEN;
  auth.user.access_token = "jwt-access-token";
  auth.user.expires_at = undefined;
  auth.isLoading = false;
  auth.activeNavigator = undefined;
  endSessionEndpoint.mockResolvedValue("https://idp.example.com/logout");
  window.history.replaceState(null, "", "/");
});

test("reports missing OIDC configuration instead of rendering a blank page", () => {
  render(
    <OidcProvider authInfo={{}}>
      <div>CMS</div>
    </OidcProvider>,
  );
  expect(screen.getByRole("alert")).toHaveTextContent("REEARTH_CMS_OIDC_AUTHORITY");
});

test("uses ID tokens for CMS API calls by default", async () => {
  render(
    <Bridge>
      <Consumer />
    </Bridge>,
  );
  fireEvent.click(screen.getByText("Token"));
  await waitFor(() => expect(document.title).toBe(ID_TOKEN));
});

test("waits for an in-progress sign-in callback before returning the token", async () => {
  auth.isLoading = true;
  auth.activeNavigator = "signinRedirect";
  const user = auth.user;
  (auth as { user: typeof user | undefined }).user = undefined;
  const { rerender } = render(
    <Bridge>
      <Consumer />
    </Bridge>,
  );
  document.title = "pending";
  fireEvent.click(screen.getByText("Token"));
  await new Promise(resolve => setTimeout(resolve, 0));
  expect(document.title).toBe("pending");

  auth.isLoading = false;
  auth.activeNavigator = undefined;
  auth.user = user;
  rerender(
    <Bridge>
      <Consumer key="settled" />
    </Bridge>,
  );
  await waitFor(() => expect(document.title).toBe(ID_TOKEN));
});

test("uses the access token when configured", async () => {
  render(
    <Bridge tokenType="access_token">
      <Consumer />
    </Bridge>,
  );
  fireEvent.click(screen.getByText("Token"));
  await waitFor(() => expect(document.title).toBe("jwt-access-token"));
});

test("builds provider-agnostic settings with defaults and overrides", () => {
  const base = { oidcAuthority: "https://idp.example.com/realms/cms", oidcClientId: "cms" };
  const defaults = oidcSettings(base, "http://localhost:3000");
  expect(defaults).toMatchObject({
    authority: base.oidcAuthority,
    client_id: "cms",
    redirect_uri: "http://localhost:3000",
    post_logout_redirect_uri: "http://localhost:3000",
    response_type: "code",
    scope: DEFAULT_OIDC_SCOPE,
  });
  expect(defaults.extraQueryParams).toBeUndefined();
  expect(oidcTokenType(base)).toBe("id_token");

  const custom = { ...base, oidcScope: "openid email", oidcAudience: "cms-api" };
  expect(oidcSettings(custom, "http://localhost:3000")).toMatchObject({
    scope: "openid email",
    extraQueryParams: { audience: "cms-api" },
  });
  expect(oidcTokenType({ ...base, oidcTokenType: "access_token" })).toBe("access_token");
  expect(oidcTokenType({ ...base, oidcTokenType: "bogus" })).toBe("id_token");
});

test("renews when the ID token has expired even though the access token is still valid", async () => {
  auth.user.id_token = EXPIRED_ID_TOKEN;
  auth.user.expires_at = Math.floor(Date.now() / 1000) + 3600;
  auth.signinSilent.mockResolvedValue({ ...auth.user, id_token: RENEWED_ID_TOKEN });
  render(
    <Bridge>
      <Consumer />
    </Bridge>,
  );
  fireEvent.click(screen.getByText("Token"));
  await waitFor(() => expect(document.title).toBe(RENEWED_ID_TOKEN));
  expect(auth.signinSilent).toHaveBeenCalledOnce();
});

test("renews an expired access token when it is the selected bearer", async () => {
  auth.user.expires_at = Math.floor(Date.now() / 1000) - 60;
  auth.signinSilent.mockResolvedValue({
    ...auth.user,
    access_token: "renewed-access-token",
    expires_at: Math.floor(Date.now() / 1000) + 3600,
  });
  render(
    <Bridge tokenType="access_token">
      <Consumer />
    </Bridge>,
  );
  fireEvent.click(screen.getByText("Token"));
  await waitFor(() => expect(document.title).toBe("renewed-access-token"));
});

test("requires a fresh login when renewal keeps the expired ID token", async () => {
  auth.user.id_token = EXPIRED_ID_TOKEN;
  // A refresh response without id_token keeps the previous one.
  auth.signinSilent.mockResolvedValue({ ...auth.user });
  render(
    <Bridge>
      <Consumer />
    </Bridge>,
  );
  fireEvent.click(screen.getByText("Token"));
  await waitFor(() => expect(document.title).toBe("error: OIDC login required."));
  expect(auth.removeUser).toHaveBeenCalledOnce();
});

test("requires a fresh login when renewal fails", async () => {
  auth.user.id_token = EXPIRED_ID_TOKEN;
  auth.signinSilent.mockRejectedValue(new Error("invalid_grant"));
  render(
    <Bridge>
      <Consumer />
    </Bridge>,
  );
  fireEvent.click(screen.getByText("Token"));
  await waitFor(() => expect(document.title).toBe("error: OIDC login required."));
  expect(auth.removeUser).toHaveBeenCalledOnce();
});

test("shares one in-flight renewal between concurrent token requests", async () => {
  auth.user.id_token = EXPIRED_ID_TOKEN;
  let resolveRenewal: (user: unknown) => void = () => undefined;
  auth.signinSilent.mockReturnValue(new Promise(resolve => (resolveRenewal = resolve)));
  render(
    <Bridge>
      <Consumer />
    </Bridge>,
  );
  fireEvent.click(screen.getByText("Token"));
  fireEvent.click(screen.getByText("Token"));
  await new Promise(resolve => setTimeout(resolve, 0));
  resolveRenewal({ ...auth.user, id_token: RENEWED_ID_TOKEN });
  await waitFor(() => expect(document.title).toBe(RENEWED_ID_TOKEN));
  expect(auth.signinSilent).toHaveBeenCalledOnce();
});

test("keeps the app mounted when a background renewal fails", () => {
  auth.error = Object.assign(new Error("Network error"), { source: "renewSilent" });
  render(
    <Bridge>
      <Consumer />
    </Bridge>,
  );
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  expect(screen.getByText("Token")).toBeInTheDocument();
});

test("starts browser login and signs out via the provider's end-session endpoint", async () => {
  render(
    <Bridge>
      <Consumer />
    </Bridge>,
  );
  fireEvent.click(screen.getByText("Login"));
  expect(auth.signinRedirect).toHaveBeenCalledOnce();
  fireEvent.click(screen.getByText("Logout"));
  await waitFor(() => expect(auth.signoutRedirect).toHaveBeenCalledOnce());
  expect(auth.removeUser).not.toHaveBeenCalled();
});

test("only clears the local session when the provider has no end-session endpoint (e.g. Dex)", async () => {
  endSessionEndpoint.mockResolvedValue(undefined);
  render(
    <Bridge>
      <Consumer />
    </Bridge>,
  );
  fireEvent.click(screen.getByText("Logout"));
  await waitFor(() => expect(auth.removeUser).toHaveBeenCalledOnce());
  expect(auth.signoutRedirect).not.toHaveBeenCalled();
});

test("displays callback errors without triggering a redirect loop", () => {
  auth.error = Object.assign(new Error("Invalid state"), { source: "signinCallback" });
  render(
    <Bridge>
      <Consumer />
    </Bridge>,
  );
  expect(screen.getByRole("alert")).toHaveTextContent("Invalid state");
  expect(auth.signinRedirect).not.toHaveBeenCalled();
});

test("removes OIDC callback parameters while preserving the application URL", () => {
  window.history.replaceState(null, "", "/auth/tenant?code=secret&state=state&iss=idp&keep=1#map");
  cleanOidcCallback();
  expect(window.location.pathname + window.location.search + window.location.hash).toBe(
    "/auth/tenant?keep=1#map",
  );
});

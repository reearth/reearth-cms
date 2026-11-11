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

const { auth } = vi.hoisted(() => ({
  auth: {
    user: {
      profile: { sub: "oidc-user" },
      id_token: "signed-id-token",
      access_token: "jwt-access-token",
      expired: false,
    },
    isAuthenticated: true,
    isLoading: false,
    activeNavigator: undefined as string | undefined,
    error: undefined as Error | undefined,
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
          document.title = await context.getAccessToken();
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
  auth.user.expired = false;
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
  await waitFor(() => expect(document.title).toBe("signed-id-token"));
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
  await waitFor(() => expect(document.title).toBe("signed-id-token"));
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

test("renews an expired session before returning the ID token", async () => {
  auth.user.expired = true;
  auth.signinSilent.mockResolvedValue({
    ...auth.user,
    expired: false,
    id_token: "renewed-id-token",
  });
  render(
    <Bridge>
      <Consumer />
    </Bridge>,
  );
  fireEvent.click(screen.getByText("Token"));
  await waitFor(() => expect(document.title).toBe("renewed-id-token"));
  expect(auth.signinSilent).toHaveBeenCalledOnce();
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
  auth.error = new Error("Invalid state");
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

import { describe, test, expect, beforeEach, afterEach } from "vitest";

import {
  getAuthInfo,
  getSignInCallbackUrl,
  logInToTenant,
  logOutFromTenant,
} from "./authInfo";

describe("authInfo", () => {
  const tenantKey = "reearth_tennant";

  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  describe("getAuthInfo", () => {
    test("returns undefined when config is undefined", () => {
      expect(getAuthInfo(undefined)).toBeUndefined();
    });

    test("returns default auth info with auth0 fallback", () => {
      const conf = {
        api: "http://localhost",
        editorUrl: "http://editor",
        auth0ClientId: "client123",
        auth0Domain: "domain.auth0.com",
        auth0Audience: "https://api",
      } as never;
      const result = getAuthInfo(conf);
      expect(result).toEqual(
        expect.objectContaining({
          auth0ClientId: "client123",
          auth0Domain: "domain.auth0.com",
          auth0Audience: "https://api",
          authProvider: "auth0",
        }),
      );
    });

    test("uses configured authProvider", () => {
      const conf = {
        api: "http://localhost",
        editorUrl: "http://editor",
        authProvider: "cognito",
      } as never;
      const result = getAuthInfo(conf);
      expect(result?.authProvider).toBe("cognito");
    });

    test("returns multi-tenant auth info when tenant is active", () => {
      window.localStorage.setItem(tenantKey, "tenantA");
      const conf = {
        api: "http://localhost",
        editorUrl: "http://editor",
        multiTenant: {
          tenantA: {
            auth0ClientId: "tenant-client",
            auth0Domain: "tenant.auth0.com",
          },
        },
      } as never;
      const result = getAuthInfo(conf);
      expect(result?.auth0ClientId).toBe("tenant-client");
      expect(result?.authProvider).toBe("auth0");
    });

    test("falls back to default when multi-tenant has no matching tenant", () => {
      window.localStorage.setItem(tenantKey, "nonexistent");
      const conf = {
        api: "http://localhost",
        editorUrl: "http://editor",
        auth0ClientId: "default-client",
        multiTenant: {
          tenantA: { auth0ClientId: "tenant-client" },
        },
      } as never;
      const result = getAuthInfo(conf);
      expect(result?.auth0ClientId).toBe("default-client");
    });
  });

  describe("getSignInCallbackUrl", () => {
    test("returns origin when no tenant is active", () => {
      expect(getSignInCallbackUrl()).toBe(window.location.origin);
    });

    test("returns tenant callback URL when tenant is stored", () => {
      window.localStorage.setItem(tenantKey, "myTenant");
      expect(getSignInCallbackUrl()).toBe(`${window.location.origin}/auth/myTenant`);
    });
  });

  describe("logInToTenant / logOutFromTenant", () => {
    test("logInToTenant stores tenant from URL path", () => {
      const originalPathname = window.location.pathname;
      Object.defineProperty(window, "location", {
        value: { ...window.location, pathname: "/auth/someTenant" },
        writable: true,
      });
      logInToTenant();
      expect(window.localStorage.getItem(tenantKey)).toBe("someTenant");
      Object.defineProperty(window, "location", {
        value: { ...window.location, pathname: originalPathname },
        writable: true,
      });
    });

    test("logOutFromTenant removes tenant from localStorage", () => {
      window.localStorage.setItem(tenantKey, "myTenant");
      logOutFromTenant();
      expect(window.localStorage.getItem(tenantKey)).toBeNull();
    });

    test("logInToTenant does nothing when not on auth path", () => {
      Object.defineProperty(window, "location", {
        value: { ...window.location, pathname: "/" },
        writable: true,
      });
      logInToTenant();
      expect(window.localStorage.getItem(tenantKey)).toBeNull();
    });

    test("logInToTenant does nothing when auth path has no tenant name", () => {
      Object.defineProperty(window, "location", {
        value: { ...window.location, pathname: "/auth/" },
        writable: true,
      });
      logInToTenant();
      expect(window.localStorage.getItem(tenantKey)).toBeNull();
    });
  });

  describe("getSignInCallbackUrl with auth path", () => {
    test("returns tenant callback URL from auth path", () => {
      Object.defineProperty(window, "location", {
        value: { ...window.location, pathname: "/auth/pathTenant" },
        writable: true,
      });
      expect(getSignInCallbackUrl()).toBe(`${window.location.origin}/auth/pathTenant`);
    });
  });
});

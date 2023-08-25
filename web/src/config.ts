export type Config = {
  api: string;
  auth0ClientId?: string;
  auth0Domain?: string;
  auth0Audience?: string;
  cognitoRegion?: string;
  cognitoUserPoolId?: string;
  cognitoUserPoolWebClientId?: string;
  cognitoOauthScope?: string;
  cognitoOauthDomain?: string;
  cognitoOauthRedirectSignIn?: string;
  cognitoOauthRedirectSignOut?: string;
  cognitoOauthResponseType?: string;
  authProvider?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  cesiumIonAccessToken?: string;
};

const env = import.meta.env;

export const defaultConfig: Config = {
  api: env.REEARTH_CMS_API || "/api",
  auth0Audience: env.REEARTH_CMS_AUTH0_AUDIENCE || "https://api.test.reearth.dev",
  auth0Domain: env.REEARTH_CMS_AUTH0_DOMAIN || "reearth-oss-test.eu.auth0.com",
  auth0ClientId: env.REEARTH_CMS_AUTH0_CLIENT_ID || "k6F1sgFikzVkkcW9Cpz7Ztvwq5cBRXlv",
  authProvider: env.REEARTH_CMS_AUTH_PROVIDER || "auth0",
  logoUrl: env.REEARTH_CMS_LOGO_URL,
  coverImageUrl: env.REEARTH_CMS_COVER_URL,
  cesiumIonAccessToken: env.REEARTH_CMS_CESIUM_ION_ACCESS_TOKEN || "",
};

export default async function loadConfig() {
  if (window.REEARTH_CONFIG) return;
  window.REEARTH_CONFIG = defaultConfig;
  window.REEARTH_CONFIG = {
    ...defaultConfig,
    ...(await (await fetch("/reearth_config.json")).json()),
  };
}

export function config(): Config | undefined {
  return window.REEARTH_CONFIG;
}

export function e2eAccessToken(): string | undefined {
  return window.REEARTH_E2E_ACCESS_TOKEN;
}

declare global {
  interface Window {
    REEARTH_CONFIG?: {
      api: string;
      auth0ClientId?: string;
      auth0Domain?: string;
      auth0Audience?: string;
      cognitoRegion?: string;
      cognitoUserPoolId?: string;
      cognitoUserPoolWebClientId?: string;
      cognitoOauthScope?: string;
      cognitoOauthDomain?: string;
      cognitoOauthRedirectSignIn?: string;
      cognitoOauthRedirectSignOut?: string;
      cognitoOauthResponseType?: string;
      authProvider?: string;
      logoUrl?: string;
      coverImageUrl?: string;
    };
    REEARTH_E2E_ACCESS_TOKEN?: string;
  }
}

export type Config = {
  api: string;
  auth0ClientId?: string;
  auth0Domain?: string;
  auth0Audience?: string;
};
declare global {
  interface Window {
    REEARTH_CONFIG?: Config;
  }
}

const env = import.meta.env;

export const defaultConfig: Config = {
  api: env.REEARTH_CMS_API || "/api",
  auth0Audience:
    env.REEARTH_CMS_AUTH0_AUDIENCE || "https://api.test.reearth.dev",
  auth0Domain: env.REEARTH_CMS_AUTH0_DOMAIN || "reearth-oss-test.eu.auth0.com",
  auth0ClientId:
    env.REEARTH_CMS_AUTH0_CLIENT_ID || "k6F1sgFikzVkkcW9Cpz7Ztvwq5cBRXlv",
};

export default async function loadConfig() {
  if (window.REEARTH_CONFIG) return;
  window.REEARTH_CONFIG = defaultConfig;
  window.REEARTH_CONFIG = {
    ...defaultConfig,
    ...(await (await fetch("/reearth_config.json")).json()),
  };
}

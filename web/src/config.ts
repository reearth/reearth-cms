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

export const defaultConfig: Config = {
  api: "/api",
  auth0Audience: "https://api.test.reearth.dev",
  auth0Domain: "reearth-oss-test.eu.auth0.com",
  auth0ClientId: "k6F1sgFikzVkkcW9Cpz7Ztvwq5cBRXlv",
};

export default async function loadConfig() {
  if (window.REEARTH_CONFIG) return;
  window.REEARTH_CONFIG = defaultConfig;
  window.REEARTH_CONFIG = {
    ...defaultConfig,
    ...(await (await fetch("/reearth_config.json")).json()),
  };
}

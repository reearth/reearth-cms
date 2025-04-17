export const config = {
  api: process.env.REEARTH_CMS_API,
  userName: process.env.REEARTH_CMS_E2E_USERNAME,
  password: process.env.REEARTH_CMS_E2E_PASSWORD,
};

export type Config = typeof config;

export function setAccessToken(accessToken: string) {
  process.env.REEARTH_E2E_ACCESS_TOKEN = accessToken;
}

export function getAccessToken(): string | undefined {
  return process.env.REEARTH_E2E_ACCESS_TOKEN;
}

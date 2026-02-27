import { Browser, BrowserContext } from "@playwright/test";
import path from "path";

import { DEFAULT_USER_AGENT } from "./iap-auth-common";

export async function createIdTokenIAPContext(
  browser: Browser,
  options?: { storageState?: string },
): Promise<BrowserContext> {
  // Resolve storage state path if provided
  const storageStatePath = options?.storageState
    ? path.isAbsolute(options.storageState)
      ? options.storageState
      : path.join(process.cwd(), options.storageState)
    : undefined;

  const context = await browser.newContext({
    bypassCSP: true,
    extraHTTPHeaders: {
      "Proxy-Authorization": `Bearer ${process.env.IAP_ID_TOKEN}`,
      "User-Agent": DEFAULT_USER_AGENT,
    },
    ignoreHTTPSErrors: true,
    permissions: ["geolocation"],
    recordVideo: { dir: "videos/", size: { height: 720, width: 1280 } },
    storageState: storageStatePath,
  });

  return context;
}

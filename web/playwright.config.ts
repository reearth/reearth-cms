import path, { dirname } from "path";
import { fileURLToPath } from "url";

import { devices, type PlaywrightTestConfig } from "@playwright/test";
import * as dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, ".env") });

export const authFile = path.join(__dirname, "./e2e/support/.auth/user.json");

export const baseURL = process.env.REEARTH_CMS_E2E_BASEURL || "http://localhost:3000/";

const config: PlaywrightTestConfig = {
  globalSetup: path.resolve(__dirname, "./e2e/global-setup.ts"),
  workers: process.env.CI ? 5 : undefined,
  retries: 1,
  maxFailures: process.env.CI ? undefined : 10,
  forbidOnly: !!process.env.CI,
  use: {
    baseURL,
    screenshot: "only-on-failure",
    video: process.env.CI ? "on-first-retry" : "retain-on-failure",
    locale: "en-US",
    storageState: authFile,
  },
  testDir: "./e2e/tests",
  testMatch: "**/*.spec.ts",
  testIgnore: ["**/node_modules/**", "**/dist/**", "**/build/**"],
  reporter: process.env.CI ? "github" : [["list"], ["html", { open: "never" }]],
  fullyParallel: true,
  projects: [
    {
      name: "webkit",
      use: {
        ...devices["Desktop Safari"],
      },
    },
  ],
  timeout: 90 * 1000,
};

export default config;

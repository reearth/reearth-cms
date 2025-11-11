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
  workers: process.env.CI ? 1 : undefined,
  retries: 2,
  maxFailures: process.env.CI ? undefined : 10,
  forbidOnly: !!process.env.CI,
  use: {
    baseURL,
    screenshot: "only-on-failure",
    video: process.env.CI ? "on-first-retry" : "retain-on-failure",
    locale: "en-US",
    actionTimeout: 60 * 1000,
    navigationTimeout: 60 * 1000,
  },
  testDir: "./e2e/tests",
  testMatch: "**/*.spec.ts",
  testIgnore: ["**/node_modules/**", "**/dist/**", "**/build/**"],
  reporter: process.env.CI ? "github" : [["list"], ["html", { open: "never" }]],
  fullyParallel: false,
  projects: [
    {
      name: "setup",
      testDir: "./e2e/support",
      testMatch: "auth.setup.ts",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        storageState: authFile,
      },
      dependencies: ["setup"],
    },
  ],
  expect: {
    timeout: 60 * 1000,
  },
  timeout: 150 * 1000,
};

export default config;

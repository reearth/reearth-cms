import { devices, type PlaywrightTestConfig } from "@playwright/test";
import * as dotenv from "dotenv";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, ".env") });

export const authFile = path.join(__dirname, "./e2e/support/.auth/user.json");

export const baseURL = process.env.REEARTH_CMS_E2E_BASEURL || "http://localhost:3000/";

const config: PlaywrightTestConfig = {
  expect: {
    timeout: 60 * 1000,
  },
  forbidOnly: !!process.env.CI,
  fullyParallel: false,
  globalSetup: path.resolve(__dirname, "./e2e/global-setup.ts"),
  maxFailures: process.env.CI ? undefined : 10,
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
      dependencies: ["setup"],
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        storageState: authFile,
      },
    },
  ],
  reporter: process.env.CI ? "github" : [["list"], ["html", { open: "never" }]],
  retries: 2,
  testDir: "./e2e/tests",
  testIgnore: ["**/node_modules/**", "**/dist/**", "**/build/**"],
  testMatch: "**/*.spec.ts",
  timeout: 150 * 1000,
  use: {
    actionTimeout: 60 * 1000,
    baseURL,
    locale: "en-US",
    navigationTimeout: 60 * 1000,
    screenshot: "only-on-failure",
    video: process.env.CI ? "on-first-retry" : "retain-on-failure",
  },
  workers: process.env.CI ? 1 : undefined,
};

export default config;

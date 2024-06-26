import { type PlaywrightTestConfig } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config();

const config: PlaywrightTestConfig = {
  retries: 2,
  use: {
    baseURL: process.env.REEARTH_CMS_E2E_BASEURL || "http://localhost:3000/",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    locale: "en-US",
  },
  testDir: "e2e",
  globalSetup: "./e2e/utils/setup.ts",
  reporter: process.env.CI ? "github" : "list",
  fullyParallel: true,
};

export default config;

/// <reference types="vitest" />
/// <reference types="vite/client" />

import { resolve } from "path";

import yaml from "@rollup/plugin-yaml";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import cesium from "vite-plugin-cesium";

// https://vitejs.dev/config/
export default defineConfig({
  envPrefix: "REEARTH_CMS_",
  plugins: [react(), yaml(), cesium()],
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },
  resolve: {
    alias: [
      { find: "@reearth-cms", replacement: resolve(__dirname, "src") },
      {
        find: /^~/,
        replacement: "",
      },
    ],
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    coverage: {
      reporter: ["text", "json", "lcov"],
    },
  },
});

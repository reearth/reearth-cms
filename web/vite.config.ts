/// <reference types="vitest" />
/// <reference types="vite/client" />

import { resolve } from "path";

import yaml from "@rollup/plugin-yaml";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import cesium from "vite-plugin-cesium";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 3000,
  },
  envPrefix: "REEARTH_CMS_",
  plugins: [react(), yaml(), cesium()],
  css: {
    preprocessorOptions: {
      less: {
        modifyVars: { "font-family": "Roboto", "typography-title-font-weight": 500 },
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
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    coverage: {
      all: true,
      include: ["src/**/*.ts", "src/**/*.tsx"],
      exclude: [
        "src/**/*.d.ts",
        "src/**/*.stories.tsx",
        "src/gql/graphql-client-api.tsx",
        "src/test/**/*",
      ],
      reporter: ["text", "json", "lcov"],
    },
  },
});

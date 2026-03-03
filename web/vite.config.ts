/// <reference types="vite/client" />
/// <reference types="vitest" />

import yaml from "@rollup/plugin-yaml";
import react from "@vitejs/plugin-react";
import { execSync } from "child_process";
import { readFileSync } from "fs";
import { resolve } from "path";
import { readEnv } from "read-env";
import { defineConfig, loadEnv, type Plugin } from "vite";
import cesium from "vite-plugin-cesium";
import tsconfigPaths from "vite-tsconfig-paths";
import { configDefaults } from "vitest/config";

import pkg from "./package.json";

let commitHash = "";
try {
  commitHash = execSync("git rev-parse HEAD").toString().trimEnd();
} catch {
  // noop
}

const cesiumPackageJson = JSON.parse(
  readFileSync(resolve(__dirname, "node_modules", "cesium", "package.json"), "utf-8"),
);

export default defineConfig({
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __REEARTH_COMMIT_HASH__: JSON.stringify(process.env.GITHUB_SHA || commitHash),
  },
  envPrefix: "REEARTH_CMS_",
  plugins: [
    react(),
    yaml(),
    cesium({ cesiumBaseUrl: `cesium-${cesiumPackageJson.version}/` }),
    serverHeaders(),
    config(),
    tsconfigPaths(),
    injectCommitHashMeta(process.env.GITHUB_SHA || commitHash),
  ],
  server: {
    host: "127.0.0.1",
    open: true,
    port: 3000,
  },
  test: {
    alias: [
      { find: "@ant-design/pro-card", replacement: "@ant-design/pro-card/es/index.js" },
      { find: "@ant-design/pro-components", replacement: "@ant-design/pro-components/es/index.js" },
      {
        find: "@ant-design/pro-descriptions",
        replacement: "@ant-design/pro-descriptions/es/index.js",
      },
      { find: "@ant-design/pro-field", replacement: "@ant-design/pro-field/es/index.js" },
      { find: "@ant-design/pro-form", replacement: "@ant-design/pro-form/es/index.js" },
      { find: "@ant-design/pro-layout", replacement: "@ant-design/pro-layout/es/index.js" },
      { find: "@ant-design/pro-list", replacement: "@ant-design/pro-list/es/index.js" },
      { find: "@ant-design/pro-provider", replacement: "@ant-design/pro-provider/es/index.js" },
      { find: "@ant-design/pro-table", replacement: "@ant-design/pro-table/es/index.js" },
      { find: "@ant-design/pro-utils", replacement: "@ant-design/pro-utils/es/index.js" },
    ],
    coverage: {
      exclude: [
        "src/**/*.d.ts",
        "src/**/*.stories.tsx",
        "src/gql/graphql-client-api.tsx",
        "src/test/**/*",
      ],
      include: ["src/**/*.ts", "src/**/*.tsx"],
      reporter: ["text", "json", "lcov"],
    },
    environment: "jsdom",
    exclude: [...configDefaults.exclude, "e2e/**/*"],
    setupFiles: "./src/test/setup.ts",
    testTimeout: 30 * 1000,
  },
});

function serverHeaders(): Plugin {
  return {
    configureServer(server) {
      server.middlewares.use((_req, res, next) => {
        res.setHeader("Service-Worker-Allowed", "/");
        next();
      });
    },
    name: "server-headers",
  };
}

function config(): Plugin {
  return {
    async configureServer(server) {
      const envs = loadEnv(
        server.config.mode,
        server.config.envDir ?? process.cwd(),
        server.config.envPrefix,
      );
      const remoteReearthConfig = envs.REEARTH_WEB_CONFIG_URL
        ? await (await fetch(envs.REEARTH_WEB_CONFIG_URL)).json()
        : {};
      const configRes = JSON.stringify(
        {
          ...remoteReearthConfig,
          api: "http://localhost:8080/api",
          ...readEnv("REEARTH_CMS", {
            source: loadEnv(
              server.config.mode,
              server.config.envDir ?? process.cwd(),
              server.config.envPrefix,
            ),
          }),
          ...loadJSON("./reearth-config.json"),
        },
        null,
        2,
      );

      server.middlewares.use((req, res, next) => {
        if (req.method === "GET" && req.url === "/reearth_config.json") {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.write(configRes);
          res.end();
        } else {
          next();
        }
      });
    },
    name: "reearth-config",
  };
}

function loadJSON(path: string): object {
  try {
    return JSON.parse(readFileSync(path, "utf8")) || {};
  } catch (_) {
    return {};
  }
}

function injectCommitHashMeta(commitHash: string): Plugin {
  const trimmedCommitHash = commitHash.slice(0, 7);
  return {
    name: "inject-commit-hash-meta",
    transformIndexHtml(html) {
      return html.replace(
        "</head>",
        `    <meta name="reearth-commit-hash" content="${trimmedCommitHash}" />\n  </head>`,
      );
    },
  };
}

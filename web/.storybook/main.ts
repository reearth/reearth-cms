import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

import type { StorybookConfig } from "@storybook/react-vite";
import { mergeConfig } from "vite";

const dirName = dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: ["@storybook/addon-links", "@storybook/addon-docs"],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  docs: {
    autodocs: "tag",
  },
  async viteFinal(viteConfig) {
    // The app's vite.config.ts plugins (including vite-plugin-cesium, which no story
    // needs and whose asset-copy step misbehaves under Storybook's own outDir) get
    // inherited by @storybook/react-vite's builder — strip cesium out here.
    viteConfig.plugins = viteConfig.plugins?.filter(
      plugin => !(plugin && "name" in plugin && plugin.name?.includes("cesium")),
    );
    return mergeConfig(viteConfig, {
      resolve: {
        alias: [{ find: /^@reearth-cms\/(.*)/, replacement: resolve(dirName, "../src/$1") }],
      },
    });
  },
};
export default config;

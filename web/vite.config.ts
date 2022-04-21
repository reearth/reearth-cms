import { resolve } from "path";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [{ find: "@reearth-cms", replacement: resolve(__dirname, "src") }],
  },
});

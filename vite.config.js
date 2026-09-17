import { defineConfig } from "vite";

export default defineConfig({
  // Keep the dev optimizer away from OneDrive's stale default cache reparse point.
  cacheDir: "node_modules/.vite-m0-cache",
});

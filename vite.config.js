import { defineConfig } from "vite";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const projectPath = fileURLToPath(new URL(".", import.meta.url));
const projectKey = createHash("sha256").update(projectPath).digest("hex").slice(0, 12);

export default defineConfig({
  // OneDrive can mark optimizer directories read-only/reparse points. Keep
  // disposable Vite caches outside the synced workspace, isolated by checkout.
  cacheDir: join(tmpdir(), "platoon-tactical-vite", projectKey),
  // Complete multi-attempt replay fixtures exceed the five-second unit default.
  // Bound workers to avoid Windows process/memory pressure during the full suite.
  test: { maxWorkers: 2, testTimeout: 120000 },
});

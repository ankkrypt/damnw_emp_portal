import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    // Match the "@/*" path alias from tsconfig.json.
    alias: { "@": path.resolve(process.cwd()) },
  },
  test: {
    // These are pure-function tests — no DOM/browser needed.
    environment: "node",
  },
});

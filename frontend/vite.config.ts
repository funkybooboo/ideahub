import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import eslintPlugin from "vite-plugin-eslint";
import { configDefaults } from "vitest/config";

export default defineConfig({
  plugins: [react(), eslintPlugin()],
  server: {
    port: 3000,
    proxy: { "/api": "http://localhost:8000" }
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.ts",
    exclude: [...configDefaults.exclude, "e2e/*"]
  }
});

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: "esnext", // Required for top-level await support
  },
  // NOTE: We intentionally do NOT set Cross-Origin-Embedder-Policy here.
  // COEP "require-corp" / "credentialless" would block fetching MediaPipe
  // models from Google Storage unless those servers send CORP headers (they don't).
});

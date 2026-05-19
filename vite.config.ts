import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Relative base — as a brain-app this is served from a nested path inside
  // the brain (/apps/<id>/), not the domain root. Absolute /assets/... URLs
  // would 404 inside the iframe. Must stay "./".
  base: "./",
  build: {
    outDir: "dist",
  },
});

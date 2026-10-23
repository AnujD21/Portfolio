import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    target: "es2022",
    // The Three.js scene is a lazy chunk (~250 kB gzip) loaded behind the preloader.
    chunkSizeWarningLimit: 1000,
  },
});

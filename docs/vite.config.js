import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Base path for GitHub Pages project site (served at /Homiewood/).
export default defineConfig({
  base: "/Homiewood/",
  plugins: [react()],
  css: {
    modules: {
      localsConvention: "camelCaseOnly",
    },
  },
  server: {
    port: 5173,
  },
  // sockjs-client expects a `global` to exist in the browser.
  define: {
    global: "window",
  },
});

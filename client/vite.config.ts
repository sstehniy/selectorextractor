import path from "path";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 1881,
    proxy: {
      "/api": {
        target: "http://localhost:1323/",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/v1/, "/api/v1/"),
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});

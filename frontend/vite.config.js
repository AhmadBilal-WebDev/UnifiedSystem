import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
      "/login": { target: "http://localhost:5000", changeOrigin: true },
      "/signup": { target: "http://localhost:5000", changeOrigin: true },
      "/logout": { target: "http://localhost:5000", changeOrigin: true },
      "/create": { target: "http://localhost:5000", changeOrigin: true },
      "/myorders": { target: "http://localhost:5000", changeOrigin: true },
      "/direct-reset": { target: "http://localhost:5000", changeOrigin: true },
      "/delete-account": { target: "http://localhost:5000", changeOrigin: true },
      "/user": { target: "http://localhost:5000", changeOrigin: true },
      "/store": { target: "http://localhost:5000", changeOrigin: true },
      "/images": { target: "http://localhost:5000", changeOrigin: true },
    },
  },
});

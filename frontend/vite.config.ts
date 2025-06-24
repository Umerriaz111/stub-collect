import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // 👈 Set custom port here
  },
  optimizeDeps: {
    exclude: ["chunk-7UC5F3WO.js?v=80892924"],
  },
});

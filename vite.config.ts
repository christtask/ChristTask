import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/api': 'https://christtask-backend.onrender.com',
      '/create-subscription': 'https://christtask-backend.onrender.com',
      '/check-subscription': 'https://christtask-backend.onrender.com',
      '/validate-coupon': 'https://christtask-backend.onrender.com'
    }
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  css: {
    postcss: './postcss.config.js'
  }
}));

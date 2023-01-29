import { fileURLToPath, URL } from "node:url";
import { VitePWA } from "vite-plugin-pwa";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,ttf}"],
      },
      includeAssets: [
        "src/asses/images/favicon.ico",
        "icons/apple-touch-icon.png",
      ],
      manifest: {
        name: "Aroma UGE",
        short_name: "Aroma UGE",
        description: "Aroma UGE",
        icons: [
          {
            src: "icons/manifest-icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "icons/manifest-icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
        display: "standalone",
        start_url: ".",
      },
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});

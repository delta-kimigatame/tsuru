/// <reference types="vitest" />
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "./",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "logo192.png", "logo512.png", "ogi.png"],
      manifest: {
        name: "きみがためtools - UTAlet -",
        short_name: "UTAlet",
        theme_color: "#9575CD",
        background_color: "#EEEEEE",
        lang: "ja",
        start_url: "/",
        display: "standalone",
        icons: [
          {
            src: "static/favicon.ico",
            sizes: "64x64 32x32 24x24 16x16",
            type: "image/x-icon",
          },
          {
            src: "static/logo192.png",
            type: "image/png",
            sizes: "192x192",
            purpose: "maskable",
          },
          {
            src: "static/logo512.png",
            type: "image/png",
            sizes: "512x512",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 4.5 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: /.*\.(js|css|html|png|jpg|jpeg|svg)$/,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "assets-cache",
            },
          },
        ],
      },
    }),
  ],
  test: {
    globals: true, // Jestの `global` な関数 (`describe`, `test` など) を有効にする
    environment: "jsdom", // JSDOM環境を使う
    setupFiles: "./vitest.setup.ts", // テスト前のセットアップファイル
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    host: true,
    port: 8080,
  },
  worker: {
    format: "es", // もしくは codeSplitting: false など
  },
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`,
      },
    },
  },
});

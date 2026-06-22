import { defineConfig, type Plugin } from "vite";
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import checker from "vite-plugin-checker";
import path from "path";

const MAX_CACHE_SIZE_BYTES = 15 * 1024 * 1024;

const isTauriBuild =
  process.env.TAURI_ENV_PLATFORM !== undefined || process.env.TAURI_BUILD === "true";

console.log("Vite Config - isTauriBuild:", isTauriBuild);

const crossOriginIsolation = (): Plugin => ({
  name: "cross-origin-isolation",
  configureServer(server) {
    server.middlewares.use((_req, res, next) => {
      res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
      res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
      next();
    });
  },
  configurePreviewServer(server) {
    server.middlewares.use((_req, res, next) => {
      res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
      res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
      next();
    });
  },
});

export default defineConfig(({ command }) => ({
  server: {
    host: true,
  },
  plugins: [
    crossOriginIsolation(),
    reactRouter(),
    tailwindcss(),
    VitePWA({
      outDir: "build/client",
      includeAssets: [
        "favicon.svg",
        "mask-icon.svg",
        "favicon-192.png",
        "favicon-512.png",
        "mask-icon-192.png",
        "mask-icon-512.png",
      ],
      registerType: "autoUpdate",
      manifest: {
        id: "/app",
        name: "Kei",
        short_name: "Kei",
        description:
          "Your productivity app that frees you from planning and lets you focus on what matters to you.",
        theme_color: "#18181b",
        background_color: "#18181b",
        display: "standalone",
        start_url: "/app",
        icons: [
          {
            src: "/favicon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/favicon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/mask-icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "/mask-icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,wasm,data}"],
        maximumFileSizeToCacheInBytes: MAX_CACHE_SIZE_BYTES,
        navigateFallback: "/__spa-fallback.html",
      },
      devOptions: {
        enabled: true,
        suppressWarnings: true,
      },
    }),
    ...(command === "serve"
      ? [
          checker({
            typescript: true,
          }),
        ]
      : []),
  ],
  resolve: {
    alias: [
      { find: "@", replacement: path.resolve(__dirname, "./app") },
      ...(isTauriBuild
        ? [
            {
              find: /.*webDatabaseAdapter$/,
              replacement: path.resolve(__dirname, "./app/db/webDatabaseAdapter.stub.ts"),
            },
          ]
        : []),
    ],
  },
  optimizeDeps: {
    exclude: ["@sqlite.org/sqlite-wasm"],
  },
  worker: {
    format: "es",
  },
  build: {
    rollupOptions: {
      onLog(level, log, defaultHandler) {
        if (log.code === "EVAL") {
          return;
        }
        defaultHandler(level, log);
      },
    },
  },
}));

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      // الآن لأننا داخل client/ مباشرة
      "@": path.resolve(import.meta.dirname, "src"),
      // shared موجودة في المستوى اللي فوق
      "@shared": path.resolve(import.meta.dirname, "../shared"),
      // ونفس الشي للأصول
      "@assets": path.resolve(import.meta.dirname, "../attached_assets"),
    },
  },
  // root صار هو نفس مجلد client نفسه
  root: import.meta.dirname,
  build: {
    // نخرّج ملفات الواجهة إلى dist/public في جذر المشروع
    outDir: path.resolve(import.meta.dirname, "../dist/public"),
    emptyOutDir: true,
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});

import { defineConfig, transformWithEsbuild } from "vite";
import react from "@vitejs/plugin-react";

// Autorise les composants React avec du JSX dans les fichiers .js.
export default defineConfig({
  // Accessible uniquement depuis ce PC : une seule adresse localhost.
  server: { host: "localhost", port: 5173, strictPort: true },
  preview: { host: "localhost" },
  plugins: [
    {
      name: "jsx-in-js",
      enforce: "pre",
      async transform(code, id) {
        if (!id.includes("/src/") || !id.endsWith(".js")) return null;
        return transformWithEsbuild(code, id, { loader: "jsx", jsx: "automatic" });
      },
    },
    react(),
  ],
  optimizeDeps: {
    esbuildOptions: { loader: { ".js": "jsx" } },
  },
});

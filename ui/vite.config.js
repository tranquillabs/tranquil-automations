import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import tailwindcss from "@tailwindcss/vite";

// Builds the workbook view's components into one CommonJS file, for Pulsar's require(), and one
// stylesheet, in ../dist. The Svelte runtime is bundled in. `deno task build` then points the
// stylesheet at the shadow root (common/host-css.ts).
export default defineConfig({
  plugins: [tailwindcss(), svelte()],
  build: {
    lib: {
      entry: "workbook/main.js",
      formats: ["cjs"],
      fileName: () => "workbook-ui.js",
      cssFileName: "workbook-ui",
    },
    outDir: "../dist",
    emptyOutDir: true,
    minify: false,
    cssCodeSplit: false,
    // Node's own modules stay `require`s: the window that loads the bundle has Node.
    rollupOptions: { external: [/^node:/] },
  },
});

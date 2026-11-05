// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Inside Lovable the build is always forced to its own hosting target.
// Anywhere else (your laptop / self-hosted server), `npm run build` produces a
// plain Node.js server in ./dist  ->  run with:  node dist/server/index.mjs
const isLovable = process.env["LOVABLE_SANDBOX"] === "1" || !!process.env["SANDBOX_IMAGE"];

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  ...(isLovable
    ? {}
    : {
        // rollupConfig is a valid nitro option, missing from the wrapper's narrow type.
        nitro: {
          preset: "node-server",
          output: { dir: "dist", serverDir: "dist/server", publicDir: "dist/public" },
          rollupConfig: { external: ["cloudflare:sockets"] },
        } as { preset: string },
        // Self-hosted: the browser talks to the backend on the SAME address the page
        // was opened with (private IP, public IP or domain). Nginx forwards /auth/v1,
        // /rest/v1, /storage/v1 to the backend. Server-side code uses SUPABASE_URL.
        vite: {
          define: {
            "import.meta.env.VITE_SUPABASE_URL":
              "(typeof window !== 'undefined' ? window.location.origin : process.env.SUPABASE_URL)",
          },
        },
      }),
});

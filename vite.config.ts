// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  // Pin Nitro's build target to Vercel. The wrapper otherwise defaults to the
  // `cloudflare-module` preset; Nitro's zero-config detection would normally pick
  // Vercel up from the build environment, but pinning makes the target explicit and
  // reproducible for local builds and CI rather than dependent on env sniffing.
  // Produces .vercel/output (Build Output API v3).
  // Note: inside a Lovable build LOVABLE_NITRO_PRESET still wins, so this does not
  // disturb Lovable's own Cloudflare-targeted builds.
  nitro: { preset: "vercel" },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});

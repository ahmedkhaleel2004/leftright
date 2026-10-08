import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  // PostHog reverse proxy.
  async rewrites() {
    return [
      { source: "/ingest/static/:path*", destination: "https://us-assets.i.posthog.com/static/:path*" },
      { source: "/ingest/array/:path*", destination: "https://us-assets.i.posthog.com/array/:path*" },
      { source: "/ingest/:path*", destination: "https://us.i.posthog.com/:path*" },
    ];
  },
  // The Worker's own address sends people to the short one (pages-proxy/).
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "leftrighthand.gitdiagram-presence.workers.dev" }],
        destination: "https://leftrighthand.pages.dev/:path*",
        permanent: true,
      },
    ];
  },
  skipTrailingSlashRedirect: true,
};

export default nextConfig;

// Gives `next dev` the Worker's bindings (a local D1 database).
initOpenNextCloudflareForDev();

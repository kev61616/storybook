import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "oaidalleapiprodscus.blob.core.windows.net",
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.blob.core.windows.net",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;

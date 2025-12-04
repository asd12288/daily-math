import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  // Strict mode for better development experience
  reactStrictMode: true,

  // Image configuration for external images
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "fra.cloud.appwrite.io",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
      },
    ],
  },
};

export default withNextIntl(nextConfig);

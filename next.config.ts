import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    // Needed for Tailwind CSS 4
    turbo: {
      rules: {
        // For proper CSS precedence with Tailwind CSS 4
        '*.module.css': {
          as: 'raw',
        },
      },
    },
  },
};

export default nextConfig;

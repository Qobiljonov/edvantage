import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false as any,
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;

import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Ignore build errors during deployment
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
  // Skip type checking during build
  experimental: {
    typedRoutes: false,
  },
  // Ignore PostCSS warnings
  webpack: (config: any) => {
    config.infrastructureLogging = {
      level: "error",
    }
    return config
  },
}

export default nextConfig

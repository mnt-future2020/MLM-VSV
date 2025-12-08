import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["unsplash.com", "images.unsplash.com"],
  },
  
  // Proxy API calls to backend
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8001/api/:path*',
      },
    ];
  },
};

export default nextConfig;

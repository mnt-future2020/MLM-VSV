import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["unsplash.com", "images.unsplash.com"],
  },
  
  // Proxy API calls to backend
  async rewrites() {
    // Use environment variable for backend URL, fallback to localhost for development
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8001';
    
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;

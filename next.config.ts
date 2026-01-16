import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        pathname: '/**',
      },
    ],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  async rewrites() {
    return [
      {
        source: '/api/cars/:path*',
        destination: 'http://localhost:8082/api/cars/:path*',
      },
      {
        source: '/api/pricing/:path*',
        destination: 'http://localhost:8082/api/pricing/:path*',
      },
      {
        source: '/api/exchange-rates/:path*',
        destination: 'http://localhost:8082/api/exchange-rates/:path*',
      },
    ];
  },
};

export default nextConfig;

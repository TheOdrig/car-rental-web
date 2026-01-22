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
      {
        protocol: 'https',
        hostname: 'www.thedrive.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.sixt.com.tr',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.log.com.tr',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn3.focus.bg',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'tr.semautomobile.com',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8082',
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

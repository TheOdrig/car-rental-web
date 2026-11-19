import type { NextConfig } from "next";

interface HeaderEnvironment {
  isDevelopment: boolean;
  isProduction: boolean;
}

export function buildContentSecurityPolicy({ isDevelopment }: Pick<HeaderEnvironment, "isDevelopment">): string {
  const scriptSources = [
    "'self'",
    "'unsafe-inline'",
    "https://js.stripe.com",
    "https://*.js.stripe.com",
  ];
  if (isDevelopment) {
    scriptSources.push("'unsafe-eval'");
  }

  const connectSources = [
    "'self'",
    "https://api.stripe.com",
    "https://link.com",
    "https://*.link.com",
  ];
  if (isDevelopment) {
    connectSources.push("ws:", "wss:");
  }

  const frameSources = [
    "https://js.stripe.com",
    "https://*.js.stripe.com",
    "https://hooks.stripe.com",
    "https://*.stripe.com",
    "https://m.stripe.network",
    "https://link.com",
    "https://*.link.com",
  ];

  return [
    "default-src 'self'",
    `script-src ${scriptSources.join(" ")}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    `connect-src ${connectSources.join(" ")}`,
    `frame-src ${frameSources.join(" ")}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ");
}

export function buildSecurityHeaders(environment: HeaderEnvironment): Array<{ key: string; value: string }> {
  const headers = [
    { key: "Content-Security-Policy", value: buildContentSecurityPolicy(environment) },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    {
      key: "Permissions-Policy",
      value: "camera=(), microphone=(), geolocation=(), payment=(self \"https://js.stripe.com\")",
    },
  ];

  if (environment.isProduction) {
    headers.push({ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" });
  }

  return headers;
}

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  async redirects() {
    return [
      { source: "/settings", destination: "/settings/profile", permanent: false },
      { source: "/dashboard", destination: "/rentals", permanent: false },
      { source: "/admin", destination: "/admin/dashboard", permanent: false },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: buildSecurityHeaders({
          isDevelopment: process.env.NODE_ENV === "development",
          isProduction: process.env.NODE_ENV === "production",
        }),
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        pathname: "/**",
      },
    ],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;

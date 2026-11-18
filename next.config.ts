import type { NextConfig } from "next";

interface HeaderEnvironment {
  isDevelopment: boolean;
  isProduction: boolean;
}

export function buildContentSecurityPolicy({ isDevelopment }: Pick<HeaderEnvironment, "isDevelopment">): string {
  const scriptSources = ["'self'", "'unsafe-inline'", "https://js.stripe.com"];
  if (isDevelopment) {
    scriptSources.push("'unsafe-eval'");
  }

  const connectSources = ["'self'", "https://api.stripe.com"];
  if (isDevelopment) {
    connectSources.push("ws:", "wss:");
  }

  return [
    "default-src 'self'",
    `script-src ${scriptSources.join(" ")}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    `connect-src ${connectSources.join(" ")}`,
    "frame-src https://js.stripe.com https://*.stripe.com https://m.stripe.network",
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
    ],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;

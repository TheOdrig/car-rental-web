# Container deployment

Car Rental Web is an undeployed portfolio project. These instructions describe how to build and run the container with a compatible Car Rental API and Stripe test-mode configuration.

## Build

The project requires Node.js 22. The [Dockerfile](../../Dockerfile) pins all stages to `node:22.20.0-alpine`, installs dependencies with `npm ci --ignore-scripts`, and builds the app with [Next.js standalone output](../../next.config.ts). The runtime copies the standalone output, static assets and public files, then starts `node server.js` as the unprivileged `nextjs` user on port 3000.

Build from a clean checkout so the Docker context contains only the public project files. Set the public URL at build time. The host below is a placeholder.

```bash
docker build -t car-rental-web --build-arg NEXT_PUBLIC_APP_URL=https://app.example.com .
```

## Run

Provide the upstream URL and matching signing secret at runtime. Supply the secret through your runtime configuration. This example reads the value from the shell environment and exposes the container on local loopback for a process check.

```bash
docker run --name car-rental-web -p 127.0.0.1:3000:3000 \
  -e API_URL=https://api.example.com \
  -e JWT_SECRET \
  car-rental-web
```

[Environment variables](ENVIRONMENT_VARIABLES.md) lists the runtime defaults and validation rules.

## Check the running app

1. Request `http://localhost:3000/api/health`. HTTP 200 with `{"status":"ok"}` means the Next.js process answers. The [health handler](../../src/app/api/health/route.ts) makes no API call.
2. Through the configured public URL, open `/cars` to exercise API connectivity and catalog rendering. Use `npm run contract:check` for snapshot drift.
3. Sign in over HTTPS. In production, the [auth cookies](../../src/shared/server/auth-cookies.ts) use the `Secure` flag. A login that redirects back to the sign-in page warrants checking the browser scheme and the matching signing secret.

## Reverse proxy and security headers

Terminate TLS at a trusted edge and restrict access to the application origin. Configure `TRUSTED_PROXY_HOPS` to match the proxy chain or set `TRUSTED_CLIENT_IP_HEADER` to a header the edge controls. The web forwards `X-Client-IP` only for a resolved address. Configure the API to trust that header only from the narrow source range of the web server. [Client IP resolver](../../src/shared/server/client-ip.ts) · [Stack setup](../testing/E2E_STACK.md)

[Next.js configuration](../../next.config.ts) sets a Content Security Policy (CSP) with Stripe allowances, frame restrictions, `nosniff`, a referrer policy and a permissions policy. Production adds HSTS. File responses under `/api/files/` use a separate sandboxed CSP. [Header tests](../../src/__tests__/security-headers.test.ts) and the [stack header spec](../../e2e-stack/security-headers.spec.ts) assert these rules.

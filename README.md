# Car Rental Web

The customer and admin web client for the [Car Rental API](https://github.com/TheOdrig/car-rental-api), built with Next.js. Customers browse the catalogue, check availability, request a rental and pay for it; admins confirm rentals, manage the fleet and users, and handle damages and late returns.

This is a portfolio project, built to show how a Next.js client is structured, kept in step with an API contract and verified. It is not deployed anywhere, and Stripe runs in test mode only.

![Home page](docs-public/screenshots/home.webp)

| Browse cars | Car detail | Admin dashboard | Phone (390 px) |
| --- | --- | --- | --- |
| ![Cars list](docs-public/screenshots/cars.webp) | ![Car detail](docs-public/screenshots/car-detail.webp) | ![Admin dashboard](docs-public/screenshots/admin-dashboard.webp) | ![Cars on a phone](docs-public/screenshots/cars-mobile.webp) |

Screenshots were taken against the API running from Docker Compose with its seed data.

## Quick start

You need Node 22 and Docker.

1. In a checkout of [car-rental-api](https://github.com/TheOdrig/car-rental-api), run `docker compose up --build`. The API starts on http://localhost:8082 with seed data and a stub payment gateway.
2. In this repository, run `cp .env.example .env.local`.
3. Set `JWT_SECRET` in `.env.local` to the API's signing secret. The API's `dev` profile defaults to `dev-only-jwt-secret-do-not-use-outside-local-development-0123456789`; use that for local work.
4. Run `npm ci`, then `npm run dev`.
5. Open http://localhost:3000. The seed includes an admin account (`admin` / `Admin123!`).

Without a `pk_test_` Stripe key, the pay page refuses to render the card form, by design.

To remove the API stack and its local data, run `docker compose down -v` in the API checkout.

## Architecture

The source follows Feature-Sliced Design (`app`, `widgets`, `features`, `entities`, `shared` under [`src`](src)). ESLint restricts cross-layer imports. The browser never talks to the API: it calls Next route handlers under [`src/app/api`](src/app/api), which call the API from the server.

```mermaid
graph LR
    B[Browser] -->|cookies, same origin| P[proxy.ts]
    P --> R[Route handlers /api/*]
    R -->|Bearer token| A[Car Rental API]
    P -.->|refresh when the access token expired| A
```

## Highlights

| Topic | What it does | Proof |
| --- | --- | --- |
| Layer boundaries | ESLint restricts cross-layer imports. Architecture tests check slice entry points and entity cross-imports (`@x`). | [`eslint.config.mjs`](eslint.config.mjs), [`fsd-boundaries.test.ts`](src/__tests__/architecture/fsd-boundaries.test.ts), [`misc.test.ts`](src/__tests__/architecture/misc.test.ts) |
| Session handling | Tokens live in httpOnly cookies. Concurrent refreshes share one request per refresh token. | [`auth-cookies.ts`](src/shared/server/auth-cookies.ts), [`upstream.ts`](src/shared/server/upstream.ts) |
| Request guards | Guarded mutations reject cross-origin requests with 403. Guarded POST, PUT and PATCH requests reject unsupported media types with 415. | [`route.test.ts`](src/shared/server/__tests__/route.test.ts) |
| API contract | Types are generated from a committed OpenAPI snapshot; drift fails `verify` | [`scripts/contract.mjs`](scripts/contract.mjs), [`upstream-contract.test.ts`](src/shared/server/__tests__/upstream-contract.test.ts) |
| Errors | RFC 9457 problem details become a typed `ApiError`; an unreachable API is a 503, a timeout a 504 | [`route.test.ts`](src/shared/server/__tests__/route.test.ts), [`upstream.test.ts`](src/shared/server/__tests__/upstream.test.ts) |
| Payments | Stripe Payment Element with `redirect: 'if_required'`, polled with back-off, `pk_test_` keys only | [`pay-rental.test.tsx`](src/features/pay-rental/__tests__/pay-rental.test.tsx), [`env-stripe.test.ts`](src/shared/server/__tests__/env-stripe.test.ts) |
| Safe redirects | The callback checks redirect paths for same origin. The OAuth callback compares equal-length state buffers with `timingSafeEqual`. | [`oauth-state.ts`](src/app/api/auth/_lib/oauth-state.ts), [OAuth callback](src/app/api/auth/callback/%5Bprovider%5D/route.ts) |

## Stack

Next.js (App Router), React, TypeScript, TanStack Query, Zustand, Zod, Tailwind CSS, Radix UI, jose, Stripe Elements, openapi-typescript, Vitest, Testing Library, MSW and Playwright with axe-core. Versions are in [`package.json`](package.json).

## Verify

```bash
bash scripts/verify.sh
```

On Windows use [`scripts/verify.ps1`](scripts/verify.ps1). It checks the Node version and that no AI or planning files are tracked, then runs lint with zero warnings, the contract check, type check, the unit and architecture tests, a dependency audit and the production build. There is no hosted CI; this local gate is the check. End-to-end tests against the real API run with `npm run test:e2e:stack`.

Before `npm run test:e2e:stack`, start the API with its rate limiter trusting `X-Client-IP` from the web server's address range (the [Playwright config](playwright.stack.config.ts) sets the web server's proxy hops).

Environment variables are listed in [`.env.example`](.env.example).

## License

[MIT](LICENSE)

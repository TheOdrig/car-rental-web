# Stack end-to-end tests

The [stack Playwright project](../../playwright.stack.config.ts) exercises the web app and BFF against the Car Rental API running locally in Docker Compose. It runs Chromium with one worker. The API development payment stub supports testing booking and payment-page states. Stripe card confirmation is outside this suite's coverage.

## Coverage

| Area | What the specs assert |
| --- | --- |
| Catalog and auth | Price sorting across pages, car details and availability, account registration, sign-out, sign-in and wrong-password behavior. [Catalog](../../e2e-stack/catalog.spec.ts) · [Auth](../../e2e-stack/auth.spec.ts) |
| Booking and damage | Booking through admin approval and the pay page, payment-window messaging, and an assessed damage charge using the development stub. [Booking](../../e2e-stack/booking-flow.spec.ts) · [Damage](../../e2e-stack/damage-charge.spec.ts) |
| Admin contract | Admin dashboard, revenue and other response shapes consumed by the web. [Admin contract](../../e2e-stack/admin-contract.spec.ts) |
| Security headers and rate limiting | Public-page hardening and CSP, file-proxy sandbox CSP, separate client login rate-limit buckets and handling of a client-supplied header. [Headers](../../e2e-stack/security-headers.spec.ts) · [Client IP](../../e2e-stack/client-ip.spec.ts) |

## Run locally

You need Docker, Node.js 22, installed web dependencies and Chromium from `npx playwright install chromium`.

1. Use a clean checkout of the [Car Rental API](https://github.com/TheOdrig/car-rental-api) at a committed revision compatible with the [web snapshot](../../contract/openapi.json). Use a dedicated Compose project. If default ports are occupied, set `APP_PORT`, `DB_PORT` and `MANAGEMENT_HOST_PORT` in a local Compose environment file, and use the same file for startup and teardown.
2. For the client-IP checks, set `SECURITY_RATELIMIT_TRUSTEDCLIENTIPHEADER=X-Client-IP` and `SECURITY_RATELIMIT_TRUSTEDPROXYCIDRS` in the Compose override for the API's `app` service. Set the latter to the narrow source range from which the API actually receives web requests. Include the override with `-f` when running Compose.
3. Start the API with `docker compose -p car-rental-e2e up -d --build` and any configured file options. With the default port, check that `http://localhost:8082/api/v1/cars/filter-options` returns HTTP 200.
4. Stop other Next.js dev processes using this checkout before running `npm run test:e2e:stack`. The Playwright config starts the web server on port 3100 by default and reuses a healthy server there. If it reuses a server, configure that server to use the same API, signing secret and proxy trust settings.
5. Stop the dedicated stack with `docker compose -p car-rental-e2e down` and the same file options. Add `-v` only to discard its local test data.

## Overrides

| Variable | Default or effect |
| --- | --- |
| `E2E_BASE_URL` | When supplied, uses that running web URL and skips starting Next.js |
| `E2E_WEB_PORT` | `3100` for the managed local web server |
| `E2E_API_URL` | `http://localhost:8082` for the managed web server |
| `E2E_JWT_SECRET` | Uses the development fixture by default. Override when the API uses a different signing secret. |
| `E2E_TRUSTED_PROXY_HOPS` | `1` for the managed web server, allowing the suite to exercise forwarded addresses |
| `E2E_ADMIN_USERNAME`, `E2E_ADMIN_PASSWORD` | Local seed fixtures. Override if your local API uses different test credentials. |

[Playwright config](../../playwright.stack.config.ts) · [Test fixture configuration](../../e2e-stack/support.ts)

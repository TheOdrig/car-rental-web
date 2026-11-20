# Environment variables

Copy [the example environment file](../../.env.example) to `.env.local` for local development and set `JWT_SECRET` to the signing secret used by your local API. The [server schema](../../src/shared/server/env.ts) parses these settings on first use and caches the parsed result. Invalid settings raise an `Invalid server environment` error.

## Server settings

| Variable | Default and validation | Purpose |
| --- | --- | --- |
| `API_URL` | Required in production. Otherwise `http://localhost:8082`. Must be a URL. Trailing slashes are removed. | Base URL for the upstream API |
| `JWT_SECRET` | Required, at least 32 characters | Verifies HS256 access tokens and must match the API's signing secret |
| `API_TIMEOUT_MS` | `5000`, positive integer | Timeout in milliseconds for an upstream request |
| `TRUSTED_PROXY_HOPS` | `0`, integer from 0 to 10 | Selects an entry from the right of `X-Forwarded-For` when positive. Also enables forwarded-host trust for the mutation guard. |
| `TRUSTED_CLIENT_IP_HEADER` | Unset. Letters, digits and hyphens. | Name of an edge-controlled header containing the client address |
| `STRIPE_PUBLISHABLE_KEY` | Unset. Must be a test-mode publishable key accepted by the server schema. | Fallback key passed from the pay page to its client component |
| `NODE_ENV` | Schema default `development`. Also accepts `test` and `production`. | Production requires `API_URL` and enables secure cookies and HSTS. |

Empty server settings other than `NODE_ENV` are treated as unset by the parser. The optional forwarding and Stripe settings also trim surrounding whitespace.

## Build-time setting

`NEXT_PUBLIC_APP_URL` sets the public base URL used in [app metadata](../../src/app/layout.tsx). It defaults to `http://localhost:3000` and is inlined at build time. Set the [Docker build argument](../../Dockerfile) of the same name before building an image.

## Forwarding and Stripe

The [client IP resolver](../../src/shared/server/client-ip.ts) uses a valid address from the configured trusted header first. It otherwise uses the Nth entry from the right of `X-Forwarded-For` when the hop count is N and that entry is valid. The web forwards `X-Client-IP` only when it resolves a trusted address. See [container deployment](DEPLOYMENT.md) for the proxy trust boundary.

The [pay page](../../src/app/%28protected%29/rentals/%5Bid%5D/pay/page.tsx) passes the configured fallback publishable key to the client UI. The [Stripe client](../../src/features/pay-rental/lib/stripe-client.ts) uses it only when the API key is absent or null. If the selected key fails the browser's `pk_test_` prefix check, the pay page blocks the card form. This portfolio uses Stripe test mode.

For settings specific to Playwright, see [stack end-to-end tests](../testing/E2E_STACK.md).

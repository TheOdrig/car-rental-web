# ADR-011 · Backend for frontend and token handling

**Status** Accepted

Browser application requests go to same-origin [Next.js route handlers](../../src/app/api). The backend for frontend (BFF) owns upstream URL resolution, token attachment, response adaptation and error translation. Server-rendered data can call the upstream client directly.

## Why this boundary exists

Access and refresh tokens live in [HttpOnly cookies](../../src/shared/server/auth-cookies.ts), with `Secure` in production and `SameSite=Lax`. Server checks verify the [HS256 access token and its claims](../../src/shared/server/session.ts). Concurrent refresh attempts in a server process [share work by a hash of the refresh token](../../src/shared/server/upstream.ts), with a short window for reuse. See [authentication flow](../security/AUTHENTICATION_FLOW.md) for when refresh happens.

The [route wrapper](../../src/shared/server/route.ts) guards POST, PUT, PATCH and DELETE with origin checks. Its media-type check applies to POST, PUT and PATCH, with explicit overrides for handlers such as uploads. The API remains responsible for authorizing its operations.

## Contract and cost

The BFF adds a server hop and gives the browser a stable local interface. The browser and upstream endpoints are maintained in separate registries, and the web derives upstream types from the [OpenAPI snapshot](../../contract/openapi.json).

[`contract:check`](../../scripts/contract.mjs) compares the generated types with the snapshot and compares the upstream spec when one is available. Separate [Vitest contract assertions](../testing/TEST_STRATEGY.md#what-the-tests-cover) check the registries, response assumptions, errors and enums.

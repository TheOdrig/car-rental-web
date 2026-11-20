# API client and BFF

Browser application requests use same-origin paths from [`ENDPOINTS`](../../src/shared/api/endpoints.ts). Next.js route handlers call the Car Rental API with server configuration and use a separate [upstream endpoint registry](../../src/shared/server/upstream-endpoints.ts) for method and path templates. Server-rendered car detail data uses the upstream client directly.

## Contract and endpoint changes

The checked-in [OpenAPI snapshot](../../contract/openapi.json) generates [TypeScript types](../../src/shared/api/generated/openapi.ts). Domain types can derive from [`Schemas`](../../src/shared/api/contract.ts). Run `npm run contract:sync` to import the sibling API spec, when present, and regenerate types. The script also accepts a spec path through `CAR_RENTAL_API_SPEC`. `npm run contract:check` compares generated types to a fresh generation and compares the upstream spec only when its file exists. [Contract script](../../scripts/contract.mjs)

1. Confirm the operation in the snapshot and use a typed upstream registry entry, such as `API.rentals.byId.resolve({ id: 42 })`.
2. Use `proxy(config)` for a pass-through handler. It can forward query parameters, select how to read the body or adapt a response. Use `route(handler, options)` for custom logic.
3. Add or reuse a browser path in `ENDPOINTS` and call it from the owning slice's `api/` segment.
4. Run `npm test` for the [BFF contract assertions](../../src/app/api/__tests__) and [upstream contract assertions](../../src/shared/server/__tests__/upstream-contract.test.ts).

## Requests and cache boundaries

[`clientFetch`](../../src/shared/api/client.ts) sends cookies, serializes JSON bodies, accepts `FormData` and can pass an abort signal. For a 401 outside the login, refresh and session endpoints, callers share a refresh request and retry once if it succeeds. Failed refresh or a second 401 invokes the session-expired handler. Non-success responses throw `ApiError`, and 204 returns `undefined`.

The [upstream client](../../src/shared/server/upstream.ts) attaches the available bearer token for authenticated requests and forwards `X-Client-IP` when an address is resolved. It can renew the token when absent or after a 401 and retry after renewal. An upstream timeout becomes 504. The [route wrapper](../../src/shared/server/route.ts) applies host checks to guarded POST, PUT, PATCH and DELETE requests. On guarded POST, PUT and PATCH it also enforces the allowed media types, with JSON as the default. An unreachable upstream can become a 503 problem response.

Browser data uses TanStack Query key factories and named stale times, as in [the car hooks](../../src/entities/car/api/use-cars.ts). The generic BFF proxy uses `cache: 'no-store'` for its upstream request, and the wrapper defaults responses to `private, no-store`. On the server-rendered car detail page, [React `cache()` fetchers](../../src/entities/car/api/cached-fetchers.ts) memoize equivalent calls during a render request, allowing metadata and the page to reuse the car fetch. The browser query cache has its own lifetime.

## Problem details and form errors

[`ApiError`](../../src/shared/api/error.ts) exposes the status, machine-readable code, field problems, trace ID and numeric `Retry-After` seconds when supplied. The BFF wrapper returns failures as `application/problem+json`. Match known cases by code, and use the trace ID to correlate a failure when it is available.

The [profile settings page](../../src/app/%28protected%29/settings/profile/profile-settings-content.tsx) passes `fieldErrorMap(updateProfile.error)` into the form. The [profile form](../../src/features/user-settings/ui/personal-details-form.tsx) marks invalid controls and links them to their messages through `aria-describedby`. The shared [FormField](../../src/shared/ui/form-field.tsx) provides the same message association for forms that use it. Client constraints can use a Zod schema, as in [login and registration](../../src/features/auth/model/types.ts). Checkout uses component state for [notes and submission errors](../../src/features/book-car/ui/checkout/checkout-form.tsx).

History — This guide incorporates the current caching and form-error decisions from ADR-007 and ADR-009.

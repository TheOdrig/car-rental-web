# Authentication flow

The BFF exchanges credentials with the Car Rental API and stores the access and refresh tokens in server-set cookies. Browser application code uses the session response to display signed-in state.

## Sign in and read the session

The [login](../../src/app/api/auth/login/route.ts) and [register](../../src/app/api/auth/register/route.ts) handlers use the server sign-in helper. [Cookie settings](../../src/shared/server/auth-cookies.ts) use `HttpOnly`, `SameSite=Lax`, path `/` and `Secure` in production. The access cookie uses the API's positive `expiresIn` in seconds, rounded down, with a 900-second fallback. The refresh cookie lasts seven days.

[Access token verification](../../src/shared/server/session.ts) checks the HS256 signature and expiry and validates the claims, including `token_use=access`, subject, user ID and roles. [`GET /api/auth/me`](../../src/app/api/auth/me/route.ts) returns the verified session fields and can attempt renewal. Without a valid session it returns 401, or HTTP 200 with JSON `null` for `?optional=true`. The [auth hooks](../../src/features/auth/api/use-auth.ts) use the optional form.

## Refresh and sign out

The proxy can renew a session for protected and admin paths. An authenticated upstream request can renew when its access cookie is absent or after an upstream 401. A browser 401 can also trigger [`POST /api/auth/refresh`](../../src/app/api/auth/refresh/route.ts) through the [browser client](../../src/shared/api/client.ts).

The [server refresh helper](../../src/shared/server/upstream.ts) shares one in-flight promise per hashed refresh token in the process. A success or rejection is retained for ten seconds after completion. Rate limits and unavailable outcomes are discarded. The explicit refresh route clears cookies on rejection and returns 401, preserves cookies on 429 or 503, and stores new cookies on success. A 429 can include `Retry-After`.

The [logout handler](../../src/app/api/auth/logout/route.ts) evicts the refresh entry, attempts upstream logout when a token is present and clears local cookies even if the upstream call fails. [ADR-010](../adr/ADR-010-session-state-and-event-bus.md) describes browser cache ownership.

## OAuth

The [OAuth start handler](../../src/app/api/auth/oauth/%5Bprovider%5D/route.ts) supports Google and GitHub. It requests an authorization redirect from the API, requires HTTPS and a state parameter, and stores the state and an optional sanitized return path in short-lived cookies. The [callback handler](../../src/app/api/auth/callback/%5Bprovider%5D/route.ts) checks the returned state using the [constant-time comparison helper](../../src/app/api/auth/_lib/oauth-state.ts), sends the code and state to the API and stores the validated tokens. It clears the temporary cookies and redirects to the sanitized return path or a login error. Live provider registration is unverified.

## State-changing request guards

The [route wrapper](../../src/shared/server/route.ts) compares the `Origin` host with the request host for POST, PUT, PATCH and DELETE. It considers `X-Forwarded-Host` only when `TRUSTED_PROXY_HOPS` is positive. If `Origin` is absent, a supplied `Sec-Fetch-Site` must be `same-origin` or `none`. A failed check returns a 403 problem response.

On POST, PUT and PATCH, the wrapper additionally rejects an unsupported media type with 415. JSON is the default, and handlers can specify another type for uploads. See the [route guard tests](../../src/shared/server/__tests__/route.test.ts), [session tests](../../src/app/api/__tests__/auth-me.test.ts) and [OAuth flow tests](../../src/app/api/auth/_lib/__tests__/oauth-flow.test.ts).

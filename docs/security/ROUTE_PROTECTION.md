# Route protection

The [Next.js proxy](../../src/proxy.ts) classifies matched requests. The matcher skips framework static and image paths, the favicon, sitemap, robots file and paths ending in a file extension. [Route access](../../src/shared/config/route-access.ts) matches registered paths or their descendants, and defaults unmatched paths to public.

| Class | Paths | Proxy behavior |
| --- | --- | --- |
| Public | Home, catalog, search, legal pages, `/forbidden`, and ordinary `/api/*` paths | Pass through |
| Guest-only | `/login`, `/register`, `/forgot-password` | A verified session redirects to the sanitized `callbackUrl`, with `/` as fallback. Other requests pass through. |
| Auth flow | `/reset-password` | Pass through |
| Protected | `/rentals`, `/damages`, `/settings`, `/dashboard`, `/checkout`, `/booking` and their descendants | Require a session or redirect to login with the requested path and query |
| Admin | `/admin` and descendants | Require a session or redirect to login. Redirect a signed-in user without `ADMIN` to `/forbidden`. |
| Admin API | `/api/admin` and descendants | Return a 401 problem response without a session or 403 without the required role |

For protected and admin classes the proxy can renew a missing or invalid access token when a refresh cookie is present. See [authentication flow](AUTHENTICATION_FLOW.md) for refresh outcomes.

## Server checks

The [protected layout](../../src/app/%28protected%29/layout.tsx) checks the session. The [admin layout](../../src/app/%28admin%29/layout.tsx) checks the session and the `ADMIN` role. Both use server-side verification. Checkout and booking pages use the public layout group and are protected by their access classification. The [forbidden page](../../src/app/forbidden/page.tsx) displays “403”.

A public proxy classification only controls passage through the proxy. Authenticated handlers such as [my rentals](../../src/app/api/rentals/me/route.ts) still call the API with credentials when available, and the API authorizes access. The `isAdmin` value derived by [useAuth](../../src/features/auth/api/use-auth.ts) controls browser presentation.

When adding a signed-in page, register its protected prefix and extend the [route access tests](../../src/shared/config/__tests__/route-access.test.ts). Use the [proxy tests](../../src/__tests__/proxy.test.ts) and [admin route tests](../../src/app/api/__tests__/admin-routes.test.ts) for enforcement behavior.

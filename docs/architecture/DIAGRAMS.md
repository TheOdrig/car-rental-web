# Architecture diagrams

## Layers and page composition

The app composes widgets, features and entities through their public entry points. Arrows show representative dependency paths. A layer can also use lower layers directly.

```mermaid
flowchart TD
    A["App · pages and layouts"] --> W["Widgets · page sections"]
    W --> F["Features · user actions"]
    F --> E["Entities · domain queries and UI"]
    E --> S["Shared · primitives and infrastructure"]
    A --> E
```

The admin rentals page renders its widget directly. The car detail page fetches initial car and calendar data on the server and renders interactive detail UI and a booking widget. Browser queries live in the owning slice's `api/` segment. [Admin rentals page](../../src/app/%28admin%29/admin/rentals/page.tsx) · [Car detail page](../../src/app/cars/%5Bid%5D/page.tsx) · [Car query hooks](../../src/entities/car/api/use-cars.ts)

## Signed-in browser request

Ordinary `/api/*` requests take the public proxy branch. The BFF handler for `/api/rentals/me` invokes the authenticated upstream client, which reads cookies, renews when needed and attaches the access token when available.

```mermaid
sequenceDiagram
    participant B as Browser
    participant P as Next.js proxy
    participant H as Rentals route handler
    participant U as Upstream client
    participant A as Car Rental API
    B->>P: GET /api/rentals/me with cookies
    P->>H: Public branch passes through
    H->>U: Resolve rentals.me and forward query
    U->>A: GET /api/v1/rentals/me with available bearer token
    A-->>U: JSON or problem details
    U-->>H: Data or ApiError
    H-->>B: JSON or application/problem+json
```

[Route classification](../../src/shared/config/route-access.ts) · [Rentals handler](../../src/app/api/rentals/me/route.ts) · [Upstream client](../../src/shared/server/upstream.ts)

## Proxy decisions

```mermaid
flowchart TD
    M["Matched request"] --> C{"Access class"}
    C -->|"Public or auth flow"| P["Pass through"]
    C -->|"Guest-only"| G{"Valid access token?"}
    G -->|"No"| P
    G -->|"Yes"| S["Redirect to sanitized callbackUrl or /"]
    C -->|"Protected, admin or admin API"| V["Verify token and attempt refresh if needed"]
    V --> R{"Session and role"}
    R -->|"Allowed"| P
    R -->|"No session"| L["Login redirect or admin API 401"]
    R -->|"Missing admin role"| F["Forbidden page redirect or admin API 403"]
```

The proxy merges renewed cookies into the current request and sets them on its pass-through response. Concurrent server renewals share a promise by hashed refresh token, and successful or rejected results remain available for ten seconds. [Proxy](../../src/proxy.ts) · [Refresh implementation](../../src/shared/server/upstream.ts) · [Route protection](../security/ROUTE_PROTECTION.md)

## Payment confirmation

```mermaid
flowchart LR
    P["Pay page"] --> E["Payment Element with test key"]
    E --> C["Confirm payment"]
    C --> R["Resume status checks after confirmation or redirect"]
    R --> S["API status polling with capped backoff"]
    S --> T["Show outcome or offer a status refresh after timeout"]
```

The pay UI uses Stripe test mode. The client confirms with `redirect: 'if_required'` and can resume polling from a redirect return. [Payment form](../../src/features/pay-rental/ui/payment-element-form.tsx) · [Pay UI](../../src/features/pay-rental/ui/pay-rental.tsx) · [Payment polling hook](../../src/entities/payment/api/use-rental-payment.ts)

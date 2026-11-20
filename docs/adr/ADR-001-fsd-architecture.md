# ADR-001 · Feature-Sliced Design and App Router

**Status** Accepted

Car Rental Web separates page composition, user actions and domain data so a change in one flow has a defined place to live. The application uses Feature-Sliced Design with five layers under [src](../../src).

| Layer | Responsibility |
| --- | --- |
| `app` | Next.js pages, layouts, route handlers and application providers |
| `widgets` | Larger compositions, such as the admin rentals view |
| `features` | User actions, such as requesting or paying for a rental |
| `entities` | Domain types, queries and reusable views, such as cars and rentals |
| `shared` | Cross-cutting UI, configuration and client/server infrastructure |

Imports flow downward, and consumers use each slice's public API. When an entity needs to expose an explicit cross-entity dependency, it provides a narrow `@x` entry point. The [car entry for the rental entity](../../src/entities/car/%40x/rental.ts) is an example.

## Pages and layouts

The App Router owns URL segments and shared layouts. Parenthesized groups organize layouts without adding a segment to the URL. A page can compose a widget directly, as the [admin rentals page](../../src/app/%28admin%29/admin/rentals/page.tsx) does. The [car detail page](../../src/app/cars/%5Bid%5D/page.tsx) loads initial data on the server and passes it to interactive UI.

The protected and admin layouts recheck the session on the server. Access classification lives in [route-access.ts](../../src/shared/config/route-access.ts), so folder grouping and access rules can differ. See [route protection](../security/ROUTE_PROTECTION.md).

## Enforcement and tradeoff

[ESLint](../../eslint.config.mjs) checks dependency direction and private imports. The [FSD boundary tests](../../src/__tests__/architecture/fsd-boundaries.test.ts) check the structure and conventions, including entity `@x` imports. The [architecture suite](../../src/__tests__/architecture) also checks routing, server/client separation and other repository rules.

Public entry points add a small amount of explicit wiring. In return, callers depend on an intentional interface and cross-entity dependencies are visible in the source.

History — This record supersedes ADR-003 and ADR-004, whose active boundary and routing decisions were consolidated here.

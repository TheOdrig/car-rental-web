# Developer guide

Use this guide to locate the code for a change and choose a local check. The [README quick start](../README.md#quick-start) covers running the API and web app. The web app requires Node.js 22, enforced through [package.json](../package.json), [.npmrc](../.npmrc) and the [verification script](../scripts/check-node.mjs).

## Find the change

| If you are changing | Start with |
| --- | --- |
| URLs, layouts or page composition | [App Router](../src/app) and the [route registry](../src/shared/config/routes.ts) |
| A large page section | [Widgets](../src/widgets) |
| A user action | [Features](../src/features) |
| Domain queries, types or shared domain views | [Entities](../src/entities) |
| UI primitives and browser or server infrastructure | [Shared](../src/shared) |

Use slice public APIs across boundaries. Keep implementation files inside their slice and use explicit `@x` entry points for allowed entity cross-imports. [ADR-001](adr/ADR-001-fsd-architecture.md) explains the rules and enforcement.

## Add a page or API call

1. Compose the page in `src/app` and keep reusable behavior in the layer that owns it. Add signed-in paths to the [access map](../src/shared/config/route-access.ts), which classifies unmatched paths as public. See [route protection](security/ROUTE_PROTECTION.md) for layout checks.
2. For API-backed behavior, add or reuse a typed upstream target and a same-origin handler. [The API guide](api/API_CLIENT.md) shows where browser and upstream paths live. The route tree includes auth, catalog, user and rental operations, admin operations, [file delivery](../src/app/api/files/%5Bdirectory%5D/%5Bfilename%5D/route.ts), and a [catch-all](../src/app/api/%5B...path%5D/route.ts) that returns a problem response for unknown routes after applicable request guards.
3. Put browser queries and mutations in the owning slice's `api/` segment. Use its query key factory and invalidate affected data on success. Keep API-backed state in TanStack Query and component-only state local. See [ADR-010](adr/ADR-010-session-state-and-event-bus.md).
4. Extend the closest behavior or contract test. Run `npm run test:architecture` for boundary changes and `npm test` for contract assertions. [Test strategy](testing/TEST_STRATEGY.md) describes the full gate.

See the [contribution guide](../CONTRIBUTING.md) for repository conventions and how to propose a change.

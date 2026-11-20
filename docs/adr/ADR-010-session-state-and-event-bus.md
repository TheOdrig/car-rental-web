# ADR-010 · Server state, UI state and sessions

**Status** Accepted

TanStack Query owns server state in the browser, including the signed-in profile at `authKeys.me()`. [The query provider](../../src/app/providers.tsx) sets a one-minute default stale time, one query retry, no mutation retries and no default refetch on window focus. Individual queries can supply their own settings.

UI state stays with the component that owns it when possible. The [Zustand filter store](../../src/widgets/car-filters/model/store.ts) shares car filters, view mode, sort and page state within the listing UI. [The listing](../../src/app/cars/cars-listing-content.tsx) also reads and writes supported filters through the URL so the search can be shared.

## Session changes

[Auth hooks](../../src/features/auth/api/use-auth.ts) clear the query and mutation caches after successful sign-in and registration, then fetch the session. On logout or session expiry they clear the caches and write a null session. The next view loads its own data through its normal queries. The [logout handler](../../src/app/api/auth/logout/route.ts) also evicts the server's refresh-sharing entry and clears the cookies.

The cache reset prevents data tied to the previous identity from being reused through existing query entries. The cost is a fresh fetch when a new view needs that data. [Auth hook tests](../../src/features/auth/api/__tests__/use-auth.test.tsx) cover the session transitions.

History — This record supersedes ADR-002, retaining its server/UI state split after the separate auth store and event bus were retired.

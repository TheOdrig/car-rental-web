# ADR-004: Next.js App Router + FSD Integration

**Status:** Accepted  
**Date:** 2026-02-01  
**Decider:** Mehmet Akif Uludag

---

## Context

Next.js 13+ introduced the App Router as a replacement for the Pages Router. We needed to decide which router to use and how to integrate it with Feature-Sliced Design (FSD) architecture.

**Key Considerations:**
- App Router vs Pages Router trade-offs
- Server Components vs Client Components strategy
- Route organization with FSD layers
- Layout composition and nesting
- Streaming and Suspense support

---

## Decision

We will use **Next.js App Router** with **route groups** to organize pages by access level, integrating seamlessly with FSD architecture.

**Key Decisions:**
1. Use App Router (not Pages Router)
2. Organize routes with route groups: `(public)`, `(auth)`, `(protected)`, `(admin)`
3. Default to Server Components, use Client Components only when needed
4. Leverage nested layouts for shared UI and protection
5. Use streaming and Suspense for progressive rendering

---

## Rationale

### Why App Router Over Pages Router?

**App Router Benefits:**
- **Server Components:** Default server rendering, better performance
- **Nested Layouts:** Shared UI without prop drilling
- **Streaming:** Progressive rendering with Suspense
- **Colocation:** Components, tests, and styles in same directory
- **Future-Proof:** Next.js is investing in App Router, Pages Router is legacy

**Pages Router Limitations:**
- All components are Client Components (more JavaScript)
- No nested layouts (must use `_app.tsx` for shared UI)
- No streaming support
- Less flexible file organization

### Route Groups Integration with FSD

**Route Groups:**
```
app/
├── (public)/      # Public routes (anyone)
├── (auth)/        # Auth routes (login, register)
├── (protected)/   # User routes (authenticated)
└── (admin)/       # Admin routes (ADMIN role)
```

**FSD Alignment:**
- Route groups organize **pages** (FSD app layer)
- Pages compose **widgets** and **features** (FSD composition)
- Layouts handle **protection** and **shared UI**

**Example:**
```typescript
// app/(protected)/dashboard/page.tsx
import { Dashboard } from '@/widgets/rental-dashboard';
import { RentalStats } from '@/features/manage-rentals';

export default function DashboardPage() {
  return (
    <div>
      <RentalStats />
      <Dashboard />
    </div>
  );
}
```

### Server Components vs Client Components

**Default Strategy:** Server Components

**Use Server Components for:**
- Data fetching (async/await)
- Static content
- SEO-critical pages
- Layouts and page shells

**Use Client Components for:**
- Interactivity (onClick, onChange)
- React hooks (useState, useEffect)
- Browser APIs (localStorage, window)
- Third-party libraries requiring client-side

**Example:**
```typescript
// Server Component (default)
export default async function CarsPage() {
  const cars = await fetchCars();  // Server-side fetch
  return <CarList cars={cars} />;
}

// Client Component (explicit)
'use client';
export function CarFilters() {
  const [filters, setFilters] = useState({});  // Client-side state
  return <FilterPanel filters={filters} />;
}
```

### Nested Layouts

**Layout Hierarchy:**
```
app/layout.tsx                    # Root layout (all pages)
├── (public)/layout.tsx           # Public layout
├── (auth)/layout.tsx             # Auth layout (split screen)
├── (protected)/layout.tsx        # Protected layout (auth check)
└── (admin)/layout.tsx            # Admin layout (role check + sidebar)
```

**Benefits:**
- **Shared UI:** Header, footer, sidebar shared across routes
- **Protection:** Layouts handle authentication/authorization
- **Composition:** Nested layouts compose naturally
- **Performance:** Layouts don't re-render on navigation

**Example:**
```typescript
// app/(admin)/layout.tsx
export default async function AdminLayout({ children }) {
  const user = await getCurrentUser();
  
  if (!isAdmin(user)) {
    redirect('/forbidden');
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main>{children}</main>
    </div>
  );
}
```

### Streaming and Suspense

**Progressive Rendering:**
```typescript
// app/dashboard/page.tsx
import { Suspense } from 'react';

export default function DashboardPage() {
  return (
    <div>
      <Suspense fallback={<StatsSkeleton />}>
        <DashboardStats />  {/* Async component */}
      </Suspense>
      
      <Suspense fallback={<RentalsSkeleton />}>
        <RecentRentals />  {/* Async component */}
      </Suspense>
    </div>
  );
}
```

**Benefits:**
- **Faster Initial Load:** Show UI immediately, stream data
- **Better UX:** Progressive loading, no blank screens
- **Parallel Fetching:** Multiple Suspense boundaries fetch in parallel

---

## Consequences

### Positive

✅ **Better Performance**
- Server Components reduce JavaScript bundle size
- Streaming improves perceived performance
- Parallel data fetching with Suspense

✅ **Better Developer Experience**
- Colocation of components, tests, and styles
- Nested layouts simplify shared UI
- Server-side data fetching is simpler (async/await)

✅ **Better SEO**
- Server-rendered content is crawlable
- Faster initial page load
- Better Core Web Vitals

✅ **FSD Integration**
- Route groups align with FSD app layer
- Pages compose widgets and features naturally
- Layouts handle cross-cutting concerns (auth, layout)

### Negative

❌ **Learning Curve**
- App Router is newer, less documentation
- Server vs Client Components requires understanding
- Streaming and Suspense add complexity

❌ **Migration Effort**
- Existing Pages Router apps require migration
- Some libraries don't support Server Components yet
- Must understand when to use 'use client'

❌ **Debugging Complexity**
- Server/Client boundary can be confusing
- Streaming errors are harder to debug
- Hydration mismatches require careful handling

### Mitigation

**Learning Curve:**
- Provide FSD + App Router guide (this ADR + FSD_GUIDE.md)
- Document Server vs Client Component decision tree
- Code examples for common patterns

**Migration:**
- Start new features with App Router
- Gradually migrate existing pages
- Use incremental adoption strategy

**Debugging:**
- Use React DevTools for component tree
- Enable verbose error messages in development
- Document common pitfalls and solutions

---

## Alternatives Considered

### Alternative 1: Pages Router

**Pros:**
- More mature, better documentation
- Simpler mental model (all Client Components)
- More third-party library support

**Cons:**
- No Server Components (larger bundles)
- No nested layouts (prop drilling)
- No streaming support
- Legacy approach (Next.js moving away)

**Decision:** Rejected - App Router is the future, better performance

### Alternative 2: App Router Without Route Groups

**Pros:**
- Simpler file structure
- No extra directories

**Cons:**
- No clear organization by access level
- Harder to apply layout-based protection
- Less clear separation of concerns

**Decision:** Rejected - Route groups provide clear organization

### Alternative 3: Remix or SvelteKit

**Pros:**
- Similar features (nested routes, server-side)
- Different trade-offs

**Cons:**
- Smaller ecosystem than Next.js
- Less TypeScript support
- Team unfamiliar with these frameworks

**Decision:** Rejected - Next.js has best ecosystem and team expertise

---

## Implementation Notes

### Route Group Naming

Use parentheses for route groups (Next.js convention):
- `(public)` - Public routes
- `(auth)` - Authentication routes
- `(protected)` - Protected routes
- `(admin)` - Admin routes

### Server Component Guidelines

**Default to Server Components:**
```typescript
// No 'use client' directive = Server Component
export default async function Page() {
  const data = await fetchData();
  return <div>{data}</div>;
}
```

**Use Client Components when needed:**
```typescript
'use client';  // Explicit directive

export function InteractiveComponent() {
  const [state, setState] = useState();
  return <button onClick={() => setState(...)}>Click</button>;
}
```

### Layout Protection Pattern

```typescript
// app/(protected)/layout.tsx
export default async function ProtectedLayout({ children }) {
  const token = await getAccessToken();
  
  if (!token) {
    redirect('/login');
  }

  return <>{children}</>;
}
```

---

## References

- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [Server Components RFC](https://github.com/reactjs/rfcs/blob/main/text/0188-server-components.md)
- [FSD Official Documentation](https://feature-sliced.design/)
- [ADR-001: FSD Architecture](ADR-001-fsd-architecture.md)

---

**Related ADRs:**
- [ADR-001: FSD Architecture](ADR-001-fsd-architecture.md)
- [ADR-007: Data Fetching Strategy](ADR-007-data-fetching.md)

**Last Updated:** 2026-02-01  
**Maintainer:** Mehmet Akif Uludag

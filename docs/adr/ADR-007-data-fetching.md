# ADR-007: Data Fetching Strategy

**Status:** Accepted  
**Date:** 2026-02-01  
**Decider:** Mehmet Akif Uludag

---

## Context

We needed to define a data fetching strategy that works with Next.js App Router, supports both server-side and client-side fetching, handles caching, and provides a good developer experience.

**Key Considerations:**
- Server Components vs Client Components data fetching
- Caching and revalidation
- Request deduplication
- Error handling
- Loading states
- Type safety

---

## Decision

We will use **Server-side fetching with React cache()** for Server Components and **TanStack Query** for Client Components, with **request deduplication** and **caching strategies**.

**Key Decisions:**
1. Use `fetch()` with React `cache()` for Server Components
2. Use TanStack Query for Client Components
3. Implement request deduplication
4. Use Next.js caching (`cacheLife`, `cacheTag`)
5. Handle errors with Error Boundaries

---

## Rationale

### Server-Side Fetching (Server Components)

**React cache() for Deduplication:**
```typescript
// src/entities/car/api/cached-fetchers.ts
import { cache } from 'react';

export const getCars = cache(async () => {
  const response = await fetch(`${process.env.API_URL}/api/cars`);
  return response.json();
});

export const getCar = cache(async (id: number) => {
  const response = await fetch(`${process.env.API_URL}/api/cars/${id}`);
  return response.json();
});
```

**Usage in Server Component:**
```typescript
// app/(public)/cars/page.tsx
import { getCars } from '@/entities/car/api/cached-fetchers';

export default async function CarsPage() {
  const cars = await getCars();  // Deduplicated across components
  
  return <CarList cars={cars} />;
}
```

**Benefits:**
- **Automatic Deduplication:** Multiple calls to `getCars()` in same render only fetch once
- **Type Safety:** TypeScript infers return types
- **Simple API:** Just async/await
- **Server-Side:** No client-side JavaScript needed

### Client-Side Fetching (Client Components)

**TanStack Query for State Management:**
```typescript
// src/entities/car/lib/use-cars.ts
import { useQuery } from '@tanstack/react-query';
import { getCarsApi } from '../api/car-api';

export const carKeys = {
  all: ['cars'] as const,
  lists: () => [...carKeys.all, 'list'] as const,
  list: (filters: CarFilters) => [...carKeys.lists(), filters] as const,
  details: () => [...carKeys.all, 'detail'] as const,
  detail: (id: number) => [...carKeys.details(), id] as const,
};

export function useCars(filters?: CarFilters) {
  return useQuery({
    queryKey: carKeys.list(filters || {}),
    queryFn: () => getCarsApi(filters),
    staleTime: 5 * 60 * 1000,  // 5 minutes
  });
}

export function useCar(id: number) {
  return useQuery({
    queryKey: carKeys.detail(id),
    queryFn: () => getCarApi(id),
    staleTime: 10 * 60 * 1000,  // 10 minutes
  });
}
```

**Usage in Client Component:**
```typescript
'use client';

import { useCars } from '@/entities/car';

export function CarFilters() {
  const { data: cars, isLoading, error } = useCars();
  
  if (isLoading) return <Skeleton />;
  if (error) return <Error error={error} />;
  
  return <FilterPanel cars={cars} />;
}
```

**Benefits:**
- **Caching:** Automatic caching with configurable stale time
- **Deduplication:** Multiple components using same query share data
- **Loading States:** Built-in loading, error, success states
- **Refetching:** Automatic refetch on window focus, network reconnect
- **Optimistic Updates:** Easy to implement optimistic UI
- **DevTools:** Excellent debugging with React Query DevTools

### Request Deduplication

**Server-Side (React cache()):**
```typescript
// Multiple calls in same render
const cars1 = await getCars();  // Fetches
const cars2 = await getCars();  // Returns cached result
const cars3 = await getCars();  // Returns cached result
```

**Client-Side (TanStack Query):**
```typescript
// Multiple components using same query
function Component1() {
  const { data } = useCars();  // Fetches
}

function Component2() {
  const { data } = useCars();  // Returns cached result
}
```

### Caching Strategies

**Next.js cacheLife (Server Components):**
```typescript
import { unstable_cacheLife as cacheLife } from 'next/cache';

export async function getCars() {
  'use cache';
  cacheLife('minutes');  // Cache for minutes
  
  const response = await fetch(`${process.env.API_URL}/api/cars`);
  return response.json();
}
```

**Next.js cacheTag (Revalidation):**
```typescript
import { unstable_cacheTag as cacheTag } from 'next/cache';
import { revalidateTag } from 'next/cache';

export async function getCars() {
  'use cache';
  cacheTag('cars');  // Tag for revalidation
  
  const response = await fetch(`${process.env.API_URL}/api/cars`);
  return response.json();
}

// Revalidate after mutation
export async function createCar(data: CreateCarRequest) {
  const response = await fetch(`${process.env.API_URL}/api/cars`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  
  revalidateTag('cars');  // Revalidate all 'cars' queries
  return response.json();
}
```

**TanStack Query (Client Components):**
```typescript
export function useCars() {
  return useQuery({
    queryKey: carKeys.all,
    queryFn: getCarsApi,
    staleTime: 5 * 60 * 1000,  // Consider fresh for 5 minutes
    gcTime: 10 * 60 * 1000,    // Keep in cache for 10 minutes
  });
}
```

### Error Handling

**Server Components (Error Boundaries):**
```typescript
// app/(public)/cars/error.tsx
'use client';

export default function CarsError({ error, reset }) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <p>{error.message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

**Client Components (TanStack Query):**
```typescript
export function CarList() {
  const { data, error, isLoading } = useCars();
  
  if (isLoading) return <Skeleton />;
  if (error) return <ErrorMessage error={error} />;
  
  return <div>{/* Render cars */}</div>;
}
```

---

## Consequences

### Positive

✅ **Server-Side Performance**
- Server Components fetch data on server (no client-side JavaScript)
- Automatic deduplication with React cache()
- SEO-friendly (data in initial HTML)

✅ **Client-Side Experience**
- TanStack Query provides excellent UX (loading, error, success states)
- Automatic caching and refetching
- Optimistic updates for better perceived performance

✅ **Type Safety**
- TypeScript infers types from API functions
- Query keys are type-safe
- No manual type casting

✅ **Developer Experience**
- Simple async/await for Server Components
- Declarative hooks for Client Components
- Excellent DevTools for debugging

### Negative

❌ **Complexity**
- Two different fetching strategies (server vs client)
- Must understand when to use each
- Caching strategies can be confusing

❌ **Bundle Size**
- TanStack Query adds ~13KB to bundle
- More JavaScript for Client Components

❌ **Learning Curve**
- Must learn TanStack Query API
- Must understand React cache()
- Must understand Next.js caching

### Mitigation

**Complexity:**
- Document decision tree (when to use server vs client)
- Provide examples for common patterns
- Create reusable hooks

**Bundle Size:**
- Only use TanStack Query for Client Components
- Use Server Components for static data
- Code split Client Components

**Learning Curve:**
- Provide training and documentation
- Code examples in DEVELOPER_GUIDE.md
- Pair programming for complex cases

---

## Alternatives Considered

### Alternative 1: SWR

**Pros:**
- Smaller bundle size (~5KB)
- Simpler API
- Good caching

**Cons:**
- Less features than TanStack Query
- Weaker DevTools
- Smaller community

**Decision:** Rejected - TanStack Query has better features and DevTools

### Alternative 2: Apollo Client

**Pros:**
- GraphQL support
- Excellent caching
- Normalized cache

**Cons:**
- GraphQL only (we use REST)
- Large bundle size (~30KB)
- Overkill for REST APIs

**Decision:** Rejected - We use REST, not GraphQL

### Alternative 3: Fetch Only (No Library)

**Pros:**
- No dependencies
- Full control
- Smallest bundle

**Cons:**
- Must implement caching manually
- Must implement loading states manually
- Must implement error handling manually
- Reinventing the wheel

**Decision:** Rejected - Too much manual work

---

## Implementation Notes

### Server Component Pattern

```typescript
// app/(public)/cars/page.tsx
import { getCars } from '@/entities/car/api/cached-fetchers';

export default async function CarsPage() {
  const cars = await getCars();
  
  return <CarList cars={cars} />;
}
```

### Client Component Pattern

```typescript
'use client';

import { useCars } from '@/entities/car';

export function CarFilters() {
  const { data, isLoading, error } = useCars();
  
  if (isLoading) return <Skeleton />;
  if (error) return <Error />;
  
  return <FilterPanel cars={data} />;
}
```

### Mutation Pattern

```typescript
export function useCreateCar() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createCarApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: carKeys.all });
    },
  });
}
```

### Query Key Pattern

```typescript
export const carKeys = {
  all: ['cars'] as const,
  lists: () => [...carKeys.all, 'list'] as const,
  list: (filters: CarFilters) => [...carKeys.lists(), filters] as const,
  details: () => [...carKeys.all, 'detail'] as const,
  detail: (id: number) => [...carKeys.details(), id] as const,
};
```

---

## References

- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [React cache() Documentation](https://react.dev/reference/react/cache)
- [Next.js Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching)
- [Next.js Caching](https://nextjs.org/docs/app/building-your-application/caching)

---

**Related ADRs:**
- [ADR-004: Next.js App Router](ADR-004-nextjs-app-router.md)

**Last Updated:** 2026-02-01  
**Maintainer:** Mehmet Akif Uludag

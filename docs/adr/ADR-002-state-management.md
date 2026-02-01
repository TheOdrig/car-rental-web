# ADR-002: State Management Strategy

**Status:** Accepted  
**Date:** 2026-02-01  
**Decider:** Mehmet Akif Uludag  
**Related:** Backend ADR-003 (Event-Driven Communication)

## Context

The Car Rental Web frontend required a state management solution that could handle both server state (API data) and client state (UI state) while maintaining feature isolation and enabling event-driven communication between features.

### Problem Statement

1. **Server State vs Client State:** Need separate solutions for API data caching and UI state management
2. **Feature Isolation:** Features cannot import from each other, requiring event-driven communication
3. **Type Safety:** State management must be TypeScript-first with strong type inference
4. **Developer Experience:** Minimal boilerplate, good devtools, easy to learn
5. **Backend Alignment:** Match backend's event-driven architecture (@ApplicationEventPublisher)

### Alternatives Considered

#### Alternative 1: Redux + RTK Query
- **Pros:** Industry standard, mature ecosystem, Redux DevTools
- **Cons:** Excessive boilerplate, complex setup, not TypeScript-first, overkill for this project
- **Verdict:** Rejected - too much complexity for the benefits

#### Alternative 2: Zustand + SWR
- **Pros:** Simple, lightweight, good TypeScript support
- **Cons:** SWR has weaker devtools than TanStack Query, smaller community
- **Verdict:** Rejected - TanStack Query has better devtools and features

#### Alternative 3: Zustand + TanStack Query
- **Pros:** Minimal boilerplate, TypeScript-first, excellent devtools, large community, perfect separation of concerns
- **Cons:** Two libraries instead of one (acceptable trade-off)
- **Verdict:** **Accepted** - best balance of simplicity, features, and developer experience

## Decision

We will use **Zustand** for client state and **TanStack Query** for server state.

### State Management Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Application State                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────┐      ┌──────────────────────┐    │
│  │   Server State       │      │   Client State       │    │
│  │  (TanStack Query)    │      │     (Zustand)        │    │
│  ├──────────────────────┤      ├──────────────────────┤    │
│  │ • API data caching   │      │ • UI state           │    │
│  │ • Automatic refetch  │      │ • Form state         │    │
│  │ • Optimistic updates │      │ • Filter state       │    │
│  │ • Background sync    │      │ • Modal state        │    │
│  └──────────────────────┘      └──────────────────────┘    │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           Event Bus (Cross-Feature Communication)     │   │
│  │  • LOGIN_SUCCESS, LOGOUT, BOOKING_CREATED, etc.      │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Zustand (Client State)

**Purpose:** Manage UI state, form state, and feature-specific client state.

**Usage Pattern:**

```typescript
// entities/user/model/auth-store.ts
import { create } from 'zustand';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: (user) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));

// Usage in components
const { user, login, logout } = useAuthStore();
```

**Why Zustand over Redux:**
1. **Minimal boilerplate:** No actions, reducers, or providers
2. **TypeScript-first:** Excellent type inference
3. **Simple API:** `create()` and done
4. **No context provider:** Works anywhere
5. **Small bundle:** ~1KB vs Redux ~10KB

### TanStack Query (Server State)

**Purpose:** Manage API data, caching, refetching, and optimistic updates.

**Usage Pattern:**

```typescript
// features/book-car/api/use-available-cars.ts
import { useQuery } from '@tanstack/react-query';
import { getAvailableCars } from './get-available-cars';

export function useAvailableCars(filters: AvailabilityFilters) {
  return useQuery({
    queryKey: ['cars', 'available', filters],
    queryFn: () => getAvailableCars(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Usage in components
const { data: cars, isLoading, error } = useAvailableCars(filters);
```

**Why TanStack Query over SWR:**
1. **Better devtools:** TanStack Query DevTools are superior
2. **More features:** Infinite queries, prefetching, optimistic updates
3. **Larger community:** More resources, examples, and support
4. **Better TypeScript:** Stronger type inference
5. **Mutation support:** Built-in mutation handling with invalidation

### Event Bus (Cross-Feature Communication)

**Purpose:** Enable features to communicate without direct imports (feature isolation).

**Implementation:**

```typescript
// shared/lib/event-bus.ts
type EventMap = {
  LOGIN_SUCCESS: { userId: string };
  LOGOUT: void;
  BOOKING_CREATED: { rentalId: string };
  RENTAL_APPROVED: { rentalId: string };
  RENTAL_REJECTED: { rentalId: string; reason: string };
};

class EventBus {
  private listeners = new Map<keyof EventMap, Set<Function>>();

  emit<K extends keyof EventMap>(event: K, data: EventMap[K]) {
    this.listeners.get(event)?.forEach((fn) => fn(data));
  }

  on<K extends keyof EventMap>(event: K, fn: (data: EventMap[K]) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(fn);
    return () => this.listeners.get(event)?.delete(fn);
  }
}

export const eventBus = new EventBus();
```

**Usage:**

```typescript
// features/auth/lib/use-login.ts
import { eventBus } from '@/shared/lib/event-bus';

export function useLogin() {
  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      useAuthStore.getState().login(data.user);
      eventBus.emit('LOGIN_SUCCESS', { userId: data.user.id });
    },
  });
  return mutation;
}

// features/book-car/lib/use-booking-listener.ts
import { eventBus } from '@/shared/lib/event-bus';

useEffect(() => {
  const unsubscribe = eventBus.on('LOGIN_SUCCESS', ({ userId }) => {
    // Refetch user's bookings
    queryClient.invalidateQueries(['bookings', userId]);
  });
  return unsubscribe;
}, []);
```

### State Location Strategy

| State Type | Location | Example |
|------------|----------|---------|
| **Domain State** | `entities/{entity}/model/` | `entities/user/model/auth-store.ts` |
| **Feature State** | `features/{feature}/model/` | `features/book-car/model/booking-store.ts` |
| **Widget State** | `widgets/{widget}/model/` | `widgets/car-filters/model/filter-store.ts` |
| **Server State** | `features/{feature}/api/` | `features/book-car/api/use-available-cars.ts` |

## Backend Alignment

### Spring @ApplicationEventPublisher vs Event Bus

| Aspect | Backend (Spring) | Frontend (Event Bus) | Alignment |
|--------|------------------|----------------------|-----------|
| **Event Publishing** | `@ApplicationEventPublisher` | `eventBus.emit()` | ✅ Equivalent |
| **Event Listening** | `@EventListener` | `eventBus.on()` | ✅ Equivalent |
| **Type Safety** | Java generics | TypeScript EventMap | ✅ Equivalent |
| **Async Delivery** | `@Async` support | Synchronous (browser limitation) | ⚠️ Different |
| **Transaction Support** | `@TransactionalEventListener` | N/A (no transactions) | ❌ Not applicable |

**Parity:** Event-driven communication pattern is equivalent, but frontend is synchronous due to browser constraints.

### State Management Comparison

| Aspect | Backend | Frontend | Alignment |
|--------|---------|----------|-----------|
| **Domain State** | JPA entities | Zustand stores | ✅ Equivalent |
| **Caching** | Hibernate L2 cache | TanStack Query | ✅ Equivalent |
| **Invalidation** | Manual cache eviction | `queryClient.invalidateQueries()` | ✅ Equivalent |
| **Optimistic Updates** | N/A (server-side) | TanStack Query mutations | ✅ Frontend-specific |

## Consequences

### Positive

1. **Clear separation:** Server state (TanStack Query) vs Client state (Zustand)
2. **Feature isolation:** Event bus enables communication without imports
3. **Type safety:** TypeScript-first with strong inference
4. **Developer experience:** Minimal boilerplate, excellent devtools
5. **Backend alignment:** Event-driven pattern matches @ApplicationEventPublisher
6. **Performance:** Automatic caching, deduplication, background refetching

### Negative

1. **Two libraries:** Zustand + TanStack Query (vs single Redux solution)
2. **Synchronous events:** Browser limitation (vs backend async events)
3. **Learning curve:** Developers must learn both libraries
4. **Event bus overhead:** Manual event definition and subscription management

### Neutral

1. **No global store:** Each feature/entity has its own store (intentional for isolation)
2. **No Redux DevTools:** TanStack Query DevTools + Zustand DevTools instead (acceptable)

## Implementation

### Current Status (2026-02-01)

**Zustand Stores:**
- `entities/user/model/auth-store.ts` - Authentication state
- `widgets/car-filters/model/filter-store.ts` - Filter state

**TanStack Query Hooks:**
- `features/auth/api/use-login.ts` - Login mutation
- `features/book-car/api/use-available-cars.ts` - Available cars query
- `features/manage-rentals/api/use-rentals.ts` - Rentals query
- `entities/car/api/use-car.ts` - Car detail query
- `entities/currency/api/use-exchange-rate.ts` - Exchange rate query

**Event Bus:**
- `shared/lib/event-bus.ts` - Event bus implementation
- Events: `LOGIN_SUCCESS`, `LOGOUT`, `BOOKING_CREATED`, `RENTAL_APPROVED`, `RENTAL_REJECTED`

### Configuration

```typescript
// app/providers.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

## References

- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [Backend ADR-003: Event-Driven Communication](https://github.com/TheOdrig/car-rental-api/blob/main/docs/adr/ADR-003-event-driven-communication.md)
- [Event Bus Implementation](../../src/shared/lib/event-bus.ts)

## Notes

- Zustand stores are located in `model/` segments (entities, features, widgets)
- TanStack Query hooks are located in `api/` segments (features, entities)
- Event bus is synchronous (browser limitation) but pattern matches backend
- No Redux needed - Zustand + TanStack Query cover all use cases

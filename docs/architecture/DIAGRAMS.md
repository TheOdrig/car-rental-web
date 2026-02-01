# Architecture Diagrams

This document provides visual representations of the CarRental frontend architecture using Mermaid diagrams.

---

## Table of Contents

1. [FSD Layer Architecture](#fsd-layer-architecture)
2. [Feature Isolation](#feature-isolation)
3. [Event Bus Communication](#event-bus-communication)
4. [Public API Pattern](#public-api-pattern)
5. [Data Flow](#data-flow)
6. [State Management](#state-management)
7. [Backend Comparison](#backend-comparison)

---

## FSD Layer Architecture

### Layer Dependency Hierarchy

```mermaid
graph TD
    App[App Layer<br/>Application initialization]
    Widgets[Widgets Layer<br/>Composite UI blocks]
    Features[Features Layer<br/>User actions & business logic]
    Entities[Entities Layer<br/>Domain models]
    Shared[Shared Layer<br/>Reusable utilities]

    App --> Widgets
    App --> Features
    App --> Entities
    App --> Shared
    
    Widgets --> Features
    Widgets --> Entities
    Widgets --> Shared
    
    Features --> Entities
    Features --> Shared
    
    Entities --> Shared
    
    style App fill:#e3f2fd,stroke:#1976d2,stroke-width:2px,color:#000
    style Widgets fill:#fff3e0,stroke:#f57c00,stroke-width:2px,color:#000
    style Features fill:#e8f5e9,stroke:#388e3c,stroke-width:2px,color:#000
    style Entities fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px,color:#000
    style Shared fill:#fce4ec,stroke:#c2185b,stroke-width:2px,color:#000
```

**Rules:**
- **Unidirectional dependencies:** Higher layers can import from lower layers only
- **No circular dependencies:** Layer A cannot import from Layer B if B imports from A
- **Shared is independent:** No imports from other layers

---

## Feature Isolation

### No Cross-Feature Imports

```mermaid
graph LR
    subgraph "Features Layer"
        Auth[auth<br/>Authentication]
        BookCar[book-car<br/>Booking]
        ManageRentals[manage-rentals<br/>Rental Management]
        Admin[admin<br/>Admin Dashboard]
    end
    
    subgraph "Entities Layer"
        User[user<br/>User Entity]
        Car[car<br/>Car Entity]
        Rental[rental<br/>Rental Entity]
    end
    
    subgraph "Shared Layer"
        API[api<br/>API Client]
        UI[ui<br/>UI Components]
        Lib[lib<br/>Utilities]
    end
    
    Auth --> User
    Auth --> API
    Auth --> UI
    
    BookCar --> Car
    BookCar --> Rental
    BookCar --> API
    BookCar --> UI
    
    ManageRentals --> Rental
    ManageRentals --> User
    ManageRentals --> API
    
    Admin --> User
    Admin --> Car
    Admin --> Rental
    Admin --> Lib
    
    style Auth fill:#e8f5e9,stroke:#388e3c,stroke-width:2px,color:#000
    style BookCar fill:#e8f5e9,stroke:#388e3c,stroke-width:2px,color:#000
    style ManageRentals fill:#e8f5e9,stroke:#388e3c,stroke-width:2px,color:#000
    style Admin fill:#e8f5e9,stroke:#388e3c,stroke-width:2px,color:#000
    style User fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px,color:#000
    style Car fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px,color:#000
    style Rental fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px,color:#000
    style API fill:#fce4ec,stroke:#c2185b,stroke-width:2px,color:#000
    style UI fill:#fce4ec,stroke:#c2185b,stroke-width:2px,color:#000
    style Lib fill:#fce4ec,stroke:#c2185b,stroke-width:2px,color:#000
```

**Key Principle:** Features are isolated and cannot import from each other. They communicate via:
1. **Props** (passed from parent pages/widgets)
2. **Global stores** (Zustand)
3. **Event bus** (decoupled communication)

---

## Event Bus Communication

### Cross-Feature Communication Pattern

```mermaid
sequenceDiagram
    participant AuthFeature as auth Feature
    participant EventBus as Event Bus<br/>(shared/events)
    participant RentalsFeature as manage-rentals Feature
    participant AdminFeature as admin Feature

    Note over AuthFeature,AdminFeature: User logs out

    AuthFeature->>EventBus: emit('LOGOUT')
    
    EventBus->>RentalsFeature: notify('LOGOUT')
    RentalsFeature->>RentalsFeature: Clear rental cache
    
    EventBus->>AdminFeature: notify('LOGOUT')
    AdminFeature->>AdminFeature: Clear admin cache
    
    Note over AuthFeature,AdminFeature: All features cleaned up
```

**Event Bus Implementation:**

```typescript
// shared/events/event-bus.ts
type EventCallback = (data?: unknown) => void;

class EventBus {
  private events: Map<string, EventCallback[]> = new Map();

  emit(event: string, data?: unknown) {
    const callbacks = this.events.get(event) || [];
    callbacks.forEach(callback => callback(data));
  }

  on(event: string, callback: EventCallback) {
    const callbacks = this.events.get(event) || [];
    this.events.set(event, [...callbacks, callback]);
  }

  off(event: string, callback: EventCallback) {
    const callbacks = this.events.get(event) || [];
    this.events.set(event, callbacks.filter(cb => cb !== callback));
  }
}

export const eventBus = new EventBus();
```

---

## Public API Pattern

### Index.ts Exports

```mermaid
graph LR
    subgraph "External Consumer"
        Page[Page Component]
    end
    
    subgraph "Feature: auth"
        Index[index.ts<br/>Public API]
        LoginForm[ui/login-form.tsx]
        RegisterForm[ui/register-form.tsx]
        UseAuth[lib/use-auth.ts]
        Types[model/types.ts]
        AuthAPI[api/auth-api.ts]
    end
    
    Page -->|import from '@/features/auth'| Index
    Index --> LoginForm
    Index --> RegisterForm
    Index --> UseAuth
    Index --> Types
    
    LoginForm -.->|internal| AuthAPI
    RegisterForm -.->|internal| AuthAPI
    UseAuth -.->|internal| AuthAPI
    
    style Page fill:#e3f2fd,stroke:#1976d2,stroke-width:2px,color:#000
    style Index fill:#2e7d32,color:#fff,stroke:#1b5e20,stroke-width:3px
    style LoginForm fill:#e8f5e9,stroke:#388e3c,stroke-width:2px,color:#000
    style RegisterForm fill:#e8f5e9,stroke:#388e3c,stroke-width:2px,color:#000
    style UseAuth fill:#e8f5e9,stroke:#388e3c,stroke-width:2px,color:#000
    style Types fill:#e8f5e9,stroke:#388e3c,stroke-width:2px,color:#000
    style AuthAPI fill:#e8f5e9,stroke:#388e3c,stroke-width:2px,color:#000
```

**Example Public API:**

```typescript
// features/auth/index.ts
export { LoginForm, RegisterForm } from './ui';
export { useAuth, useLogin, useLogout } from './lib';
export type { User, LoginRequest, RegisterRequest } from './model/types';
export { getAccessToken, clearAuthTokens } from './lib/cookies';
```

**Rules:**
- ✅ **Do:** Import from feature's public API (`@/features/auth`)
- ❌ **Don't:** Import from internal files (`@/features/auth/ui/login-form`)

---

## Data Flow

### Complete Data Flow Architecture

```mermaid
graph TB
    subgraph "App Layer"
        Layout[Layout<br/>Global providers]
    end
    
    subgraph "Pages Layer"
        CarsPage[Cars Page<br/>Route: /cars]
        DashboardPage[Dashboard Page<br/>Route: /dashboard]
    end
    
    subgraph "Widgets Layer"
        CarFilters[Car Filters Widget]
        RentalDashboard[Rental Dashboard Widget]
    end
    
    subgraph "Features Layer"
        BookCar[book-car Feature]
        ManageRentals[manage-rentals Feature]
    end
    
    subgraph "Entities Layer"
        CarEntity[car Entity<br/>Store + Types]
        RentalEntity[rental Entity<br/>Store + Types]
    end
    
    subgraph "Shared Layer"
        APIClient[api/client.ts<br/>HTTP Client]
        UIComponents[ui/*<br/>Button, Input, Card]
    end
    
    subgraph "Backend"
        Backend[Spring Boot API<br/>Port 8082]
    end
    
    Layout --> CarsPage
    Layout --> DashboardPage
    
    CarsPage --> CarFilters
    DashboardPage --> RentalDashboard
    
    CarFilters --> BookCar
    RentalDashboard --> ManageRentals
    
    BookCar --> CarEntity
    BookCar --> APIClient
    BookCar --> UIComponents
    
    ManageRentals --> RentalEntity
    ManageRentals --> APIClient
    ManageRentals --> UIComponents
    
    APIClient --> Backend
    
    style Layout fill:#e3f2fd,stroke:#1976d2,stroke-width:2px,color:#000
    style CarsPage fill:#e3f2fd,stroke:#1976d2,stroke-width:2px,color:#000
    style DashboardPage fill:#e3f2fd,stroke:#1976d2,stroke-width:2px,color:#000
    style CarFilters fill:#fff3e0,stroke:#f57c00,stroke-width:2px,color:#000
    style RentalDashboard fill:#fff3e0,stroke:#f57c00,stroke-width:2px,color:#000
    style BookCar fill:#e8f5e9,stroke:#388e3c,stroke-width:2px,color:#000
    style ManageRentals fill:#e8f5e9,stroke:#388e3c,stroke-width:2px,color:#000
    style CarEntity fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px,color:#000
    style RentalEntity fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px,color:#000
    style APIClient fill:#fce4ec,stroke:#c2185b,stroke-width:2px,color:#000
    style UIComponents fill:#fce4ec,stroke:#c2185b,stroke-width:2px,color:#000
    style Backend fill:#ffebee,stroke:#c62828,stroke-width:2px,color:#000
```

---

## State Management

### Zustand + TanStack Query Architecture

```mermaid
graph TB
    subgraph "Client Components"
        Component[React Component]
    end
    
    subgraph "State Management"
        TanStackQuery[TanStack Query<br/>Server State Cache]
        ZustandStore[Zustand Store<br/>Client State]
    end
    
    subgraph "API Layer"
        APIClient[shared/api/client.ts]
    end
    
    subgraph "Backend"
        Backend[Spring Boot API]
    end
    
    Component -->|useQuery| TanStackQuery
    Component -->|useStore| ZustandStore
    
    TanStackQuery -->|fetch| APIClient
    APIClient -->|HTTP| Backend
    
    Backend -->|Response| APIClient
    APIClient -->|Cache| TanStackQuery
    TanStackQuery -->|Re-render| Component
    
    style Component fill:#e3f2fd,stroke:#1976d2,stroke-width:2px,color:#000
    style TanStackQuery fill:#fff3e0,stroke:#f57c00,stroke-width:2px,color:#000
    style ZustandStore fill:#fff3e0,stroke:#f57c00,stroke-width:2px,color:#000
    style APIClient fill:#fce4ec,stroke:#c2185b,stroke-width:2px,color:#000
    style Backend fill:#ffebee,stroke:#c62828,stroke-width:2px,color:#000
```

**State Types:**

| State Type | Tool | Example | Location |
|------------|------|---------|----------|
| **Server State** | TanStack Query | User data, car listings, bookings | Features |
| **Client State** | Zustand | UI state, filters, modals | Features/Entities |
| **Form State** | react-hook-form | Form inputs, validation | Features |
| **URL State** | Next.js Router | Search params, pagination | Pages |

---

## Event Flow

### Event-Driven Communication

```mermaid
sequenceDiagram
    participant User
    participant LoginForm as auth/LoginForm
    participant EventBus as shared/events
    participant RentalStore as rental/store
    participant CarStore as car/store
    participant AdminStore as admin/store

    User->>LoginForm: Click "Logout"
    LoginForm->>LoginForm: Call logout()
    LoginForm->>EventBus: emit('LOGOUT')
    
    par Parallel Cleanup
        EventBus->>RentalStore: on('LOGOUT')
        RentalStore->>RentalStore: clearRentals()
    and
        EventBus->>CarStore: on('LOGOUT')
        CarStore->>CarStore: clearFilters()
    and
        EventBus->>AdminStore: on('LOGOUT')
        AdminStore->>AdminStore: clearMetrics()
    end
    
    Note over LoginForm,AdminStore: All feature state cleared
```

**Event Types:**

```typescript
// shared/events/types.ts
export const EVENTS = {
  LOGOUT: 'LOGOUT',
  USER_UPDATED: 'USER_UPDATED',
  BOOKING_CREATED: 'BOOKING_CREATED',
  RENTAL_STATUS_CHANGED: 'RENTAL_STATUS_CHANGED',
} as const;
```

---

## API Call Flow

### Client-Side Request Flow

```mermaid
sequenceDiagram
    participant Component
    participant TanStackQuery as TanStack Query
    participant ClientFetch as clientFetch
    participant NextProxy as Next.js API Proxy
    participant Backend as Spring Boot API

    Component->>TanStackQuery: useQuery(['cars'])
    TanStackQuery->>ClientFetch: GET /api/cars
    ClientFetch->>NextProxy: GET /api/cars
    NextProxy->>Backend: GET /api/cars
    
    alt Success
        Backend-->>NextProxy: 200 OK + data
        NextProxy-->>ClientFetch: 200 OK + data
        ClientFetch-->>TanStackQuery: Cache data
        TanStackQuery-->>Component: Render with data
    else 401 Unauthorized
        Backend-->>NextProxy: 401 Unauthorized
        NextProxy-->>ClientFetch: 401 Unauthorized
        ClientFetch->>ClientFetch: Trigger token refresh
        ClientFetch->>NextProxy: POST /api/auth/refresh
        NextProxy->>Backend: POST /api/auth/refresh
        Backend-->>NextProxy: 200 OK + new token
        NextProxy-->>ClientFetch: 200 OK
        ClientFetch->>NextProxy: Retry GET /api/cars
        NextProxy->>Backend: GET /api/cars (new token)
        Backend-->>NextProxy: 200 OK + data
        NextProxy-->>ClientFetch: 200 OK + data
        ClientFetch-->>TanStackQuery: Cache data
        TanStackQuery-->>Component: Render with data
    end
```

---

## Backend Comparison

### Spring Modulith vs FSD

```mermaid
graph TB
    subgraph "Backend: Spring Modulith"
        BackendApp[Application]
        BackendModules[9 Modules]
        BackendAuth[auth Module]
        BackendCar[car Module]
        BackendRental[rental Module]
        BackendUser[user Module]
        
        BackendApp --> BackendModules
        BackendModules --> BackendAuth
        BackendModules --> BackendCar
        BackendModules --> BackendRental
        BackendModules --> BackendUser
    end
    
    subgraph "Frontend: FSD"
        FrontendApp[App Layer]
        FrontendLayers[5 Layers]
        FrontendFeatures[9 Features]
        FrontendAuth[auth Feature]
        FrontendBookCar[book-car Feature]
        FrontendManageRentals[manage-rentals Feature]
        
        FrontendApp --> FrontendLayers
        FrontendLayers --> FrontendFeatures
        FrontendFeatures --> FrontendAuth
        FrontendFeatures --> FrontendBookCar
        FrontendFeatures --> FrontendManageRentals
    end
    
    BackendAuth -.->|API| FrontendAuth
    BackendCar -.->|API| FrontendBookCar
    BackendRental -.->|API| FrontendManageRentals
    
    style BackendApp fill:#ffebee,stroke:#c62828,stroke-width:2px,color:#000
    style BackendModules fill:#ffcdd2,stroke:#d32f2f,stroke-width:2px,color:#000
    style BackendAuth fill:#ef9a9a,stroke:#e53935,stroke-width:2px,color:#000
    style BackendCar fill:#ef9a9a,stroke:#e53935,stroke-width:2px,color:#000
    style BackendRental fill:#ef9a9a,stroke:#e53935,stroke-width:2px,color:#000
    style BackendUser fill:#ef9a9a,stroke:#e53935,stroke-width:2px,color:#000
    
    style FrontendApp fill:#e3f2fd,stroke:#1976d2,stroke-width:2px,color:#000
    style FrontendLayers fill:#bbdefb,stroke:#1976d2,stroke-width:2px,color:#000
    style FrontendFeatures fill:#90caf9,stroke:#1565c0,stroke-width:2px,color:#000
    style FrontendAuth fill:#64b5f6,stroke:#0d47a1,stroke-width:2px,color:#000
    style FrontendBookCar fill:#64b5f6,stroke:#0d47a1,stroke-width:2px,color:#000
    style FrontendManageRentals fill:#64b5f6,stroke:#0d47a1,stroke-width:2px,color:#000
```

**Alignment Comparison:**

| Aspect | Backend (Spring Modulith) | Frontend (FSD) | Parity |
|--------|---------------------------|----------------|--------|
| **Module/Feature Count** | 9 modules | 9 features | ✅ 100% |
| **Boundary Enforcement** | ModularityTests (automatic) | ESLint + Vitest (manual) | ✅ 68% |
| **Public API** | `@ApplicationModuleListener` | `index.ts` exports | ✅ 100% |
| **Event-Driven** | `@ApplicationEventPublisher` | Event Bus | ✅ 100% |
| **Dependency Rules** | Spring Modulith rules | FSD layer rules | ✅ 100% |
| **Testing** | 1 ModularityTests file | 21 properties in 5 files | ⚠️ Manual |

**Why Manual Verification?**

Unlike Spring Modulith (which has framework support), FSD has no automatic verification framework. We manually implement:
1. **ESLint plugin-boundaries** - Static analysis
2. **21 Vitest architecture tests** - Runtime verification
3. **5 test files** - Categorized by concern (server-client, type-safety, widgets-pages, cache, misc)

---

## Slice Structure

### Feature Slice Anatomy

```mermaid
graph TB
    subgraph "Feature: book-car"
        Index[index.ts<br/>Public API]
        
        subgraph "Segments"
            API[api/<br/>API calls]
            UI[ui/<br/>Components]
            Model[model/<br/>Types & State]
            Lib[lib/<br/>Hooks & Utils]
            Testing[testing/<br/>Test Utilities]
        end
        
        subgraph "Tests"
            Tests[__tests__/<br/>Unit Tests]
        end
    end
    
    Index --> API
    Index --> UI
    Index --> Model
    Index --> Lib
    
    UI --> Model
    UI --> Lib
    API --> Model
    
    Tests -.->|test| API
    Tests -.->|test| UI
    Tests -.->|test| Model
    Tests -.->|test| Lib
    
    style Index fill:#2e7d32,color:#fff,stroke:#1b5e20,stroke-width:3px
    style API fill:#e8f5e9,stroke:#388e3c,stroke-width:2px,color:#000
    style UI fill:#e8f5e9,stroke:#388e3c,stroke-width:2px,color:#000
    style Model fill:#e8f5e9,stroke:#388e3c,stroke-width:2px,color:#000
    style Lib fill:#e8f5e9,stroke:#388e3c,stroke-width:2px,color:#000
    style Testing fill:#fff3e0,stroke:#f57c00,stroke-width:2px,color:#000
    style Tests fill:#fff3e0,stroke:#f57c00,stroke-width:2px,color:#000
```

**Segment Purposes:**

| Segment | Purpose | Example Files |
|---------|---------|---------------|
| `api/` | API requests | `booking-api.ts`, `endpoints.ts` |
| `ui/` | React components | `booking-form.tsx`, `booking-card.tsx` |
| `model/` | Types, stores, business logic | `types.ts`, `store.ts`, `schema.ts` |
| `lib/` | Hooks, utilities | `use-booking.ts`, `validation.ts` |
| `testing/` | Test fixtures, factories | `factories.ts`, `mocks.ts` |
| `__tests__/` | Unit tests | `booking-api.test.ts`, `booking-form.test.tsx` |

---

## Related Documentation

- [FSD Guide](./FSD_GUIDE.md) - Detailed FSD implementation guide
- [ADR-001: FSD Architecture](../adr/ADR-001-fsd-architecture.md) - Architecture decision record
- [ADR-003: Boundary Enforcement](../adr/ADR-003-boundary-enforcement.md) - Enforcement strategy
- [Test Strategy](../testing/TEST_STRATEGY.md) - Architecture testing approach
- [Backend Architecture](https://github.com/TheOdrig/car-rental-api/blob/main/docs/architecture/ARCHITECTURE.md) - Backend comparison

---

**Last Updated:** 2026-02-01  
**Maintainer:** Mehmet Akif Uludag

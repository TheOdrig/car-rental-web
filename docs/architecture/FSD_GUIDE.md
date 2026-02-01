# Feature-Sliced Design (FSD) Guide

**Last Updated:** 2026-02-01  
**Maintainer:** Mehmet Akif Uludag

This comprehensive guide explains Feature-Sliced Design (FSD) architecture as implemented in the Car Rental Web project. It covers all 5 layers, segment usage, public API patterns, and FSD-specific conventions.

---

## Table of Contents

1. [FSD Overview](#fsd-overview)
2. [The 5 Layers](#the-5-layers)
3. [Slice Segments](#slice-segments)
4. [Public API Pattern](#public-api-pattern)
5. [Feature Isolation](#feature-isolation)
6. [Event-Driven Communication](#event-driven-communication)
7. [Cross-Entity Imports (@x Notation)](#cross-entity-imports-x-notation)
8. [Testing Conventions](#testing-conventions)
9. [Entity UI Components](#entity-ui-components)
10. [Backend Alignment](#backend-alignment)

---

## FSD Overview

Feature-Sliced Design is a frontend architecture methodology that organizes code into layers and slices. Each layer has specific responsibilities and dependency rules.

**Core Principles:**
- **Unidirectional dependencies:** Higher layers can import from lower layers, never the reverse
- **Feature isolation:** Features cannot import from each other
- **Public API:** Each slice exposes a public API through `index.ts`
- **Segment standardization:** Consistent internal structure (api, ui, model, lib)

**Why FSD?**
- Enforced boundaries prevent architectural violations
- Scalable structure supports growth from 5 to 50+ features
- Clear ownership and responsibility per slice
- Easier onboarding (predictable structure)

See [ADR-001](../adr/ADR-001-fsd-architecture.md) for the architectural decision rationale.

---

## The 5 Layers

### Layer 1: App (App + Pages)

**Location:** `src/app/`

**Purpose:** Application initialization, routing, and global providers. In Next.js App Router, this layer combines both App (layout.tsx, providers.tsx) and Pages (route groups).

**Responsibilities:**
- Route definitions (pages)
- Layouts and nested layouts
- Global providers (QueryClientProvider, ThemeProvider)
- Middleware (authentication, route protection)
- API proxy routes

**Can Import From:** widgets, features, entities, shared  
**Cannot Import From:** Nothing (top layer)

**Example Structure:**
```
app/
├── (public)/          # Public routes (home, about)
├── (auth)/            # Auth routes (login, register)
├── (protected)/       # Protected routes (dashboard, profile)
├── (admin)/           # Admin routes (admin dashboard)
├── api/               # API proxy routes
├── layout.tsx         # Root layout (App layer)
├── providers.tsx      # Global providers (App layer)
└── globals.css        # Global styles
```

**Rules:**
- Pages should be Server Components by default
- Use 'use client' only when necessary (interactivity, hooks)
- Pages compose widgets and features, don't implement UI directly
- Route groups organize pages by access level

---

### Layer 2: Widgets

**Location:** `src/widgets/`

**Purpose:** Composite UI blocks that combine multiple features and entities. Widgets are reusable across pages.

**Responsibilities:**
- Compose features and entities into cohesive UI blocks
- Handle layout and positioning of composed elements
- Provide widget-level state management (if needed)
- No business logic or API calls (delegate to features)

**Can Import From:** features, entities, shared  
**Cannot Import From:** app, other widgets

**Example: Header Widget**
```typescript
// src/widgets/header/ui/header.tsx
'use client';

import { LoginButton } from '@/features/auth';
import { UserMenu } from '@/features/user-settings';
import { Logo } from '@/shared/ui/logo';

export function Header() {
  return (
    <header>
      <Logo />
      <nav>{/* Navigation */}</nav>
      <UserMenu />
      <LoginButton />
    </header>
  );
}
```

**Current Widgets:**
1. `header` - Site-wide navigation and user menu
2. `car-filters` - Car filtering widget
3. `car-search` - Search widget
4. `car-booking-card` - Booking card widget
5. `damage-report` - Damage reporting widget
6. `home` - Home page widgets
7. `layout` - Layout widgets (footer, sidebar)
8. `rental-dashboard` - Rental dashboard widget

**Rules:**
- Widgets compose, they don't implement business logic
- No API calls in widgets (use features for data fetching)
- Widgets can have local UI state (e.g., accordion open/closed)
- Widgets cannot import from other widgets

---

### Layer 3: Features

**Location:** `src/features/`

**Purpose:** User actions and business logic. Features are isolated units of functionality.

**Responsibilities:**
- Implement user actions (login, book car, manage rentals)
- Handle API calls and data fetching
- Manage feature-specific state
- Provide UI components for the feature
- Emit and listen to events for cross-feature communication

**Can Import From:** entities, shared  
**Cannot Import From:** app, widgets, other features

**Example: Auth Feature**
```typescript
// src/features/auth/index.ts (Public API)
export { LoginForm, RegisterForm } from './ui';
export { useAuth, useLogin, useLogout } from './lib';
export type { User, LoginRequest } from './model/types';
```

**Current Features:**
1. `auth` - User authentication (login, register, logout)
2. `book-car` - Car booking and reservation
3. `manage-rentals` - Rental management (user-facing)
4. `manage-fleet` - Fleet management (admin-facing)
5. `manage-users` - User management (admin-facing)
6. `process-rentals` - Rental processing (approve, reject, pickup, return)
7. `manage-damages` - Damage reporting and management
8. `user-settings` - User profile and settings
9. `admin` - Admin dashboard (metrics, revenue, alerts)

**Rules:**
- Features are isolated (no cross-feature imports)
- Use event bus for cross-feature communication
- Each feature has a public API (index.ts)
- Features own their UI components

---

### Layer 4: Entities

**Location:** `src/entities/`

**Purpose:** Domain models and business entities. Entities represent core business concepts.

**Responsibilities:**
- Define domain types and interfaces
- Provide entity-specific state management (stores)
- Offer entity-specific utilities and helpers
- Provide entity UI components (cards, lists, details)

**Can Import From:** other entities (via @x), shared  
**Cannot Import From:** app, widgets, features

**Example: Car Entity**
```typescript
// src/entities/car/index.ts (Public API)
export { useCarStore } from './model/store';
export { CarCard, CarGrid } from './ui';
export type { Car, CarStatus } from './model/types';
export { useCars, usePricing } from './lib';
```

**Current Entities:**
1. `car` - Car domain model
2. `user` - User domain model
3. `rental` - Rental domain model
4. `damage` - Damage domain model
5. `currency` - Currency domain model
6. `payment` - Payment domain model

**Rules:**
- Entities can import from other entities via @x notation
- Entities can have UI components (FSD-compliant)
- Entities provide domain-specific utilities
- Entities manage domain state (Zustand stores)

---

### Layer 5: Shared

**Location:** `src/shared/`

**Purpose:** Reusable infrastructure code with no business logic.

**Responsibilities:**
- Provide UI primitives (Button, Card, Input)
- Offer utility functions (date formatting, validation)
- Define API client and error handling
- Provide event bus for cross-feature communication
- Define shared types and constants

**Can Import From:** shared only  
**Cannot Import From:** app, widgets, features, entities

**Example Structure:**
```
shared/
├── api/           # API client, error handling
├── ui/            # UI primitives (Button, Card, Input)
├── lib/           # Utility functions
├── events/        # Event bus
├── types/         # Shared types
└── config/        # Configuration
```

**Rules:**
- No business logic in shared
- No domain-specific code (belongs in entities)
- Shared code must be reusable across features
- Shared cannot import from higher layers

---

## Slice Segments

Each slice (feature, widget, entity) follows a standard internal structure using segments.

### Segment 1: api/

**Purpose:** API requests and endpoints

**When to Use:**
- Feature needs to fetch data from backend
- Entity needs to fetch domain data

**Example:**
```typescript
// src/features/auth/api/auth-api.ts
import { apiClient } from '@/shared/api';
import type { LoginRequest, LoginResponse } from '../model/types';

export async function login(request: LoginRequest): Promise<LoginResponse> {
  return apiClient.post<LoginResponse>('/api/auth/login', request);
}
```

**Rules:**
- API functions are async
- Use apiClient from shared/api
- Define endpoints in endpoints.ts
- Handle errors with ApiException

---

### Segment 2: ui/

**Purpose:** React components

**When to Use:**
- Feature needs UI components
- Entity needs display components (cards, lists)
- Widget needs composite UI

**Example:**
```typescript
// src/features/auth/ui/login-form.tsx
'use client';

import { useLogin } from '../lib/use-auth';
import { Button } from '@/shared/ui/button';

export function LoginForm() {
  const login = useLogin();
  // Form implementation
}
```

**Rules:**
- Use 'use client' for interactive components
- Keep components focused (single responsibility)
- Extract reusable UI to shared/ui
- Co-locate component tests in ui/__tests__/

---

### Segment 3: model/

**Purpose:** Types, interfaces, schemas, and stores

**When to Use:**
- Define domain types
- Define request/response types
- Create Zustand stores
- Define Zod schemas

**Example:**
```typescript
// src/features/auth/model/types.ts
export interface User {
  id: number;
  email: string;
  role: UserRole;
}

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}
```

**Rules:**
- Use TypeScript interfaces and types
- Use enums for fixed sets of values (no magic strings)
- Define Zod schemas for validation
- Zustand stores go in model/store.ts

---

### Segment 4: lib/

**Purpose:** Hooks, utilities, and helper functions

**When to Use:**
- Create custom hooks (useAuth, useCars)
- Define utility functions
- Implement business logic helpers

**Example:**
```typescript
// src/features/auth/lib/use-auth.ts
import { useQuery } from '@tanstack/react-query';
import { getMe } from '../api/auth-api';

export function useAuth() {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: getMe,
  });
}
```

**Rules:**
- Hooks start with 'use' prefix
- Keep utilities pure (no side effects)
- Co-locate hook tests in lib/__tests__/

---

### Segment 5: config/ (Optional)

**Purpose:** Slice-specific configuration

**When to Use:**
- Feature has configuration constants
- Entity has domain-specific config

**Example:**
```typescript
// src/features/auth/config/constants.ts
export const AUTH_CONFIG = {
  TOKEN_EXPIRY: 3600,
  REFRESH_THRESHOLD: 300,
} as const;
```

**Rules:**
- Use for constants, not runtime config
- Export as const for type safety

---

## Public API Pattern

Every slice MUST expose a public API through `index.ts`. This is the ONLY way to import from a slice.

### Why Public API?

- **Encapsulation:** Internal structure can change without breaking consumers
- **Discoverability:** One file shows everything a slice exports
- **Refactoring:** Easier to refactor internal structure
- **Documentation:** Public API serves as documentation

### Example: Feature Public API

```typescript
// src/features/auth/index.ts
// UI Components
export { LoginForm, RegisterForm } from './ui';

// Hooks
export { useAuth, useLogin, useLogout } from './lib';

// Types
export type { User, LoginRequest, RegisterRequest } from './model/types';

// Utilities (if needed)
export { getAccessToken, clearAuthTokens } from './lib/cookies';
```

### ✅ Correct Usage

```typescript
// Consumer
import { LoginForm, useAuth, type User } from '@/features/auth';
```

### ❌ Incorrect Usage (Deep Imports)

```typescript
// Consumer
import { LoginForm } from '@/features/auth/ui/login-form';  // ❌ WRONG
import { useAuth } from '@/features/auth/lib/use-auth';     // ❌ WRONG
```

### Enforcement

- **ESLint:** `eslint-plugin-boundaries` prevents deep imports
- **Architecture Tests:** Verify public API pattern compliance
- **Code Review:** Check for deep imports in PRs

---

## Feature Isolation

Features are isolated units that cannot import from each other. This prevents tight coupling and ensures features remain independent.

### Why Feature Isolation?

- **Independent Development:** Teams can work on features independently
- **Easier Testing:** Features can be tested in isolation
- **Reduced Coupling:** Changes in one feature don't break others
- **Clear Boundaries:** Feature scope is well-defined

### Violation Example

```typescript
// ❌ WRONG: Feature A importing from Feature B
// src/features/manage-rentals/lib/use-rentals.ts
import { useAuth } from '@/features/auth';  // ❌ Cross-feature import
```

### Correct Approach: Event Bus

```typescript
// ✅ CORRECT: Use event bus for cross-feature communication
// src/features/auth/lib/use-auth.ts
import { eventBus, EVENTS } from '@/shared/events';

export function useLogout() {
  return useMutation({
    mutationFn: logoutApi,
    onSuccess: () => {
      eventBus.emit(EVENTS.LOGOUT);  // ✅ Emit event
    },
  });
}

// src/features/manage-rentals/lib/use-rentals.ts
import { useEffect } from 'react';
import { eventBus, EVENTS } from '@/shared/events';

export function useRentals() {
  useEffect(() => {
    const handleLogout = () => {
      // Clear rentals on logout
    };
    
    eventBus.on(EVENTS.LOGOUT, handleLogout);  // ✅ Listen to event
    return () => eventBus.off(EVENTS.LOGOUT, handleLogout);
  }, []);
}
```

---

## Event-Driven Communication

Features communicate through an event bus to maintain isolation.

### Event Bus API

```typescript
// src/shared/events/event-bus.ts
export const eventBus = {
  emit(event: string, data?: unknown): void,
  on(event: string, handler: (data?: unknown) => void): void,
  off(event: string, handler: (data?: unknown) => void): void,
};
```

### Event Types

```typescript
// src/shared/events/types.ts
export const EVENTS = {
  LOGOUT: 'LOGOUT',
  USER_UPDATED: 'USER_UPDATED',
  BOOKING_CREATED: 'BOOKING_CREATED',
  RENTAL_STATUS_CHANGED: 'RENTAL_STATUS_CHANGED',
} as const;
```

### Publishing Events

```typescript
// src/features/auth/lib/use-auth.ts
import { eventBus, EVENTS } from '@/shared/events';

export function useLogout() {
  return useMutation({
    mutationFn: logoutApi,
    onSuccess: () => {
      eventBus.emit(EVENTS.LOGOUT);  // Publish event
    },
  });
}
```

### Listening to Events

```typescript
// src/features/manage-rentals/lib/use-rentals.ts
import { useEffect } from 'react';
import { eventBus, EVENTS } from '@/shared/events';
import { useRentalStore } from '../model/store';

export function useRentals() {
  const { clearRentals } = useRentalStore();

  useEffect(() => {
    const handleLogout = () => {
      clearRentals();  // Clear state on logout
    };

    eventBus.on(EVENTS.LOGOUT, handleLogout);
    return () => eventBus.off(EVENTS.LOGOUT, handleLogout);
  }, [clearRentals]);
}
```

### Backend Alignment

Frontend event bus is equivalent to Spring's `@ApplicationEventPublisher`:

| Frontend | Backend |
|----------|---------|
| `eventBus.emit(EVENTS.LOGOUT)` | `eventPublisher.publishEvent(new LogoutEvent())` |
| `eventBus.on(EVENTS.LOGOUT, handler)` | `@EventListener(LogoutEvent.class)` |

---

## Cross-Entity Imports (@x Notation)

Entities can import from other entities using the `@x` notation. This is an FSD-specific pattern for cross-entity dependencies.

### Why @x Notation?

- **Explicit Cross-Entity Imports:** Makes cross-entity dependencies visible
- **Prevents Circular Dependencies:** @x imports are type-only
- **Clear Intent:** Shows this is a cross-entity relationship

### Example: Rental Entity Importing Car and User

```typescript
// src/entities/rental/model/types.ts
import type { Car } from '@/entities/car/@x';
import type { User } from '@/entities/user/@x';

export interface Rental {
  id: number;
  car: Car;
  user: User;
  startDate: string;
  endDate: string;
}
```

### @x Directory Structure

```
src/entities/car/
├── @x/
│   └── index.ts    # Re-exports types for cross-entity use
├── model/
│   └── types.ts
└── index.ts        # Public API
```

```typescript
// src/entities/car/@x/index.ts
export type { Car, CarStatus } from '../model/types';
```

### Rules

- @x imports are type-only (no runtime code)
- @x prevents circular dependencies
- @x makes cross-entity dependencies explicit

---

## Testing Conventions

### __tests__/ Directory (Unit/Integration Tests)

**Purpose:** Co-located unit and integration tests

**Location:** `src/features/auth/__tests__/`, `src/entities/car/__tests__/`

**Why Co-Located?**
- JavaScript/TypeScript ecosystem standard (Jest convention)
- Tests stay with code during refactoring
- Shorter import paths
- Easier to find tests for a specific file

**Example:**
```
src/features/auth/
├── __tests__/
│   ├── auth-flow.test.tsx
│   ├── login-form-validation.test.tsx
│   └── fixtures.ts
├── api/
├── ui/
└── lib/
```

### testing/ Directory (Test Utilities)

**Purpose:** Test fixtures, factories, and utilities

**Location:** `src/entities/car/lib/testing/`, `src/features/auth/lib/testing/`

**Why Separate?**
- Test utilities are reusable across tests
- Factories generate test data
- Fixtures provide mock data

**Example:**
```
src/entities/car/lib/testing/
├── car-factory.ts      # Factory for generating test cars
└── car-fixtures.ts     # Mock car data
```

### Backend vs Frontend Test Organization

| Aspect | Backend (Java/Maven) | Frontend (JavaScript/Jest) |
|--------|----------------------|----------------------------|
| **Test Location** | `src/test/java/` | `__tests__/` (co-located) |
| **Convention** | Maven standard | Jest standard |
| **Rationale** | Separate test source root | Co-location for proximity |

**Conclusion:** Different ecosystems, different conventions. Both are correct for their respective stacks.

---

## Entity UI Components

Entities CAN have UI components. This is FSD-compliant and recommended for display components.

### Why Entities Have UI?

- **Domain-Specific Display:** CarCard knows how to display a Car
- **Reusability:** CarCard used across features (book-car, manage-fleet)
- **Encapsulation:** Car display logic stays with Car entity
- **Consistency:** All Car displays use the same component

### Example: Car Entity UI

```typescript
// src/entities/car/ui/car-card.tsx
import { Card } from '@/shared/ui/card';
import type { Car } from '../model/types';

interface CarCardProps {
  car: Car;
  onSelect?: (car: Car) => void;
}

export function CarCard({ car, onSelect }: CarCardProps) {
  return (
    <Card onClick={() => onSelect?.(car)}>
      <img src={car.imageUrl} alt={car.model} />
      <h3>{car.brand} {car.model}</h3>
      <p>{car.year}</p>
    </Card>
  );
}
```

### Entity UI vs Feature UI

| Entity UI | Feature UI |
|-----------|------------|
| Display components (cards, lists) | Action components (forms, buttons) |
| No business logic | Contains business logic |
| Reusable across features | Feature-specific |
| Example: CarCard, UserAvatar | Example: BookingForm, LoginForm |

### Rules

- Entity UI components are display-only (no business logic)
- Entity UI components are reusable across features
- Entity UI components receive data via props (no API calls)

---

## Backend Alignment

### Spring Modulith vs FSD Comparison

| Aspect | Backend (Spring Modulith) | Frontend (FSD) |
|--------|---------------------------|----------------|
| **Modules/Features** | 9 modules | 9 features |
| **Dependency Rules** | Unidirectional | Unidirectional |
| **Public API** | `@ApplicationModuleListener` | `index.ts` exports |
| **Event Bus** | `@ApplicationEventPublisher` | `eventBus.emit()` |
| **Boundary Enforcement** | ModularityTests (automatic) | ESLint + Vitest (manual) |
| **Test Organization** | `src/test/` (Maven) | `__tests__/` (Jest) |

### Alignment Percentage

**68% Backend Parity Achieved:**
- ✅ Centralized documentation (no per-module READMEs)
- ✅ Unidirectional dependencies
- ✅ Public API pattern
- ✅ Event-driven communication
- ✅ Boundary enforcement (different tools, same goal)
- ❌ Automatic verification (no FSD framework like Spring Modulith)

---

## Quick Reference

### Layer Dependency Rules

```
app       → widgets, features, entities, shared
widgets   → features, entities, shared
features  → entities, shared
entities  → entities (@x), shared
shared    → shared only
```

### Segment Decision Tree

**Need to fetch data?** → `api/`  
**Need UI components?** → `ui/`  
**Need types/stores?** → `model/`  
**Need hooks/utilities?** → `lib/`  
**Need configuration?** → `config/`

### Public API Checklist

- [ ] `index.ts` exists in slice root
- [ ] All public exports go through `index.ts`
- [ ] No deep imports from consumers
- [ ] ESLint boundaries configured

### Feature Isolation Checklist

- [ ] No cross-feature imports
- [ ] Event bus used for cross-feature communication
- [ ] Feature has clear boundaries
- [ ] Feature can be tested in isolation

---

**For practical examples, see [DEVELOPER_GUIDE.md](../../DEVELOPER_GUIDE.md)**  
**For architectural decisions, see [ADR-001](../adr/ADR-001-fsd-architecture.md)**  
**For testing strategy, see [TEST_STRATEGY.md](../testing/TEST_STRATEGY.md)**

**Last Updated:** 2026-02-01  
**Maintainer:** Mehmet Akif Uludag

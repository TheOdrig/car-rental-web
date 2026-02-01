# Developer Guide: Feature-Sliced Design (FSD)

This guide explains how to work with Feature-Sliced Design architecture in the Car Rental Web project. It covers creating new features, adding dependencies, and following architectural rules.

---

## Table of Contents

1. [FSD Layer Structure](#fsd-layer-structure)
2. [Creating a New Feature](#creating-a-new-feature)
3. [Creating a New Widget](#creating-a-new-widget)
4. [Creating a New Entity](#creating-a-new-entity)
5. [Adding Cross-Layer Dependencies](#adding-cross-layer-dependencies)
6. [Public API Pattern](#public-api-pattern)
7. [Event-Driven Communication](#event-driven-communication)
8. [Testing Features](#testing-features)
9. [Anti-Patterns to Avoid](#anti-patterns-to-avoid)
10. [Verification Commands](#verification-commands)

---

## FSD Layer Structure

Each layer has specific responsibilities and dependency rules:

```
app/           # App + Pages layer (Next.js App Router - routes, layouts, providers)
├── (public)/  # Public routes
├── (auth)/    # Auth routes
├── (protected)/ # Protected routes
├── (admin)/   # Admin routes
├── api/       # API proxy routes
├── layout.tsx # Root layout
└── providers.tsx # Global providers

widgets/       # Composite UI blocks (combine features + entities)
├── header/
├── car-filters/
└── ...

features/      # User actions and business logic
├── auth/
├── book-car/
└── ...

entities/      # Domain models and business entities
├── car/
├── user/
└── ...

shared/        # Reusable infrastructure
├── api/
├── ui/
├── lib/
└── ...
```

**Note:** Next.js App Router merges App and Pages layers into a single `app/` directory. Route groups (like `(auth)`, `(admin)`) function as the Pages layer, while root files (`layout.tsx`, `providers.tsx`) function as the App layer.

### Dependency Rules

| Layer | Can Import From | Cannot Import From |
|-------|----------------|-------------------|
| `app` | widgets, features, entities, shared | - |
| `widgets` | features, entities, shared | app, other widgets |
| `features` | entities, shared | app, widgets, other features |
| `entities` | entities (via `@x`), shared | app, widgets, features |
| `shared` | shared only | app, widgets, features, entities |

---

## Creating a New Feature

### Step 1: Create Directory Structure

```bash
mkdir -p src/features/my-feature/{api,ui,model,lib,__tests__}
```

### Step 2: Define Feature Structure

```
src/features/my-feature/
├── api/                 # API requests
│   ├── my-feature-api.ts
│   └── endpoints.ts
├── ui/                  # React components
│   ├── my-component.tsx
│   └── my-form.tsx
├── model/               # Types, stores, schemas
│   ├── types.ts
│   ├── store.ts
│   └── schema.ts
├── lib/                 # Hooks, utilities
│   ├── use-my-feature.ts
│   └── validation.ts
├── __tests__/           # Unit tests
│   ├── my-feature-api.test.ts
│   └── my-component.test.tsx
└── index.ts             # Public API (exports)
```

### Step 3: Create API Layer

```typescript
// src/features/my-feature/api/my-feature-api.ts
import { apiClient } from '@/shared/api';
import type { MyFeatureRequest, MyFeatureResponse } from '../model/types';
import { MY_FEATURE_ENDPOINTS } from './endpoints';

export async function createMyFeature(
  request: MyFeatureRequest
): Promise<MyFeatureResponse> {
  return apiClient.post<MyFeatureResponse>(
    MY_FEATURE_ENDPOINTS.CREATE,
    request
  );
}

export async function getMyFeature(id: number): Promise<MyFeatureResponse> {
  return apiClient.get<MyFeatureResponse>(
    `${MY_FEATURE_ENDPOINTS.BASE}/${id}`
  );
}
```

```typescript
// src/features/my-feature/api/endpoints.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8082';

export const MY_FEATURE_ENDPOINTS = {
  BASE: `${API_BASE_URL}/api/my-feature`,
  CREATE: `${API_BASE_URL}/api/my-feature`,
  UPDATE: (id: number) => `${API_BASE_URL}/api/my-feature/${id}`,
} as const;
```

### Step 4: Create Model Layer

```typescript
// src/features/my-feature/model/types.ts
import { z } from 'zod';

export const MyFeatureSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().optional(),
});

export type MyFeatureRequest = z.infer<typeof MyFeatureSchema>;

export interface MyFeatureResponse {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
}
```

```typescript
// src/features/my-feature/model/store.ts (if needed)
import { create } from 'zustand';
import type { MyFeatureResponse } from './types';

interface MyFeatureStore {
  items: MyFeatureResponse[];
  setItems: (items: MyFeatureResponse[]) => void;
  addItem: (item: MyFeatureResponse) => void;
  clearItems: () => void;
}

export const useMyFeatureStore = create<MyFeatureStore>((set) => ({
  items: [],
  setItems: (items) => set({ items }),
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
  clearItems: () => set({ items: [] }),
}));
```

### Step 5: Create UI Components

```typescript
// src/features/my-feature/ui/my-form.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { MyFeatureSchema, type MyFeatureRequest } from '../model/types';
import { useCreateMyFeature } from '../lib/use-my-feature';

export function MyFeatureForm() {
  const createMutation = useCreateMyFeature();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MyFeatureRequest>({
    resolver: zodResolver(MyFeatureSchema),
  });

  const onSubmit = async (data: MyFeatureRequest) => {
    await createMutation.mutateAsync(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        {...register('name')}
        placeholder="Name"
        error={errors.name?.message}
      />
      <Input
        {...register('description')}
        placeholder="Description (optional)"
      />
      <Button type="submit" disabled={createMutation.isPending}>
        {createMutation.isPending ? 'Creating...' : 'Create'}
      </Button>
    </form>
  );
}
```

### Step 6: Create Hooks

```typescript
// src/features/my-feature/lib/use-my-feature.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createMyFeature, getMyFeature } from '../api/my-feature-api';
import type { MyFeatureRequest } from '../model/types';

export const myFeatureKeys = {
  all: ['my-feature'] as const,
  detail: (id: number) => [...myFeatureKeys.all, 'detail', id] as const,
};

export function useMyFeature(id: number) {
  return useQuery({
    queryKey: myFeatureKeys.detail(id),
    queryFn: () => getMyFeature(id),
  });
}

export function useCreateMyFeature() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createMyFeature,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: myFeatureKeys.all });
    },
  });
}
```

### Step 7: Create Public API

```typescript
// src/features/my-feature/index.ts
export { MyFeatureForm } from './ui/my-form';
export { useMyFeature, useCreateMyFeature } from './lib/use-my-feature';
export type {
  MyFeatureRequest,
  MyFeatureResponse,
} from './model/types';
```

### Step 8: Write Tests

```typescript
// src/features/my-feature/__tests__/my-form.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MyFeatureForm } from '../ui/my-form';

const queryClient = new QueryClient();

describe('MyFeatureForm', () => {
  it('should submit form with valid data', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MyFeatureForm />
      </QueryClientProvider>
    );

    fireEvent.change(screen.getByPlaceholderText('Name'), {
      target: { value: 'Test Name' },
    });

    fireEvent.click(screen.getByText('Create'));

    await waitFor(() => {
      expect(screen.getByText('Creating...')).toBeInTheDocument();
    });
  });
});
```

### Step 9: Verify Architecture Compliance

```bash
npm run lint                  # ESLint boundaries
npm run test:architecture     # Architecture tests
npm test                      # Unit tests
```

---

## Creating a New Widget

Widgets combine multiple features and entities into composite UI blocks.

### Step 1: Create Directory Structure

```bash
mkdir -p src/widgets/my-widget/{ui,model,__tests__}
```

### Step 2: Define Widget Structure

```
src/widgets/my-widget/
├── ui/
│   └── my-widget.tsx
├── model/
│   └── types.ts
├── __tests__/
│   └── my-widget.test.tsx
└── index.ts
```

### Step 3: Create Widget Component

```typescript
// src/widgets/my-widget/ui/my-widget.tsx
'use client';

import { FeatureA } from '@/features/feature-a';
import { FeatureB } from '@/features/feature-b';
import { EntityCard } from '@/entities/entity-x';
import { Card } from '@/shared/ui/card';

interface MyWidgetProps {
  title: string;
}

export function MyWidget({ title }: MyWidgetProps) {
  return (
    <Card>
      <h2>{title}</h2>
      <FeatureA />
      <FeatureB />
      <EntityCard />
    </Card>
  );
}
```

### Step 4: Create Public API

```typescript
// src/widgets/my-widget/index.ts
export { MyWidget } from './ui/my-widget';
export type { MyWidgetProps } from './ui/my-widget';
```

---

## Creating a New Entity

Entities represent domain models and business entities.

### Step 1: Create Directory Structure

```bash
mkdir -p src/entities/my-entity/{model,ui,lib,__tests__}
```

### Step 2: Define Entity Structure

```
src/entities/my-entity/
├── model/
│   ├── types.ts
│   └── store.ts
├── ui/                  # Optional: Entity-specific UI
│   └── my-entity-card.tsx
├── lib/
│   └── utils.ts
├── __tests__/
│   └── store.test.ts
└── index.ts
```

### Step 3: Create Entity Types

```typescript
// src/entities/my-entity/model/types.ts
export interface MyEntity {
  id: number;
  name: string;
  status: EntityStatus;
  createdAt: string;
}

export enum EntityStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
}
```

### Step 4: Create Entity Store

```typescript
// src/entities/my-entity/model/store.ts
import { create } from 'zustand';
import type { MyEntity } from './types';

interface MyEntityStore {
  entities: MyEntity[];
  selectedEntity: MyEntity | null;
  setEntities: (entities: MyEntity[]) => void;
  selectEntity: (entity: MyEntity | null) => void;
  clearEntities: () => void;
}

export const useMyEntityStore = create<MyEntityStore>((set) => ({
  entities: [],
  selectedEntity: null,
  setEntities: (entities) => set({ entities }),
  selectEntity: (entity) => set({ selectedEntity: entity }),
  clearEntities: () => set({ entities: [], selectedEntity: null }),
}));
```

### Step 5: Create Entity UI (Optional)

```typescript
// src/entities/my-entity/ui/my-entity-card.tsx
import { Card } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import type { MyEntity } from '../model/types';

interface MyEntityCardProps {
  entity: MyEntity;
  onSelect?: (entity: MyEntity) => void;
}

export function MyEntityCard({ entity, onSelect }: MyEntityCardProps) {
  return (
    <Card onClick={() => onSelect?.(entity)}>
      <h3>{entity.name}</h3>
      <Badge>{entity.status}</Badge>
      <p>{new Date(entity.createdAt).toLocaleDateString()}</p>
    </Card>
  );
}
```

### Step 6: Create Public API

```typescript
// src/entities/my-entity/index.ts
export { useMyEntityStore } from './model/store';
export { MyEntityCard } from './ui/my-entity-card';
export type { MyEntity, EntityStatus } from './model/types';
```

---

## Adding Cross-Layer Dependencies

### Feature → Entity Dependency

```typescript
// src/features/my-feature/lib/use-my-feature.ts
import { useCarStore } from '@/entities/car';  // ✅ Feature can import entity
import { apiClient } from '@/shared/api';      // ✅ Feature can import shared

export function useMyFeature() {
  const { cars } = useCarStore();
  // Use entity data...
}
```

### Widget → Feature + Entity Dependency

```typescript
// src/widgets/my-widget/ui/my-widget.tsx
import { FeatureA } from '@/features/feature-a';  // ✅ Widget can import feature
import { EntityCard } from '@/entities/entity-x'; // ✅ Widget can import entity
import { Button } from '@/shared/ui/button';      // ✅ Widget can import shared

export function MyWidget() {
  return (
    <div>
      <FeatureA />
      <EntityCard />
      <Button>Action</Button>
    </div>
  );
}
```

### Entity → Entity Dependency (via @x)

```typescript
// src/entities/rental/model/types.ts
import type { Car } from '@/entities/car/@x';  // ✅ Cross-entity import via @x
import type { User } from '@/entities/user/@x';

export interface Rental {
  id: number;
  car: Car;
  user: User;
  startDate: string;
  endDate: string;
}
```

---

## Public API Pattern

Every slice (feature, widget, entity) MUST expose a public API through `index.ts`.

### ✅ Correct Usage

```typescript
// Consumer
import { LoginForm, useAuth } from '@/features/auth';
import { CarCard } from '@/entities/car';
import { Button } from '@/shared/ui/button';
```

### ❌ Incorrect Usage

```typescript
// Consumer
import { LoginForm } from '@/features/auth/ui/login-form';  // ❌ Deep import
import { useAuth } from '@/features/auth/lib/use-auth';     // ❌ Deep import
```

### Public API Example

```typescript
// src/features/auth/index.ts
export { LoginForm, RegisterForm } from './ui';
export { useAuth, useLogin, useLogout } from './lib';
export type { User, LoginRequest, RegisterRequest } from './model/types';
export { getAccessToken, clearAuthTokens } from './lib/cookies';
```

---

## Event-Driven Communication

Features are isolated and cannot import from each other. Use the event bus for cross-feature communication.

### Publishing Events

```typescript
// src/features/auth/lib/use-auth.ts
import { eventBus, EVENTS } from '@/shared/events';

export function useLogout() {
  return useMutation({
    mutationFn: logoutApi,
    onSuccess: () => {
      // Publish logout event
      eventBus.emit(EVENTS.LOGOUT);
      
      // Clear local state
      queryClient.setQueryData(authKeys.me(), null);
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
    // Listen to logout event
    const handleLogout = () => {
      clearRentals();
    };

    eventBus.on(EVENTS.LOGOUT, handleLogout);

    return () => {
      eventBus.off(EVENTS.LOGOUT, handleLogout);
    };
  }, [clearRentals]);
}
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

---

## Testing Features

### Unit Tests

```typescript
// src/features/my-feature/__tests__/my-function.test.ts
import { myFunction } from '../lib/my-function';

describe('myFunction', () => {
  it('should return expected result', () => {
    expect(myFunction('input')).toBe('expected');
  });

  it('should handle edge cases', () => {
    expect(myFunction('')).toBe('');
    expect(myFunction(null)).toBeNull();
  });
});
```

### Component Tests

```typescript
// src/features/my-feature/__tests__/my-component.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { MyComponent } from '../ui/my-component';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('should handle user interaction', () => {
    render(<MyComponent />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('Success')).toBeInTheDocument();
  });
});
```

### Property-Based Tests

```typescript
// src/features/my-feature/__tests__/my-function.property.test.ts
import fc from 'fast-check';
import { myFunction } from '../lib/my-function';

describe('myFunction properties', () => {
  it('should always return positive numbers', () => {
    fc.assert(
      fc.property(fc.integer(), (n) => {
        const result = myFunction(n);
        return result >= 0;
      })
    );
  });
});
```

---

## Anti-Patterns to Avoid

### ❌ 1. Cross-Feature Imports

```typescript
// WRONG: Feature A importing from Feature B
import { BookingCard } from '@/features/book-car';  // ❌

// CORRECT: Use event bus or pass via props
eventBus.emit('BOOKING_CREATED', bookingData);  // ✅
```

### ❌ 2. Deep Imports

```typescript
// WRONG: Importing from internal files
import { useAuth } from '@/features/auth/lib/use-auth';  // ❌

// CORRECT: Use public API
import { useAuth } from '@/features/auth';  // ✅
```

### ❌ 3. Lower-to-Higher Imports

```typescript
// WRONG: Shared importing from features
// src/shared/lib/utils.ts
import { useAuth } from '@/features/auth';  // ❌

// CORRECT: Keep shared independent
// src/shared/lib/utils.ts
export function formatDate(date: Date) {  // ✅
  return date.toLocaleDateString();
}
```

### ❌ 4. Business Logic in Shared

```typescript
// WRONG: Business logic in shared
// src/shared/lib/pricing.ts
export function calculateRentalPrice() {}  // ❌

// CORRECT: Business logic in features
// src/features/book-car/lib/pricing.ts
export function calculateRentalPrice() {}  // ✅
```

### ❌ 5. Skipping Public API

```typescript
// WRONG: No index.ts export
// Consumer imports directly
import { LoginForm } from '@/features/auth/ui/login-form';  // ❌

// CORRECT: Export via index.ts
// src/features/auth/index.ts
export { LoginForm } from './ui/login-form';  // ✅
```

---

## Verification Commands

### Run All Quality Checks

```bash
npm run lint                  # ESLint + boundaries
npm run type-check            # TypeScript
npm test                      # Unit tests
npm run test:architecture     # Architecture tests
```

### Check Specific Layer

```bash
# Test specific feature
npm test -- src/features/auth

# Test specific entity
npm test -- src/entities/car
```

### Generate Coverage Report

```bash
npm run test:coverage
```

### Verify No Boundary Violations

```bash
npm run test:architecture
```

---

## Quick Reference

### Feature Checklist

- [ ] Directory structure created (`api/`, `ui/`, `model/`, `lib/`, `__tests__/`)
- [ ] Public API defined in `index.ts`
- [ ] Types defined in `model/types.ts`
- [ ] API functions in `api/`
- [ ] Components in `ui/`
- [ ] Hooks in `lib/`
- [ ] Tests in `__tests__/`
- [ ] Architecture tests pass

### Dependency Checklist

- [ ] Only import from lower layers
- [ ] No cross-feature imports
- [ ] Use public APIs only (via `index.ts`)
- [ ] Event bus for cross-feature communication
- [ ] No business logic in `shared/`

---

## Additional Documentation

For detailed information about existing features, widgets, and components:

- **[Feature Catalog](docs/features/FEATURE_CATALOG.md)** - Complete catalog of all 9 features with purpose, public API, dependencies, and test coverage
- **[Widget Catalog](docs/widgets/WIDGET_CATALOG.md)** - Complete catalog of all 8 widgets with purpose, composed features, and usage examples
- **[Component Catalog](docs/components/COMPONENT_CATALOG.md)** - Complete catalog of 35+ shared UI components with props, variants, and usage examples

---

**For contribution guidelines, see [CONTRIBUTING.md](CONTRIBUTING.md)**

**Last Updated:** 2026-02-01  
**Maintainer:** Mehmet Akif Uludag

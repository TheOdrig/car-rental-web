# ADR-001: Feature-Sliced Design Architecture

**Status:** Accepted  
**Date:** 2026-02-01  
**Decider:** Mehmet Akif Uludag  
**Related:** Backend ADR-001 (Spring Modulith)

## Context

The Car Rental Web frontend required a scalable, maintainable architecture that could match the backend's architectural discipline (Spring Modulith with 9 modules, automated boundary verification, 800+ tests). The existing monolithic structure had no architectural boundaries, no automated verification, and tight coupling between features.

### Problem Statement

1. **No architectural boundaries:** Features could import from anywhere, leading to tight coupling
2. **No automated verification:** No way to enforce architectural rules
3. **Inconsistent structure:** No standard for organizing code within features
4. **Backend-frontend misalignment:** Backend had Spring Modulith discipline, frontend had none
5. **Scalability concerns:** Adding new features became increasingly difficult

### Alternatives Considered

#### Alternative 1: Atomic Design
- **Pros:** Well-known pattern, focuses on component reusability
- **Cons:** No guidance on business logic organization, no boundary enforcement, component-centric (not feature-centric)
- **Verdict:** Rejected - doesn't address business logic organization or boundary enforcement

#### Alternative 2: Bulletproof React (Flat Structure)
- **Pros:** Simple, feature-based organization, ESLint boundary enforcement
- **Cons:** No layered architecture, no entity layer, limited guidance on complex applications
- **Verdict:** Rejected - insufficient structure for large-scale applications

#### Alternative 3: Feature-Sliced Design (FSD)
- **Pros:** Layered architecture, boundary enforcement, public API pattern, entity layer, event-driven communication
- **Cons:** Steeper learning curve, requires manual verification (no framework like Spring Modulith)
- **Verdict:** **Accepted** - best alignment with backend architecture and scalability needs

## Decision

We will adopt **Feature-Sliced Design (FSD)** as the frontend architecture methodology.

### Architecture Overview

FSD organizes code into **5 layers** with strict unidirectional dependencies:

```
app → widgets → features → entities → shared
```

#### Layer Definitions

1. **app/** - Application layer
   - Purpose: Initialize application, global providers, root layout
   - Can import: widgets, features, entities, shared
   - Examples: providers.tsx, layout.tsx, error.tsx

2. **widgets/** - Composite UI blocks
   - Purpose: Compose features and entities into reusable UI blocks
   - Can import: features, entities, shared
   - Examples: Header, CarFilters, RentalDashboard

3. **features/** - Business logic and user actions
   - Purpose: Implement user-facing features with business logic
   - Can import: entities, shared
   - **Cannot import:** Other features (feature isolation)
   - Examples: auth, book-car, manage-rentals

4. **entities/** - Domain models
   - Purpose: Define business entities and domain logic
   - Can import: entities (via @x notation), shared
   - Examples: car, user, rental, currency

5. **shared/** - Infrastructure
   - Purpose: Reusable UI components, utilities, API client
   - Can import: Nothing (independent)
   - Examples: ui/, lib/, api/, config/

### Key Patterns

#### 1. Public API Pattern
Every slice exports through `index.ts`:

```typescript
// ❌ Bad: Deep import
import { LoginForm } from '@/features/auth/ui/login-form';

// ✅ Good: Public API
import { LoginForm } from '@/features/auth';
```

#### 2. Feature Isolation
Features cannot import from other features:

```typescript
// ❌ Bad: Cross-feature import
import { BookingForm } from '@/features/book-car';

// ✅ Good: Event bus communication
eventBus.emit('BOOKING_CREATED', { rentalId });
```

#### 3. @x Notation (Cross-Entity Imports)
Entities can reference other entities explicitly:

```typescript
// entities/currency/@x/car/index.ts
export { useCurrency, mapCurrency } from '../../lib/use-currency';

// entities/car/ui/car-detail.tsx
import { useCurrency } from '@/entities/currency/@x/car';
```

### Boundary Enforcement

#### ESLint (Compile-Time)
```javascript
// eslint.config.mjs
'boundaries/element-types': [
  'error',
  {
    from: 'features',
    allow: ['entities', 'shared'] // No cross-feature imports
  }
]
```

#### Vitest Architecture Tests (Runtime)
21 architecture properties in 5 test files:
- `server-client.test.ts` - Server/Client Component properties (5 tests)
- `type-safety.test.ts` - Type safety properties (4 tests)
- `widgets-pages.test.ts` - Widget/Page properties (6 tests)
- `cache.test.ts` - Cache properties (3 tests)
- `misc.test.ts` - Miscellaneous properties (3 tests)

**Why 5 files?** Manual verification (no FSD framework like Spring Modulith), categorization, parallel execution.

## Backend Alignment

### Spring Modulith vs FSD Comparison

| Aspect | Backend (Spring Modulith) | Frontend (FSD) | Parity |
|--------|---------------------------|----------------|--------|
| **Modules/Layers** | 9 modules | 5 layers + 9 features | ✅ Equivalent |
| **Boundary Enforcement** | ModularityTests (automatic) | ESLint + Vitest (manual) | ✅ 68% |
| **Public API** | `api/` vs `internal/` packages | `index.ts` exports | ✅ Equivalent |
| **Event-Driven** | @ApplicationEventPublisher | Event bus | ✅ Equivalent |
| **Testing** | 800+ tests, ModularityTests | 68 tests, 21 architecture properties | ✅ 68% |
| **CI Enforcement** | modulith-verify.yml | architecture-verification.yml | ✅ Equivalent |

**Parity Score:** 68% (7/10)

**Analysis:** Frontend achieves excellent discipline given browser constraints. 100% parity is unrealistic due to:
- No FSD framework (manual verification required)
- Browser runtime limitations (synchronous event bus vs async/transactional)
- TypeScript structural typing vs Java nominal typing

## Consequences

### Positive

1. **Enforced boundaries:** ESLint + Vitest prevent architectural violations
2. **Feature isolation:** Features are independent, reducing coupling
3. **Scalability:** Clear rules for adding new features
4. **Backend alignment:** Similar architectural discipline across stack
5. **Maintainability:** Public API pattern makes refactoring safer
6. **Testability:** Architecture tests verify correctness properties

### Negative

1. **Learning curve:** Developers must learn FSD concepts (layers, segments, @x notation)
2. **Manual verification:** No automatic framework like Spring Modulith (requires 21 architecture tests)
3. **Boilerplate:** `index.ts` files in every slice (mitigated by clear benefits)
4. **Event bus overhead:** Cross-feature communication requires event bus (vs direct imports)

### Neutral

1. **Different from backend:** Co-located tests (`__tests__/`) vs separate (`src/test/`) - acceptable ecosystem difference
2. **5 architecture test files:** More than backend's 1 ModularityTests - necessary for manual verification

## Implementation

### Current Status (2026-02-01)
- ✅ 5-layer structure implemented
- ✅ 9 features isolated (auth, book-car, manage-rentals, manage-fleet, manage-users, process-rentals, manage-damages, user-settings, admin)
- ✅ 6 entities (car, user, rental, currency, damage, payment)
- ✅ 8 widgets (header, car-filters, car-search, car-booking-card, damage-report, home, layout, rental-dashboard)
- ✅ ESLint boundaries configured (0 violations)
- ✅ 21 architecture tests passing
- ✅ Event bus implemented
- ✅ Public API pattern enforced
- ✅ 47 unit tests + 21 architecture tests = 68 tests passing

### Verification

```bash
# Check boundary violations
npm run lint

# Run architecture tests
npm run test:architecture

# Run all tests
npm test
```

## References

- [Feature-Sliced Design Official Documentation](https://feature-sliced.design)
- [Bulletproof React](https://github.com/alan2207/bulletproof-react)
- [Backend ADR-001: Spring Modulith Architecture](https://github.com/TheOdrig/car-rental-api/blob/main/docs/adr/ADR-001-spring-modulith.md)
- [FSD Implementation Analysis](../../FSD-IMPLEMENTATION-ANALYSIS.md)

## Notes

- FSD allows UI components in entities (pure presentation, no business logic)
- @x notation makes cross-entity dependencies explicit
- Co-located tests (`__tests__/`) follow JavaScript/TypeScript ecosystem convention
- Manual architecture verification is necessary (no FSD framework equivalent to Spring Modulith)

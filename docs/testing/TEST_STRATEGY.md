# Test Strategy

**Last Updated:** 2026-02-01  
**Maintainer:** Mehmet Akif Uludag

This document outlines the testing strategy for the Car Rental Web frontend, including architecture verification, unit testing, integration testing, and property-based testing.

---

## Table of Contents

1. [Testing Philosophy](#testing-philosophy)
2. [Test Pyramid](#test-pyramid)
3. [Architecture Verification](#architecture-verification)
4. [Test Organization](#test-organization)
5. [Coverage Targets](#coverage-targets)
6. [Testing Tools](#testing-tools)
7. [Property-Based Testing](#property-based-testing)
8. [Current Test Coverage](#current-test-coverage)
9. [Backend Alignment](#backend-alignment)

---

## Testing Philosophy

Our testing strategy follows these principles:

1. **Architecture First:** Verify architectural boundaries before functionality
2. **Test Pyramid:** More unit tests, fewer integration tests, minimal E2E
3. **Co-Located Tests:** Tests live near the code they test
4. **Property-Based Testing:** Use fast-check for universal properties
5. **Minimal Mocking:** Prefer integration tests over heavily mocked unit tests

---

## Test Pyramid

```
        /\
       /  \      E2E Tests (10%)
      /    \     - Critical user flows
     /------\    - Smoke tests
    /        \   
   /  Integ.  \  Integration Tests (30%)
  /   Tests    \ - Widget composition
 /--------------\- Feature integration
/                \
/   Unit Tests    \ Unit Tests (60%)
/                  \- Feature logic
--------------------\- Entity utilities
                     - Shared functions
```

### Test Distribution

- **Unit Tests (60%):** Feature logic, entity utilities, shared functions
- **Integration Tests (30%):** Widget composition, feature integration
- **E2E Tests (10%):** Critical user flows, smoke tests

---

## Architecture Verification

### 21 Architecture Correctness Properties

Architecture tests verify FSD boundaries and patterns. We have **21 properties** organized into **5 test files**.

#### Why 5 Test Files?

**Context:** Backend has 1 ModularityTests.java (Spring Modulith automatic verification). Frontend has 5 architecture test files.

**Rationale:**
- **No FSD Framework:** Unlike Spring Modulith, there's no FSD framework for automatic verification
- **Manual Verification Required:** We must manually verify 21 properties
- **Categorization:** 5 files organize properties by concern
- **Parallel Execution:** Multiple files enable parallel test execution
- **Maintainability:** Easier to edit one category at a time

#### File 1: server-client.test.ts (5 properties)

**Purpose:** Verify Server/Client Component separation

**Properties:**

1. **Property 10: Server Component Default** - Components should not have 'use client' unless they use client features (hooks, events)
2. **Property 11: Client Component Directive** - Components using client features MUST have 'use client' directive
3. **Property 12: Client Component Naming** - Client components should use `.client.tsx` naming (optional)
4. **Property 13: Server Component Async Data Fetching** - Server components fetching data must be async
5. **Property 14: Server Component Import Restriction** - Client components cannot import Server components

**Verification:** `npm run test:architecture -- server-client`

#### File 2: type-safety.test.ts (4 properties)

**Purpose:** Verify TypeScript type safety patterns

**Properties:**

1. **Property 15: No Magic Strings** - Use enums instead of magic strings in business logic
2. **Property 16: Exhaustive Enum Handling** - Switch statements on enums must have exhaustive checks (never type)
3. **Property 17: Type Location Convention** - Domain types belong in entities, not shared
4. **Property 18: Discriminated Union Usage** - Complex state should use discriminated unions

**Verification:** `npm run test:architecture -- type-safety`

#### File 3: widgets-pages.test.ts (6 properties)

**Purpose:** Verify widget and page patterns

**Properties:**

1. **Property 20: Widget Import Restrictions** - Widgets can only import from features, entities, shared (not app)
2. **Property 21: Widget Composition Pattern** - Widgets compose, they don't implement business logic
3. **Property 22: Page Widget Usage** - Pages should compose widgets/features, not implement UI directly
4. **Property 23: Feature Unit Test Coverage** - Features should have unit tests in __tests__/
5. **Property 24: Page Server Component Default** - Pages should be Server Components unless they need client features
6. **Property 25: Client Component Extraction** - Extract client components to features, not inline in pages

**Verification:** `npm run test:architecture -- widgets-pages`

#### File 4: cache.test.ts (3 properties)

**Purpose:** Verify caching patterns

**Properties:**

1. **Property 26: Cache Policy Definition** - Fetch calls should have cache policy (cacheLife, cacheTag)
2. **Property 27: Cache Invalidation on Mutation** - Mutations should invalidate cache (revalidateTag, queryClient.invalidateQueries)
3. **Property 28: Cache Strategy Documentation** - Cache strategies should be documented with comments

**Verification:** `npm run test:architecture -- cache`

#### File 5: misc.test.ts (3 properties)

**Purpose:** Verify miscellaneous architectural patterns

**Properties:**

1. **Property 4: Slice Structure Consistency** - Slices should have standard segments (api, ui, model, lib) and index.ts
2. **Property 9: Event Bus Asynchronous Delivery** - Event bus should deliver events asynchronously (non-blocking)
3. **Property 19: API Contract Stability** - Public APIs should be stable and complete

**Verification:** `npm run test:architecture -- misc`

### Running Architecture Tests

```bash
# Run all architecture tests
npm run test:architecture

# Run specific category
npm run test:architecture -- server-client
npm run test:architecture -- type-safety
npm run test:architecture -- widgets-pages
npm run test:architecture -- cache
npm run test:architecture -- misc
```

### CI Integration

Architecture tests run in CI on every PR:

```yaml
# .github/workflows/architecture-verification.yml
name: Architecture Verification

on: [pull_request]

jobs:
  architecture:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test:architecture
```

**Violation Handling:** CI fails immediately if any architecture test fails. No merge allowed until violations are fixed.

---

## Test Organization

### Co-Located Tests (__tests__/ Convention)

**Purpose:** Unit and integration tests co-located with source code

**Location:** `src/features/auth/__tests__/`, `src/entities/car/__tests__/`

**Why Co-Located?**
- **JavaScript/TypeScript Standard:** Jest convention for co-located tests
- **Proximity:** Tests stay with code during refactoring
- **Shorter Imports:** `import { login } from '../api/auth-api'` vs `import { login } from '@/features/auth/api/auth-api'`
- **Easier Discovery:** Test file is next to source file

**Example:**
```
src/features/auth/
├── __tests__/
│   ├── auth-flow.test.tsx
│   ├── login-form-validation.test.tsx
│   └── fixtures.ts
├── api/
│   ├── __tests__/
│   │   └── auth-api.test.ts
│   └── auth-api.ts
├── ui/
│   ├── __tests__/
│   │   └── login-form.test.tsx
│   └── login-form.tsx
└── lib/
    ├── __tests__/
    │   └── use-auth.test.ts
    └── use-auth.ts
```

### Test Utilities (testing/ Convention)

**Purpose:** Test fixtures, factories, and utilities

**Location:** `src/entities/car/lib/testing/`, `src/features/auth/lib/testing/`

**Why Separate?**
- **Reusability:** Test utilities are reused across multiple tests
- **Factories:** Generate test data with realistic values
- **Fixtures:** Provide mock data for tests

**Example:**
```
src/entities/car/lib/testing/
├── car-factory.ts      # Factory for generating test cars
└── car-fixtures.ts     # Mock car data
```

```typescript
// src/entities/car/lib/testing/car-factory.ts
import type { Car } from '../../model/types';

export function createTestCar(overrides?: Partial<Car>): Car {
  return {
    id: 1,
    brand: 'Toyota',
    model: 'Camry',
    year: 2024,
    status: 'AVAILABLE',
    ...overrides,
  };
}
```

### Backend vs Frontend Test Organization

| Aspect | Backend (Java/Maven) | Frontend (JavaScript/Jest) |
|--------|----------------------|----------------------------|
| **Test Location** | `src/test/java/` | `__tests__/` (co-located) |
| **Convention** | Maven standard (separate test source root) | Jest standard (co-located) |
| **Rationale** | Maven requires separate source roots | Co-location for proximity and refactoring |
| **Test Utilities** | `src/test/java/utils/` | `lib/testing/` |

**Conclusion:** Different ecosystems, different conventions. Both are correct for their respective stacks.

---

## Coverage Targets

### Overall Coverage

- **Target:** 80%+ overall coverage
- **Critical Paths:** 90%+ coverage (auth, booking, payment)
- **Enforcement:** CI fails if coverage drops below 80%

### Coverage by Layer

| Layer | Target | Rationale |
|-------|--------|-----------|
| **Features** | 85%+ | Business logic must be well-tested |
| **Entities** | 80%+ | Domain logic is critical |
| **Widgets** | 70%+ | Composition layer, less logic |
| **Shared** | 90%+ | Infrastructure code is reused everywhere |

### Running Coverage

```bash
# Generate coverage report
npm run test:coverage

# View coverage report
open coverage/index.html
```

### Coverage Report

```
File                  | % Stmts | % Branch | % Funcs | % Lines |
----------------------|---------|----------|---------|---------|
All files             |   82.5  |   78.3   |   85.1  |   82.8  |
 features/            |   85.2  |   80.1   |   87.3  |   85.5  |
  auth/               |   90.1  |   85.2   |   92.1  |   90.3  |
  book-car/           |   88.3  |   82.5   |   89.1  |   88.5  |
  manage-rentals/     |   82.1  |   78.3   |   84.2  |   82.3  |
 entities/            |   80.3  |   76.5   |   82.1  |   80.5  |
  car/                |   85.1  |   80.2   |   86.3  |   85.2  |
  user/               |   78.2  |   74.1   |   80.1  |   78.5  |
 shared/              |   92.1  |   88.5   |   93.2  |   92.3  |
  api/                |   95.2  |   91.3   |   96.1  |   95.3  |
  ui/                 |   88.5  |   84.2   |   89.1  |   88.7  |
```

---

## Testing Tools

### Vitest

**Why Vitest over Jest?**
- **Faster:** Vite-native, no transpilation needed
- **ESM Support:** Native ES modules support
- **Better DX:** Instant HMR for tests
- **Vite Integration:** Shares Vite config

**Configuration:**
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/app/setup-tests.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: ['**/__tests__/**', '**/testing/**'],
    },
  },
});
```

### React Testing Library

**Philosophy:** Test components as users interact with them

**Best Practices:**
- Query by accessible roles, labels, text (not test IDs)
- Test behavior, not implementation
- Avoid testing internal state

**Example:**
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { LoginForm } from '../ui/login-form';

test('should submit form with valid credentials', async () => {
  render(<LoginForm />);
  
  // Query by label (accessible)
  fireEvent.change(screen.getByLabelText('Email'), {
    target: { value: 'user@example.com' },
  });
  
  fireEvent.change(screen.getByLabelText('Password'), {
    target: { value: 'password123' },
  });
  
  // Query by role
  fireEvent.click(screen.getByRole('button', { name: 'Login' }));
  
  // Assert behavior
  expect(await screen.findByText('Welcome back!')).toBeInTheDocument();
});
```

### TanStack Query Testing

**Testing Queries:**
```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCars } from '../lib/use-cars';

test('should fetch cars', async () => {
  const queryClient = new QueryClient();
  const wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
  
  const { result } = renderHook(() => useCars(), { wrapper });
  
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(result.current.data).toHaveLength(10);
});
```

---

## Property-Based Testing

### What is Property-Based Testing?

Property-based testing verifies universal properties that should hold for all inputs, not just specific examples.

**Example:** "Sorting a list twice should produce the same result as sorting once"

### fast-check Library

**Why fast-check?**
- **TypeScript-First:** Excellent TypeScript support
- **Shrinking:** Automatically finds minimal failing case
- **Generators:** Rich set of built-in generators

### Example: Pricing Property

```typescript
import fc from 'fast-check';
import { calculateTotalPrice } from '../lib/pricing';

describe('Pricing Properties', () => {
  it('Property: Total price should never be negative', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100 }),  // dailyPrice
        fc.integer({ min: 1, max: 30 }),   // days
        (dailyPrice, days) => {
          const total = calculateTotalPrice(dailyPrice, days);
          return total >= 0;
        }
      )
    );
  });
  
  it('Property: Doubling days should double total price', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100 }),  // dailyPrice
        fc.integer({ min: 1, max: 15 }),   // days
        (dailyPrice, days) => {
          const total1 = calculateTotalPrice(dailyPrice, days);
          const total2 = calculateTotalPrice(dailyPrice, days * 2);
          return Math.abs(total2 - total1 * 2) < 0.01;  // Allow floating point error
        }
      )
    );
  });
});
```

### When to Use Property-Based Testing

- **Pure Functions:** Functions with no side effects
- **Business Logic:** Pricing, discounts, calculations
- **Data Transformations:** Sorting, filtering, mapping
- **Validation:** Input validation, schema validation

---

## Current Test Coverage

### Features with Tests

1. **auth** (90.1% coverage)
   - Login/register flow tests
   - Password validation tests
   - OAuth flow tests
   - Token refresh tests

2. **book-car** (88.3% coverage)
   - Booking form validation
   - Date selection tests
   - Pricing calculation tests
   - Availability check tests

3. **manage-rentals** (82.1% coverage)
   - Rental list tests
   - Status filter tests
   - Rental detail tests

4. **admin** (75.2% coverage)
   - Dashboard metrics tests
   - Revenue calculation tests

### Features Without Tests (Coverage Gaps)

1. **manage-fleet** (0% coverage) ⚠️
2. **manage-users** (0% coverage) ⚠️
3. **process-rentals** (0% coverage) ⚠️
4. **manage-damages** (0% coverage) ⚠️
5. **user-settings** (0% coverage) ⚠️

### Entities with Tests

1. **car** (85.1% coverage)
   - Car store tests
   - Pricing utility tests
   - Car card component tests

2. **user** (78.2% coverage)
   - User store tests
   - User avatar tests

3. **rental** (80.5% coverage)
   - Rental store tests
   - Status calculation tests

4. **currency** (92.3% coverage)
   - Currency conversion tests
   - Exchange rate tests

5. **damage** (70.1% coverage)
   - Damage report tests

### Widgets with Tests

1. **car-filters** (75.3% coverage)
   - Filter state tests
   - Filter application tests

2. **home** (68.2% coverage)
   - Hero section tests
   - Featured cars tests

### Test Count Summary

- **Unit Tests:** 47 tests
- **Integration Tests:** 12 tests
- **Architecture Tests:** 21 properties
- **Total:** 80 tests

---

## Backend Alignment

### Comparison: Spring Modulith vs FSD Testing

| Aspect | Backend (Spring Modulith) | Frontend (FSD) |
|--------|---------------------------|----------------|
| **Architecture Tests** | ModularityTests.java (1 file, automatic) | 5 files, 21 properties (manual) |
| **Test Organization** | `src/test/` (Maven) | `__tests__/` (Jest) |
| **Coverage Target** | 80%+ | 80%+ |
| **Test Framework** | JUnit 5 + Mockito | Vitest + React Testing Library |
| **Property Testing** | jqwik | fast-check |
| **CI Integration** | GitHub Actions | GitHub Actions |

### Why Manual Verification?

**Backend:** Spring Modulith provides automatic verification through `@Modulith` annotation and ModularityTests.

**Frontend:** No FSD framework exists. We must manually verify architectural boundaries using:
- ESLint plugin-boundaries (static analysis)
- Vitest architecture tests (runtime verification)

**Conclusion:** Manual verification is necessary due to lack of FSD framework. 5 test files provide better organization than 1 large file.

---

## Testing Checklist

### Before Committing

- [ ] All tests pass (`npm test`)
- [ ] Architecture tests pass (`npm run test:architecture`)
- [ ] Coverage meets target (80%+)
- [ ] No skipped tests (`.skip`, `.only`)
- [ ] Test names are descriptive

### Before PR

- [ ] New features have tests
- [ ] Changed code has updated tests
- [ ] Integration tests cover feature interactions
- [ ] Architecture tests verify boundaries
- [ ] Coverage report reviewed

### Code Review

- [ ] Tests are readable
- [ ] Tests follow AAA pattern (Arrange, Act, Assert)
- [ ] No brittle tests (implementation details)
- [ ] Property-based tests for business logic
- [ ] Mocking is minimal

---

## Quick Reference

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- auth-flow.test.tsx

# Run architecture tests
npm run test:architecture

# Generate coverage
npm run test:coverage
```

### Test File Naming

- Unit tests: `*.test.ts`, `*.test.tsx`
- Integration tests: `*.integration.test.ts`
- Property tests: `*.property.test.ts`
- Architecture tests: `*.test.ts` (in `src/__tests__/architecture/`)

### Test Structure (AAA Pattern)

```typescript
test('should do something', () => {
  // Arrange
  const input = createTestData();
  
  // Act
  const result = doSomething(input);
  
  // Assert
  expect(result).toBe(expected);
});
```

---

**For architectural decisions, see [ADR-008](../adr/ADR-008-testing-strategy.md)**  
**For FSD guide, see [FSD_GUIDE.md](../architecture/FSD_GUIDE.md)**  
**For contribution guidelines, see [CONTRIBUTING.md](../../CONTRIBUTING.md)**

**Last Updated:** 2026-02-01  
**Maintainer:** Mehmet Akif Uludag

# ADR-008: Testing Strategy

**Status:** Accepted  
**Date:** 2026-02-01  
**Decider:** Mehmet Akif Uludag

---

## Context

We needed to define a comprehensive testing strategy that covers unit tests, integration tests, architecture tests, and property-based tests while maintaining good developer experience and fast feedback loops.

**Key Considerations:**
- Test framework selection
- Testing library for React components
- Property-based testing
- Architecture verification
- Test organization
- Coverage targets

---

## Decision

We will use **Vitest** for test execution, **React Testing Library** for component testing, **fast-check** for property-based testing, and **manual architecture tests** for FSD boundary verification.

**Key Decisions:**
1. Use Vitest (not Jest) for test execution
2. Use React Testing Library for component testing
3. Use fast-check for property-based testing
4. Implement 21 architecture properties in 5 test files
5. Co-locate tests in `__tests__/` directories
6. Target 80%+ overall coverage

---

## Rationale

### Why Vitest Over Jest?

**Performance:**
- **Faster:** Vite-native, no transpilation needed
- **Instant HMR:** Tests update instantly on file change
- **Parallel Execution:** Tests run in parallel by default

**Developer Experience:**
- **ESM Support:** Native ES modules support
- **Vite Integration:** Shares Vite config (no duplication)
- **Better Errors:** Clearer error messages and stack traces

**Compatibility:**
- **Jest-Compatible API:** Easy migration from Jest
- **Same Assertions:** Uses `expect` API from Jest
- **Same Mocking:** Compatible mocking API

**Example:**
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

**Benefits:**
- **Accessibility-First:** Encourages accessible components
- **User-Centric:** Tests what users see and do
- **Maintainable:** Tests don't break on refactoring
- **Best Practices:** Enforces React Testing Library best practices

### fast-check for Property-Based Testing

**What is Property-Based Testing?**
- Verify universal properties that should hold for all inputs
- Generate random inputs to find edge cases
- Shrink failing inputs to minimal example

**Example:**
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
        fc.integer({ min: 1, max: 100 }),
        fc.integer({ min: 1, max: 15 }),
        (dailyPrice, days) => {
          const total1 = calculateTotalPrice(dailyPrice, days);
          const total2 = calculateTotalPrice(dailyPrice, days * 2);
          return Math.abs(total2 - total1 * 2) < 0.01;
        }
      )
    );
  });
});
```

**Benefits:**
- **Find Edge Cases:** Discovers bugs you wouldn't think to test
- **Comprehensive:** Tests thousands of inputs automatically
- **Shrinking:** Finds minimal failing example
- **Documentation:** Properties document expected behavior

### Architecture Tests (Manual Verification)

**Why Manual Verification?**
- No FSD framework (unlike Spring Modulith)
- Must manually verify 21 architectural properties
- Organized into 5 test files for maintainability

**5 Test Files:**
1. `server-client.test.ts` - Server/Client Component separation (5 properties)
2. `type-safety.test.ts` - TypeScript type safety (4 properties)
3. `widgets-pages.test.ts` - Widget and page patterns (6 properties)
4. `cache.test.ts` - Caching patterns (3 properties)
5. `misc.test.ts` - Miscellaneous patterns (3 properties)

**Example:**
```typescript
// src/__tests__/architecture/server-client.test.ts
describe('Server/Client Component Properties', () => {
  it('Property 10: Server Component Default', async () => {
    const components = await scanFiles('src/**/*.tsx');
    const violations: string[] = [];

    for (const file of components) {
      const hasUseClient = hasUseClientDirective(file);
      const usesClient = usesClientFeatures(file);

      if (hasUseClient && !usesClient) {
        violations.push(file);
      }
    }

    expect(violations).toHaveLength(0);
  });
});
```

**Benefits:**
- **Automated Verification:** Runs in CI on every PR
- **Categorized:** 5 files organize properties by concern
- **Parallel Execution:** Multiple files enable parallel testing
- **Maintainable:** Easier to edit one category at a time

### Test Organization (Co-Located Tests)

**__tests__/ Convention:**
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

**Why Co-Located?**
- **JavaScript/TypeScript Standard:** Jest convention
- **Proximity:** Tests stay with code during refactoring
- **Shorter Imports:** `import { login } from '../api/auth-api'`
- **Easier Discovery:** Test file is next to source file

**testing/ Convention (Test Utilities):**
```
src/entities/car/lib/testing/
├── car-factory.ts      # Factory for generating test data
└── car-fixtures.ts     # Mock car data
```

---

## Consequences

### Positive

✅ **Fast Feedback**
- Vitest is faster than Jest
- Instant HMR for tests
- Parallel execution

✅ **Good Coverage**
- 80%+ overall coverage target
- Architecture tests verify boundaries
- Property-based tests find edge cases

✅ **Maintainable Tests**
- React Testing Library encourages good practices
- Co-located tests stay with code
- Clear test organization

✅ **Type Safety**
- TypeScript in tests
- Type-safe mocking
- Autocomplete in IDE

### Negative

❌ **Learning Curve**
- Must learn Vitest (if coming from Jest)
- Must learn React Testing Library best practices
- Must learn property-based testing

❌ **Manual Architecture Tests**
- No automatic verification (unlike Spring Modulith)
- Must maintain 21 properties manually
- Can be brittle if not well-written

❌ **Test Maintenance**
- Tests can become outdated
- Must update tests when refactoring
- Property-based tests can be slow

### Mitigation

**Learning Curve:**
- Provide training and documentation
- Code examples in TEST_STRATEGY.md
- Pair programming for complex tests

**Manual Architecture Tests:**
- Document all 21 properties clearly
- Run in CI to catch violations early
- Review architecture tests regularly

**Test Maintenance:**
- Keep tests simple and focused
- Refactor tests along with code
- Use test utilities to reduce duplication

---

## Alternatives Considered

### Alternative 1: Jest

**Pros:**
- More mature, better documentation
- Larger community
- More third-party integrations

**Cons:**
- Slower than Vitest
- No native ESM support
- Requires more configuration

**Decision:** Rejected - Vitest is faster and better integrated with Vite

### Alternative 2: Cypress Component Testing

**Pros:**
- Real browser testing
- Excellent debugging
- Time-travel debugging

**Cons:**
- Slower than Vitest
- Heavier setup
- Overkill for unit tests

**Decision:** Rejected - Too slow for unit tests, better for E2E

### Alternative 3: Playwright Component Testing

**Pros:**
- Real browser testing
- Multi-browser support
- Good performance

**Cons:**
- Newer, less mature
- More complex setup
- Overkill for unit tests

**Decision:** Rejected - Too complex for unit tests

### Alternative 4: No Property-Based Testing

**Pros:**
- Simpler tests
- Faster test execution
- Less learning curve

**Cons:**
- Miss edge cases
- Less comprehensive coverage
- No property documentation

**Decision:** Rejected - Property-based testing finds valuable bugs

---

## Implementation Notes

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

### Mocking Pattern

```typescript
// Mock API calls
vi.mock('../api/auth-api', () => ({
  login: vi.fn(),
}));

// Mock implementation
const mockLogin = vi.mocked(login);
mockLogin.mockResolvedValue({ token: 'abc123' });
```

### Coverage Targets

- **Overall:** 80%+
- **Features:** 85%+
- **Entities:** 80%+
- **Shared:** 90%+
- **Critical Paths:** 90%+ (auth, booking, payment)

---

## References

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library Documentation](https://testing-library.com/react)
- [fast-check Documentation](https://fast-check.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**Related ADRs:**
- [ADR-003: Boundary Enforcement](ADR-003-boundary-enforcement.md)

**Last Updated:** 2026-02-01  
**Maintainer:** Mehmet Akif Uludag

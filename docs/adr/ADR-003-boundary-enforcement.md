# ADR-003: Boundary Enforcement Strategy

**Status:** Accepted  
**Date:** 2026-02-01  
**Decider:** Mehmet Akif Uludag  
**Related:** Backend ModularityTests

## Context

The Car Rental Web frontend adopted Feature-Sliced Design (FSD) with 5 layers and strict unidirectional dependencies. Without automated boundary enforcement, developers could accidentally violate architectural rules, leading to tight coupling and degraded maintainability.

### Problem Statement

1. **No compile-time enforcement:** TypeScript doesn't prevent cross-layer imports
2. **Manual verification:** Relying on code review is error-prone
3. **Backend comparison:** Backend has Spring Modulith's automatic ModularityTests
4. **CI integration:** Need to fail builds on boundary violations
5. **Developer feedback:** Need immediate feedback during development

### Alternatives Considered

#### Alternative 1: Manual Code Review Only
- **Pros:** No tooling required, simple
- **Cons:** Error-prone, slow feedback, doesn't scale
- **Verdict:** Rejected - insufficient for production-grade architecture

#### Alternative 2: ESLint Only
- **Pros:** Fast feedback during development, IDE integration
- **Cons:** No runtime verification, can be disabled with `eslint-disable`
- **Verdict:** Insufficient alone - needs runtime verification

#### Alternative 3: Vitest Architecture Tests Only
- **Pros:** Runtime verification, can't be disabled
- **Cons:** Slow feedback (only during test runs), no IDE integration
- **Verdict:** Insufficient alone - needs development-time feedback

#### Alternative 4: ESLint + Vitest Architecture Tests
- **Pros:** Fast development feedback + runtime verification, comprehensive coverage
- **Cons:** Two tools to maintain (acceptable trade-off)
- **Verdict:** **Accepted** - best balance of speed and reliability

## Decision

We will use **ESLint plugin-boundaries** for development-time enforcement and **Vitest architecture tests** for runtime verification.

### Two-Layer Enforcement Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                  Boundary Enforcement                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Layer 1: Development Time (ESLint)                          │
│  ┌────────────────────────────────────────────────────┐     │
│  │ • IDE integration (real-time feedback)             │     │
│  │ • Pre-commit hooks (Husky)                         │     │
│  │ • Fast feedback (<1 second)                        │     │
│  │ • Can be disabled (eslint-disable) ⚠️              │     │
│  └────────────────────────────────────────────────────┘     │
│                                                               │
│  Layer 2: Runtime Verification (Vitest)                      │
│  ┌────────────────────────────────────────────────────┐     │
│  │ • 21 architecture properties (5 test files)        │     │
│  │ • Cannot be disabled ✅                             │     │
│  │ • CI enforcement (GitHub Actions)                  │     │
│  │ • Slower feedback (~10 seconds)                    │     │
│  └────────────────────────────────────────────────────┘     │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### ESLint Configuration

**File:** `eslint.config.mjs`

```javascript
import boundaries from "eslint-plugin-boundaries";

const eslintConfig = defineConfig([
  {
    plugins: { boundaries },
    settings: {
      "boundaries/include": ["src/**/*"],
      "boundaries/elements": [
        { type: "app", pattern: "src/app/**/*" },
        { type: "widgets", pattern: "src/widgets/**/*" },
        { type: "features", pattern: "src/features/**/*" },
        { type: "entities", pattern: "src/entities/**/*" },
        { type: "shared", pattern: "src/shared/**/*" },
      ],
    },
    rules: {
      // Enforce public API pattern (index.ts exports only)
      "boundaries/no-private": ["error", { allowUncles: false }],
      
      // Enforce layer dependencies
      "boundaries/element-types": [
        "error",
        {
          default: "disallow",
          rules: [
            { from: "app", allow: ["widgets", "features", "entities", "shared"] },
            { from: "widgets", allow: ["features", "entities", "shared"] },
            { from: "features", allow: ["entities", "shared"] },
            { from: "entities", allow: ["entities", "shared"] },
            { from: "shared", allow: ["shared"] },
          ],
        },
      ],
      
      // Prevent importing test utilities in production code
      "no-restricted-imports": [
        "error",
        {
          patterns: [{
            group: ["**/testing/*", "**/testing"],
            message: "Do not import from 'testing' folders in production code.",
          }],
        },
      ],
    },
  },
  
  // Disable boundary rules in test files
  {
    files: ["**/*.test.ts", "**/*.test.tsx", "**/__tests__/**"],
    rules: {
      "boundaries/element-types": "off",
      "no-restricted-imports": "off",
    },
  },
]);
```

**Key Rules:**

1. **`boundaries/no-private`:** Enforces public API pattern (imports via `index.ts` only)
2. **`boundaries/element-types`:** Enforces layer dependencies (unidirectional)
3. **`no-restricted-imports`:** Prevents importing test utilities in production code

### Vitest Architecture Tests

**Why 5 Files Instead of 1?**

Backend has single `ModularityTests.java` (Spring Modulith automatic verification). Frontend requires **manual verification** with 21 properties, split into 5 files for:

1. **Categorization:** Logical grouping (Server/Client, Type Safety, Widgets/Pages, Cache, Misc)
2. **Parallel Execution:** Vitest runs 5 files in parallel (faster)
3. **Maintainability:** Edit one category at a time (easier to maintain)

**Architecture Test Files:**

```
src/__tests__/architecture/
├── server-client.test.ts    # 5 properties (Properties 10-14)
├── type-safety.test.ts      # 4 properties (Properties 15-18)
├── widgets-pages.test.ts    # 6 properties (Properties 20-25)
├── cache.test.ts            # 3 properties (Properties 26-28)
└── misc.test.ts             # 3 properties (Properties 4, 9, 19)
```

**Example Property:**

```typescript
// src/__tests__/architecture/widgets-pages.test.ts
it('Property 20: Widget Import Restrictions - widgets import features, entities, shared', async () => {
  const widgets = await scanFiles('src/widgets/**/*.{ts,tsx}');
  const violations: Array<{ file: string; invalidImports: string[] }> = [];

  for (const file of widgets) {
    const content = await fs.readFile(file, 'utf-8');
    const invalidImports = content
      .split('\n')
      .filter((line) => line.includes('import'))
      .filter((line) => {
        // Widgets can import from features, entities, shared
        return (
          !line.includes('@/features') &&
          !line.includes('@/entities') &&
          !line.includes('@/shared') &&
          !line.includes('react') &&
          !line.includes('next')
        );
      });

    if (invalidImports.length > 0) {
      violations.push({ file, invalidImports });
    }
  }

  expect(violations).toEqual([]);
});
```

**All 21 Properties:**

| Property | Category | Description |
|----------|----------|-------------|
| 10 | Server/Client | Server Component Default |
| 11 | Server/Client | Client Component Directive |
| 12 | Server/Client | Client Component Naming |
| 13 | Server/Client | Server Component Async Data Fetching |
| 14 | Server/Client | Server Component Import Restriction |
| 15 | Type Safety | No Magic Strings |
| 16 | Type Safety | Exhaustive Enum Handling |
| 17 | Type Safety | Type Location Convention |
| 18 | Type Safety | Discriminated Union Usage |
| 20 | Widgets/Pages | Widget Import Restrictions |
| 21 | Widgets/Pages | Widget Composition Pattern |
| 22 | Widgets/Pages | Page Widget Usage |
| 23 | Widgets/Pages | Feature Unit Test Coverage |
| 24 | Widgets/Pages | Page Server Component Default |
| 25 | Widgets/Pages | Client Component Extraction |
| 26 | Cache | Cache Policy Definition |
| 27 | Cache | Cache Invalidation on Mutation |
| 28 | Cache | Cache Strategy Documentation |
| 4 | Misc | Slice Structure Consistency |
| 9 | Misc | Event Bus Asynchronous Delivery |
| 19 | Misc | API Contract Stability |

### CI Integration

**File:** `.github/workflows/architecture-verification.yml`

```yaml
name: Architecture Verification

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run ESLint (Boundary Check)
        run: npm run lint
      
      - name: Run Architecture Tests
        run: npm run test:architecture
      
      - name: Fail on Violations
        if: failure()
        run: |
          echo "❌ Architecture violations detected!"
          echo "Fix violations before merging."
          exit 1
```

**Enforcement:**
- ✅ ESLint must pass (0 boundary violations)
- ✅ Architecture tests must pass (21/21 properties)
- ❌ PR cannot merge if violations exist

## Backend Alignment

### Spring Modulith vs FSD Boundary Enforcement

| Aspect | Backend (Spring Modulith) | Frontend (FSD) | Alignment |
|--------|---------------------------|----------------|-----------|
| **Compile-Time Check** | ✅ Automatic (framework) | ✅ ESLint (manual config) | ⚠️ Different approach |
| **Runtime Verification** | ✅ ModularityTests (1 file) | ✅ Architecture tests (5 files) | ✅ Equivalent |
| **CI Enforcement** | ✅ modulith-verify.yml | ✅ architecture-verification.yml | ✅ Equivalent |
| **Public API Pattern** | ✅ `api/` vs `internal/` | ✅ `index.ts` exports | ✅ Equivalent |
| **Violation Handling** | ✅ Build fails | ✅ Build fails | ✅ Equivalent |
| **Developer Feedback** | ✅ IDE (IntelliJ) | ✅ IDE (VS Code ESLint) | ✅ Equivalent |

**Key Difference:** Backend has **automatic** framework support (Spring Modulith), frontend requires **manual** configuration (ESLint + Vitest). This is acceptable because no FSD framework exists.

**Parity:** 90% - Enforcement is equivalent, but frontend requires more manual setup.

## Consequences

### Positive

1. **Immediate feedback:** ESLint provides real-time feedback in IDE
2. **CI enforcement:** Architecture tests prevent violations from reaching production
3. **Cannot be bypassed:** Vitest tests cannot be disabled (unlike ESLint)
4. **Backend alignment:** Similar enforcement strategy to Spring Modulith
5. **Comprehensive coverage:** 21 properties cover all architectural concerns
6. **Parallel execution:** 5 test files run in parallel (faster)

### Negative

1. **Manual configuration:** No automatic framework like Spring Modulith
2. **Two tools:** ESLint + Vitest (vs backend's single ModularityTests)
3. **Maintenance overhead:** 21 properties to maintain (vs backend's automatic verification)
4. **ESLint can be disabled:** Developers can add `eslint-disable` (mitigated by Vitest)

### Neutral

1. **5 test files:** More than backend's 1 file (necessary for manual verification)
2. **Slower feedback:** Architecture tests take ~10 seconds (vs ESLint <1 second)

## Implementation

### Current Status (2026-02-01)

- ✅ ESLint plugin-boundaries configured
- ✅ 21 architecture properties implemented (5 test files)
- ✅ CI workflow configured (architecture-verification.yml)
- ✅ 0 boundary violations
- ✅ 21/21 architecture tests passing
- ✅ Pre-commit hooks configured (Husky)

### Verification

```bash
# Check ESLint violations
npm run lint

# Run architecture tests
npm run test:architecture

# Run all tests (includes architecture tests)
npm test

# CI simulation
npm run lint && npm run test:architecture
```

### Violation Example

**ESLint Violation:**

```typescript
// ❌ Bad: Cross-feature import
import { BookingForm } from '@/features/book-car';

// Error: Import from 'features' is not allowed in 'features' layer
```

**Architecture Test Violation:**

```typescript
// ❌ Bad: Widget importing from app layer
import { Providers } from '@/app/providers';

// Test fails: Property 20 violated - widgets cannot import from app
```

## References

- [ESLint plugin-boundaries](https://github.com/javierbrea/eslint-plugin-boundaries)
- [Vitest Documentation](https://vitest.dev/)
- [Backend ModularityTests](https://github.com/TheOdrig/car-rental-api/blob/main/src/test/java/com/akif/ModularityTests.java)
- [Architecture Test Files](../../src/__tests__/architecture/)

## Notes

- ESLint provides fast feedback but can be disabled
- Vitest provides reliable verification but slower feedback
- Both tools are necessary for comprehensive enforcement
- 5 test files enable parallel execution and better organization
- Manual verification is necessary (no FSD framework like Spring Modulith)

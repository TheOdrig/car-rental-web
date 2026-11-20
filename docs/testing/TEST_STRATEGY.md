# Test strategy

Car Rental Web uses Vitest for local behavior and architecture checks and Playwright for browser scenarios. The [Vitest config](../../vitest.config.ts) separates jsdom component tests from Node tests for selected server modules, the proxy and the session endpoint. Component tests use Testing Library, and tests can install HTTP stubs with the [MSW helper](../../src/app/testing/msw.ts).

## Run the local gate

Use Node.js 22 and install dependencies with `npm ci`. Run the full gate before handing off a change.

```bash
bash scripts/verify.sh
```

On Windows, run `./scripts/verify.ps1` from PowerShell. The scripts check Node, tracked paths, lint with zero warnings, contract generation, TypeScript and Vitest. The full run also audits production dependencies and builds the app. Use `--fast` with the shell script or `-Fast` with PowerShell to skip audit and build. There is no hosted CI. [Shell script](../../scripts/verify.sh) · [PowerShell script](../../scripts/verify.ps1)

Husky pre-commit lints eligible staged, non-generated files, type-checks, and runs architecture tests when staged paths include TypeScript or CSS under `src/`. Pre-push runs the fast gate. [Pre-commit runner](../../scripts/pre-commit.mjs) · [Pre-push hook](../../.husky/pre-push)

## What the tests cover

| Check | Coverage |
| --- | --- |
| `npm run contract:check` | Compares the generated types against the committed OpenAPI snapshot and compares the sibling or configured upstream spec when present. [Contract script](../../scripts/contract.mjs) |
| `npm test` | Runs behavior tests and contract assertions for upstream paths, BFF endpoints, error codes, enum labels and accepted enum parameters. [Upstream assertions](../../src/shared/server/__tests__/upstream-contract.test.ts) · [BFF assertions](../../src/app/api/__tests__) |
| `npm run test:architecture` | Focuses on rules including slice boundaries, routing, server/client separation, cache discipline, design tokens and mobile standards. [Architecture suite](../../src/__tests__/architecture) |
| `npm run e2e` | Runs smoke, accessibility and mobile layout checks with an already running web app. [Playwright config](../../playwright.config.ts) · [Browser specs](../../e2e) |
| `npm run test:e2e:stack` | Exercises signed-in flows and server integration against the running API. [Stack setup and coverage](E2E_STACK.md) |

The stack suite needs a local API and runs separately from the gate. Stripe payment component tests use mocks, and the stack uses the API's development payment stub. [Payment UI tests](../../src/features/pay-rental/__tests__/pay-rental.test.tsx)

History — This guide incorporates the active verification decisions from ADR-008.

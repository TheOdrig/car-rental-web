# Contributing to Car Rental Web

Open an issue before starting a contribution so the scope can be agreed. Use Node.js 22, npm and Git. For changes that call the API, follow the [local quick start](README.md#quick-start).

## Working in the repository

- Follow the [developer guide](docs/DEVELOPER_GUIDE.md) for slice boundaries, routing and where to put tests.
- Derive upstream types from the committed OpenAPI snapshot. When an API change lands, run `npm run contract:sync` and include both the snapshot and generated types.
- Keep auth tokens in `HttpOnly` cookies and payments in Stripe test mode.
- Keep TypeScript, scripts, hooks and configuration free of code comments.

## Verify changes

`npm ci` installs the Husky hooks. Keep Husky's configured hooks path. Pre-commit lints eligible staged files and runs the type check, plus architecture tests when source changes. Pre-push runs the fast gate.

Run `bash scripts/verify.sh` or `./scripts/verify.ps1` on Windows. Use [test strategy](docs/testing/TEST_STRATEGY.md) to select additional checks for the behavior you changed.

Use Conventional Commits, such as `fix(booking): preserve form errors`. Keep the subject under 72 characters and describe why the change is needed in the body when useful.

## Report an issue

Include the steps, expected behavior, actual behavior, Node.js version and browser. Report vulnerabilities through the [security policy](SECURITY.md).

By contributing, you agree that your work is released under the [MIT License](LICENSE).

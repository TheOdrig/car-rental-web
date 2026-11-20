# Car Rental Web documentation

Start with the architecture to see how the web app is organized, or use the developer guide to run a local checkout. The web app is an undeployed portfolio project and uses Stripe test mode.

## Architecture & decisions

- [Architecture diagrams](architecture/DIAGRAMS.md) show the layers, request paths and payment flow.
- [Developer guide](DEVELOPER_GUIDE.md) explains where changes belong and how to verify them.
- The decision records explain why the current architecture is structured this way. The original numbering is retained after earlier records were consolidated into these decisions and the API and testing guides.

| Number | Title | Status |
| --- | --- | --- |
| 001 | [Feature-Sliced Design and App Router](adr/ADR-001-fsd-architecture.md) | Accepted |
| 006 | [Styling and shared UI](adr/ADR-006-styling-strategy.md) | Accepted |
| 010 | [Server state, UI state and sessions](adr/ADR-010-session-state-and-event-bus.md) | Accepted |
| 011 | [Backend for frontend and token handling](adr/ADR-011-bff-and-token-handling.md) | Accepted |

## API

- [API client and BFF](api/API_CLIENT.md) covers the endpoint registries, generated types, caching and form errors.

## Security

- [Authentication flow](security/AUTHENTICATION_FLOW.md) explains cookies, refresh, OAuth and mutation guards.
- [Route protection](security/ROUTE_PROTECTION.md) maps each access class to its enforcement points.
- [Security policy](../SECURITY.md) explains how to report a vulnerability privately.

## Testing

- [Test strategy](testing/TEST_STRATEGY.md) explains the local gate and which tests cover each boundary.
- [Stack end-to-end tests](testing/E2E_STACK.md) explains how to run Playwright against the local API.

## Operations and configuration

- [Environment variables](operations/ENVIRONMENT_VARIABLES.md) lists web settings, defaults and validation.
- [Container deployment](operations/DEPLOYMENT.md) describes image build, runtime configuration and health checks.

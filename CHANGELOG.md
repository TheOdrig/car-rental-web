# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Feature-Sliced Design (FSD) architecture refactor (in progress)

### Changed

### Fixed

## [1.0.0] - 2026-01-25

### Added
- Initial production release with monolithic feature structure
- Next.js 16.1 App Router with route groups ((public), (auth), (protected), (admin))
- JWT authentication with HTTP-Only cookies
- OAuth2 integration (Google, GitHub)
- Car browsing and search with filters
- Rental booking flow (search → select → book → confirm)
- User dashboard (my rentals, profile settings)
- Admin dashboard (fleet management, user management, rental approvals)
- Payment integration with Stripe (Planned)
- Damage reporting
- Currency conversion
- Responsive design with Tailwind CSS v4
- Dark/Light mode support
- shadcn/ui component library
- Zustand for client state management
- TanStack Query for server state management
- Vitest + React Testing Library test suite
- TypeScript strict mode
- ESLint + Prettier configuration

### Technical Details
- **Framework**: Next.js 16.1 (App Router)
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS v4 + CSS Variables
- **State Management**: Zustand + TanStack Query
- **UI Components**: shadcn/ui (Radix primitives)
- **Form Handling**: react-hook-form + Zod validation
- **Testing**: Vitest + React Testing Library
- **Deployment**: Vercel

### Known Limitations
- Monolithic component structure (no architectural boundaries)
- No automated boundary verification
- Test coverage below target (< 80%)
- No formal architecture documentation (ADRs missing)
- Tight coupling between features
- Magic strings in business logic

### Notes
- This version represents the pre-FSD refactor state
- v2.0.0 will introduce Feature-Sliced Design architecture

---

[Unreleased]: https://github.com/TheOdrig/car-rental-web/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/TheOdrig/car-rental-web/releases/tag/v1.0.0

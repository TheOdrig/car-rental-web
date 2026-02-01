# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- Comprehensive documentation suite (16 files)
  - Architecture Decision Records (ADR-001 through ADR-009)
  - API Client documentation
  - Authentication flow documentation
  - Deployment guide
  - Architecture diagrams
  - Contributing guidelines

---

## [2.0.0] - 2026-01-15

### Added - FSD Architecture Refactor (Major Version)

**Architecture:**
- Feature-Sliced Design (FSD) 5-layer architecture
- 9 isolated features (auth, book-car, manage-rentals, manage-fleet, manage-users, process-rentals, manage-damages, user-settings, admin)
- 6 domain entities (car, user, rental, currency, damage, payment)
- 8 composite widgets (header, car-filters, car-search, car-booking-card, damage-report, home, layout, rental-dashboard)
- Public API pattern (barrel exports via index.ts)
- Event bus for cross-feature communication

**Boundary Enforcement:**
- ESLint plugin-boundaries configuration
- 21 architecture tests in 5 files (server-client, type-safety, widgets-pages, cache, misc)
- CI integration (architecture-verification.yml)
- 0 boundary violations

**Testing:**
- 47 unit tests (100% passing)
- 21 architecture tests (100% passing)
- Property-based testing with fast-check
- Co-located tests (__tests__/ convention)
- Test utilities (testing/ convention)

**State Management:**
- Zustand for client state
- TanStack Query for server state
- Event-driven communication
- Cache invalidation strategies

**Type Safety:**
- 0 `any` types
- 0 `@ts-ignore` comments
- Exhaustive enum handling
- Discriminated unions
- Type location conventions

**Documentation:**
- FSD_IMPLEMENTATION_ANALYSIS.md (comprehensive architecture analysis)
- DEVELOPER_GUIDE.md (development guidelines)
- Architecture tests documentation

### Changed

**Breaking Changes:**
- Complete project restructure from flat to FSD architecture
- Import paths changed (now use layer-based imports)
- Component locations moved to appropriate layers
- API client split into client-side and server-side

**Migration Guide:**
```typescript
// Before (v1.x)
import { LoginForm } from '@/components/auth/LoginForm';
import { CarCard } from '@/components/cars/CarCard';

// After (v2.x)
import { LoginForm } from '@/features/auth';
import { CarCard } from '@/entities/car';
```

### Removed
- Flat component structure
- Direct cross-component imports
- Unstructured state management

---

## [1.0.0] - 2025-12-01

### Added - Initial Release

**Core Features:**
- Next.js 16.1 App Router
- TypeScript 5.x
- Tailwind CSS v4
- shadcn/ui component library

**Authentication:**
- JWT authentication with HTTP-Only cookies
- OAuth2 integration (Google, GitHub)
- Login, register, logout flows
- Protected routes

**Car Management:**
- Car catalog with filtering
- Car detail pages with availability calendar
- Search functionality
- Dynamic pricing

**Booking System:**
- Booking request flow
- Booking confirmation
- Rental status tracking
- User dashboard

**Admin Features:**
- Admin dashboard with metrics
- Fleet management
- Rental approvals (approve, reject)
- User management

**Payment Integration:**
- Stripe checkout integration
- Payment history
- Refund management

**Damage Reporting:**
- Photo upload
- Damage assessment workflow
- Dispute resolution

**Currency Conversion:**
- Real-time exchange rates
- Multi-currency support
- Currency selector

**UI/UX:**
- Responsive design (mobile-first)
- Dark/light mode
- Accessibility compliant
- Loading states and skeletons
- Error boundaries

**Testing:**
- Vitest setup
- React Testing Library
- Basic unit tests

**Deployment:**
- Vercel deployment configuration
- Environment variable setup
- Docker support

---

## Version History Summary

| Version | Date | Description |
|---------|------|-------------|
| **2.0.0** | 2026-01-15 | FSD architecture refactor (breaking changes) |
| **1.0.0** | 2025-12-01 | Initial production release |

---

## Upgrade Guide

### Upgrading from 1.x to 2.x

**1. Update Import Paths**

All imports must now use layer-based paths:

```typescript
// Old (1.x)
import { LoginForm } from '@/components/auth/LoginForm';
import { useAuth } from '@/hooks/useAuth';
import { CarCard } from '@/components/cars/CarCard';

// New (2.x)
import { LoginForm, useAuth } from '@/features/auth';
import { CarCard } from '@/entities/car';
```

**2. Update Component Usage**

Components now export from public APIs:

```typescript
// Old (1.x)
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// New (2.x) - No change for shared/ui
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
```

**3. Update State Management**

State is now organized by layer:

```typescript
// Old (1.x)
import { useCarStore } from '@/store/carStore';

// New (2.x)
import { useCarStore } from '@/entities/car';
```

**4. Update API Calls**

API client is now in shared layer:

```typescript
// Old (1.x)
import { apiClient } from '@/lib/api';

// New (2.x)
import { apiClient } from '@/shared/api';
```

**5. Run Migration Script**

```bash
# Update dependencies
npm install

# Run type check
npm run type-check

# Run tests
npm test

# Run architecture tests
npm run test:architecture
```

---

## Breaking Changes by Version

### 2.0.0

- **Import paths:** All component imports changed to layer-based paths
- **Project structure:** Flat structure replaced with FSD layers
- **State management:** Store locations moved to appropriate layers
- **API client:** Split into client-side and server-side modules
- **Testing:** Test files moved to co-located __tests__/ directories

---

## Deprecation Notices

### Deprecated in 2.0.0

- ❌ Flat component structure (removed)
- ❌ Direct cross-component imports (removed)
- ❌ Unstructured state management (removed)

---

## Security Updates

### 2.0.0
- Enhanced boundary enforcement (prevents unauthorized cross-layer imports)
- Improved type safety (0 `any` types, 0 `@ts-ignore`)
- Architecture tests ensure security boundaries

### 1.0.0
- HTTP-Only cookies for JWT tokens
- CSRF protection (sameSite: 'lax')
- XSS protection (no token in localStorage)

---

## Performance Improvements

### 2.0.0
- Code splitting by feature (improved bundle size)
- Lazy loading for non-critical features
- Optimized re-renders (isolated feature state)

### 1.0.0
- Next.js Image optimization
- Server Components for static content
- TanStack Query caching

---

## Known Issues

### 2.0.0
- None reported

### 1.0.0
- ~~Flat structure caused tight coupling~~ (Fixed in 2.0.0)
- ~~No boundary enforcement~~ (Fixed in 2.0.0)

---

## Contributors

- **Mehmet Akif Uludag** - Initial work and FSD refactor

---

## Links

- [Repository](https://github.com/TheOdrig/car-rental-web)
- [Backend API](https://github.com/TheOdrig/car-rental-api)
- [Live Demo](https://arabakiralama.site)
- [Documentation](docs/)

---

**Last Updated:** 2026-02-01  
**Maintainer:** Mehmet Akif Uludag

# 🚗 Car Rental Web

A frontend for car rental management, built with **Next.js 16.1** and **TypeScript**.

[![Next.js](https://img.shields.io/badge/Next.js-16.1-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC)](https://tailwindcss.com/)
[![Tests](https://img.shields.io/badge/Tests-843%20passed-brightgreen)](/)
[![License](https://img.shields.io/badge/License-MIT-blue)](LICENSE)

> **🚀 Live Demo:** [arabakiralama.site](https://arabakiralama.site)

---

## 📸 Screenshots

<details open>
<summary><b>🏠 Landing Page</b></summary>

![Landing Page](public/readme/01-landing-page.png)
*Hero section with featured cars and search functionality*

</details>

<details>
<summary><b>🚗 Car Catalog</b></summary>

![Car Catalog](public/readme/02-car-catalog.png)
*Advanced filtering with brand, transmission, fuel type, and availability dates*

</details>

<details>
<summary><b>📊 Admin Dashboard</b></summary>

![Admin Dashboard](public/readme/03-admin-dashboard.png)
*Real-time metrics, alerts, and quick actions for fleet management*

</details>

<details>
<summary><b>🔍 Car Detail</b></summary>

![Car Detail](public/readme/04-car-detail.png)
*Interactive availability calendar and comprehensive vehicle specifications*

</details>

<details>
<summary><b>👤 User Dashboard</b></summary>

![User Dashboard](public/readme/05-user-dashboard.png)
*Rental history and status tracking*

</details>

<details>
<summary><b>🛡️ Admin Fleet Management</b></summary>

![Admin Fleet](public/readme/06-admin-fleet.png)
*Fleet status overview and vehicle management*

</details>

<details>
<summary><b>🌙 Dark Mode Support</b></summary>

![Dark Mode](public/readme/07-dark-mode.png)
*Admin Fleet Management with dark theme - Seamless theme switching*

</details>

---


## ✨ Features

| Feature | Description |
|---------|-------------|
| **Smart Search** | Filter cars by brand, transmission, fuel type, availability dates |
| **Interactive Details** | Real-time availability calendar, comprehensive specs, dynamic pricing |
| **Booking Flow** | Request → Confirm → Pickup → Return workflow with status tracking |
| **User Dashboard** | Manage rentals, view history, update profile, payment methods |
| **Admin Dashboard** | Fleet management, rental approvals, revenue analytics, quick actions |
| **Authentication** | JWT + OAuth2 (Google, GitHub), HTTP-Only cookies, secure sessions |
| **Payment Integration** | Payment history and refund views; Stripe checkout is planned (not yet wired to the API) |
| **Damage Reporting** | Photo upload, assessment workflow, dispute resolution |
| **Currency Conversion** | Real-time exchange rates, multi-currency support |
| **Responsive Design** | Mobile-first, dark/light mode, accessibility compliant |

## 🏗️ Architecture

This frontend uses **Feature-Sliced Design (FSD)** with **Next.js App Router** and API Proxy pattern for secure backend communication.

<details>
<summary>📊 <b>View FSD Layer Diagram</b></summary>

```mermaid
graph TD
    subgraph "App + Pages Layer"
        app[Next.js App Router<br/>Routes, Layouts, Providers]
    end
    
    subgraph "Widget Layer"
        widgets[Composite UI Blocks<br/>8 widgets]
    end
    
    subgraph "Feature Layer"
        features[Business Logic<br/>9 isolated features]
    end
    
    subgraph "Entity Layer"
        entities[Domain Models<br/>6 entities]
    end
    
    subgraph "Shared Layer"
        shared[Infrastructure<br/>API, UI, Utils]
    end
    
    app --> widgets
    app --> features
    app --> entities
    app --> shared
    
    widgets --> features
    widgets --> entities
    widgets --> shared
    
    features --> entities
    features --> shared
    
    entities --> shared
    
    style app fill:#e3f2fd
    style widgets fill:#f3e5f5
    style features fill:#e8f5e9
    style entities fill:#fff3e0
    style shared fill:#fce4ec
```

</details>

<details>
<summary>🔄 <b>View Application Flow</b></summary>

```mermaid
graph TD
    subgraph Client Browser
        UI[React Components]
    end
    
    subgraph Next.js Server
        Pages[App Router Pages]
        Proxy[API Proxy Routes]
        Pages --> Proxy
    end
    
    subgraph State Management
        TQ[TanStack Query<br/>Server State]
        ZS[Zustand<br/>Client State]
    end
    
    subgraph Backend
        API[Spring Boot API<br/>car-rental-api]
    end
    
    UI --> Pages
    UI --> TQ
    UI --> ZS
    Proxy -->|HTTP-Only Cookies| API
    TQ -->|Cache & Revalidate| Proxy
```

</details>

### Route Groups

| Route Group | Purpose | Authentication |
|-------------|---------|----------------|
| `(public)` | Landing, car browsing, search | Public |
| `(auth)` | Login, register, OAuth2 callback | Public |
| `(protected)` | User dashboard, my rentals, settings | Required (USER) |
| `(admin)` | Fleet management, approvals, analytics | Required (ADMIN) |

### API Proxy Pattern

```
Client → Next.js API Route → Backend API
         ↓ (attaches cookie)
         ↓ (handles CORS)
         ↓ (error transformation)
```

**Benefits:**
- ✅ HTTP-Only cookies (XSS protection)
- ✅ No CORS issues
- ✅ Centralized error handling
- ✅ Request/response transformation

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16.1 (App Router) |
| Language | TypeScript 5.x |
| Styling | Tailwind CSS v4, shadcn/ui |
| State Management | Zustand (client), TanStack Query (server) |
| Forms | react-hook-form, Zod validation |
| Testing | Vitest, React Testing Library, fast-check |
| Auth | JWT, OAuth2 (Google, GitHub) |
| Payment | Stripe Elements (Planned) |
| Icons | lucide-react |
| Date | date-fns |

## 🚀 Quick Start

### Prerequisites
- Node.js 20 (see `.nvmrc`)
- Running [Car Rental API](https://github.com/TheOdrig/car-rental) backend

### Setup

```bash
# Clone
git clone https://github.com/TheOdrig/car-rental-web.git
cd car-rental-web

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your backend URL

# Run development server
npm run dev
```

### Access
- **Frontend:** `http://localhost:3000`
- **Backend API:** `http://localhost:8082` (must be running)

## 📱 Pages Overview

### Public Pages
```
/                    # Landing page with featured cars
/cars                # Car catalog with filters
/cars/[id]           # Car details with availability calendar
/about               # About page
/locations           # Rental locations
```

### Authentication
```
/login               # Email/password login
/register            # User registration
/oauth2/callback     # OAuth2 redirect handler
```

### User Dashboard (Protected)
```
/dashboard           # My rentals overview
/dashboard/rentals   # Rental history
/dashboard/settings  # Profile settings
```

### Admin Dashboard (Admin Only)
```
/admin               # Admin overview with metrics
/admin/fleet         # Fleet management
/admin/fleet/[id]    # Vehicle details
/admin/rentals       # Rental approvals
/admin/rentals/[id]  # Rental details
/admin/users         # User management
/admin/users/[id]    # User details
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Architecture tests only
npm run test:architecture

# Coverage report
npm run test:coverage
```

**Test Coverage:**
- 843 tests passing, 6 skipped (68 test files, including the architecture tests)
- 80%+ coverage for auth, book-car, manage-rentals
- FSD boundary verification (0 violations)
- Property-based tests with fast-check

## 📂 Project Structure (FSD Architecture)

```
src/
├── app/                 # App + Pages Layer (Next.js App Router)
│   ├── (public)/        # Public route group
│   ├── (auth)/          # Auth route group
│   ├── (protected)/     # Protected route group
│   ├── (admin)/         # Admin route group
│   ├── api/             # API Proxy Routes
│   ├── layout.tsx       # Root layout
│   └── providers.tsx    # Global providers
├── widgets/             # Widget Layer (Composite UI blocks)
│   ├── header/          # Navigation header
│   ├── car-filters/     # Car filtering widget
│   ├── car-search/      # Search widget
│   ├── car-booking-card/# Booking card widget
│   ├── damage-report/   # Damage reporting widget
│   ├── home/            # Home page widgets
│   ├── layout/          # Layout widgets
│   └── rental-dashboard/# Rental dashboard widget
├── features/            # Feature Layer (Business logic & user actions)
│   ├── auth/            # Authentication feature
│   ├── book-car/        # Car booking feature
│   ├── manage-rentals/  # Rental management feature
│   ├── manage-fleet/    # Fleet management feature
│   ├── manage-users/    # User management feature
│   ├── process-rentals/ # Rental processing feature
│   ├── manage-damages/  # Damage management feature
│   ├── user-settings/   # User settings feature
│   └── admin/           # Admin feature
├── entities/            # Entity Layer (Domain models)
│   ├── car/             # Car entity (types, store, utils, UI)
│   ├── user/            # User entity (types, store, utils)
│   ├── rental/          # Rental entity (types, store, utils)
│   ├── currency/        # Currency entity (types, store, utils, UI)
│   ├── damage/          # Damage entity (types, store, utils, UI)
│   └── payment/         # Payment entity (types)
├── shared/              # Shared Layer (Infrastructure)
│   ├── api/             # API client
│   ├── config/          # Configuration
│   ├── events/          # Event bus
│   ├── lib/             # Utilities
│   ├── types/           # Shared types
│   └── ui/              # UI primitives (shadcn/ui)
└── __tests__/           # Architecture tests
    └── architecture/    # FSD boundary tests
```

**Layer Dependencies (Enforced by ESLint):**
- `app` → `widgets`, `features`, `entities`, `shared`
- `widgets` → `features`, `entities`, `shared`
- `features` → `entities`, `shared` (no cross-feature imports)
- `entities` → `entities` (via `@x`), `shared`
- `shared` → `shared` only

## 🔧 Configuration

Copy `.env.example` to `.env` and adjust it. Configuration covers:
- Backend API URLs (browser vs server-side)
- JWT secret configuration
- OAuth2 providers (Google, GitHub)
- Cache configuration

**Quick Reference:**

```env
# Backend API URL (Browser Access)
NEXT_PUBLIC_API_URL=http://localhost:8082

# Internal API URL (Server-side Access / Docker Network)
API_URL=http://localhost:8082

# JWT Secret - Must match the backend JWT signing key
JWT_SECRET=your-jwt-secret-key-here
```

## 📊 Technical Highlights

- **Feature-Sliced Design** with 5 layers, 9 features, 6 entities, 8 widgets
- **21 Architecture Properties** verified with Vitest + ESLint boundaries
- **843 passing Vitest tests** (68 test files, incl. architecture tests); 6 skipped
- **Type Safety** with 0 `any` types, 0 `@ts-ignore`
- **9 ADRs** documenting architectural decisions
- **API Proxy Pattern** for secure backend communication (HTTP-Only cookies)

## 🤝 Contributing

Contributions are welcome! Please open an issue first for larger changes.

Quick steps:
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Run tests (`npm test`)
4. Commit using [Conventional Commits](https://www.conventionalcommits.org/)
5. Push and open Pull Request

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 👤 Author

**Mehmet Akif Uludag**

[![GitHub](https://img.shields.io/badge/GitHub-TheOdrig-black?logo=github)](https://github.com/TheOdrig)

---

**Backend Repository:** [car-rental-api](https://github.com/TheOdrig/car-rental)

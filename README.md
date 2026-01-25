# 🚗 Car Rental Web

A production-ready frontend for car rental management, built with **Next.js 16.1** and **TypeScript**.

[![Next.js](https://img.shields.io/badge/Next.js-16.1-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC)](https://tailwindcss.com/)
[![Tests](https://img.shields.io/badge/Tests-Passing-brightgreen)](/)
[![License](https://img.shields.io/badge/License-MIT-blue)](LICENSE)


## ✨ Features

| Feature | Description |
|---------|-------------|
| **Smart Search** | Filter cars by brand, transmission, fuel type, availability dates |
| **Interactive Details** | Real-time availability calendar, comprehensive specs, dynamic pricing |
| **Booking Flow** | Request → Confirm → Pickup → Return workflow with status tracking |
| **User Dashboard** | Manage rentals, view history, update profile, payment methods |
| **Admin Dashboard** | Fleet management, rental approvals, revenue analytics, quick actions |
| **Authentication** | JWT + OAuth2 (Google, GitHub), HTTP-Only cookies, secure sessions |
| **Payment Integration** | Stripe checkout (Planned), payment history, refund management |
| **Damage Reporting** | Photo upload, assessment workflow, dispute resolution |
| **Currency Conversion** | Real-time exchange rates, multi-currency support |
| **Responsive Design** | Mobile-first, dark/light mode, accessibility compliant |

## 🏗️ Architecture

This frontend uses **Next.js App Router** with API Proxy pattern for secure backend communication.

<details>
<summary>📊 <b>View Application Structure</b></summary>

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
        API[car-rental-api]
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


## ✨ Key Features

### 🌍 Public & Customer Features
*   **Smart Search & Filtering**: Filter cars by brand, transmission, fuel type, and availability dates.
*   **Interactive Car Details**: View comprehensive specs, pricing, and real-time availability calendars.
*   **Seamless Booking Flow**: Easy-to-use rental request system with instant feedback using Toast notifications.
*   **User Dashboard**: Track rental status (Requested, Confirmed, In Use, Returned) and manage active bookings.
*   **Secure Authentication**:
    *   Email/Password Login & Registration.
    *   OAuth2 Integration (Google & GitHub).
    *   Secure Session Management via HTTP-Only Cookies.

### 🛡️ Admin Dashboard
*   **Live Metrics**: Real-time overview of total rentals, revenue, and active fleet status.
*   **Fleet Management**: Visual status of the entire fleet (Available, Rented, Maintenance).
*   **Rental Operations**:
    *   **Approval Workflow**: Review and approve/reject incoming rental requests.
    *   **Handover Management**: Process vehicle pickups and returns with condition checks.
    *   **Quick Actions**: Fast access to common tasks like "Process Return" or "Approve Pending".

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
- Node.js 18+ (LTS recommended)
- Running [Car Rental API](https://github.com/TheOdrig/car-rental-api) backend

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

# Coverage report
npm run test:coverage
```

**Test Strategy:**
- Unit tests for components and hooks
- Integration tests for critical flows

**Current Status:** Tests passing, coverage below target (v1.0.0 baseline)

## 📂 Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── (public)/        # Public pages
│   ├── (auth)/          # Auth pages
│   ├── (protected)/     # User dashboard
│   ├── (admin)/         # Admin dashboard
│   └── api/             # API Proxy Routes
├── components/          # React Components
│   ├── ui/              # shadcn/ui primitives
│   ├── cars/            # Car components
│   ├── rentals/         # Rental components
│   ├── admin/           # Admin components
│   └── shared/          # Shared components
├── lib/                 # Business Logic
│   ├── api/             # API client (server/client)
│   ├── hooks/           # Custom hooks
│   ├── stores/          # Zustand stores
│   ├── utils/           # Utilities
│   └── validations/     # Zod schemas
├── types/               # TypeScript types
└── tests/               # Test files
```

## 🔧 Configuration

See `.env.example` for required environment variables:

```env
# Backend API
NEXT_PUBLIC_API_URL=http://localhost:8082/api
BACKEND_URL=http://localhost:8082

# OAuth2 (optional)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
NEXT_PUBLIC_GITHUB_CLIENT_ID=your_github_client_id
```


📖 See [FSD Refactor Spec](.kiro/specs/frontend-architecture-fsd/) for details.

## 🤝 Contributing

Contributions are welcome! Please read the contributing guidelines before submitting a pull request.

Quick steps:
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Run tests (`npm test`)
4. Commit using [Conventional Commits](https://www.conventionalcommits.org/)
5. Push and open Pull Request

## 📋 Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history and notable changes.

## 📝 Documentation

- **[CHANGELOG.md](CHANGELOG.md)** - Version history and release notes


## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 👤 Author

**Mehmet Akif Uludag**

[![GitHub](https://img.shields.io/badge/GitHub-TheOdrig-black?logo=github)](https://github.com/TheOdrig)

---

**Backend Repository:** [car-rental-api](https://github.com/TheOdrig/car-rental-api)

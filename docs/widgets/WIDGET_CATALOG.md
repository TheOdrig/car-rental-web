# Widget Catalog

**Last Updated:** 2026-02-01  
**Maintainer:** Mehmet Akif Uludag

This catalog documents all 8 widgets in the Car Rental Web application. Widgets are composite UI blocks that combine features and entities.

---

## Table of Contents

1. [header](#1-header---site-wide-navigation)
2. [car-filters](#2-car-filters---car-filtering-widget)
3. [car-search](#3-car-search---search-widget)
4. [car-booking-card](#4-car-booking-card---booking-card-widget)
5. [damage-report](#5-damage-report---damage-reporting-widget)
6. [home](#6-home---home-page-widgets)
7. [layout](#7-layout---layout-widgets)
8. [rental-dashboard](#8-rental-dashboard---rental-dashboard-widget)

---

## 1. header - Site-Wide Navigation

**Purpose:** Site-wide navigation bar with logo, navigation links, user menu, and mobile navigation.

**Location:** `src/widgets/header/`

### Public API

**Components:**
- `Header` - Main header component
- `MobileNav` - Mobile navigation drawer

### Composed Features

- `auth` - Login button, user menu, logout
- `user-settings` - Profile link

### Composed Entities

- `user` - User avatar, user name

### Usage Examples

**Used in:**
- `app/layout.tsx` - Root layout (all pages)

**Example:**
```typescript
import { Header } from '@/widgets/header';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Header />
        {children}
      </body>
    </html>
  );
}
```

### Features

- Responsive design (desktop + mobile)
- User authentication state (logged in/out)
- Role-based navigation (user vs admin)
- Mobile drawer navigation
- Theme toggle (dark/light mode)

---

## 2. car-filters - Car Filtering Widget

**Purpose:** Car filtering interface with brand, transmission, fuel type, price range, and date filters.

**Location:** `src/widgets/car-filters/`

### Public API

**Components:**
- `CarFilters` (alias: `FilterPanel`) - Main filter panel
- `ActiveFilters` (alias: `FilterChips`) - Active filter chips
- `FilterSidebar` - Sidebar filter panel
- `SortDropdown` - Sort options dropdown
- `ViewToggle` - Grid/List view toggle

**Hooks:**
- `useFilterOptions()` - Fetch filter options (brands, fuel types, etc.)
- `useFilterStore()` - Filter state management

**Query Keys:**
- `filterOptionsKeys` - TanStack Query keys

**Types:**
- `FilterOptions` - Available filter options
- `ViewMode` - Grid or list view (from car entity)
- `SortOption` - Sort options (from car entity)

### Composed Features

None (pure UI composition)

### Composed Entities

- `car` - Car types, filter types, sort options

### Usage Examples

**Used in:**
- `app/(public)/cars/page.tsx` - Car listings page

**Example:**
```typescript
import { FilterSidebar, ActiveFilters, SortDropdown, ViewToggle } from '@/widgets/car-filters';

export default function CarsPage() {
  return (
    <div>
      <FilterSidebar />
      <div>
        <ActiveFilters />
        <SortDropdown />
        <ViewToggle />
        {/* Car list */}
      </div>
    </div>
  );
}
```

### Features

- Brand filter (multi-select)
- Transmission filter (automatic, manual)
- Fuel type filter (petrol, diesel, electric, hybrid)
- Price range filter (slider)
- Date range filter (availability)
- Active filter chips (removable)
- Sort options (price, rating, year)
- View toggle (grid/list)
- Filter persistence (URL params)

---

## 3. car-search - Search Widget

**Purpose:** Car search widget with location and date selection.

**Location:** `src/widgets/car-search/`

### Public API

**Components:**
- `CarSearch` - Main search widget

### Composed Features

None (pure UI composition)

### Composed Entities

- `car` - Car search types

### Usage Examples

**Used in:**
- `app/(public)/page.tsx` - Home page
- `widgets/home/ui/search-widget.tsx` - Home search section

**Example:**
```typescript
import { CarSearch } from '@/widgets/car-search';

export default function HomePage() {
  return (
    <div>
      <CarSearch />
    </div>
  );
}
```

### Features

- Location selection (pickup/dropoff)
- Date range picker (start/end date)
- Time selection
- Search button
- Responsive design
- Form validation

---

## 4. car-booking-card - Booking Card Widget

**Purpose:** Car booking card with price, availability, and booking button.

**Location:** `src/widgets/car-booking-card/`

### Public API

**Components:**
- `CarBookingCard` - Booking card component

### Composed Features

- `book-car` - Booking form, pricing

### Composed Entities

- `car` - Car details
- `rental` - Rental pricing
- `currency` - Currency conversion

### Usage Examples

**Used in:**
- `app/(public)/cars/[id]/page.tsx` - Car detail page

**Example:**
```typescript
import { CarBookingCard } from '@/widgets/car-booking-card';

export default function CarDetailPage({ params }) {
  return (
    <div>
      {/* Car details */}
      <CarBookingCard carId={params.id} />
    </div>
  );
}
```

### Features

- Daily price display
- Total price calculation
- Currency conversion
- Availability check
- Date selection
- Booking button
- Price breakdown
- Discount display
- Sticky positioning (desktop)

---

## 5. damage-report - Damage Reporting Widget

**Purpose:** Damage reporting widget with photo upload and damage assessment.

**Location:** `src/widgets/damage-report/`

### Public API

**Note:** This widget does not have an index.ts file. Components are accessed directly.

### Composed Features

- `manage-damages` - Damage reporting, photo upload

### Composed Entities

- `damage` - Damage types, severity
- `rental` - Rental association

### Usage Examples

**Used in:**
- `app/(protected)/rentals/[id]/damage/page.tsx` - Damage report page
- `app/(admin)/admin/rentals/[id]/page.tsx` - Admin rental detail

**Example:**
```typescript
// Direct import (no public API)
import { DamageReportForm } from '@/widgets/damage-report/ui/damage-report-form';

export default function DamageReportPage({ params }) {
  return (
    <div>
      <DamageReportForm rentalId={params.id} />
    </div>
  );
}
```

### Features

- Photo upload (multiple)
- Damage description
- Severity selection
- Location marking
- Photo preview
- Damage assessment (admin)
- Dispute handling

---

## 6. home - Home Page Widgets

**Purpose:** Home page widgets including hero section, featured cars, promotional banners, and testimonials.

**Location:** `src/widgets/home/`

### Public API

**Components:**
- `HeroSection` - Hero section with CTA
- `FeaturedCarousel`, `FeaturedCarouselSkeleton` - Featured cars carousel
- `PromotionalBanners` - Promotional banners
- `SearchWidget` - Home page search
- `Testimonials` - Customer testimonials

### Composed Features

- `book-car` - Search functionality

### Composed Entities

- `car` - Featured cars, car cards

### Usage Examples

**Used in:**
- `app/(public)/page.tsx` - Home page

**Example:**
```typescript
import {
  HeroSection,
  FeaturedCarousel,
  PromotionalBanners,
  SearchWidget,
  Testimonials,
} from '@/widgets/home';

export default function HomePage() {
  return (
    <div>
      <HeroSection />
      <SearchWidget />
      <FeaturedCarousel />
      <PromotionalBanners />
      <Testimonials />
    </div>
  );
}
```

### Features

- Hero section with background image
- Call-to-action buttons
- Featured cars carousel (auto-scroll)
- Promotional banners (discounts, offers)
- Customer testimonials
- Responsive design
- Loading skeletons

---

## 7. layout - Layout Widgets

**Purpose:** Layout widgets including breadcrumb navigation and footer.

**Location:** `src/widgets/layout/`

### Public API

**Components:**
- `Breadcrumb` - Breadcrumb navigation
- `Footer` - Site footer

### Composed Features

None (pure UI composition)

### Composed Entities

None (pure UI composition)

### Usage Examples

**Used in:**
- `app/layout.tsx` - Root layout (breadcrumb)
- `app/layout.tsx` - Root layout (footer)

**Example:**
```typescript
import { Breadcrumb, Footer } from '@/widgets/layout';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Header />
        <Breadcrumb />
        {children}
        <Footer />
      </body>
    </html>
  );
}
```

### Features

**Breadcrumb:**
- Dynamic breadcrumb generation
- Current page highlighting
- Clickable navigation
- Responsive design

**Footer:**
- Company information
- Navigation links
- Social media links
- Copyright notice
- Newsletter signup
- Responsive design

---

## 8. rental-dashboard - Rental Dashboard Widget

**Purpose:** User rental dashboard with statistics and recent rentals.

**Location:** `src/widgets/rental-dashboard/`

### Public API

**Components:**
- `Dashboard` - Main dashboard component
- `StatsCard` - Statistics card
- `RecentRentals` - Recent rentals list

### Composed Features

- `manage-rentals` - Rental list, rental stats

### Composed Entities

- `rental` - Rental data, rental cards
- `car` - Car details

### Usage Examples

**Used in:**
- `app/(protected)/dashboard/page.tsx` - User dashboard

**Example:**
```typescript
import { Dashboard, StatsCard, RecentRentals } from '@/widgets/rental-dashboard';

export default function DashboardPage() {
  return (
    <div>
      <Dashboard />
      {/* Or compose manually */}
      <div>
        <StatsCard />
        <RecentRentals />
      </div>
    </div>
  );
}
```

### Features

- Rental statistics (total, active, upcoming, completed)
- Recent rentals list
- Quick actions (view, cancel)
- Status badges
- Responsive design
- Loading states

---

## Widget Composition Rules

### What Widgets Should Do

✅ **Compose features and entities**
```typescript
// ✅ CORRECT: Widget composes features
import { LoginButton } from '@/features/auth';
import { UserMenu } from '@/features/user-settings';

export function Header() {
  return (
    <header>
      <LoginButton />
      <UserMenu />
    </header>
  );
}
```

✅ **Handle layout and positioning**
```typescript
// ✅ CORRECT: Widget handles layout
export function Header() {
  return (
    <header className="flex justify-between items-center">
      {/* Composed features */}
    </header>
  );
}
```

✅ **Manage widget-level UI state**
```typescript
// ✅ CORRECT: Widget manages UI state (accordion open/closed)
export function FilterSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <aside>
      <button onClick={() => setIsOpen(!isOpen)}>Toggle</button>
      {isOpen && <FilterPanel />}
    </aside>
  );
}
```

### What Widgets Should NOT Do

❌ **Implement business logic**
```typescript
// ❌ WRONG: Widget implements business logic
export function Header() {
  const handleLogin = async (email, password) => {
    // Business logic belongs in features
  };
}
```

❌ **Make API calls**
```typescript
// ❌ WRONG: Widget makes API calls
export function Header() {
  const { data } = useQuery({
    queryKey: ['user'],
    queryFn: fetchUser,  // API calls belong in features
  });
}
```

❌ **Import from other widgets**
```typescript
// ❌ WRONG: Widget imports from another widget
import { FilterPanel } from '@/widgets/car-filters';  // ❌ Cross-widget import
```

---

## Widget Isolation

Widgets cannot import from other widgets. Each widget is independent.

**Example:**
```typescript
// ❌ WRONG: Cross-widget import
import { Header } from '@/widgets/header';

// ✅ CORRECT: Compose in page
import { Header } from '@/widgets/header';
import { Footer } from '@/widgets/layout';

export default function Layout({ children }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}
```

---

## Widget Testing

Widgets should have integration tests that verify composition:

```typescript
// src/widgets/header/__tests__/header.test.tsx
import { render, screen } from '@testing-library/react';
import { Header } from '../ui/header';

test('should render login button when not authenticated', () => {
  render(<Header />);
  expect(screen.getByText('Login')).toBeInTheDocument();
});

test('should render user menu when authenticated', () => {
  // Mock authenticated state
  render(<Header />);
  expect(screen.getByText('Profile')).toBeInTheDocument();
});
```

---

## Coverage Summary

| Widget | Has Tests | Notes |
|--------|-----------|-------|
| header | ❌ | Needs tests |
| car-filters | ✅ | 75.3% coverage |
| car-search | ❌ | Needs tests |
| car-booking-card | ❌ | Needs tests |
| damage-report | ❌ | Needs tests |
| home | ✅ | 68.2% coverage |
| layout | ❌ | Needs tests |
| rental-dashboard | ❌ | Needs tests |

**Overall Widget Coverage:** 2/8 widgets tested (25%)

---

**For detailed FSD guide, see [FSD_GUIDE.md](../architecture/FSD_GUIDE.md)**  
**For testing strategy, see [TEST_STRATEGY.md](../testing/TEST_STRATEGY.md)**  
**For contribution guidelines, see [CONTRIBUTING.md](../../CONTRIBUTING.md)**

**Last Updated:** 2026-02-01  
**Maintainer:** Mehmet Akif Uludag

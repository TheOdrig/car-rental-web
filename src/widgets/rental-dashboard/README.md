# Rental Dashboard Widget

User rental dashboard with stats and recent rentals.

## Public API

```typescript
// UI
export { Dashboard } from './ui/dashboard';
export { StatsCard } from './ui/stats-card';
export { RecentRentals } from './ui/recent-rentals';
```

## Usage

Orchestrates stats cards and recent rentals list. Composes manage-rentals feature components.

## FSD Rules

- Can import from `@/features`, `@/entities`, `@/shared`
- Export via `index.ts` (public API)
- Widgets CAN depend on features (composition layer)

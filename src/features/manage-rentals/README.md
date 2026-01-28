# Manage Rentals Feature

Rental management for viewing and managing rental requests.

## Public API

```typescript
// Types
export type { RentalFilter, RentalAction, RentalActionRequest, RentalListItem, PaginatedRentals };

// API
export { getRentals, getRentalById, performRentalAction, cancelRental, updateRental };

// State
export { rentalActions };
export { RENTAL_EVENTS, publishRentalApproved, publishRentalRejected, ... };

// UI
export { RentalList, RentalActions, RentalCard, RentalDetail, RentalForm, RentalStats, RentalTabs, RentalTimeline };
// Skeleton variants: RentalListSkeleton, RentalActionsSkeleton, etc.
```

## FSD Rules

- Import only from `@/shared` and `@/entities`
- Export via `index.ts` (public API)
- No cross-feature imports

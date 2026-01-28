# Book Car Feature

Car booking and reservation functionality.

## Public API

```typescript
// Types
export type { BookingRequest, Booking, AvailabilityFilters, AvailableCar };

// API
export { createBooking, getAvailableCars, getBooking, cancelBooking };

// State
export { bookingActions };
export { BOOKING_EVENTS };

// UI
export { BookingForm, BookingSuccess, BookingFailure };
```

## FSD Rules

- Import only from `@/shared` and `@/entities`
- Export via `index.ts` (public API)
- No cross-feature imports

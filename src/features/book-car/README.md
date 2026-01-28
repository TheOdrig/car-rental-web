# book-car

Car booking/reservation feature.

## Structure

```
book-car/
├── api/       # API integration
├── model/     # Types and business logic
├── ui/        # Components
└── lib/       # Utilities
```

## Usage

```typescript
import { BookingRequest, createBooking } from '@/features/book-car';

const booking: BookingRequest = {
  carId: 1,
  startDate: '2025-02-01T00:00:00Z',
  endDate: '2025-02-05T00:00:00Z',
};
```

## FSD Rules

- Only import from `shared/` and `entities/`
- Export via `index.ts` (public API)
- No cross-feature imports

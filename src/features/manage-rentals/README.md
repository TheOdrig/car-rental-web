# manage-rentals

Rental management feature for viewing and managing rental requests.

## Structure

```
manage-rentals/
├── api/       # API integration
├── model/     # Types and business logic
├── ui/        # Components
└── lib/       # Utilities
```

## Usage

```typescript
import { RentalFilter, getRentals } from '@/features/manage-rentals';

const filter: RentalFilter = {
  status: 'Requested',
};
```

## FSD Rules

- Only import from `shared/` and `entities/`
- Export via `index.ts` (public API)
- No cross-feature imports

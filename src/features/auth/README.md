# auth

Authentication feature (login, register, logout).

## Structure

```
auth/
├── api/       # API integration
├── model/     # Types, schemas, and store
├── ui/        # Form components
└── lib/       # Validation utilities
```

## Usage

```typescript
import { authActions, LoginForm } from '@/features/auth';

// Login action
const result = await authActions.login({
  email: 'user@example.com',
  password: 'password123',
});

// UI component
<LoginForm />
```

## FSD Rules

- Only import from `shared/` and `entities/`
- Export via `index.ts` (public API)
- No cross-feature imports

# Auth Feature

Authentication and user management functionality.

## Public API

```typescript
// Types
export type { LoginRequest, RegisterRequest, AuthResponse };

// API
export { login, register, logout };

// State
export { authActions };
export { AUTH_EVENTS };

// UI
export { LoginForm, RegisterForm, FormError, PasswordStrengthIndicator };
```

## FSD Rules

- Import only from `@/shared` and `@/entities`
- Export via `index.ts` (public API)
- No cross-feature imports

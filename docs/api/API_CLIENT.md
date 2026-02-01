# API Client Documentation

This document describes the API client architecture, request handling, error management, and usage patterns in the CarRental frontend.

---

## Overview

The API client provides a unified interface for making HTTP requests to the backend API. It handles:
- **Client-side requests** (`clientFetch`) with automatic token refresh
- **Server-side requests** (`serverFetch`) with cookie-based authentication
- **Error handling** with typed `ApiError` exceptions
- **Type safety** with TypeScript generics

---

## Architecture

### File Structure

```
src/shared/api/
├── client.ts       # Client-side fetch wrapper (browser)
├── server.ts       # Server-side fetch wrapper (Next.js Server Components)
├── error.ts        # Error handling and ApiError class
├── types.ts        # Request/response type definitions
└── index.ts        # Public API exports
```

### Design Principles

1. **Separation of Concerns**: Client and server fetch logic are isolated
2. **Type Safety**: All requests/responses are strongly typed
3. **Error Consistency**: Unified error handling across all API calls
4. **Token Management**: Automatic refresh on 401 responses (client-side only)

---

## Client-Side API (`clientFetch`)

Used in **Client Components** and browser-side code.

### Features

- **Automatic Token Refresh**: Retries failed requests after refreshing access token
- **Credentials Included**: Sends cookies with every request
- **Query Parameters**: Automatic URL parameter serialization
- **Abort Signal Support**: Request cancellation via `AbortController`

### Usage

```typescript
import { apiClient } from '@/shared/api';

// GET request
const cars = await apiClient.get<Car[]>('/api/cars', {
  params: { location: 'Istanbul', available: true }
});

// POST request
const booking = await apiClient.post<BookingConfirmation>('/api/bookings', {
  carId: 123,
  startDate: '2024-01-01',
  endDate: '2024-01-07'
});

// PUT request
const updated = await apiClient.put<User>('/api/users/me', {
  firstName: 'John',
  lastName: 'Doe'
});

// DELETE request
await apiClient.delete('/api/bookings/456');
```

### Token Refresh Flow

```
1. Request fails with 401 Unauthorized
2. Check if already refreshing (prevent duplicate refresh calls)
3. Call /api/auth/refresh endpoint
4. If refresh succeeds → Retry original request
5. If refresh fails → Throw ApiError
```

**Implementation Details:**
- Uses singleton pattern (`isRefreshing` flag) to prevent concurrent refresh requests
- Skips refresh for `/api/auth/login` and `/api/auth/refresh` endpoints
- Only retries once (`isRetry` flag prevents infinite loops)

---

## Server-Side API (`serverFetch`)

Used in **Server Components**, **Server Actions**, and API routes.

### Features

- **Cookie-Based Auth**: Reads `access_token` from Next.js cookies
- **Next.js Cache Integration**: Supports `cache`, `revalidate`, and `tags` options
- **No Token Refresh**: Server-side requests don't auto-refresh (stateless)

### Usage

```typescript
import { serverApi } from '@/shared/api';

// Server Component with caching
export default async function CarsPage() {
  const cars = await serverApi.get<Car[]>('/api/cars', {
    cache: 'force-cache',
    revalidate: 3600, // 1 hour
    tags: ['cars']
  });

  return <CarList cars={cars} />;
}

// Server Action
'use server';
export async function updateProfile(data: UpdateProfileRequest) {
  return serverApi.put<User>('/api/users/me', data);
}
```

### Cache Strategies

| Strategy | Use Case | Example |
|----------|----------|---------|
| `force-cache` | Static data | Car models, locations |
| `no-store` | Dynamic data | User profile, bookings |
| `revalidate: N` | Time-based | Car availability (60s) |
| `tags: [...]` | On-demand | Invalidate after mutation |

---

## Error Handling

### ApiError Class

```typescript
class ApiError extends Error {
  status: number;           // HTTP status code
  errors?: Record<string, string>; // Validation errors
  timestamp: string;        // ISO timestamp
  path?: string;           // Request path
  data?: unknown;          // Additional error data
}
```

### Usage in Components

```typescript
import { isApiError, getErrorMessage } from '@/shared/api';

try {
  await apiClient.post('/api/bookings', data);
} catch (error) {
  if (isApiError(error)) {
    if (error.status === 409) {
      toast.error('Car is already booked for these dates');
    } else if (error.errors) {
      // Handle validation errors
      Object.entries(error.errors).forEach(([field, message]) => {
        setFieldError(field, message);
      });
    } else {
      toast.error(error.message);
    }
  } else {
    toast.error(getErrorMessage(error));
  }
}
```

### Backend Error Format

The API client expects errors in this format:

```json
{
  "status": 400,
  "message": "Validation failed",
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/bookings",
  "errors": {
    "startDate": "Start date must be in the future",
    "endDate": "End date must be after start date"
  }
}
```

---

## Feature-Specific API Modules

Each feature defines its own API functions using the shared client.

### Pattern

```
src/features/{feature-name}/
├── api/
│   ├── {feature}-api.ts    # API functions
│   └── endpoints.ts        # Endpoint constants
```

### Example: Auth Feature

**File:** `src/features/auth/api/auth-api.ts`

```typescript
import { apiClient, ApiError } from '@/shared/api';
import { LoginRequest, RegisterRequest, AuthResponse } from '../model/types';

export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  return apiClient.post<AuthResponse>('/auth/login', data);
};

export const register = async (data: RegisterRequest): Promise<AuthResponse> => {
  return apiClient.post<AuthResponse>('/auth/register', data);
};

export const handleAuthError = (error: unknown): string => {
  if (error instanceof ApiError) {
    if (error.status === 401) return 'Invalid credentials';
    if (error.status === 409) return 'Email already exists';
  }
  return 'Authentication failed';
};
```

**File:** `src/features/auth/api/endpoints.ts`

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8082';

export const AUTH_ENDPOINTS = {
  login: `${API_BASE_URL}/api/auth/login`,
  register: `${API_BASE_URL}/api/auth/register`,
  refresh: `${API_BASE_URL}/api/auth/refresh`,
  me: `${API_BASE_URL}/api/auth/me`,
} as const;
```

### Example: Booking Feature

**File:** `src/features/book-car/api/booking-api.ts`

```typescript
import { apiClient } from '@/shared/api';
import type { CreateBookingRequest, BookingConfirmation } from '../model/types';
import { BOOKING_ENDPOINTS } from './endpoints';

export async function createBooking(request: CreateBookingRequest): Promise<BookingConfirmation> {
  return apiClient.post<BookingConfirmation>(BOOKING_ENDPOINTS.CREATE, request);
}
```

---

## Request Options

### Client Request Options

```typescript
interface ClientRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;                    // Request body (auto-serialized to JSON)
  headers?: Record<string, string>;  // Additional headers
  params?: Record<string, unknown>;  // Query parameters
  signal?: AbortSignal;              // Abort controller signal
}
```

### Server Request Options

```typescript
interface ServerRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
  params?: Record<string, unknown>;
  cache?: RequestCache;              // Next.js cache strategy
  revalidate?: number | false;       // Revalidation interval (seconds)
  tags?: string[];                   // Cache tags for invalidation
}
```

---

## Best Practices

### 1. Use Feature-Specific API Modules

❌ **Don't** call `apiClient` directly in components:

```typescript
// Bad
const cars = await apiClient.get<Car[]>('/api/cars');
```

✅ **Do** create feature-specific API functions:

```typescript
// Good
// src/features/browse-cars/api/cars-api.ts
export const getCars = (filters: CarFilters) => 
  apiClient.get<Car[]>('/api/cars', { params: filters });

// Component
const cars = await getCars({ location: 'Istanbul' });
```

### 2. Handle Errors Gracefully

```typescript
try {
  const result = await createBooking(data);
  toast.success('Booking created successfully');
  router.push(`/bookings/${result.id}`);
} catch (error) {
  if (isApiError(error)) {
    if (error.status === 409) {
      toast.error('Car is already booked');
    } else if (error.errors) {
      // Show validation errors
      setErrors(error.errors);
    } else {
      toast.error(error.message);
    }
  } else {
    toast.error('An unexpected error occurred');
  }
}
```

### 3. Use Proper Cache Strategies

```typescript
// Static data - cache aggressively
const locations = await serverApi.get<Location[]>('/api/locations', {
  cache: 'force-cache',
  revalidate: 86400 // 24 hours
});

// Dynamic data - no cache
const userBookings = await serverApi.get<Booking[]>('/api/bookings/me', {
  cache: 'no-store'
});

// Time-sensitive data - short revalidation
const carAvailability = await serverApi.get<Availability>(`/api/cars/${id}/availability`, {
  revalidate: 60 // 1 minute
});
```

### 4. Type Your Responses

```typescript
// Define response types
interface CarListResponse {
  cars: Car[];
  total: number;
  page: number;
}

// Use in API calls
const response = await apiClient.get<CarListResponse>('/api/cars', {
  params: { page: 1, limit: 20 }
});
```

---

## Backend Alignment

### Spring Boot Backend

The backend uses Spring Boot with similar patterns:

- **RestTemplate/WebClient**: HTTP client (equivalent to `fetch`)
- **@RestControllerAdvice**: Global error handling (equivalent to `ApiError`)
- **JWT Filter**: Token validation (equivalent to client-side refresh)

### Error Response Format

Both frontend and backend use the same error structure:

```typescript
{
  status: number;
  message: string;
  timestamp: string;
  path?: string;
  errors?: Record<string, string>;
}
```

This ensures consistent error handling across the stack.

---

## Related Documentation

- [Authentication Flow](../security/AUTHENTICATION_FLOW.md) - Token refresh and auth flow
- [ADR-002: State Management](../adr/ADR-002-state-management.md) - TanStack Query integration
- [Backend API Documentation](https://github.com/TheOdrig/car-rental-api/blob/main/docs/api/README.md) - Backend API reference

---

## Troubleshooting

### Issue: 401 Errors Not Refreshing

**Cause:** Token refresh is disabled for certain endpoints or already retrying.

**Solution:** Check that:
1. Endpoint is not `/api/auth/login` or `/api/auth/refresh`
2. Request is not already a retry (`isRetry` flag)
3. Refresh endpoint returns 200 OK

### Issue: CORS Errors

**Cause:** Backend not configured to accept credentials.

**Solution:** Ensure backend has:
```java
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
```

### Issue: Server Components Not Authenticated

**Cause:** `access_token` cookie not being read.

**Solution:** Check:
1. Cookie is set with `httpOnly: true`
2. Cookie domain matches request domain
3. Using `serverApi` (not `apiClient`) in Server Components

---

**Last Updated:** 2026-02-01  
**Maintainer:** Mehmet Akif Uludag

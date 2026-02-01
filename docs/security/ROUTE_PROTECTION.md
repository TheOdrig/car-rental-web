# Route Protection

**Last Updated:** 2026-02-01  
**Maintainer:** Mehmet Akif Uludag

This document explains route protection and access control in the Car Rental Web application using Next.js App Router layouts.

---

## Table of Contents

1. [Overview](#overview)
2. [Route Groups](#route-groups)
3. [Protection Mechanism](#protection-mechanism)
4. [Role-Based Access Control](#role-based-access-control)
5. [Redirect Logic](#redirect-logic)
6. [Event-Driven Session Management](#event-driven-session-management)
7. [Backend Alignment](#backend-alignment)

---

## Overview

Route protection in Next.js App Router is implemented using **layout-based authentication checks**. Each route group has a layout that verifies authentication and authorization before rendering child pages.

**Key Concepts:**
- **Route Groups:** Organize routes by access level `(public)`, `(auth)`, `(protected)`, `(admin)`
- **Layout Protection:** Layouts check authentication/authorization and redirect if needed
- **Server-Side:** All checks happen server-side (secure)
- **Token-Based:** Uses JWT tokens stored in HTTP-Only cookies

---

## Route Groups

### 1. (public) - Public Routes

**Location:** `src/app/(public)/`

**Access:** Anyone (no authentication required)

**Routes:**
- `/` - Home page
- `/cars` - Car listings
- `/cars/[id]` - Car detail
- `/search` - Search results
- `/booking/[id]` - Booking page (pre-checkout)

**Layout:** `src/app/(public)/layout.tsx`

**Protection:** None (public access)

```typescript
// src/app/(public)/layout.tsx
export default function PublicLayout({ children }) {
  return <>{children}</>;
}
```

---

### 2. (auth) - Authentication Routes

**Location:** `src/app/(auth)/`

**Access:** Unauthenticated users only (redirects if already logged in)

**Routes:**
- `/login` - Login page
- `/register` - Registration page
- `/forgot-password` - Password reset request
- `/reset-password` - Password reset confirmation
- `/callback` - OAuth2 callback

**Layout:** `src/app/(auth)/layout.tsx`

**Protection:** None (but typically redirects authenticated users to dashboard)

```typescript
// src/app/(auth)/layout.tsx
export default function AuthLayout({ children }) {
  // No protection - anyone can access
  // Could add redirect if already authenticated
  return (
    <div className="auth-layout">
      {/* Auth-specific layout (split screen, branding) */}
      {children}
    </div>
  );
}
```

---

### 3. (protected) - User Routes

**Location:** `src/app/(protected)/`

**Access:** Authenticated users (USER or ADMIN role)

**Routes:**
- `/dashboard` - User dashboard
- `/rentals` - My rentals
- `/rentals/[id]` - Rental detail
- `/settings` - User settings
- `/damages` - Damage reports

**Layout:** `src/app/(protected)/layout.tsx`

**Protection:** Requires valid JWT token

```typescript
// src/app/(protected)/layout.tsx
import { redirect } from 'next/navigation';
import { getAccessToken } from '@/features/auth';

export default async function ProtectedLayout({ children }) {
  const token = await getAccessToken();

  if (!token) {
    redirect('/login');  // Redirect to login if not authenticated
  }

  return <>{children}</>;
}
```

**Flow:**
1. Layout runs on server
2. Check for access token (HTTP-Only cookie)
3. If no token → redirect to `/login`
4. If token exists → render children

---

### 4. (admin) - Admin Routes

**Location:** `src/app/(admin)/`

**Access:** Admin users only (ADMIN role required)

**Routes:**
- `/admin` - Admin dashboard
- `/admin/rentals` - Rental management
- `/admin/rentals/[id]` - Rental detail
- `/admin/fleet` - Fleet management
- `/admin/users` - User management
- `/admin/damages` - Damage management
- `/admin/late-returns` - Late return management

**Layout:** `src/app/(admin)/layout.tsx`

**Protection:** Requires valid JWT token + ADMIN role

```typescript
// src/app/(admin)/layout.tsx
import { redirect } from 'next/navigation';
import { getAccessToken } from '@/features/auth';

async function getCurrentUser() {
  const token = await getAccessToken();

  if (!token) {
    return null;
  }

  try {
    // Decode JWT payload
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      id: payload.userId,
      username: payload.sub,
      roles: payload.roles || [],
      exp: payload.exp,
    };
  } catch {
    return null;
  }
}

function isAdmin(user) {
  return user?.roles.includes('ADMIN') ?? false;
}

export default async function AdminLayout({ children }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');  // Not authenticated
  }

  if (!isAdmin(user)) {
    redirect('/forbidden');  // Not authorized (403)
  }

  return (
    <div className="admin-layout">
      <AdminSidebar username={user.username} />
      <main>{children}</main>
    </div>
  );
}
```

**Flow:**
1. Layout runs on server
2. Get access token from cookie
3. Decode JWT to extract user info and roles
4. If no token → redirect to `/login`
5. If token but no ADMIN role → redirect to `/forbidden`
6. If ADMIN role → render children with admin layout

---

## Protection Mechanism

### Server-Side Checks

All authentication checks happen **server-side** in layouts:

**Why Server-Side?**
- **Security:** Client-side checks can be bypassed
- **Performance:** No client-side JavaScript needed
- **SEO:** Server-rendered pages are crawlable
- **Simplicity:** Single source of truth

### Token Storage

Tokens are stored in **HTTP-Only cookies**:

**Why HTTP-Only Cookies?**
- **XSS Protection:** JavaScript cannot access cookies
- **CSRF Protection:** SameSite attribute prevents CSRF
- **Automatic:** Browser sends cookies with every request
- **Secure:** Cookies are encrypted in transit (HTTPS)

**Cookie Configuration:**
```typescript
// Set cookie (server-side)
cookies().set('accessToken', token, {
  httpOnly: true,      // Prevent JavaScript access
  secure: true,        // HTTPS only
  sameSite: 'lax',     // CSRF protection
  maxAge: 3600,        // 1 hour
  path: '/',           // Available to all routes
});
```

### Token Verification

Tokens are verified by decoding the JWT payload:

```typescript
function verifyToken(token: string) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    
    // Check expiration
    if (payload.exp < Date.now() / 1000) {
      return null;  // Token expired
    }
    
    return payload;
  } catch {
    return null;  // Invalid token
  }
}
```

**Note:** Full JWT signature verification happens on the backend. Frontend only decodes the payload for role checks.

---

## Role-Based Access Control

### Roles

- **USER** - Regular user (can book cars, view rentals)
- **ADMIN** - Administrator (can manage fleet, users, rentals)

### Role Hierarchy

```
ADMIN > USER
```

**ADMIN** has all USER permissions plus admin-specific permissions.

### Role Checks

```typescript
// Check if user has specific role
function hasRole(user: User, role: string): boolean {
  return user.roles.includes(role);
}

// Check if user is admin
function isAdmin(user: User): boolean {
  return hasRole(user, 'ADMIN');
}

// Check if user is authenticated
function isAuthenticated(user: User | null): boolean {
  return user !== null;
}
```

### Access Matrix

| Route Group | Anonymous | USER | ADMIN |
|-------------|-----------|------|-------|
| (public) | ✅ | ✅ | ✅ |
| (auth) | ✅ | ✅ | ✅ |
| (protected) | ❌ → /login | ✅ | ✅ |
| (admin) | ❌ → /login | ❌ → /forbidden | ✅ |

---

## Redirect Logic

### Redirect Scenarios

1. **Unauthenticated → Protected Route**
   - User tries to access `/dashboard` without login
   - Redirect to `/login`
   - After login, redirect back to `/dashboard` (optional)

2. **Authenticated → Auth Route**
   - User tries to access `/login` while logged in
   - Redirect to `/dashboard` (optional, not currently implemented)

3. **Non-Admin → Admin Route**
   - USER tries to access `/admin`
   - Redirect to `/forbidden` (403 Forbidden)

4. **Token Expired → Any Protected Route**
   - User's token expires
   - Redirect to `/login`
   - Show "Session expired" message (optional)

### Redirect Implementation

```typescript
// Next.js redirect
import { redirect } from 'next/navigation';

// Redirect to login
redirect('/login');

// Redirect to forbidden
redirect('/forbidden');

// Redirect with query params (return URL)
redirect(`/login?returnUrl=${encodeURIComponent(pathname)}`);
```

### Forbidden Page

**Location:** `src/app/forbidden/page.tsx`

**Purpose:** Display 403 Forbidden error when user lacks permissions

```typescript
// src/app/forbidden/page.tsx
export default function ForbiddenPage() {
  return (
    <div>
      <h1>403 - Forbidden</h1>
      <p>You don't have permission to access this page.</p>
      <Link href="/">Go Home</Link>
    </div>
  );
}
```

---

## Event-Driven Session Management

### Logout Event

When user logs out, the `LOGOUT` event is emitted to clear all feature state:

```typescript
// src/features/auth/lib/use-auth.ts
import { eventBus, EVENTS } from '@/shared/events';

export function useLogout() {
  return useMutation({
    mutationFn: logoutApi,
    onSuccess: () => {
      // Emit logout event
      eventBus.emit(EVENTS.LOGOUT);
      
      // Clear auth state
      queryClient.setQueryData(authKeys.me(), null);
      
      // Redirect to home
      router.push('/');
    },
  });
}
```

### Listening to Logout Event

Features listen to the `LOGOUT` event to clear their state:

```typescript
// src/features/manage-rentals/lib/use-rentals.ts
import { useEffect } from 'react';
import { eventBus, EVENTS } from '@/shared/events';
import { useRentalStore } from '../model/store';

export function useRentals() {
  const { clearRentals } = useRentalStore();

  useEffect(() => {
    const handleLogout = () => {
      clearRentals();  // Clear rental state on logout
    };

    eventBus.on(EVENTS.LOGOUT, handleLogout);
    return () => eventBus.off(EVENTS.LOGOUT, handleLogout);
  }, [clearRentals]);
}
```

### Session Expiration

When token expires, user is redirected to login:

```typescript
// src/shared/api/client.ts
export async function clientFetch(url: string, options?: RequestInit) {
  const response = await fetch(url, options);

  if (response.status === 401) {
    // Token expired or invalid
    eventBus.emit(EVENTS.LOGOUT);
    window.location.href = '/login';
  }

  return response;
}
```

---

## Backend Alignment

### Spring Security vs Next.js Layouts

| Aspect | Backend (Spring Security) | Frontend (Next.js Layouts) |
|--------|---------------------------|----------------------------|
| **Protection Mechanism** | `@PreAuthorize` annotations | Layout-based checks |
| **Authentication** | JWT filter chain | Cookie-based token |
| **Authorization** | Role-based (`hasRole('ADMIN')`) | Role-based (JWT payload) |
| **Redirect** | 401/403 HTTP status | `redirect()` function |
| **Session Management** | Stateless (JWT) | Stateless (JWT in cookie) |

### Equivalent Patterns

**Backend:**
```java
@PreAuthorize("hasRole('ADMIN')")
@GetMapping("/admin/rentals")
public List<Rental> getAdminRentals() {
    // Admin-only endpoint
}
```

**Frontend:**
```typescript
// src/app/(admin)/admin/rentals/page.tsx
export default async function AdminRentalsPage() {
  // Layout already checked ADMIN role
  // This page only renders for admins
}
```

### Security Alignment

Both backend and frontend enforce the same security rules:
- **Authentication:** JWT tokens
- **Authorization:** Role-based access control
- **Token Storage:** HTTP-Only cookies (frontend), JWT validation (backend)
- **Stateless:** No server-side sessions

---

## Quick Reference

### Route Group Summary

```
(public)    → Anyone
(auth)      → Anyone (login/register pages)
(protected) → Authenticated users (USER or ADMIN)
(admin)     → Admin users only (ADMIN role)
```

### Protection Checklist

- [ ] Layout checks authentication
- [ ] Layout checks authorization (if role-based)
- [ ] Redirect to `/login` if not authenticated
- [ ] Redirect to `/forbidden` if not authorized
- [ ] Token stored in HTTP-Only cookie
- [ ] Token verified server-side
- [ ] Logout event clears all state

### Common Patterns

**Check if authenticated:**
```typescript
const token = await getAccessToken();
if (!token) redirect('/login');
```

**Check if admin:**
```typescript
const user = await getCurrentUser();
if (!isAdmin(user)) redirect('/forbidden');
```

**Emit logout event:**
```typescript
eventBus.emit(EVENTS.LOGOUT);
```

---

**For authentication flow, see [AUTHENTICATION_FLOW.md](AUTHENTICATION_FLOW.md)**  
**For environment variables, see [ENVIRONMENT_VARIABLES.md](../operations/ENVIRONMENT_VARIABLES.md)**  
**For FSD guide, see [FSD_GUIDE.md](../architecture/FSD_GUIDE.md)**

**Last Updated:** 2026-02-01  
**Maintainer:** Mehmet Akif Uludag

# Environment Variables

**Last Updated:** 2026-02-01  
**Maintainer:** Mehmet Akif Uludag

This document describes all environment variables used in the Car Rental Web application.

---

## Table of Contents

1. [Overview](#overview)
2. [Required Variables](#required-variables)
3. [Optional Variables](#optional-variables)
4. [Development vs Production](#development-vs-production)
5. [Security Notes](#security-notes)
6. [Backend Alignment](#backend-alignment)

---

## Overview

Environment variables configure the application for different environments (development, staging, production). Variables are loaded from `.env` files and accessed via `process.env`.

**File Structure:**
- `.env` - Local development (gitignored)
- `.env.example` - Template with example values (committed)
- `.env.production` - Production values (gitignored, deployed separately)

**Variable Prefixes:**
- `NEXT_PUBLIC_*` - Exposed to browser (public)
- No prefix - Server-side only (private)

---

## Required Variables

### NEXT_PUBLIC_API_URL

**Purpose:** Backend API URL accessible from the browser

**Type:** Public (browser-accessible)

**Required:** Yes

**Example Values:**
```bash
# Development
NEXT_PUBLIC_API_URL=http://localhost:8082

# Production
NEXT_PUBLIC_API_URL=https://api.carrental.com
```

**Usage:**
```typescript
// Client-side API calls
const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cars`);
```

**Notes:**
- Must be accessible from user's browser
- Used for client-side API calls (TanStack Query, fetch)
- Include protocol (http:// or https://)
- No trailing slash

---

### API_URL

**Purpose:** Backend API URL for server-side requests

**Type:** Private (server-side only)

**Required:** Yes

**Example Values:**
```bash
# Development (same as NEXT_PUBLIC_API_URL)
API_URL=http://localhost:8082

# Production (Docker network)
API_URL=http://backend-service:8082

# Production (external)
API_URL=https://api.carrental.com
```

**Usage:**
```typescript
// Server-side API calls (Server Components, API routes)
const response = await fetch(`${process.env.API_URL}/api/cars`);
```

**Notes:**
- Used for server-side API calls (Server Components, API routes)
- In Docker, can use internal service name (e.g., `http://backend:8082`)
- In production, can be different from `NEXT_PUBLIC_API_URL` (internal vs external)
- Include protocol (http:// or https://)
- No trailing slash

**Why Two API URLs?**
- **Browser:** Uses `NEXT_PUBLIC_API_URL` (must be publicly accessible)
- **Server:** Uses `API_URL` (can be internal Docker network)
- **Benefit:** Server can use faster internal network, browser uses public URL

---

### JWT_SECRET

**Purpose:** JWT signing secret (must match backend)

**Type:** Private (server-side only)

**Required:** Yes

**Example Values:**
```bash
# Development
JWT_SECRET=your-jwt-secret-key-here

# Production (use strong random string)
JWT_SECRET=a8f5j2k9m3n7p1q4r6s8t0u2v5w7x9y1z3
```

**Usage:**
```typescript
// JWT verification (if needed on frontend)
import jwt from 'jsonwebtoken';

const decoded = jwt.verify(token, process.env.JWT_SECRET);
```

**Notes:**
- **CRITICAL:** Must match backend JWT secret exactly
- Used for JWT token verification (if done on frontend)
- Keep secret, never commit to git
- Use strong random string (32+ characters)
- Rotate periodically in production

**Security:**
- ⚠️ **Never expose to browser** (no `NEXT_PUBLIC_` prefix)
- ⚠️ **Never commit to git** (use `.env`, not `.env.example`)
- ⚠️ **Use environment-specific secrets** (different for dev/staging/prod)

---

## Optional Variables

### NEXT_PUBLIC_APP_URL

**Purpose:** Frontend application URL (for OAuth redirects, emails)

**Type:** Public (browser-accessible)

**Required:** No (defaults to `http://localhost:3000`)

**Example Values:**
```bash
# Development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Production
NEXT_PUBLIC_APP_URL=https://carrental.com
```

**Usage:**
```typescript
// OAuth redirect URL
const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/callback`;

// Email links
const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;
```

**Notes:**
- Used for OAuth2 redirect URLs
- Used for email links (password reset, verification)
- Include protocol (http:// or https://)
- No trailing slash

---

### NODE_ENV

**Purpose:** Node.js environment mode

**Type:** Private (server-side only)

**Required:** No (defaults to `development`)

**Values:**
- `development` - Development mode (hot reload, verbose errors)
- `production` - Production mode (optimized, minimal errors)
- `test` - Test mode (for running tests)

**Example:**
```bash
NODE_ENV=development
NODE_ENV=production
NODE_ENV=test
```

**Usage:**
```typescript
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info');
}

if (process.env.NODE_ENV === 'production') {
  // Production-only code
}
```

**Notes:**
- Automatically set by Next.js (`next dev` → `development`, `next build` → `production`)
- Affects build optimization, error handling, logging
- Don't manually set unless needed

---

### NEXT_PUBLIC_GOOGLE_CLIENT_ID

**Purpose:** Google OAuth2 client ID

**Type:** Public (browser-accessible)

**Required:** No (only if Google OAuth is enabled)

**Example:**
```bash
NEXT_PUBLIC_GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
```

**Usage:**
```typescript
// Google OAuth button
<GoogleOAuthButton clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID} />
```

**Notes:**
- Obtain from Google Cloud Console
- Public value (safe to expose)
- Only needed if Google OAuth is enabled

---

### NEXT_PUBLIC_GITHUB_CLIENT_ID

**Purpose:** GitHub OAuth2 client ID

**Type:** Public (browser-accessible)

**Required:** No (only if GitHub OAuth is enabled)

**Example:**
```bash
NEXT_PUBLIC_GITHUB_CLIENT_ID=Iv1.a1b2c3d4e5f6g7h8
```

**Usage:**
```typescript
// GitHub OAuth button
<GitHubOAuthButton clientId={process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID} />
```

**Notes:**
- Obtain from GitHub Developer Settings
- Public value (safe to expose)
- Only needed if GitHub OAuth is enabled

---

## Development vs Production

### Development (.env)

```bash
# Backend API
NEXT_PUBLIC_API_URL=http://localhost:8082
API_URL=http://localhost:8082

# Frontend URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Environment
NODE_ENV=development

# JWT Secret (development only)
JWT_SECRET=dev-secret-key-not-for-production

# OAuth (optional)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
NEXT_PUBLIC_GITHUB_CLIENT_ID=your-github-client-id
```

### Production (.env.production)

```bash
# Backend API (external)
NEXT_PUBLIC_API_URL=https://api.carrental.com

# Backend API (internal Docker network)
API_URL=http://backend-service:8082

# Frontend URL
NEXT_PUBLIC_APP_URL=https://carrental.com

# Environment
NODE_ENV=production

# JWT Secret (MUST match backend)
JWT_SECRET=<strong-random-secret-32-chars-minimum>

# OAuth (production credentials)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=<production-google-client-id>
NEXT_PUBLIC_GITHUB_CLIENT_ID=<production-github-client-id>
```

### Key Differences

| Variable | Development | Production |
|----------|-------------|------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8082` | `https://api.carrental.com` |
| `API_URL` | `http://localhost:8082` | `http://backend-service:8082` (Docker) |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | `https://carrental.com` |
| `JWT_SECRET` | Simple dev key | Strong random key |
| `NODE_ENV` | `development` | `production` |

---

## Security Notes

### Never Commit Secrets

⚠️ **CRITICAL:** Never commit `.env` files with real secrets to git

**Gitignore:**
```gitignore
# Environment variables
.env
.env.local
.env.production
.env.production.local

# Keep example file
!.env.example
```

### Use Strong Secrets

**JWT_SECRET Requirements:**
- Minimum 32 characters
- Random alphanumeric + special characters
- Different for each environment
- Rotate periodically

**Generate Strong Secret:**
```bash
# Using openssl
openssl rand -base64 32

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Environment-Specific Secrets

**Never reuse secrets across environments:**
- Development: Simple keys for local testing
- Staging: Different keys from production
- Production: Strong, unique keys

### Secret Management

**Production Deployment:**
- Use environment variable management (Vercel, Netlify, AWS Secrets Manager)
- Never hardcode secrets in code
- Never log secrets
- Rotate secrets periodically

---

## Backend Alignment

### Shared Configuration

Frontend and backend share some configuration:

| Variable | Frontend | Backend | Must Match? |
|----------|----------|---------|-------------|
| `JWT_SECRET` | `JWT_SECRET` | `jwt.secret` | ✅ Yes |
| `API_URL` | `NEXT_PUBLIC_API_URL` | `server.port` | ✅ Yes (URL) |
| `APP_URL` | `NEXT_PUBLIC_APP_URL` | `app.frontend-url` | ✅ Yes |

### Backend Environment Variables

**Backend (.env):**
```properties
# Server
server.port=8082

# Database
spring.datasource.url=jdbc:postgresql://localhost:5432/carrental
spring.datasource.username=postgres
spring.datasource.password=postgres

# JWT
jwt.secret=a8f5j2k9m3n7p1q4r6s8t0u2v5w7x9y1z3
jwt.expiration=3600000

# Frontend URL (for CORS)
app.frontend-url=http://localhost:3000
```

**Alignment:**
- `JWT_SECRET` (frontend) = `jwt.secret` (backend)
- `NEXT_PUBLIC_APP_URL` (frontend) = `app.frontend-url` (backend)
- `NEXT_PUBLIC_API_URL` (frontend) = `http://localhost:${server.port}` (backend)

---

## Quick Reference

### Required Variables

```bash
NEXT_PUBLIC_API_URL=http://localhost:8082
API_URL=http://localhost:8082
JWT_SECRET=your-jwt-secret-key-here
```

### Optional Variables

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
NEXT_PUBLIC_GITHUB_CLIENT_ID=your-github-client-id
```

### Accessing Variables

**Client-side (browser):**
```typescript
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
```

**Server-side (Server Components, API routes):**
```typescript
const apiUrl = process.env.API_URL;
const jwtSecret = process.env.JWT_SECRET;
```

### Validation

**Check required variables on startup:**
```typescript
// src/shared/config/env.ts
const requiredEnvVars = [
  'NEXT_PUBLIC_API_URL',
  'API_URL',
  'JWT_SECRET',
];

requiredEnvVars.forEach((varName) => {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
});
```

---

**For deployment guide, see [DEPLOYMENT.md](DEPLOYMENT.md)**  
**For security guide, see [ROUTE_PROTECTION.md](../security/ROUTE_PROTECTION.md)**  
**For backend configuration, see backend [CONFIGURATION.md](https://github.com/TheOdrig/car-rental-api/blob/main/docs/CONFIGURATION.md)**

**Last Updated:** 2026-02-01  
**Maintainer:** Mehmet Akif Uludag

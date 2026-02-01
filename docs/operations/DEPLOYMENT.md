# Deployment Guide

This document provides comprehensive deployment instructions for the CarRental frontend application, covering Vercel, Netlify, Docker, and production best practices.

---

## Overview

The CarRental frontend is a Next.js 16 application with:
- **App Router** architecture
- **Feature-Sliced Design** (FSD) structure
- **Server Components** and **Client Components**
- **API Proxy** to backend services
- **Environment-based configuration**

**Supported Deployment Platforms:**
- Vercel (recommended for Next.js)
- Netlify
- Docker (self-hosted)
- Node.js server (standalone)

---

## Prerequisites

### System Requirements

- **Node.js:** 20.x (specified in `package.json`)
- **npm:** 10.x or higher
- **Backend API:** Running and accessible

### Environment Variables

All deployments require these environment variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL (browser-accessible) | `https://api.example.com` |
| `API_URL` | Backend API URL (server-side, Docker network) | `http://backend:8082` |
| `JWT_SECRET` | JWT signing key (must match backend) | `your-secret-key-here` |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth2 client ID (optional) | `123456789.apps.googleusercontent.com` |
| `NEXT_PUBLIC_GITHUB_CLIENT_ID` | GitHub OAuth2 client ID (optional) | `Iv1.abc123def456` |

**Security Note:** Never commit `.env` files to version control. Use `.env.example` as a template.

---

## Vercel Deployment (Recommended)

Vercel is the recommended platform for Next.js applications, offering zero-configuration deployment with automatic optimizations.

### Step 1: Connect Repository

1. Go to [vercel.com](https://vercel.com)
2. Click **"New Project"**
3. Import your GitHub/GitLab/Bitbucket repository
4. Select the `car-rental-web` repository

### Step 2: Configure Project

**Framework Preset:** Next.js (auto-detected)

**Build Settings:**
- **Build Command:** `npm run build`
- **Output Directory:** `.next` (auto-detected)
- **Install Command:** `npm install`

**Root Directory:** `.` (project root)

### Step 3: Environment Variables

Add environment variables in Vercel dashboard:

```bash
# Production
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
API_URL=https://api.yourdomain.com
JWT_SECRET=your-production-jwt-secret

# Optional OAuth2
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
NEXT_PUBLIC_GITHUB_CLIENT_ID=your-github-client-id
```

**Important:** Use different values for **Preview** and **Production** environments.

### Step 4: Deploy

1. Click **"Deploy"**
2. Vercel will build and deploy automatically
3. Access your app at `https://your-project.vercel.app`

### Step 5: Custom Domain (Optional)

1. Go to **Settings → Domains**
2. Add your custom domain (e.g., `www.yourdomain.com`)
3. Configure DNS records as instructed
4. SSL certificate is automatically provisioned

### Vercel Configuration File (Optional)

Create `vercel.json` for advanced configuration:

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "NEXT_PUBLIC_API_URL": "@api-url-production"
  },
  "build": {
    "env": {
      "NEXT_PUBLIC_API_URL": "@api-url-production"
    }
  }
}
```

### Vercel Advantages

✅ Zero-configuration deployment  
✅ Automatic HTTPS/SSL  
✅ Global CDN (Edge Network)  
✅ Automatic preview deployments (PRs)  
✅ Built-in analytics  
✅ Serverless functions optimization  

---

## Netlify Deployment

Netlify is an alternative platform with similar features to Vercel.

### Step 1: Connect Repository

1. Go to [netlify.com](https://netlify.com)
2. Click **"Add new site" → "Import an existing project"**
3. Connect your Git provider
4. Select the `car-rental-web` repository

### Step 2: Build Settings

**Build Command:** `npm run build`  
**Publish Directory:** `.next`  
**Base Directory:** (leave empty)

### Step 3: Environment Variables

Add environment variables in Netlify dashboard:

```bash
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
API_URL=https://api.yourdomain.com
JWT_SECRET=your-production-jwt-secret
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
NEXT_PUBLIC_GITHUB_CLIENT_ID=your-github-client-id
```

### Step 4: Netlify Configuration File

Create `netlify.toml` in project root:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "20"

[[redirects]]
  from = "/api/*"
  to = "https://api.yourdomain.com/api/:splat"
  status = 200
  force = true

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

### Step 5: Deploy

1. Click **"Deploy site"**
2. Netlify will build and deploy automatically
3. Access your app at `https://your-site.netlify.app`

### Netlify Advantages

✅ Generous free tier  
✅ Automatic HTTPS/SSL  
✅ Global CDN  
✅ Split testing (A/B testing)  
✅ Form handling  
✅ Serverless functions  

---

## Docker Deployment

Docker deployment is ideal for self-hosted environments or Kubernetes clusters.

### Step 1: Create Dockerfile

Create `Dockerfile` in project root:

```dockerfile
# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci --only=production

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Build application
RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

# Set environment to production
ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Change ownership
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Set environment variables
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start application
CMD ["node", "server.js"]
```

### Step 2: Update next.config.ts

Enable standalone output:

```typescript
const nextConfig: NextConfig = {
  output: 'standalone', // Enable standalone build
  // ... rest of config
};
```

### Step 3: Create .dockerignore

Create `.dockerignore` in project root:

```
node_modules
.next
.git
.gitignore
.env
.env.local
.env.*.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.DS_Store
coverage
.vscode
.idea
*.md
!README.md
```

### Step 4: Build Docker Image

```bash
docker build -t car-rental-web:latest .
```

### Step 5: Run Docker Container

```bash
docker run -d \
  --name car-rental-web \
  -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=https://api.yourdomain.com \
  -e API_URL=http://backend:8082 \
  -e JWT_SECRET=your-jwt-secret \
  car-rental-web:latest
```

### Docker Compose (Recommended)

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: car-rental-web
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=https://api.yourdomain.com
      - API_URL=http://backend:8082
      - JWT_SECRET=${JWT_SECRET}
      - NEXT_PUBLIC_GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
      - NEXT_PUBLIC_GITHUB_CLIENT_ID=${GITHUB_CLIENT_ID}
    networks:
      - car-rental-network
    depends_on:
      - backend
    restart: unless-stopped

  backend:
    image: car-rental-api:latest
    container_name: car-rental-api
    ports:
      - "8082:8082"
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - DATABASE_URL=${DATABASE_URL}
    networks:
      - car-rental-network
    restart: unless-stopped

networks:
  car-rental-network:
    driver: bridge
```

**Run with Docker Compose:**

```bash
docker-compose up -d
```

### Docker Advantages

✅ Consistent environment (dev/staging/prod)  
✅ Easy scaling (Kubernetes, Docker Swarm)  
✅ Isolated dependencies  
✅ Portable across cloud providers  
✅ Version control for infrastructure  

---

## Node.js Standalone Deployment

Deploy directly on a Node.js server without Docker.

### Step 1: Build Application

```bash
npm run build
```

### Step 2: Start Production Server

```bash
npm run start
```

**Or use PM2 for process management:**

```bash
# Install PM2 globally
npm install -g pm2

# Start application
pm2 start npm --name "car-rental-web" -- start

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

### Step 3: Nginx Reverse Proxy (Recommended)

Configure Nginx as a reverse proxy:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Proxy to Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files caching
    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 365d;
        add_header Cache-Control "public, immutable";
    }
}
```

**Reload Nginx:**

```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## Build Optimization

### Next.js Configuration

**File:** `next.config.ts`

```typescript
const nextConfig: NextConfig = {
  // Production optimizations
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Standalone output for Docker
  output: 'standalone',
  
  // API rewrites
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.API_URL}/api/:path*`,
      },
    ];
  },
};
```

### Bundle Analysis

Analyze bundle size:

```bash
# Install bundle analyzer
npm install --save-dev @next/bundle-analyzer

# Update next.config.ts
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer(nextConfig);

# Run analysis
ANALYZE=true npm run build
```

---

## Production Checklist

### Pre-Deployment

- [ ] **Environment Variables:** All required variables set
- [ ] **Build Success:** `npm run build` completes without errors
- [ ] **Type Check:** `npm run type-check` passes
- [ ] **Linting:** `npm run lint` passes
- [ ] **Tests:** `npm run test` passes (47/47 unit tests + 21/21 architecture tests)
- [ ] **Architecture Tests:** `npm run test:architecture` passes
- [ ] **Backend Connection:** API URL is correct and accessible
- [ ] **JWT Secret:** Matches backend JWT signing key
- [ ] **OAuth2 Credentials:** Google/GitHub client IDs configured (if using OAuth2)

### Security

- [ ] **HTTPS Enabled:** SSL certificate configured
- [ ] **Environment Secrets:** No secrets in source code
- [ ] **CORS Configuration:** Backend allows frontend origin
- [ ] **CSP Headers:** Content Security Policy configured
- [ ] **Rate Limiting:** API rate limiting enabled (backend)
- [ ] **HTTP-Only Cookies:** Tokens stored securely

### Performance

- [ ] **Image Optimization:** Next.js Image component used
- [ ] **Code Splitting:** Dynamic imports for large components
- [ ] **Caching Strategy:** Server Components cached appropriately
- [ ] **CDN Configured:** Static assets served from CDN
- [ ] **Compression Enabled:** Gzip/Brotli compression active

### Monitoring

- [ ] **Error Tracking:** Sentry or similar service configured
- [ ] **Analytics:** Google Analytics or Vercel Analytics enabled
- [ ] **Logging:** Structured logging for debugging
- [ ] **Health Checks:** `/api/health` endpoint available
- [ ] **Uptime Monitoring:** Pingdom or UptimeRobot configured

---

## Environment-Specific Configuration

### Development

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8082
API_URL=http://localhost:8082
JWT_SECRET=dev-secret-key
```

**Run:**
```bash
npm run dev
```

### Staging

```bash
# .env.staging
NEXT_PUBLIC_API_URL=https://api-staging.yourdomain.com
API_URL=https://api-staging.yourdomain.com
JWT_SECRET=staging-secret-key
```

**Deploy:**
```bash
vercel --env staging
```

### Production

```bash
# .env.production (DO NOT COMMIT)
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
API_URL=https://api.yourdomain.com
JWT_SECRET=production-secret-key-change-this
NEXT_PUBLIC_GOOGLE_CLIENT_ID=prod-google-client-id
NEXT_PUBLIC_GITHUB_CLIENT_ID=prod-github-client-id
```

**Deploy:**
```bash
vercel --prod
```

---

## Troubleshooting

### Issue: Build Fails with "Module not found"

**Cause:** Missing dependencies or incorrect import paths.

**Solution:**
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
npm run build
```

### Issue: API Requests Fail (CORS Error)

**Cause:** Backend CORS not configured for frontend origin.

**Solution:** Ensure backend has:
```java
@CrossOrigin(origins = "https://yourdomain.com", allowCredentials = "true")
```

### Issue: Environment Variables Not Working

**Cause:** Variables not prefixed with `NEXT_PUBLIC_` for client-side access.

**Solution:**
- Server-side: Use `process.env.API_URL`
- Client-side: Use `process.env.NEXT_PUBLIC_API_URL`

### Issue: Images Not Loading

**Cause:** Image domain not whitelisted in `next.config.ts`.

**Solution:** Add domain to `remotePatterns`:
```typescript
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'yourdomain.com',
      pathname: '/**',
    },
  ],
}
```

### Issue: 404 on Refresh (Netlify/Nginx)

**Cause:** Client-side routing not configured.

**Solution (Netlify):** Add `_redirects` file:
```
/*    /index.html   200
```

**Solution (Nginx):** Add to config:
```nginx
try_files $uri $uri/ /index.html;
```

---

## Rollback Strategy

### Vercel

1. Go to **Deployments** tab
2. Find previous successful deployment
3. Click **"Promote to Production"**

### Docker

```bash
# Tag previous version
docker tag car-rental-web:latest car-rental-web:v1.0.0

# Rollback
docker stop car-rental-web
docker rm car-rental-web
docker run -d --name car-rental-web car-rental-web:v1.0.0
```

### PM2

```bash
# List deployments
pm2 list

# Restart previous version
pm2 restart car-rental-web --update-env
```

---

## Related Documentation

- [Environment Variables](./ENVIRONMENT_VARIABLES.md) - Detailed environment variable guide
- [API Client](../api/API_CLIENT.md) - API configuration and usage
- [Backend Deployment](https://github.com/TheOdrig/car-rental-api/blob/main/docs/operations/DEPLOYMENT.md) - Backend deployment guide

---

**Last Updated:** 2026-02-01  
**Maintainer:** Mehmet Akif Uludag

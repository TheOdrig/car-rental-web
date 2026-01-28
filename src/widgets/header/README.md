# Header Widget

Site-wide navigation and user menu.

## Public API

```typescript
// UI
export { Header } from './ui/header';
export { MobileNav } from './ui/mobile-nav';
```

## Usage

Widget composes features (auth) and shared components.

## FSD Rules

- Can import from `@/features`, `@/entities`, `@/shared`
- Export via `index.ts` (public API)
- Widgets CAN depend on features (composition layer)

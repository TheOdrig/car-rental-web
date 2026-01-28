# Car Filters Widget

Car filtering UI with multiple filter types and active filter chips.

## Public API

```typescript
// UI
export { FilterPanel } from './ui/filter-panel';
export { FilterChips } from './ui/filter-chips';
export { FilterSidebar } from './ui/filter-sidebar';
```

## Usage

Widget for car browsing pages. Composes shared/ui components and uses filter store.

## FSD Rules

- Can import from `@/features`, `@/entities`, `@/shared`
- Export via `index.ts` (public API)
- Widgets CAN depend on features (composition layer)

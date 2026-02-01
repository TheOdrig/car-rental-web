# ADR-005: Component Library Selection

**Status:** Accepted  
**Date:** 2026-02-01  
**Decider:** Mehmet Akif Uludag

---

## Context

We needed to choose a component library for building the UI. The library should provide accessible, customizable components that integrate well with our tech stack (Next.js, TypeScript, Tailwind CSS).

**Key Considerations:**
- Accessibility (WAI-ARIA compliance)
- Customization flexibility
- TypeScript support
- Tailwind CSS integration
- Bundle size
- Developer experience

---

## Decision

We will use **shadcn/ui** built on **Radix UI primitives** with **CVA (class-variance-authority)** for variant management.

**Key Decisions:**
1. Use shadcn/ui (copy-paste components, not npm package)
2. Build on Radix UI primitives (accessibility foundation)
3. Use CVA for type-safe variant management
4. Style with Tailwind CSS
5. Store components in `src/shared/ui/`

---

## Rationale

### Why shadcn/ui?

**Copy-Paste Approach:**
- **Full Control:** Components are yours, modify as needed
- **No Package Dependency:** No version conflicts or breaking changes
- **Customization:** Change anything without forking
- **Transparency:** See exactly what code you're using

**Built on Radix UI:**
- **Accessibility:** WAI-ARIA compliant out of the box
- **Unstyled:** Bring your own styles (Tailwind)
- **Composable:** Primitives compose naturally
- **Keyboard Navigation:** Full keyboard support

**Tailwind Integration:**
- **Utility-First:** Matches our styling strategy
- **Type-Safe:** CVA provides TypeScript types for variants
- **Consistent:** Uses design tokens from Tailwind config
- **Dark Mode:** Built-in dark mode support

**Example Component:**
```typescript
// src/shared/ui/button.tsx
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-white hover:bg-destructive/90",
        outline: "border bg-background hover:bg-accent",
        ghost: "hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3",
        lg: "h-10 px-6",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export function Button({ variant, size, className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}
```

### Radix UI Primitives

**Accessibility Foundation:**
- **WAI-ARIA:** Proper ARIA attributes and roles
- **Keyboard Navigation:** Tab, Arrow keys, Enter, Escape
- **Focus Management:** Visible focus indicators, focus trapping
- **Screen Readers:** Semantic HTML and ARIA labels

**Unstyled Primitives:**
- **Bring Your Own Styles:** No CSS to override
- **Tailwind-Friendly:** Works perfectly with utility classes
- **Flexible:** Style however you want

**Composable API:**
```typescript
// Radix Dialog primitive
import * as Dialog from '@radix-ui/react-dialog';

<Dialog.Root>
  <Dialog.Trigger>Open</Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Overlay />
    <Dialog.Content>
      <Dialog.Title>Title</Dialog.Title>
      <Dialog.Description>Description</Dialog.Description>
      <Dialog.Close>Close</Dialog.Close>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
```

### CVA (class-variance-authority)

**Type-Safe Variants:**
```typescript
const buttonVariants = cva("base-classes", {
  variants: {
    variant: {
      default: "...",
      destructive: "...",
    },
    size: {
      default: "...",
      sm: "...",
    },
  },
});

// TypeScript infers types
type ButtonProps = VariantProps<typeof buttonVariants>;
```

**Benefits:**
- **Type Safety:** TypeScript knows valid variants
- **Autocomplete:** IDE suggests available variants
- **Composable:** Combine variants easily
- **Maintainable:** Centralized variant definitions

---

## Consequences

### Positive

✅ **Full Control**
- Components are in your codebase
- Modify without forking or waiting for PRs
- No version conflicts

✅ **Accessibility**
- Radix UI handles complex accessibility patterns
- WAI-ARIA compliant out of the box
- Keyboard navigation and focus management

✅ **Customization**
- Easy to customize styles
- Easy to add new variants
- Easy to extend components

✅ **TypeScript Support**
- Full TypeScript types
- CVA provides type-safe variants
- Autocomplete in IDE

✅ **Bundle Size**
- Only include components you use
- No unused code
- Tree-shakeable

✅ **Developer Experience**
- Consistent API across components
- Well-documented
- Active community

### Negative

❌ **Manual Updates**
- Must manually update components (no `npm update`)
- Must track shadcn/ui changes
- More maintenance burden

❌ **Initial Setup**
- Must copy components one by one
- Must configure Tailwind
- More setup than installing npm package

❌ **No Official Support**
- shadcn/ui is not a company, just a collection
- No official support or SLA
- Community-driven

### Mitigation

**Manual Updates:**
- Document component versions in comments
- Check shadcn/ui changelog periodically
- Update components as needed (not urgent)

**Initial Setup:**
- Use shadcn/ui CLI to add components
- Document setup process in DEVELOPER_GUIDE.md
- Create component catalog for reference

**No Official Support:**
- Radix UI has official support
- shadcn/ui has active community
- Components are simple enough to maintain ourselves

---

## Alternatives Considered

### Alternative 1: Material-UI (MUI)

**Pros:**
- Comprehensive component library
- Official support and documentation
- Large community

**Cons:**
- Heavy bundle size (~300KB)
- Opinionated Material Design style
- Hard to customize deeply
- Not Tailwind-friendly

**Decision:** Rejected - Too opinionated, hard to customize

### Alternative 2: Chakra UI

**Pros:**
- Good accessibility
- Composable components
- TypeScript support

**Cons:**
- CSS-in-JS (not Tailwind)
- Larger bundle size
- Different styling paradigm

**Decision:** Rejected - Not Tailwind-compatible

### Alternative 3: Headless UI

**Pros:**
- Unstyled components
- Tailwind-friendly
- Official Tailwind Labs project

**Cons:**
- Fewer components than Radix UI
- Less flexible API
- Smaller community

**Decision:** Rejected - Radix UI has more components and better API

### Alternative 4: Build from Scratch

**Pros:**
- Complete control
- No dependencies
- Exactly what we need

**Cons:**
- Huge time investment
- Accessibility is hard to get right
- Reinventing the wheel

**Decision:** Rejected - Not worth the time investment

---

## Implementation Notes

### Adding Components

Use shadcn/ui CLI:
```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add dialog
```

Or manually copy from [shadcn/ui](https://ui.shadcn.com/).

### Component Location

All shared UI components go in `src/shared/ui/`:
```
src/shared/ui/
├── button.tsx
├── card.tsx
├── dialog.tsx
├── input.tsx
└── ...
```

### Customization Pattern

**Override Styles:**
```typescript
<Button className="w-full">Full Width</Button>
```

**Add New Variants:**
```typescript
const buttonVariants = cva("...", {
  variants: {
    variant: {
      // ... existing variants
      custom: "bg-custom text-custom-foreground",  // Add new variant
    },
  },
});
```

**Extend Components:**
```typescript
// src/shared/ui/icon-button.tsx
import { Button } from './button';

export function IconButton({ icon, ...props }) {
  return (
    <Button size="icon" {...props}>
      {icon}
    </Button>
  );
}
```

### Accessibility Checklist

- [ ] Proper ARIA attributes
- [ ] Keyboard navigation
- [ ] Focus indicators
- [ ] Screen reader labels
- [ ] Color contrast (WCAG AA)

---

## References

- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Radix UI Documentation](https://www.radix-ui.com/)
- [CVA Documentation](https://cva.style/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)

---

**Related ADRs:**
- [ADR-006: Styling Strategy](ADR-006-styling-strategy.md)

**Last Updated:** 2026-02-01  
**Maintainer:** Mehmet Akif Uludag

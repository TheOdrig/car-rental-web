# ADR-006: Styling Strategy

**Status:** Accepted  
**Date:** 2026-02-01  
**Decider:** Mehmet Akif Uludag

---

## Context

We needed to choose a styling approach for the application. The solution should support responsive design, dark mode, design tokens, and integrate well with our component library (shadcn/ui).

**Key Considerations:**
- Utility-first vs component-based CSS
- Dark mode support
- Design token management
- Performance (bundle size, runtime)
- Developer experience
- Type safety

---

## Decision

We will use **Tailwind CSS v4** with **CSS Variables** for design tokens and **dark mode** support.

**Key Decisions:**
1. Use Tailwind CSS v4 (utility-first)
2. Use CSS Variables for design tokens
3. Implement dark mode with CSS variables + Tailwind `dark:` variant
4. Store global styles in `src/app/globals.css`
5. Use `cn()` utility for conditional classes

---

## Rationale

### Why Tailwind CSS v4?

**Utility-First Benefits:**
- **Fast Development:** No context switching between HTML and CSS
- **Consistent Design:** Design tokens enforced via utilities
- **No Naming:** No need to name classes (`.btn-primary` vs `className="bg-primary"`)
- **Tree-Shakeable:** Only used utilities in final bundle
- **Responsive:** Built-in responsive modifiers (`md:`, `lg:`)

**v4 Improvements:**
- **Faster Build:** Rust-based engine (Oxide)
- **Better DX:** Improved autocomplete and IntelliSense
- **Smaller Bundle:** More efficient CSS generation
- **Native CSS:** Uses modern CSS features (container queries, cascade layers)

**Example:**
```typescript
<button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2">
  Click me
</button>
```

### CSS Variables for Design Tokens

**Design Token System:**
```css
/* src/app/globals.css */
:root {
  /* Colors */
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  
  /* Spacing */
  --radius: 0.5rem;
  
  /* Typography */
  --font-sans: 'Inter', sans-serif;
}

.dark {
  --primary: 210 40% 98%;
  --primary-foreground: 222.2 47.4% 11.2%;
}
```

**Tailwind Integration:**
```javascript
// tailwind.config.ts
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: 'hsl(var(--primary))',
        'primary-foreground': 'hsl(var(--primary-foreground))',
      },
      borderRadius: {
        DEFAULT: 'var(--radius)',
      },
    },
  },
};
```

**Benefits:**
- **Runtime Theming:** Change theme without rebuilding
- **Dark Mode:** Toggle with CSS class
- **Consistency:** Single source of truth for design tokens
- **Type Safety:** Tailwind config provides autocomplete

### Dark Mode Implementation

**CSS Variable Approach:**
```css
:root {
  --background: 0 0% 100%;  /* Light mode */
}

.dark {
  --background: 222.2 84% 4.9%;  /* Dark mode */
}
```

**Tailwind Dark Variant:**
```typescript
<div className="bg-background text-foreground dark:bg-slate-900 dark:text-slate-100">
  Content adapts to dark mode
</div>
```

**Toggle Implementation:**
```typescript
// src/shared/lib/theme.ts
export function toggleTheme() {
  document.documentElement.classList.toggle('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
}
```

**Benefits:**
- **Automatic:** Components adapt to dark mode automatically
- **Granular Control:** Override specific elements with `dark:` variant
- **Persistent:** Save preference in localStorage
- **System Preference:** Respect `prefers-color-scheme`

### cn() Utility for Conditional Classes

**Utility Function:**
```typescript
// src/shared/lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**Usage:**
```typescript
<button
  className={cn(
    "base-classes",
    variant === "primary" && "bg-primary",
    variant === "secondary" && "bg-secondary",
    disabled && "opacity-50 cursor-not-allowed",
    className  // Allow override
  )}
>
  Button
</button>
```

**Benefits:**
- **Conditional Classes:** Easy to add/remove classes based on state
- **Merge Conflicts:** `twMerge` resolves conflicting utilities
- **Type Safety:** `clsx` provides TypeScript types

---

## Consequences

### Positive

✅ **Fast Development**
- No context switching between HTML and CSS
- Rapid prototyping with utilities
- Consistent spacing and colors

✅ **Consistent Design**
- Design tokens enforced via Tailwind config
- Hard to deviate from design system
- Automatic responsive design

✅ **Dark Mode**
- Easy to implement with CSS variables
- Automatic component adaptation
- Granular control with `dark:` variant

✅ **Performance**
- Small bundle size (only used utilities)
- No runtime CSS-in-JS overhead
- Fast build times (Tailwind v4 Oxide engine)

✅ **Developer Experience**
- Excellent autocomplete in IDE
- No need to name classes
- Easy to understand (utilities are self-documenting)

### Negative

❌ **Verbose HTML**
- Long className strings
- Can be hard to read

❌ **Learning Curve**
- Must learn Tailwind utilities
- Must understand responsive modifiers
- Must understand dark mode system

❌ **Customization**
- Must extend Tailwind config for custom values
- Can't use arbitrary CSS easily

### Mitigation

**Verbose HTML:**
- Extract components for repeated patterns
- Use CVA for variant management
- Use `cn()` utility for conditional classes

**Learning Curve:**
- Provide Tailwind cheat sheet
- Document common patterns
- Use IntelliSense for autocomplete

**Customization:**
- Extend Tailwind config for custom values
- Use arbitrary values when needed: `className="w-[123px]"`
- Document custom utilities in globals.css

---

## Alternatives Considered

### Alternative 1: CSS Modules

**Pros:**
- Scoped styles (no conflicts)
- Familiar CSS syntax
- No learning curve

**Cons:**
- Context switching between HTML and CSS
- Must name classes
- No design token enforcement
- Larger bundle size

**Decision:** Rejected - Slower development, no design system enforcement

### Alternative 2: Styled Components (CSS-in-JS)

**Pros:**
- Component-scoped styles
- Dynamic styles with props
- TypeScript support

**Cons:**
- Runtime overhead (styles generated at runtime)
- Larger bundle size
- Slower performance
- Not compatible with Server Components

**Decision:** Rejected - Performance issues, not Server Component compatible

### Alternative 3: Vanilla CSS

**Pros:**
- No dependencies
- Full control
- Familiar

**Cons:**
- No design system
- Manual responsive design
- Manual dark mode
- Naming conflicts

**Decision:** Rejected - Too much manual work, no design system

### Alternative 4: Sass/SCSS

**Pros:**
- Variables and mixins
- Nested syntax
- Familiar to many developers

**Cons:**
- Build step required
- No design token enforcement
- Manual responsive design
- Larger bundle size

**Decision:** Rejected - Tailwind provides better DX and smaller bundles

---

## Implementation Notes

### Tailwind Configuration

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',  // Use .dark class for dark mode
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: 'hsl(var(--primary))',
        secondary: 'hsl(var(--secondary))',
        // ... more colors
      },
      borderRadius: {
        DEFAULT: 'var(--radius)',
      },
    },
  },
  plugins: [],
};

export default config;
```

### Global Styles

```css
/* src/app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --radius: 0.5rem;
  }

  .dark {
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
  }
}
```

### Component Styling Pattern

```typescript
// Use cn() for conditional classes
import { cn } from '@/shared/lib/utils';

export function Button({ variant, className, ...props }) {
  return (
    <button
      className={cn(
        "base-classes",
        variant === "primary" && "bg-primary",
        className
      )}
      {...props}
    />
  );
}
```

### Responsive Design

```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  {/* 1 column on mobile, 2 on tablet, 3 on desktop */}
</div>
```

### Dark Mode

```typescript
<div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
  Content adapts to dark mode
</div>
```

---

## References

- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Tailwind CSS v4 Alpha](https://tailwindcss.com/blog/tailwindcss-v4-alpha)
- [shadcn/ui Theming](https://ui.shadcn.com/docs/theming)
- [clsx Documentation](https://github.com/lukeed/clsx)
- [tailwind-merge Documentation](https://github.com/dcastil/tailwind-merge)

---

**Related ADRs:**
- [ADR-005: Component Library](ADR-005-component-library.md)

**Last Updated:** 2026-02-01  
**Maintainer:** Mehmet Akif Uludag

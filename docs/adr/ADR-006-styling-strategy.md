# ADR-006 · Styling and shared UI

**Status** Accepted

The customer and admin surfaces share semantic Tailwind CSS v4 utilities and UI primitives. Components use names such as `bg-background`, `text-foreground` and `bg-primary` so theme changes can be expressed centrally.

## CSS-first tokens

[globals.css](../../src/app/globals.css) imports Tailwind and maps utility aliases to CSS variables with `@theme inline`. The palette C design pairs graphite surfaces in dark mode with blue primary actions in both themes. `:root` supplies light values and the class-based `.dark` overrides supply dark values outside print. The [theme provider](../../src/app/providers.tsx) uses the system theme by default.

Status tones pair subtle backgrounds with foreground tokens for success, warning, danger, information, primary and neutral states. [StatusBadge](../../src/shared/ui/status-badge.tsx) exposes these tones through a shared interface so callers can supply status text and presentation consistently.

## Primitives and responsive behavior

Radix supplies interaction primitives for controls such as [Dialog](../../src/shared/ui/dialog.tsx). Class Variance Authority (CVA) defines reusable size and appearance variants, as in [Button](../../src/shared/ui/button.tsx). [`cn()`](../../src/shared/lib/utils.ts) combines conditional class names and resolves conflicting Tailwind utilities. Owning these wrappers keeps styling and focus behavior consistent across screens.

The CSS theme defines `2xs` at `22.5rem` and `xs` at `25.75rem`. Dialogs use `dvh` for dynamic viewport height. Mobile controls such as the shared [Input](../../src/shared/ui/input.tsx) use a 44 px touch height and 16 px form text, with denser sizing at desktop breakpoints.

The [design-token tests](../../src/__tests__/architecture/design-tokens.test.ts) detect raw palette usage, the [contrast tests](../../src/__tests__/architecture/token-contrast.test.ts) check selected token pairs, and the [mobile standards tests](../../src/__tests__/architecture/mobile-standards.test.ts) check selected sizing and viewport conventions.

History — This record supersedes ADR-005 by incorporating the rationale for Radix primitives and CVA variants.

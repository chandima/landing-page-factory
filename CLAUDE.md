# CLAUDE.md — RDS Nuxt Landing Pages

## Project overview
Build ASU marketing landing pages using **Nuxt 3** + **RDS Vue design system** (`@rds-vue-ui/*`).
The agent's job: take a Figma URL → produce a pixel-faithful page using DS components → verify visually.

## Quick reference

```bash
yarn ds:catalog          # Build/refresh component catalog → content/rds-catalog.json
yarn dev                 # Dev server at localhost:3000
yarn lint                # ESLint
yarn build               # Production build (catches type + template errors)
yarn test:e2e            # Playwright E2E + visual regression
```

## Architecture

```
content/
  rds-catalog.json   ← auto-generated; DO NOT hand-edit
  landing.json       ← page content (copy, links, lists)
components/
  sections/          ← one SFC per Figma section, wraps DS components
pages/
  index.vue          ← composes sections in order
tests/e2e/
  landing.spec.ts    ← Playwright tests with screenshot comparison
```

## Non-negotiables

1. **DS-first**: ALWAYS check `content/rds-catalog.json` before writing any markup.
   - If a component exists → use it.
   - If 1–2 small differences → use DS component + scoped CSS overrides.
   - Bespoke markup ONLY when no DS component exists AND making one is out of scope.

2. **Section architecture**: Each Figma block → `components/sections/XxxSection.vue`.

3. **Data-driven content**: All text, links, lists → `content/landing.json`.
   Section components receive data via `:model` prop.

4. **No new runtime deps** without explicit justification.

## Skills

Structured workflow guides in `.agents/skills/` (symlinked to `.claude/skills/`):
- **figma-to-page** — full Figma-to-page pipeline (extract → map → implement → verify)
- **landing-reviewer** — lint/build/e2e checks and DS compliance review
- **rds-components** — comprehensive reference for all 90 RDS Vue UI components (browse/search ad-hoc)
- **rds-catalog** — build and refresh the auto-generated component catalog

## Component catalog

Run `yarn ds:catalog` to regenerate. The catalog at `content/rds-catalog.json` contains for each installed `@rds-vue-ui/*` package:
- Full prop definitions with types, required flags, and defaults
- Slot names
- Events with payload types
- Visual pattern description (what it looks like)
- Figma signals (what to look for in Figma)
- Common pitfalls
- Import statement and usage snippet

## Figma workflow

1. User provides a Figma URL.
2. Use the **Framelink Figma MCP** server (configured in `.vscode/mcp.json`) to read frame structure.
3. Walk the Figma node tree top-to-bottom. For each major section:
   a. Match to an RDS component using `figmaSignals` from the catalog.
   b. Extract content (text, images, colors) from Figma nodes.
   c. Create/update `components/sections/XxxSection.vue` using the matched DS component.
   d. Add content to `content/landing.json`.
4. Update `pages/index.vue` to compose sections in order.

## RDS token reference

### Variant tokens (colors)
- `primary` = #8C1D40 (ASU Maroon)
- `secondary` = #FFC627 (ASU Gold)
- `dark-3` = #191919, `dark-2` = #2A2A2A, `dark-1` = #484848
- `light-1` = #FAFAFA, `light-2` = #E8E8E8, `light-3` = #D0D0D0, `light-4` = #BFBFBF
- `white` = #FFFFFF
- `success` = #78BE20, `warning` = #FF7F32, `error` = #B72A2A, `info` = #00A3E0

### Universal CTA prop pattern
All section/hero components support: `ctaLabel`, `ctaHref`, `ctaTarget`, `showCta`

### Heading levels
All section components accept `headingLevel`: `h1`–`h6`

## Visual verification

After implementing, run `yarn test:e2e` which:
1. Launches Nuxt dev server
2. Takes full-page screenshots at 1280px (desktop) and 375px (mobile)
3. Saves to `test-results/` for comparison against Figma

## Content schema

```typescript
interface LandingContent {
  hero: {
    headline: string;
    subheadline?: string;
    bgImageSource?: string;
    primaryCta?: { label: string; href: string };
    secondaryCta?: { label: string; href: string };
  };
  sections: Array<{
    title: string;
    body: string;
    imageSource?: string;
    imagePosition?: "left" | "right";
    variant?: string;
  }>;
  faq: {
    title: string;
    items: Array<{ title: string; content: string; image?: string }>;
  };
  testimonial: {
    title: string;
    items: Array<{
      quote: string;
      name: string;
      role: string;
      image?: string;
    }>;
  };
  footer: {
    secondaryLinks: Array<{ text: string; href: string }>;
  };
}
```

## Definition of done

- [ ] `yarn build` passes
- [ ] `yarn lint` passes
- [ ] `yarn test:e2e` passes
- [ ] Desktop screenshot matches Figma layout
- [ ] Mobile screenshot shows responsive layout
- [ ] All sections use DS components (or have documented exceptions)
- [ ] Content lives in `content/landing.json`

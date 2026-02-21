# AGENTS.md — RDS Nuxt Landing Pages

## Mission
Take a Figma URL and produce a pixel-faithful ASU marketing landing page using **Nuxt 3** + the **RDS Vue design system** (`@rds-vue-ui/*`).
The agent should complete the full cycle autonomously: extract design → map to DS components → implement → verify visually → fix issues.

---

## Quick commands

| Command | Purpose | Expected output |
|---------|---------|-----------------|
| `yarn ds:catalog` | Refresh component catalog | `✅ Wrote content/rds-catalog.json — N packages…` |
| `yarn dev` | Start dev server | Nuxt listening at `http://localhost:3000` |
| `yarn lint` | ESLint check | Clean = no output |
| `yarn build` | Full production build | `✓ You can now preview…` (catches type + template errors) |
| `yarn test:e2e` | Playwright E2E + screenshots | Test results + screenshots in `test-results/` |

---

## Non-negotiables

1. **DS-first**: ALWAYS check `content/rds-catalog.json` before writing ANY markup.
2. **Section architecture**: Each Figma block → `components/sections/XxxSection.vue`.
3. **Data-driven content**: All text/links/lists → `content/landing.json`. Components receive via `:model` prop.
4. **No new runtime deps** without explicit justification.
5. **Visual verification**: Every section must be screenshot-tested at 1280px and 375px.

---

## Sources of truth (priority order)

1. `content/rds-catalog.json` — component API, visual patterns, figma signals, pitfalls
2. `.github/skills/rds-components/SKILL.md` — full catalog of all 90 DS components (for discovery)
3. Figma frame structure (via MCP servers configured in `.vscode/mcp.json`)
4. Existing patterns in this repo

---

## Skills

Structured workflow guides in `.github/skills/`:

| Skill | Purpose | When to use |
|-------|---------|-------------|
| `figma-to-page` | Figma → DS mapping → implementation → verification | User provides a Figma URL |
| `landing-reviewer` | Lint, build, E2E, DS compliance audit | After implementation is complete |
| `rds-components` | Browse all 90 DS components by category | Ad-hoc component lookup, Figma matching |
| `rds-catalog` | Refresh the auto-generated catalog | After installing new DS packages |

---

## Component decision tree

When you encounter a Figma section, follow this flowchart:

```
1. Read the Figma section structure
   ↓
2. Scan rds-catalog.json "figmaSignals" for matches
   ↓
3. Match found?
   ├─ YES → Use that DS component
   │  └─ Small visual differences (1-2 tweaks)?
   │     ├─ YES → DS component + scoped CSS overrides
   │     └─ NO → DS component as-is
   └─ NO → Check "notInstalled" section of catalog
      ├─ Match found → `yarn add @rds-vue-ui/<name>`, re-run `yarn ds:catalog`
      └─ No match → Write bespoke markup, document WHY
```

---

## Workflow (always follow)

### Phase 1: Setup
1. Run `yarn ds:catalog` to ensure catalog is fresh.
2. Read `content/rds-catalog.json` to know available components.

### Phase 2: Extract (Figma → understanding)
3. User provides Figma URL.
4. Use Figma MCP server to read the frame structure.
5. Walk the node tree top-to-bottom, identifying major sections.

### Phase 3: Map (sections → DS components)
6. For each section, match to RDS components using the decision tree above.
7. Pay special attention to `pitfalls` in the catalog — these prevent common mistakes.

### Phase 4: Implement (one section at a time)
8. Create/update `components/sections/XxxSection.vue` with the DS component.
9. Extract content (text, images, colors, links) from Figma → `content/landing.json`.
10. Update `pages/index.vue` to compose sections in order.
11. After each section: `yarn lint && yarn build` to catch errors immediately.

### Phase 5: Verify
12. Run `yarn test:e2e` to capture screenshots.
13. Compare screenshots against Figma design.
14. Fix any visual delta, then re-run.

### Phase 6: Report
15. Summarize:
    - Which DS components were used
    - Any bespoke markup and WHY
    - Remaining visual deltas vs Figma

---

## RDS token reference

### Variant tokens (background + text colors)
| Token | Hex | Usage |
|-------|-----|-------|
| `primary` | #8C1D40 | ASU Maroon — hero backgrounds, CTAs |
| `secondary` | #FFC627 | ASU Gold — accents, highlights |
| `dark-3` | #191919 | Darkest — near-black backgrounds |
| `dark-2` | #2A2A2A | Dark backgrounds |
| `dark-1` | #484848 | Medium-dark |
| `white` | #FFFFFF | White sections |
| `light-1` | #FAFAFA | Near-white |
| `light-2` | #E8E8E8 | Light gray |
| `light-3` | #D0D0D0 | Medium gray |
| `light-4` | #BFBFBF | Darker gray |

### Universal CTA pattern
All section/hero components support: `ctaLabel`, `ctaHref`, `ctaTarget`, `showCta`

### Size tokens
`xs` (12px) | `small` (14px) | `medium` (16px) | `large` (24px) | `xl` (32px)

---

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
    items: Array<{ quote: string; name: string; role: string; image?: string }>;
  };
  footer: {
    secondaryLinks: Array<{ text: string; href: string }>;
  };
}
```

---

## File layout

| Path | Purpose | Edit policy |
|------|---------|-------------|
| `content/rds-catalog.json` | DS component catalog | Auto-generated — DO NOT hand-edit |
| `content/landing.json` | Page content | Agent-managed from Figma extraction |
| `components/sections/*.vue` | Section SFCs | One per Figma section, wraps DS components |
| `pages/index.vue` | Page composition | Imports + orders sections |
| `tests/e2e/landing.spec.ts` | E2E + visual tests | Add section-specific checks as needed |
| `scripts/ds-catalog.build.mjs` | Catalog builder | Rarely changed |

---

## Definition of done

- [ ] `yarn build` passes with zero errors
- [ ] `yarn lint` passes
- [ ] `yarn test:e2e` passes
- [ ] Desktop (1280px) screenshot matches Figma layout
- [ ] Mobile (375px) screenshot shows responsive layout
- [ ] All sections use DS components (exceptions documented with rationale)
- [ ] Content lives in `content/landing.json`
- [ ] Summary report lists DS components used + any bespoke markup

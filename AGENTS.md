# AGENTS.md — RDS Nuxt Landing Pages

## Mission

Take a Figma URL and produce a pixel-faithful ASU marketing landing page using **Nuxt 3** + the **RDS Vue design system** (`@rds-vue-ui/*`).
The agent should complete the full cycle autonomously: extract design → map to DS components → implement → verify visually → fix issues.

---

## Quick commands

| Command | Purpose | Expected output |
|---------|---------|-----------------|
| `yarn ds:catalog` | Refresh component catalog from installed packages | `✅ Wrote content/rds-catalog.json — N packages…` |
| `yarn ds:catalog --ds-source=<path>` | Catalog with full DS monorepo (adds `notInstalled` section) | Same, plus `notInstalled` with 81 packages |
| `yarn dev` | Start dev server | Nuxt listening at `http://localhost:3000` |
| `yarn lint` | ESLint check | Clean = no output |
| `yarn build` | Full production build | `✓ You can now preview…` (catches type + template errors) |
| `yarn test:e2e` | Playwright E2E + screenshots | Test results + screenshots in `test-results/` |

---

## Non-negotiables

1. **DS-first**: ALWAYS check `content/rds-catalog.json` before writing ANY markup. Use the component decision tree below.
2. **Section architecture**: Each visual block → `components/sections/XxxSection.vue`. Pages only compose sections.
3. **Data-driven content**: All text, links, and lists → `content/landing.json`. Components receive data via `:model` prop binding. Never hardcode copy in templates.
4. **No new runtime deps** without explicit justification.
5. **Visual verification**: Every section must be screenshot-tested at desktop (1280px) and mobile (375px) widths.
6. **Preserve symlinks**: `.claude/skills/` and `.github/skills/` are symlinks to `.agents/skills/`. NEVER delete, replace, or overwrite them. Edit skills only in `.agents/skills/` (the canonical source).

---

## Sources of truth (priority order)

1. `content/rds-catalog.json` — component API (props, slots, events, defaults), visual patterns, figma signals, pitfalls
2. `.agents/skills/rds-components/SKILL.md` — full catalog of all 90 DS components with descriptions and install commands
3. Figma frame structure (via MCP servers configured in `.vscode/mcp.json`)
4. Existing patterns in this repo (`components/sections/*.vue`, `pages/index.vue`)

---

## Installed DS packages

These 11 RDS packages are pre-installed and available in the template:

| Package | Purpose |
|---------|--------|
| `@rds-vue-ui/hero-standard-apollo` | Full-width hero with background image, text overlay, CTAs |
| `@rds-vue-ui/hero-video-apollo` | Video hero with mobile image fallback, gradient overlay |
| `@rds-vue-ui/section-apollo` | General content section (text, image, CTA) |
| `@rds-vue-ui/section-grid-atlas` | Grid layout section for card arrangements |
| `@rds-vue-ui/card-icon` | Icon card with title, body, CTA (used inside grid) |
| `@rds-vue-ui/overlap-accordion-atlas` | Accordion with optional side image (FAQ) |
| `@rds-vue-ui/section-testimonial-falcon` | Testimonial carousel/spotlight |
| `@rds-vue-ui/header-standard` | ASU-branded sticky header with nav + CTAs |
| `@rds-vue-ui/footer-standard` | ASU-branded footer |
| `@rds-vue-ui/analytics-gs-composable` | Google Analytics composable |
| `@rds-vue-ui/rds-theme-base` | CSS custom properties and base tokens |

To add more: `yarn add @rds-vue-ui/<name>`, then `yarn ds:catalog` to refresh the catalog.
Browse all 90 available packages in `.agents/skills/rds-components/SKILL.md`.

---

## Skills

Structured workflow guides in `.agents/skills/` (symlinked to `.claude/skills/` and `.github/skills/`):

| Skill | Purpose | When to use |
|-------|---------|-------------|
| `figma-to-page` | Figma → DS mapping → implementation → verification | User provides a Figma URL |
| `landing-reviewer` | Lint, build, E2E, DS compliance audit | After implementation is complete |
| `rds-components` | Browse all 90 DS components by category | Ad-hoc component lookup, Figma matching |

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
      └─ No match → Write bespoke markup, document WHY in the report
```

---

## Workflow (always follow)

### Phase 1: Setup
1. Run `yarn ds:catalog` to ensure catalog is fresh.
2. Read `content/rds-catalog.json` to know available components, their props, slots, events, and pitfalls.

### Phase 2: Extract (Figma → understanding)
3. User provides Figma URL.
4. Use Figma MCP server to read the frame structure (see MCP servers below).
5. Walk the node tree top-to-bottom, identifying major visual sections.

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
    - Which DS components were used (with package names)
    - Any bespoke markup and WHY
    - Content completeness (all Figma text captured?)
    - Remaining visual deltas vs Figma

---

## MCP servers

Four MCP servers are configured for agent tooling. Config locations:
- VS Code: `.vscode/mcp.json`
- Claude Code: `.mcp.json`
- Codex: run `./scripts/setup-codex-mcp.sh` (writes to `~/.codex/config.toml`)

| Server | Type | Endpoint | Purpose |
|--------|------|----------|---------|
| `figma-desktop` | HTTP | `http://127.0.0.1:3845/mcp` | Figma Desktop MCP (no PAT needed) |
| `figma-remote` | HTTP | `https://mcp.figma.com/mcp` | Figma Cloud MCP (needs `FIGMA_ACCESS_TOKEN`) |
| `playwright` | stdio | `npx @playwright/mcp@latest` | Browser automation and screenshots |
| `filesystem` | stdio | `npx @modelcontextprotocol/server-filesystem <root>` | Workspace file access |

Enable the Figma Desktop MCP in Figma app: Dev Mode → Inspect → MCP server → Enable desktop MCP server.

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

### CTA wiring patterns
CTA integration varies per component — check `content/rds-catalog.json` for each:
- **HeroStandardApollo**: No CTA props — use `below-text` slot with custom CTA links
- **SectionApollo**: No CTA props — add CTA links in `default` slot
- **SectionTestimonialFalcon**: Native CTA via `showCta`, `footerCtaText`, `footerCtaLink` props
- **HeroVideoApollo**: Native CTA via `displayCta`, `ctaText`, `ctaLink` props
- **CardIcon**: Native CTA via `displayCta`, `ctaText`, `ctaLink` props
- **FormSection**: Bespoke — `submitLabel` + `submitHref` in content JSON

### Size tokens
`xs` (12px) | `small` (14px) | `medium` (16px) | `large` (24px) | `xl` (32px)

---

## Content schema

All page content lives in `content/landing.json`. Components receive their slice via `:model` prop binding in `pages/index.vue`.

The `sections` array uses a `type` field to select which component renders it. The `sectionRegistry` in `pages/index.vue` maps types to Vue components.

```typescript
interface LandingContent {
  meta?: {
    title: string;
    description: string;
    ogImage?: string;
    canonicalUrl?: string;
  };
  header?: {
    homeTitle?: string;
    isSticky?: boolean;
    navItems?: Array<{ text: string; href: string }>;
    displayApplyNow?: boolean;
    applyNowText?: string;
    applyNowRedirectUrl?: string;
    displayRfiCta?: boolean;
    rfiCtaText?: string;
    rfiAnchorId?: string;
  };
  hero: {
    headline: string;
    subheadline?: string;
    bgImageSource?: string;
    primaryCta?: { label: string; href: string };
    secondaryCta?: { label: string; href: string };
    variant?: string;
    id?: string;
  };
  sections: Array<{
    type: "value" | "faq" | "testimonial" | "cardGrid" | "video" | "form";
    title?: string;
    id?: string;
    variant?: string;
    /** When true, section breaks out of the max-width container (full-bleed). */
    fullWidth?: boolean;
    // type-specific fields (see types/landing.ts for full interfaces)
    [key: string]: unknown;
  }>;
  footer: {
    secondaryLinks: Array<{ text: string; href: string }>;
  };
}
```

---

## File layout

| Path | Purpose | Edit policy |
|------|---------|-------------|
| `AGENTS.md` | Primary agent instructions | Read by Codex, Copilot, OpenCode, Cursor |
| `CLAUDE.md` | Thin pointer → `AGENTS.md` | Read by Claude Code — keeps in sync |
| `.github/copilot-instructions.md` | VS Code Copilot instructions | Shorter summary of key rules |
| `.agents/skills/` | Canonical skill location | Recognized by Copilot, Codex, OpenCode, Cursor |
| `.claude/skills/` | Symlink → `.agents/skills/` | **SYMLINK — DO NOT delete, edit, or replace** |
| `.github/skills` | Symlink → `.agents/skills/` | **SYMLINK — DO NOT delete, edit, or replace** |
| `content/rds-catalog.json` | DS component catalog | Auto-generated by `yarn ds:catalog` — DO NOT hand-edit |
| `content/landing.json` | Page content (copy, links, lists) | Agent-managed from Figma extraction |
| `types/landing.ts` | TypeScript interfaces for content JSON | Update when adding new section types |
| `components/sections/*.vue` | Section SFCs | One per visual section, wraps DS components |
| `pages/index.vue` | Page composition | Imports and orders section components |
| `tests/e2e/landing.spec.ts` | E2E + visual tests | Add section-specific checks as needed |
| `scripts/ds-catalog.build.mjs` | Catalog builder (~895 lines) | Reads `.vue.d.ts` to extract props/slots/events |
| `scripts/setup-codex-mcp.sh` | Codex MCP configuration | Idempotent; configures 4 MCP servers |
| `.vscode/mcp.json` | VS Code MCP server config | 4 servers: Figma Desktop/Remote, Playwright, Filesystem |
| `nuxt.config.ts` | Nuxt configuration | Transpiles `@rds-vue-ui/*`, loads theme CSS |
| `copier.yml` | Template scaffolding config | Used by `copier copy` to create new repos |
| `app.vue` | Nuxt root component | Renders `<NuxtPage />` |
| `assets/styles/app.css` | Global app styles | Loaded via `nuxt.config.ts` |

---

## Template sections — DS adapter examples

The template ships with 9 section wrappers that serve as **DS adapter examples** — reference implementations showing how to bridge `landing.json` content into DS component APIs. They encode non-obvious patterns (slot-based CTAs, nav item shape transforms, carousel state, field renames) documented in `.agents/skills/figma-to-page/references/SECTION-PATTERNS.md`.

Sections are dynamically rendered from the `sections[]` array in `landing.json` using a `type` → component registry in `pages/index.vue`.

| Section | Component | DS Package | Type / Content key |
|---------|-----------|------------|-------------------|
| Header | `HeaderSection.vue` | `header-standard` | `header` (top-level) |
| Hero | `HeroSection.vue` | `hero-standard-apollo` | `hero` (top-level) |
| Value props | `ValueSection.vue` | `section-apollo` | `type: "value"` |
| Card grid | `CardGridSection.vue` | `section-grid-atlas` + `card-icon` | `type: "cardGrid"` |
| FAQ | `FAQSection.vue` | `overlap-accordion-atlas` | `type: "faq"` |
| Testimonials | `TestimonialSection.vue` | `section-testimonial-falcon` | `type: "testimonial"` |
| Video hero | `VideoSection.vue` | `hero-video-apollo` | `type: "video"` |
| Lead form | `FormSection.vue` | Bespoke (DS-styled) | `type: "form"` |
| Footer | `BaseFooter.vue` | `footer-standard` | `footer` (top-level) |

When implementing a new landing page from a Figma design, treat these wrappers as starting points: study the pattern, then replace or extend with Figma-specific content. Add/remove section entries in `landing.json` as needed. To add a new section type, create a wrapper in `components/sections/` and register it in `sectionRegistry`.

---

## Roadmap (remaining enhancements)

Items marked ✅ are implemented. Remaining items are ordered by priority.

### ✅ Completed
- ~~Wire CTAs end-to-end~~ — CTAs flow through all section wrappers via slots or native props
- ~~Lead capture form section~~ — `FormSection.vue` with bespoke DS-styled form
- ~~Testimonial carousel~~ — `TestimonialSection.vue` renders all items with prev/next navigation
- ~~Dynamic section ordering~~ — `sectionRegistry` pattern with `type` field in `sections[]`
- ~~Card grid section~~ — `CardGridSection.vue` using `section-grid-atlas` + `card-icon`
- ~~Header / sticky nav~~ — `HeaderSection.vue` using `header-standard`
- ~~Section variant prop~~ — All sections accept `variant` for background color control
- ~~SEO / OG meta~~ — `useHead()` populates meta tags from `landing.json` `meta` object
- ~~Video hero / video section~~ — `VideoSection.vue` using `hero-video-apollo`
- ~~Anchor IDs + smooth scroll~~ — All sections accept `id` for anchor navigation
- ~~Content type safety~~ — `types/landing.ts` with full TypeScript interfaces for all content
- ~~Per-section full-width control~~ — `fullWidth: true` in section JSON breaks out of container
- ~~CTA token-based styles~~ — All hardcoded hex replaced with `var(--rds-*)` CSS custom properties
- ~~Environment configuration~~ — `.env.example` + `runtimeConfig` for GA, site URL, Figma token
- ~~Dev-mode unknown section warnings~~ — Console warns when `landing.json` uses unregistered type
- ~~Copier template prompts~~ — `copier.yml` prompts for program name, CTA URL, GA ID, sections

### P1 — Important (remaining)
- **Image pipeline**: Download Figma images to `public/images/` and optimize (WebP, responsive srcset).
- **Analytics composable wiring**: Connect `@rds-vue-ui/analytics-gs-composable` to CTA click events.

### P2 — Future
- **Content JSON schema validation**: Runtime Zod validation of `landing.json` at build time.
- **Parallax / animation sections**: Scroll-triggered animations using DS motion tokens.
- **Multi-page support**: Multiple landing pages from multiple content JSON files.
- **Accessibility testing**: axe-core integration in Playwright E2E tests.

---

## Definition of done

- [ ] `yarn build` passes with zero errors
- [ ] `yarn lint` passes
- [ ] `yarn test:e2e` passes
- [ ] Desktop (1280px) screenshot matches Figma layout
- [ ] Mobile (375px) screenshot shows responsive layout
- [ ] All sections use DS components (exceptions documented with rationale)
- [ ] Content lives in `content/landing.json`, not hardcoded in templates
- [ ] Summary report lists DS components used + any bespoke markup

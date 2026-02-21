# Copilot Instructions — RDS Nuxt Landing Pages

This project builds ASU marketing landing pages using **Nuxt 3** and the **RDS Vue design system** (`@rds-vue-ui/*` packages).

## Key rules

1. **DS-first**: Always prefer `@rds-vue-ui/*` components over bespoke HTML/CSS. Check `content/rds-catalog.json` for the full component API (props, slots, events, defaults).
2. **Section architecture**: Each visual section from Figma becomes a Vue SFC in `components/sections/`. Pages compose sections.
3. **Data-driven content**: All copy, links, and lists live in `content/landing.json`. Components receive data via `:model` prop binding.
4. **No new runtime deps** without explicit justification.
5. **Visual fidelity**: After implementing a section, take Playwright screenshots at 1280px and 375px widths to verify against Figma.

## Workflow

```
yarn ds:catalog          # Refresh component catalog
# Use Figma MCP server to read the design (configured in .vscode/mcp.json)
# Implement one section at a time
yarn lint && yarn build  # Verify no errors
yarn test:e2e            # Run visual + functional tests
```

## File conventions

| Path | Purpose |
|------|---------|
| `content/rds-catalog.json` | Auto-generated DS component catalog with full props/slots/events |
| `content/landing.json` | Page content data (copy, links, lists) |
| `components/sections/*.vue` | Section components wrapping DS components |
| `pages/index.vue` | Page composition — imports and orders sections |
| `tests/e2e/landing.spec.ts` | Playwright E2E + visual regression tests |

## RDS design system

- Components are in `@rds-vue-ui/*` npm scope (private Verdaccio at npm.edpl.us)
- All components accept `variant` (color) and `size` tokens
- CSS custom properties: `--rds-*` prefix
- Common variants: `primary` (ASU Maroon #8C1D40), `secondary` (ASU Gold #FFC627), `dark-1` through `dark-3`, `light-1` through `light-4`, `white`
- CTA pattern: `ctaLabel`, `ctaHref`, `ctaTarget`, `showCta` props

## Important skills

Use the skills in `.agents/skills/` for structured workflows:
- `figma-to-page` — full Figma-to-page pipeline (extract → map → implement → verify)
- `landing-reviewer` — lint/build/e2e checks and DS compliance review
- `rds-components` — comprehensive reference for all 90 RDS Vue UI components (browse/search ad-hoc)

## Symlink protection

These paths are **symlinks** to `.agents/skills/` — NEVER delete, replace, or overwrite them:
- `.claude/skills/` → `../.agents/skills` (for Claude Code)
- `.github/skills/` → `../.agents/skills` (for backward compat)

Always edit skills in `.agents/skills/` (the canonical source). If a symlink is broken, recreate it:
```bash
ln -s ../.agents/skills .claude/skills
ln -s ../.agents/skills .github/skills
```

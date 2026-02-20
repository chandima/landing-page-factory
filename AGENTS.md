# AGENTS.md — RDS Nuxt Landing Pages

## Mission
Build standalone marketing landing pages from Figma frames using Nuxt 3 + the RDS Vue design system.
Primary goal: match design intent while maximizing reuse of RDS components.

## Non‑negotiables
- Prefer RDS components over bespoke HTML/CSS whenever a reasonable match exists.
- Keep page structure "section-first": each major Figma block becomes a section component in `components/sections/`.
- Content is data-driven: copy, links, and lists live in `content/landing.json` unless there is a strong reason not to.
- No new runtime deps without explicit justification.

## Sources of truth (priority order)
1) RDS design system components + their documented props/variants.
2) Figma frame structure + variables.
3) Existing patterns in this repo.

## Workflow (always follow)
1) Generate/refresh the RDS catalog: `yarn ds:catalog`
2) Build a Figma node→component map: `yarn figma:map`
3) Implement one section at a time (small diffs).
4) Run checks:
   - `yarn lint`
   - `yarn build`
   - `yarn test:e2e`
5) Summarize:
   - Which DS components were used
   - Any bespoke markup and why
   - Remaining deltas vs Figma

## RDS substitution policy
- If a section can be built using an existing `@rds-vue-ui/*` package, do so.
- If only 1–2 small visual differences exist, prefer DS component + small wrapper styles.
- Only write bespoke markup when:
  (a) there is no DS component for the pattern, AND
  (b) creating a new DS component is out of scope for a landing page.

## Definition of done
- Page builds cleanly and passes E2E.
- Uses DS components for hero/sections/accordion/testimonials/footer where applicable.
- Mobile + desktop layouts verified via Playwright checks.

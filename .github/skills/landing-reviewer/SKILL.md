# Skill: landing-reviewer

Validate a landing page implementation against DS standards, build health, and visual fidelity.

---

## When to use

- After implementing a page (post figma-to-page workflow)
- When asked to review an existing landing page
- As a CI/CD quality gate
- When debugging visual or structural issues

---

## Step-by-step procedure

### Step 1: Static analysis

```bash
yarn lint
```

**Check for:**
- ESLint errors (must be zero)
- Any bespoke HTML that could use an RDS component instead
- Missing `variant` or `size` props on DS components
- Hardcoded text that should be in `content/landing.json`

### Step 2: Build verification

```bash
yarn build
```

**Check for:**
- TypeScript errors
- Missing imports
- Prop type mismatches
- Template compilation errors

A clean build confirms all components render without runtime errors.

### Step 3: Catalog compliance

Read `content/rds-catalog.json` and `content/landing.json`.
For each section component in `components/sections/`:

1. **Is it using a DS component?**
   - YES → Check that props match catalog definitions (correct types, required props present)
   - NO → Is there a DS component that could work? Check `figmaSignals` in catalog.
     - Match found → Flag as "should use DS component"
     - No match → Acceptable if documented

2. **Are pitfalls avoided?**
   - Cross-reference component usage against `pitfalls` in catalog
   - Common issues: missing `showText`, wrong `gradientOpacity`, missing `defaultAccordionImage`

3. **Is content data-driven?**
   - All text/links/lists should come from `content/landing.json`
   - No hardcoded strings in template (except structural HTML)

### Step 4: Visual regression

```bash
yarn test:e2e
```

This captures screenshots at:
- **Desktop**: 1280px width, full page
- **Mobile**: 375px width, full page

**Review screenshots for:**
- Section ordering matches Figma
- Text content is correct
- Images are loading
- Colors match RDS variant tokens
- Spacing/padding looks reasonable
- Mobile layout is responsive (stacks properly)

### Step 5: Accessibility quick-check

In each section component, verify:
- Images have `alt` text
- Heading hierarchy is correct (one `h1`, sections use `h2`+)
- CTA buttons/links have descriptive text
- Color contrast meets WCAG AA (RDS variants are designed for this)

### Step 6: Performance check

Review for:
- Images use correct sizing (not loading 4000px images for 400px containers)
- No unnecessary client-side JavaScript
- Components use `defineProps` (not reactive refs for static content)

---

## Output format

Generate a structured report:

```markdown
## Landing Page Review Report

### Build Health
- Lint: ✅/❌ (error count)
- Build: ✅/❌ (error details)
- E2E: ✅/❌ (test results)

### DS Compliance
| Section | Component Used | DS Component? | Notes |
|---------|---------------|---------------|-------|
| Hero | HeroStandardApollo | ✅ | — |
| Value | SectionApollo | ✅ | — |
| FAQ | OverlapAccordionAtlas | ✅ | — |
| Custom | bespoke div | ❌ | No DS match for [reason] |

### Content Data-Driven
- All text in landing.json: ✅/❌
- Hardcoded strings found: [list]

### Visual Verification
- Desktop screenshot: [path]
- Mobile screenshot: [path]
- Figma deltas: [list any differences]

### Pitfall Check
- [component]: [pitfall avoided/triggered]

### Recommendations
1. [specific actionable item]
2. [specific actionable item]
```

---

## Severity levels

| Level | Meaning | Action |
|-------|---------|--------|
| 🔴 Blocker | Build fails or DS component misused | Fix immediately |
| 🟡 Warning | Bespoke markup where DS could work | Fix if time allows |
| 🟢 Info | Minor style difference from Figma | Document and accept |

# Skill: figma-to-page

Convert a Figma frame URL into a fully-implemented, DS-component-based Nuxt landing page.

---

## When to use

User provides a Figma URL and wants the page built. This skill covers the full pipeline:
extract → map → implement → populate content.

---

## Prerequisites

- `content/rds-catalog.json` exists and is fresh (run `yarn ds:catalog` if stale)
- Figma MCP server is available (configured in `.vscode/mcp.json`)
- `content/landing.json` exists (will be overwritten with Figma content)

---

## Step-by-step procedure

### Step 1: Refresh catalog

```bash
yarn ds:catalog
```

Read `content/rds-catalog.json` to understand:
- Which components are installed (with full props/slots/events)
- `figmaSignals` — what Figma patterns each component handles
- `pitfalls` — common mistakes to avoid
- `notInstalled` — components that can be added via `yarn add`

### Step 2: Extract Figma structure

Use the Figma MCP server to read the provided Figma URL:
1. Call `get_file` or `get_node` to retrieve the frame tree.
2. Walk nodes top-to-bottom, noting:
   - Layer names and hierarchy (these indicate section boundaries)
   - Text nodes (extract copy verbatim)
   - Image fills (note image URLs for download)
   - Color values (map to RDS variant tokens)
   - Layout direction/spacing (indicates responsive behavior)

### Step 3: Map sections to DS components

For each major section identified in Step 2:

```
Section from Figma
  ↓
Scan catalog figmaSignals for match
  ↓
├─ MATCH (confidence ≥ 80%)
│  → Use that DS component
│  → Note any prop mappings needed
│  → Check pitfalls for gotchas
│
├─ PARTIAL MATCH (50-80%)
│  → Use DS component + scoped CSS for differences
│  → Document the differences
│
├─ NO MATCH in installed
│  → Check notInstalled list in catalog
│  ├─ Found → yarn add @rds-vue-ui/<name> && yarn ds:catalog
│  └─ Not found → Plan bespoke markup, document reason
│
└─ Record mapping: {sectionName, component, props, contentPath}
```

### Step 4: Populate content

Create/update `content/landing.json` with all text, links, and lists extracted from Figma.
Follow the content schema documented in AGENTS.md.

**Important rules:**
- Copy text EXACTLY as it appears in Figma (typos are designer's responsibility)
- For images: use Figma image URLs initially, note them for later asset download
- For colors: map Figma hex values to the nearest RDS variant token

### Step 5: Implement sections (one at a time)

For each mapped section, create `components/sections/XxxSection.vue`:

```vue
<script setup lang="ts">
import { ComponentName } from "@rds-vue-ui/component-name";

defineProps<{
  model: {
    // Type matching content/landing.json structure for this section
  };
}>();
</script>

<template>
  <ComponentName
    :prop1="model.field1"
    :prop2="model.field2"
    variant="primary"
  >
    <!-- slots if needed -->
  </ComponentName>
</template>
```

**After EACH section:**
```bash
yarn lint && yarn build
```
Fix any errors before moving to the next section.

### Step 6: Compose page

Update `pages/index.vue` to import and order all sections:

```vue
<script setup lang="ts">
import landing from "~/content/landing.json";
// import each section component
</script>

<template>
  <main>
    <!-- sections in Figma order -->
  </main>
</template>
```

### Step 7: Verify

```bash
yarn test:e2e
```

Compare screenshots in `test-results/` against the Figma design.
Fix any visual deltas and re-run until satisfactory.

---

## Output

When complete, report:
1. **DS components used** — list each with the section it serves
2. **Bespoke markup** — list any non-DS markup with justification
3. **Content completeness** — any placeholder text remaining
4. **Visual deltas** — known differences from Figma and why

---

## Common pitfalls

| Component | Pitfall | Fix |
|-----------|---------|-----|
| HeroStandardApollo | `showText` defaults to `false` | Set `:show-text="true"` to show subtitle |
| HeroStandardApollo | `gradientOpacity` defaults to `0.2` | Increase to `0.6`+ for dark overlays |
| SectionApollo | Default slot replaces body text | Use slot for custom content, OR use `text` prop |
| OverlapAccordionAtlas | Missing `defaultAccordionImage` | Always set — shown when no item selected |
| SectionTestimonialFalcon | `showCta` defaults to `true` | Set `false` if no CTA button in Figma |
| FooterStandard | `tertiaryItems` format | Must be `[{text, uri, target:'BLNK'}]` (not `href`) |

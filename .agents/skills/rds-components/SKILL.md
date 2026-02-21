---
name: rds-components
description: Browse, install, and use any of the 90 RDS Vue UI design system components by category — even without a Figma frame.
---

# Skill: rds-components

Browse, install, and use any RDS Vue design system component — even without a Figma frame.

---

## When to use

- User asks to add a component to the page ad-hoc ("add a card carousel", "I need an accordion")
- User asks what DS components are available
- User wants to explore component options before choosing
- User needs help with a specific component's props/slots/events

---

## Prerequisites

- `content/rds-catalog.json` must exist (run `yarn ds:catalog` to generate/refresh)
- Private registry configured: `echo '@rds-vue-ui:registry=https://npm.edpl.us' >> .npmrc`

---

## Quick reference: How to add a new component

```bash
# 1. Install
yarn add @rds-vue-ui/<component-name>

# 2. Rebuild catalog so agent knows the full API
yarn ds:catalog

# 3. Read the catalog entry
# Look in content/rds-catalog.json for props, slots, events, pitfalls

# 4. Create section wrapper
# components/sections/XxxSection.vue

# 5. Add content to content/landing.json

# 6. Compose in pages/index.vue

# 7. Verify
yarn lint && yarn build
```

---

## Complete component inventory (90 packages)

Storybook: https://rds-vue-ui.edpl.us
Registry: https://npm.edpl.us

### Heroes (3)

| Package | Description | Install |
|---------|-------------|---------|
| `hero-standard-apollo` | Full-width hero section with background image, gradient overlay, highlighted title. 3 slots: above-title, below-title, below-text. | `yarn add @rds-vue-ui/hero-standard-apollo` |
| `hero-video-apollo` | Full-width hero with video background, headline, optional subtext, and CTA button. Includes play/pause, mobile fallback image. | `yarn add @rds-vue-ui/hero-video-apollo` |
| `hero-article-atlas` | Article hero with breadcrumbs, title, date/author info, social sharing buttons, and background image. | `yarn add @rds-vue-ui/hero-article-atlas` |

### Sections — Content (17)

| Package | Description | Install |
|---------|-------------|---------|
| `section-apollo` | Split section with image on one side and slot content on the other. Image position left/right. | `yarn add @rds-vue-ui/section-apollo` |
| `section-card-apollo` | Section with background image, title panel on left, body slot on right. | `yarn add @rds-vue-ui/section-card-apollo` |
| `section-card-atlas` | Section with header image, title, body slot, and CardIcon sidebar. | `yarn add @rds-vue-ui/section-card-atlas` |
| `section-container-atlas` | Flexible multi-column container with label, title, side content column, background. | `yarn add @rds-vue-ui/section-container-atlas` |
| `section-explore-atlas` | Explore section with dropdown selector, dynamic image, and link lists. | `yarn add @rds-vue-ui/section-explore-atlas` |
| `section-grid-atlas` | CSS grid section with configurable columns (2/3/4). Desktop 3-col → tablet 2-col → mobile 1-col. | `yarn add @rds-vue-ui/section-grid-atlas` |
| `section-intro-falcon` | Half-image half-text intro section with highlight accent and body slot. | `yarn add @rds-vue-ui/section-intro-falcon` |
| `section-overlap-apollo` | Dark section with overlapping image and text content, CTA link. | `yarn add @rds-vue-ui/section-overlap-apollo` |
| `section-paginated-atlas` | Paginated course listing with icon sidebar card and detail modals. | `yarn add @rds-vue-ui/section-paginated-atlas` |
| `section-parallax-apollo` | Parallax background with overlapping horizontal card and CTA. | `yarn add @rds-vue-ui/section-parallax-apollo` |
| `section-parallax-atlas` | Parallax section with large header image and overlapping content container. | `yarn add @rds-vue-ui/section-parallax-atlas` |
| `section-parallax-stacked` | Stacked full-screen parallax slides with sticky scroll and CTA buttons. | `yarn add @rds-vue-ui/section-parallax-stacked` |
| `section-search-atlas` | Program search with text filter, checkboxes, pagination, offcanvas detail panel. | `yarn add @rds-vue-ui/section-search-atlas` |
| `section-step-apollo` | Step section with circular image, step number badge, title, and body slot. | `yarn add @rds-vue-ui/section-step-apollo` |
| `section-video-apollo` | YouTube video background section with modal playback and title overlay. | `yarn add @rds-vue-ui/section-video-apollo` |
| `section-video-modal` | Video background section with centered play button and fullscreen modal. | `yarn add @rds-vue-ui/section-video-modal` |
| `starbucks-container-atlas` | Two-column CTA section with title, label, CTA button, and logo image (Starbucks-branded). | `yarn add @rds-vue-ui/starbucks-container-atlas` |

### Sections — Testimonials (8)

| Package | Description | Install |
|---------|-------------|---------|
| `section-testimonial-falcon` | Background image testimonial with label badge, quote, author, optional CTA. | `yarn add @rds-vue-ui/section-testimonial-falcon` |
| `section-testimonial-atlas` | Testimonial carousel with quote icon, author, label, navigation dots and arrows. | `yarn add @rds-vue-ui/section-testimonial-atlas` |
| `section-testimonial-columns` | Expanding column testimonials with images, quotes, and author details. | `yarn add @rds-vue-ui/section-testimonial-columns` |
| `section-testimonial-delta` | Large round image testimonial with quote, author, designation, title. | `yarn add @rds-vue-ui/section-testimonial-delta` |
| `section-testimonial-scout` | Generic scoped-slot carousel with title, underline, dots, and arrows. Works with any card component. | `yarn add @rds-vue-ui/section-testimonial-scout` |
| `image-testimonial-atlas` | Centered testimonial with round author image, quote icon, and attribution. | `yarn add @rds-vue-ui/image-testimonial-atlas` |
| `card-testimonial-apollo` | Testimonial card with round image, quote, labels, and modal CTA. Designed for use inside section-testimonial-scout. | `yarn add @rds-vue-ui/card-testimonial-apollo` |
| `card-testimonial-atlas` | Quote card with author image, quote icon, author and designation text. | `yarn add @rds-vue-ui/card-testimonial-atlas` |

### Cards (13)

| Package | Description | Install |
|---------|-------------|---------|
| `card-icon` | Card with icon image, title, optional CTA link, and left highlight bar. Slot for custom body content. | `yarn add @rds-vue-ui/card-icon` |
| `card-image-full` | Full-background-image card with gradient overlay, title, and CTA. 3 aspect ratios. | `yarn add @rds-vue-ui/card-image-full` |
| `card-image-article` | Article card with image, title, date/read-time metadata, and CTA link. | `yarn add @rds-vue-ui/card-image-article` |
| `card-image-tile` | Image tile with hover overlay showing text content on desktop. Supports lazy-loading. | `yarn add @rds-vue-ui/card-image-tile` |
| `card-info-horizontal` | Horizontal card with image left or right and text body content. | `yarn add @rds-vue-ui/card-info-horizontal` |
| `card-info-vertical` | Vertical card with top image, highlight bar, title, body and CTA. | `yarn add @rds-vue-ui/card-info-vertical` |
| `card-link-atlas` | Link card with background image on left and title on right. Animations on hover. | `yarn add @rds-vue-ui/card-link-atlas` |
| `card-degree-search` | Degree search card with image, label, title, underline, footer chevron CTA. | `yarn add @rds-vue-ui/card-degree-search` |
| `card-degree-text` | Text-only degree card with growth and salary icons below title. | `yarn add @rds-vue-ui/card-degree-text` |
| `card-text-atlas` | Text card with label, title, underline, and footer CTA with chevron. | `yarn add @rds-vue-ui/card-text-atlas` |
| `starbucks-hover-card` | Card with hover effect — font color inverts to background color on hover. | `yarn add @rds-vue-ui/starbucks-hover-card` |
| `highlight-apollo` | Highlighted heading text block with optional subheading and CTA link. Background-colored text. | `yarn add @rds-vue-ui/highlight-apollo` |
| `content-slide-in-atlas` | Image-card with slide-in left/right animation triggered on scroll into view. | `yarn add @rds-vue-ui/content-slide-in-atlas` |

### Carousels (4)

| Package | Description | Install |
|---------|-------------|---------|
| `carousel-card-apollo` | Generic card carousel with pagination dots, arrows, and background. Works with most portrait-style card components. | `yarn add @rds-vue-ui/carousel-card-apollo` |
| `carousel-image-apollo` | Image carousel with side content panel, indicators, and CTA. Dynamic slots per slide. | `yarn add @rds-vue-ui/carousel-image-apollo` |
| `ranking-carousel-apollo` | Ranking/awards carousel with background image and highlight badges. For showcasing rankings/accolades. | `yarn add @rds-vue-ui/ranking-carousel-apollo` |
| `timer-carousel-apollo` | Auto-advancing timed carousel with progress bar, play/pause, image left + content right. | `yarn add @rds-vue-ui/timer-carousel-apollo` |

### Accordion (4)

| Package | Description | Install |
|---------|-------------|---------|
| `rds-accordion` | Wrapper that manages multiple collapse-items — handles expand/collapse coordination. | `yarn add @rds-vue-ui/rds-accordion` |
| `collapse-item` | Single collapsible item with expand/collapse animation, highlight bar, and icon/title slots. | `yarn add @rds-vue-ui/collapse-item` |
| `overlap-accordion-atlas` | Overlap-style accordion with background image that changes per active item. Intended for ~6 items. | `yarn add @rds-vue-ui/overlap-accordion-atlas` |
| `side-panel-accordion` | FAQ-style accordion where content opens in a side panel instead of expanding vertically. | `yarn add @rds-vue-ui/side-panel-accordion` |

### Navigation (5)

| Package | Description | Install |
|---------|-------------|---------|
| `header-standard` | Full site header with logo, nav items, mobile nav, search, and dropdowns. Required on all landing pages. | `yarn add @rds-vue-ui/header-standard` |
| `navbar-fixed-atlas` | Fixed navbar with scroll progress bar, brand logo, nav links, and CTA. Uses smooth scroll. | `yarn add @rds-vue-ui/navbar-fixed-atlas` |
| `navbar-sticky-apollo` | Sticky sidebar navigation with utility/contact section and scroll offset. | `yarn add @rds-vue-ui/navbar-sticky-apollo` |
| `navbar-sticky-atlas` | Sticky section navigation with scroll spy, underline indicators, collapsible on mobile. | `yarn add @rds-vue-ui/navbar-sticky-atlas` |
| `breadcrumb-apollo` | Horizontal breadcrumb trail showing user's location within site hierarchy. | `yarn add @rds-vue-ui/breadcrumb-apollo` |

### Footer (2)

| Package | Description | Install |
|---------|-------------|---------|
| `footer-standard` | Standard ASU footer with primary section slot, secondary and tertiary links. Required on all standard ASU pages. | `yarn add @rds-vue-ui/footer-standard` |
| `footer-partner` | Partner footer with logo, contact info, social media links, and collapsible menus. For partner landing pages. | `yarn add @rds-vue-ui/footer-partner` |

### Media (7)

| Package | Description | Install |
|---------|-------------|---------|
| `button-play-apollo` | Small circular play button with SVG icon for triggering video modals. | `yarn add @rds-vue-ui/button-play-apollo` |
| `image-infographic-atlas` | Infographic image with modal popup for full-size view and CTA. | `yarn add @rds-vue-ui/image-infographic-atlas` |
| `image-landscape-atlas` | Landscape image with caption text and accent line below. | `yarn add @rds-vue-ui/image-landscape-atlas` |
| `image-portrait-atlas` | Portrait image with caption text and accent line below. | `yarn add @rds-vue-ui/image-portrait-atlas` |
| `video-caption-apollo` | YouTube video thumbnail with play button, modal playback, and caption. | `yarn add @rds-vue-ui/video-caption-apollo` |
| `video-modal-atlas` | Card with video thumbnail, play button, modal, highlight bar, and title. | `yarn add @rds-vue-ui/video-modal-atlas` |
| `content-timed-delay` | Auto-rotating timed content cards triggered on scroll with staggered GSAP animations. | `yarn add @rds-vue-ui/content-timed-delay` |

### Forms (7)

| Package | Description | Install |
|---------|-------------|---------|
| `typeinput-text` | Text input with label, tooltip, validation icons, regex validation, and subtext. | `yarn add @rds-vue-ui/typeinput-text` |
| `form-checkbox` | Styled checkbox with bounded/outline variants and indeterminate state. | `yarn add @rds-vue-ui/form-checkbox` |
| `radio-button-apollo` | Styled radio button with bounded/icon variants and label. Supports v-model. | `yarn add @rds-vue-ui/radio-button-apollo` |
| `radio-group-apollo` | Radio button group wrapper with label, direction, and tooltip. | `yarn add @rds-vue-ui/radio-group-apollo` |
| `phone-input-apollo` | International phone input with country flag dropdown and validation. | `yarn add @rds-vue-ui/phone-input-apollo` |
| `date-picker` | Date picker wrapping VueDatePicker with RDS-themed calendar. | `yarn add @rds-vue-ui/date-picker` |
| `file-input-apollo` | File upload input with drag-and-drop, multiple file selection, size/type validation. | `yarn add @rds-vue-ui/file-input-apollo` |
| `typeahead-search` | Searchable typeahead with Fuse.js fuzzy matching and dropdown results. | `yarn add @rds-vue-ui/typeahead-search` |
| `typeahead-select` | Typeahead select dropdown with fuzzy search, keyboard nav, and clear button. | `yarn add @rds-vue-ui/typeahead-select` |

### Tabs (2)

| Package | Description | Install |
|---------|-------------|---------|
| `tab-carousel-atlas` | Tabbed content switcher with underline indicators. Supports vertical and sticky modes. | `yarn add @rds-vue-ui/tab-carousel-atlas` |
| `tab-switcher-apollo` | Pill-style tab switcher with sliding highlight background animation. | `yarn add @rds-vue-ui/tab-switcher-apollo` |

### Lists (3)

| Package | Description | Install |
|---------|-------------|---------|
| `list-item-circular` | Numbered circular list item with colored number badge. | `yarn add @rds-vue-ui/list-item-circular` |
| `list-item-hover` | Hoverable list item with icon button and configurable border. | `yarn add @rds-vue-ui/list-item-hover` |
| `list-timeline` | Numbered timeline ordered list with connecting lines between items. | `yarn add @rds-vue-ui/list-timeline` |

### UI Primitives (8)

| Package | Description | Install |
|---------|-------------|---------|
| `rds-alert` | Dismissible alert banner with icon, transitions, and auto-timeout. | `yarn add @rds-vue-ui/rds-alert` |
| `rds-dropdown` | Dropdown menu using Floating UI for positioning. Has button-content slot and menu item slots. | `yarn add @rds-vue-ui/rds-dropdown` |
| `rds-loader` | Loading spinner or grow animation with optional full-page backdrop. | `yarn add @rds-vue-ui/rds-loader` |
| `rds-modal` | Modal dialog using native `<dialog>` element with teleport and backdrop. | `yarn add @rds-vue-ui/rds-modal` |
| `rds-offcanvas` | Slide-out offcanvas panel from start/end/top/bottom with backdrop. Bootstrap-compatible. | `yarn add @rds-vue-ui/rds-offcanvas` |
| `rds-pagination` | Full pagination with page buttons, ellipsis, prev/next, first/last. Re-written b-pagination. | `yarn add @rds-vue-ui/rds-pagination` |
| `rds-tool-tip` | Floating tooltip with hover/focus trigger using Floating UI positioning. | `yarn add @rds-vue-ui/rds-tool-tip` |
| `table-apollo` | Data table with sortable headers, configurable borders, and RDS color tokens. | `yarn add @rds-vue-ui/table-apollo` |

### Themes (4)

| Package | Description | Install |
|---------|-------------|---------|
| `rds-theme-base` | **Required.** Base ASU brand theme CSS custom properties. | `yarn add @rds-vue-ui/rds-theme-base` |
| `rds-theme-airuniversity` | Air University brand theme override. | `yarn add @rds-vue-ui/rds-theme-airuniversity` |
| `rds-theme-dsl` | DSL brand theme override. | `yarn add @rds-vue-ui/rds-theme-dsl` |
| `rds-theme-starbucks` | Starbucks brand theme override. | `yarn add @rds-vue-ui/rds-theme-starbucks` |

### Utility (1)

| Package | Description | Install |
|---------|-------------|---------|
| `analytics-gs-composable` | Vue composable for GTM/Tealium event tracking. Not a visual component. | `yarn add @rds-vue-ui/analytics-gs-composable` |

---

## Component selection guide

When a user requests a pattern, use this decision tree:

```
User describes a visual pattern
  ↓
Search this inventory by category + description
  ↓
├─ Exact match → Install + use
├─ Close match → Install + use with scoped CSS overrides
├─ Multiple candidates → Ask user to choose (show descriptions)
└─ No match → Write bespoke markup, document WHY
```

### Common pattern → component mappings

| User says... | Use this component |
|-------------|-------------------|
| "hero", "banner", "splash" | `hero-standard-apollo` or `hero-video-apollo` |
| "accordion", "FAQ", "expandable" | `rds-accordion` + `collapse-item` or `overlap-accordion-atlas` |
| "testimonial", "quote" | `section-testimonial-falcon` (single) or `section-testimonial-atlas` (carousel) |
| "card grid", "feature cards" | `section-grid-atlas` + `card-icon` or `card-info-vertical` |
| "image and text side by side" | `section-apollo` (most common) or `section-intro-falcon` |
| "video section" | `section-video-apollo` or `section-video-modal` |
| "carousel", "slider" | `carousel-card-apollo` (cards) or `timer-carousel-apollo` (timed) |
| "parallax" | `section-parallax-apollo` or `section-parallax-atlas` |
| "steps", "process" | `section-step-apollo` (per step) or `list-timeline` |
| "tabs" | `tab-carousel-atlas` (underline) or `tab-switcher-apollo` (pills) |
| "footer" | `footer-standard` (ASU standard) or `footer-partner` (partner pages) |
| "header", "nav" | `header-standard` + optionally `navbar-fixed-atlas` or `navbar-sticky-atlas` |
| "form", "input" | `typeinput-text`, `form-checkbox`, `radio-group-apollo`, etc. |
| "table", "data grid" | `table-apollo` |
| "modal", "popup", "dialog" | `rds-modal` |
| "loading", "spinner" | `rds-loader` |
| "search", "program finder" | `section-search-atlas` or `typeahead-search` |
| "ranking", "awards" | `ranking-carousel-apollo` |

---

## Universal props (available on most components)

| Prop | Type | Description |
|------|------|-------------|
| `variant` | string | Color token: `primary`, `secondary`, `dark-1`–`dark-3`, `light-1`–`light-4`, `white` |
| `size` | string | Size token: `xs`, `small`, `medium`, `large`, `xl` |
| `titleLevel` | string | Heading tag: `h1`–`h6` |
| `showCta` / `displayCta` | boolean | Toggle CTA button visibility |
| `ctaText` / `ctaLabel` | string | CTA button text |
| `ctaLink` / `ctaHref` | string | CTA button URL |
| `ctaTarget` | string | Link target (`_blank`, etc.) |
| `ctaVariant` | string | CTA button color variant |
| `highlightColor` | string | Accent bar color |
| `displayHighlight` | boolean | Toggle accent bar |
| `imageSource` / `bgImageSource` | string | Image URL |
| `imagePosition` | string | `left` or `right` |
| `imageAlt` | string | Image alt text |

---

## Section wrapper pattern

When adding a component, always wrap it in a section component:

```vue
<script setup lang="ts">
import { ComponentName } from "@rds-vue-ui/component-name";

defineProps<{
  model: {
    // Shape matching content/landing.json
  };
}>();
</script>

<template>
  <ComponentName
    :title="model.title"
    :image-source="model.imageSource"
    variant="primary"
  >
    <template #default>
      <p>{{ model.body }}</p>
    </template>
  </ComponentName>
</template>
```

Then add content to `content/landing.json` and compose in `pages/index.vue`.

---

## After adding a component

```bash
yarn ds:catalog     # Regenerate catalog with new component's full API
yarn lint && yarn build   # Verify
yarn test:e2e       # Visual check
```

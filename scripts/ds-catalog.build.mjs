/**
 * Build a RICH catalog of installed @rds-vue-ui/* packages.
 *
 * Reads actual .vue.d.ts files to extract full prop interfaces, slot
 * definitions, events, and default values.  The resulting catalog gives
 * coding agents everything they need to correctly use DS components
 * without reading component source code.
 *
 * Usage:
 *   node scripts/ds-catalog.build.mjs
 *   node scripts/ds-catalog.build.mjs --ds-source=../edplusasu-rds-vue-ui
 *
 * The optional --ds-source flag adds ALL components from the design-system
 * monorepo (not just installed ones) to a "notInstalled" section so agents
 * know what else can be `yarn add`-ed.
 */
import fs from "node:fs";
import path from "node:path";

const OUT = path.resolve("content/rds-catalog.json");
const NODE_MODULES = path.resolve("node_modules", "@rds-vue-ui");

/* ------------------------------------------------------------------ */
/*  CLI                                                                */
/* ------------------------------------------------------------------ */
function parseArgs(argv) {
  const opts = {};
  for (const part of argv) {
    if (!part.startsWith("--")) continue;
    const [k, ...v] = part.slice(2).split("=");
    opts[k] = v.length ? v.join("=") : "true";
  }
  return opts;
}
const args = parseArgs(process.argv.slice(2));
const dsSourceRoot = args["ds-source"]
  ? path.resolve(args["ds-source"], "src/components")
  : null;

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
function safeRead(p) {
  try { return fs.readFileSync(p, "utf-8"); } catch { return null; }
}
function safeReadJson(p) {
  try { return JSON.parse(fs.readFileSync(p, "utf-8")); } catch { return null; }
}
function listDirs(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(
    (n) => !n.startsWith(".") && fs.statSync(path.join(dir, n)).isDirectory(),
  );
}
function toPascalCase(kebab) {
  return kebab.replace(/(^|-)(\w)/g, (_, _2, c) => c.toUpperCase());
}

/* ------------------------------------------------------------------ */
/*  .vue.d.ts parser                                                   */
/* ------------------------------------------------------------------ */

/** Parse `interface Props { ... }` → [{name, type, required}] */
function parsePropsInterface(dts) {
  const m = dts.match(/interface Props\s*\{([^}]+)\}/);
  if (!m) return [];
  const props = [];
  for (const pm of m[1].matchAll(/(\w+)(\?)?:\s*([^;]+);/g)) {
    props.push({ name: pm[1], type: pm[3].trim(), required: !pm[2] });
  }
  return props;
}

/** Parse `__VLS_WithDefaults<…, { … }>` → Set<propName> (props that have defaults) */
function parseDefaults(dts) {
  const defaults = new Set();
  const m = dts.match(
    /__VLS_WithDefaults<__VLS_TypePropsToRuntimeProps<Props>,\s*\{([^}]+)\}/,
  );
  if (!m) return defaults;
  for (const dm of m[1].matchAll(/(\w+):\s*(.+)/g)) {
    defaults.add(dm[1].trim());
  }
  return defaults;
}

/** Parse slot definitions — look for `"slot-name"?(_: ...): any;` patterns */
function parseSlots(dts) {
  const slots = [];
  // Slots appear as `"slot-name"?(_: {...}): any;` after the last `}, {` block
  // before `}>;` and `export default`
  for (const sm of dts.matchAll(/"([^"]+)"\?\(_:/g)) {
    slots.push(sm[1]);
  }
  // Also catch unnamed default slot: `default?(_: ...): any;`
  if (/\bdefault\?\(_:/g.test(dts) && !slots.includes("default")) {
    slots.push("default");
  }
  return slots;
}

/** Parse emits from ComponentOptionsMixin pair → [{name, payload?}] */
function parseEvents(dts) {
  const m = dts.match(
    /ComponentOptionsMixin,\s*(?:import\([^)]+\)\.)?ComponentOptionsMixin,\s*\{([^}]+)\}/,
  );
  if (!m) return [];
  const events = [];
  for (const em of m[1].matchAll(/(\w+):\s*\(([^)]*)\)\s*=>\s*void/g)) {
    events.push({ name: em[1], payload: em[2].trim() || undefined });
  }
  return events;
}

/** Parse exported interfaces (Item, TertiaryItem, etc.) */
function parseExportedTypes(dts) {
  const types = [];
  for (const m of dts.matchAll(/export\s+interface\s+(\w+)\s*\{([^}]+)\}/g)) {
    const fields = [];
    for (const f of m[2].matchAll(/(\w+)(\?)?:\s*([^;]+);/g)) {
      fields.push({ name: f[1], type: f[3].trim(), required: !f[2] });
    }
    types.push({ name: m[1], fields });
  }
  return types;
}

/* ------------------------------------------------------------------ */
/*  Visual metadata for Figma → component matching                     */
/* ------------------------------------------------------------------ */
const VISUAL_METADATA = {
  /* ---- Heroes ---------------------------------------------------- */
  "hero-standard-apollo": {
    category: "hero",
    visualPattern:
      "Full-width hero section with background image, gradient overlay, highlighted title. 3 slots: above-title, below-title, below-text.",
    figmaSignals: [
      "full-width image frame at top of page",
      "large overlaid heading text",
      "gradient/dark overlay on image",
      "hero banner",
    ],
    pitfalls: [
      "showText defaults to false — MUST set to true to display subtitle",
      "gradientOpacity defaults to 0.2 — increase for dark overlays (MLB page uses 0.6)",
    ],
  },
  "hero-video-apollo": {
    category: "hero",
    visualPattern:
      "Full-width hero with video background, headline, optional subtext, CTA. Includes play/pause, mobile fallback image.",
    figmaSignals: [
      "video play button on hero",
      "background video",
      "hero with CTA button",
    ],
    pitfalls: [
      "Requires both bgVideoSource and mobileImageSource",
      "Set displayGradient=true + increase gradientOpacity for text readability",
    ],
  },
  "hero-article-atlas": {
    category: "hero",
    visualPattern:
      "Article hero with breadcrumbs, title, date/author info, social sharing buttons, background image.",
    figmaSignals: [
      "article header",
      "breadcrumbs above title",
      "date and author line",
    ],
    pitfalls: [],
  },

  /* ---- Sections — Content ---------------------------------------- */
  "section-apollo": {
    category: "section",
    visualPattern:
      "Split section with image on one side and slot content on the other. Image position left/right.",
    figmaSignals: [
      "side-by-side image and text",
      "split layout section",
      "image left/right with paragraph",
    ],
    pitfalls: [
      "Default slot replaces sub-heading/text/CTA — use it for custom body content",
      "imagePosition: 'left' | 'right' to match Figma layout",
    ],
  },
  "section-card-apollo": {
    category: "section",
    visualPattern: "Section with background image, title panel on left, body slot on right.",
    figmaSignals: ["two-column section with title sidebar", "card section with background"],
    pitfalls: ["Use 'text' slot for left, 'body' slot for right"],
  },
  "section-card-atlas": {
    category: "section",
    visualPattern: "Section with header image, title, body slot, and CardIcon sidebar at bottom-right.",
    figmaSignals: ["section with icon card overlay"],
    pitfalls: [],
  },
  "section-container-atlas": {
    category: "section",
    visualPattern: "Flexible multi-column container with label, title, side content column, background.",
    figmaSignals: ["multi-column section", "container with sidebar"],
    pitfalls: [],
  },
  "section-explore-atlas": {
    category: "section",
    visualPattern: "Explore section with dropdown selector, dynamic image, and link lists.",
    figmaSignals: ["dropdown selector with image", "explore section"],
    pitfalls: [],
  },
  "section-grid-atlas": {
    category: "section",
    visualPattern: "CSS grid section. Default 3-col desktop → 2-col tablet → 1-col mobile. Supports 2/3/4 columns.",
    figmaSignals: ["grid of cards", "3-column layout", "card grid"],
    pitfalls: ["gridColumns default is 3; use gridColumnObject for responsive overrides"],
  },
  "section-intro-falcon": {
    category: "section",
    visualPattern: "Half-image half-text intro section with highlight accent bar and body slot.",
    figmaSignals: ["intro section", "image half with highlight bar"],
    pitfalls: [],
  },
  "section-overlap-apollo": {
    category: "section",
    visualPattern: "Dark section with overlapping image and text content, CTA link.",
    figmaSignals: ["overlapping image section", "dark background with image overlap"],
    pitfalls: [],
  },
  "section-paginated-atlas": {
    category: "section",
    visualPattern: "Paginated course listing with icon sidebar card and detail modals.",
    figmaSignals: ["paginated content list", "course listing"],
    pitfalls: [],
  },
  "section-parallax-apollo": {
    category: "section",
    visualPattern: "Parallax background with overlapping horizontal card and CTA.",
    figmaSignals: ["parallax background", "parallax section with card"],
    pitfalls: [],
  },
  "section-parallax-atlas": {
    category: "section",
    visualPattern: "Parallax section with large header image and overlapping content container.",
    figmaSignals: ["parallax with overlapping content"],
    pitfalls: [],
  },
  "section-parallax-stacked": {
    category: "section",
    visualPattern: "Stacked full-screen parallax slides with sticky scroll and CTA buttons.",
    figmaSignals: ["stacked parallax", "full-screen scroll sections"],
    pitfalls: [],
  },
  "section-search-atlas": {
    category: "section",
    visualPattern: "Program search with text filter, checkboxes, pagination, offcanvas detail panel.",
    figmaSignals: ["search/filter section", "program finder"],
    pitfalls: [],
  },
  "section-step-apollo": {
    category: "section",
    visualPattern: "Step section with circular image, step number badge, title, body slot.",
    figmaSignals: ["numbered step", "process step with image"],
    pitfalls: [],
  },
  "section-video-apollo": {
    category: "media",
    visualPattern: "YouTube video background section with modal playback and title overlay.",
    figmaSignals: ["video section", "YouTube embed with overlay"],
    pitfalls: [],
  },
  "section-video-modal": {
    category: "media",
    visualPattern: "Video background section with centered play button and fullscreen modal.",
    figmaSignals: ["video with play button", "video modal section"],
    pitfalls: [],
  },
  "starbucks-container-atlas": {
    category: "section",
    visualPattern: "Two-column CTA section with title, label, CTA button, and logo image (Starbucks-branded).",
    figmaSignals: ["Starbucks CTA section"],
    pitfalls: [],
  },

  /* ---- Testimonials ---------------------------------------------- */
  "section-testimonial-falcon": {
    category: "testimonial",
    visualPattern:
      "Background image testimonial with label badge, quote, author, optional CTA.",
    figmaSignals: [
      "quote/testimonial block",
      "quotation marks with author attribution",
      "profile image with quote text",
    ],
    pitfalls: [
      "text prop is the quote — component adds quotation marks",
      "showCta defaults to true — set to false if no button in Figma",
    ],
  },
  "section-testimonial-atlas": {
    category: "testimonial",
    visualPattern:
      "Testimonial carousel with quote icon, author, label, navigation dots and arrows.",
    figmaSignals: [
      "multiple quotes with navigation",
      "testimonial carousel/slider",
    ],
    pitfalls: ["items prop takes [{title, text, author, label}]"],
  },
  "section-testimonial-columns": {
    category: "testimonial",
    visualPattern: "Expanding column testimonials with images, quotes, and author details.",
    figmaSignals: ["multi-column testimonials", "expanding testimonial columns"],
    pitfalls: [],
  },
  "section-testimonial-delta": {
    category: "testimonial",
    visualPattern: "Large round image testimonial with quote, author, designation, title.",
    figmaSignals: ["large round image with quote"],
    pitfalls: [],
  },
  "section-testimonial-scout": {
    category: "testimonial",
    visualPattern: "Generic scoped-slot carousel for sliding through card components. Works with CardTestimonialApollo.",
    figmaSignals: ["testimonial slider", "card carousel with testimonials"],
    pitfalls: ["Place card component in scoped default slot"],
  },
  "image-testimonial-atlas": {
    category: "testimonial",
    visualPattern: "Centered testimonial with round author image, quote icon, and attribution.",
    figmaSignals: ["centered quote with round image"],
    pitfalls: [],
  },
  "card-testimonial-apollo": {
    category: "testimonial",
    visualPattern: "Testimonial card with round image, quote, labels, modal CTA. For use inside section-testimonial-scout.",
    figmaSignals: ["testimonial card with image"],
    pitfalls: [],
  },
  "card-testimonial-atlas": {
    category: "testimonial",
    visualPattern: "Quote card with author image, quote icon, author and designation text.",
    figmaSignals: ["small quote card with author"],
    pitfalls: [],
  },

  /* ---- Cards ----------------------------------------------------- */
  "card-icon": {
    category: "card",
    visualPattern: "Card with icon image, title, optional CTA link, and left highlight bar. Slot for body.",
    figmaSignals: ["card with icon", "feature/benefit card", "icon card"],
    pitfalls: ["iconSource is required"],
  },
  "card-image-full": {
    category: "card",
    visualPattern: "Full-background-image card with gradient overlay, title, and CTA. 3 aspect ratios.",
    figmaSignals: ["image card", "photo card", "full-image card"],
    pitfalls: [],
  },
  "card-image-article": {
    category: "card",
    visualPattern: "Article card with image, title, date/read-time metadata, and CTA link.",
    figmaSignals: ["article card", "news card", "blog card"],
    pitfalls: [],
  },
  "card-image-tile": {
    category: "card",
    visualPattern: "Image tile with hover overlay showing text content on desktop. Lazy-loading.",
    figmaSignals: ["hover reveal card", "image tile"],
    pitfalls: [],
  },
  "card-info-horizontal": {
    category: "card",
    visualPattern: "Horizontal card with image left or right and text body content.",
    figmaSignals: ["horizontal card", "side-by-side card"],
    pitfalls: [],
  },
  "card-info-vertical": {
    category: "card",
    visualPattern: "Vertical card with top image, highlight bar, title, body and CTA.",
    figmaSignals: ["vertical card", "info card with image on top"],
    pitfalls: [],
  },
  "card-link-atlas": {
    category: "card",
    visualPattern: "Link card with background image on left and title on right. Hover animations.",
    figmaSignals: ["link card", "animated card"],
    pitfalls: [],
  },
  "card-degree-search": {
    category: "card",
    visualPattern: "Degree search card with image, label, title, underline, footer chevron CTA.",
    figmaSignals: ["degree card with image"],
    pitfalls: [],
  },
  "card-degree-text": {
    category: "card",
    visualPattern: "Text-only degree card with growth and salary icons below title.",
    figmaSignals: ["degree text card", "salary/growth card"],
    pitfalls: [],
  },
  "card-text-atlas": {
    category: "card",
    visualPattern: "Text card with label, title, underline, and footer CTA with chevron.",
    figmaSignals: ["text card with footer CTA"],
    pitfalls: [],
  },
  "starbucks-hover-card": {
    category: "card",
    visualPattern: "Card with hover effect — font color inverts to background color on hover.",
    figmaSignals: ["hover invert card"],
    pitfalls: [],
  },
  "highlight-apollo": {
    category: "content",
    visualPattern: "Highlighted heading text with background color, optional subheading and CTA link.",
    figmaSignals: ["highlighted text", "colored background heading"],
    pitfalls: [],
  },
  "content-slide-in-atlas": {
    category: "content",
    visualPattern: "Image-card with slide-in left/right animation triggered on scroll into view.",
    figmaSignals: ["slide-in animation card"],
    pitfalls: [],
  },
  "content-timed-delay": {
    category: "content",
    visualPattern: "Auto-rotating timed content cards triggered on scroll with staggered GSAP animations.",
    figmaSignals: ["auto-rotating content", "timed content cards"],
    pitfalls: [],
  },

  /* ---- Carousels ------------------------------------------------- */
  "carousel-card-apollo": {
    category: "carousel",
    visualPattern: "Generic card carousel with pagination dots, arrows, background. Works with most portrait-style card components.",
    figmaSignals: ["card carousel", "horizontally scrolling cards"],
    pitfalls: [
      "Uses scoped default slot — you render cards inside it",
      "slides prop is generic array; slidesPerPage controls layout",
    ],
  },
  "carousel-image-apollo": {
    category: "carousel",
    visualPattern: "Image carousel with side content panel, indicators, and CTA. Dynamic slots per slide.",
    figmaSignals: ["image carousel", "image slider with content"],
    pitfalls: [],
  },
  "ranking-carousel-apollo": {
    category: "carousel",
    visualPattern: "Ranking/awards carousel with background image and highlight badges. For showcasing rankings.",
    figmaSignals: ["ranking badges", "awards carousel", "accolades"],
    pitfalls: [],
  },
  "timer-carousel-apollo": {
    category: "carousel",
    visualPattern: "Auto-advancing timed carousel with progress bar, play/pause, image left + content right.",
    figmaSignals: ["timed carousel", "auto-advancing slider with progress"],
    pitfalls: [],
  },

  /* ---- Accordion ------------------------------------------------- */
  "rds-accordion": {
    category: "accordion",
    visualPattern: "Wrapper that manages multiple collapse-items — handles expand/collapse coordination.",
    figmaSignals: ["group of expandable items"],
    pitfalls: ["Wrap CollapseItem children in default slot"],
  },
  "collapse-item": {
    category: "accordion",
    visualPattern: "Single collapsible item with expand/collapse animation, highlight bar, icon/title slots.",
    figmaSignals: ["expandable item", "chevron toggle"],
    pitfalls: ["Must be wrapped in RdsAccordion parent"],
  },
  "overlap-accordion-atlas": {
    category: "accordion",
    visualPattern:
      "Overlap-style accordion with background image that changes per active item. Intended for ~6 items.",
    figmaSignals: [
      "expandable/collapsible items with image",
      "accordion with image",
      "FAQ-style expand/collapse",
    ],
    pitfalls: [
      "accordionItems must be [{title, body, accordionId, image?}]",
      "defaultAccordionImage is required — shown when no item is selected",
    ],
  },
  "side-panel-accordion": {
    category: "accordion",
    visualPattern: "FAQ-style accordion where content opens in a side panel instead of expanding vertically.",
    figmaSignals: ["side panel FAQ", "sidebar accordion"],
    pitfalls: [],
  },

  /* ---- Navigation ------------------------------------------------ */
  "header-standard": {
    category: "navigation",
    visualPattern: "Full site header with logo, nav items, mobile nav, search, dropdowns. Required on all pages.",
    figmaSignals: ["site header", "main navigation", "logo with nav"],
    pitfalls: ["Includes skip link for accessibility"],
  },
  "navbar-fixed-atlas": {
    category: "navigation",
    visualPattern: "Fixed navbar with scroll progress bar, brand logo, nav links, CTA. Smooth scroll.",
    figmaSignals: ["fixed nav bar", "progress bar navigation"],
    pitfalls: [],
  },
  "navbar-sticky-apollo": {
    category: "navigation",
    visualPattern: "Sticky sidebar navigation with utility/contact section and scroll offset.",
    figmaSignals: ["sticky sidebar nav", "side navigation"],
    pitfalls: [],
  },
  "navbar-sticky-atlas": {
    category: "navigation",
    visualPattern: "Sticky section nav with scroll spy, underline indicators, collapsible on mobile.",
    figmaSignals: ["sticky section nav", "underline tab navigation"],
    pitfalls: [],
  },
  "breadcrumb-apollo": {
    category: "navigation",
    visualPattern: "Horizontal breadcrumb trail showing user's location within site hierarchy.",
    figmaSignals: ["breadcrumbs", "breadcrumb trail"],
    pitfalls: [],
  },

  /* ---- Footer ---------------------------------------------------- */
  "footer-standard": {
    category: "footer",
    visualPattern:
      "Standard ASU footer with primary section slot, secondary and tertiary links. Required on all standard ASU pages.",
    figmaSignals: [
      "footer at bottom of page",
      "legal/copyright links",
      "ASU innovation ranking badge",
    ],
    pitfalls: [
      "tertiaryItems: [{text, uri, target:'BLNK'}]",
      "primary-section slot for custom footer content above legal links",
    ],
  },
  "footer-partner": {
    category: "footer",
    visualPattern: "Partner footer with logo, contact info, social media links, collapsible menus.",
    figmaSignals: ["partner footer", "footer with social media"],
    pitfalls: [],
  },

  /* ---- Media ----------------------------------------------------- */
  "button-play-apollo": {
    category: "media",
    visualPattern: "Small circular play button with SVG icon for triggering video modals.",
    figmaSignals: ["play button", "circular video button"],
    pitfalls: [],
  },
  "image-infographic-atlas": {
    category: "media",
    visualPattern: "Infographic image with modal popup for full-size view and CTA.",
    figmaSignals: ["infographic", "expandable image"],
    pitfalls: [],
  },
  "image-landscape-atlas": {
    category: "media",
    visualPattern: "Landscape image with caption text and accent line below.",
    figmaSignals: ["landscape image with caption"],
    pitfalls: [],
  },
  "image-portrait-atlas": {
    category: "media",
    visualPattern: "Portrait image with caption text and accent line below.",
    figmaSignals: ["portrait image with caption"],
    pitfalls: [],
  },
  "video-caption-apollo": {
    category: "media",
    visualPattern: "YouTube video thumbnail with play button, modal playback, and caption.",
    figmaSignals: ["video thumbnail with caption"],
    pitfalls: [],
  },
  "video-modal-atlas": {
    category: "media",
    visualPattern: "Card with video thumbnail, play button, modal, highlight bar, and title.",
    figmaSignals: ["video card with modal"],
    pitfalls: [],
  },

  /* ---- Forms ----------------------------------------------------- */
  "typeinput-text": {
    category: "form",
    visualPattern: "Text input with label, tooltip, validation icons, regex validation, subtext.",
    figmaSignals: ["text input", "form field"],
    pitfalls: [],
  },
  "form-checkbox": {
    category: "form",
    visualPattern: "Styled checkbox with bounded/outline variants and indeterminate state.",
    figmaSignals: ["checkbox"],
    pitfalls: [],
  },
  "radio-button-apollo": {
    category: "form",
    visualPattern: "Styled radio button with bounded/icon variants and label. v-model support.",
    figmaSignals: ["radio button"],
    pitfalls: [],
  },
  "radio-group-apollo": {
    category: "form",
    visualPattern: "Radio button group wrapper with label, direction, tooltip.",
    figmaSignals: ["radio group"],
    pitfalls: [],
  },
  "phone-input-apollo": {
    category: "form",
    visualPattern: "International phone input with country flag dropdown and validation.",
    figmaSignals: ["phone number input", "international phone"],
    pitfalls: [],
  },
  "date-picker": {
    category: "form",
    visualPattern: "Date picker wrapping VueDatePicker with RDS-themed calendar.",
    figmaSignals: ["date picker", "calendar input"],
    pitfalls: [],
  },
  "file-input-apollo": {
    category: "form",
    visualPattern: "File upload input with drag-and-drop, multiple file selection, size/type validation.",
    figmaSignals: ["file upload", "drag and drop upload"],
    pitfalls: [],
  },
  "typeahead-search": {
    category: "form",
    visualPattern: "Searchable typeahead with Fuse.js fuzzy matching and dropdown results.",
    figmaSignals: ["search input", "typeahead search"],
    pitfalls: [],
  },
  "typeahead-select": {
    category: "form",
    visualPattern: "Typeahead select dropdown with fuzzy search, keyboard nav, clear button.",
    figmaSignals: ["select dropdown with search"],
    pitfalls: [],
  },

  /* ---- Tabs ------------------------------------------------------ */
  "tab-carousel-atlas": {
    category: "utility",
    visualPattern: "Tabbed content switcher with underline indicators. Supports vertical and sticky modes.",
    figmaSignals: ["tabs", "tab navigation", "underline tabs"],
    pitfalls: [],
  },
  "tab-switcher-apollo": {
    category: "utility",
    visualPattern: "Pill-style tab switcher with sliding highlight background animation.",
    figmaSignals: ["pill tabs", "segmented control"],
    pitfalls: [],
  },

  /* ---- Lists ----------------------------------------------------- */
  "list-item-circular": {
    category: "content",
    visualPattern: "Numbered circular list item with colored number badge.",
    figmaSignals: ["numbered list", "circular badge list"],
    pitfalls: [],
  },
  "list-item-hover": {
    category: "content",
    visualPattern: "Hoverable list item with icon button and configurable border.",
    figmaSignals: ["hover list item"],
    pitfalls: [],
  },
  "list-timeline": {
    category: "content",
    visualPattern: "Numbered timeline ordered list with connecting lines between items.",
    figmaSignals: ["timeline", "numbered steps with lines"],
    pitfalls: [],
  },

  /* ---- UI Primitives --------------------------------------------- */
  "rds-alert": {
    category: "utility",
    visualPattern: "Dismissible alert banner with icon, transitions, auto-timeout.",
    figmaSignals: ["alert", "notification banner"],
    pitfalls: [],
  },
  "rds-dropdown": {
    category: "utility",
    visualPattern: "Dropdown menu using Floating UI. Has button-content slot and menu item slots.",
    figmaSignals: ["dropdown menu"],
    pitfalls: [],
  },
  "rds-loader": {
    category: "utility",
    visualPattern: "Loading spinner or grow animation with optional full-page backdrop.",
    figmaSignals: ["loading spinner", "loader"],
    pitfalls: [],
  },
  "rds-modal": {
    category: "utility",
    visualPattern: "Modal dialog using native <dialog> element with teleport and backdrop.",
    figmaSignals: ["modal", "popup dialog"],
    pitfalls: [],
  },
  "rds-offcanvas": {
    category: "utility",
    visualPattern: "Slide-out offcanvas panel from start/end/top/bottom with backdrop.",
    figmaSignals: ["offcanvas", "slide-out panel"],
    pitfalls: [],
  },
  "rds-pagination": {
    category: "utility",
    visualPattern: "Full pagination with page buttons, ellipsis, prev/next, first/last.",
    figmaSignals: ["pagination", "page numbers"],
    pitfalls: [],
  },
  "rds-tool-tip": {
    category: "utility",
    visualPattern: "Floating tooltip with hover/focus trigger using Floating UI.",
    figmaSignals: ["tooltip"],
    pitfalls: [],
  },
  "table-apollo": {
    category: "utility",
    visualPattern: "Data table with sortable headers, configurable borders, RDS color tokens.",
    figmaSignals: ["data table", "sortable table"],
    pitfalls: [],
  },

  /* ---- Themes ----------------------------------------------------- */
  "rds-theme-airuniversity": {
    category: "theme",
    visualPattern: "CSS theme override for Air University branding.",
    figmaSignals: [],
    pitfalls: [],
  },
  "rds-theme-dsl": {
    category: "theme",
    visualPattern: "CSS theme override for DSL branding.",
    figmaSignals: [],
    pitfalls: [],
  },
  "rds-theme-starbucks": {
    category: "theme",
    visualPattern: "CSS theme override for Starbucks branding (SCAP program).",
    figmaSignals: [],
    pitfalls: [],
  },

  /* ---- Composable ------------------------------------------------ */
  "analytics-gs-composable": {
    category: "utility",
    visualPattern: "Vue composable for GTM/Tealium event tracking. Not a visual component.",
    figmaSignals: [],
    pitfalls: [],
  },
};

/* ------------------------------------------------------------------ */
/*  RDS token reference (inline for agent context)                     */
/* ------------------------------------------------------------------ */
const TOKEN_REFERENCE = {
  variantTokens: {
    "dark-3":  "#191919",
    "dark-2":  "#2A2A2A",
    "dark-1":  "#484848",
    primary:   "#8C1D40  (ASU Maroon)",
    secondary: "#FFC627  (ASU Gold)",
    white:     "#FFFFFF",
    "light-1": "#FAFAFA",
    "light-2": "#E8E8E8",
    "light-3": "#D0D0D0",
    "light-4": "#BFBFBF",
    success:   "#78BE20",
    warning:   "#FF7F32",
    error:     "#B72A2A",
    info:      "#00A3E0",
  },
  sizeTokens: { xs: "12px", small: "14px", medium: "16px", large: "24px", xl: "32px" },
  headingLevels: ["h1", "h2", "h3", "h4", "h5", "h6"],
  fontWeights: ["bold", "normal", "light", "lighter"],
};

/* ------------------------------------------------------------------ */
/*  Build one catalog entry                                            */
/* ------------------------------------------------------------------ */
function buildEntry(pkgDir, pkgName) {
  const short = pkgName.replace("@rds-vue-ui/", "");
  const comp = toPascalCase(short);
  const pkg = safeReadJson(path.join(pkgDir, "package.json"));
  const dtsFile = fs.readdirSync(pkgDir).find((f) => f.endsWith(".vue.d.ts"));
  const dts = dtsFile ? safeRead(path.join(pkgDir, dtsFile)) : null;
  const meta = VISUAL_METADATA[short] || {};

  const entry = {
    name: pkgName,
    component: comp,
    version: pkg?.version ?? "unknown",
    category: meta.category ?? "other",
    visualPattern: meta.visualPattern ?? "",
    figmaSignals: meta.figmaSignals ?? [],
    pitfalls: meta.pitfalls ?? [],
    importStatement: `import { ${comp} } from "${pkgName}";`,
    props: {},
    slots: [],
    events: [],
    exportedTypes: [],
    usage: "",
  };

  if (dts) {
    const rawProps = parsePropsInterface(dts);
    const defaults = parseDefaults(dts);
    for (const p of rawProps) {
      entry.props[p.name] = {
        type: p.type,
        required: p.required && !defaults.has(p.name),
        ...(defaults.has(p.name) ? { hasDefault: true } : {}),
      };
    }
    entry.slots = parseSlots(dts);
    entry.events = parseEvents(dts);
    entry.exportedTypes = parseExportedTypes(dts);
  }

  // Generate usage snippet
  const required = Object.entries(entry.props)
    .filter(([, v]) => v.required)
    .map(([k, v]) => (v.type === "string" ? `${k}="..."` : `:${k}="..."`));
  entry.usage = `<${comp} ${required.join(" ")} />`;

  return entry;
}

/* ------------------------------------------------------------------ */
/*  Scan DS source for all available (not installed) components        */
/* ------------------------------------------------------------------ */
function scanAvailable(dir) {
  if (!dir || !fs.existsSync(dir)) return [];
  return listDirs(dir).map((name) => {
    const meta = VISUAL_METADATA[name] || {};
    return {
      name: `@rds-vue-ui/${name}`,
      component: toPascalCase(name),
      category: meta.category ?? "unknown",
      visualPattern: meta.visualPattern ?? "",
      figmaSignals: meta.figmaSignals ?? [],
      installed: false,
      installCmd: `yarn add @rds-vue-ui/${name}`,
    };
  });
}

/* ------------------------------------------------------------------ */
/*  Main                                                               */
/* ------------------------------------------------------------------ */
const installed = [];
for (const name of listDirs(NODE_MODULES)) {
  const dir = path.join(NODE_MODULES, name);
  const pkg = safeReadJson(path.join(dir, "package.json"));
  if (!pkg) continue;
  installed.push(buildEntry(dir, pkg.name));
}
installed.sort((a, b) => {
  const am = a.visualPattern ? 0 : 1;
  const bm = b.visualPattern ? 0 : 1;
  return am !== bm ? am - bm : a.name.localeCompare(b.name);
});

const available = scanAvailable(dsSourceRoot);
const installedSet = new Set(installed.map((p) => p.name));
const notInstalled = available.filter((a) => !installedSet.has(a.name));

const catalog = {
  generatedAt: new Date().toISOString(),
  source: "node_modules/@rds-vue-ui + .vue.d.ts introspection",
  tokenReference: TOKEN_REFERENCE,
  substitutionPolicy: [
    "ALWAYS prefer an @rds-vue-ui component over bespoke HTML/CSS when a reasonable match exists.",
    "If only 1–2 small visual differences exist, use the DS component + small wrapper styles.",
    "Only write bespoke markup when NO DS component matches AND creating one is out of scope.",
    "When a needed component is not installed, check notInstalled list and run: yarn add @rds-vue-ui/<name>",
  ],
  installed,
  ...(notInstalled.length ? { notInstalled } : {}),
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, `${JSON.stringify(catalog, null, 2)}\n`);
console.log(
  `✅ Wrote ${OUT} — ${installed.length} packages with full prop/slot/event introspection`,
);
if (notInstalled.length) {
  console.log(`   ${notInstalled.length} additional components available in DS source`);
}

# Section Wrapper Patterns

> **Reference for `figma-to-page` skill.**
> These patterns document non-obvious DS component behaviours that affect how
> section wrappers must be built. The living code is in `components/sections/`.

---

## 1. HeaderStandard — nav item shape transform

**Problem:** `landing.json` stores nav items as flat `{ text, href }` objects.
`HeaderStandard` expects a deeply nested shape.

**Required DS shape:**
```ts
{
  isActive: false,
  htmlLink: { text: string, uri: string, target: string },
  children: [{
    hasBorderTop: false,
    htmlLink: { text: string, uri: string, target: string }
  }]
}
```

**Pattern:** Use a `computed` to transform. See [HeaderSection.vue](../../../components/sections/HeaderSection.vue) lines 31–49.

```ts
const dsNavItems = computed(() =>
  (props.model.navItems || []).map((item) => ({
    isActive: false,
    htmlLink: { text: item.text, uri: item.href, target: item.target || "_self" },
    children: (item.children || []).map((child) => ({
      hasBorderTop: false,
      htmlLink: { text: child.text, uri: child.href, target: child.target || "_self" },
    })),
  })),
);
```

**If you skip this:** SSR crash — `Cannot read properties of undefined (reading 'uri')`.

---

## 2. HeroStandardApollo — CTAs via slot, not props

**Problem:** `HeroStandardApollo` has **zero CTA props**. Attempting to pass
`ctaLabel`, `ctaHref`, etc. will silently do nothing.

**Solution:** Render CTA links inside the `#below-text` named slot.

```vue
<HeroStandardApollo :title="..." :text="..." :show-text="true" ...>
  <template #below-text>
    <div class="hero-ctas">
      <a :href="primaryCta.href" class="hero-cta--primary">{{ primaryCta.label }}</a>
      <a :href="secondaryCta.href" class="hero-cta--secondary">{{ secondaryCta.label }}</a>
    </div>
  </template>
</HeroStandardApollo>
```

**Other available slots:** `#above-title`, `#below-title`.

**Gotcha:** `showText` defaults to `false` — set `:show-text="true"` to show subtitles.

See [HeroSection.vue](../../../components/sections/HeroSection.vue) for full implementation.

---

## 3. SectionTestimonialFalcon — single-item, needs carousel wrapper

**Problem:** The DS component renders **one testimonial at a time**. If the
design shows a carousel or multiple quotes, you must implement navigation.

**Pattern:** Maintain `currentIndex` ref, derive `currentItem` via computed,
wire prev/next buttons yourself.

```ts
const currentIndex = ref(0);
const currentItem = computed(() => props.model.items[currentIndex.value]);

function next() {
  currentIndex.value = (currentIndex.value + 1) % props.model.items.length;
}
function prev() {
  currentIndex.value = (currentIndex.value - 1 + props.model.items.length) % props.model.items.length;
}
```

**Prop mapping (content JSON → DS props):**
| JSON field | DS prop |
|-----------|---------|
| `quote` | `text` |
| `name` | `authorText` |
| `role` | `designationText` |
| `image` | `imageSource` + `:display-image="true"` |

**CTA:** Native props — `showCta`, `footerCtaText`, `footerCtaLink`.

See [TestimonialSection.vue](../../../components/sections/TestimonialSection.vue) for full carousel + styling.

---

## 4. OverlapAccordionAtlas — item shape + bespoke wrapper

**Problem:** The DS accordion component does not include a section title or
background variant. You must wrap it in a `<section>` with your own heading.

**Item shape transform:**
```ts
const accordionItems = computed(() =>
  props.model.items.map((item, index) => ({
    accordionId: `faq-${index + 1}`,   // required unique ID
    title: item.title,
    body: item.content,                  // "content" in JSON → "body" in DS
  })),
);
```

**Gotcha:** Always set `defaultAccordionImage` — it's shown when no item is
selected. Use an SVG data-URI fallback if no image is available.

See [FAQSection.vue](../../../components/sections/FAQSection.vue).

---

## 5. SectionApollo — CTA via default slot

**Problem:** `SectionApollo` has no CTA props. CTA buttons go inside the
`#default` slot alongside body text.

```vue
<SectionApollo :title="..." :image="..." image-position="right" ...>
  <template #default>
    <p>{{ body }}</p>
    <a v-if="cta" :href="cta.href" class="section-cta">{{ cta.label }}</a>
  </template>
</SectionApollo>
```

**Image prop:** Use `:image` (not `:image-source`) for the side image.

See [ValueSection.vue](../../../components/sections/ValueSection.vue).

---

## 6. FooterStandard — link shape

**Problem:** Footer links use `{ text, uri, target }` (not `href`).

```ts
const tertiaryItems = computed(() =>
  props.model.secondaryLinks.map((item) => ({
    text: item.text,
    uri: item.href,
    target: "BLNK",    // opens in new tab — DS convention, not "_blank"
  })),
);
```

See [BaseFooter.vue](../../../components/BaseFooter.vue).

---

## 7. CardIcon inside SectionGridAtlas — slot-based rendering

Cards go inside the `#grid-items` named slot (not a prop array):

```vue
<SectionGridAtlas :title="..." :grid-columns="3" ...>
  <template #grid-items>
    <CardIcon v-for="(item, i) in items" :key="i"
      :icon-source="item.iconSource"
      :title="item.title"
      :display-cta="!!item.cta"
      :cta-text="item.cta?.label"
      :cta-link="item.cta?.href"
    >
      <p>{{ item.body }}</p>
    </CardIcon>
  </template>
</SectionGridAtlas>
```

**Variant tip:** Flip `titleVariant` to `"white"` when using dark background
variants (`dark-2`, `dark-3`).

See [CardGridSection.vue](../../../components/sections/CardGridSection.vue).

---

## 8. HeroVideoApollo — native CTA props

Simplest pattern — CTA props are built-in:

```vue
<HeroVideoApollo
  :display-cta="!!cta"
  :cta-text="cta?.label"
  :cta-link="cta?.href"
  cta-variant="secondary"
  display-gradient
  ...
/>
```

See [VideoSection.vue](../../../components/sections/VideoSection.vue).

---

## Universal conventions

- **SVG data-URI fallback:** All image props should default to an inline SVG
  placeholder rather than an empty string or broken URL.
- **Variant casting:** Some DS components type `variant` narrowly. Use `as any`
  when passing dynamic variant strings.
- **Anchor IDs:** Every section wrapper accepts `id` from content JSON and binds
  it to the root element for smooth-scroll anchoring.

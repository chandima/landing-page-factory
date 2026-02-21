<script setup lang="ts">
import landing from "~/content/landing.json";
import HeaderSection from "~/components/sections/HeaderSection.vue";
import HeroSection from "~/components/sections/HeroSection.vue";
import ValueSection from "~/components/sections/ValueSection.vue";
import FAQSection from "~/components/sections/FAQSection.vue";
import TestimonialSection from "~/components/sections/TestimonialSection.vue";
import CardGridSection from "~/components/sections/CardGridSection.vue";
import VideoSection from "~/components/sections/VideoSection.vue";
import FormSection from "~/components/sections/FormSection.vue";
import BaseFooter from "~/components/BaseFooter.vue";
import type { Component } from "vue";
import type { LandingContent } from "~/types/landing";

const content = landing as unknown as LandingContent;

/**
 * Section type registry — maps `type` field in landing.json sections
 * to Vue components. Add new section types here when installing new
 * DS packages or creating new section wrappers.
 */
const sectionRegistry: Record<string, Component> = {
  value: ValueSection,
  faq: FAQSection,
  testimonial: TestimonialSection,
  cardGrid: CardGridSection,
  video: VideoSection,
  form: FormSection,
};

// Dev-mode warning for unknown section types
if (import.meta.dev) {
  for (const section of content.sections) {
    if (!sectionRegistry[section.type]) {
      console.warn(
        `[landing] Unknown section type "${section.type}" — register it in sectionRegistry (pages/index.vue). Available types: ${Object.keys(sectionRegistry).join(", ")}`,
      );
    }
  }
}

// SEO / Open Graph meta from content
const meta = content.meta;
if (meta) {
  useHead({
    title: meta.title || "Landing Page",
    meta: [
      ...(meta.description ? [{ name: "description", content: meta.description }] : []),
      ...(meta.title ? [{ property: "og:title", content: meta.title }] : []),
      ...(meta.description ? [{ property: "og:description", content: meta.description }] : []),
      ...(meta.ogImage ? [{ property: "og:image", content: meta.ogImage }] : []),
      ...(meta.canonicalUrl ? [{ property: "og:url", content: meta.canonicalUrl }] : []),
      { property: "og:type", content: "website" },
      ...(meta.title ? [{ name: "twitter:title", content: meta.title }] : []),
      ...(meta.description ? [{ name: "twitter:description", content: meta.description }] : []),
      ...(meta.ogImage ? [{ name: "twitter:image", content: meta.ogImage }] : []),
      { name: "twitter:card", content: "summary_large_image" },
    ],
    ...(meta.canonicalUrl ? { link: [{ rel: "canonical", href: meta.canonicalUrl }] } : {}),
  });
}

/**
 * Sections that should break out of the max-width container.
 * Driven by `fullWidth: true` in landing.json section entries.
 */
function isFullWidth(section: { fullWidth?: boolean }): boolean {
  return section.fullWidth === true;
}
</script>

<template>
  <main>
    <HeaderSection v-if="content.header" :model="content.header" />
    <HeroSection :model="content.hero" />

    <template v-for="(section, i) in content.sections" :key="section.id || i">
      <component
        :is="sectionRegistry[section.type]"
        v-if="sectionRegistry[section.type]"
        :model="section"
        :class="{ container: !isFullWidth(section) }"
      />
    </template>

    <BaseFooter :model="content.footer" />
  </main>
</template>

<style scoped>
.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 1rem;
}
</style>

<script setup lang="ts">
import { HeroStandardApollo } from "@rds-vue-ui/hero-standard-apollo";

const props = defineProps<{
  model: {
    headline: string;
    subheadline?: string;
    backgroundImage?: string;
    bgImageSource?: string;
    primaryCta?: { label: string; href: string };
    secondaryCta?: { label: string; href: string };
    variant?: string;
    id?: string;
  };
}>();

const fallbackBg =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1600' height='800'%3E%3Crect width='1600' height='800' fill='%23000000'/%3E%3C/svg%3E";
</script>

<template>
  <HeroStandardApollo
    :id="props.model.id"
    :title="props.model.headline"
    :text="props.model.subheadline || ''"
    :show-text="!!props.model.subheadline"
    :bg-image-source="props.model.bgImageSource || props.model.backgroundImage || fallbackBg"
    :title-variant="(props.model.variant as any) || 'white'"
  >
    <template v-if="props.model.primaryCta || props.model.secondaryCta" #below-text>
      <div class="hero-ctas">
        <a
          v-if="props.model.primaryCta"
          :href="props.model.primaryCta.href"
          class="hero-cta hero-cta--primary"
        >
          {{ props.model.primaryCta.label }}
        </a>
        <a
          v-if="props.model.secondaryCta"
          :href="props.model.secondaryCta.href"
          class="hero-cta hero-cta--secondary"
        >
          {{ props.model.secondaryCta.label }}
        </a>
      </div>
    </template>
  </HeroStandardApollo>
</template>

<style scoped>
.hero-ctas {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  flex-wrap: wrap;
}
.hero-cta {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  font-weight: 700;
  text-decoration: none;
  border-radius: 4px;
  font-size: 1rem;
  transition: opacity 0.2s;
}
.hero-cta:hover {
  opacity: 0.85;
}
.hero-cta--primary {
  background-color: var(--rds-secondary);
  color: var(--rds-dark-3);
}
.hero-cta--secondary {
  background-color: transparent;
  color: var(--rds-white);
  border: 2px solid var(--rds-white);
}
</style>

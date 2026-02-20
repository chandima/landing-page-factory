<script setup lang="ts">
import { HeroStandardApollo } from "@rds-vue-ui/hero-standard-apollo";

const props = defineProps<{
  model: {
    headline: string;
    subheadline: string;
    backgroundImage?: string;
    primaryCta: { label: string; href: string };
    secondaryCta?: { label: string; href: string };
  };
}>();

const fallbackBg =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1600' height='800'%3E%3Crect width='1600' height='800' fill='%23000000'/%3E%3C/svg%3E";
</script>

<template>
  <!-- Prefer DS component. Wrap only as needed. -->
  <HeroStandardApollo
    :title="props.model.headline"
    :text="props.model.subheadline"
    :show-text="true"
    :bg-image-source="props.model.backgroundImage || fallbackBg"
  />
</template>

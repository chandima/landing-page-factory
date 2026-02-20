<script setup lang="ts">
import { HeroStandardApollo } from "@rds-vue-ui/hero-standard-apollo";

const props = defineProps<{
  model: {
    headline: string;
    subheadline: string;
    primaryCta: { label: string; href: string };
    secondaryCta?: { label: string; href: string };
  };
}>();
</script>

<template>
  <!-- Prefer DS component. Wrap only as needed. -->
  <HeroStandardApollo
    :headline="props.model.headline"
    :subheadline="props.model.subheadline"
    :primary-cta="props.model.primaryCta"
    :secondary-cta="props.model.secondaryCta"
  />
</template>

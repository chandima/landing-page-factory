<script setup lang="ts">
import { HeroVideoApollo } from "@rds-vue-ui/hero-video-apollo";

defineProps<{
  model: {
    title: string;
    text?: string;
    bgVideoSource: string;
    mobileImageSource: string;
    mobileImageAltText?: string;
    videoAlt?: string;
    variant?: string;
    cta?: { label: string; href: string };
    id?: string;
  };
}>();
</script>

<template>
  <HeroVideoApollo
    :id="model.id"
    :title="model.title"
    :text="model.text || ''"
    :show-text="!!model.text"
    :bg-video-source="model.bgVideoSource"
    :mobile-image-source="model.mobileImageSource"
    :mobile-image-alt-text="model.mobileImageAltText || model.title"
    :video-alt="model.videoAlt || model.title"
    :title-variant="model.variant || 'white'"
    :text-variant="model.variant || 'white'"
    :display-cta="!!model.cta"
    :cta-text="model.cta?.label || ''"
    :cta-link="model.cta?.href || '#'"
    cta-variant="secondary"
    display-gradient
  />
</template>

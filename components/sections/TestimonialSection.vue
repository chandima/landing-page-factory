<script setup lang="ts">
import { SectionTestimonialFalcon } from "@rds-vue-ui/section-testimonial-falcon";

const props = defineProps<{
  model: { title: string; items: Array<{ quote: string; name: string; role?: string }> };
}>();
</script>

<template>
  <SectionTestimonialFalcon :title="props.model.title" :items="props.model.items" />
</template>

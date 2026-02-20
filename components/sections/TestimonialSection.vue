<script setup lang="ts">
import { SectionTestimonialFalcon } from "@rds-vue-ui/section-testimonial-falcon";
import { computed } from "vue";

const props = defineProps<{
  model: { title: string; items: Array<{ quote: string; name: string; role?: string }> };
}>();

const firstItem = computed(() => props.model.items[0] ?? null);
</script>

<template>
  <SectionTestimonialFalcon
    :label="props.model.title"
    :text="firstItem?.quote || ''"
    :author-text="firstItem?.name || ''"
    :designation-text="firstItem?.role || ''"
    :show-cta="false"
  />
</template>

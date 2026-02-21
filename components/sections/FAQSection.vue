<script setup lang="ts">
import { OverlapAccordionAtlas } from "@rds-vue-ui/overlap-accordion-atlas";
import { computed } from "vue";

const props = defineProps<{
  model: {
    title: string;
    items: Array<{ title: string; content: string; image?: string }>;
    image?: string;
    variant?: string;
    id?: string;
  };
}>();

const fallbackImage =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='800'%3E%3Crect width='1200' height='800' fill='%232f2f2f'/%3E%3C/svg%3E";

const accordionItems = computed(() =>
  props.model.items.map((item, index) => ({
    accordionId: `faq-${index + 1}`,
    title: item.title,
    body: item.content,
  })),
);
</script>

<template>
  <section
    :id="props.model.id"
    :aria-label="props.model.title"
    :class="['faq-section', props.model.variant ? `bg-${props.model.variant}` : '']"
  >
    <h2 class="section-title">{{ props.model.title }}</h2>
    <OverlapAccordionAtlas
      :default-accordion-image="props.model.image || fallbackImage"
      :accordion-items="accordionItems"
    />
  </section>
</template>

<style scoped>
.section-title {
  margin: 2rem 0 1rem;
}
</style>

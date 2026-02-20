<script setup lang="ts">
import { OverlapAccordionAtlas } from "@rds-vue-ui/overlap-accordion-atlas";

const props = defineProps<{
  model: { title: string; items: Array<{ title: string; content: string }> };
}>();
</script>

<template>
  <section :aria-label="props.model.title">
    <h2 class="section-title">{{ props.model.title }}</h2>
    <OverlapAccordionAtlas :items="props.model.items" />
  </section>
</template>

<style scoped>
.section-title {
  margin: 2rem 0 1rem;
}
</style>

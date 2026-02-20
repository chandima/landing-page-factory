<script setup lang="ts">
import "@rds-vue-ui/footer-standard"; // registers <footer-standard> custom element
const props = defineProps<{
  model: { secondaryLinks: Array<{ text: string; href: string }> };
}>();
</script>

<template>
  <footer-standard>
    <template #secondary-menu>
      <nav aria-label="Footer links">
        <a
          v-for="(item, idx) in props.model.secondaryLinks"
          :key="idx"
          :href="item.href"
          target="_blank"
          rel="noopener noreferrer"
        >
          {{ item.text }}
        </a>
      </nav>
    </template>
  </footer-standard>
</template>

<style scoped>
nav {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  padding: 1rem 0;
}
</style>

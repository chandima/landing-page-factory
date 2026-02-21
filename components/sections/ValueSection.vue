<script setup lang="ts">
import { SectionApollo } from "@rds-vue-ui/section-apollo";

const props = defineProps<{
  model: {
    title: string;
    body: string;
    imageSource?: string;
    image?: string;
    imagePosition?: "left" | "right";
    variant?: string;
    cta?: { label: string; href: string };
    id?: string;
  };
}>();

const fallbackImage =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='800'%3E%3Crect width='1200' height='800' fill='%23e5e5e5'/%3E%3C/svg%3E";
</script>

<template>
  <SectionApollo
    :id="props.model.id"
    :title="props.model.title"
    :image="props.model.imageSource || props.model.image || fallbackImage"
    :image-position="props.model.imagePosition || 'right'"
    :section-background-variant="(props.model.variant as any) || 'white'"
  >
    <template #default>
      <p>{{ props.model.body }}</p>
      <a
        v-if="props.model.cta"
        :href="props.model.cta.href"
        class="section-cta"
      >
        {{ props.model.cta.label }}
      </a>
    </template>
  </SectionApollo>
</template>

<style scoped>
.section-cta {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.625rem 1.25rem;
  background-color: #8c1d40;
  color: #ffffff;
  font-weight: 700;
  text-decoration: none;
  border-radius: 4px;
  transition: opacity 0.2s;
}
.section-cta:hover {
  opacity: 0.85;
}
</style>

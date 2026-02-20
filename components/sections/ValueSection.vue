<script setup lang="ts">
import { SectionApollo } from "@rds-vue-ui/section-apollo";

const props = defineProps<{
  model: { title: string; body: string; image?: string };
}>();

const fallbackImage =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='800'%3E%3Crect width='1200' height='800' fill='%23e5e5e5'/%3E%3C/svg%3E";
</script>

<template>
  <SectionApollo :title="props.model.title" :image="props.model.image || fallbackImage">
    <template #default>
      <p>{{ props.model.body }}</p>
    </template>
  </SectionApollo>
</template>

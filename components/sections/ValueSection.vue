<script setup lang="ts">
import { SectionApollo } from "@rds-vue-ui/section-apollo";

const props = defineProps<{
  model: { title: string; body: string };
}>();
</script>

<template>
  <SectionApollo :title="props.model.title">
    <template #default>
      <p>{{ props.model.body }}</p>
    </template>
  </SectionApollo>
</template>

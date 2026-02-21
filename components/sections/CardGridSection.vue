<script setup lang="ts">
import { SectionGridAtlas } from "@rds-vue-ui/section-grid-atlas";
import { CardIcon } from "@rds-vue-ui/card-icon";

defineProps<{
  model: {
    title?: string;
    variant?: string;
    gridColumns?: number;
    id?: string;
    items: Array<{
      iconSource: string;
      iconAlt?: string;
      title: string;
      body?: string;
      cta?: { label: string; href: string; target?: string };
    }>;
  };
}>();
</script>

<template>
  <SectionGridAtlas
    :id="model.id"
    :title="model.title || ''"
    :section-background-variant="model.variant || 'white'"
    :title-variant="model.variant === 'dark-3' || model.variant === 'dark-2' ? 'white' : 'dark-3'"
    :grid-columns="model.gridColumns || 3"
    title-alignment="center"
  >
    <template #grid-items>
      <CardIcon
        v-for="(item, i) in model.items"
        :key="i"
        :icon-source="item.iconSource"
        :icon-alt="item.iconAlt || item.title"
        :title="item.title"
        :display-title="true"
        :display-cta="!!item.cta"
        :cta-text="item.cta?.label || ''"
        :cta-link="item.cta?.href || '#'"
        :cta-link-target="(item.cta?.target as '_self' | '_blank') || '_self'"
        :cta-as-button="true"
        cta-button-variant="primary"
        icon-align="center"
        title-align="center"
      >
        <p v-if="item.body" style="text-align: center;">{{ item.body }}</p>
      </CardIcon>
    </template>
  </SectionGridAtlas>
</template>

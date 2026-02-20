<script setup lang="ts">
import { FooterStandard } from "@rds-vue-ui/footer-standard";
import { computed } from "vue";

const props = defineProps<{
  model: { secondaryLinks: Array<{ text: string; href: string }> };
}>();

const tertiaryItems = computed(() =>
  props.model.secondaryLinks.map((item) => ({
    text: item.text,
    uri: item.href,
    target: "BLNK",
  })),
);
</script>

<template>
  <FooterStandard :tertiary-items="tertiaryItems" />
</template>

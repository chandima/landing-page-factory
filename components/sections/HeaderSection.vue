<script setup lang="ts">
import { HeaderStandard } from "@rds-vue-ui/header-standard";
import { computed } from "vue";

const props = defineProps<{
  model: {
    homeTitle?: string;
    logoLinkUrl?: string;
    isSticky?: boolean;
    navItems?: Array<{
      text: string;
      href: string;
      target?: string;
      children?: Array<{ text: string; href: string; target?: string }>;
    }>;
    displayRfiCta?: boolean;
    rfiCtaText?: string;
    rfiAnchorId?: string;
    displayApplyNow?: boolean;
    applyNowText?: string;
    applyNowRedirectUrl?: string;
    id?: string;
  };
}>();

/**
 * Transform simple { text, href } nav items from landing.json
 * into the NavItem shape the DS component expects:
 * { isActive, htmlLink: { text, uri, target }, children? }
 */
const dsNavItems = computed(() =>
  (props.model.navItems || []).map((item) => ({
    isActive: false,
    htmlLink: {
      text: item.text,
      uri: item.href,
      target: item.target || "_self",
    },
    children: (item.children || []).map((child) => ({
      hasBorderTop: false,
      htmlLink: {
        text: child.text,
        uri: child.href,
        target: child.target || "_self",
      },
    })),
  })),
);
</script>

<template>
  <HeaderStandard
    :id="model.id"
    :home-title="model.homeTitle || ''"
    :logo-link-url="model.logoLinkUrl || '/'"
    :is-sticky="model.isSticky ?? true"
    :nav-items="dsNavItems"
    :display-rfi-cta="model.displayRfiCta ?? false"
    :rfi-cta-text="model.rfiCtaText || 'Request info'"
    :rfi-anchor-id="model.rfiAnchorId || '#'"
    :display-apply-now="model.displayApplyNow ?? false"
    :apply-now-text="model.applyNowText || 'Apply now'"
    :apply-now-redirect-url="model.applyNowRedirectUrl || '#'"
  />
</template>

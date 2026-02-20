<script setup lang="ts">
import landing from "~/content/landing.json";
import HeroSection from "~/components/sections/HeroSection.vue";
import ValueSection from "~/components/sections/ValueSection.vue";
import FAQSection from "~/components/sections/FAQSection.vue";
import TestimonialSection from "~/components/sections/TestimonialSection.vue";
import BaseFooter from "~/components/BaseFooter.vue";
</script>

<template>
  <main>
    <HeroSection :model="landing.hero" />

    <div class="container">
      <ValueSection v-for="(s, i) in landing.sections" :key="i" :model="s" />
      <FAQSection :model="landing.faq" />
      <TestimonialSection :model="landing.testimonial" />
    </div>

    <BaseFooter :model="landing.footer" />
  </main>
</template>

<style scoped>
.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 1rem;
}
</style>

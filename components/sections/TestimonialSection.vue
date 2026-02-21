<script setup lang="ts">
import { SectionTestimonialFalcon } from "@rds-vue-ui/section-testimonial-falcon";
import { ref, computed } from "vue";

const props = defineProps<{
  model: {
    title: string;
    items: Array<{ quote: string; name: string; role?: string; image?: string }>;
    cta?: { label: string; href: string };
    variant?: string;
    id?: string;
  };
}>();

const currentIndex = ref(0);

const currentItem = computed(() => props.model.items[currentIndex.value] ?? null);
const hasMultiple = computed(() => props.model.items.length > 1);

function next() {
  currentIndex.value = (currentIndex.value + 1) % props.model.items.length;
}

function prev() {
  currentIndex.value = (currentIndex.value - 1 + props.model.items.length) % props.model.items.length;
}
</script>

<template>
  <div :id="props.model.id" class="testimonial-wrapper">
    <SectionTestimonialFalcon
      :label="props.model.title"
      :text="currentItem?.quote || ''"
      :author-text="currentItem?.name || ''"
      :designation-text="currentItem?.role || ''"
      :image-source="currentItem?.image || ''"
      :display-image="!!currentItem?.image"
      :show-cta="!!props.model.cta"
      :footer-cta-text="props.model.cta?.label || ''"
      :footer-cta-link="props.model.cta?.href || ''"
      :label-background-variant="(props.model.variant as any) || undefined"
    />
    <div v-if="hasMultiple" class="testimonial-nav">
      <button class="testimonial-nav__btn" aria-label="Previous testimonial" @click="prev">&larr;</button>
      <span class="testimonial-nav__indicator">{{ currentIndex + 1 }} / {{ props.model.items.length }}</span>
      <button class="testimonial-nav__btn" aria-label="Next testimonial" @click="next">&rarr;</button>
    </div>
  </div>
</template>

<style scoped>
.testimonial-wrapper {
  position: relative;
}
.testimonial-nav {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0;
}
.testimonial-nav__btn {
  background: none;
  border: 2px solid #8c1d40;
  color: #8c1d40;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.125rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s, color 0.2s;
}
.testimonial-nav__btn:hover {
  background-color: #8c1d40;
  color: #ffffff;
}
.testimonial-nav__indicator {
  font-size: 0.875rem;
  color: #484848;
}
</style>

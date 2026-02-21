<script setup lang="ts">
/**
 * FormSection — bespoke lead-capture form with DS styling.
 * No full form component exists in the RDS Vue UI design system,
 * so this uses RDS tokens + custom markup for DS-consistent styling.
 */

import { ref } from "vue";

const props = defineProps<{
  model: {
    title?: string;
    subtitle?: string;
    variant?: string;
    id?: string;
    fields: Array<{
      name: string;
      label: string;
      type?: string;
      placeholder?: string;
      required?: boolean;
      options?: Array<{ label: string; value: string }>;
    }>;
    submitLabel?: string;
    submitHref?: string;
  };
}>();

const emit = defineEmits<{
  (e: "submit", payload: Record<string, string>): void;
}>();

const formData = ref<Record<string, string>>({});

function handleSubmit() {
  emit("submit", { ...formData.value });
  // If submitHref provided, redirect after emitting
  if (props.model.submitHref) {
    window.location.href = props.model.submitHref;
  }
}

const isDark = (v?: string) =>
  v === "dark-1" || v === "dark-2" || v === "dark-3" || v === "primary";
</script>

<template>
  <section
    :id="model.id"
    class="form-section"
    :class="[model.variant ? `bg-${model.variant}` : '']"
  >
    <div class="form-section__inner">
      <h2
        v-if="model.title"
        class="form-section__title"
        :class="{ 'form-section__title--light': isDark(model.variant) }"
      >
        {{ model.title }}
      </h2>
      <p
        v-if="model.subtitle"
        class="form-section__subtitle"
        :class="{ 'form-section__subtitle--light': isDark(model.variant) }"
      >
        {{ model.subtitle }}
      </p>

      <form class="form-section__form" @submit.prevent="handleSubmit">
        <div
          v-for="field in model.fields"
          :key="field.name"
          class="form-section__field"
        >
          <label :for="`form-${field.name}`" class="form-section__label">
            {{ field.label }}
            <span v-if="field.required" class="form-section__required">*</span>
          </label>

          <!-- Select -->
          <select
            v-if="field.type === 'select'"
            :id="`form-${field.name}`"
            v-model="formData[field.name]"
            class="form-section__input"
            :required="field.required"
          >
            <option value="" disabled selected>
              {{ field.placeholder || "Select…" }}
            </option>
            <option
              v-for="opt in field.options"
              :key="opt.value"
              :value="opt.value"
            >
              {{ opt.label }}
            </option>
          </select>

          <!-- Textarea -->
          <textarea
            v-else-if="field.type === 'textarea'"
            :id="`form-${field.name}`"
            v-model="formData[field.name]"
            class="form-section__input form-section__textarea"
            :placeholder="field.placeholder"
            :required="field.required"
            rows="4"
          />

          <!-- Text / email / tel / etc. -->
          <input
            v-else
            :id="`form-${field.name}`"
            v-model="formData[field.name]"
            :type="field.type || 'text'"
            class="form-section__input"
            :placeholder="field.placeholder"
            :required="field.required"
          >
        </div>

        <button type="submit" class="form-section__submit">
          {{ model.submitLabel || "Submit" }}
        </button>
      </form>
    </div>
  </section>
</template>

<style scoped>
.form-section {
  padding: 3rem 1rem;
}
.form-section__inner {
  max-width: 600px;
  margin: 0 auto;
}
.form-section__title {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #191919;
}
.form-section__title--light {
  color: #ffffff;
}
.form-section__subtitle {
  font-size: 1rem;
  color: #484848;
  margin-bottom: 1.5rem;
}
.form-section__subtitle--light {
  color: #e8e8e8;
}
.form-section__form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
.form-section__field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.form-section__label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #191919;
}
.form-section__required {
  color: #8c1d40;
}
.form-section__input {
  padding: 0.625rem 0.75rem;
  border: 1px solid #bfbfbf;
  border-radius: 4px;
  font-size: 1rem;
  font-family: inherit;
  transition: border-color 0.2s;
}
.form-section__input:focus {
  outline: none;
  border-color: #8c1d40;
  box-shadow: 0 0 0 2px rgba(140, 29, 64, 0.15);
}
.form-section__textarea {
  resize: vertical;
}
.form-section__submit {
  padding: 0.75rem 2rem;
  background-color: #8c1d40;
  color: #ffffff;
  font-weight: 700;
  font-size: 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: opacity 0.2s;
  align-self: flex-start;
}
.form-section__submit:hover {
  opacity: 0.85;
}

/* Variant backgrounds using RDS tokens */
.bg-primary { background-color: #8c1d40; }
.bg-secondary { background-color: #ffc627; }
.bg-dark-1 { background-color: #484848; }
.bg-dark-2 { background-color: #2a2a2a; }
.bg-dark-3 { background-color: #191919; }
.bg-white { background-color: #ffffff; }
.bg-light-1 { background-color: #fafafa; }
.bg-light-2 { background-color: #e8e8e8; }
.bg-light-3 { background-color: #d0d0d0; }
.bg-light-4 { background-color: #bfbfbf; }
</style>

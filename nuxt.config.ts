import { defineNuxtConfig } from "nuxt/config";

export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ["@nuxt/eslint"],
  build: {
    transpile: [/^@rds-vue-ui\//],
  },
  css: [
    // RDS theme package should register global tokens/styles
    "@rds-vue-ui/rds-theme-base/dist/css/rds-theme-base.css",
    "~/assets/styles/app.css",
  ],
  app: {
    head: {
      title: "Landing Page",
      meta: [{ name: "viewport", content: "width=device-width, initial-scale=1" }],
    },
  },
});

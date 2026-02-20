/**
 * Build deterministic page composition from content/figma-map.json and DS catalog.
 *
 * Outputs:
 * - pages/index.vue (generated section composition)
 * - content/build-report.json (component availability + exceptions)
 */
import fs from "node:fs";
import path from "node:path";

const MAP = path.resolve("content/figma-map.json");
const CATALOG = path.resolve("content/rds-catalog.json");
const OUT_PAGE = path.resolve("pages/index.vue");
const OUT_REPORT = path.resolve("content/build-report.json");

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf-8"));
}

function packageInstalled(catalog, packageName) {
  return Boolean(catalog.packages?.some((pkg) => pkg.name === packageName));
}

function parsePreferred(componentRef) {
  const [pkg, component = ""] = String(componentRef).split(":");
  return { pkg, component };
}

function pickSectionIds(map) {
  const ids = new Set((map.sections ?? []).map((section) => String(section.id).toLowerCase()));
  return {
    hero: ids.has("hero"),
    value: ids.has("value") || ids.has("values") || ids.has("section"),
    faq: ids.has("faq"),
    testimonial: ids.has("testimonial") || ids.has("testimonials"),
    footer: ids.has("footer"),
  };
}

if (!fs.existsSync(MAP)) {
  console.error("Missing content/figma-map.json. Run `yarn figma:map` first.");
  process.exit(1);
}
if (!fs.existsSync(CATALOG)) {
  console.error("Missing content/rds-catalog.json. Run `yarn ds:catalog` first.");
  process.exit(1);
}

const map = readJson(MAP);
const catalog = readJson(CATALOG);
const sectionFlags = pickSectionIds(map);

const componentChecks = (map.sections ?? []).map((section) => {
  const preferred = (section.preferredComponents ?? []).map(parsePreferred);
  const missing = preferred.filter((entry) => !packageInstalled(catalog, entry.pkg));
  return {
    sectionId: section.id,
    preferredComponents: preferred.map((entry) => `${entry.pkg}:${entry.component}`),
    available: missing.length === 0,
    missingPackages: missing.map((entry) => entry.pkg),
  };
});

const pageLines = [
  "<script setup lang=\"ts\">",
  "import landing from \"~/content/landing.json\";",
];
if (sectionFlags.hero) pageLines.push("import HeroSection from \"~/components/sections/HeroSection.vue\";");
if (sectionFlags.value) pageLines.push("import ValueSection from \"~/components/sections/ValueSection.vue\";");
if (sectionFlags.faq) pageLines.push("import FAQSection from \"~/components/sections/FAQSection.vue\";");
if (sectionFlags.testimonial) pageLines.push("import TestimonialSection from \"~/components/sections/TestimonialSection.vue\";");
if (sectionFlags.footer) pageLines.push("import BaseFooter from \"~/components/BaseFooter.vue\";");
pageLines.push("</script>", "", "<template>", "  <main>");

if (sectionFlags.hero) pageLines.push("    <HeroSection :model=\"landing.hero\" />", "");

pageLines.push("    <div class=\"container\">");
if (sectionFlags.value) {
  pageLines.push("      <ValueSection v-for=\"(s, i) in landing.sections\" :key=\"i\" :model=\"s\" />");
}
if (sectionFlags.faq) pageLines.push("      <FAQSection :model=\"landing.faq\" />");
if (sectionFlags.testimonial) pageLines.push("      <TestimonialSection :model=\"landing.testimonial\" />");
pageLines.push("    </div>", "");

if (sectionFlags.footer) pageLines.push("    <BaseFooter :model=\"landing.footer\" />", "");

pageLines.push("  </main>", "</template>", "", "<style scoped>", ".container {", "  max-width: 1100px;", "  margin: 0 auto;", "  padding: 0 1rem;", "}", "</style>", "");

fs.mkdirSync(path.dirname(OUT_PAGE), { recursive: true });
fs.writeFileSync(OUT_PAGE, pageLines.join("\n"));

const report = {
  generatedAt: new Date().toISOString(),
  sectionFlags,
  componentChecks,
  mapExceptions: map.exceptions ?? [],
  unresolvedSections: componentChecks.filter((c) => !c.available).map((c) => c.sectionId),
};
fs.mkdirSync(path.dirname(OUT_REPORT), { recursive: true });
fs.writeFileSync(OUT_REPORT, `${JSON.stringify(report, null, 2)}\n`);

const unresolvedCount = report.unresolvedSections.length;
if (unresolvedCount > 0) {
  console.warn(`⚠️ Generated ${OUT_PAGE} with ${unresolvedCount} unresolved section(s). See ${OUT_REPORT}.`);
  process.exitCode = 1;
} else {
  console.log(`✅ Generated ${OUT_PAGE} and ${OUT_REPORT}`);
}

/**
 * Build a deterministic Figma -> RDS section map.
 *
 * Inputs:
 * - content/rds-catalog.json (required)
 * - content/landing.json (required)
 * - Optional raw Figma JSON (from MCP/API export) via --input=<path>
 *
 * CLI:
 *   node scripts/figma-map.normalize.mjs \
 *     --url="https://www.figma.com/design/..." \
 *     --node="354:6396" \
 *     --input="content/figma.raw.json"
 */
import fs from "node:fs";
import path from "node:path";

const OUT = path.resolve("content/figma-map.json");
const CATALOG = path.resolve("content/rds-catalog.json");
const LANDING = path.resolve("content/landing.json");

function parseArgs(argv) {
  const opts = {};
  for (const part of argv) {
    if (!part.startsWith("--")) continue;
    const [k, ...v] = part.slice(2).split("=");
    opts[k] = v.join("=");
  }
  return opts;
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf-8"));
}

function componentInstalled(catalog, pkgName) {
  return Boolean(catalog.packages?.some((p) => p.name === pkgName));
}

function collectNodeNames(node, acc) {
  if (!node || typeof node !== "object") return;
  if (typeof node.name === "string" && node.name.trim()) acc.push(node.name.trim());
  if (Array.isArray(node.children)) {
    for (const child of node.children) collectNodeNames(child, acc);
  }
}

function extractFigmaNames(rawFigma) {
  if (!rawFigma || typeof rawFigma !== "object") return [];
  const names = [];
  if (rawFigma.document) collectNodeNames(rawFigma.document, names);
  if (rawFigma.nodes && typeof rawFigma.nodes === "object") {
    for (const item of Object.values(rawFigma.nodes)) {
      const doc = item?.document ?? item;
      collectNodeNames(doc, names);
    }
  }
  return Array.from(new Set(names));
}

function findCandidateNodes(nodeNames, ...tokens) {
  if (!nodeNames.length) return [];
  const lowered = tokens.map((t) => t.toLowerCase());
  return nodeNames.filter((name) =>
    lowered.some((token) => name.toLowerCase().includes(token)),
  );
}

if (!fs.existsSync(CATALOG)) {
  console.error("Missing content/rds-catalog.json. Run `yarn ds:catalog` first.");
  process.exit(1);
}
if (!fs.existsSync(LANDING)) {
  console.error("Missing content/landing.json.");
  process.exit(1);
}

const args = parseArgs(process.argv.slice(2));
const catalog = readJson(CATALOG);
const landing = readJson(LANDING);
const rawInputPath = args.input ? path.resolve(args.input) : null;
const rawFigma = rawInputPath && fs.existsSync(rawInputPath) ? readJson(rawInputPath) : null;
const nodeNames = extractFigmaNames(rawFigma);

const mappings = [
  {
    id: "hero",
    packageName: "@rds-vue-ui/hero-standard-apollo",
    component: "HeroStandardApollo",
    tokens: ["hero", "masthead", "banner"],
    requiredByContent: Boolean(landing.hero),
    notes: "Map headline/subheadline/cta props from content/landing.json.",
  },
  {
    id: "value",
    packageName: "@rds-vue-ui/section-apollo",
    component: "SectionApollo",
    tokens: ["value", "benefit", "why", "section"],
    requiredByContent: Array.isArray(landing.sections) && landing.sections.length > 0,
    notes: "Use one section per landing.sections entry.",
  },
  {
    id: "faq",
    packageName: "@rds-vue-ui/overlap-accordion-atlas",
    component: "OverlapAccordionAtlas",
    tokens: ["faq", "question", "accordion"],
    requiredByContent: Boolean(landing.faq),
  },
  {
    id: "testimonial",
    packageName: "@rds-vue-ui/section-testimonial-falcon",
    component: "SectionTestimonialFalcon",
    tokens: ["testimonial", "quote", "student story"],
    requiredByContent: Boolean(landing.testimonial),
  },
  {
    id: "footer",
    packageName: "@rds-vue-ui/footer-standard",
    component: "footer-standard",
    tokens: ["footer"],
    requiredByContent: Boolean(landing.footer),
  },
];

const sections = [];
const exceptions = [];

for (const mapping of mappings) {
  if (!mapping.requiredByContent) continue;
  const installed = componentInstalled(catalog, mapping.packageName);
  const figmaNodes = findCandidateNodes(nodeNames, ...mapping.tokens);
  const confidence = installed ? (figmaNodes.length ? 0.95 : 0.85) : 0.2;
  sections.push({
    id: mapping.id,
    figmaNodes,
    preferredComponents: [`${mapping.packageName}:${mapping.component}`],
    confidence,
    notes: mapping.notes,
  });
  if (!installed) {
    exceptions.push({
      sectionId: mapping.id,
      reason: `Missing DS package: ${mapping.packageName}`,
      fallback: "Use closest installed DS component wrapper before bespoke markup.",
    });
  }
}

const figmaMap = {
  generatedAt: new Date().toISOString(),
  figma: {
    fileUrl: args.url ?? process.env.FIGMA_FILE_URL ?? null,
    frameNodeId: args.node ?? process.env.FIGMA_FRAME_NODE_ID ?? null,
    rawInput: rawInputPath ? path.relative(process.cwd(), rawInputPath) : null,
  },
  sections,
  exceptions,
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, `${JSON.stringify(figmaMap, null, 2)}\n`);
console.log(`✅ Wrote ${OUT} (${sections.length} sections, ${exceptions.length} exceptions)`);

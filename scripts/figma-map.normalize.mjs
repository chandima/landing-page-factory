/**
 * Placeholder: Normalize a Figma frame into a section plan + DS substitution map.
 * Intended to be driven by a client using the Figma MCP server.
 *
 * Output: content/figma-map.json
 */
import fs from "node:fs";
import path from "node:path";

const OUT = path.resolve("content/figma-map.json");

// Minimal starter structure the agent should replace with real mappings.
const figmaMap = {
  generatedAt: new Date().toISOString(),
  figma: {
    fileUrl: "REPLACE_WITH_FIGMA_URL",
    frameNodeId: "REPLACE_WITH_NODE_ID"
  },
  sections: [
    {
      id: "hero",
      figmaNodes: ["REPLACE_ME"],
      preferredComponents: ["@rds-vue-ui/hero-standard-apollo:HeroStandardApollo"],
      confidence: 0.8,
      notes: "Hero frame maps to DS hero component; adjust props from Figma text/links."
    },
    {
      id: "faq",
      figmaNodes: ["REPLACE_ME"],
      preferredComponents: ["@rds-vue-ui/overlap-accordion-atlas:OverlapAccordionAtlas"],
      confidence: 0.7
    }
  ],
  exceptions: []
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(figmaMap, null, 2));
console.log(`✅ Wrote ${OUT}`);

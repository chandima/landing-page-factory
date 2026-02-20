/**
 * Builds a lightweight catalog of installed @rds-vue-ui/* packages.
 * This keeps the landing repo lightweight (registry consumption) while giving agents a deterministic menu.
 */
import fs from "node:fs";
import path from "node:path";

const OUT = path.resolve("content/rds-catalog.json");
const NODE_MODULES = path.resolve("node_modules", "@rds-vue-ui");

function safeReadJson(p) {
  try { return JSON.parse(fs.readFileSync(p, "utf-8")); } catch { return null; }
}

function listPackages(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((name) => !name.startsWith("."));
}

const pkgs = [];
for (const name of listPackages(NODE_MODULES)) {
  const pkgJsonPath = path.join(NODE_MODULES, name, "package.json");
  const pkg = safeReadJson(pkgJsonPath);
  if (!pkg) continue;
  pkgs.push({
    name: pkg.name,
    version: pkg.version,
    description: pkg.description ?? "",
    main: pkg.main ?? "",
    module: pkg.module ?? "",
    exports: pkg.exports ?? null,
    peerDependencies: pkg.peerDependencies ?? {},
  });
}

const catalog = {
  generatedAt: new Date().toISOString(),
  source: "node_modules/@rds-vue-ui",
  packages: pkgs.sort((a,b)=>a.name.localeCompare(b.name)),
  substitutionGuidelines: [
    "Prefer @rds-vue-ui components over bespoke markup when a reasonable match exists.",
    "Wrap DS components to meet layout needs before writing new CSS-heavy bespoke implementations."
  ]
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(catalog, null, 2));
console.log(`✅ Wrote ${OUT} with ${pkgs.length} packages`);

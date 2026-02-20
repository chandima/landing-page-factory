/**
 * Build a deterministic Figma -> RDS section map.
 *
 * Inputs:
 * - content/rds-catalog.json (required)
 * - content/landing.json (required)
 * - Optional raw Figma JSON via --input=<path>
 * - Optional Figma URL+node
 *   - Desktop MCP flow (no PAT): reads from local MCP endpoint
 *   - REST API fallback (requires FIGMA_ACCESS_TOKEN)
 *
 * CLI:
 *   node scripts/figma-map.normalize.mjs \
 *     --url="https://www.figma.com/design/..." \
 *     --node="354:6396"
 */
import fs from "node:fs";
import path from "node:path";

const OUT_MAP = path.resolve("content/figma-map.json");
const OUT_RAW = path.resolve("content/figma.raw.json");
const CATALOG = path.resolve("content/rds-catalog.json");
const LANDING = path.resolve("content/landing.json");

function parseArgs(argv) {
  const opts = {};
  for (const part of argv) {
    if (!part.startsWith("--")) continue;
    const [k, ...v] = part.slice(2).split("=");
    opts[k] = v.length ? v.join("=") : "true";
  }
  return opts;
}

function asBool(value, fallback) {
  if (value == null) return fallback;
  const raw = String(value).trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(raw)) return true;
  if (["0", "false", "no", "off"].includes(raw)) return false;
  return fallback;
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf-8"));
}

function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
}

function componentInstalled(catalog, pkgName) {
  return Boolean(catalog.packages?.some((p) => p.name === pkgName));
}

function normalizeNodeId(id) {
  if (!id) return null;
  const decoded = decodeURIComponent(String(id)).trim();
  if (!decoded) return null;
  if (decoded.includes(":")) return decoded;
  if (decoded.includes("-")) return decoded.replaceAll("-", ":");
  return decoded;
}

function parseFigmaUrl(url) {
  if (!url) return { fileKey: null, nodeIdFromUrl: null };
  const value = String(url);
  const keyMatch = value.match(/figma\.com\/(?:design|file|proto)\/([a-zA-Z0-9]+)/i);
  let nodeIdFromUrl = null;
  try {
    const parsed = new URL(value);
    const param = parsed.searchParams.get("node-id");
    nodeIdFromUrl = normalizeNodeId(param);
  } catch {
    nodeIdFromUrl = null;
  }
  return { fileKey: keyMatch?.[1] ?? null, nodeIdFromUrl };
}

async function fetchJson(url, token) {
  const headers = { Accept: "application/json" };
  if (token) headers["X-Figma-Token"] = token;
  const response = await fetch(url, { headers });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`HTTP ${response.status} ${response.statusText} at ${url}\n${body.slice(0, 300)}`);
  }
  return response.json();
}

async function fetchFigmaNode({ fileKey, frameNodeId, token }) {
  const endpoint =
    `https://api.figma.com/v1/files/${fileKey}/nodes?ids=${encodeURIComponent(frameNodeId)}&depth=7`;
  return fetchJson(endpoint, token);
}

async function fetchFigmaImages({ fileKey, nodeIds, token }) {
  if (!nodeIds.length) return {};
  const endpoint =
    `https://api.figma.com/v1/images/${fileKey}?ids=${encodeURIComponent(nodeIds.join(","))}` +
    "&format=png&scale=2&use_absolute_bounds=true";
  const payload = await fetchJson(endpoint, token);
  return payload?.images ?? {};
}

function parseToolText(result) {
  const chunks = [];
  const content = Array.isArray(result?.content) ? result.content : [];
  for (const item of content) {
    if (item?.type === "text" && typeof item.text === "string") chunks.push(item.text);
    else if (item?.type === "json" && item.json != null) chunks.push(JSON.stringify(item.json));
  }
  if (result?.structuredContent != null) {
    chunks.push(JSON.stringify(result.structuredContent));
  }
  return chunks.join("\n").trim();
}

function parseXmlAttributes(raw = "") {
  const attrs = {};
  const regex = /([A-Za-z0-9_:-]+)\s*=\s*("([^"]*)"|'([^']*)')/g;
  for (const match of raw.matchAll(regex)) {
    attrs[match[1]] = match[3] ?? match[4] ?? "";
  }
  return attrs;
}

function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function parseMetadataXml(xmlText) {
  if (!xmlText) return [];
  const nodes = [];
  const tagRegex = /<([A-Za-z0-9_-]+)\b([^>]*?)\/?>/g;
  let index = 0;
  for (const match of xmlText.matchAll(tagRegex)) {
    const tag = match[1] ?? "";
    if (!tag || tag.startsWith("/")) continue;
    const attrs = parseXmlAttributes(match[2] ?? "");
    const id = attrs.id ?? attrs["node-id"] ?? attrs.nodeId ?? "";
    if (!id) continue;
    nodes.push({
      id,
      name: attrs.name ?? attrs.label ?? attrs["node-name"] ?? `${tag}-${id}`,
      type: attrs.type ?? tag.toUpperCase(),
      x: toNumber(attrs.x ?? attrs.left, 0),
      y: toNumber(attrs.y ?? attrs.top, index * 120),
      width: toNumber(attrs.width, 0),
      height: toNumber(attrs.height, 0),
    });
    index += 1;
  }
  return nodes.sort((a, b) => a.y - b.y);
}

function isLikelyHumanText(line) {
  const value = cleanText(line);
  if (!value || value.length < 3 || value.length > 240) return false;
  if (/^[.#@/{[\]();:_-]+$/.test(value)) return false;
  if (/(?:^|[ \t])(px|rem|rgba?|hsla?|var\(|class(Name)?=|display:|position:|return\s|const\s|import\s)/i.test(value)) return false;
  if (/^(https?:\/\/|data:image\/)/i.test(value)) return false;
  return /[A-Za-z]/.test(value);
}

function extractHumanTextFromContext(rawText) {
  if (!rawText) return [];
  const fromQuotes = [];
  for (const match of rawText.matchAll(/"([^"\n]{3,240})"/g)) {
    fromQuotes.push(match[1]);
  }
  const fromTags = [];
  for (const match of rawText.matchAll(/>([^<\n]{3,240})</g)) {
    fromTags.push(match[1]);
  }
  const merged = dedupeText([...fromQuotes, ...fromTags]);
  return merged.filter(isLikelyHumanText).slice(0, 30);
}

function pickTool(tools, ...names) {
  const all = Array.isArray(tools) ? tools : [];
  for (const name of names) {
    const found = all.find((tool) => tool?.name === name);
    if (found) return found;
  }
  return null;
}

function buildToolArgsFromSchema(inputSchema, candidates) {
  const schema = inputSchema && typeof inputSchema === "object" ? inputSchema : {};
  const properties = schema.properties && typeof schema.properties === "object" ? schema.properties : {};
  const required = Array.isArray(schema.required) ? schema.required : [];
  const args = {};

  const tryAssign = (propName, value) => {
    if (value == null || value === "") return;
    if (!(propName in properties)) return;
    args[propName] = value;
  };

  for (const propName of Object.keys(properties)) {
    const low = propName.toLowerCase();
    if (candidates.nodeId && /(node|layer).*(id)|id$/.test(low)) tryAssign(propName, candidates.nodeId);
    else if (candidates.url && /(url|link|frame)/.test(low)) tryAssign(propName, candidates.url);
  }

  if (required.length) {
    for (const req of required) {
      if (req in args) continue;
      const low = String(req).toLowerCase();
      if (candidates.nodeId && /(node|layer).*(id)|id$/.test(low)) args[req] = candidates.nodeId;
      else if (candidates.url && /(url|link|frame)/.test(low)) args[req] = candidates.url;
    }
  }

  if (required.length && required.some((req) => !(req in args))) {
    return { args: null, missingRequired: required.filter((req) => !(req in args)) };
  }

  return { args, missingRequired: [] };
}

async function mcpHttpCall({ endpoint, sessionId, payload }) {
  const headers = {
    Accept: "application/json, text/event-stream",
    "Content-Type": "application/json",
  };
  if (sessionId) headers["mcp-session-id"] = sessionId;
  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  const responseText = await response.text();
  if (!response.ok) {
    throw new Error(`MCP HTTP ${response.status} ${response.statusText}: ${responseText.slice(0, 400)}`);
  }
  const parsed = responseText ? JSON.parse(responseText) : {};
  return {
    headers: response.headers,
    body: parsed,
  };
}

async function fetchFromDesktopMcp({ endpoint, figmaUrl, frameNodeId, fetchWarnings }) {
  let sessionId = null;
  const init = await mcpHttpCall({
    endpoint,
    payload: {
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2024-11-05",
        capabilities: {},
        clientInfo: { name: "landing-page-factory", version: "0.1.0" },
      },
    },
  });
  sessionId = init.headers.get("mcp-session-id") || init.headers.get("Mcp-Session-Id") || null;

  await mcpHttpCall({
    endpoint,
    sessionId,
    payload: {
      jsonrpc: "2.0",
      method: "notifications/initialized",
      params: {},
    },
  });

  const toolListResponse = await mcpHttpCall({
    endpoint,
    sessionId,
    payload: {
      jsonrpc: "2.0",
      id: 2,
      method: "tools/list",
      params: {},
    },
  });

  const tools = toolListResponse.body?.result?.tools ?? [];
  const metadataTool = pickTool(tools, "get_metadata");
  const designContextTool = pickTool(tools, "get_design_context");
  if (!metadataTool) {
    throw new Error("Desktop MCP connected, but `get_metadata` tool is unavailable.");
  }

  const metaArgBuild = buildToolArgsFromSchema(metadataTool.inputSchema, {
    url: figmaUrl,
    nodeId: frameNodeId,
  });
  if (metaArgBuild.missingRequired.length) {
    throw new Error(`Cannot call get_metadata; missing required args: ${metaArgBuild.missingRequired.join(", ")}`);
  }
  const metadataResult = await mcpHttpCall({
    endpoint,
    sessionId,
    payload: {
      jsonrpc: "2.0",
      id: 3,
      method: "tools/call",
      params: {
        name: "get_metadata",
        arguments: metaArgBuild.args ?? {},
      },
    },
  });
  const metadataText = parseToolText(metadataResult.body?.result);
  const metadataNodes = parseMetadataXml(metadataText);

  const textHintsByNode = {};
  if (designContextTool && metadataNodes.length) {
    for (const node of metadataNodes.slice(0, 16)) {
      const dcArgBuild = buildToolArgsFromSchema(designContextTool.inputSchema, {
        url: figmaUrl,
        nodeId: node.id,
      });
      if (dcArgBuild.missingRequired.length) continue;
      try {
        const dcResult = await mcpHttpCall({
          endpoint,
          sessionId,
          payload: {
            jsonrpc: "2.0",
            id: Math.floor(Math.random() * 1_000_000),
            method: "tools/call",
            params: {
              name: "get_design_context",
              arguments: dcArgBuild.args ?? {},
            },
          },
        });
        const dcText = parseToolText(dcResult.body?.result);
        const extracted = extractHumanTextFromContext(dcText);
        if (extracted.length) textHintsByNode[node.id] = extracted;
      } catch (error) {
        fetchWarnings.push(`get_design_context failed for ${node.id}: ${String(error?.message ?? error)}`);
      }
    }
  }

  const pseudoChildren = metadataNodes.map((node, idx) => ({
    id: node.id,
    name: node.name,
    type: node.type || "FRAME",
    absoluteBoundingBox: {
      x: node.x || 0,
      y: Number.isFinite(node.y) ? node.y : idx * 120,
      width: node.width || 0,
      height: node.height || 0,
    },
    children: (textHintsByNode[node.id] ?? []).map((text, tIdx) => ({
      id: `${node.id}-text-${tIdx + 1}`,
      name: "text",
      type: "TEXT",
      characters: text,
      style: { fontSize: tIdx === 0 ? 42 : 20 },
      absoluteBoundingBox: {
        x: node.x || 0,
        y: (node.y || 0) + tIdx * 24,
        width: node.width || 0,
        height: 24,
      },
    })),
  }));

  const pseudoRaw = {
    document: {
      id: frameNodeId || "mcp-root",
      name: "MCP Desktop Selection",
      type: "FRAME",
      absoluteBoundingBox: { x: 0, y: 0, width: 0, height: 0 },
      children: pseudoChildren,
    },
  };

  return {
    raw: pseudoRaw,
    nodes: metadataNodes,
    textHintsByNode,
    tools: tools.map((tool) => tool?.name).filter(Boolean),
  };
}

function pickRootNode(rawFigma, requestedNodeId) {
  if (!rawFigma || typeof rawFigma !== "object") return null;
  if (rawFigma.nodes && typeof rawFigma.nodes === "object") {
    if (requestedNodeId && rawFigma.nodes[requestedNodeId]?.document) {
      return rawFigma.nodes[requestedNodeId].document;
    }
    const first = Object.values(rawFigma.nodes).find((entry) => entry?.document);
    if (first?.document) return first.document;
  }
  return rawFigma.document ?? null;
}

function boxY(node, fallbackY = 0) {
  return Number.isFinite(node?.absoluteBoundingBox?.y) ? node.absoluteBoundingBox.y : fallbackY;
}

function boxHeight(node, fallback = 0) {
  return Number.isFinite(node?.absoluteBoundingBox?.height) ? node.absoluteBoundingBox.height : fallback;
}

function collectTextNodes(node, acc = [], parentY = 0) {
  if (!node || typeof node !== "object") return acc;
  const currentY = boxY(node, parentY);
  if (node.type === "TEXT" && typeof node.characters === "string") {
    const text = node.characters.trim();
    if (text) {
      acc.push({
        nodeId: node.id ?? "",
        name: node.name ?? "",
        text,
        y: currentY,
        fontSize: Number(node?.style?.fontSize) || 0,
      });
    }
  }
  if (Array.isArray(node.children)) {
    for (const child of node.children) collectTextNodes(child, acc, currentY);
  }
  return acc;
}

function cleanText(value) {
  return String(value).replace(/\s+/g, " ").trim();
}

function dedupeText(items) {
  const seen = new Set();
  const out = [];
  for (const item of items) {
    const key = cleanText(item).toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(cleanText(item));
  }
  return out;
}

function sectionCandidates(rootNode) {
  if (!rootNode) return [];
  const baseChildren = Array.isArray(rootNode.children) ? rootNode.children : [];
  const source = baseChildren.length ? baseChildren : [rootNode];
  const candidates = source.filter((node) => ["FRAME", "GROUP", "SECTION", "INSTANCE", "COMPONENT"].includes(node?.type));
  const withFallback = candidates.length ? candidates : source;
  return withFallback
    .map((node, index) => ({ node, index }))
    .sort((a, b) => boxY(a.node, a.index) - boxY(b.node, b.index))
    .map((entry) => entry.node);
}

function scoreCandidate(node, tokens) {
  const haystackParts = [node?.name ?? ""];
  const textNodes = collectTextNodes(node);
  for (const item of textNodes.slice(0, 60)) haystackParts.push(item.text);
  const haystack = haystackParts.join(" ").toLowerCase();
  let score = 0;
  for (const token of tokens) {
    const normalized = token.toLowerCase();
    if (!normalized) continue;
    if (haystack.includes(normalized)) score += 2;
  }
  if ((node?.name ?? "").toLowerCase().includes("section")) score += 0.3;
  score += Math.min(0.5, boxHeight(node, 0) / 5000);
  return score;
}

function pickWithFallback(def, candidates, usedIds) {
  let best = null;
  for (const node of candidates) {
    if (usedIds.has(node.id)) continue;
    const score = scoreCandidate(node, def.tokens);
    if (!best || score > best.score) best = { node, score };
  }
  return best;
}

function questionCount(node) {
  return collectTextNodes(node).filter((item) => item.text.includes("?")).length;
}

function assignSections(defs, candidates) {
  const assigned = new Map();
  const usedIds = new Set();

  for (const def of defs) {
    const best = pickWithFallback(def, candidates, usedIds);
    if (best && best.score > 0) {
      assigned.set(def.id, best);
      if (best.node?.id) usedIds.add(best.node.id);
    }
  }

  const first = candidates[0] ?? null;
  const last = candidates[candidates.length - 1] ?? null;
  if (!assigned.has("hero") && first) assigned.set("hero", { node: first, score: 0.4 });
  if (!assigned.has("footer") && last) assigned.set("footer", { node: last, score: 0.4 });

  if (!assigned.has("faq")) {
    const bestFaq = [...candidates]
      .filter((node) => !usedIds.has(node?.id))
      .map((node) => ({ node, score: questionCount(node) }))
      .sort((a, b) => b.score - a.score)[0];
    if (bestFaq && bestFaq.score > 0) assigned.set("faq", { node: bestFaq.node, score: 0.5 });
  }

  if (!assigned.has("value")) {
    const middle = candidates.find((node) => !usedIds.has(node?.id));
    if (middle) assigned.set("value", { node: middle, score: 0.35 });
  }

  return assigned;
}

function pickFirst(lines, predicate, fallback = "") {
  const found = lines.find((line) => predicate(line));
  return found ?? fallback;
}

function extractSectionText(node) {
  const textNodes = collectTextNodes(node)
    .sort((a, b) => (b.fontSize - a.fontSize) || (a.y - b.y));
  return {
    nodes: textNodes,
    lines: dedupeText(textNodes.map((item) => item.text)),
  };
}

function findCtas(lines) {
  const ctaPattern = /(apply|learn|request|contact|start|register|enroll|explore|get started|read more)/i;
  return lines.filter((line) => line.length <= 34 && ctaPattern.test(line)).slice(0, 2);
}

function findFaqItems(lines) {
  const items = [];
  const normalized = dedupeText(lines);
  for (let i = 0; i < normalized.length; i += 1) {
    const title = normalized[i];
    if (!title.includes("?")) continue;
    const content = normalized
      .slice(i + 1)
      .find((line) => !line.includes("?") && line.length >= 12 && line.length <= 420);
    if (!content) continue;
    items.push({ title, content });
    if (items.length >= 8) break;
  }
  return items;
}

function mergeLanding(base, assigned, sectionImages, syncAssets) {
  const next = JSON.parse(JSON.stringify(base));

  const heroNode = assigned.get("hero")?.node;
  if (heroNode) {
    const heroData = extractSectionText(heroNode);
    const title = pickFirst(
      heroData.nodes.map((item) => item.text),
      (line) => line.length >= 12 && line.length <= 120 && !/(apply|learn|contact|request)/i.test(line),
      next.hero?.headline ?? "",
    );
    const subtitle = pickFirst(
      heroData.lines,
      (line) => line !== title && line.length >= 20 && line.length <= 240,
      next.hero?.subheadline ?? "",
    );
    const [primaryLabel, secondaryLabel] = findCtas(heroData.lines);
    next.hero = {
      ...(next.hero ?? {}),
      headline: title || next.hero?.headline || "Landing headline",
      subheadline: subtitle || next.hero?.subheadline || "",
      primaryCta: {
        ...(next.hero?.primaryCta ?? {}),
        label: primaryLabel || next.hero?.primaryCta?.label || "Apply now",
      },
      secondaryCta: {
        ...(next.hero?.secondaryCta ?? {}),
        label: secondaryLabel || next.hero?.secondaryCta?.label || "Learn more",
      },
    };
    if (syncAssets && sectionImages[heroNode.id]) {
      next.hero.backgroundImage = sectionImages[heroNode.id];
    }
  }

  const valueNode = assigned.get("value")?.node;
  if (valueNode) {
    const valueData = extractSectionText(valueNode);
    const title = pickFirst(
      valueData.lines,
      (line) => line.length >= 8 && line.length <= 90 && !line.includes("?"),
      next.sections?.[0]?.title ?? "",
    );
    const body = pickFirst(
      valueData.lines,
      (line) => line !== title && line.length >= 30 && line.length <= 420,
      next.sections?.[0]?.body ?? "",
    );
    const first = {
      ...(next.sections?.[0] ?? {}),
      title: title || next.sections?.[0]?.title || "Why this program",
      body: body || next.sections?.[0]?.body || "",
    };
    if (syncAssets && sectionImages[valueNode.id]) first.image = sectionImages[valueNode.id];
    next.sections = [first];
  }

  const faqNode = assigned.get("faq")?.node;
  if (faqNode) {
    const faqData = extractSectionText(faqNode);
    const items = findFaqItems(faqData.lines);
    if (items.length) {
      next.faq = {
        ...(next.faq ?? {}),
        title: next.faq?.title || "FAQ",
        items,
      };
    }
  }

  const testimonialNode = assigned.get("testimonial")?.node;
  if (testimonialNode) {
    const testimonialData = extractSectionText(testimonialNode);
    const quote = pickFirst(
      testimonialData.lines,
      (line) => line.length >= 24 && line.length <= 320 && !line.includes("?"),
      next.testimonial?.items?.[0]?.quote ?? "",
    );
    const name = pickFirst(
      testimonialData.lines,
      (line) => line !== quote && line.length >= 4 && line.length <= 60,
      next.testimonial?.items?.[0]?.name ?? "",
    );
    const role = pickFirst(
      testimonialData.lines,
      (line) => line !== quote && line !== name && line.length >= 4 && line.length <= 90,
      next.testimonial?.items?.[0]?.role ?? "",
    );
    next.testimonial = {
      ...(next.testimonial ?? {}),
      items: [
        {
          ...(next.testimonial?.items?.[0] ?? {}),
          quote: quote || next.testimonial?.items?.[0]?.quote || "",
          name: name || next.testimonial?.items?.[0]?.name || "",
          role: role || next.testimonial?.items?.[0]?.role || "",
        },
      ],
    };
  }

  const footerNode = assigned.get("footer")?.node;
  if (footerNode) {
    const footerData = extractSectionText(footerNode);
    const linkKeywords = /(contact|privacy|terms|about|support|help|admissions|accessibility)/i;
    const secondaryLinks = footerData.lines
      .filter((line) => line.length >= 3 && line.length <= 40)
      .filter((line) => linkKeywords.test(line))
      .slice(0, 8)
      .map((text) => ({ text, href: "#" }));
    if (secondaryLinks.length) {
      next.footer = {
        ...(next.footer ?? {}),
        secondaryLinks,
      };
    }
  }

  return next;
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
const syncContent = asBool(args["sync-content"], true);
const syncAssets = asBool(args["sync-assets"], true);
const writeRaw = asBool(args["write-raw"], true);
const allowEmpty = asBool(args["allow-empty"], false);
const sourcePreference = String(args.source ?? process.env.FIGMA_SOURCE ?? "auto").toLowerCase();
const mcpUrl = args["mcp-url"] ?? process.env.FIGMA_MCP_URL ?? "http://127.0.0.1:3845/mcp";

const figmaUrl = args.url ?? process.env.FIGMA_FILE_URL ?? null;
const parsedUrl = parseFigmaUrl(figmaUrl);
const frameNodeId = normalizeNodeId(args.node ?? process.env.FIGMA_FRAME_NODE_ID ?? parsedUrl.nodeIdFromUrl);
const fileKey = parsedUrl.fileKey;
const token = process.env.FIGMA_ACCESS_TOKEN ?? "";
const rawInputPath = args.input ? path.resolve(args.input) : null;

let rawFigma = null;
let source = "none";
let fetchWarnings = [];
let mcpTools = [];

if (rawInputPath && fs.existsSync(rawInputPath)) {
  rawFigma = readJson(rawInputPath);
  source = "input";
} else {
  const shouldTryMcp = sourcePreference === "mcp" || sourcePreference === "auto";
  const shouldTryRest = sourcePreference === "rest" || sourcePreference === "auto";

  if (shouldTryMcp) {
    try {
      const mcpData = await fetchFromDesktopMcp({
        endpoint: mcpUrl,
        figmaUrl,
        frameNodeId,
        fetchWarnings,
      });
      rawFigma = mcpData.raw;
      source = "figma-mcp-desktop";
      mcpTools = mcpData.tools;
      if (writeRaw) writeJson(OUT_RAW, rawFigma);
    } catch (error) {
      fetchWarnings.push(`Desktop MCP fetch failed at ${mcpUrl}: ${String(error?.message ?? error)}`);
    }
  }

  if (!rawFigma && shouldTryRest) {
    if (fileKey && frameNodeId && token) {
      try {
        rawFigma = await fetchFigmaNode({ fileKey, frameNodeId, token });
        source = "figma-rest";
        if (writeRaw) writeJson(OUT_RAW, rawFigma);
      } catch (error) {
        fetchWarnings.push(String(error?.message ?? error));
      }
    } else if (!token && sourcePreference === "rest") {
      fetchWarnings.push("FIGMA_ACCESS_TOKEN is required when --source=rest.");
    }
  }
}

if (!rawFigma && figmaUrl && !allowEmpty) {
  console.error(
    "Unable to load Figma data from URL. Enable desktop MCP server in Figma app or provide FIGMA_ACCESS_TOKEN / --input.",
  );
  for (const warning of fetchWarnings) console.error(`- ${warning}`);
  process.exit(1);
}

const rootNode = pickRootNode(rawFigma, frameNodeId);
const candidates = sectionCandidates(rootNode);

const mappings = [
  {
    id: "hero",
    packageName: "@rds-vue-ui/hero-standard-apollo",
    component: "HeroStandardApollo",
    tokens: ["hero", "masthead", "banner", "intro", "header"],
    requiredByContent: Boolean(landing.hero),
    notes: "Map headline/subheadline/cta props from content/landing.json.",
  },
  {
    id: "value",
    packageName: "@rds-vue-ui/section-apollo",
    component: "SectionApollo",
    tokens: ["value", "benefit", "why", "program", "overview", "about"],
    requiredByContent: Array.isArray(landing.sections) && landing.sections.length > 0,
    notes: "Use one section per landing.sections entry.",
  },
  {
    id: "faq",
    packageName: "@rds-vue-ui/overlap-accordion-atlas",
    component: "OverlapAccordionAtlas",
    tokens: ["faq", "question", "accordion", "frequently asked"],
    requiredByContent: Boolean(landing.faq),
  },
  {
    id: "testimonial",
    packageName: "@rds-vue-ui/section-testimonial-falcon",
    component: "SectionTestimonialFalcon",
    tokens: ["testimonial", "quote", "student", "alumni", "story"],
    requiredByContent: Boolean(landing.testimonial),
  },
  {
    id: "footer",
    packageName: "@rds-vue-ui/footer-standard",
    component: "FooterStandard",
    tokens: ["footer", "legal", "contact", "terms", "privacy"],
    requiredByContent: Boolean(landing.footer),
  },
].filter((item) => item.requiredByContent);

const assigned = assignSections(mappings, candidates);
const sectionNodeIds = mappings
  .map((mapping) => assigned.get(mapping.id)?.node?.id)
  .filter(Boolean);
let sectionImages = {};
if (sectionNodeIds.length && fileKey && token) {
  try {
    sectionImages = await fetchFigmaImages({ fileKey, nodeIds: sectionNodeIds, token });
  } catch (error) {
    fetchWarnings.push(`Image export failed: ${String(error?.message ?? error)}`);
  }
}

const sections = [];
const exceptions = [];
for (const mapping of mappings) {
  const installed = componentInstalled(catalog, mapping.packageName);
  const match = assigned.get(mapping.id);
  const matchedNode = match?.node ?? null;
  const figmaNodes = matchedNode
    ? [{
      id: matchedNode.id ?? "",
      name: matchedNode.name ?? "",
      y: boxY(matchedNode, 0),
      score: Number((match?.score ?? 0).toFixed(2)),
    }]
    : [];
  const confidence = installed
    ? (figmaNodes.length ? Math.min(0.98, 0.6 + (match?.score ?? 0) * 0.2) : 0.4)
    : 0.15;
  sections.push({
    id: mapping.id,
    figmaNodes,
    preferredComponents: [`${mapping.packageName}:${mapping.component}`],
    confidence: Number(confidence.toFixed(2)),
    notes: mapping.notes,
    mappedAssetUrl: matchedNode ? sectionImages[matchedNode.id] ?? null : null,
  });
  if (!installed) {
    exceptions.push({
      sectionId: mapping.id,
      reason: `Missing DS package: ${mapping.packageName}`,
      fallback: "Use closest installed DS component wrapper before bespoke markup.",
    });
  }
}

const nextLanding = mergeLanding(landing, assigned, sectionImages, syncAssets);
if (syncContent && source !== "none") {
  writeJson(LANDING, nextLanding);
}

const figmaMap = {
  generatedAt: new Date().toISOString(),
  figma: {
    fileUrl: figmaUrl,
    fileKey: fileKey ?? null,
    frameNodeId: frameNodeId ?? null,
    rawInput: rawInputPath ? path.relative(process.cwd(), rawInputPath) : null,
    source,
    mcpUrl: source === "figma-mcp-desktop" ? mcpUrl : null,
    mcpTools: source === "figma-mcp-desktop" ? mcpTools : [],
  },
  stats: {
    candidateSections: candidates.length,
    mappedSections: sections.filter((section) => section.figmaNodes.length > 0).length,
  },
  sections,
  exceptions,
  warnings: fetchWarnings,
};

writeJson(OUT_MAP, figmaMap);
const mappedCount = figmaMap.stats.mappedSections;
const sectionCount = sections.length;
console.log(`✅ Wrote ${OUT_MAP} (${mappedCount}/${sectionCount} sections mapped from ${source})`);
if (syncContent && source !== "none") console.log(`✅ Updated ${LANDING}`);
if (fetchWarnings.length) {
  for (const warning of fetchWarnings) console.warn(`⚠️ ${warning}`);
}

# RDS Nuxt Landing Template

Standalone marketing landing pages built with **Nuxt 3** + **RDS Vue UI** design system components.

## Quickstart

```bash
# Node 18+ recommended
corepack enable

# if your org requires auth for npm.edpl.us:
# npm login --registry=https://npm.edpl.us --scope=@rds-vue-ui

yarn
yarn dev          # → http://localhost:3000
```

## Creating a new landing page from this template

1. Create a new private GitHub repo with `gh`, then clone it:
   ```bash
   gh auth status || gh auth login
   gh repo create <your-org>/<new-repo> --private --clone
   cd <new-repo>
   ```
2. Copy this template into that repo using Copier:
   ```bash
   # install once if needed: pipx install copier
   copier copy --trust --vcs-ref=HEAD https://github.com/chandima/landing-page-factory.git .
   ```
   Alternative template sources:
   - Local path: `/path/to/landing-page-factory`
   - Git URL: `https://github.com/chandima/landing-page-factory.git`
3. Set up dependencies and env:
   ```bash
   corepack enable
   cp .env.example .env.local

   # required if @rds-vue-ui packages are in a private registry
   npm login --registry=https://npm.edpl.us --scope=@rds-vue-ui

   yarn
   ```

## Available commands

| Command | Purpose |
|---------|---------|
| `yarn dev` | Start dev server at `http://localhost:3000` |
| `yarn build` | Full production build (catches type + template errors) |
| `yarn lint` | ESLint check |
| `yarn test:e2e` | Playwright E2E + visual regression tests |
| `yarn ds:catalog` | Refresh DS component catalog → `content/rds-catalog.json` |
| `yarn ds:catalog --ds-source=<path>` | Catalog with full DS monorepo (adds `notInstalled` section) |
| `yarn preview` | Preview production build |
| `yarn generate` | Static site generation |

## What's included

The template ships with 5 section components composing a basic landing page:

| Section | Component | DS Package |
|---------|-----------|------------|
| Hero | `HeroSection.vue` | `@rds-vue-ui/hero-standard-apollo` |
| Value props | `ValueSection.vue` | `@rds-vue-ui/section-apollo` |
| FAQ | `FAQSection.vue` | `@rds-vue-ui/overlap-accordion-atlas` |
| Testimonials | `TestimonialSection.vue` | `@rds-vue-ui/section-testimonial-falcon` |
| Footer | `BaseFooter.vue` | `@rds-vue-ui/footer-standard` |

All content lives in `content/landing.json`. Section components receive their data slice via `:model` prop binding in `pages/index.vue`. Replace the placeholder content and add/remove section components as the Figma design requires.

## Agentic workflow (Figma → RDS → Nuxt)

This template is optimized for AI agent-driven development. Provide a Figma frame URL, and the agent extracts the design, maps sections to RDS DS components, implements Vue SFCs, and verifies visually.

### How agents use this template

1. **Read AGENTS.md** — comprehensive instructions, non-negotiables, component decision tree, workflow phases
2. **Refresh the catalog** — `yarn ds:catalog` builds `content/rds-catalog.json` with full component API introspection
3. **Read Figma** — via MCP servers (see below), walk the node tree top-to-bottom
4. **Map to DS components** — match Figma sections against `figmaSignals` in the catalog
5. **Implement section-by-section** — create `components/sections/XxxSection.vue`, extract content to `content/landing.json`
6. **Verify** — `yarn lint && yarn build && yarn test:e2e`

### Agent instruction files

| File | Read by | Purpose |
|------|---------|---------|
| `AGENTS.md` | Codex, Copilot, OpenCode, Cursor | Primary instructions (comprehensive) |
| `CLAUDE.md` | Claude Code | Thin pointer → `AGENTS.md` |
| `.github/copilot-instructions.md` | VS Code Copilot | Shorter summary of key rules |

### Skills

Canonical skills live in `.agents/skills/` ([Vercel `skills` convention](https://www.npmjs.com/package/skills): single source + symlink aliases):

| Skill | Purpose |
|-------|---------|
| `figma-to-page` | Full Figma-to-page pipeline (extract → map → implement → verify) |
| `landing-reviewer` | Lint, build, E2E, DS compliance audit |
| `rds-components` | Browse all 90 DS components by category with descriptions and install commands |

Symlink aliases (DO NOT edit directly):
- `.github/skills` → `../.agents/skills`
- `.claude/skills` → `../.agents/skills`

If symlinks are not preserved by your environment, recreate them:
```bash
rm -rf .github/skills .claude/skills
ln -s ../.agents/skills .github/skills
ln -s ../.agents/skills .claude/skills
```

### MCP servers

Four MCP servers are configured for agent tooling:

| Server | Type | Endpoint | Purpose |
|--------|------|----------|---------|
| `figma-desktop` | HTTP | `http://127.0.0.1:3845/mcp` | Figma Desktop MCP (no PAT needed) |
| `figma-remote` | HTTP | `https://mcp.figma.com/mcp` | Figma Cloud MCP (needs `FIGMA_ACCESS_TOKEN`) |
| `playwright` | stdio | `npx @playwright/mcp@latest` | Browser automation and screenshots |
| `filesystem` | stdio | `npx @modelcontextprotocol/server-filesystem <root>` | Workspace file access |

Config locations by harness:

| Harness | Config |
|---------|--------|
| VS Code + Copilot | `.vscode/mcp.json` |
| Claude Code | `.mcp.json` |
| Codex | Run `./scripts/setup-codex-mcp.sh` (writes to `~/.codex/config.toml`) |

Enable the Figma Desktop MCP in Figma app: Dev Mode → Inspect → MCP server → Enable desktop MCP server.

## Environment

Create a local env file for optional Figma settings:

```bash
cp .env.example .env.local
```

`FIGMA_ACCESS_TOKEN` is only required for the Figma Cloud MCP (`figma-remote`) fallback.

## DS catalog builder

The `scripts/ds-catalog.build.mjs` script (~895 lines) reads `.vue.d.ts` files from installed `@rds-vue-ui/*` packages to extract:

- **Props** — full TypeScript interface with types and defaults
- **Slots** — named slot definitions
- **Events** — emitted event signatures
- **Visual metadata** — category, visual pattern, Figma matching signals, common pitfalls

Output: `content/rds-catalog.json` (auto-generated, do NOT hand-edit).

With the `--ds-source` flag pointing to the RDS Vue UI monorepo, it also catalogs all 81 uninstalled packages so agents know what's available to `yarn add`.

## Notes

- This template assumes `@rds-vue-ui/*` packages are available via the private Verdaccio registry at `npm.edpl.us`.
- The DS catalog (`content/rds-catalog.json`) is excluded from Copier template output via `copier.yml` — each derived repo should regenerate it with `yarn ds:catalog`.
- `scripts/setup-codex-mcp.sh` is idempotent; it removes and re-adds the template MCP servers.
- See `AGENTS.md` for: component decision tree, RDS token reference, content schema, template roadmap, and definition of done.

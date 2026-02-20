# RDS Nuxt Landing Template

Standalone marketing landing pages built with **Nuxt 3** + **RDS Vue UI** components.

## Quickstart

```bash
# Node 18+ recommended
corepack enable

# if your org requires auth for npm.edpl.us:
# npm login --registry=https://npm.edpl.us --scope=@rds-vue-ui

yarn
yarn dev
```

## Environment

Create a local env file for optional Figma settings:

```bash
cp .env.example .env.local
```

`yarn figma:map` auto-loads `.env.local`.

## Agent scaffolds

Canonical skills live in `.agents/skills` (Vercel `skills` style: single source + symlink aliases):

- `.agents/skills` (source of truth for Codex/Copilot-style agents)
- `.github/skills` -> `../.agents/skills` (symlink alias)
- `.claude/skills` -> `../.agents/skills` (symlink alias)

MCP scaffold files:

- VS Code: `.vscode/mcp.json`
- Claude Code: `.mcp.json`
- Codex: run `./scripts/setup-codex-mcp.sh` (writes to `~/.codex/config.toml`)

## Agentic workflow (Figma → RDS → Nuxt)

1. Refresh the design-system catalog:
   ```bash
   yarn ds:catalog
   ```
2. Pull/normalize a Figma frame into a section plan + DS substitutions (requires MCP client):
   ```bash
   # Preferred (no PAT): Figma Desktop MCP server
   # Enable in Figma app: Dev Mode -> Inspect -> MCP server -> Enable desktop MCP server
   yarn figma:map --source=mcp --mcp-url="http://127.0.0.1:3845/mcp" --url="https://www.figma.com/design/..." --node="354:6396"

   # Fallback (PAT-based REST API)
   # You can store FIGMA_ACCESS_TOKEN in .env.local.
   export FIGMA_ACCESS_TOKEN=your_figma_personal_access_token
   yarn figma:map --source=rest --url="https://www.figma.com/design/..." --node="354:6396"
   ```
   Optional flags:
   - `--sync-content=false` to avoid rewriting `content/landing.json`
   - `--sync-assets=false` to avoid writing temporary Figma image URLs into content
   - `--allow-empty=true` to bypass strict failure when Figma data cannot be fetched
3. Build sections from the map:
   ```bash
   yarn landing:build
   ```
4. Validate:
   ```bash
   yarn lint
   yarn build
   yarn test:e2e
   ```

## Notes

- This template assumes your RDS packages are available as `@rds-vue-ui/*` dependencies.
- `yarn figma:map` prefers desktop MCP by default (`--source=auto`) and falls back to REST when token is available.
- `FIGMA_ACCESS_TOKEN` is only required for REST fallback (`--source=rest`).
- `yarn figma:map` fails fast when URL/node is provided but neither desktop MCP nor REST data could be loaded.
- `.vscode/mcp.json` and `.mcp.json` include example MCP server configs (Figma, Playwright, Filesystem). Adjust if your environment differs.
- `scripts/setup-codex-mcp.sh` is idempotent; it removes and re-adds the template MCP servers for Codex.

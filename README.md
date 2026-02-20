# RDS Nuxt Landing Template

Standalone marketing landing pages built with **Nuxt 3** + **RDS Vue UI** components.

## Start Here (Codex Default)

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
   Alternative template source:
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
4. Configure Codex MCP servers:
   ```bash
   ./scripts/setup-codex-mcp.sh
   ```
5. Build from a Figma frame (optional; use for automated Figma-to-page generation):
   ```bash
   yarn ds:catalog
   yarn figma:map --source=mcp --mcp-url="http://127.0.0.1:3845/mcp" --url="https://www.figma.com/design/..." --node="354:6396"
   yarn landing:build
   ```
6. Validate and run:
   ```bash
   yarn lint
   yarn build
   yarn test:e2e
   yarn dev
   ```

## Pure Codex TUI Options

Use this when you are working directly in Codex terminal chat.

1. Manual build from pasted Figma link (no mapper):
   - Start Codex in repo root.
   - Paste the Figma URL and ask Codex to implement section-by-section with DS-first rules.
   - Codex should edit `content/landing.json`, `components/sections/*`, and `pages/index.vue`.
   - Then run:
   ```bash
   yarn lint
   yarn build
   yarn test:e2e
   ```
2. Automated flow from pasted Figma link (recommended for repeatability):
   - Ensure Codex MCP is configured once:
   ```bash
   ./scripts/setup-codex-mcp.sh
   ```
   - In Codex chat, provide the Figma URL + node id and ask Codex to run:
   ```bash
   yarn ds:catalog
   yarn figma:map --source=mcp --mcp-url="http://127.0.0.1:3845/mcp" --url="<FIGMA_URL>" --node="<NODE_ID>"
   yarn landing:build
   yarn lint
   yarn build
   yarn test:e2e
   ```

## Caveats For Other Coding Harnesses

- VS Code + Copilot:
  - Uses `.vscode/mcp.json`
  - Skills are available via `.github/skills` symlink
- Claude Code:
  - Uses `.mcp.json`
  - Skills are available via `.claude/skills` symlink
- If symlinks are not preserved by your environment, recreate them:
  ```bash
  rm -rf .github/skills .claude/skills
  ln -s ../.agents/skills .github/skills
  ln -s ../.agents/skills .claude/skills
  ```

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

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
   yarn figma:map --url="https://www.figma.com/design/..." --node="354:6396"
   ```
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
- `FIGMA_ACCESS_TOKEN` must be set in your shell for Figma MCP usage.
- `.vscode/mcp.json` and `.mcp.json` include example MCP server configs (Figma, Playwright, Filesystem). Adjust if your environment differs.
- `scripts/setup-codex-mcp.sh` is idempotent; it removes and re-adds the template MCP servers for Codex.

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
- `.vscode/mcp.json` includes example MCP server configs (Figma, Playwright, Filesystem). Adjust to your environment.

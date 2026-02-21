# CLAUDE.md — RDS Nuxt Landing Pages

> **All project instructions live in `AGENTS.md`** — read it fully before starting work.
> This file adds Claude Code-specific context only.

## Quick reference

```bash
yarn ds:catalog          # Build/refresh component catalog → content/rds-catalog.json
yarn dev                 # Dev server at localhost:3000
yarn lint                # ESLint
yarn build               # Production build (catches type + template errors)
yarn test:e2e            # Playwright E2E + visual regression
```

## Skills

Skills live in `.agents/skills/` (symlinked to `.claude/skills/` for Claude Code):
- **figma-to-page** — full Figma-to-page pipeline
- **landing-reviewer** — lint/build/e2e/DS compliance review
- **rds-components** — all 90 RDS Vue UI components reference

## Claude-specific notes

- The Figma MCP server is configured in `.vscode/mcp.json` (Framelink protocol).
- `content/rds-catalog.json` is auto-generated — DO NOT hand-edit.
- **Symlink protection**: `.claude/skills/` is a symlink → `.agents/skills/`. NEVER delete, replace, or overwrite it. Edit skills only in `.agents/skills/`.
- If the symlink is broken, recreate it: `ln -s ../.agents/skills .claude/skills`
- See `AGENTS.md` for: component decision tree, RDS token reference, content schema, workflow phases, and definition of done.

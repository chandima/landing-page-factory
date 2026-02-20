# Skill: figma-to-rds-map

## Purpose
Convert a target Figma frame into a section plan and a node→RDS component substitution map.

## Tools
- Figma MCP server
- `content/rds-catalog.json`

## Outputs
- `content/figma-map.json`

## Rules
- Every section must list preferred RDS components first (with confidence).
- Any bespoke exception must include a justification referencing missing DS capability.

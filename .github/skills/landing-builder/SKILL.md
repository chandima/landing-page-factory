---
name: landing-builder
description: Generate and validate Nuxt section composition from figma-map and RDS catalog artifacts with DS-first enforcement.
---

# Skill: landing-builder

## Purpose
Generate/modify Nuxt 3 page + section components based on `content/figma-map.json` and `content/landing.json`.

## Inputs
- `content/figma-map.json`
- `content/rds-catalog.json`
- `content/landing.json`

## Outputs
- `components/sections/*`
- `pages/index.vue`

## Rules
- Prefer DS components; wrap before you reimplement.
- Keep diffs small: implement one section per commit.

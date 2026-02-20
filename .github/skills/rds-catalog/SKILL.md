# Skill: rds-catalog

## Purpose
Create/refresh a deterministic catalog of available RDS Vue UI packages/components for substitution.

## Inputs
- Installed dependencies under `node_modules/@rds-vue-ui/*`

## Outputs
- `content/rds-catalog.json`

## Procedure
1. Run `yarn ds:catalog`
2. Confirm the output contains expected packages.
3. If a required component is missing, do NOT implement bespoke markup yet:
   - propose the closest existing DS component
   - or request a DS release / version bump.

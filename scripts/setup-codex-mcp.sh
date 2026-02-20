#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

require_cmd codex
require_cmd npx

if [[ -z "${FIGMA_ACCESS_TOKEN:-}" ]]; then
  echo "FIGMA_ACCESS_TOKEN is not set. Export it before running this script." >&2
  exit 1
fi

for name in figma figma-remote playwright filesystem; do
  codex mcp remove "$name" >/dev/null 2>&1 || true
done

codex mcp add figma --env "FIGMA_ACCESS_TOKEN=${FIGMA_ACCESS_TOKEN}" -- npx -y @figma/mcp-server
codex mcp add figma-remote --url https://mcp.figma.com/mcp
codex mcp add playwright -- npx -y @playwright/mcp@latest
codex mcp add filesystem -- npx -y @modelcontextprotocol/server-filesystem "$REPO_ROOT"

echo "Codex MCP servers configured."
codex mcp list

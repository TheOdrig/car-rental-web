#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

fast=false
if [ "${1:-}" = "--fast" ]; then fast=true; fi

echo "==> node version"; node scripts/check-node.mjs
echo "==> check-no-ai-files"; node scripts/check-no-ai-files.mjs
echo "==> lint (max-warnings 0)"; npm run lint
echo "==> contract (generated types vs snapshot, sibling API spec)"; npm run contract:check
echo "==> typecheck"; npm run type-check
echo "==> vitest (incl. architecture tests)"; npm test
if [ "$fast" = true ]; then
  echo "==> audit and build skipped (--fast)"
else
  echo "==> audit (prod deps, high)"; npm audit --omit=dev --audit-level=high
  echo "==> build"; npm run build
fi
echo "==> local checks"
if [ -f scripts/verify.local.sh ]; then bash scripts/verify.local.sh; else echo "local checks: none"; fi
echo "verify: OK"

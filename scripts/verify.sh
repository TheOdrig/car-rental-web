#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

echo "==> lint (max-warnings 0)"; npm run lint
echo "==> contract (generated types vs snapshot)"; npm run contract:check
echo "==> typecheck"; npm run type-check
echo "==> vitest (incl. architecture tests)"; npm test
echo "==> docs lint (report-only)"
if [ ! -d docs ]; then echo "docs/ not present, skipped"; elif [ ! -f "$HOME/.claude/skills/repo-docs-wiki/scripts/lint_docs_wiki.py" ]; then echo "docs lint skipped"; elif command -v py >/dev/null 2>&1; then py -3 -I "$HOME/.claude/skills/repo-docs-wiki/scripts/lint_docs_wiki.py" . --docs docs; else python3 -I "$HOME/.claude/skills/repo-docs-wiki/scripts/lint_docs_wiki.py" . --docs docs; fi
echo "==> check-no-ai-files"; node scripts/check-no-ai-files.mjs
echo "verify: OK"

$ErrorActionPreference = 'Stop'
Set-Location (Join-Path $PSScriptRoot '..')

function Step($name, [scriptblock]$cmd) {
  Write-Host "==> $name"
  & $cmd
  if ($LASTEXITCODE -ne 0) { Write-Error "verify failed at: $name"; exit 1 }
}

Step 'lint (max-warnings 0)' { npm run lint }
Step 'contract (generated types vs snapshot)' { npm run contract:check }
Step 'typecheck' { npm run type-check }
Step 'vitest (incl. architecture tests)' { npm test }
Step 'audit (prod deps, high)' { npm audit --omit=dev --audit-level=high }
Step 'docs lint (report-only)' { $lint = Join-Path $HOME '.claude/skills/repo-docs-wiki/scripts/lint_docs_wiki.py'; if ((Test-Path docs) -and (Test-Path $lint)) { py -3 -I $lint . --docs docs } else { Write-Host 'docs lint skipped' } }
Step 'check-no-ai-files' { node scripts/check-no-ai-files.mjs }
Write-Host 'verify: OK'

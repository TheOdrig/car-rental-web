param([switch]$Fast)

$ErrorActionPreference = 'Stop'
Set-Location (Join-Path $PSScriptRoot '..')

function Step($name, [scriptblock]$cmd) {
  Write-Host "==> $name"
  & $cmd
  if ($LASTEXITCODE -ne 0) { Write-Error "verify failed at: $name"; exit 1 }
}

Step 'node version' { node scripts/check-node.mjs }
Step 'check-no-ai-files' { node scripts/check-no-ai-files.mjs }
Step 'lint (max-warnings 0)' { npm run lint }
Step 'contract (generated types vs snapshot, sibling API spec)' { npm run contract:check }
Step 'typecheck' { npm run type-check }
Step 'vitest (incl. architecture tests)' { npm test }
if ($Fast) {
  Write-Host '==> audit and build skipped (-Fast)'
} else {
  Step 'audit (prod deps, high)' { npm audit --omit=dev --audit-level=high }
  Step 'build' { npm run build }
}
Write-Host '==> local checks'
$local = Join-Path $PSScriptRoot 'verify.local.ps1'
if (Test-Path $local) {
  & $local
  if ($LASTEXITCODE -ne 0) { Write-Error 'verify failed at: local checks'; exit 1 }
} else {
  Write-Host 'local checks: none'
}
Write-Host 'verify: OK'

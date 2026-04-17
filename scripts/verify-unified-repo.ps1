param(
  [switch]$Install,
  [switch]$IncludeRust,
  [switch]$AutoFix
)

$ErrorActionPreference = "Stop"

function Invoke-Step {
  param(
    [string]$Name,
    [scriptblock]$Action
  )

  Write-Host ""
  Write-Host "==> $Name" -ForegroundColor Cyan
  & $Action
}

$RepoRoot = Split-Path -Parent $PSScriptRoot
$FrontendRoot = Join-Path $RepoRoot "frontend"
$PlatformRoot = Join-Path $RepoRoot "services\\gane-platform"

if ($AutoFix) {
  $frontendPackageLock = Join-Path $FrontendRoot "package-lock.json"
  $frontendPnpmLock = Join-Path $FrontendRoot "pnpm-lock.yaml"

  if ((Test-Path $frontendPackageLock) -and (Test-Path $frontendPnpmLock)) {
    Write-Host "Removing stray frontend/package-lock.json to preserve pnpm ownership." -ForegroundColor Yellow
    Remove-Item -LiteralPath $frontendPackageLock
  }
}

Invoke-Step "Verify frontend surface" {
  Push-Location $FrontendRoot
  try {
    if ($Install -or -not (Test-Path (Join-Path $FrontendRoot "node_modules"))) {
      npm.cmd install --legacy-peer-deps
    }

    npm.cmd run check
    npm.cmd run test
    npm.cmd run build
  }
  finally {
    Pop-Location
  }
}

Invoke-Step "Verify platform service" {
  Push-Location $PlatformRoot
  try {
    if ($Install -or -not (Test-Path (Join-Path $PlatformRoot "node_modules"))) {
      npm.cmd install
    }

    npm.cmd run typecheck
    npm.cmd test
    npm.cmd run build
  }
  finally {
    Pop-Location
  }
}

if ($IncludeRust) {
  Invoke-Step "Verify Rust workspace" {
    Push-Location $RepoRoot
    try {
      cargo check --workspace
    }
    finally {
      Pop-Location
    }
  }
}

Write-Host ""
Write-Host "Unified verification completed." -ForegroundColor Green

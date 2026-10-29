#Requires -Version 7.0
<#
.SYNOPSIS
    Builds the Foundry VTT release zip for pf1-random-magic-shop.

.DESCRIPTION
    Creates dist/pf1-random-magic-shop-<version>.zip whose top-level folder is
    pf1-random-magic-shop/, which is what Foundry expects when it unzips a module
    into Data/modules/.

    Excluded from the zip: dist, build, test, docs, .git, node_modules,
    *.ps1 helper scripts and log files.

.PARAMETER Version
    Overrides the version read from module.json. Rarely needed.

.EXAMPLE
    pwsh -File .\build-release.ps1
#>
[CmdletBinding()]
param(
    [string]$Version
)

$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot

$manifestPath = Join-Path $PSScriptRoot 'module.json'
if (-not (Test-Path -LiteralPath $manifestPath)) {
    throw "module.json not found in $PSScriptRoot"
}

$manifest = Get-Content -LiteralPath $manifestPath -Raw | ConvertFrom-Json
if (-not $Version) { $Version = $manifest.version }
if (-not $Version) { throw "Could not determine version (module.json has no version field)" }

$moduleName = $manifest.id
Write-Host "Building $moduleName v$Version" -ForegroundColor Cyan

$distDir = Join-Path $PSScriptRoot 'dist'
$stageDir = Join-Path $distDir 'stage'
$stageModule = Join-Path $stageDir $moduleName

if (Test-Path -LiteralPath $stageDir) { Remove-Item -LiteralPath $stageDir -Recurse -Force }
New-Item -ItemType Directory -Path $stageModule -Force | Out-Null

$excludeNames = @('dist', 'build', 'test', 'docs', 'node_modules', '.git', '.github', '.vscode', '.idea')
$excludeExtensions = @('.ps1', '.log')

Get-ChildItem -LiteralPath $PSScriptRoot -Force | ForEach-Object {
    if ($_.Name -in $excludeNames) { return }
    if ($_.Name -like '.*') {
        # Keep .gitignore out of the release, skip the rest of the dotfiles too
        return
    }
    if ($_.PSIsContainer) {
        Copy-Item -LiteralPath $_.FullName -Destination $stageModule -Recurse -Force
    }
    elseif ($_.Extension -in $excludeExtensions) {
        return
    }
    else {
        Copy-Item -LiteralPath $_.FullName -Destination $stageModule -Force
    }
}

$zipPath = Join-Path $distDir "$moduleName-$Version.zip"
if (Test-Path -LiteralPath $zipPath) { Remove-Item -LiteralPath $zipPath -Force }
Compress-Archive -LiteralPath $stageModule -DestinationPath $zipPath -CompressionLevel Optimal

# ---- verify the layout Foundry needs -------------------------------------
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::OpenRead($zipPath)
try {
    $topLevel = $zip.Entries |
        ForEach-Object { ($_.FullName -split '/')[0] } |
        Where-Object { $_ } |
        Select-Object -Unique
}
finally {
    $zip.Dispose()
}

Write-Host "Top-level entries: $($topLevel -join ', ')" -ForegroundColor DarkGray
if ($topLevel -notcontains $moduleName) {
    throw "Bad zip layout: expected a single top-level folder named '$moduleName'. Foundry will not load this."
}
if ($topLevel.Count -ne 1) {
    Write-Warning "Zip has more than one top-level entry; Foundry usually tolerates it but '$moduleName/' only is cleaner."
}

$sizeKb = [math]::Round((Get-Item -LiteralPath $zipPath).Length / 1KB, 1)
Write-Host "Built: $zipPath ($sizeKb KB)" -ForegroundColor Green

# Clean up the staging folder so repeated builds start fresh
Remove-Item -LiteralPath $stageDir -Recurse -Force -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. git tag v$Version && git push origin main --tags"
Write-Host "  2. Create a GitHub release for v$Version"
Write-Host "  3. Attach BOTH:"
Write-Host "       dist/$moduleName-$Version.zip"
Write-Host "       module.json   <- required for the /releases/latest/download/module.json URL"
Write-Host "  4. Paste docs/release-notes-v$Version.md as the release description"

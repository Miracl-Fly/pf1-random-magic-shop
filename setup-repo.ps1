#Requires -Version 7.0
<#
.SYNOPSIS
    Replaces the YOUR_GITHUB_USER placeholder with your real GitHub account.

.DESCRIPTION
    Rewrites module.json (url / manifest / download / readme / bugs) and every
    YOUR_GITHUB_USER occurrence in the Markdown documentation.

    The script is idempotent: running it twice with the same values is harmless,
    and re-running it after changing either -User or -Repo re-derives every URL
    from the current values (it does not stack replacements).

.PARAMETER User
    Your GitHub username or organisation, e.g. "miracl-fly".

.PARAMETER Repo
    Repository name. Defaults to pf1-random-magic-shop.

.EXAMPLE
    pwsh -File .\setup-repo.ps1 -User miracl-fly

.EXAMPLE
    pwsh -File .\setup-repo.ps1 -User miracl-fly -Repo pf1-random-magic-shop
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$User,

    [string]$Repo = 'pf1-random-magic-shop'
)

$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot

$manifestPath = Join-Path $PSScriptRoot 'module.json'
$manifest = Get-Content -LiteralPath $manifestPath -Raw | ConvertFrom-Json

$base = "https://github.com/$User/$Repo"
$version = $manifest.version
$id = $manifest.id

$manifest.url = $base
$manifest.manifest = "$base/releases/latest/download/module.json"
$manifest.download = "$base/releases/download/$version/$id-$version.zip"
$manifest.readme = "$base/blob/main/README.md"
$manifest.bugs = "$base/issues"

# ConvertTo-Json escapes non-ASCII; Foundry reads UTF-8 fine, so write it back that way.
$json = $manifest | ConvertTo-Json -Depth 12
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($manifestPath, $json + "`n", $utf8NoBom)
Write-Host "Updated module.json" -ForegroundColor Green

# ---- Markdown / docs ------------------------------------------------------
$targets = Get-ChildItem -LiteralPath $PSScriptRoot -Recurse -File -Include '*.md' |
    Where-Object { $_.FullName -notmatch '[\\/](dist|build|node_modules|\.git)[\\/]' }

$changed = 0
foreach ($file in $targets) {
    $text = [System.IO.File]::ReadAllText($file.FullName)
    $original = $text

    # Replace the placeholder first, then re-derive any earlier real URL so that
    # changing -User/-Repo later still produces correct links.
    $text = $text -replace 'YOUR_GITHUB_USER', $User
    $text = $text -replace 'https://github\.com/[^/\s\)"]+/pf1-random-magic-shop', $base

    if ($text -ne $original) {
        [System.IO.File]::WriteAllText($file.FullName, $text, $utf8NoBom)
        Write-Host "  patched $($file.FullName.Substring($PSScriptRoot.Length + 1))" -ForegroundColor DarkGray
        $changed++
    }
}

Write-Host "Patched $changed Markdown file(s)" -ForegroundColor Green
Write-Host ""
Write-Host "Resulting URLs:" -ForegroundColor Cyan
Write-Host "  manifest: $($manifest.manifest)"
Write-Host "  download: $($manifest.download)"
Write-Host ""
Write-Host "Remaining placeholders (should be none):" -ForegroundColor Cyan
$left = Select-String -Path (Join-Path $PSScriptRoot '*.md'), (Join-Path $PSScriptRoot 'module.json') -Pattern 'YOUR_GITHUB_USER' -ErrorAction SilentlyContinue
if ($left) { $left | ForEach-Object { Write-Host "  $($_.Filename):$($_.LineNumber)" -ForegroundColor Yellow } }
else { Write-Host "  none" -ForegroundColor Green }

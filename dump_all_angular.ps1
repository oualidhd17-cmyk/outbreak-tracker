# dump_all_angular.ps1
param(
  [string]$SrcPath = "/src",
  [string]$OutDirName = "DUMPS_ANGULAR",
  [string]$OutFileName = "src.txt",
  [string[]]$Extensions = @("*.ts","*.html","*.scss","*.css","*.json","*.md","*"),
  [switch]$ExcludeSpecs = $true
)

$ProjectRoot = (Get-Location).Path
$SrcDir  = Join-Path $ProjectRoot $SrcPath
$OutDir  = Join-Path $ProjectRoot $OutDirName
$OutFile = Join-Path $OutDir $OutFileName

# Force UTF-8
$PSDefaultParameterValues['Out-File:Encoding'] = 'utf8'
$PSDefaultParameterValues['Set-Content:Encoding'] = 'utf8'
$PSDefaultParameterValues['Add-Content:Encoding'] = 'utf8'

if (-not (Test-Path $SrcDir)) {
  Write-Host "ERROR: Source path not found: $SrcDir"
  exit 1
}

New-Item -ItemType Directory -Force -Path $OutDir | Out-Null
Remove-Item $OutFile -ErrorAction SilentlyContinue

# Build file list
$Files = @()
foreach ($ext in $Extensions) {
  $Files += Get-ChildItem -Path $SrcDir -Recurse -File -Filter $ext -ErrorAction SilentlyContinue
}

# Exclusions
$Files = $Files | Where-Object {
  $_.FullName -notmatch "\\node_modules\\|\\dist\\|\\coverage\\|\\\.angular\\|\\\.git\\"
}

if ($ExcludeSpecs) {
  $Files = $Files | Where-Object { $_.Name -notmatch "\.spec\.ts$" }
}

$Files = $Files | Sort-Object FullName

Add-Content -Path $OutFile -Value "DUMP: Angular Project"
Add-Content -Path $OutFile -Value "ROOT: $ProjectRoot"
Add-Content -Path $OutFile -Value "SOURCE: $SrcDir"
Add-Content -Path $OutFile -Value "EXTENSIONS: $($Extensions -join ', ')"
Add-Content -Path $OutFile -Value "EXCLUDE_SPECS: $ExcludeSpecs"
Add-Content -Path $OutFile -Value "FILES: $($Files.Count)"
Add-Content -Path $OutFile -Value "============================================================`r`n"

foreach ($f in $Files) {
  Add-Content -Path $OutFile -Value "`r`n============================================================"
  Add-Content -Path $OutFile -Value ("FILE: " + $f.FullName)
  Add-Content -Path $OutFile -Value "============================================================`r`n"

  try {
    $content = Get-Content -Path $f.FullName -Raw -Encoding utf8
  } catch {
    $content = Get-Content -Path $f.FullName -Raw
  }

  Add-Content -Path $OutFile -Value $content
}

Write-Host "DONE -> $OutFile"
Write-Host "ALL ANGULAR FILES DUMPED -> $OutDir"

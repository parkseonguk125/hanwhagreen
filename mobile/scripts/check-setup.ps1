# Attendance app phase-0 environment check
# Usage: .\mobile\scripts\check-setup.ps1

$ErrorActionPreference = "Continue"
$Root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$FlutterBat = Join-Path $Root ".tools\flutter\bin\flutter.bat"
$MobileDir = Join-Path $Root "mobile"

Write-Host ""
Write-Host "=== Hanwha Green Attendance App - Phase 0 Check ===" -ForegroundColor Cyan
Write-Host ""

function Write-CheckLine {
    param([string]$Label, [bool]$Ok, [string]$Detail)
    $mark = if ($Ok) { "[OK]" } else { "[--]" }
    $color = if ($Ok) { "Green" } else { "Yellow" }
    Write-Host "$mark $Label" -ForegroundColor $color
    if ($Detail) { Write-Host "     $Detail" }
}

Write-CheckLine "Flutter SDK (.tools/flutter)" (Test-Path $FlutterBat) $FlutterBat
Write-CheckLine "Flutter app folder (mobile/)" (Test-Path (Join-Path $MobileDir "pubspec.yaml")) $MobileDir

$HasEnv = Test-Path (Join-Path $Root ".env")
if ($HasEnv) {
    Write-CheckLine "Local .env file" $true "found"
} else {
    Write-CheckLine "Local .env file" $false "missing - copy .env.example to .env"
}

$attendanceKey = ""
if ($HasEnv) {
    $envContent = Get-Content (Join-Path $Root ".env") -Raw -Encoding UTF8
    if ($envContent -match 'ATTENDANCE_APP_API_KEY=(.+)') {
        $attendanceKey = $Matches[1].Trim()
    }
}

$keyOk = ($attendanceKey -ne "") -and ($attendanceKey -notmatch '^#')
if ($keyOk) {
    Write-CheckLine "ATTENDANCE_APP_API_KEY (.env)" $true "configured"
} else {
    Write-CheckLine "ATTENDANCE_APP_API_KEY (.env)" $false "not set - add random string before phase 1"
}

if (Test-Path $FlutterBat) {
    Write-Host ""
    Write-Host "--- flutter doctor ---" -ForegroundColor Cyan
    & $FlutterBat doctor
}

Write-Host ""
Write-Host "Guide: docs\출격서비스_0단계_사전준비.md" -ForegroundColor Cyan
Write-Host "Preview app in Chrome:" -ForegroundColor Cyan
Write-Host "  cd mobile" -ForegroundColor Gray
Write-Host "  ..\mobile\scripts\flutter.ps1 run -d chrome" -ForegroundColor Gray
Write-Host ""

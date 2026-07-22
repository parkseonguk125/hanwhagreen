# Hanwha attendance app - Release APK build
# Usage: .\mobile\scripts\build-android-release.ps1
#        .\mobile\scripts\build-android-release.ps1 -ApiBaseUrl "https://example.com/api"

param(
    [string]$ApiBaseUrl = ""
)

$ErrorActionPreference = "Stop"
$Root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$FlutterBat = Join-Path $Root ".tools\flutter\bin\flutter.bat"
$MobileDir = Join-Path $Root "mobile"
$EnvFile = Join-Path $Root ".env"
$DistDir = Join-Path $MobileDir "dist"

if (-not (Test-Path $FlutterBat)) {
    Write-Host "[ERROR] Flutter SDK not found: $FlutterBat" -ForegroundColor Red
    exit 1
}

function Read-EnvValue([string]$Name) {
    if (-not (Test-Path $EnvFile)) { return "" }
    $content = Get-Content $EnvFile -Raw -Encoding UTF8
    if ($content -match "(?m)^${Name}=(.+)$") {
        return $Matches[1].Trim()
    }
    return ""
}

$apiKey = Read-EnvValue "ATTENDANCE_APP_API_KEY"
$naverMapClientId = Read-EnvValue "NAVER_MAP_CLIENT_ID"

if (-not $ApiBaseUrl) {
    $ApiBaseUrl = Read-EnvValue "ATTENDANCE_APP_API_BASE_URL"
}

if (-not $ApiBaseUrl) {
    Write-Host "[ERROR] API base URL is required." -ForegroundColor Red
    Write-Host "Add to .env: ATTENDANCE_APP_API_BASE_URL=https://your-domain.com/api" -ForegroundColor Yellow
    Write-Host 'Or: .\mobile\scripts\build-android-release.ps1 -ApiBaseUrl "http://192.168.0.10:3001/api"' -ForegroundColor Gray
    exit 1
}

if ($ApiBaseUrl -notmatch '/api/?$') {
    Write-Host "[WARN] URL should end with /api" -ForegroundColor Yellow
}

if (-not $apiKey) {
    Write-Host "[ERROR] ATTENDANCE_APP_API_KEY missing in .env" -ForegroundColor Red
    exit 1
}

$KeyProps = Join-Path $MobileDir "android\key.properties"
if (-not (Test-Path $KeyProps)) {
    Write-Host "[INFO] No key.properties - signing with debug key (internal test OK)" -ForegroundColor Yellow
    Write-Host "       See docs/출격서비스_4단계_APK배포.md for release keystore" -ForegroundColor Gray
} else {
    Write-Host "[SIGN] Using key.properties for release signing" -ForegroundColor Green
}

Write-Host ""
Write-Host "=== Release APK build ===" -ForegroundColor Cyan
Write-Host "API_BASE_URL=$ApiBaseUrl"
Write-Host "APP_API_KEY=set"
if ($naverMapClientId) {
    Write-Host "NAVER_MAP_CLIENT_ID=set"
} else {
    Write-Host "NAVER_MAP_CLIENT_ID=not set (in-app map disabled)" -ForegroundColor Yellow
}
Write-Host ""

Push-Location $MobileDir
try {
    & $FlutterBat pub get

    & $FlutterBat build apk --release `
        --dart-define=API_BASE_URL=$ApiBaseUrl `
        --dart-define=APP_API_KEY=$apiKey `
        --dart-define=NAVER_MAP_CLIENT_ID=$naverMapClientId

    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Flutter APK build failed (exit $LASTEXITCODE)" -ForegroundColor Red
        exit $LASTEXITCODE
    }

    $apkSource = Join-Path $MobileDir "build\app\outputs\flutter-apk\app-release.apk"
    if (-not (Test-Path $apkSource)) {
        Write-Host "[ERROR] APK not found: $apkSource" -ForegroundColor Red
        exit 1
    }

    New-Item -ItemType Directory -Force -Path $DistDir | Out-Null

    $pubspec = Get-Content (Join-Path $MobileDir "pubspec.yaml") -Raw
    $version = "1.0.0"
    if ($pubspec -match '(?m)^version:\s*(.+)$') {
        $version = $Matches[1].Trim().Replace("+", "_")
    }

    $timestamp = Get-Date -Format "yyyyMMdd-HHmm"
    $apkName = "hanwha-attendance_${version}_${timestamp}.apk"
    $apkDest = Join-Path $DistDir $apkName

    Copy-Item $apkSource $apkDest -Force

    $apkSizeMb = [math]::Round((Get-Item $apkDest).Length / 1MB, 1)

    Write-Host ""
    Write-Host "=== Build complete ===" -ForegroundColor Green
    Write-Host "APK: $apkDest" -ForegroundColor Green
    Write-Host "Size: ${apkSizeMb} MB"
    Write-Host ""
    Write-Host "Install: copy APK to tablet and allow unknown sources" -ForegroundColor Gray
    Write-Host "Guide: docs\출격서비스_4단계_APK배포.md" -ForegroundColor Gray
} finally {
    Pop-Location
}

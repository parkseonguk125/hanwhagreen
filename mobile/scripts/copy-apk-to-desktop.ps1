# Copy latest APK to Desktop with a simple file name
$ErrorActionPreference = "Stop"
$Root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$DistDir = Join-Path $Root "mobile\dist"
$Desktop = [Environment]::GetFolderPath("Desktop")
$DestName = "hanwha-attendance.apk"
$DestPath = Join-Path $Desktop $DestName

if (-not (Test-Path $DistDir)) {
    Write-Host "[ERROR] dist folder not found. Run 출격앱_APK빌드.bat first." -ForegroundColor Red
    exit 1
}

$apk = Get-ChildItem (Join-Path $DistDir "*.apk") | Sort-Object LastWriteTime -Descending | Select-Object -First 1
if (-not $apk) {
    Write-Host "[ERROR] No APK in mobile\dist. Run 출격앱_APK빌드.bat first." -ForegroundColor Red
    exit 1
}

Copy-Item $apk.FullName $DestPath -Force

Write-Host ""
Write-Host "=== APK copied to Desktop ===" -ForegroundColor Green
Write-Host $DestPath
Write-Host "Size: $([math]::Round($apk.Length / 1MB, 1)) MB"
Write-Host ""
Write-Host "Next: USB cable -> copy this file to phone Download folder" -ForegroundColor Cyan
Write-Host "  or run 출격앱_APK폰다운로드.bat (same Wi-Fi)" -ForegroundColor Cyan

# 프로젝트 루트 기준 Flutter 실행 래퍼
# 사용: .\mobile\scripts\flutter.ps1 doctor
#      .\mobile\scripts\flutter.ps1 run -d chrome

$ErrorActionPreference = "Stop"
$Root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$FlutterBin = Join-Path $Root ".tools\flutter\bin\flutter.bat"

if (-not (Test-Path $FlutterBin)) {
    Write-Host "[오류] Flutter SDK가 없습니다: $FlutterBin" -ForegroundColor Red
    Write-Host "docs/출격서비스_0단계_사전준비.md 의 'Flutter SDK 받기' 절을 따라주세요."
    exit 1
}

& $FlutterBin @args

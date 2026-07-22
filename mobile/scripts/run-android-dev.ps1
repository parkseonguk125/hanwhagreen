# Android 실기기/에뮬레이터 개발 실행 (PowerShell)
# 사용: .\mobile\scripts\run-android-dev.ps1

$ErrorActionPreference = "Stop"
$Root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$FlutterBat = Join-Path $Root ".tools\flutter\bin\flutter.bat"
$MobileDir = Join-Path $Root "mobile"
$EnvFile = Join-Path $Root ".env"

if (-not (Test-Path $FlutterBat)) {
    Write-Host "[오류] Flutter SDK 없음: $FlutterBat" -ForegroundColor Red
    exit 1
}

$apiKey = ""
$naverMapClientId = ""
if (Test-Path $EnvFile) {
    $content = Get-Content $EnvFile -Raw -Encoding UTF8
    if ($content -match 'ATTENDANCE_APP_API_KEY=(.+)') {
        $apiKey = $Matches[1].Trim()
    }
    if ($content -match 'NAVER_MAP_CLIENT_ID=(.+)') {
        $naverMapClientId = $Matches[1].Trim()
    }
}

if (-not $apiKey) {
    Write-Host "[경고] .env 에 ATTENDANCE_APP_API_KEY 가 없습니다." -ForegroundColor Yellow
}

if (-not $naverMapClientId) {
    Write-Host "[안내] .env 에 NAVER_MAP_CLIENT_ID 가 없습니다. 앱 내 지도는 비활성, 외부 지도만 사용." -ForegroundColor Yellow
} else {
    Write-Host "NAVER_MAP_CLIENT_ID=설정됨 (앱 내 지도 활성)" -ForegroundColor Green
}

# 에뮬레이터: 10.0.2.2 = PC localhost. 실기기면 PC Wi-Fi IP 로 바꾸세요.
$apiBase = "http://10.0.2.2:3001/api"

Write-Host "API_BASE_URL=$apiBase" -ForegroundColor Cyan
Write-Host "실기기 사용 시 mobile\scripts\run-android-dev.ps1 안의 `$apiBase 를 PC IP 로 수정하세요." -ForegroundColor Gray

# OneDrive 잠금으로 macos/ios ephemeral 삭제 실패 방지
@(
    (Join-Path $MobileDir "macos\Flutter\ephemeral"),
    (Join-Path $MobileDir "ios\Flutter\ephemeral")
) | ForEach-Object {
    if (Test-Path $_) {
        Remove-Item -Recurse -Force $_ -ErrorAction SilentlyContinue
    }
}

Push-Location $MobileDir
try {
    & $FlutterBat pub get

    $deviceId = $null
    try {
        $devicesJson = & $FlutterBat devices --machine 2>$null | ConvertFrom-Json
        $androidDevice = $devicesJson | Where-Object {
            $_.isSupported -and ($_.targetPlatform -like 'android-*' -or $_.id -match '^emulator-')
        } | Select-Object -First 1
        if ($androidDevice) {
            $deviceId = $androidDevice.id
        }
    } catch {
        $deviceId = $null
    }

    if (-not $deviceId) {
        Write-Host "[오류] Android 에뮬레이터/기기가 없습니다. Android Studio에서 Medium Phone ▶ 를 먼저 실행하세요." -ForegroundColor Red
        exit 1
    }

    Write-Host "사용 기기: $deviceId" -ForegroundColor Green

    & $FlutterBat run -d $deviceId `
        --dart-define=API_BASE_URL=$apiBase `
        --dart-define=APP_API_KEY=$apiKey `
        --dart-define=NAVER_MAP_CLIENT_ID=$naverMapClientId
} finally {
    Pop-Location
}

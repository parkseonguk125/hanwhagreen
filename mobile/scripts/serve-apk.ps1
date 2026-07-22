# Serve APK over Wi-Fi for phone download (no Python required)
$ErrorActionPreference = "Stop"
$Root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$DistDir = Join-Path $Root "mobile\dist"
$Port = 8888

$apk = Get-ChildItem (Join-Path $DistDir "*.apk") -ErrorAction SilentlyContinue |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 1

if (-not $apk) {
    Write-Host "[ERROR] No APK found. Run 출격앱_APK빌드.bat first." -ForegroundColor Red
    exit 1
}

$serveDir = Join-Path $env:TEMP "hanwha-apk-serve"
New-Item -ItemType Directory -Force -Path $serveDir | Out-Null
$serveFile = Join-Path $serveDir "hanwha-attendance.apk"
Copy-Item $apk.FullName $serveFile -Force

$ip = Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue |
    Where-Object {
        $_.IPAddress -notlike "127.*" -and
        $_.IPAddress -notlike "169.254.*" -and
        $_.PrefixOrigin -ne "WellKnown"
    } |
    Where-Object { $_.InterfaceAlias -match "Wi-Fi|WLAN|무선" } |
    Select-Object -First 1 -ExpandProperty IPAddress

if (-not $ip) {
    $ip = Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue |
        Where-Object { $_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.254.*" } |
        Select-Object -First 1 -ExpandProperty IPAddress
}

if (-not $ip) {
    Write-Host "[ERROR] Could not detect PC Wi-Fi IP. Run ipconfig and use IPv4 manually." -ForegroundColor Red
    exit 1
}

$url = "http://${ip}:${Port}/hanwha-attendance.apk"

Write-Host ""
Write-Host "=== APK download server ===" -ForegroundColor Cyan
Write-Host "Phone browser (Chrome) open this URL:" -ForegroundColor Yellow
Write-Host $url -ForegroundColor Green
Write-Host ""
Write-Host "Rules:" -ForegroundColor Gray
Write-Host "  - Phone and PC must use the SAME Wi-Fi"
Write-Host "  - If download fails, allow Windows Firewall when prompted"
Write-Host "  - Press Ctrl+C here to stop server"
Write-Host ""

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://${ip}:${Port}/")
$listener.Start()

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $path = [Uri]::UnescapeDataString($request.Url.AbsolutePath).TrimStart("/")
        if ([string]::IsNullOrWhiteSpace($path)) { $path = "hanwha-attendance.apk" }

        $filePath = Join-Path $serveDir $path
        if (-not (Test-Path $filePath)) {
            $response.StatusCode = 404
            $bytes = [Text.Encoding]::UTF8.GetBytes("Not found")
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
            $response.Close()
            continue
        }

        $bytes = [System.IO.File]::ReadAllBytes($filePath)
        $response.ContentType = "application/vnd.android.package-archive"
        $response.ContentLength64 = $bytes.Length
        $response.AddHeader("Content-Disposition", "attachment; filename=hanwha-attendance.apk")
        $response.OutputStream.Write($bytes, 0, $bytes.Length)
        $response.Close()

        Write-Host "[OK] Sent APK to $($request.RemoteEndPoint)" -ForegroundColor Green
    }
} finally {
    $listener.Stop()
    $listener.Close()
}

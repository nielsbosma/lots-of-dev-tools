$port = 5173
while (Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue) {
    $port++
}

Write-Host "Starting dev server on port $port..." -ForegroundColor Green
Start-Process "http://localhost:$port"
npm run dev -- --port $port

Write-Host "================================"
Write-Host "Spor Okulu CRM - Basit Baslatici"
Write-Host "================================"
Write-Host ""

Write-Host "Node.js kontrol ediliyor..."
try {
    $nodeVersion = node --version
    Write-Host "Node.js bulundu: $nodeVersion"
} catch {
    Write-Host "HATA: Node.js bulunamadi!"
    Read-Host "Devam etmek icin Enter basin"
    exit 1
}

Write-Host ""
Write-Host "NPM kontrol ediliyor..."
try {
    $npmVersion = npm --version
    Write-Host "NPM bulundu: $npmVersion"
} catch {
    Write-Host "HATA: NPM bulunamadi!"
    Read-Host "Devam etmek icin Enter basin"
    exit 1
}

Write-Host ""
Write-Host "Bagimliliklar kontrol ediliyor..."
if (-not (Test-Path "node_modules")) {
    Write-Host "npm install calistiriliyor..."
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "HATA: npm install basarisiz!"
        Read-Host "Devam etmek icin Enter basin"
        exit 1
    }
}

Write-Host ""
Write-Host "Port 3000 temizleniyor..."
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force

Write-Host ""
Write-Host "================================"
Write-Host "Uygulama baslatiliyor..."
Write-Host "http://localhost:3000 adresine gidin"
Write-Host "================================"
Write-Host ""
Write-Host "Giris bilgileri:"
Write-Host "Email: yavuz@g7spor.org"
Write-Host "Sifre: 444125yA/"
Write-Host ""

npm run dev

Read-Host "Devam etmek icin Enter basin"
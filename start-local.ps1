# Spor Okulu CRM - PowerShell Başlatma Scripti
# Bu script Windows Defender tarafından daha güvenli kabul edilir

Write-Host "================================" -ForegroundColor Green
Write-Host "Spor Okulu CRM - PowerShell Başlatma" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""

# Node.js kontrolü
Write-Host "Node.js versiyonu kontrol ediliyor..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "Node.js bulundu: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "HATA: Node.js bulunamadı! Lütfen Node.js 20.x yükleyin." -ForegroundColor Red
    Write-Host "İndirme linki: https://nodejs.org/" -ForegroundColor Cyan
    Read-Host "Devam etmek için Enter'a basın"
    exit 1
}

# Paket yöneticisi kontrolü
Write-Host ""
Write-Host "Paket yöneticisi kontrol ediliyor..." -ForegroundColor Yellow

$packageManager = "npm"
try {
    $pnpmVersion = pnpm --version
    Write-Host "PNPM bulundu: $pnpmVersion" -ForegroundColor Green
    $packageManager = "pnpm"
} catch {
    Write-Host "PNPM bulunamadı, NPM kullanılacak..." -ForegroundColor Yellow
    try {
        $npmVersion = npm --version
        Write-Host "NPM bulundu: $npmVersion" -ForegroundColor Green
    } catch {
        Write-Host "HATA: NPM de bulunamadı! Node.js kurulumunu kontrol edin." -ForegroundColor Red
        Read-Host "Devam etmek için Enter'a basın"
        exit 1
    }
}

# .env.local dosyası kontrolü
Write-Host ""
Write-Host "Çevre değişkenleri kontrol ediliyor..." -ForegroundColor Yellow
if (-not (Test-Path ".env.local")) {
    Write-Host ".env.local dosyası bulunamadı!" -ForegroundColor Yellow
    if (Test-Path ".env.local.example") {
        Write-Host ".env.local.example dosyasından kopyalanıyor..." -ForegroundColor Yellow
        Copy-Item ".env.local.example" ".env.local"
        Write-Host ".env.local dosyası oluşturuldu!" -ForegroundColor Green
        Write-Host "Lütfen .env.local dosyasını düzenleyip kendi ayarlarınızı girin." -ForegroundColor Cyan
    } else {
        Write-Host "UYARI: .env.local.example dosyası bulunamadı!" -ForegroundColor Red
        Write-Host "Lütfen .env.local dosyasını manuel olarak oluşturun." -ForegroundColor Cyan
    }
} else {
    Write-Host ".env.local dosyası mevcut." -ForegroundColor Green
}

# node_modules kontrolü
Write-Host ""
Write-Host "Bağımlılıklar kontrol ediliyor..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    Write-Host "node_modules bulunamadı, bağımlılıklar yükleniyor..." -ForegroundColor Yellow
    & $packageManager install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "HATA: Bağımlılıklar yüklenemedi!" -ForegroundColor Red
        Read-Host "Devam etmek için Enter'a basın"
        exit 1
    }
    Write-Host "Bağımlılıklar başarıyla yüklendi!" -ForegroundColor Green
} else {
    Write-Host "Bağımlılıklar mevcut." -ForegroundColor Green
}

# Uygulamayı başlat
Write-Host ""
Write-Host "================================" -ForegroundColor Green
Write-Host "Uygulama başlatılıyor..." -ForegroundColor Green
Write-Host "Tarayıcınızda http://localhost:3000 adresine gidin" -ForegroundColor Cyan
Write-Host "Durdurmak için Ctrl+C basın" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Green
Write-Host ""

if ($packageManager -eq "npm") {
    & $packageManager run dev:local-win
} else {
    & $packageManager run dev:local
}

Read-Host "Uygulama durduruldu. Çıkmak için Enter'a basın"
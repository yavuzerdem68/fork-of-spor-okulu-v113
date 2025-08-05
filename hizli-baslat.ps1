# Hızlı Başlatma Scripti
# Bu script projeyi hızlıca başlatır

Write-Host "================================" -ForegroundColor Cyan
Write-Host "   HIZLI BAŞLATMA SCRIPTI" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Bu script projeyi hızlıca başlatır." -ForegroundColor Green
Write-Host "Sorun yaşarsanız 'lokal-fix.ps1' çalıştırın." -ForegroundColor Yellow
Write-Host ""

# Node.js kontrolü
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js versiyonu: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js kurulu değil!" -ForegroundColor Red
    Write-Host "https://nodejs.org adresinden Node.js 20.x indirin" -ForegroundColor Yellow
    Read-Host "Devam etmek için Enter basın"
    exit 1
}

# node_modules kontrolü
if (-not (Test-Path "node_modules")) {
    Write-Host "node_modules bulunamadı. Bağımlılıklar yükleniyor..." -ForegroundColor Yellow
    try {
        npm install
        Write-Host "✓ Bağımlılıklar yüklendi" -ForegroundColor Green
    } catch {
        Write-Host "✗ npm install başarısız!" -ForegroundColor Red
        Write-Host "'lokal-fix.ps1' çalıştırın" -ForegroundColor Yellow
        Read-Host "Devam etmek için Enter basın"
        exit 1
    }
}

# .env.local kontrolü
if (-not (Test-Path ".env.local")) {
    if (Test-Path ".env.local.example") {
        Write-Host ".env.local oluşturuluyor..." -ForegroundColor Yellow
        Copy-Item ".env.local.example" ".env.local"
        Write-Host "✓ .env.local oluşturuldu" -ForegroundColor Green
    } else {
        Write-Host "Temel .env.local oluşturuluyor..." -ForegroundColor Yellow
        $envContent = @"
# Masaüstü Spor Okulu CRM - Lokal Çevre Değişkenleri
NEXT_PUBLIC_CO_DEV_ENV=desktop
"@
        $envContent | Out-File -FilePath ".env.local" -Encoding UTF8
        Write-Host "✓ Temel .env.local oluşturuldu" -ForegroundColor Green
    }
}

# Cache temizleme (opsiyonel)
if (Test-Path ".next") {
    Write-Host "Eski cache temizleniyor..." -ForegroundColor Yellow
    Remove-Item -Path ".next" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "✓ Cache temizlendi" -ForegroundColor Green
}

Write-Host ""
Write-Host "================================" -ForegroundColor Green
Write-Host "   PROJE BAŞLATILIYOR" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""

Write-Host "Geliştirme sunucusu başlatılıyor..." -ForegroundColor Cyan
Write-Host "Tarayıcıda http://localhost:3000 açılacak" -ForegroundColor White
Write-Host ""
Write-Host "Giriş bilgileri:" -ForegroundColor Yellow
Write-Host "Email: yavuz@g7spor.org" -ForegroundColor White
Write-Host "Şifre: 444125yA/" -ForegroundColor White
Write-Host ""
Write-Host "Durdurmak için Ctrl+C basın" -ForegroundColor Red
Write-Host ""

# Geliştirme sunucusunu başlat
npm run dev
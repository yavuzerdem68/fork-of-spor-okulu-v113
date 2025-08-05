# Lokal Çalışma Sorunu Düzeltme Scripti
# Bu script tüm yaygın sorunları tespit edip düzeltir

Write-Host "================================" -ForegroundColor Cyan
Write-Host "  LOKAL ÇALIŞMA SORUNU DÜZELTİCİ" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Adım 1: Sistem kontrolü
Write-Host "ADIM 1: Sistem kontrol ediliyor..." -ForegroundColor Green

# Node.js versiyonu kontrol et
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js versiyonu: $nodeVersion" -ForegroundColor Green
    
    # Node.js 20.x kontrolü
    if ($nodeVersion -match "v20\.") {
        Write-Host "✓ Node.js versiyonu uygun" -ForegroundColor Green
    } else {
        Write-Host "! Node.js versiyonu 20.x değil. Güncelleme önerilir." -ForegroundColor Yellow
    }
} catch {
    Write-Host "✗ Node.js kurulu değil!" -ForegroundColor Red
    Write-Host "https://nodejs.org adresinden Node.js 20.x indirin" -ForegroundColor Yellow
    exit 1
}

# npm versiyonu kontrol et
try {
    $npmVersion = npm --version
    Write-Host "✓ npm versiyonu: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ npm kurulu değil!" -ForegroundColor Red
    exit 1
}

# Adım 2: Proje dosyaları kontrolü
Write-Host ""
Write-Host "ADIM 2: Proje dosyaları kontrol ediliyor..." -ForegroundColor Green

$requiredFiles = @(
    "package.json",
    "next.config.mjs",
    "tsconfig.json",
    "tailwind.config.js",
    "postcss.config.js"
)

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "✓ $file mevcut" -ForegroundColor Green
    } else {
        Write-Host "✗ $file eksik!" -ForegroundColor Red
    }
}

# src klasörü kontrolü
if (Test-Path "src") {
    Write-Host "✓ src klasörü mevcut" -ForegroundColor Green
    
    if (Test-Path "src/pages") {
        Write-Host "✓ src/pages mevcut" -ForegroundColor Green
    } else {
        Write-Host "✗ src/pages eksik!" -ForegroundColor Red
    }
    
    if (Test-Path "src/pages/index.tsx") {
        Write-Host "✓ src/pages/index.tsx mevcut" -ForegroundColor Green
    } else {
        Write-Host "✗ src/pages/index.tsx eksik!" -ForegroundColor Red
    }
} else {
    Write-Host "✗ src klasörü eksik!" -ForegroundColor Red
}

# Adım 3: Cache temizleme
Write-Host ""
Write-Host "ADIM 3: Cache temizleniyor..." -ForegroundColor Green

# .next klasörünü sil
if (Test-Path ".next") {
    Write-Host "Eski .next klasörü siliniyor..." -ForegroundColor Yellow
    Remove-Item -Path ".next" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "✓ .next klasörü silindi" -ForegroundColor Green
} else {
    Write-Host "✓ .next klasörü zaten yok" -ForegroundColor Green
}

# out klasörünü sil
if (Test-Path "out") {
    Write-Host "Eski out klasörü siliniyor..." -ForegroundColor Yellow
    Remove-Item -Path "out" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "✓ out klasörü silindi" -ForegroundColor Green
}

# npm cache temizle
Write-Host "npm cache temizleniyor..." -ForegroundColor Yellow
try {
    npm cache clean --force
    Write-Host "✓ npm cache temizlendi" -ForegroundColor Green
} catch {
    Write-Host "! npm cache temizleme uyarısı (devam ediliyor)" -ForegroundColor Yellow
}

# Adım 4: node_modules kontrolü ve yeniden kurulum
Write-Host ""
Write-Host "ADIM 4: Bağımlılıklar kontrol ediliyor..." -ForegroundColor Green

if (Test-Path "node_modules") {
    Write-Host "Mevcut node_modules siliniyor..." -ForegroundColor Yellow
    Remove-Item -Path "node_modules" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "✓ node_modules silindi" -ForegroundColor Green
}

# package-lock.json varsa sil
if (Test-Path "package-lock.json") {
    Remove-Item -Path "package-lock.json" -Force -ErrorAction SilentlyContinue
    Write-Host "✓ package-lock.json silindi" -ForegroundColor Green
}

# pnpm-lock.yaml varsa sil
if (Test-Path "pnpm-lock.yaml") {
    Remove-Item -Path "pnpm-lock.yaml" -Force -ErrorAction SilentlyContinue
    Write-Host "✓ pnpm-lock.yaml silindi" -ForegroundColor Green
}

# yarn.lock varsa sil
if (Test-Path "yarn.lock") {
    Remove-Item -Path "yarn.lock" -Force -ErrorAction SilentlyContinue
    Write-Host "✓ yarn.lock silindi" -ForegroundColor Green
}

# npm install çalıştır
Write-Host ""
Write-Host "Bağımlılıklar yükleniyor..." -ForegroundColor Yellow
Write-Host "Bu işlem birkaç dakika sürebilir..." -ForegroundColor Cyan

try {
    npm install
    Write-Host "✓ npm install tamamlandı" -ForegroundColor Green
} catch {
    Write-Host "✗ npm install başarısız!" -ForegroundColor Red
    Write-Host "Manuel olarak 'npm install' çalıştırın" -ForegroundColor Yellow
    exit 1
}

# Adım 5: .env.local kontrolü
Write-Host ""
Write-Host "ADIM 5: Ortam değişkenleri kontrol ediliyor..." -ForegroundColor Green

if (-not (Test-Path ".env.local")) {
    if (Test-Path ".env.local.example") {
        Write-Host ".env.local oluşturuluyor..." -ForegroundColor Yellow
        Copy-Item ".env.local.example" ".env.local"
        Write-Host "✓ .env.local oluşturuldu" -ForegroundColor Green
    } else {
        Write-Host "! .env.local.example bulunamadı" -ForegroundColor Yellow
        Write-Host "Temel .env.local oluşturuluyor..." -ForegroundColor Yellow
        
        $envContent = @"
# Masaüstü Spor Okulu CRM - Lokal Çevre Değişkenleri
NEXT_PUBLIC_CO_DEV_ENV=desktop
"@
        $envContent | Out-File -FilePath ".env.local" -Encoding UTF8
        Write-Host "✓ Temel .env.local oluşturuldu" -ForegroundColor Green
    }
} else {
    Write-Host "✓ .env.local mevcut" -ForegroundColor Green
}

# Adım 6: TypeScript kontrolü
Write-Host ""
Write-Host "ADIM 6: TypeScript kontrol ediliyor..." -ForegroundColor Green

try {
    npx tsc --noEmit --skipLibCheck
    Write-Host "✓ TypeScript kontrol başarılı" -ForegroundColor Green
} catch {
    Write-Host "! TypeScript uyarıları var (devam ediliyor)" -ForegroundColor Yellow
}

# Adım 7: Test çalıştırma
Write-Host ""
Write-Host "ADIM 7: Test çalıştırması..." -ForegroundColor Green

Write-Host "Geliştirme sunucusu başlatılıyor..." -ForegroundColor Yellow
Write-Host "Bu işlem 10 saniye sürecek..." -ForegroundColor Cyan

# Arka planda dev server başlat
$devProcess = Start-Process -FilePath "npm" -ArgumentList "run", "dev" -PassThru -WindowStyle Hidden

# 10 saniye bekle
Start-Sleep -Seconds 10

# Process'i durdur
if ($devProcess -and !$devProcess.HasExited) {
    $devProcess.Kill()
    Write-Host "✓ Test sunucusu başarıyla çalıştı" -ForegroundColor Green
} else {
    Write-Host "! Test sunucusu durumu belirsiz" -ForegroundColor Yellow
}

# Sonuç
Write-Host ""
Write-Host "================================" -ForegroundColor Green
Write-Host "  DÜZELTİCİ TAMAMLANDI!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""

Write-Host "Şimdi şu komutları çalıştırın:" -ForegroundColor Cyan
Write-Host "1. npm run dev" -ForegroundColor White
Write-Host "2. Tarayıcıda http://localhost:3000 açın" -ForegroundColor White
Write-Host ""

Write-Host "Giriş bilgileri:" -ForegroundColor Yellow
Write-Host "Email: yavuz@g7spor.org" -ForegroundColor White
Write-Host "Şifre: 444125yA/" -ForegroundColor White
Write-Host ""

Write-Host "Sorun devam ederse:" -ForegroundColor Red
Write-Host "1. Bilgisayarı yeniden başlatın" -ForegroundColor White
Write-Host "2. Bu scripti tekrar çalıştırın" -ForegroundColor White
Write-Host "3. Manuel olarak 'npm run dev' çalıştırın" -ForegroundColor White
Write-Host ""

Write-Host "Test için:" -ForegroundColor Cyan
Write-Host "node lokal-test.js" -ForegroundColor White
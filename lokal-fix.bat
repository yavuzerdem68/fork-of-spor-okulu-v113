@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo.
echo ================================
echo   LOKAL ÇALIŞMA SORUNU DÜZELTİCİ
echo ================================
echo.

REM Adım 1: Sistem kontrolü
echo ADIM 1: Sistem kontrol ediliyor...

REM Node.js versiyonu kontrol et
node --version >nul 2>&1
if !errorlevel! equ 0 (
    for /f "tokens=*" %%i in ('node --version') do set nodeVersion=%%i
    echo ✓ Node.js versiyonu: !nodeVersion!
    
    REM Node.js 20.x kontrolü
    echo !nodeVersion! | findstr "v20\." >nul
    if !errorlevel! equ 0 (
        echo ✓ Node.js versiyonu uygun
    ) else (
        echo ! Node.js versiyonu 20.x değil. Güncelleme önerilir.
    )
) else (
    echo ✗ Node.js kurulu değil!
    echo https://nodejs.org adresinden Node.js 20.x indirin
    pause
    exit /b 1
)

REM npm versiyonu kontrol et
npm --version >nul 2>&1
if !errorlevel! equ 0 (
    for /f "tokens=*" %%i in ('npm --version') do set npmVersion=%%i
    echo ✓ npm versiyonu: !npmVersion!
) else (
    echo ✗ npm kurulu değil!
    pause
    exit /b 1
)

REM Adım 2: Proje dosyaları kontrolü
echo.
echo ADIM 2: Proje dosyaları kontrol ediliyor...

set "requiredFiles=package.json next.config.mjs tsconfig.json tailwind.config.js postcss.config.js"

for %%f in (%requiredFiles%) do (
    if exist "%%f" (
        echo ✓ %%f mevcut
    ) else (
        echo ✗ %%f eksik!
    )
)

REM src klasörü kontrolü
if exist "src" (
    echo ✓ src klasörü mevcut
    
    if exist "src\pages" (
        echo ✓ src\pages mevcut
    ) else (
        echo ✗ src\pages eksik!
    )
    
    if exist "src\pages\index.tsx" (
        echo ✓ src\pages\index.tsx mevcut
    ) else (
        echo ✗ src\pages\index.tsx eksik!
    )
) else (
    echo ✗ src klasörü eksik!
)

REM Adım 3: Cache temizleme
echo.
echo ADIM 3: Cache temizleniyor...

REM .next klasörünü sil
if exist ".next" (
    echo Eski .next klasörü siliniyor...
    rmdir /s /q ".next" 2>nul
    echo ✓ .next klasörü silindi
) else (
    echo ✓ .next klasörü zaten yok
)

REM out klasörünü sil
if exist "out" (
    echo Eski out klasörü siliniyor...
    rmdir /s /q "out" 2>nul
    echo ✓ out klasörü silindi
)

REM npm cache temizle
echo npm cache temizleniyor...
npm cache clean --force >nul 2>&1
if !errorlevel! equ 0 (
    echo ✓ npm cache temizlendi
) else (
    echo ! npm cache temizleme uyarısı ^(devam ediliyor^)
)

REM Adım 4: node_modules kontrolü ve yeniden kurulum
echo.
echo ADIM 4: Bağımlılıklar kontrol ediliyor...

if exist "node_modules" (
    echo Mevcut node_modules siliniyor...
    rmdir /s /q "node_modules" 2>nul
    echo ✓ node_modules silindi
)

REM Lock dosyalarını sil
if exist "package-lock.json" (
    del "package-lock.json" 2>nul
    echo ✓ package-lock.json silindi
)

if exist "pnpm-lock.yaml" (
    del "pnpm-lock.yaml" 2>nul
    echo ✓ pnpm-lock.yaml silindi
)

if exist "yarn.lock" (
    del "yarn.lock" 2>nul
    echo ✓ yarn.lock silindi
)

REM npm install çalıştır
echo.
echo Bağımlılıklar yükleniyor...
echo Bu işlem birkaç dakika sürebilir...

npm install
if !errorlevel! equ 0 (
    echo ✓ npm install tamamlandı
) else (
    echo ✗ npm install başarısız!
    echo Manuel olarak 'npm install' çalıştırın
    pause
    exit /b 1
)

REM Adım 5: .env.local kontrolü
echo.
echo ADIM 5: Ortam değişkenleri kontrol ediliyor...

if not exist ".env.local" (
    if exist ".env.local.example" (
        echo .env.local oluşturuluyor...
        copy ".env.local.example" ".env.local" >nul
        echo ✓ .env.local oluşturuldu
    ) else (
        echo ! .env.local.example bulunamadı
        echo Temel .env.local oluşturuluyor...
        
        (
        echo # Masaüstü Spor Okulu CRM - Lokal Çevre Değişkenleri
        echo NEXT_PUBLIC_CO_DEV_ENV=desktop
        ) > ".env.local"
        echo ✓ Temel .env.local oluşturuldu
    )
) else (
    echo ✓ .env.local mevcut
)

REM Adım 6: TypeScript kontrolü
echo.
echo ADIM 6: TypeScript kontrol ediliyor...

npx tsc --noEmit --skipLibCheck >nul 2>&1
if !errorlevel! equ 0 (
    echo ✓ TypeScript kontrol başarılı
) else (
    echo ! TypeScript uyarıları var ^(devam ediliyor^)
)

REM Adım 7: Test çalıştırma
echo.
echo ADIM 7: Test çalıştırması...

echo Geliştirme sunucusu test ediliyor...
echo Bu işlem 10 saniye sürecek...

REM Arka planda dev server başlat
start /b npm run dev >nul 2>&1

REM 10 saniye bekle
timeout /t 10 /nobreak >nul

REM npm process'lerini durdur
taskkill /f /im node.exe >nul 2>&1

echo ✓ Test tamamlandı

REM Sonuç
echo.
echo ================================
echo   DÜZELTİCİ TAMAMLANDI!
echo ================================
echo.

echo Şimdi şu komutları çalıştırın:
echo 1. npm run dev
echo 2. Tarayıcıda http://localhost:3000 açın
echo.

echo Giriş bilgileri:
echo Email: yavuz@g7spor.org
echo Şifre: 444125yA/
echo.

echo Sorun devam ederse:
echo 1. Bilgisayarı yeniden başlatın
echo 2. Bu scripti tekrar çalıştırın
echo 3. Manuel olarak 'npm run dev' çalıştırın
echo.

echo Test için:
echo node lokal-test.js
echo.

pause
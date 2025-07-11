@echo off
echo ================================
echo Acil Durum Baslatma Scripti
echo ================================
echo.
echo Bu script en basit yontemle uygulamayi baslatir.
echo.

REM Basit Node.js kontrolu
echo Node.js kontrol ediliyor...
node --version
if %errorlevel% neq 0 (
    echo HATA: Node.js bulunamadi!
    echo Lutfen https://nodejs.org/ adresinden Node.js yukleyin.
    pause
    exit /b 1
)

echo.
echo .env.local dosyasi kontrol ediliyor...
if not exist ".env.local" (
    if exist ".env.local.example" (
        echo .env.local.example dosyasi .env.local olarak kopyalaniyor...
        copy ".env.local.example" ".env.local"
    ) else (
        echo UYARI: .env.local dosyasi bulunamadi!
        echo Lutfen .env.local dosyasini manuel olarak olusturun.
    )
)

echo.
echo Bagimliliklar yukleniyor (NPM ile)...
npm install
if %errorlevel% neq 0 (
    echo HATA: Bagimliliklar yuklenemedi!
    echo.
    echo Alternatif cozumler:
    echo 1. diagnose-nodejs.bat scriptini calistirin
    echo 2. Node.js'i yeniden yukleyin
    echo 3. Bilgisayari yeniden baslatip tekrar deneyin
    pause
    exit /b 1
)

echo.
echo ================================
echo Uygulama baslatiliyor...
echo Tarayicinizda http://localhost:3000 adresine gidin
echo Durdurmak icin Ctrl+C basin
echo ================================
echo.

REM En basit baslatma komutu
npm run dev:local-win

pause
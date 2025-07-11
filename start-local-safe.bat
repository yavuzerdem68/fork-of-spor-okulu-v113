@echo off
echo ================================
echo Spor Okulu CRM - Guvenli Baslatma
echo ================================
echo.
echo Bu script Windows Defender tarafindan guvenli kabul edilir.
echo.

REM Node.js kontrolu
echo Node.js versiyonu kontrol ediliyor...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo HATA: Node.js bulunamadi! Lutfen Node.js 20.x yukleyin.
    echo Indirme linki: https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js bulundu: 
node --version

REM Paket yoneticisi kontrolu (otomatik yukleme yok)
echo.
echo Paket yoneticisi kontrol ediliyor...
pnpm --version >nul 2>&1
if %errorlevel% equ 0 (
    echo PNPM bulundu: 
    pnpm --version
    set PACKAGE_MANAGER=pnpm
) else (
    echo PNPM bulunamadi, NPM kullanilacak...
    npm --version >nul 2>&1
    if %errorlevel% neq 0 (
        echo HATA: NPM de bulunamadi! Node.js kurulumunu kontrol edin.
        pause
        exit /b 1
    )
    echo NPM bulundu: 
    npm --version
    set PACKAGE_MANAGER=npm
)

REM .env.local dosyasi kontrolu
echo.
echo Cevre degiskenleri kontrol ediliyor...
if not exist ".env.local" (
    echo .env.local dosyasi bulunamadi!
    if exist ".env.local.example" (
        echo Lutfen .env.local.example dosyasini .env.local olarak kopyalayin.
        echo Veya asagidaki komutu calistirin:
        echo copy ".env.local.example" ".env.local"
    ) else (
        echo UYARI: .env.local.example dosyasi bulunamadi!
        echo Lutfen .env.local dosyasini manuel olarak olusturun.
    )
    echo.
    echo Devam etmek icin bir tusa basin...
    pause >nul
)

REM node_modules kontrolu
echo.
echo Bagimliliklar kontrol ediliyor...
if not exist "node_modules" (
    echo node_modules bulunamadi, bagimliliklar yukleniyor...
    %PACKAGE_MANAGER% install
    if %errorlevel% neq 0 (
        echo HATA: Bagimliliklar yuklenemedi!
        pause
        exit /b 1
    )
) else (
    echo Bagimliliklar mevcut.
)

REM Uygulamayi baslat
echo.
echo ================================
echo Uygulama baslatiliyor...
echo Tarayicinizda http://localhost:3000 adresine gidin
echo Durdurmak icin Ctrl+C basin
echo ================================
echo.

%PACKAGE_MANAGER% run dev:local

pause
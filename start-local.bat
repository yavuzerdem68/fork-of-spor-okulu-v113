@echo off
echo ================================
echo Spor Okulu CRM - Lokal Baslatma
echo ================================
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

REM PNPM kontrolu
echo.
echo PNPM kontrol ediliyor...
pnpm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo PNPM bulunamadi, NPM kullanilacak...
    set PACKAGE_MANAGER=npm
) else (
    echo PNPM bulundu: 
    pnpm --version
    set PACKAGE_MANAGER=pnpm
)

REM .env.local dosyasi kontrolu
echo.
echo Cevre degiskenleri kontrol ediliyor...
if not exist ".env.local" (
    echo .env.local dosyasi bulunamadi!
    echo .env.local.example dosyasindan kopyalaniyor...
    copy ".env.local.example" ".env.local" >nul 2>&1
    if %errorlevel% neq 0 (
        echo UYARI: .env.local.example dosyasi bulunamadi!
        echo Lutfen .env.local dosyasini manuel olarak olusturun.
    ) else (
        echo .env.local dosyasi olusturuldu!
        echo Lutfen .env.local dosyasini duzenleyip kendi ayarlarinizi girin.
    )
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
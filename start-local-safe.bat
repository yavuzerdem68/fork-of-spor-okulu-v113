@echo off
setlocal enabledelayedexpansion

echo ================================
echo Spor Okulu CRM - Guvenli Baslatma
echo ================================
echo.
echo Bu script Windows Defender tarafindan guvenli kabul edilir.
echo.

REM Node.js kontrolu
echo Node.js versiyonu kontrol ediliyor...
node --version >nul 2>&1
if !errorlevel! neq 0 (
    echo HATA: Node.js bulunamadi! Lutfen Node.js 20.x yukleyin.
    echo Indirme linki: https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js bulundu: 
node --version

REM Paket yoneticisi kontrolu
echo.
echo Paket yoneticisi kontrol ediliyor...
pnpm --version >nul 2>&1
if !errorlevel! equ 0 (
    echo PNPM bulundu: 
    pnpm --version
    set "PACKAGE_MANAGER=pnpm"
    goto :package_manager_found
)

echo PNPM bulunamadi, NPM kullanilacak...

REM NPM kontrolu - basit yontem
npm --version >nul 2>&1
if !errorlevel! equ 0 (
    echo NPM bulundu: 
    npm --version
    set "PACKAGE_MANAGER=npm"
    goto :package_manager_found
)

REM NPM PATH'te bulunamadi, alternatif yollar denenecek
echo UYARI: NPM PATH'te bulunamadi!
echo Node.js kurulum dizinini kontrol ediliyor...

REM Node.js yolunu bul
where node >nul 2>&1
if !errorlevel! neq 0 (
    echo HATA: Node.js PATH'te bulunamadi!
    goto :npm_not_found
)

for /f "tokens=*" %%i in ('where node') do (
    set "NODE_FULL_PATH=%%i"
    goto :process_node_path
)

:process_node_path
for %%j in ("!NODE_FULL_PATH!") do set "NODE_DIR=%%~dpj"

echo Node.js dizini: !NODE_DIR!

REM NPM'i cesitli konumlarda ara
set "NPM_FOUND=0"

if exist "!NODE_DIR!npm.cmd" (
    echo NPM bulundu: !NODE_DIR!npm.cmd
    set "PACKAGE_MANAGER=!NODE_DIR!npm.cmd"
    set "NPM_FOUND=1"
    goto :test_npm
)

if exist "!NODE_DIR!npm.bat" (
    echo NPM bulundu: !NODE_DIR!npm.bat
    set "PACKAGE_MANAGER=!NODE_DIR!npm.bat"
    set "NPM_FOUND=1"
    goto :test_npm
)

if exist "!NODE_DIR!npm" (
    echo NPM bulundu: !NODE_DIR!npm
    set "PACKAGE_MANAGER=!NODE_DIR!npm"
    set "NPM_FOUND=1"
    goto :test_npm
)

if exist "!NODE_DIR!node_modules\npm\bin\npm-cli.js" (
    echo NPM bulundu: !NODE_DIR!node_modules\npm\bin\npm-cli.js
    set "PACKAGE_MANAGER=node !NODE_DIR!node_modules\npm\bin\npm-cli.js"
    set "NPM_FOUND=1"
    goto :test_npm
)

:npm_not_found
echo HATA: NPM hicbir konumda bulunamadi!
echo.
echo Node.js kurulumunuz eksik gorunuyor.
echo.
echo Cozum onerileri:
echo 1. diagnose-nodejs.bat scriptini calistirin
echo 2. Node.js'i https://nodejs.org/ adresinden yeniden yukleyin
echo 3. emergency-start.bat scriptini deneyin
echo 4. Bilgisayari yeniden baslatip tekrar deneyin
pause
exit /b 1

:test_npm
echo NPM versiyonu kontrol ediliyor...
!PACKAGE_MANAGER! --version >nul 2>&1
if !errorlevel! neq 0 (
    echo UYARI: NPM bulundu ama calismiyor!
    echo Acil durum scripti kullanilacak...
    echo.
    echo emergency-start.bat scriptini calistirmayi deneyin.
    pause
    exit /b 1
)

echo NPM versiyonu: 
!PACKAGE_MANAGER! --version

:package_manager_found

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
    !PACKAGE_MANAGER! install
    if !errorlevel! neq 0 (
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

!PACKAGE_MANAGER! run dev:local-win

pause
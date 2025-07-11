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

REM NPM kontrolu - timeout ile
echo NPM kontrol ediliyor...
echo NPM versiyonu aliniyor (timeout: 10 saniye)...

REM Timeout ile npm version kontrolu
timeout /t 1 /nobreak >nul
npm --version >temp_npm_version.txt 2>&1
if !errorlevel! equ 0 (
    echo NPM bulundu:
    type temp_npm_version.txt
    del temp_npm_version.txt >nul 2>&1
    set "PACKAGE_MANAGER=npm"
    goto :package_manager_found
)

echo NPM standart yolda bulunamadi veya calismiyor.
del temp_npm_version.txt >nul 2>&1

REM NPM PATH'te bulunamadi, alternatif yollar denenecek
echo UYARI: NPM PATH'te bulunamadi!
echo Node.js kurulum dizinini kontrol ediliyor...

REM Node.js yolunu bul
where node >temp_node_path.txt 2>&1
if !errorlevel! neq 0 (
    echo HATA: Node.js PATH'te bulunamadi!
    del temp_node_path.txt >nul 2>&1
    goto :npm_not_found
)

echo Node.js yolu bulunuyor...
set /p NODE_FULL_PATH=<temp_node_path.txt
del temp_node_path.txt >nul 2>&1

echo Node.js tam yolu: !NODE_FULL_PATH!
for %%j in ("!NODE_FULL_PATH!") do set "NODE_DIR=%%~dpj"

echo Node.js dizini: !NODE_DIR!

REM NPM'i cesitli konumlarda ara
echo NPM aranıyor...
set "NPM_FOUND=0"

echo Kontrol ediliyor: !NODE_DIR!npm.cmd
if exist "!NODE_DIR!npm.cmd" (
    echo NPM bulundu: !NODE_DIR!npm.cmd
    set "PACKAGE_MANAGER=!NODE_DIR!npm.cmd"
    set "NPM_FOUND=1"
    goto :test_npm
)

echo Kontrol ediliyor: !NODE_DIR!npm.bat
if exist "!NODE_DIR!npm.bat" (
    echo NPM bulundu: !NODE_DIR!npm.bat
    set "PACKAGE_MANAGER=!NODE_DIR!npm.bat"
    set "NPM_FOUND=1"
    goto :test_npm
)

echo Kontrol ediliyor: !NODE_DIR!npm
if exist "!NODE_DIR!npm" (
    echo NPM bulundu: !NODE_DIR!npm
    set "PACKAGE_MANAGER=!NODE_DIR!npm"
    set "NPM_FOUND=1"
    goto :test_npm
)

echo Kontrol ediliyor: !NODE_DIR!node_modules\npm\bin\npm-cli.js
if exist "!NODE_DIR!node_modules\npm\bin\npm-cli.js" (
    echo NPM bulundu: !NODE_DIR!node_modules\npm\bin\npm-cli.js
    set "PACKAGE_MANAGER=node !NODE_DIR!node_modules\npm\bin\npm-cli.js"
    set "NPM_FOUND=1"
    goto :test_npm
)

if !NPM_FOUND! equ 0 goto :npm_not_found

:test_npm
echo NPM versiyonu kontrol ediliyor...
echo Calistiriliyor: !PACKAGE_MANAGER! --version

REM NPM version test with timeout
!PACKAGE_MANAGER! --version >temp_npm_test.txt 2>&1
if !errorlevel! neq 0 (
    echo UYARI: NPM bulundu ama calismiyor!
    echo Hata kodu: !errorlevel!
    if exist temp_npm_test.txt (
        echo Hata detayi:
        type temp_npm_test.txt
        del temp_npm_test.txt >nul 2>&1
    )
    echo.
    echo Acil durum scripti kullanilacak...
    echo emergency-start.bat scriptini calistirmayi deneyin.
    pause
    exit /b 1
)

echo NPM versiyonu: 
type temp_npm_test.txt
del temp_npm_test.txt >nul 2>&1
goto :package_manager_found

:npm_not_found
echo HATA: NPM hicbir konumda bulunamadi!
echo.
echo Node.js kurulumunuz eksik gorunuyor.
echo.
echo Cozum onerileri:
echo 1. diagnose-nodejs.bat scriptini calistirin
echo 2. Node.js'i https://nodejs.org/ adresinden yeniden yukleyin
echo 3. emergency-start.bat scriptini deneyin
echo 4. fix-npm-installation.bat scriptini calistirin
echo 5. Bilgisayari yeniden baslatip tekrar deneyin
echo.
echo Simdi emergency-start.bat scriptini calistirmak ister misiniz? (Y/N)
set /p choice=Seciminiz: 
if /i "!choice!"=="Y" (
    echo emergency-start.bat calistiriliyor...
    call emergency-start.bat
    exit /b 0
)
pause
exit /b 1

:package_manager_found
echo.
echo Paket yoneticisi hazir: !PACKAGE_MANAGER!

REM .env.local dosyasi kontrolu
echo.
echo Cevre degiskenleri kontrol ediliyor...
if not exist ".env.local" (
    echo .env.local dosyasi bulunamadi!
    if exist ".env.local.example" (
        echo .env.local.example dosyasindan .env.local olusturuluyor...
        copy ".env.local.example" ".env.local" >nul 2>&1
        if !errorlevel! equ 0 (
            echo .env.local dosyasi basariyla olusturuldu.
        ) else (
            echo UYARI: .env.local dosyasi olusturulamadi!
            echo Lutfen manuel olarak .env.local.example dosyasini .env.local olarak kopyalayin.
        )
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
    echo Bu islem birkaç dakika surebilir...
    !PACKAGE_MANAGER! install
    if !errorlevel! neq 0 (
        echo HATA: Bagimliliklar yuklenemedi!
        echo Hata kodu: !errorlevel!
        echo.
        echo Cozum onerileri:
        echo 1. Internet baglantinizi kontrol edin
        echo 2. emergency-start.bat scriptini deneyin
        echo 3. Node.js'i yeniden yukleyin
        pause
        exit /b 1
    )
    echo Bagimliliklar basariyla yuklendi.
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

echo Calistiriliyor: !PACKAGE_MANAGER! run dev:local-win
!PACKAGE_MANAGER! run dev:local-win

if !errorlevel! neq 0 (
    echo.
    echo HATA: Uygulama baslatilamadi!
    echo Hata kodu: !errorlevel!
    echo.
    echo Alternatif baslatma yontemleri denenecek...
    echo.
    echo 1. Normal dev scripti deneniyor...
    !PACKAGE_MANAGER! run dev
    if !errorlevel! neq 0 (
        echo.
        echo 2. Emergency start scripti calistiriliyor...
        call emergency-start.bat
    )
)

pause
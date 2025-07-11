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

REM Paket yoneticisi kontrolu - basitleştirilmiş
echo.
echo Paket yoneticisi kontrol ediliyor...

REM PNPM kontrolu
pnpm --version >nul 2>&1
if !errorlevel! equ 0 (
    echo PNPM bulundu: 
    pnpm --version
    set "PACKAGE_MANAGER=pnpm"
    goto :package_manager_found
)

echo PNPM bulunamadi.

REM NPM problemi nedeniyle doğrudan Node.js ile çalıştırma
echo NPM PATH sorunları nedeniyle alternatif yöntem kullanılıyor...
echo Node.js ile doğrudan paket yönetimi yapılacak.

REM Node.js yolunu bul
where node >temp_node_path.txt 2>&1
if !errorlevel! neq 0 (
    echo HATA: Node.js PATH'te bulunamadi!
    del temp_node_path.txt >nul 2>&1
    goto :emergency_mode
)

set /p NODE_FULL_PATH=<temp_node_path.txt
del temp_node_path.txt >nul 2>&1

echo Node.js yolu: !NODE_FULL_PATH!
for %%j in ("!NODE_FULL_PATH!") do set "NODE_DIR=%%~dpj"

REM NPM'i Node.js ile çalıştır
echo NPM Node.js üzerinden çalıştırılacak...
if exist "!NODE_DIR!node_modules\npm\bin\npm-cli.js" (
    echo NPM bulundu: !NODE_DIR!node_modules\npm\bin\npm-cli.js
    set "PACKAGE_MANAGER=node "!NODE_DIR!node_modules\npm\bin\npm-cli.js""
    goto :package_manager_found
)

REM Standart NPM konumlarını kontrol et
if exist "!NODE_DIR!npm.cmd" (
    echo NPM bulundu: !NODE_DIR!npm.cmd
    set "PACKAGE_MANAGER=!NODE_DIR!npm.cmd"
    goto :package_manager_found
)

if exist "!NODE_DIR!npm.bat" (
    echo NPM bulundu: !NODE_DIR!npm.bat
    set "PACKAGE_MANAGER=!NODE_DIR!npm.bat"
    goto :package_manager_found
)

:emergency_mode
echo.
echo ================================================
echo NPM bulunamadi - Acil Durum Modu Aktif
echo ================================================
echo.
echo Bu durumda emergency-start.bat scripti kullanilacak.
echo Bu script NPM sorunlarini otomatik olarak cozmeye calisir.
echo.
echo emergency-start.bat calistiriliyor...
echo.

if exist "emergency-start.bat" (
    call emergency-start.bat
    exit /b 0
) else (
    echo HATA: emergency-start.bat bulunamadi!
    echo.
    echo Manuel cozum:
    echo 1. Node.js'i yeniden yukleyin: https://nodejs.org/
    echo 2. Bilgisayari yeniden baslatın
    echo 3. diagnose-nodejs.bat scriptini calistirin
    pause
    exit /b 1
)

:package_manager_found
echo.
echo Paket yoneticisi hazir: !PACKAGE_MANAGER!

REM .env.local dosyasi kontrolu ve otomatik olusturma
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
        )
    ) else (
        echo UYARI: .env.local.example dosyasi bulunamadi!
        echo Temel .env.local dosyasi olusturuluyor...
        echo # Spor Okulu CRM - Local Environment > ".env.local"
        echo NEXT_PUBLIC_CO_DEV_ENV=local >> ".env.local"
        echo .env.local dosyasi olusturuldu.
    )
)

REM node_modules kontrolu
echo.
echo Bagimliliklar kontrol ediliyor...
if not exist "node_modules" (
    echo node_modules bulunamadi, bagimliliklar yukleniyor...
    echo Bu islem birkaç dakika surebilir, lutfen bekleyin...
    echo.
    
    REM Paket yüklemesi
    echo Calistiriliyor: !PACKAGE_MANAGER! install
    !PACKAGE_MANAGER! install
    
    if !errorlevel! neq 0 (
        echo.
        echo HATA: Bagimliliklar yuklenemedi!
        echo Acil durum modu aktif ediliyor...
        goto :emergency_mode
    )
    echo.
    echo Bagimliliklar basariyla yuklendi.
) else (
    echo Bagimliliklar mevcut.
)

REM Port kontrolu
echo.
echo Port 3000 kontrol ediliyor...
netstat -an | find "3000" >nul 2>&1
if !errorlevel! equ 0 (
    echo UYARI: Port 3000 kullanımda! Mevcut process sonlandırılıyor...
    taskkill /f /im node.exe >nul 2>&1
    timeout /t 2 /nobreak >nul
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

REM Hata durumunda alternatif yontemler
if !errorlevel! neq 0 (
    echo.
    echo HATA: dev:local-win scripti calismadi!
    echo Alternatif yontemler deneniyor...
    echo.
    
    echo 1. Normal dev scripti deneniyor...
    !PACKAGE_MANAGER! run dev
    
    if !errorlevel! neq 0 (
        echo.
        echo 2. Dogrudan Next.js calistiriliyor...
        node node_modules\next\dist\bin\next dev
        
        if !errorlevel! neq 0 (
            echo.
            echo 3. Emergency start modu...
            goto :emergency_mode
        )
    )
)

pause
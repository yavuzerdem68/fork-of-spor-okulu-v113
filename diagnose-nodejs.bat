@echo off
echo ================================
echo Node.js ve NPM Diagnostik Araci
echo ================================
echo.

echo 1. Node.js Kontrolu:
echo -------------------
node --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Node.js bulundu: 
    node --version
    echo ✓ Node.js yolu: 
    where node
) else (
    echo ✗ Node.js bulunamadi!
    echo   Lutfen https://nodejs.org/ adresinden Node.js yukleyin.
)

echo.
echo 2. NPM Kontrolu:
echo ---------------
npm --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ NPM bulundu: 
    npm --version
    echo ✓ NPM yolu: 
    where npm
) else (
    echo ✗ NPM bulunamadi PATH'te!
    
    REM Node.js dizininde npm ara
    for /f "tokens=*" %%i in ('where node 2^>nul') do (
        set NODE_PATH=%%i
        goto :check_npm_in_node_dir
    )
    
    :check_npm_in_node_dir
    if defined NODE_PATH (
        for %%j in ("%NODE_PATH%") do set NODE_DIR=%%~dpj
        echo   Node.js dizini: %NODE_DIR%
        
        if exist "%NODE_DIR%npm.cmd" (
            echo ✓ NPM bulundu Node.js dizininde: %NODE_DIR%npm.cmd
            echo   Versiyon: 
            "%NODE_DIR%npm.cmd" --version
        ) else if exist "%NODE_DIR%npm" (
            echo ✓ NPM bulundu Node.js dizininde: %NODE_DIR%npm
            echo   Versiyon: 
            "%NODE_DIR%npm" --version
        ) else (
            echo ✗ NPM Node.js dizininde bulunamadi!
        )
    )
)

echo.
echo 3. PNPM Kontrolu:
echo ----------------
pnpm --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ PNPM bulundu: 
    pnpm --version
    echo ✓ PNPM yolu: 
    where pnpm
) else (
    echo ✗ PNPM bulunamadi (opsiyonel)
)

echo.
echo 4. PATH Cevre Degiskeni:
echo -----------------------
echo PATH degiskeni:
echo %PATH%

echo.
echo 5. Sistem Bilgileri:
echo -------------------
echo Windows versiyonu: 
ver
echo.
echo Kullanici: %USERNAME%
echo Bilgisayar: %COMPUTERNAME%

echo.
echo ================================
echo Diagnostik tamamlandi!
echo ================================
echo.
echo Sorun devam ediyorsa:
echo 1. Bilgisayari yeniden baslatip tekrar deneyin
echo 2. Node.js'i yeniden yukleyin
echo 3. PATH cevre degiskenini kontrol edin
echo.
pause
@echo off
setlocal enabledelayedexpansion

echo ================================
echo NPM Path Test Script
================================
echo.

REM Node.js yolunu bul
where node >temp_node_path.txt 2>&1
if !errorlevel! neq 0 (
    echo HATA: Node.js PATH'te bulunamadi!
    del temp_node_path.txt >nul 2>&1
    pause
    exit /b 1
)

set /p NODE_FULL_PATH=<temp_node_path.txt
del temp_node_path.txt >nul 2>&1

echo Node.js yolu: !NODE_FULL_PATH!
for %%j in ("!NODE_FULL_PATH!") do set "NODE_DIR=%%~dpj"
echo Node.js dizini: !NODE_DIR!

if exist "!NODE_DIR!node_modules\npm\bin\npm-cli.js" (
    echo NPM bulundu: !NODE_DIR!node_modules\npm\bin\npm-cli.js
    set "NPM_PATH=!NODE_DIR!node_modules\npm\bin\npm-cli.js"
    
    echo.
    echo NPM versiyonu test ediliyor...
    echo Calistiriliyor: node "!NPM_PATH!" --version
    node "!NPM_PATH!" --version
    
    if !errorlevel! equ 0 (
        echo.
        echo BASARILI: NPM calisir durumda!
        echo Kullanilacak komut: node "!NPM_PATH!"
    ) else (
        echo.
        echo HATA: NPM calismiyor!
    )
) else (
    echo HATA: NPM bulunamadi!
)

echo.
pause
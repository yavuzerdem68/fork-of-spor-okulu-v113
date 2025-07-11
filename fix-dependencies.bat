@echo off
echo ================================
echo Bagimlilik Sorunu Cozumu
echo ================================
echo.

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

echo.
echo Bagimliliklar kontrol ediliyor...

REM node_modules var mi kontrol et
if not exist "node_modules" (
    echo node_modules bulunamadi, bagimliliklar yukleniyor...
    goto install_deps
)

REM cross-env var mi kontrol et
if not exist "node_modules\cross-env" (
    echo cross-env bulunamadi, bagimliliklar yeniden yukleniyor...
    goto install_deps
)

echo Bagimliliklar mevcut.
goto run_app

:install_deps
echo.
echo Bagimliliklar yukleniyor...
npm install
if %errorlevel% neq 0 (
    echo HATA: Bagimliliklar yuklenemedi!
    echo.
    echo Alternatif cozum:
    echo 1. npm cache clean --force
    echo 2. rmdir /s node_modules
    echo 3. del package-lock.json
    echo 4. npm install
    pause
    exit /b 1
)

echo Bagimliliklar basariyla yuklendi!

:run_app
echo.
echo ================================
echo Uygulama baslatiliyor...
echo ================================
echo.

npm run dev:local-win

pause
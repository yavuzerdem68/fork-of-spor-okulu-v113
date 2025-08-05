@echo off
echo ================================
echo Spor Okulu CRM - Basit Baslatici
echo ================================
echo.

echo Node.js kontrol ediliyor...
node --version
if %errorlevel% neq 0 (
    echo HATA: Node.js bulunamadi!
    pause
    exit /b 1
)

echo.
echo NPM kontrol ediliyor...
npm --version
if %errorlevel% neq 0 (
    echo HATA: NPM bulunamadi!
    pause
    exit /b 1
)

echo.
echo Bagimliliklar kontrol ediliyor...
if not exist "node_modules" (
    echo npm install calistiriliyor...
    npm install
    if %errorlevel% neq 0 (
        echo HATA: npm install basarisiz!
        pause
        exit /b 1
    )
)

echo.
echo Port 3000 temizleniyor...
taskkill /f /im node.exe >nul 2>&1

echo.
echo ================================
echo Uygulama baslatiliyor...
echo http://localhost:3000 adresine gidin
echo ================================
echo.
echo Giris bilgileri:
echo Email: yavuz@g7spor.org
echo Sifre: 444125yA/
echo.

npm run dev

pause
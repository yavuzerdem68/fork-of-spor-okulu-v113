@echo off
title Spor Okulu CRM
echo ================================
echo Spor Okulu CRM Baslatiliyor...
echo ================================
echo.

cd /d "%~dp0"

if not exist "node_modules" (
    echo Ilk kurulum yapiliyor...
    npm install
)

echo.
echo Uygulama baslatiliyor...
echo Tarayicinizda http://localhost:3000 adresine gidin
echo.
echo Giris bilgileri:
echo Email: yavuz@g7spor.org
echo Sifre: 444125yA/
echo.

npm run dev
pause
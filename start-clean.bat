@echo off
echo ================================
echo   G7 SPOR OKULU - TEMİZ BAŞLATMA
echo ================================
echo.

echo Temizlik yapiliyor...
if exist .next rmdir /s /q .next
if exist node_modules rmdir /s /q node_modules

echo.
echo Bagimliliklar yukleniyor...
npm install

echo.
echo Sunucu baslatiliyor...
echo.
echo Tarayicinizda su adresi acin: http://localhost:3000
echo Giris bilgileri:
echo   Email: yavuz@g7spor.org
echo   Sifre: 444125yA/
echo.
echo Sunucuyu durdurmak icin Ctrl+C basin
echo.

npm run dev
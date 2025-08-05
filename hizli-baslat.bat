@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo.
echo ================================
echo   HIZLI BAŞLATMA SCRIPTI
echo ================================
echo.

echo Bu script projeyi hızlıca başlatır.
echo Sorun yaşarsanız 'lokal-fix.bat' çalıştırın.
echo.

REM Node.js kontrolü
node --version >nul 2>&1
if !errorlevel! neq 0 (
    echo ✗ Node.js kurulu değil!
    echo https://nodejs.org adresinden Node.js 20.x indirin
    pause
    exit /b 1
)

REM node_modules kontrolü
if not exist "node_modules" (
    echo node_modules bulunamadı. Bağımlılıklar yükleniyor...
    npm install
    if !errorlevel! neq 0 (
        echo ✗ npm install başarısız!
        echo 'lokal-fix.bat' çalıştırın
        pause
        exit /b 1
    )
)

REM .env.local kontrolü
if not exist ".env.local" (
    if exist ".env.local.example" (
        echo .env.local oluşturuluyor...
        copy ".env.local.example" ".env.local" >nul
    ) else (
        echo Temel .env.local oluşturuluyor...
        (
        echo # Masaüstü Spor Okulu CRM - Lokal Çevre Değişkenleri
        echo NEXT_PUBLIC_CO_DEV_ENV=desktop
        ) > ".env.local"
    )
)

REM Cache temizleme (opsiyonel)
if exist ".next" (
    echo Eski cache temizleniyor...
    rmdir /s /q ".next" 2>nul
)

echo.
echo ================================
echo   PROJE BAŞLATILIYOR
echo ================================
echo.

echo Geliştirme sunucusu başlatılıyor...
echo Tarayıcıda http://localhost:3000 açılacak
echo.
echo Giriş bilgileri:
echo Email: yavuz@g7spor.org
echo Şifre: 444125yA/
echo.
echo Durdurmak için Ctrl+C basın
echo.

REM Geliştirme sunucusunu başlat
npm run dev
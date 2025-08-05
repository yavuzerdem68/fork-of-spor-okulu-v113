@echo off
setlocal enabledelayedexpansion

echo ================================
echo Spor Okulu CRM - Masaustu Surumu
echo ================================
echo.
echo Bu masaustu surumu tamamen localStorage tabanli calisir.
echo Harici baglanti gerektirmez.
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

REM NPM kontrolu - basitleştirilmiş
echo.
echo NPM kontrol ediliyor...
npm --version >nul 2>&1
if !errorlevel! neq 0 (
    echo HATA: NPM bulunamadi!
    echo Node.js'i yeniden yukleyin: https://nodejs.org/
    pause
    exit /b 1
)

echo NPM bulundu: 
npm --version

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
) else (
    echo .env.local dosyasi mevcut.
)

REM node_modules kontrolu
echo.
echo Bagimliliklar kontrol ediliyor...
if not exist "node_modules" (
    echo node_modules bulunamadi, bagimliliklar yukleniyor...
    echo Bu islem birkaç dakika surebilir, lutfen bekleyin...
    echo.
    
    REM Basit npm install
    echo Calistiriliyor: npm install
    npm install
    
    if !errorlevel! neq 0 (
        echo.
        echo HATA: Bagimliliklar yuklenemedi!
        echo Manuel olarak 'npm install' calistirin.
        pause
        exit /b 1
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
echo Giris bilgileri:
echo Email: yavuz@g7spor.org
echo Sifre: 444125yA/
echo.

echo Calistiriliyor: npm run dev
npm run dev

REM Hata durumunda
if !errorlevel! neq 0 (
    echo.
    echo HATA: Uygulama baslatılamadi!
    echo.
    echo Manuel cozum:
    echo 1. npm install
    echo 2. npm run dev
    echo.
    pause
    exit /b 1
)

pause
@echo off
echo ========================================
echo   SPOR OKULU CRM - FINAL DEPLOYMENT
echo ========================================
echo.

echo Bu script hem WordPress hem de lokal kullanim icin
echo gerekli dosyalari hazirlar.
echo.

:MENU
echo Lutfen deployment tipini secin:
echo.
echo 1. WordPress Deployment (Hosting icin)
echo 2. Lokal Development Setup
echo 3. Her ikisi birden
echo 4. Cikis
echo.
set /p choice="Seciminizi yapin (1-4): "

if "%choice%"=="1" goto WORDPRESS
if "%choice%"=="2" goto LOCAL
if "%choice%"=="3" goto BOTH
if "%choice%"=="4" goto EXIT
echo Gecersiz secim! Tekrar deneyin.
goto MENU

:WORDPRESS
echo.
echo ========================================
echo   WORDPRESS DEPLOYMENT BASLATILIYOR
echo ========================================
echo.

echo 🧹 Temizlik yapiliyor...
call npm run clean

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Temizlik basarisiz oldu!
    pause
    goto MENU
)

echo.
echo 🔨 WordPress build baslatiliyor...
call npm run build:wordpress

if %ERRORLEVEL% NEQ 0 (
    echo ❌ WordPress build basarisiz oldu!
    echo Hata detaylari icin yukaridaki loglari kontrol edin.
    pause
    goto MENU
)

echo.
echo 📁 .htaccess dosyasi kopyalaniyor...
call npm run copy-htaccess

echo.
echo ✅ WordPress deployment basariyla tamamlandi!
echo.
echo 📂 Deployment dosyalari 'out' klasorunde hazir
echo 🌐 WordPress sitenizin /spor-okulu/ klasorune yukleyin
echo.
echo 📋 Sonraki Adimlar:
echo 1. 'out' klasorunun icerigini WordPress sitenizin /spor-okulu/ klasorune yukleyin
echo 2. .htaccess dosyasinin dogru yerde oldugunden emin olun
echo 3. WordPress admin panelinde Application Password olusturun
echo 4. https://siteniz.com/spor-okulu/ adresinden erisim saglayin
echo.
goto CONTINUE

:LOCAL
echo.
echo ========================================
echo   LOKAL DEVELOPMENT SETUP
echo ========================================
echo.

echo 🔧 Lokal gelistirme ortami hazirlaniyor...
echo.

echo 📦 Dependencies kontrol ediliyor...
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo ❌ npm install basarisiz oldu!
    pause
    goto MENU
)

echo.
echo 🚀 Lokal development server baslatiliyor...
echo.
echo ✅ Lokal setup tamamlandi!
echo.
echo 🌐 Uygulama http://localhost:3000 adresinde calisacak
echo 📝 Gelistirme icin 'npm run dev' komutunu kullanin
echo.

echo Development server baslatilsin mi? (y/n)
set /p startdev="Seciminiz: "
if /i "%startdev%"=="y" (
    echo.
    echo 🚀 Development server baslatiliyor...
    call npm run dev
) else (
    echo.
    echo Manuel olarak baslatmak icin: npm run dev
)
goto CONTINUE

:BOTH
echo.
echo ========================================
echo   HER IKI DEPLOYMENT HAZIRLANIYOR
echo ========================================
echo.

echo 🧹 Temizlik yapiliyor...
call npm run clean

echo.
echo 📦 Dependencies kontrol ediliyor...
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo ❌ npm install basarisiz oldu!
    pause
    goto MENU
)

echo.
echo 🔨 WordPress build baslatiliyor...
call npm run build:wordpress

if %ERRORLEVEL% NEQ 0 (
    echo ❌ WordPress build basarisiz oldu!
    pause
    goto MENU
)

echo.
echo 📁 .htaccess dosyasi kopyalaniyor...
call npm run copy-htaccess

echo.
echo ✅ Her iki deployment de basariyla hazirlandi!
echo.
echo 📂 WordPress dosyalari: 'out' klasorunde
echo 🌐 Lokal gelistirme: 'npm run dev' ile baslatilabilir
echo.
goto CONTINUE

:CONTINUE
echo.
echo ========================================
echo   DEPLOYMENT TAMAMLANDI
echo ========================================
echo.
echo 📚 Detayli kurulum rehberi icin:
echo    - WORDPRESS-DEPLOYMENT-REHBERI-FINAL.md dosyasini okuyun
echo.
echo 🔧 Yaygın sorunlar ve cozumleri icin:
echo    - LOKAL-SORUN-COZUMU.md dosyasini kontrol edin
echo.
echo 💡 Hizli baslangic icin:
echo    - WordPress: 'out' klasorunu sitenize yukleyin
echo    - Lokal: 'npm run dev' komutunu calistirin
echo.

:EXIT
echo Tesekkurler! Spor Okulu CRM kullandiginiz icin...
pause
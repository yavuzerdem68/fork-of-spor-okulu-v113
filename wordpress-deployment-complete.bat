@echo off
chcp 65001 >nul
echo ========================================
echo   WORDPRESS DEPLOYMENT - COMPLETE
echo ========================================
echo.

echo 🔍 Sistem kontrolleri yapılıyor...

:: Node.js kontrolü
node --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js bulunamadı! Lütfen Node.js kurun.
    pause
    exit /b 1
)

:: NPM kontrolü
npm --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ NPM bulunamadı! Node.js kurulumunu kontrol edin.
    pause
    exit /b 1
)

echo ✅ Node.js ve NPM hazır

:: Package.json kontrolü
if not exist "package.json" (
    echo ❌ package.json bulunamadı! Proje klasöründe olduğunuzdan emin olun.
    pause
    exit /b 1
)

echo ✅ Proje dosyaları hazır

echo.
echo 🧹 Temizlik işlemi başlatılıyor...
if exist ".next" rmdir /s /q ".next"
if exist "out" rmdir /s /q "out"
echo ✅ Eski build dosyaları temizlendi

echo.
echo 📦 Bağımlılıklar kontrol ediliyor...
if not exist "node_modules" (
    echo 📥 Node modules yükleniyor...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ NPM install başarısız!
        pause
        exit /b 1
    )
)

echo.
echo 🔨 WordPress build başlatılıyor...
echo ⏳ Bu işlem birkaç dakika sürebilir...

call npm run build:wordpress

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ WordPress build başarısız oldu!
    echo.
    echo 🔍 Olası nedenler:
    echo - TypeScript hataları
    echo - Eksik bağımlılıklar
    echo - Bellek yetersizliği
    echo.
    echo 💡 Çözüm önerileri:
    echo 1. npm install çalıştırın
    echo 2. TypeScript hatalarını düzeltin
    echo 3. Bilgisayarınızı yeniden başlatın
    echo.
    pause
    exit /b 1
)

echo ✅ WordPress build başarıyla tamamlandı!

echo.
echo 📁 .htaccess dosyası kopyalanıyor...
call npm run copy-htaccess

if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  .htaccess kopyalama başarısız, manuel kopyalayın
) else (
    echo ✅ .htaccess dosyası kopyalandı
)

echo.
echo 📊 Build sonuçları kontrol ediliyor...

if not exist "out" (
    echo ❌ 'out' klasörü oluşmadı!
    pause
    exit /b 1
)

if not exist "out\index.html" (
    echo ❌ index.html dosyası bulunamadı!
    pause
    exit /b 1
)

if not exist "out\_next" (
    echo ❌ _next klasörü bulunamadı!
    pause
    exit /b 1
)

echo ✅ Tüm gerekli dosyalar oluşturuldu

echo.
echo 📏 Dosya boyutları:
for %%f in (out\*) do echo   %%~nxf: %%~zf bytes

echo.
echo ========================================
echo   🎉 WORDPRESS DEPLOYMENT HAZIR!
echo ========================================
echo.
echo 📂 Deployment dosyaları: 'out' klasörü
echo 🌐 Hedef konum: WordPress sitenizin /spor-okulu/ klasörü
echo.
echo 📋 Sonraki adımlar:
echo.
echo 1. 'out' klasörünün TÜM içeriğini kopyalayın
echo 2. WordPress sitenizin public_html/spor-okulu/ klasörüne yükleyin
echo 3. Dosya izinlerini kontrol edin (755/644)
echo 4. https://siteniz.com/spor-okulu/ adresini test edin
echo.
echo 📖 Detaylı kurulum için: WORDPRESS-DEPLOYMENT-REHBERI-FINAL.md
echo.
echo ⚠️  ÖNEMLİ NOTLAR:
echo - .htaccess dosyasının yüklendiğinden emin olun
echo - WordPress Application Password'ünüzü hazır bulundurun
echo - İlk kurulumda sistem ayarlarını yapılandırın
echo.

set /p choice="Deployment klasörünü açmak ister misiniz? (E/H): "
if /i "%choice%"=="E" (
    start explorer "out"
)

echo.
echo ✅ WordPress deployment tamamlandı!
pause
@echo off
echo ========================================
echo   WORDPRESS DAĞITIMI BAŞLATILIYOR
echo ========================================
echo.

echo 🧹 Önce temizlik yapılıyor...
call npm run clean

echo.
echo 🔨 WordPress build başlatılıyor...
call npm run build:wordpress

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Build başarısız oldu!
    echo Hata detayları için yukarıdaki logları kontrol edin.
    pause
    exit /b 1
)

echo.
echo 📁 .htaccess dosyası kopyalanıyor...
call npm run copy-htaccess

echo.
echo ✅ WordPress build başarıyla tamamlandı!
echo.
echo 📂 Dağıtım dosyaları 'out' klasöründe hazır
echo 🌐 WordPress sitenizin /spor-okulu/ klasörüne yükleyin
echo.
echo 📋 Dağıtım Adımları:
echo 1. 'out' klasörünün içeriğini WordPress sitenizin /spor-okulu/ klasörüne yükleyin
echo 2. .htaccess dosyasının doğru yerde olduğundan emin olun
echo 3. https://siteniz.com/spor-okulu/ adresinden erişim sağlayın
echo.
pause
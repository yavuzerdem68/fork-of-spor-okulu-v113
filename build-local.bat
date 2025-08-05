@echo off
echo ========================================
echo    LOKAL DAĞITIM BAŞLATILIYOR
echo ========================================
echo.

echo 🧹 Önce temizlik yapılıyor...
call npm run clean

echo.
echo 🔨 Lokal build başlatılıyor...
call npm run build:local

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Build başarısız oldu!
    echo Hata detayları için yukarıdaki logları kontrol edin.
    pause
    exit /b 1
)

echo.
echo ✅ Lokal build başarıyla tamamlandı!
echo.
echo 🚀 Uygulamayı başlatmak için: npm start
echo 💻 Geliştirme modu için: npm run dev
echo.
pause
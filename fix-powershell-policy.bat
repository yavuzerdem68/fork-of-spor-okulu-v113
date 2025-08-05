@echo off
echo ========================================
echo   POWERSHELL EXECUTION POLICY FIX
echo ========================================
echo.

echo Mevcut PowerShell execution policy kontrol ediliyor...
powershell -Command "Get-ExecutionPolicy"
echo.

echo PowerShell execution policy sorunu cozuluyor...
echo.

echo Secenekler:
echo 1. Gecici cozum (sadece bu oturum icin)
echo 2. Kalici cozum (kullanici icin)
echo 3. Dosyalari unblock et
echo.

set /p choice="Seciminizi yapin (1/2/3): "

if "%choice%"=="1" (
    echo.
    echo Gecici cozum uygulanacak...
    echo Asagidaki komutu PowerShell'de calistirin:
    echo Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
    echo.
    echo Sonra build scriptinizi tekrar calistirin.
    pause
    goto end
)

if "%choice%"=="2" (
    echo.
    echo Kalici cozum uygulanacak...
    powershell -Command "Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force"
    if %errorlevel%==0 (
        echo Basarili! Execution policy degistirildi.
        echo Artik PowerShell scriptlerini calistirabilisiniz.
    ) else (
        echo Hata! Policy degistirilemedi. Yonetici olarak calistirin.
    )
    echo.
    pause
    goto end
)

if "%choice%"=="3" (
    echo.
    echo Dosyalar unblock ediliyor...
    powershell -Command "Unblock-File -Path '.\build-local.ps1' -ErrorAction SilentlyContinue"
    powershell -Command "Unblock-File -Path '.\build-wordpress.ps1' -ErrorAction SilentlyContinue"
    powershell -Command "Unblock-File -Path '.\start-local.ps1' -ErrorAction SilentlyContinue"
    echo Dosyalar unblock edildi!
    echo.
    pause
    goto end
)

echo Gecersiz secim!
pause

:end
echo.
echo Kullanim Talimatlari:
echo - Lokal build icin: .\build-local.ps1
echo - WordPress build icin: .\build-wordpress.ps1
echo.
echo Alternatif: Batch dosyalarini da kullanabilirsiniz:
echo - build-local.bat
echo - build-wordpress.bat
echo.
pause
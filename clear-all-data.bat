@echo off
chcp 65001 >nul
echo.
echo ╔══════════════════════════════════════════════════════════════════════════════╗
echo ║                    SportsCRM - Komple Veri Temizleme                        ║
echo ╚══════════════════════════════════════════════════════════════════════════════╝
echo.
echo Bu script şunları yapacak:
echo • Tarayıcı önbelleğini temizleyecek
echo • LocalStorage verilerini sıfırlayacak  
echo • Geçici dosyaları temizleyecek
echo • Uygulamayı yeniden başlatacak
echo.
echo ⚠️  UYARI: Bu işlem GERİ ALINAMAZ!
echo ⚠️  Tüm sporcu kayıtları, ödemeler ve ayarlar silinecek!
echo.
set /p confirm="Devam etmek istediğinizden emin misiniz? (E/H): "
if /i not "%confirm%"=="E" (
    echo İşlem iptal edildi.
    pause
    exit /b
)

echo.
echo ═══════════════════════════════════════════════════════════════════════════════
echo 🧹 Veri temizleme başlatılıyor...
echo ═══════════════════════════════════════════════════════════════════════════════

echo.
echo [1/5] Chrome tarayıcı verilerini temizleme...
taskkill /f /im chrome.exe >nul 2>&1
timeout /t 2 >nul
if exist "%LOCALAPPDATA%\Google\Chrome\User Data\Default\Local Storage" (
    rmdir /s /q "%LOCALAPPDATA%\Google\Chrome\User Data\Default\Local Storage" >nul 2>&1
    echo ✅ Chrome LocalStorage temizlendi
) else (
    echo ℹ️  Chrome LocalStorage bulunamadı
)

echo.
echo [2/5] Edge tarayıcı verilerini temizleme...
taskkill /f /im msedge.exe >nul 2>&1
timeout /t 2 >nul
if exist "%LOCALAPPDATA%\Microsoft\Edge\User Data\Default\Local Storage" (
    rmdir /s /q "%LOCALAPPDATA%\Microsoft\Edge\User Data\Default\Local Storage" >nul 2>&1
    echo ✅ Edge LocalStorage temizlendi
) else (
    echo ℹ️  Edge LocalStorage bulunamadı
)

echo.
echo [3/5] Firefox tarayıcı verilerini temizleme...
taskkill /f /im firefox.exe >nul 2>&1
timeout /t 2 >nul
if exist "%APPDATA%\Mozilla\Firefox\Profiles" (
    for /d %%i in ("%APPDATA%\Mozilla\Firefox\Profiles\*") do (
        if exist "%%i\webappsstore.sqlite" (
            del /f /q "%%i\webappsstore.sqlite" >nul 2>&1
        )
        if exist "%%i\storage" (
            rmdir /s /q "%%i\storage" >nul 2>&1
        )
    )
    echo ✅ Firefox LocalStorage temizlendi
) else (
    echo ℹ️  Firefox profili bulunamadı
)

echo.
echo [4/5] Sistem geçici dosyalarını temizleme...
if exist "%TEMP%\sportscrm*" (
    del /f /q "%TEMP%\sportscrm*" >nul 2>&1
    echo ✅ SportsCRM geçici dosyaları temizlendi
)

if exist "%LOCALAPPDATA%\Temp\*sportscrm*" (
    del /f /q "%LOCALAPPDATA%\Temp\*sportscrm*" >nul 2>&1
    echo ✅ Yerel geçici dosyalar temizlendi
)

echo.
echo [5/5] DNS önbelleğini temizleme...
ipconfig /flushdns >nul 2>&1
echo ✅ DNS önbelleği temizlendi

echo.
echo ═══════════════════════════════════════════════════════════════════════════════
echo ✅ VERİ TEMİZLEME TAMAMLANDI!
echo ═══════════════════════════════════════════════════════════════════════════════
echo.
echo 🎉 Tüm veriler başarıyla temizlendi!
echo.
echo Şimdi yapmanız gerekenler:
echo 1. Tarayıcınızı tamamen kapatın
echo 2. Tarayıcıyı yeniden açın  
echo 3. SportsCRM uygulamasına gidin
echo 4. Temiz bir başlangıç yapın!
echo.
echo 💡 İpucu: Ctrl+Shift+Delete ile tarayıcı geçmişini de temizleyebilirsiniz
echo.

set /p restart="Tarayıcıyı şimdi yeniden başlatmak ister misiniz? (E/H): "
if /i "%restart%"=="E" (
    echo.
    echo 🚀 Tarayıcı yeniden başlatılıyor...
    
    REM Chrome'u başlat
    if exist "%PROGRAMFILES%\Google\Chrome\Application\chrome.exe" (
        start "" "%PROGRAMFILES%\Google\Chrome\Application\chrome.exe" http://localhost:3000
        echo ✅ Chrome başlatıldı
    ) else if exist "%PROGRAMFILES(X86)%\Google\Chrome\Application\chrome.exe" (
        start "" "%PROGRAMFILES(X86)%\Google\Chrome\Application\chrome.exe" http://localhost:3000
        echo ✅ Chrome başlatıldı
    ) else if exist "%PROGRAMFILES%\Microsoft\Edge\Application\msedge.exe" (
        start "" "%PROGRAMFILES%\Microsoft\Edge\Application\msedge.exe" http://localhost:3000
        echo ✅ Edge başlatıldı
    ) else (
        echo ℹ️  Varsayılan tarayıcı başlatılıyor...
        start http://localhost:3000
    )
    
    timeout /t 3 >nul
    echo.
    echo 🎯 SportsCRM uygulaması açılıyor...
    echo 📍 Adres: http://localhost:3000
) else (
    echo.
    echo ℹ️  Manuel olarak tarayıcınızı açıp http://localhost:3000 adresine gidin
)

echo.
echo ═══════════════════════════════════════════════════════════════════════════════
echo 🏁 İşlem tamamlandı! İyi çalışmalar!
echo ═══════════════════════════════════════════════════════════════════════════════
echo.
pause
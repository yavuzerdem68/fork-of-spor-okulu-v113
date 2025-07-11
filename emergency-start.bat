@echo off
echo ================================
echo Acil Durum Baslatma Scripti
echo ================================
echo.
echo Bu script en basit yontemle uygulamayi baslatir.
echo.

REM Basit Node.js kontrolu
echo Node.js kontrol ediliyor...
node --version
if %errorlevel% neq 0 (
    echo HATA: Node.js bulunamadi!
    echo Lutfen https://nodejs.org/ adresinden Node.js yukleyin.
    pause
    exit /b 1
)

echo.
echo .env.local dosyasi kontrol ediliyor...
if not exist ".env.local" (
    if exist ".env.local.example" (
        echo .env.local.example dosyasi .env.local olarak kopyalaniyor...
        copy ".env.local.example" ".env.local"
    ) else (
        echo UYARI: .env.local dosyasi bulunamadi!
        echo Lutfen .env.local dosyasini manuel olarak olusturun.
    )
)

echo.
echo Bagimliliklar yukleniyor...

REM Once normal npm'i dene
npm install >nul 2>&1
if %errorlevel% equ 0 (
    echo NPM ile bagimliliklar yuklendi.
    set NPM_CMD=npm
) else (
    echo NPM bulunamadi, alternatif yontemler deneniyor...
    
    REM Node.js yolunu bul
    for /f "tokens=*" %%i in ('where node 2^>nul') do (
        set NODE_PATH=%%i
        goto :try_alternative_npm
    )
    
    :try_alternative_npm
    if defined NODE_PATH (
        for %%j in ("%NODE_PATH%") do set NODE_DIR=%%~dpj
        
        REM node_modules/npm ile dene
        if exist "%NODE_DIR%node_modules\npm\bin\npm-cli.js" (
            echo Node.js ile npm calistiriliyor...
            node "%NODE_DIR%node_modules\npm\bin\npm-cli.js" install
            if %errorlevel% equ 0 (
                echo Bagimliliklar yuklendi.
                set NPM_CMD=node "%NODE_DIR%node_modules\npm\bin\npm-cli.js"
            ) else (
                echo HATA: Bagimliliklar yuklenemedi!
                goto :npm_error
            )
        ) else (
            echo HATA: NPM hicbir sekilde bulunamadi!
            goto :npm_error
        )
    ) else (
        echo HATA: Node.js yolu bulunamadi!
        goto :npm_error
    )
)

echo.
echo ================================
echo Uygulama baslatiliyor...
echo Tarayicinizda http://localhost:3000 adresine gidin
echo Durdurmak icin Ctrl+C basin
echo ================================
echo.

REM Uygulamayi baslat
%NPM_CMD% run dev:local-win
goto :end

:npm_error
echo.
echo Alternatif cozumler:
echo 1. diagnose-nodejs.bat scriptini calistirin
echo 2. Node.js'i https://nodejs.org/ adresinden yeniden yukleyin
echo 3. Bilgisayari yeniden baslatip tekrar deneyin
echo 4. Manuel kurulum yapin:
echo    - Komut istemini yonetici olarak acin
echo    - Bu klasore gidin
echo    - "node --version" komutunu calistirin
echo    - Eger calisiyorsa PATH sorunu var
pause
exit /b 1

:end

pause
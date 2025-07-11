@echo off
echo ================================
echo Spor Okulu CRM - Guvenli Baslatma
echo ================================
echo.
echo Bu script Windows Defender tarafindan guvenli kabul edilir.
echo.

REM Node.js kontrolu
echo Node.js versiyonu kontrol ediliyor...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo HATA: Node.js bulunamadi! Lutfen Node.js 20.x yukleyin.
    echo Indirme linki: https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js bulundu: 
node --version

REM Paket yoneticisi kontrolu (otomatik yukleme yok)
echo.
echo Paket yoneticisi kontrol ediliyor...
pnpm --version >nul 2>&1
if %errorlevel% equ 0 (
    echo PNPM bulundu: 
    pnpm --version
    set PACKAGE_MANAGER=pnpm
) else (
    echo PNPM bulunamadi, NPM kullanilacak...
    
    REM NPM kontrolu - daha detayli diagnostik
    where npm >nul 2>&1
    if %errorlevel% neq 0 (
        echo UYARI: NPM PATH'te bulunamadi!
        echo Node.js kurulum dizinini kontrol ediliyor...
        
        REM Node.js kurulum dizininden npm'i bulmaya calis
        for /f "tokens=*" %%i in ('where node 2^>nul') do (
            set NODE_PATH=%%i
            goto :found_node
        )
        
        :found_node
        if defined NODE_PATH (
            echo Node.js yolu: %NODE_PATH%
            REM Node.js dizininde npm.cmd'yi ara
            for %%j in ("%NODE_PATH%") do set NODE_DIR=%%~dpj
            if exist "%NODE_DIR%npm.cmd" (
                echo NPM bulundu: %NODE_DIR%npm.cmd
                set NPM_PATH=%NODE_DIR%npm.cmd
                "%NPM_PATH%" --version
                set PACKAGE_MANAGER="%NPM_PATH%"
            ) else if exist "%NODE_DIR%npm" (
                echo NPM bulundu: %NODE_DIR%npm
                set NPM_PATH=%NODE_DIR%npm
                "%NPM_PATH%" --version
                set PACKAGE_MANAGER="%NPM_PATH%"
            ) else (
                echo HATA: NPM Node.js dizininde bulunamadi!
                echo Lutfen Node.js'i yeniden yukleyin veya PATH'i duzeltin.
                echo.
                echo Cozum onerileri:
                echo 1. Node.js'i https://nodejs.org/ adresinden yeniden yukleyin
                echo 2. Bilgisayari yeniden baslatip tekrar deneyin
                echo 3. PATH cevre degiskenini kontrol edin
                pause
                exit /b 1
            )
        ) else (
            echo HATA: Node.js yolu bulunamadi!
            pause
            exit /b 1
        )
    ) else (
        npm --version >nul 2>&1
        if %errorlevel% neq 0 (
            echo HATA: NPM calismiyor!
            pause
            exit /b 1
        )
        echo NPM bulundu: 
        npm --version
        set PACKAGE_MANAGER=npm
    )
)

REM .env.local dosyasi kontrolu
echo.
echo Cevre degiskenleri kontrol ediliyor...
if not exist ".env.local" (
    echo .env.local dosyasi bulunamadi!
    if exist ".env.local.example" (
        echo Lutfen .env.local.example dosyasini .env.local olarak kopyalayin.
        echo Veya asagidaki komutu calistirin:
        echo copy ".env.local.example" ".env.local"
    ) else (
        echo UYARI: .env.local.example dosyasi bulunamadi!
        echo Lutfen .env.local dosyasini manuel olarak olusturun.
    )
    echo.
    echo Devam etmek icin bir tusa basin...
    pause >nul
)

REM node_modules kontrolu
echo.
echo Bagimliliklar kontrol ediliyor...
if not exist "node_modules" (
    echo node_modules bulunamadi, bagimliliklar yukleniyor...
    %PACKAGE_MANAGER% install
    if %errorlevel% neq 0 (
        echo HATA: Bagimliliklar yuklenemedi!
        pause
        exit /b 1
    )
) else (
    echo Bagimliliklar mevcut.
)

REM Uygulamayi baslat
echo.
echo ================================
echo Uygulama baslatiliyor...
echo Tarayicinizda http://localhost:3000 adresine gidin
echo Durdurmak icin Ctrl+C basin
echo ================================
echo.

%PACKAGE_MANAGER% run dev:local-win

pause
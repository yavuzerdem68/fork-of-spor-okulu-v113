@echo off
echo ================================
echo NPM Kurulum Onarma Araci
echo ================================
echo.
echo Bu araç eksik NPM kurulumunu onarir.
echo.

REM Node.js kontrolu
echo Node.js kontrol ediliyor...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo HATA: Node.js bulunamadi!
    echo Lutfen https://nodejs.org/ adresinden Node.js yukleyin.
    pause
    exit /b 1
)

echo Node.js bulundu: 
node --version

REM NPM kontrolu
echo.
echo NPM durumu kontrol ediliyor...
npm --version >nul 2>&1
if %errorlevel% equ 0 (
    echo NPM zaten calisiyor: 
    npm --version
    echo.
    echo NPM kurulumunuzda sorun yok!
    pause
    exit /b 0
)

echo NPM bulunamadi veya calismiyor.
echo.

REM Node.js kurulum dizinini bul
echo Node.js kurulum dizini aranıyor...
for /f "tokens=*" %%i in ('where node 2^>nul') do (
    set NODE_PATH=%%i
    goto :found_node_path
)

:found_node_path
if not defined NODE_PATH (
    echo HATA: Node.js yolu bulunamadi!
    pause
    exit /b 1
)

for %%j in ("%NODE_PATH%") do set NODE_DIR=%%~dpj
echo Node.js dizini: %NODE_DIR%

REM NPM'i Node.js ile yeniden yükle
echo.
echo NPM yeniden yukleniyor...
echo Bu islem birkaç dakika surebilir...
echo.

REM npm'i global olarak yükle
echo 1. NPM'i global olarak yuklemeye calisiliyor...
node -e "console.log('Node.js calisiyor')"
if %errorlevel% neq 0 (
    echo HATA: Node.js calismiyor!
    pause
    exit /b 1
)

REM npm'i curl ile indir ve yükle (Windows için)
echo 2. NPM paketini indiriliyor...
powershell -Command "& {try { Invoke-WebRequest -Uri 'https://registry.npmjs.org/npm/-/npm-latest.tgz' -OutFile 'npm-latest.tgz' -UseBasicParsing; Write-Host 'NPM paketi indirildi.' } catch { Write-Host 'NPM paketi indirilemedi.' }}"

if exist "npm-latest.tgz" (
    echo 3. NPM paketi cikartiliyor...
    powershell -Command "& {Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::ExtractToDirectory('npm-latest.tgz', 'npm-temp')}"
    
    if exist "npm-temp" (
        echo 4. NPM dosyalari kopyalaniyor...
        xcopy "npm-temp\package\*" "%NODE_DIR%" /E /Y /Q
        
        REM Temizlik
        rmdir /S /Q "npm-temp" 2>nul
        del "npm-latest.tgz" 2>nul
        
        echo 5. NPM kurulumu test ediliyor...
        "%NODE_DIR%npm.cmd" --version >nul 2>&1
        if %errorlevel% equ 0 (
            echo ✓ NPM basariyla kuruldu!
            echo NPM versiyonu: 
            "%NODE_DIR%npm.cmd" --version
        ) else (
            echo UYARI: NPM kuruldu ama test basarisiz.
        )
    ) else (
        echo HATA: NPM paketi cikartılamadi.
    )
) else (
    echo NPM paketi indirilemedi, alternatif yontem deneniyor...
    
    REM Alternatif: Node.js'i yeniden yükle
    echo.
    echo ONERILEN COZUM:
    echo ================
    echo 1. https://nodejs.org/ adresine gidin
    echo 2. LTS versiyonunu indirin
    echo 3. Mevcut Node.js'i kaldirin (Control Panel > Programs)
    echo 4. Yeni Node.js'i yonetici olarak yukleyin
    echo 5. "Add to PATH" seceneginin isaretli oldugunu kontrol edin
    echo 6. Bilgisayari yeniden baslatın
    echo.
)

REM Son test
echo.
echo Son kontrol yapiliyor...
npm --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ NPM artik calisiyor!
    echo NPM versiyonu: 
    npm --version
    echo.
    echo Artik start-local-safe.bat scriptini calistirabilisiniz.
) else (
    echo ✗ NPM hala calismiyor.
    echo.
    echo Manuel cozum gerekli:
    echo 1. Node.js'i tamamen kaldirin
    echo 2. https://nodejs.org/ adresinden yeniden yukleyin
    echo 3. Yonetici hakları ile yukleyin
    echo 4. Bilgisayari yeniden baslatın
)

echo.
pause
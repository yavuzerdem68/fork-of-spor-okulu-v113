@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

set "TargetPath=spor-okulu-temiz"
if not "%1"=="" set "TargetPath=%1"

echo.
echo ================================
echo   TEMİZ PROJE OLUŞTURULUYOR
echo ================================
echo.
echo Hedef klasör: %TargetPath%
echo.

REM Hedef klasörü oluştur
if exist "%TargetPath%" (
    echo Hedef klasör zaten mevcut. İçerik silinecek...
    rmdir /s /q "%TargetPath%" 2>nul
)

mkdir "%TargetPath%" 2>nul

REM Gerekli dosyaları kopyala
echo Temel dosyalar kopyalanıyor...
echo.

set "files=package.json next.config.mjs tsconfig.json tailwind.config.js postcss.config.js components.json .gitignore .env.local.example .env.cloud.example build-local.ps1 build-local.bat build-wordpress.ps1 build-wordpress.bat POWERSHELL-KULLANIM-REHBERI.md"

for %%f in (%files%) do (
    if exist "%%f" (
        copy "%%f" "%TargetPath%\" >nul 2>&1
        echo   ✓ %%f
    ) else (
        echo   ✗ %%f ^(bulunamadı^)
    )
)

REM README dosyasını kopyala
if exist "README-TEMIZ.md" (
    copy "README-TEMIZ.md" "%TargetPath%\README.md" >nul 2>&1
    echo   ✓ README.md ^(README-TEMIZ.md'den^)
)

echo.
echo Klasörler kopyalanıyor...
echo.

REM src klasörünü kopyala
if exist "src" (
    xcopy "src" "%TargetPath%\src" /e /i /h /y >nul 2>&1
    echo   ✓ src klasörü
) else (
    echo   ✗ src klasörü ^(bulunamadı^)
)

REM public klasörünü kopyala
if exist "public" (
    xcopy "public" "%TargetPath%\public" /e /i /h /y >nul 2>&1
    echo   ✓ public klasörü
) else (
    echo   ✗ public klasörü ^(bulunamadı^)
)

REM Temiz .gitignore oluştur
(
echo # Dependencies
echo node_modules/
echo /.pnp
echo .pnp.js
echo.
echo # Testing
echo /coverage
echo.
echo # Next.js
echo /.next/
echo /out/
echo.
echo # Production
echo /build
echo.
echo # Misc
echo .DS_Store
echo *.tsbuildinfo
echo next-env.d.ts
echo.
echo # Debug
echo npm-debug.log*
echo yarn-debug.log*
echo yarn-error.log*
echo.
echo # Local env files
echo .env*.local
echo .env.local
echo .env.development.local
echo .env.test.local
echo .env.production.local
echo.
echo # Vercel
echo .vercel
echo.
echo # IDE
echo .vscode/
echo .idea/
echo.
echo # OS
echo Thumbs.db
echo.
echo # Logs
echo logs
echo *.log
echo.
echo # Data files ^(local storage^)
echo data/
echo *.json.backup
echo.
echo # Build outputs
echo dist/
echo build/
echo.
echo # Package manager
echo pnpm-lock.yaml
echo yarn.lock
echo package-lock.json
echo.
echo # Temporary files
echo *.tmp
echo *.temp
) > "%TargetPath%\.gitignore"

echo.
echo ================================
echo   TEMİZ PROJE BAŞARIYLA OLUŞTURULDU!
echo ================================
echo.
echo Konum: %TargetPath%
echo.
echo SONRAKİ ADIMLAR:
echo ----------------
echo 1. cd %TargetPath%
echo 2. npm install
echo 3. copy .env.local.example .env.local
echo 4. npm run dev
echo.
echo GITHUB'A YÜKLEMEK İÇİN:
echo ----------------------
echo 1. GitHub'da yeni repo oluşturun
echo 2. git init
echo 3. git add .
echo 4. git commit -m "Initial clean version"
echo 5. git remote add origin [REPO-URL]
echo 6. git push -u origin main
echo.
pause
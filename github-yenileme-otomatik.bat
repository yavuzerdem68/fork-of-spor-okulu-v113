@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

set "RepoName=spor-okulu"
set "GitHubUsername="
set "CleanProjectPath=spor-okulu-temiz"

echo.
echo ================================
echo   GITHUB DEPO YENILEME SCRIPTI
echo ================================
echo.

REM GitHub kullanıcı adı kontrolü
if "%GitHubUsername%"=="" (
    set /p GitHubUsername="GitHub kullanici adinizi girin: "
)

set "RepoUrl=https://github.com/!GitHubUsername!/!RepoName!.git"

echo Repo URL: !RepoUrl!
echo Temiz proje yolu: !CleanProjectPath!
echo.

REM Adım 1: Temiz proje oluştur
echo ADIM 1: Temiz proje olusturuluyor...
if exist "create-clean-project.bat" (
    call create-clean-project.bat "!CleanProjectPath!"
    echo ✓ Temiz proje olusturuldu
) else (
    echo ✗ create-clean-project.bat bulunamadi!
    pause
    exit /b 1
)

REM Adım 2: Temiz projeye geç
echo.
echo ADIM 2: Temiz projeye geciliyor...
if exist "!CleanProjectPath!" (
    cd /d "!CleanProjectPath!"
    echo ✓ !CleanProjectPath! klasorune gecildi
) else (
    echo ✗ !CleanProjectPath! klasoru bulunamadi!
    pause
    exit /b 1
)

REM Adım 3: npm install
echo.
echo ADIM 3: Bagimliliklar yukleniyor...
npm install >nul 2>&1
if !errorlevel! equ 0 (
    echo ✓ npm install tamamlandi
) else (
    echo ✗ npm install basarisiz!
    echo Node.js kurulu oldugundan emin olun
)

REM Adım 4: Git başlat
echo.
echo ADIM 4: Git repository baslatiliyor...
git init >nul 2>&1
if !errorlevel! equ 0 (
    echo ✓ Git repository baslatildi
) else (
    echo ✗ Git init basarisiz!
    echo Git kurulu oldugundan emin olun
)

REM Adım 5: Dosyaları ekle
echo.
echo ADIM 5: Dosyalar Git'e ekleniyor...
git add . >nul 2>&1
if !errorlevel! equ 0 (
    echo ✓ Tum dosyalar eklendi
) else (
    echo ✗ git add basarisiz!
)

REM Adım 6: Commit
echo.
echo ADIM 6: Commit yapiliyor...
git commit -m "Clean project version - removed unnecessary files and optimized structure" >nul 2>&1
if !errorlevel! equ 0 (
    echo ✓ Commit tamamlandi
) else (
    echo ✗ git commit basarisiz!
)

REM Adım 7: Branch ayarla
echo.
echo ADIM 7: Ana branch ayarlaniyor...
git branch -M main >nul 2>&1
if !errorlevel! equ 0 (
    echo ✓ Ana branch 'main' olarak ayarlandi
) else (
    echo ✗ Branch ayarlama basarisiz!
)

REM Adım 8: Remote ekle
echo.
echo ADIM 8: GitHub remote ekleniyor...
git remote add origin "!RepoUrl!" >nul 2>&1
if !errorlevel! equ 0 (
    echo ✓ Remote eklendi: !RepoUrl!
) else (
    echo ! Remote zaten mevcut olabilir, devam ediliyor...
)

REM Adım 9: Push
echo.
echo ADIM 9: GitHub'a yukleniyor...
echo.
echo ONEMLI UYARI:
echo Bu islem mevcut GitHub deposunun TUM GECMISINI SILECEK!
echo Devam etmek istediginizden emin misiniz?
echo.
echo Secenekler:
echo 1. Evet, mevcut depoyu tamamen degistir ^(TEHLIKELI^)
echo 2. Hayir, manuel olarak yapmak istiyorum
echo.

set /p choice="Seciminizi yapin (1 veya 2): "

if "!choice!"=="1" (
    echo.
    echo Son uyari: Bu islem geri alinamaz!
    set /p confirm="Devam etmek icin 'EVET' yazin: "
    
    if "!confirm!"=="EVET" (
        echo.
        echo GitHub'a yukleniyor...
        git push --force-with-lease origin main
        if !errorlevel! equ 0 (
            echo.
            echo ================================
            echo   BASARIYLA TAMAMLANDI!
            echo ================================
            echo.
            echo GitHub deponuz temizlendi ve guncellendi!
            echo URL: https://github.com/!GitHubUsername!/!RepoName!
        ) else (
            echo ✗ GitHub'a yukleme basarisiz!
            echo Sebep: Muhtemelen authentication sorunu
            echo Manuel olarak su komutu calistirin:
            echo git push --force-with-lease origin main
        )
    ) else (
        echo Islem iptal edildi.
    )
) else (
    echo.
    echo Manuel yukleme icin su komutlari kullanin:
    echo.
    echo # Normal push ^(eger yeni repo ise^):
    echo git push -u origin main
    echo.
    echo # Force push ^(mevcut repo'yu degistirmek icin^):
    echo git push --force-with-lease origin main
    echo.
)

echo.
echo Sonraki adimlar:
echo 1. GitHub'da deponuzu kontrol edin
echo 2. README.md dosyasinin duzgun goruntulendigini dogrulayin
echo 3. Build scriptlerini test edin
echo 4. Projeyi baska bir yerde klonlayip test edin
echo.
echo Test komutu:
echo npm run dev
echo.
pause
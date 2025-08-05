# GitHub Deposunu Otomatik Yenileme Scripti
# Bu script temiz proje olusturup GitHub'a yukleme surecini otomatiklestirir

param(
    [string]$RepoName = "spor-okulu",
    [string]$GitHubUsername = "",
    [string]$CleanProjectPath = "spor-okulu-temiz"
)

Write-Host "================================" -ForegroundColor Cyan
Write-Host "  GITHUB DEPO YENILEME SCRIPTI" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# GitHub kullanici adi kontrolu
if ([string]::IsNullOrEmpty($GitHubUsername)) {
    $GitHubUsername = Read-Host "GitHub kullanici adinizi girin"
}

$RepoUrl = "https://github.com/$GitHubUsername/$RepoName.git"

Write-Host "Repo URL: $RepoUrl" -ForegroundColor Yellow
Write-Host "Temiz proje yolu: $CleanProjectPath" -ForegroundColor Yellow
Write-Host ""

# Adim 1: Temiz proje olustur
Write-Host "ADIM 1: Temiz proje olusturuluyor..." -ForegroundColor Green
if (Test-Path "create-clean-project.ps1") {
    & .\create-clean-project.ps1 -TargetPath $CleanProjectPath
    Write-Host "✓ Temiz proje olusturuldu" -ForegroundColor Green
} else {
    Write-Host "✗ create-clean-project.ps1 bulunamadi!" -ForegroundColor Red
    exit 1
}

# Adim 2: Temiz projeye gec
Write-Host ""
Write-Host "ADIM 2: Temiz projeye geciliyor..." -ForegroundColor Green
if (Test-Path $CleanProjectPath) {
    Set-Location $CleanProjectPath
    Write-Host "✓ $CleanProjectPath klasorune gecildi" -ForegroundColor Green
} else {
    Write-Host "✗ $CleanProjectPath klasoru bulunamadi!" -ForegroundColor Red
    exit 1
}

# Adim 3: npm install
Write-Host ""
Write-Host "ADIM 3: Bagimliliklar yukleniyor..." -ForegroundColor Green
try {
    npm install
    Write-Host "✓ npm install tamamlandi" -ForegroundColor Green
} catch {
    Write-Host "✗ npm install basarisiz!" -ForegroundColor Red
    Write-Host "Node.js kurulu oldugundan emin olun" -ForegroundColor Yellow
}

# Adim 4: Git baslat
Write-Host ""
Write-Host "ADIM 4: Git repository baslatiliyor..." -ForegroundColor Green
try {
    git init
    Write-Host "✓ Git repository baslatildi" -ForegroundColor Green
} catch {
    Write-Host "✗ Git init basarisiz!" -ForegroundColor Red
    Write-Host "Git kurulu oldugundan emin olun" -ForegroundColor Yellow
}

# Adim 5: Dosyalari ekle
Write-Host ""
Write-Host "ADIM 5: Dosyalar Git'e ekleniyor..." -ForegroundColor Green
try {
    git add .
    Write-Host "✓ Tum dosyalar eklendi" -ForegroundColor Green
} catch {
    Write-Host "✗ git add basarisiz!" -ForegroundColor Red
}

# Adim 6: Commit
Write-Host ""
Write-Host "ADIM 6: Commit yapiliyor..." -ForegroundColor Green
try {
    git commit -m "Clean project version - removed unnecessary files and optimized structure"
    Write-Host "✓ Commit tamamlandi" -ForegroundColor Green
} catch {
    Write-Host "✗ git commit basarisiz!" -ForegroundColor Red
}

# Adim 7: Branch ayarla
Write-Host ""
Write-Host "ADIM 7: Ana branch ayarlaniyor..." -ForegroundColor Green
try {
    git branch -M main
    Write-Host "✓ Ana branch 'main' olarak ayarlandi" -ForegroundColor Green
} catch {
    Write-Host "✗ Branch ayarlama basarisiz!" -ForegroundColor Red
}

# Adim 8: Remote ekle
Write-Host ""
Write-Host "ADIM 8: GitHub remote ekleniyor..." -ForegroundColor Green
try {
    git remote add origin $RepoUrl
    Write-Host "✓ Remote eklendi: $RepoUrl" -ForegroundColor Green
} catch {
    Write-Host "! Remote zaten mevcut olabilir, devam ediliyor..." -ForegroundColor Yellow
}

# Adim 9: Push
Write-Host ""
Write-Host "ADIM 9: GitHub'a yukleniyor..." -ForegroundColor Green
Write-Host ""
Write-Host "ONEMLI UYARI:" -ForegroundColor Red
Write-Host "Bu islem mevcut GitHub deposunun TUM GECMISINI SILECEK!" -ForegroundColor Red
Write-Host "Devam etmek istediginizden emin misiniz?" -ForegroundColor Yellow
Write-Host ""
Write-Host "Secenekler:" -ForegroundColor Cyan
Write-Host "1. Evet, mevcut depoyu tamamen degistir (TEHLIKELI)" -ForegroundColor Red
Write-Host "2. Hayir, manuel olarak yapmak istiyorum" -ForegroundColor Green
Write-Host ""

$choice = Read-Host "Seciminizi yapin (1 veya 2)"

if ($choice -eq "1") {
    Write-Host ""
    Write-Host "Son uyari: Bu islem geri alinamaz!" -ForegroundColor Red
    $confirm = Read-Host "Devam etmek icin 'EVET' yazin"
    
    if ($confirm -eq "EVET") {
        try {
            Write-Host "GitHub'a yukleniyor..." -ForegroundColor Yellow
            git push --force-with-lease origin main
            Write-Host ""
            Write-Host "================================" -ForegroundColor Green
            Write-Host "  BASARIYLA TAMAMLANDI!" -ForegroundColor Green
            Write-Host "================================" -ForegroundColor Green
            Write-Host ""
            Write-Host "GitHub deponuz temizlendi ve guncellendi!" -ForegroundColor Green
            Write-Host "URL: https://github.com/$GitHubUsername/$RepoName" -ForegroundColor Cyan
        } catch {
            Write-Host "✗ GitHub'a yukleme basarisiz!" -ForegroundColor Red
            Write-Host "Sebep: Muhtemelen authentication sorunu" -ForegroundColor Yellow
            Write-Host "Manuel olarak su komutu calistirin:" -ForegroundColor Cyan
            Write-Host "git push --force-with-lease origin main" -ForegroundColor White
        }
    } else {
        Write-Host "Islem iptal edildi." -ForegroundColor Yellow
    }
} else {
    Write-Host ""
    Write-Host "Manuel yukleme icin su komutlari kullanin:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "# Normal push (eger yeni repo ise):" -ForegroundColor Green
    Write-Host "git push -u origin main" -ForegroundColor White
    Write-Host ""
    Write-Host "# Force push (mevcut repo'yu degistirmek icin):" -ForegroundColor Red
    Write-Host "git push --force-with-lease origin main" -ForegroundColor White
    Write-Host ""
}

Write-Host ""
Write-Host "Sonraki adimlar:" -ForegroundColor Cyan
Write-Host "1. GitHub'da deponuzu kontrol edin" -ForegroundColor White
Write-Host "2. README.md dosyasinin duzgun goruntulendigini dogrulayin" -ForegroundColor White
Write-Host "3. Build scriptlerini test edin" -ForegroundColor White
Write-Host "4. Projeyi baska bir yerde klonlayip test edin" -ForegroundColor White
Write-Host ""
Write-Host "Test komutu:" -ForegroundColor Yellow
Write-Host "npm run dev" -ForegroundColor White
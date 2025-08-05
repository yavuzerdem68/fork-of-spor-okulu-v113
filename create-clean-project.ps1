# Temiz Proje Olusturma Scripti
# Bu script gerekli dosyalari yeni bir klasore kopyalar

param(
    [string]$TargetPath = "spor-okulu-temiz"
)

Write-Host "Temiz proje olusturuluyor..." -ForegroundColor Green
Write-Host "Hedef klasor: $TargetPath" -ForegroundColor Yellow

# Hedef klasoru olustur
if (Test-Path $TargetPath) {
    Write-Host "Hedef klasor zaten mevcut. Icerik silinecek..." -ForegroundColor Yellow
    Remove-Item -Path $TargetPath -Recurse -Force
}

New-Item -ItemType Directory -Path $TargetPath -Force | Out-Null

# Gerekli dosyalari kopyala
$filesToCopy = @(
    "package.json",
    "next.config.mjs",
    "tsconfig.json",
    "tailwind.config.js",
    "postcss.config.js",
    "components.json",
    ".gitignore",
    ".env.local.example",
    ".env.cloud.example",
    "build-local.ps1",
    "build-local.bat",
    "build-wordpress.ps1",
    "build-wordpress.bat",
    "POWERSHELL-KULLANIM-REHBERI.md"
)

Write-Host "Temel dosyalar kopyalaniyor..." -ForegroundColor Cyan

foreach ($file in $filesToCopy) {
    if (Test-Path $file) {
        Copy-Item -Path $file -Destination $TargetPath -Force
        Write-Host "  ✓ $file" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $file (bulunamadi)" -ForegroundColor Red
    }
}

# README dosyasini kopyala
if (Test-Path "README-TEMIZ.md") {
    Copy-Item -Path "README-TEMIZ.md" -Destination "$TargetPath\README.md" -Force
    Write-Host "  ✓ README.md (README-TEMIZ.md'den)" -ForegroundColor Green
}

# Klasorleri kopyala
$foldersToCopy = @("src", "public")

Write-Host "Klasorler kopyalaniyor..." -ForegroundColor Cyan

foreach ($folder in $foldersToCopy) {
    if (Test-Path $folder) {
        Copy-Item -Path $folder -Destination $TargetPath -Recurse -Force
        Write-Host "  ✓ $folder klasoru" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $folder klasoru (bulunamadi)" -ForegroundColor Red
    }
}

# Temiz .gitignore olustur
$gitignoreContent = @"
# Dependencies
node_modules/
/.pnp
.pnp.js

# Testing
/coverage

# Next.js
/.next/
/out/

# Production
/build

# Misc
.DS_Store
*.tsbuildinfo
next-env.d.ts

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env*.local
.env.local
.env.development.local
.env.test.local
.env.production.local

# Vercel
.vercel

# IDE
.vscode/
.idea/

# OS
Thumbs.db

# Logs
logs
*.log

# Data files (local storage)
data/
*.json.backup

# Build outputs
dist/
build/

# Package manager
pnpm-lock.yaml
yarn.lock
package-lock.json

# Temporary files
*.tmp
*.temp
"@

$gitignoreContent | Out-File -FilePath "$TargetPath\.gitignore" -Encoding UTF8 -Force

Write-Host ""
Write-Host "Temiz proje basariyla olusturuldu!" -ForegroundColor Green
Write-Host "Konum: $TargetPath" -ForegroundColor Yellow
Write-Host ""
Write-Host "Sonraki adimlar:" -ForegroundColor Cyan
Write-Host "1. cd $TargetPath" -ForegroundColor White
Write-Host "2. npm install" -ForegroundColor White
Write-Host "3. copy .env.local.example .env.local" -ForegroundColor White
Write-Host "4. npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "GitHub'a yuklemek icin:" -ForegroundColor Cyan
Write-Host "1. GitHub'da yeni repo olusturun" -ForegroundColor White
Write-Host "2. git init" -ForegroundColor White
Write-Host "3. git add ." -ForegroundColor White
Write-Host "4. git commit -m 'Initial clean version'" -ForegroundColor White
Write-Host "5. git remote add origin [REPO-URL]" -ForegroundColor White
Write-Host "6. git push -u origin main" -ForegroundColor White
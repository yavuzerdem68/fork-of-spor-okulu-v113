# WordPress Deployment Complete Script - PowerShell Version
# UTF-8 encoding support
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   WORDPRESS DEPLOYMENT - COMPLETE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "🔍 Sistem kontrolleri yapılıyor..." -ForegroundColor Yellow

# Node.js kontrolü
try {
    $nodeVersion = node --version 2>$null
    Write-Host "✅ Node.js hazır: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js bulunamadı! Lütfen Node.js kurun." -ForegroundColor Red
    Read-Host "Devam etmek için Enter'a basın"
    exit 1
}

# NPM kontrolü
try {
    $npmVersion = npm --version 2>$null
    Write-Host "✅ NPM hazır: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ NPM bulunamadı! Node.js kurulumunu kontrol edin." -ForegroundColor Red
    Read-Host "Devam etmek için Enter'a basın"
    exit 1
}

# Package.json kontrolü
if (-not (Test-Path "package.json")) {
    Write-Host "❌ package.json bulunamadı! Proje klasöründe olduğunuzdan emin olun." -ForegroundColor Red
    Read-Host "Devam etmek için Enter'a basın"
    exit 1
}

Write-Host "✅ Proje dosyaları hazır" -ForegroundColor Green

Write-Host ""
Write-Host "🧹 Temizlik işlemi başlatılıyor..." -ForegroundColor Yellow

# Eski build dosyalarını temizle
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
}
if (Test-Path "out") {
    Remove-Item -Recurse -Force "out"
}

Write-Host "✅ Eski build dosyaları temizlendi" -ForegroundColor Green

Write-Host ""
Write-Host "📦 Bağımlılıklar kontrol ediliyor..." -ForegroundColor Yellow

# Node modules kontrolü
if (-not (Test-Path "node_modules")) {
    Write-Host "📥 Node modules yükleniyor..." -ForegroundColor Blue
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ NPM install başarısız!" -ForegroundColor Red
        Read-Host "Devam etmek için Enter'a basın"
        exit 1
    }
}

Write-Host ""
Write-Host "🔨 WordPress build başlatılıyor..." -ForegroundColor Green
Write-Host "⏳ Bu işlem birkaç dakika sürebilir..." -ForegroundColor Yellow

# WordPress build
npm run build:wordpress

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ WordPress build başarısız oldu!" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔍 Olası nedenler:" -ForegroundColor Yellow
    Write-Host "- TypeScript hataları" -ForegroundColor White
    Write-Host "- Eksik bağımlılıklar" -ForegroundColor White
    Write-Host "- Bellek yetersizliği" -ForegroundColor White
    Write-Host ""
    Write-Host "💡 Çözüm önerileri:" -ForegroundColor Yellow
    Write-Host "1. npm install çalıştırın" -ForegroundColor White
    Write-Host "2. TypeScript hatalarını düzeltin" -ForegroundColor White
    Write-Host "3. Bilgisayarınızı yeniden başlatın" -ForegroundColor White
    Write-Host ""
    Read-Host "Devam etmek için Enter'a basın"
    exit 1
}

Write-Host "✅ WordPress build başarıyla tamamlandı!" -ForegroundColor Green

Write-Host ""
Write-Host "📁 .htaccess dosyası kopyalanıyor..." -ForegroundColor Blue

npm run copy-htaccess

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  .htaccess kopyalama başarısız, manuel kopyalayın" -ForegroundColor Yellow
} else {
    Write-Host "✅ .htaccess dosyası kopyalandı" -ForegroundColor Green
}

Write-Host ""
Write-Host "📊 Build sonuçları kontrol ediliyor..." -ForegroundColor Yellow

# Build sonuçlarını kontrol et
if (-not (Test-Path "out")) {
    Write-Host "❌ 'out' klasörü oluşmadı!" -ForegroundColor Red
    Read-Host "Devam etmek için Enter'a basın"
    exit 1
}

if (-not (Test-Path "out\index.html")) {
    Write-Host "❌ index.html dosyası bulunamadı!" -ForegroundColor Red
    Read-Host "Devam etmek için Enter'a basın"
    exit 1
}

if (-not (Test-Path "out\_next")) {
    Write-Host "❌ _next klasörü bulunamadı!" -ForegroundColor Red
    Read-Host "Devam etmek için Enter'a basın"
    exit 1
}

Write-Host "✅ Tüm gerekli dosyalar oluşturuldu" -ForegroundColor Green

Write-Host ""
Write-Host "📏 Dosya boyutları:" -ForegroundColor Cyan
Get-ChildItem "out" | ForEach-Object {
    $size = if ($_.PSIsContainer) { "Klasör" } else { "$([math]::Round($_.Length/1KB, 2)) KB" }
    Write-Host "  $($_.Name): $size" -ForegroundColor White
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   🎉 WORDPRESS DEPLOYMENT HAZIR!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📂 Deployment dosyaları: 'out' klasörü" -ForegroundColor White
Write-Host "🌐 Hedef konum: WordPress sitenizin /spor-okulu/ klasörü" -ForegroundColor White
Write-Host ""
Write-Host "📋 Sonraki adımlar:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. 'out' klasörünün TÜM içeriğini kopyalayın" -ForegroundColor White
Write-Host "2. WordPress sitenizin public_html/spor-okulu/ klasörüne yükleyin" -ForegroundColor White
Write-Host "3. Dosya izinlerini kontrol edin (755/644)" -ForegroundColor White
Write-Host "4. https://siteniz.com/spor-okulu/ adresini test edin" -ForegroundColor White
Write-Host ""
Write-Host "📖 Detaylı kurulum için: WORDPRESS-DEPLOYMENT-REHBERI-FINAL.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  ÖNEMLİ NOTLAR:" -ForegroundColor Yellow
Write-Host "- .htaccess dosyasının yüklendiğinden emin olun" -ForegroundColor White
Write-Host "- WordPress Application Password'ünüzü hazır bulundurun" -ForegroundColor White
Write-Host "- İlk kurulumda sistem ayarlarını yapılandırın" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Deployment klasörünü açmak ister misiniz? (E/H)"
if ($choice -eq "E" -or $choice -eq "e") {
    Start-Process explorer "out"
}

Write-Host ""
Write-Host "✅ WordPress deployment tamamlandı!" -ForegroundColor Green
Read-Host "Devam etmek için Enter'a basın"
# WordPress Build Script for PowerShell
# Hibrit sistem - WordPress dağıtımı

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   WORDPRESS DAĞITIMI BAŞLATILIYOR" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "🧹 Önce temizlik yapılıyor..." -ForegroundColor Yellow
npm run clean

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Temizlik işlemi başarısız oldu!" -ForegroundColor Red
    Read-Host "Devam etmek için Enter'a basın"
    exit 1
}

Write-Host ""
Write-Host "🔨 WordPress build başlatılıyor..." -ForegroundColor Green
npm run build:wordpress

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Build başarısız oldu!" -ForegroundColor Red
    Write-Host "Hata detayları için yukarıdaki logları kontrol edin." -ForegroundColor Yellow
    Read-Host "Devam etmek için Enter'a basın"
    exit 1
}

Write-Host ""
Write-Host "📁 .htaccess dosyası kopyalanıyor..." -ForegroundColor Blue
npm run copy-htaccess

Write-Host ""
Write-Host "✅ WordPress build başarıyla tamamlandı!" -ForegroundColor Green
Write-Host ""
Write-Host "📂 Dağıtım dosyaları 'out' klasöründe hazır" -ForegroundColor Cyan
Write-Host "🌐 WordPress sitenizin /spor-okulu/ klasörüne yükleyin" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Dağıtım Adımları:" -ForegroundColor Yellow
Write-Host "1. 'out' klasörünün içeriğini WordPress sitenizin /spor-okulu/ klasörüne yükleyin" -ForegroundColor White
Write-Host "2. .htaccess dosyasının doğru yerde olduğundan emin olun" -ForegroundColor White
Write-Host "3. https://siteniz.com/spor-okulu/ adresinden erişim sağlayın" -ForegroundColor White
Write-Host ""
Read-Host "Devam etmek için Enter'a basın"
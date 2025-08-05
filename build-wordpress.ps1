# WordPress Build Script for PowerShell
# Hibrit sistem - WordPress dagitimi

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   WORDPRESS DAGITIMI BASLATILIYOR" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Temizlik yapiliyor..." -ForegroundColor Yellow
npm run clean

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "Temizlik islemi basarisiz oldu!" -ForegroundColor Red
    Read-Host "Devam etmek icin Enter'a basin"
    exit 1
}

Write-Host ""
Write-Host "WordPress build baslatiliyor..." -ForegroundColor Green
npm run build:wordpress

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "Build basarisiz oldu!" -ForegroundColor Red
    Write-Host "Hata detaylari icin yukaridaki loglari kontrol edin." -ForegroundColor Yellow
    Read-Host "Devam etmek icin Enter'a basin"
    exit 1
}

Write-Host ""
Write-Host ".htaccess dosyasi kopyalaniyor..." -ForegroundColor Blue
npm run copy-htaccess

Write-Host ""
Write-Host "WordPress build basariyla tamamlandi!" -ForegroundColor Green
Write-Host ""
Write-Host "Dagitim dosyalari 'out' klasorunde hazir" -ForegroundColor Cyan
Write-Host "WordPress sitenizin /spor-okulu/ klasorune yukleyin" -ForegroundColor Cyan
Write-Host ""
Write-Host "Dagitim Adimlari:" -ForegroundColor Yellow
Write-Host "1. 'out' klasorunun icerigini WordPress sitenizin /spor-okulu/ klasorune yukleyin" -ForegroundColor White
Write-Host "2. .htaccess dosyasinin dogru yerde oldugunden emin olun" -ForegroundColor White
Write-Host "3. https://siteniz.com/spor-okulu/ adresinden erisim saglayin" -ForegroundColor White
Write-Host ""
Read-Host "Devam etmek icin Enter'a basin"
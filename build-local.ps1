# Local Build Script for PowerShell
# Hibrit sistem - Lokal dagitim

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    LOKAL DAGITIM BASLATILIYOR" -ForegroundColor Cyan
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
Write-Host "Lokal build baslatiliyor..." -ForegroundColor Green
npm run build:local

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "Build basarisiz oldu!" -ForegroundColor Red
    Write-Host "Hata detaylari icin yukaridaki loglari kontrol edin." -ForegroundColor Yellow
    Read-Host "Devam etmek icin Enter'a basin"
    exit 1
}

Write-Host ""
Write-Host "Lokal build basariyla tamamlandi!" -ForegroundColor Green
Write-Host ""
Write-Host "Uygulamayi baslatmak icin: npm start" -ForegroundColor Cyan
Write-Host "Gelistirme modu icin: npm run dev" -ForegroundColor Cyan
Write-Host ""
Read-Host "Devam etmek icin Enter'a basin"
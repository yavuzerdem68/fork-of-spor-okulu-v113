# Local Build Script for PowerShell
# Hibrit sistem - Lokal dağıtım

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    LOKAL DAĞITIM BAŞLATILIYOR" -ForegroundColor Cyan
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
Write-Host "🔨 Lokal build başlatılıyor..." -ForegroundColor Green
npm run build:local

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Build başarısız oldu!" -ForegroundColor Red
    Write-Host "Hata detayları için yukarıdaki logları kontrol edin." -ForegroundColor Yellow
    Read-Host "Devam etmek için Enter'a basın"
    exit 1
}

Write-Host ""
Write-Host "✅ Lokal build başarıyla tamamlandı!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Uygulamayı başlatmak için: npm start" -ForegroundColor Cyan
Write-Host "💻 Geliştirme modu için: npm run dev" -ForegroundColor Cyan
Write-Host ""
Read-Host "Devam etmek için Enter'a basın"
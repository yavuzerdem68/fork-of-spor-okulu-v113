# Spor Okulu CRM - Final Deployment Script
# PowerShell version for better compatibility

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   SPOR OKULU CRM - FINAL DEPLOYMENT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Bu script hem WordPress hem de lokal kullanim icin" -ForegroundColor Yellow
Write-Host "gerekli dosyalari hazirlar." -ForegroundColor Yellow
Write-Host ""

function Show-Menu {
    Write-Host "Lutfen deployment tipini secin:" -ForegroundColor White
    Write-Host ""
    Write-Host "1. WordPress Deployment (Hosting icin)" -ForegroundColor Green
    Write-Host "2. Lokal Development Setup" -ForegroundColor Blue
    Write-Host "3. Her ikisi birden" -ForegroundColor Magenta
    Write-Host "4. Cikis" -ForegroundColor Red
    Write-Host ""
}

function Deploy-WordPress {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "   WORDPRESS DEPLOYMENT BASLATILIYOR" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""

    Write-Host "🧹 Temizlik yapiliyor..." -ForegroundColor Yellow
    npm run clean

    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Temizlik basarisiz oldu!" -ForegroundColor Red
        return $false
    }

    Write-Host ""
    Write-Host "🔨 WordPress build baslatiliyor..." -ForegroundColor Green
    npm run build:wordpress

    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ WordPress build basarisiz oldu!" -ForegroundColor Red
        Write-Host "Hata detaylari icin yukaridaki loglari kontrol edin." -ForegroundColor Yellow
        return $false
    }

    Write-Host ""
    Write-Host "📁 .htaccess dosyasi kopyalaniyor..." -ForegroundColor Blue
    npm run copy-htaccess

    Write-Host ""
    Write-Host "✅ WordPress deployment basariyla tamamlandi!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📂 Deployment dosyalari 'out' klasorunde hazir" -ForegroundColor Cyan
    Write-Host "🌐 WordPress sitenizin /spor-okulu/ klasorune yukleyin" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📋 Sonraki Adimlar:" -ForegroundColor Yellow
    Write-Host "1. 'out' klasorunun icerigini WordPress sitenizin /spor-okulu/ klasorune yukleyin" -ForegroundColor White
    Write-Host "2. .htaccess dosyasinin dogru yerde oldugunden emin olun" -ForegroundColor White
    Write-Host "3. WordPress admin panelinde Application Password olusturun" -ForegroundColor White
    Write-Host "4. https://siteniz.com/spor-okulu/ adresinden erisim saglayin" -ForegroundColor White
    Write-Host ""
    
    return $true
}

function Setup-Local {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "   LOKAL DEVELOPMENT SETUP" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""

    Write-Host "🔧 Lokal gelistirme ortami hazirlaniyor..." -ForegroundColor Yellow
    Write-Host ""

    Write-Host "📦 Dependencies kontrol ediliyor..." -ForegroundColor Blue
    npm install

    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ npm install basarisiz oldu!" -ForegroundColor Red
        return $false
    }

    Write-Host ""
    Write-Host "✅ Lokal setup tamamlandi!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 Uygulama http://localhost:3000 adresinde calisacak" -ForegroundColor Cyan
    Write-Host "📝 Gelistirme icin 'npm run dev' komutunu kullanin" -ForegroundColor Cyan
    Write-Host ""

    $startDev = Read-Host "Development server baslatilsin mi? (y/n)"
    if ($startDev -eq "y" -or $startDev -eq "Y") {
        Write-Host ""
        Write-Host "🚀 Development server baslatiliyor..." -ForegroundColor Green
        npm run dev
    } else {
        Write-Host ""
        Write-Host "Manuel olarak baslatmak icin: npm run dev" -ForegroundColor Yellow
    }
    
    return $true
}

function Deploy-Both {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "   HER IKI DEPLOYMENT HAZIRLANIYOR" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""

    Write-Host "🧹 Temizlik yapiliyor..." -ForegroundColor Yellow
    npm run clean

    Write-Host ""
    Write-Host "📦 Dependencies kontrol ediliyor..." -ForegroundColor Blue
    npm install

    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ npm install basarisiz oldu!" -ForegroundColor Red
        return $false
    }

    Write-Host ""
    Write-Host "🔨 WordPress build baslatiliyor..." -ForegroundColor Green
    npm run build:wordpress

    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ WordPress build basarisiz oldu!" -ForegroundColor Red
        return $false
    }

    Write-Host ""
    Write-Host "📁 .htaccess dosyasi kopyalaniyor..." -ForegroundColor Blue
    npm run copy-htaccess

    Write-Host ""
    Write-Host "✅ Her iki deployment de basariyla hazirlandi!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📂 WordPress dosyalari: 'out' klasorunde" -ForegroundColor Cyan
    Write-Host "🌐 Lokal gelistirme: 'npm run dev' ile baslatilabilir" -ForegroundColor Cyan
    Write-Host ""
    
    return $true
}

function Show-CompletionMessage {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "   DEPLOYMENT TAMAMLANDI" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📚 Detayli kurulum rehberi icin:" -ForegroundColor Yellow
    Write-Host "   - WORDPRESS-DEPLOYMENT-REHBERI-FINAL.md dosyasini okuyun" -ForegroundColor White
    Write-Host ""
    Write-Host "🔧 Yaygın sorunlar ve cozumleri icin:" -ForegroundColor Yellow
    Write-Host "   - LOKAL-SORUN-COZUMU.md dosyasini kontrol edin" -ForegroundColor White
    Write-Host ""
    Write-Host "💡 Hizli baslangic icin:" -ForegroundColor Yellow
    Write-Host "   - WordPress: 'out' klasorunu sitenize yukleyin" -ForegroundColor White
    Write-Host "   - Lokal: 'npm run dev' komutunu calistirin" -ForegroundColor White
    Write-Host ""
}

# Ana program döngüsü
do {
    Show-Menu
    $choice = Read-Host "Seciminizi yapin (1-4)"
    
    switch ($choice) {
        "1" { 
            $success = Deploy-WordPress
            if ($success) { Show-CompletionMessage }
        }
        "2" { 
            $success = Setup-Local
            if ($success) { Show-CompletionMessage }
        }
        "3" { 
            $success = Deploy-Both
            if ($success) { Show-CompletionMessage }
        }
        "4" { 
            Write-Host "Tesekkurler! Spor Okulu CRM kullandiginiz icin..." -ForegroundColor Green
            break
        }
        default { 
            Write-Host "Gecersiz secim! Tekrar deneyin." -ForegroundColor Red
        }
    }
    
    if ($choice -ne "4") {
        Write-Host ""
        Read-Host "Devam etmek icin Enter'a basin"
        Clear-Host
    }
} while ($choice -ne "4")
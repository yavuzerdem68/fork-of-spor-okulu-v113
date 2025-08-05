# PowerShell Execution Policy Fix
# Bu script PowerShell execution policy sorununu çözer

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  POWERSHELL EXECUTION POLICY FIX" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "🔍 Mevcut execution policy kontrol ediliyor..." -ForegroundColor Yellow
$currentPolicy = Get-ExecutionPolicy
Write-Host "Mevcut policy: $currentPolicy" -ForegroundColor White
Write-Host ""

if ($currentPolicy -eq "Restricted") {
    Write-Host "⚠️  Execution policy 'Restricted' olarak ayarlanmış." -ForegroundColor Red
    Write-Host "Bu, PowerShell scriptlerinin çalışmasını engelliyor." -ForegroundColor Yellow
    Write-Host ""
    
    Write-Host "🔧 Çözüm seçenekleri:" -ForegroundColor Cyan
    Write-Host "1. Geçici çözüm (sadece bu oturum için)" -ForegroundColor White
    Write-Host "2. Kalıcı çözüm (tüm kullanıcı için)" -ForegroundColor White
    Write-Host "3. Dosyaları unblock et" -ForegroundColor White
    Write-Host ""
    
    $choice = Read-Host "Seçiminizi yapın (1/2/3)"
    
    switch ($choice) {
        "1" {
            Write-Host ""
            Write-Host "🔄 Geçici çözüm uygulanıyor..." -ForegroundColor Green
            Write-Host "Aşağıdaki komutu çalıştırın:" -ForegroundColor Yellow
            Write-Host "Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process" -ForegroundColor Cyan
            Write-Host ""
            Write-Host "Sonra build scriptinizi tekrar çalıştırın." -ForegroundColor White
        }
        "2" {
            Write-Host ""
            Write-Host "🔄 Kalıcı çözüm uygulanıyor..." -ForegroundColor Green
            try {
                Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
                Write-Host "✅ Execution policy başarıyla değiştirildi!" -ForegroundColor Green
                Write-Host "Artık local scriptleri çalıştırabilirsiniz." -ForegroundColor White
            }
            catch {
                Write-Host "❌ Policy değiştirilemedi. Yönetici olarak çalıştırın." -ForegroundColor Red
            }
        }
        "3" {
            Write-Host ""
            Write-Host "🔓 Dosyalar unblock ediliyor..." -ForegroundColor Green
            try {
                Unblock-File -Path ".\build-local.ps1"
                Unblock-File -Path ".\build-wordpress.ps1"
                Unblock-File -Path ".\start-local.ps1"
                Write-Host "✅ Dosyalar başarıyla unblock edildi!" -ForegroundColor Green
            }
            catch {
                Write-Host "❌ Dosyalar unblock edilemedi." -ForegroundColor Red
            }
        }
        default {
            Write-Host "❌ Geçersiz seçim!" -ForegroundColor Red
        }
    }
}
else {
    Write-Host "✅ Execution policy uygun: $currentPolicy" -ForegroundColor Green
    Write-Host "PowerShell scriptleri çalışabilir durumda." -ForegroundColor White
    
    Write-Host ""
    Write-Host "🔓 Güvenlik için dosyalar unblock ediliyor..." -ForegroundColor Blue
    try {
        Unblock-File -Path ".\build-local.ps1" -ErrorAction SilentlyContinue
        Unblock-File -Path ".\build-wordpress.ps1" -ErrorAction SilentlyContinue
        Unblock-File -Path ".\start-local.ps1" -ErrorAction SilentlyContinue
        Write-Host "✅ Dosyalar unblock edildi!" -ForegroundColor Green
    }
    catch {
        Write-Host "⚠️  Bazı dosyalar unblock edilemedi, ancak çalışabilir." -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "📋 Kullanım Talimatları:" -ForegroundColor Cyan
Write-Host "• Lokal build için: .\build-local.ps1" -ForegroundColor White
Write-Host "• WordPress build için: .\build-wordpress.ps1" -ForegroundColor White
Write-Host "• Lokal başlatma için: .\start-local.ps1" -ForegroundColor White
Write-Host ""

Write-Host "💡 Alternatif: Batch dosyalarını da kullanabilirsiniz:" -ForegroundColor Yellow
Write-Host "• build-local.bat" -ForegroundColor White
Write-Host "• build-wordpress.bat" -ForegroundColor White
Write-Host ""

Read-Host "Devam etmek için Enter'a basın"
# PowerShell Execution Policy Fix
# Bu script PowerShell execution policy sorununu cozer

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  POWERSHELL EXECUTION POLICY FIX" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Mevcut execution policy kontrol ediliyor..." -ForegroundColor Yellow
$currentPolicy = Get-ExecutionPolicy
Write-Host "Mevcut policy: $currentPolicy" -ForegroundColor White
Write-Host ""

if ($currentPolicy -eq "Restricted") {
    Write-Host "Execution policy 'Restricted' olarak ayarlanmis." -ForegroundColor Red
    Write-Host "Bu, PowerShell scriptlerinin calismasini engelliyor." -ForegroundColor Yellow
    Write-Host ""
    
    Write-Host "Cozum secenekleri:" -ForegroundColor Cyan
    Write-Host "1. Gecici cozum (sadece bu oturum icin)" -ForegroundColor White
    Write-Host "2. Kalici cozum (tum kullanici icin)" -ForegroundColor White
    Write-Host "3. Dosyalari unblock et" -ForegroundColor White
    Write-Host ""
    
    $choice = Read-Host "Seciminizi yapin (1/2/3)"
    
    switch ($choice) {
        "1" {
            Write-Host ""
            Write-Host "Gecici cozum uygulanacak..." -ForegroundColor Green
            Write-Host "Asagidaki komutu calistirin:" -ForegroundColor Yellow
            Write-Host "Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process" -ForegroundColor Cyan
            Write-Host ""
            Write-Host "Sonra build scriptinizi tekrar calistirin." -ForegroundColor White
        }
        "2" {
            Write-Host ""
            Write-Host "Kalici cozum uygulanacak..." -ForegroundColor Green
            try {
                Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
                Write-Host "Execution policy basariyla degistirildi!" -ForegroundColor Green
                Write-Host "Artik local scriptleri calistirabilisiniz." -ForegroundColor White
            }
            catch {
                Write-Host "Policy degistirilemedi. Yonetici olarak calistirin." -ForegroundColor Red
            }
        }
        "3" {
            Write-Host ""
            Write-Host "Dosyalar unblock ediliyor..." -ForegroundColor Green
            try {
                Unblock-File -Path ".\build-local.ps1"
                Unblock-File -Path ".\build-wordpress.ps1"
                Unblock-File -Path ".\start-local.ps1"
                Write-Host "Dosyalar basariyla unblock edildi!" -ForegroundColor Green
            }
            catch {
                Write-Host "Dosyalar unblock edilemedi." -ForegroundColor Red
            }
        }
        default {
            Write-Host "Gecersiz secim!" -ForegroundColor Red
        }
    }
}
else {
    Write-Host "Execution policy uygun: $currentPolicy" -ForegroundColor Green
    Write-Host "PowerShell scriptleri calisabilir durumda." -ForegroundColor White
    
    Write-Host ""
    Write-Host "Guvenlik icin dosyalar unblock ediliyor..." -ForegroundColor Blue
    try {
        Unblock-File -Path ".\build-local.ps1" -ErrorAction SilentlyContinue
        Unblock-File -Path ".\build-wordpress.ps1" -ErrorAction SilentlyContinue
        Unblock-File -Path ".\start-local.ps1" -ErrorAction SilentlyContinue
        Write-Host "Dosyalar unblock edildi!" -ForegroundColor Green
    }
    catch {
        Write-Host "Bazi dosyalar unblock edilemedi, ancak calisabilir." -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Kullanim Talimatlari:" -ForegroundColor Cyan
Write-Host "• Lokal build icin: .\build-local.ps1" -ForegroundColor White
Write-Host "• WordPress build icin: .\build-wordpress.ps1" -ForegroundColor White
Write-Host "• Lokal baslatma icin: .\start-local.ps1" -ForegroundColor White
Write-Host ""

Write-Host "Alternatif: Batch dosyalarini da kullanabilirsiniz:" -ForegroundColor Yellow
Write-Host "• build-local.bat" -ForegroundColor White
Write-Host "• build-wordpress.bat" -ForegroundColor White
Write-Host ""

Read-Host "Devam etmek icin Enter'a basin"
# SportsCRM - Complete Data Reset Script
# This script clears all browser localStorage and cache data

# Set console encoding to UTF-8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                    SportsCRM - Komple Veri Temizleme                        ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

Write-Host "Bu script şunları yapacak:" -ForegroundColor Yellow
Write-Host "• Tarayıcı önbelleğini temizleyecek" -ForegroundColor White
Write-Host "• LocalStorage verilerini sıfırlayacak" -ForegroundColor White
Write-Host "• Geçici dosyaları temizleyecek" -ForegroundColor White
Write-Host "• Uygulamayı yeniden başlatacak" -ForegroundColor White
Write-Host ""

Write-Host "⚠️  UYARI: Bu işlem GERİ ALINAMAZ!" -ForegroundColor Red
Write-Host "⚠️  Tüm sporcu kayıtları, ödemeler ve ayarlar silinecek!" -ForegroundColor Red
Write-Host ""

$confirm = Read-Host "Devam etmek istediğinizden emin misiniz? (E/H)"
if ($confirm -ne "E" -and $confirm -ne "e") {
    Write-Host "İşlem iptal edildi." -ForegroundColor Yellow
    Read-Host "Çıkmak için Enter'a basın"
    exit
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "🧹 Veri temizleme başlatılıyor..." -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Green

# Function to safely remove directory
function Remove-DirectorySafely {
    param([string]$Path)
    if (Test-Path $Path) {
        try {
            Remove-Item -Path $Path -Recurse -Force -ErrorAction SilentlyContinue
            return $true
        } catch {
            return $false
        }
    }
    return $false
}

# Function to safely kill process
function Stop-ProcessSafely {
    param([string]$ProcessName)
    try {
        Get-Process -Name $ProcessName -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
    } catch {
        # Ignore errors
    }
}

Write-Host ""
Write-Host "[1/5] Chrome tarayıcı verilerini temizleme..." -ForegroundColor Cyan

Stop-ProcessSafely -ProcessName "chrome"

$chromePaths = @(
    "$env:LOCALAPPDATA\Google\Chrome\User Data\Default\Local Storage",
    "$env:LOCALAPPDATA\Google\Chrome\User Data\Default\Session Storage",
    "$env:LOCALAPPDATA\Google\Chrome\User Data\Default\IndexedDB"
)

$chromeCleared = $false
foreach ($path in $chromePaths) {
    if (Remove-DirectorySafely -Path $path) {
        $chromeCleared = $true
    }
}

if ($chromeCleared) {
    Write-Host "✅ Chrome LocalStorage temizlendi" -ForegroundColor Green
} else {
    Write-Host "ℹ️  Chrome LocalStorage bulunamadı" -ForegroundColor Gray
}

Write-Host ""
Write-Host "[2/5] Edge tarayıcı verilerini temizleme..." -ForegroundColor Cyan

Stop-ProcessSafely -ProcessName "msedge"

$edgePaths = @(
    "$env:LOCALAPPDATA\Microsoft\Edge\User Data\Default\Local Storage",
    "$env:LOCALAPPDATA\Microsoft\Edge\User Data\Default\Session Storage",
    "$env:LOCALAPPDATA\Microsoft\Edge\User Data\Default\IndexedDB"
)

$edgeCleared = $false
foreach ($path in $edgePaths) {
    if (Remove-DirectorySafely -Path $path) {
        $edgeCleared = $true
    }
}

if ($edgeCleared) {
    Write-Host "✅ Edge LocalStorage temizlendi" -ForegroundColor Green
} else {
    Write-Host "ℹ️  Edge LocalStorage bulunamadı" -ForegroundColor Gray
}

Write-Host ""
Write-Host "[3/5] Firefox tarayıcı verilerini temizleme..." -ForegroundColor Cyan

Stop-ProcessSafely -ProcessName "firefox"

$firefoxProfilesPath = "$env:APPDATA\Mozilla\Firefox\Profiles"
$firefoxCleared = $false

if (Test-Path $firefoxProfilesPath) {
    $profiles = Get-ChildItem -Path $firefoxProfilesPath -Directory -ErrorAction SilentlyContinue
    foreach ($profile in $profiles) {
        $webappsstorePath = Join-Path $profile.FullName "webappsstore.sqlite"
        $storagePath = Join-Path $profile.FullName "storage"
        
        if (Test-Path $webappsstorePath) {
            try {
                Remove-Item -Path $webappsstorePath -Force -ErrorAction SilentlyContinue
                $firefoxCleared = $true
            } catch { }
        }
        
        if (Remove-DirectorySafely -Path $storagePath) {
            $firefoxCleared = $true
        }
    }
}

if ($firefoxCleared) {
    Write-Host "✅ Firefox LocalStorage temizlendi" -ForegroundColor Green
} else {
    Write-Host "ℹ️  Firefox profili bulunamadı" -ForegroundColor Gray
}

Write-Host ""
Write-Host "[4/5] Sistem geçici dosyalarını temizleme..." -ForegroundColor Cyan

$tempPaths = @(
    "$env:TEMP\sportscrm*",
    "$env:LOCALAPPDATA\Temp\*sportscrm*"
)

$tempCleared = $false
foreach ($path in $tempPaths) {
    try {
        $files = Get-ChildItem -Path $path -ErrorAction SilentlyContinue
        if ($files) {
            Remove-Item -Path $path -Force -Recurse -ErrorAction SilentlyContinue
            $tempCleared = $true
        }
    } catch { }
}

if ($tempCleared) {
    Write-Host "✅ SportsCRM geçici dosyaları temizlendi" -ForegroundColor Green
} else {
    Write-Host "ℹ️  Geçici dosya bulunamadı" -ForegroundColor Gray
}

Write-Host ""
Write-Host "[5/5] DNS önbelleğini temizleme..." -ForegroundColor Cyan

try {
    ipconfig /flushdns | Out-Null
    Write-Host "✅ DNS önbelleği temizlendi" -ForegroundColor Green
} catch {
    Write-Host "⚠️  DNS önbelleği temizlenemedi" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "✅ VERİ TEMİZLEME TAMAMLANDI!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""

Write-Host "🎉 Tüm veriler başarıyla temizlendi!" -ForegroundColor Green
Write-Host ""
Write-Host "Şimdi yapmanız gerekenler:" -ForegroundColor Yellow
Write-Host "1. Tarayıcınızı tamamen kapatın" -ForegroundColor White
Write-Host "2. Tarayıcıyı yeniden açın" -ForegroundColor White
Write-Host "3. SportsCRM uygulamasına gidin" -ForegroundColor White
Write-Host "4. Temiz bir başlangıç yapın!" -ForegroundColor White
Write-Host ""
Write-Host "💡 İpucu: Ctrl+Shift+Delete ile tarayıcı geçmişini de temizleyebilirsiniz" -ForegroundColor Cyan
Write-Host ""

$restart = Read-Host "Tarayıcıyı şimdi yeniden başlatmak ister misiniz? (E/H)"
if ($restart -eq "E" -or $restart -eq "e") {
    Write-Host ""
    Write-Host "🚀 Tarayıcı yeniden başlatılıyor..." -ForegroundColor Green
    
    $url = "http://localhost:3000"
    $browserStarted = $false
    
    # Try Chrome first
    $chromePaths = @(
        "${env:ProgramFiles}\Google\Chrome\Application\chrome.exe",
        "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe"
    )
    
    foreach ($chromePath in $chromePaths) {
        if (Test-Path $chromePath) {
            try {
                Start-Process -FilePath $chromePath -ArgumentList $url
                Write-Host "✅ Chrome başlatıldı" -ForegroundColor Green
                $browserStarted = $true
                break
            } catch { }
        }
    }
    
    # Try Edge if Chrome failed
    if (-not $browserStarted) {
        $edgePath = "${env:ProgramFiles}\Microsoft\Edge\Application\msedge.exe"
        if (Test-Path $edgePath) {
            try {
                Start-Process -FilePath $edgePath -ArgumentList $url
                Write-Host "✅ Edge başlatıldı" -ForegroundColor Green
                $browserStarted = $true
            } catch { }
        }
    }
    
    # Use default browser if others failed
    if (-not $browserStarted) {
        try {
            Start-Process $url
            Write-Host "✅ Varsayılan tarayıcı başlatıldı" -ForegroundColor Green
        } catch {
            Write-Host "⚠️  Tarayıcı başlatılamadı. Manuel olarak açın." -ForegroundColor Yellow
        }
    }
    
    Start-Sleep -Seconds 3
    Write-Host ""
    Write-Host "🎯 SportsCRM uygulaması açılıyor..." -ForegroundColor Green
    Write-Host "📍 Adres: http://localhost:3000" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "ℹ️  Manuel olarak tarayıcınızı açıp http://localhost:3000 adresine gidin" -ForegroundColor Gray
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "🏁 İşlem tamamlandı! İyi çalışmalar!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""

Read-Host "Çıkmak için Enter'a basın"
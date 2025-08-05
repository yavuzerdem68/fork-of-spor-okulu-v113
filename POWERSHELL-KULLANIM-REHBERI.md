# POWERSHELL KULLANIM REHBERİ
## Hibrit Sistem - PowerShell Desteği

Bu rehber PowerShell kullanıcıları için hazırlanmıştır.

## ⚠️ ÖNEMLİ: EXECUTION POLICY SORUNU

Eğer aşağıdaki hatayı alıyorsanız:
```
The file cannot be loaded. The file is not digitally signed.
```

**ÇÖZÜM:** Önce execution policy fix scriptini çalıştırın:
```powershell
.\fix-powershell-policy.ps1
```

Bu script size 3 seçenek sunar:
1. **Geçici çözüm** - Sadece mevcut oturum için
2. **Kalıcı çözüm** - Kullanıcı için kalıcı ayar  
3. **Dosya unblock** - Sadece bu dosyaları unblock et

### Alternatif Hızlı Çözümler:

**Seçenek 1: Geçici Bypass (Önerilen)**
```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
```

**Seçenek 2: Dosyaları Unblock Et**
```powershell
Unblock-File -Path ".\build-local.ps1"
Unblock-File -Path ".\build-wordpress.ps1"
```

**Seçenek 3: Kalıcı Ayar (Dikkatli Kullanın)**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## 🚀 HIZLI BAŞLATMA

### PowerShell'de Build Script'leri Çalıştırma:

#### WordPress Dağıtımı:
```powershell
# PowerShell script'i çalıştır
.\build-wordpress.ps1

# Veya batch dosyasını çalıştır
.\build-wordpress.bat
```

#### Lokal Dağıtım:
```powershell
# PowerShell script'i çalıştır
.\build-local.ps1

# Veya batch dosyasını çalıştır
.\build-local.bat
```

## 🔧 POWERSHELL EXECUTION POLICY

Eğer script çalıştırma hatası alırsanız:

```powershell
# Execution policy'yi kontrol edin
Get-ExecutionPolicy

# Geçici olarak değiştirin (önerilen)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Veya sadece bu script için
PowerShell -ExecutionPolicy Bypass -File .\build-wordpress.ps1
```

## 📋 KULLANILABILIR KOMUTLAR

### PowerShell Script'leri (.ps1):
- `.\build-wordpress.ps1` - WordPress dağıtımı
- `.\build-local.ps1` - Lokal dağıtım

### Batch Dosyaları (.bat):
- `.\build-wordpress.bat` - WordPress dağıtımı
- `.\build-local.bat` - Lokal dağıtım

### NPM Komutları:
```powershell
# Geliştirme modu
npm run dev

# Lokal build
npm run build:local

# WordPress build
npm run build:wordpress

# Temizlik
npm run clean
```

## 🌐 WORDPRESS DAĞITIMI

### 1. Build Yapın:
```powershell
.\build-wordpress.ps1
```

### 2. Dosyaları Kontrol Edin:
- `out/` klasörü oluşturuldu mu?
- `.htaccess` dosyası `out/` içinde mi?

### 3. WordPress'e Yükleyin:
- `out/` klasörünün içeriğini WordPress sitenizin `/spor-okulu/` klasörüne yükleyin

### 4. Test Edin:
- `https://siteniz.com/spor-okulu/` adresinden erişim sağlayın

## 💻 LOKAL ÇALIŞMA

### Geliştirme Modu:
```powershell
npm run dev
# http://localhost:3000
```

### Production Build:
```powershell
.\build-local.ps1
npm start
# http://localhost:3000
```

## 🚨 SORUN GİDERME

### PowerShell Script Çalışmıyor:
```powershell
# Execution policy'yi kontrol edin
Get-ExecutionPolicy

# Geçici çözüm
PowerShell -ExecutionPolicy Bypass -File .\build-wordpress.ps1
```

### Batch Dosyası Çalışmıyor:
```powershell
# Önüne .\ ekleyin
.\build-wordpress.bat

# Veya tam yolu kullanın
& ".\build-wordpress.bat"
```

### NPM Komutları Çalışmıyor:
```powershell
# Node.js ve npm kurulu mu kontrol edin
node --version
npm --version

# Package'ları yükleyin
npm install
```

## 🔐 GÜVENLİK

### Execution Policy Ayarları:
- **Restricted** - Hiçbir script çalışmaz (varsayılan)
- **RemoteSigned** - Yerel script'ler çalışır (önerilen)
- **Unrestricted** - Tüm script'ler çalışır (dikkatli kullanın)

### Güvenli Kullanım:
```powershell
# Sadece bu oturum için
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process

# Sadece mevcut kullanıcı için
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## 📁 DOSYA YAPISI

```
├── build-wordpress.ps1     # PowerShell - WordPress build
├── build-local.ps1         # PowerShell - Lokal build
├── build-wordpress.bat     # Batch - WordPress build
├── build-local.bat         # Batch - Lokal build
├── package.json            # NPM script'leri
└── next.config.mjs         # Hibrit konfigürasyon
```

## 💡 İPUÇLARI

### PowerShell'de Tab Completion:
- Dosya adlarını yazmaya başlayın ve Tab'a basın
- `.\build-w` + Tab = `.\build-wordpress.ps1`

### Hızlı Erişim:
```powershell
# Alias oluşturun
Set-Alias wp .\build-wordpress.ps1
Set-Alias local .\build-local.ps1

# Kullanım
wp    # WordPress build
local # Lokal build
```

### Hata Logları:
```powershell
# Hataları dosyaya kaydedin
.\build-wordpress.ps1 2>&1 | Tee-Object -FilePath "build-log.txt"
```

## 📞 DESTEK

PowerShell ile ilgili sorunlar için:

1. **Execution Policy** hatası → `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser`
2. **Script bulunamadı** hatası → `.\script-adi.ps1` formatını kullanın
3. **NPM komutları** çalışmıyor → Node.js kurulumunu kontrol edin

---

**🎉 PowerShell desteği ile hibrit sistem kullanıma hazır!**
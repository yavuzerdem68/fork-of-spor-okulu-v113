# Hızlı Başlatma Rehberi

Bu rehber, uygulamayı en hızlı şekilde çalıştırmanız için hazırlanmıştır.

## Otomatik Başlatma (Önerilen)

### Windows Kullanıcıları

#### Seçenek 1: PowerShell (En Güvenli)
1. `start-local.ps1` dosyasına sağ tıklayın
2. **"PowerShell ile çalıştır"** seçin
3. Eğer çalışmazsa PowerShell'i yönetici olarak açın:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\start-local.ps1
```

#### Seçenek 2: Güvenli Batch
1. `start-local-safe.bat` dosyasına çift tıklayın
2. Bu dosya Windows Defender uyarısı vermez

#### Seçenek 3: Orijinal Batch (Defender Uyarısı Verebilir)
1. `start-local.bat` dosyasına çift tıklayın
2. Windows Defender uyarısı verirse: [Çözüm Rehberi](WINDOWS-DEFENDER-COZUMU.md)

### Mac/Linux Kullanıcıları
1. Terminal açın
2. Proje klasörüne gidin
3. Şu komutları çalıştırın:
```bash
chmod +x start-local.sh
./start-local.sh
```

## Manuel Başlatma

### 1. Gereksinimler
- Node.js 20.x
- npm veya pnpm

### 2. Kurulum
```bash
# Bağımlılıkları yükle
pnpm install
# veya
npm install

# .env.local dosyasını oluştur
cp .env.local.example .env.local
```

### 3. Çalıştırma
```bash
# Windows
pnpm run dev:local-win
# veya
npm run dev:local-win

# Mac/Linux
pnpm run dev:local-unix
# veya
npm run dev:local-unix
```

### 4. Erişim
Tarayıcınızda: `http://localhost:3000`

## İlk Giriş

### Test Kullanıcıları
- **Admin**: admin / admin123
- **Antrenör**: coach / coach123  
- **Veli**: parent / parent123

### Özellikler
- Sporcu kayıt sistemi
- Performans takibi
- Ödeme yönetimi
- Mesajlaşma sistemi
- Medya galerisi

## Sorun Giderme

### Node.js/NPM Sorunları
Eğer Node.js kurulu olmasına rağmen `npm` bulunamıyor hatası alıyorsanız:

**Diagnostik aracını çalıştırın**:
```bash
diagnose-nodejs.bat
```
Bu araç sorunu analiz eder ve çözüm önerileri sunar.

**Detaylı çözüm**: [NPM PATH Hatası Çözüm Rehberi](NPM-PATH-HATASI-COZUMU.md)

### PNPM bulunamadı hatası
Eğer `pnpm is not recognized` hatası alıyorsanız:

**Otomatik çözüm**: Güncellenmiş `start-local.bat` veya `start-local.sh` scriptlerini kullanın - otomatik olarak pnpm yükler.

**Manuel çözüm**:
```bash
# PNPM'i global olarak yükle
npm install -g pnpm

# Veya NPM kullan
npm install
npm run dev:local
```

### Port 3000 kullanımda
```bash
pnpm run dev:local -- -p 3001
# veya
npm run dev:local -- -p 3001
```

### Bağımlılık hataları
```bash
# PNPM ile
pnpm store prune
pnpm install

# NPM ile
npm cache clean --force
npm install
```

### Windows Defender virüs uyarısı
Eğer Windows Defender batch dosyalarını virüs olarak algılıyorsa:

**Hızlı çözüm**:
1. `start-local.ps1` (PowerShell) kullanın - daha güvenli
2. `start-local-safe.bat` kullanın - otomatik yükleme yapmaz
3. Proje klasörünü Windows Defender'dan istisna ekleyin

**Detaylı çözüm**: [Windows Defender Çözüm Rehberi](WINDOWS-DEFENDER-COZUMU.md)

### .env.local ayarları
Dosyayı düzenleyip kendi ayarlarınızı girin:
- WordPress URL'i
- E-posta ayarları
- GitHub token (isteğe bağlı)

## 📁 Hangi Dosyayı Kullanmalı?

| Dosya | Platform | Güvenlik | Özellik |
|-------|----------|----------|---------|
| `start-local.ps1` | Windows | ✅ En güvenli | PowerShell |
| `start-local-safe.bat` | Windows | ✅ Güvenli | Yarı otomatik |
| `start-local.bat` | Windows | ⚠️ Defender uyarısı | Tam otomatik |
| `emergency-start.bat` | Windows | ✅ Güvenli | Acil durum |
| `diagnose-nodejs.bat` | Windows | ✅ Güvenli | Sorun tespiti |
| `start-local.sh` | Mac/Linux | ✅ Güvenli | Tam otomatik |

---

**İpucu**: Windows'ta PowerShell scripti (`start-local.ps1`) kullanın - en güvenli seçenektir.
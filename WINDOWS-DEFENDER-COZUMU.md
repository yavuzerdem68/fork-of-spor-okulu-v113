# Windows Defender Virüs Uyarısı Çözümü

Windows Defender'ın batch dosyalarını virüs olarak algılaması yaygın bir "false positive" (yanlış pozitif) durumudur.

## 🚨 Neden Bu Uyarı Çıkıyor?

Windows Defender şu işlemleri şüpheli bulur:
- `npm install -g` komutu (global paket yükleme)
- Dosya kopyalama işlemleri (`copy` komutu)
- Sistem komutlarının otomatik çalıştırılması

## ✅ Güvenli Çözümler

### Çözüm 1: Güvenli Script Kullan (Önerilen)
```bash
# start-local-safe.bat dosyasını kullanın
# Bu dosya otomatik yükleme yapmaz, daha güvenlidir
```

### Çözüm 2: Manuel Kurulum
```bash
# 1. PNPM'i manuel yükle (isteğe bağlı)
npm install -g pnpm

# 2. .env.local dosyasını oluştur
copy .env.local.example .env.local

# 3. Bağımlılıkları yükle
npm install
# veya
pnpm install

# 4. Uygulamayı çalıştır
npm run dev:local
# veya
pnpm run dev:local
```

### Çözüm 3: PowerShell Kullan
```powershell
# PowerShell'i yönetici olarak açın
# Proje klasörüne gidin
cd "D:\Downloads\Lokal\fork-of-spor-okulu-v113-main"

# Komutları tek tek çalıştırın
node --version
npm --version
npm install
npm run dev:local
```

## 🛡️ Windows Defender Ayarları

### Geçici Çözüm: Real-time Protection Kapat
1. **Windows Güvenlik** uygulamasını açın
2. **Virüs ve tehdit koruması** → **Ayarları yönet**
3. **Gerçek zamanlı koruma**yı geçici olarak kapatın
4. Script'i çalıştırın
5. Korumayı tekrar açın

### Kalıcı Çözüm: Klasörü İstisna Ekle
1. **Windows Güvenlik** → **Virüs ve tehdit koruması**
2. **Ayarları yönet** → **Dışlamalar ekle veya kaldır**
3. **Dışlama ekle** → **Klasör**
4. Proje klasörünü seçin: `D:\Downloads\Lokal\fork-of-spor-okulu-v113-main`

### Dosya İstisnası Ekle
1. **Dışlama ekle** → **Dosya**
2. Bu dosyaları ekleyin:
   - `start-local.bat`
   - `start-local-safe.bat`
   - `start-local.sh`

## 📋 Hangi Script'i Kullanmalı?

| Script | Güvenlik | Özellik | Önerilen |
|--------|----------|---------|----------|
| `start-local.bat` | ⚠️ Defender uyarısı | Tam otomatik | Hayır |
| `start-local-safe.bat` | ✅ Güvenli | Yarı otomatik | ✅ Evet |
| Manuel kurulum | ✅ En güvenli | Manuel | Teknik kullanıcılar |

## 🔍 Dosya Güvenliği Kontrolü

Dosyaların güvenli olduğunu doğrulamak için:

### 1. Kaynak Kodu İnceleme
```bash
# Batch dosyasını not defteri ile açın
notepad start-local.bat

# İçeriği kontrol edin - sadece Node.js komutları var
```

### 2. VirusTotal Kontrolü
1. https://www.virustotal.com/ sitesine gidin
2. Batch dosyasını yükleyin
3. Tarama sonuçlarını kontrol edin

### 3. Hash Kontrolü
```powershell
# Dosya hash'ini kontrol edin
Get-FileHash start-local.bat -Algorithm SHA256
```

## 🚀 Hızlı Başlatma Adımları

### Güvenli Yöntem
1. `start-local-safe.bat` dosyasını çalıştırın
2. Eğer .env.local yoksa, manuel oluşturun:
   ```bash
   copy .env.local.example .env.local
   ```
3. PNPM yoksa manuel yükleyin:
   ```bash
   npm install -g pnpm
   ```

### Alternatif Yöntem
```bash
# Command Prompt'u açın
cd "proje-klasörü-yolu"
npm install
npm run dev:local
```

## ❓ Sık Sorulan Sorular

**S: Bu dosyalar gerçekten güvenli mi?**
C: Evet, sadece Node.js ve npm komutları içeriyor. Kaynak kodunu inceleyebilirsiniz.

**S: Neden otomatik yükleme yapıyor?**
C: Kullanım kolaylığı için. `start-local-safe.bat` otomatik yükleme yapmaz.

**S: Defender'ı tamamen kapatmalı mıyım?**
C: Hayır! Sadece proje klasörünü istisna ekleyin veya güvenli script kullanın.

**S: Başka antivirüs programları da uyarı verir mi?**
C: Evet, benzer uyarılar verebilir. Aynı çözümler geçerlidir.

## 📞 Destek

Sorun devam ederse:
1. `start-local-safe.bat` kullanın
2. Manuel kurulum yapın
3. PowerShell ile çalıştırın
4. Proje klasörünü Defender'dan istisna ekleyin

---

**Not**: Bu uyarılar normal ve güvenlidir. Batch dosyaları sistem komutları içerdiği için antivirüs programları şüphelenir.
# Cross-env Hatası Çözümü

Bu rehber `'cross-env' is not recognized` hatasını çözmek için hazırlanmıştır.

## 🚨 Sorun

```
'cross-env' is not recognized as an internal or external command,
operable program or batch file.
```

## 🔍 Neden Oluyor?

1. `node_modules` klasörü yüklenmemiş
2. `cross-env` paketi eksik
3. Bağımlılıklar tam yüklenmemiş

## ✅ Hızlı Çözümler

### Çözüm 1: Otomatik Script (ÖNERİLEN)
```bash
# fix-dependencies.bat dosyasına çift tıklayın
# Otomatik olarak bağımlılıkları kontrol eder ve yükler
```

### Çözüm 2: Windows Özel Script Kullan
```bash
# Windows için özel script
npm run dev:local-win

# Bu script cross-env kullanmaz
```

### Çözüm 3: Manuel Bağımlılık Yükleme
```bash
# Bağımlılıkları yükle
npm install

# Uygulamayı başlat
npm run dev:local-win
```

## 🔧 Detaylı Çözüm Adımları

### 1. Bağımlılık Kontrolü
```bash
# node_modules var mı kontrol et
dir node_modules

# Yoksa yükle
npm install
```

### 2. Cross-env Kontrolü
```bash
# cross-env yüklü mü kontrol et
dir node_modules\cross-env

# Yoksa manuel yükle
npm install cross-env --save-dev
```

### 3. Cache Temizleme
```bash
# NPM cache temizle
npm cache clean --force

# node_modules sil ve yeniden yükle
rmdir /s node_modules
del package-lock.json
npm install
```

## 🚀 Alternatif Başlatma Yöntemleri

### Windows için
```bash
# 1. Windows özel script
npm run dev:local-win

# 2. Manuel environment variable
set NEXT_CONFIG_FILE=next.config.local.mjs && next dev

# 3. PowerShell ile
$env:NEXT_CONFIG_FILE="next.config.local.mjs"; next dev
```

### Mac/Linux için
```bash
# Unix script kullan
npm run dev:local-unix

# veya direkt
NEXT_CONFIG_FILE=next.config.local.mjs next dev
```

## 📋 Kontrol Listesi

- [ ] Node.js yüklü (v20.x)
- [ ] `npm install` çalıştırıldı
- [ ] `node_modules` klasörü mevcut
- [ ] `node_modules\cross-env` klasörü mevcut
- [ ] Windows için `dev:local-win` scripti kullanıldı

## 🛠️ Otomatik Çözüm Scriptleri

### fix-dependencies.bat
Bu script otomatik olarak:
1. Node.js kontrolü yapar
2. node_modules kontrolü yapar
3. cross-env kontrolü yapar
4. Eksik bağımlılıkları yükler
5. Uygulamayı başlatır

### start-local-safe.bat
Bu script:
1. Güvenli başlatma yapar
2. Windows özel scriptini kullanır
3. cross-env sorununu önler

## ❓ Sık Sorulan Sorular

**S: Neden cross-env gerekli?**
C: Farklı işletim sistemlerinde environment variable'ları ayarlamak için.

**S: Windows'ta cross-env olmadan nasıl çalışır?**
C: `set VARIABLE=value && command` syntax'ı kullanılır.

**S: dev:local-win scripti güvenli mi?**
C: Evet, sadece Windows'a özel syntax kullanır, aynı işlevi görür.

**S: Hangi scripti kullanmalıyım?**
C: Windows'ta `dev:local-win`, Mac/Linux'ta `dev:local-unix`.

## 🔍 Debug Komutları

```bash
# Hangi scriptlerin mevcut olduğunu gör
npm run

# Package.json'daki scriptleri kontrol et
type package.json | findstr "dev:local"

# Node.js ve npm versiyonlarını kontrol et
node --version
npm --version
```

## 📞 Hala Sorun Var mı?

1. `fix-dependencies.bat` çalıştırın
2. `clean-cache.bat` çalıştırın  
3. `start-local-safe.bat` çalıştırın
4. Manuel olarak `npm run dev:local-win` deneyin

---

**Not**: Windows kullanıcıları için `dev:local-win` scripti özel olarak oluşturulmuştur ve cross-env gerektirmez.
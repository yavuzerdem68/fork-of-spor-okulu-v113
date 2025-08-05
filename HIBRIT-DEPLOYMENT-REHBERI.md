# HİBRİT DAĞITIM REHBERİ
## Hem Lokal Hem WordPress İçin Tek Sistem

Bu sistem artık hem lokal çalışma hem de WordPress dağıtımı için optimize edilmiştir.

## 🚀 HIZLI BAŞLATMA

### Lokal Çalışma İçin:
```bash
# Geliştirme modu
npm run dev

# Lokal production build
npm run build:local
npm start
```

### WordPress Dağıtımı İçin:
```bash
# WordPress build
npm run build:wordpress

# Veya batch dosyası ile
build-wordpress.bat
```

## 📁 DOSYA YAPISI

### Ana Konfigürasyon Dosyaları:
- `next.config.mjs` - Hibrit konfigürasyon (otomatik mod algılama)
- `package.json` - Güncellenmiş script'ler
- `.htaccess` - WordPress için routing kuralları

### Build Script'leri:
- `build-local.bat` - Lokal dağıtım için
- `build-wordpress.bat` - WordPress dağıtımı için

## ⚙️ NASIL ÇALIŞIR

### Otomatik Mod Algılama:
Sistem `WORDPRESS_MODE` environment variable'ını kontrol eder:

- **Local Mode**: Normal Next.js uygulaması
  - Server-side rendering
  - API routes aktif
  - `/` base path

- **WordPress Mode**: Static export
  - Tamamen statik dosyalar
  - `/spor-okulu` base path
  - .htaccess routing

### Build Komutları:

```bash
# Lokal build (varsayılan)
npm run build
npm run build:local

# WordPress build
npm run build:wordpress
# veya
WORDPRESS_MODE=true npm run build
```

## 🌐 WORDPRESS DAĞITIMI

### 1. Build Yapın:
```bash
build-wordpress.bat
```

### 2. Dosyaları Yükleyin:
- `out/` klasörünün içeriğini WordPress sitenizin `/spor-okulu/` klasörüne yükleyin
- `.htaccess` dosyasının doğru yerde olduğundan emin olun

### 3. Erişim:
- `https://siteniz.com/spor-okulu/`

## 💻 LOKAL ÇALIŞMA

### Geliştirme:
```bash
npm run dev
# http://localhost:3000
```

### Production Test:
```bash
npm run build:local
npm start
# http://localhost:3000
```

## 🔧 AYARLAR

### Environment Variables:
- `NEXT_PUBLIC_APP_MODE`: 'local' veya 'wordpress'
- `WORDPRESS_MODE`: WordPress build için 'true'

### Otomatik Ayarlar:
- **Local**: Normal Next.js ayarları
- **WordPress**: Static export + base path + asset prefix

## 📋 DAĞITIM KONTROL LİSTESİ

### WordPress Dağıtımı Öncesi:
- [ ] `build-wordpress.bat` çalıştırıldı
- [ ] `out/` klasörü oluşturuldu
- [ ] `.htaccess` dosyası `out/` içinde
- [ ] Tüm asset'ler `/spor-okulu/` prefix'i ile

### Lokal Dağıtım Öncesi:
- [ ] `npm run build:local` başarılı
- [ ] `npm start` çalışıyor
- [ ] API routes erişilebilir

## 🛠️ SORUN GİDERME

### WordPress'te 404 Hataları:
1. `.htaccess` dosyasının doğru yerde olduğunu kontrol edin
2. Apache mod_rewrite'ın aktif olduğunu kontrol edin
3. Dosya izinlerini kontrol edin (644 veya 755)

### Lokal'de API Hataları:
1. `NEXT_PUBLIC_APP_MODE=local` olduğunu kontrol edin
2. `npm run dev` ile geliştirme modunda test edin
3. Port çakışması olup olmadığını kontrol edin

### Asset Yükleme Sorunları:
1. Build modunu kontrol edin (console'da log görünür)
2. Base path ayarlarını kontrol edin
3. Browser cache'ini temizleyin

## 📞 DESTEK

Bu hibrit sistem sayesinde:
- ✅ Tek kod tabanı
- ✅ Otomatik mod algılama
- ✅ Kolay dağıtım
- ✅ Hem lokal hem WordPress desteği

Herhangi bir sorun yaşarsanız, build loglarını kontrol edin ve gerekirse temiz bir build yapın:

```bash
npm run clean
npm run build:wordpress  # veya build:local
```
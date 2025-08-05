# SPOR OKULU CRM - HİBRİT SİSTEM
## Hem Lokal Hem WordPress İçin Optimize Edilmiş

Bu sistem artık **tek kod tabanı** ile hem lokal çalışma hem de WordPress dağıtımı desteklemektedir.

## 🚀 HIZLI BAŞLATMA

### Lokal Çalışma:
```bash
npm run dev
# http://localhost:3000
```

### WordPress Dağıtımı:
```bash
build-wordpress.bat
# out/ klasörünü WordPress'e yükleyin
```

## 📋 YÖNETİCİ GİRİŞ BİLGİLERİ

**Email:** yavuz@g7spor.org  
**Şifre:** 444125yA/

## 🔧 SİSTEM ÖZELLİKLERİ

### ✅ Tamamlanan Özellikler:
- **Hibrit Dağıtım Sistemi** - Tek kod, iki mod
- **Otomatik Mod Algılama** - Environment variable ile
- **Sporcu Kayıt Sistemi** - Çocuk ve yetişkin formları
- **Ödeme Takip Sistemi** - Banka dekontları, toplu girişler
- **Cari Hesap Kartları** - Kronolojik sıralama, PDF export
- **Antrenman Takibi** - Yoklama sistemi
- **Raporlama** - Detaylı finansal raporlar
- **Veri Yedekleme** - JSON export/import
- **Türkçe Karakter Desteği** - Gelişmiş eşleştirme
- **KDV Hesaplamaları** - Otomatik yuvarlama
- **Duplicate Prevention** - Çoklu kontrol sistemi

### 🎯 Yeni Özellikler:
- **Kayıt Türü Seçimi** - Çocuk/Yetişkin dialog
- **Yetişkin Kayıt Formu** - Basitleştirilmiş form
- **Spor Dalları** - "Akıl ve Zeka Oyunları" dahil
- **Hibrit Konfigürasyon** - Otomatik mod değiştirme

## 🛠️ DAĞITIM MODLARI

### Local Mode (Varsayılan):
- Normal Next.js uygulaması
- Server-side rendering
- API routes aktif
- LocalStorage veri saklama

### WordPress Mode:
- Static export
- `/spor-okulu` base path
- .htaccess routing
- Optimize edilmiş asset'ler

## 📁 DOSYA YAPISI

```
├── next.config.mjs          # Hibrit konfigürasyon
├── package.json             # Güncellenmiş script'ler
├── .htaccess               # WordPress routing
├── build-local.bat         # Lokal build
├── build-wordpress.bat     # WordPress build
├── HIBRIT-DEPLOYMENT-REHBERI.md
└── README-FINAL.md         # Bu dosya
```

## 🌐 WORDPRESS DAĞITIMI

### 1. Build Yapın:
```bash
# Windows
build-wordpress.bat

# Linux/Mac
npm run build:wordpress
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
```

### Production Test:
```bash
npm run build:local
npm start
```

## 🔐 GÜVENLİK

- Basit authentication sistemi
- LocalStorage tabanlı veri saklama
- .htaccess ile dosya koruması
- XSS ve CSRF korumaları

## 📊 VERİ YÖNETİMİ

### Veri Saklama:
- **Lokal:** Browser LocalStorage
- **WordPress:** Statik JSON dosyaları

### Yedekleme:
- JSON export/import
- Otomatik veri koruması
- Duplicate prevention

## 🎨 KULLANICI ARAYÜZÜ

- Modern, responsive tasarım
- Dark/Light mode desteği
- Türkçe dil desteği
- Mobil uyumlu

## 🚨 SORUN GİDERME

### WordPress'te 404 Hataları:
1. `.htaccess` dosyasının doğru yerde olduğunu kontrol edin
2. Apache mod_rewrite'ın aktif olduğunu kontrol edin
3. Dosya izinlerini kontrol edin (644 veya 755)

### Lokal'de Sorunlar:
1. `npm run clean` ile temizlik yapın
2. `npm install` ile bağımlılıkları yenileyin
3. Port çakışması kontrolü yapın

### Build Hataları:
1. Node.js versiyonunu kontrol edin (20.x önerili)
2. `npm run clean` sonrası tekrar build yapın
3. Environment variable'ları kontrol edin

## 📞 DESTEK

Bu hibrit sistem sayesinde:
- ✅ Tek kod tabanı
- ✅ Çifte dağıtım desteği
- ✅ Otomatik konfigürasyon
- ✅ Kolay bakım

## 🔄 GÜNCELLEMELER

### v1.13 (Son Sürüm):
- Hibrit dağıtım sistemi
- Kayıt türü seçimi
- Yetişkin kayıt formu
- Gelişmiş spor dalları listesi
- Otomatik mod algılama

---

**🎉 Sistem hazır! Hem lokal çalışma hem WordPress dağıtımı için optimize edilmiştir.**

**Preview URL:** https://yrtndlooyuamztzl-ks6sfmk5t.preview.co.dev
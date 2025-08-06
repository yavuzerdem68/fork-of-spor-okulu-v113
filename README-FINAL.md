# Spor Okulu CRM - Final Version
## WordPress & Lokal Deployment Ready

Bu proje, spor okulları için geliştirilmiş kapsamlı bir CRM sistemidir. Hem WordPress hosting'de hem de lokal bilgisayarınızda çalışacak şekilde optimize edilmiştir.

## 🚀 Hızlı Başlangıç

### Otomatik Kurulum (Önerilen)

```batch
# Windows için
deploy-final.bat

# PowerShell için
.\deploy-final.ps1
```

### Manuel Kurulum

```bash
# WordPress için
npm run build:wordpress

# Lokal geliştirme için
npm install && npm run dev
```

## 📁 Önemli Dosyalar

- `deploy-final.bat` / `deploy-final.ps1` - Ana deployment script'i
- `FINAL-DEPLOYMENT-GUIDE.md` - Detaylı kurulum rehberi
- `WORDPRESS-DEPLOYMENT-REHBERI-FINAL.md` - WordPress özel rehberi
- `package.json` - Proje bağımlılıkları ve script'ler
- `next.config.mjs` - Hibrit konfigürasyon (WordPress/Lokal)

## 🌟 Özellikler

### Sporcu Yönetimi
- Sporcu kayıt sistemi (çocuk/yetişkin)
- Detaylı sporcu profilleri
- Veli bilgileri yönetimi
- Toplu sporcu işlemleri

### Ödeme Yönetimi
- Aidat takibi
- Banka dekont yükleme
- Otomatik eşleştirme sistemi
- KDV hesaplamaları
- Cari hesap kartları

### Antrenman Yönetimi
- Antrenman programları
- Yoklama sistemi
- Antrenör atamaları
- Grup yönetimi

### Raporlama
- Finansal raporlar
- Sporcu raporları
- Ödeme durumu raporları
- Excel export

### Sistem Özellikleri
- WordPress entegrasyonu
- Lokal veri depolama
- Responsive tasarım
- PWA desteği
- Offline çalışma

## 🔧 Teknik Detaylar

### Teknolojiler
- **Frontend:** Next.js 14, React 18, TypeScript
- **UI:** Tailwind CSS, Radix UI, Shadcn/ui
- **Veri:** localStorage (lokal), WordPress REST API (hosting)
- **Build:** Static export (WordPress), Development server (lokal)

### Sistem Gereksinimleri
- Node.js 18+
- npm 8+
- Modern web tarayıcısı
- WordPress 5.6+ (hosting için)

## 📋 Deployment Seçenekleri

### 1. WordPress Hosting
- Static build alınır
- `/spor-okulu/` path'i ile çalışır
- WordPress REST API entegrasyonu
- Application Password ile kimlik doğrulama

### 2. Lokal Development
- Development server
- Hot reload
- localStorage veri depolama
- Tam geliştirme ortamı

## 🎯 Kullanım Senaryoları

### Spor Okulu Yöneticisi
1. Sporcu kayıtlarını yönetir
2. Ödeme takibi yapar
3. Raporları inceler
4. Antrenman programlarını düzenler

### Antrenör
1. Antrenman yoklamalarını alır
2. Sporcu performansını takip eder
3. Grup yönetimi yapar

### Veli
1. Çocuğunun durumunu görür
2. Ödeme bilgilerini kontrol eder
3. Antrenman programını takip eder

## 📊 Veri Yönetimi

### Lokal Mod
- Veriler tarayıcı localStorage'ında saklanır
- Tarayıcı değişiminde veri kaybı olabilir
- Hızlı ve güvenli

### WordPress Mod
- Veriler WordPress veritabanında saklanır
- Çoklu erişim mümkün
- Yedekleme ve geri yükleme

## 🔒 Güvenlik

- Application Password ile güvenli API erişimi
- XSS koruması
- CSRF koruması
- Güvenli veri depolama
- Dosya upload güvenliği

## 📚 Dokümantasyon

- `FINAL-DEPLOYMENT-GUIDE.md` - Ana kurulum rehberi
- `WORDPRESS-DEPLOYMENT-REHBERI-FINAL.md` - WordPress detayları
- `LOKAL-SORUN-COZUMU.md` - Sorun giderme
- `POWERSHELL-KULLANIM-REHBERI.md` - PowerShell rehberi

## 🆘 Destek

### Yaygın Sorunlar
1. **404 Hatası:** `.htaccess` dosyasını kontrol edin
2. **API Hatası:** Application Password'ü kontrol edin
3. **Build Hatası:** `npm install` çalıştırın
4. **PowerShell Hatası:** Execution Policy ayarlayın

### Hızlı Çözümler
```bash
# Cache temizleme
npm run clean

# Dependencies yenileme
rm -rf node_modules && npm install

# Development server yeniden başlatma
npm run dev
```

## 📈 Versiyon Geçmişi

- **v3.0** - Final deployment version
- **v2.5** - WordPress entegrasyonu
- **v2.0** - Hibrit sistem
- **v1.5** - PWA desteği
- **v1.0** - İlk stabil versiyon

## 🎉 Başarılı Deployment Kontrolleri

### WordPress
- [ ] `out` klasörü oluştu
- [ ] Dosyalar hosting'e yüklendi
- [ ] `.htaccess` yerinde
- [ ] Uygulama açılıyor
- [ ] WordPress entegrasyonu çalışıyor

### Lokal
- [ ] `npm install` başarılı
- [ ] `npm run dev` çalışıyor
- [ ] http://localhost:3000 açılıyor
- [ ] Temel fonksiyonlar çalışıyor

---

## 🏆 Sonuç

Bu sistem, spor okullarının ihtiyaçlarını karşılamak üzere geliştirilmiş kapsamlı bir CRM çözümüdür. Hem WordPress hosting'de hem de lokal ortamda sorunsuz çalışacak şekilde optimize edilmiştir.

**Hızlı başlangıç için `deploy-final.bat` dosyasını çalıştırın!**

---

**Geliştirici:** co.dev AI Assistant  
**Son Güncelleme:** 2025-01-06  
**Versiyon:** 3.0 Final
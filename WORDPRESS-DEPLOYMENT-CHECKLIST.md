# ✅ WordPress Deployment Kontrol Listesi

Bu liste, WordPress deployment sürecinin her adımını kontrol etmenizi sağlar.

## 🔧 Ön Hazırlık Kontrolleri

### Geliştirme Ortamı
- [ ] Node.js 18+ kurulu
- [ ] NPM çalışıyor
- [ ] Proje klasöründe `package.json` mevcut
- [ ] `node_modules` klasörü mevcut (yoksa `npm install` çalıştır)

### WordPress Hazırlığı
- [ ] WordPress 5.6+ kurulu
- [ ] wp-admin paneline erişim var
- [ ] Application Passwords özelliği aktif
- [ ] REST API çalışıyor (`/wp-json/wp/v2/posts` test edildi)
- [ ] Kalıcı bağlantılar ayarlandı

## 🏗️ Build Süreci Kontrolleri

### Build Öncesi
- [ ] Eski build dosyaları temizlendi (`.next`, `out` klasörleri)
- [ ] `next.config.wordpress.mjs` dosyası mevcut
- [ ] `.htaccess` dosyası proje kök dizininde mevcut

### Build Komutu
Aşağıdakilerden birini çalıştır:
- [ ] `wordpress-deployment-complete.bat` (Windows)
- [ ] `wordpress-deployment-complete.ps1` (PowerShell)
- [ ] `npm run build:wordpress` (Manuel)

### Build Sonrası Kontrol
- [ ] `out` klasörü oluştu
- [ ] `out/index.html` dosyası mevcut
- [ ] `out/_next` klasörü mevcut
- [ ] `out/.htaccess` dosyası mevcut
- [ ] `out/favicon.ico` dosyası mevcut
- [ ] `out/manifest.json` dosyası mevcut

## 📁 Dosya Yükleme Kontrolleri

### Hosting Hazırlığı
- [ ] cPanel/FTP erişimi mevcut
- [ ] `public_html` klasörüne erişim var
- [ ] Yeterli disk alanı var (en az 100MB)

### Klasör Oluşturma
- [ ] `public_html/spor-okulu` klasörü oluşturuldu
- [ ] Klasör izinleri 755 olarak ayarlandı

### Dosya Yükleme
- [ ] `out` klasöründeki **TÜM** dosyalar yüklendi
- [ ] `.htaccess` dosyası `spor-okulu` klasöründe
- [ ] `_next` klasörü ve içeriği yüklendi
- [ ] HTML dosyaları yüklendi
- [ ] Static dosyalar (CSS, JS, resimler) yüklendi

### İzin Kontrolleri
- [ ] Klasör izinleri: 755
- [ ] Dosya izinleri: 644
- [ ] `.htaccess` izinleri: 644

## 🔗 WordPress Entegrasyon Kontrolleri

### Application Password
- [ ] WordPress admin panelinde Application Password oluşturuldu
- [ ] Password güvenli bir yere kaydedildi
- [ ] Password adı: "Spor Okulu CRM"

### Menü Entegrasyonu (Opsiyonel)
- [ ] WordPress menüsüne CRM linki eklendi
- [ ] Link URL'si: `https://siteniz.com/spor-okulu/`
- [ ] Menü aktif konumda

## 🧪 Test Kontrolleri

### Temel Erişim Testleri
- [ ] `https://siteniz.com/spor-okulu/` açılıyor
- [ ] Ana sayfa düzgün görünüyor
- [ ] CSS stilleri yükleniyor
- [ ] JavaScript çalışıyor
- [ ] Favicon görünüyor

### Sayfa Navigasyon Testleri
- [ ] Dashboard sayfası açılıyor
- [ ] Sporcular sayfası açılıyor
- [ ] Ödemeler sayfası açılıyor
- [ ] Sistem ayarları sayfası açılıyor
- [ ] Giriş/çıkış işlemleri çalışıyor

### WordPress API Testleri
- [ ] Sistem ayarlarında WordPress bilgileri girildi
- [ ] API bağlantı testi başarılı
- [ ] Test sporcu verisi oluşturuldu
- [ ] Veri WordPress'te görünüyor (wp-admin > Yazılar)

## 🔒 Güvenlik Kontrolleri

### .htaccess Güvenlik
- [ ] Hassas dosyalar korunuyor
- [ ] Güvenlik başlıkları aktif
- [ ] URL yönlendirmeleri çalışıyor

### WordPress Güvenlik
- [ ] WordPress güncel
- [ ] Güçlü şifreler kullanılıyor
- [ ] Application Password güvenli
- [ ] Debug modu kapalı (production için)

## 📊 Performans Kontrolleri

### Yükleme Hızı
- [ ] Ana sayfa < 3 saniye yükleniyor
- [ ] Dashboard < 5 saniye yükleniyor
- [ ] Büyük veri sayfaları < 10 saniye yükleniyor

### Kaynak Kullanımı
- [ ] CSS dosyaları sıkıştırılmış
- [ ] JavaScript dosyaları optimize
- [ ] Resimler optimize boyutta
- [ ] Gereksiz dosyalar yok

## 🚨 Sorun Giderme Kontrolleri

### 404 Hataları
- [ ] `.htaccess` dosyası doğru konumda
- [ ] WordPress kalıcı bağlantılar yenilendi
- [ ] mod_rewrite aktif
- [ ] Dosya yolları doğru

### API Hataları
- [ ] Application Password doğru
- [ ] WordPress REST API aktif
- [ ] CORS ayarları uygun
- [ ] SSL sertifikası geçerli

### Stil/Görünüm Hataları
- [ ] Browser cache temizlendi
- [ ] CSS dosyaları yükleniyor
- [ ] JavaScript hataları yok
- [ ] Console'da 404 hatası yok

## 📱 Mobil Uyumluluk Kontrolleri

### Responsive Design
- [ ] Mobil cihazlarda düzgün görünüyor
- [ ] Tablet görünümü uygun
- [ ] Touch işlemleri çalışıyor
- [ ] Menüler mobilde erişilebilir

## 🔄 Yedekleme ve Güncelleme Kontrolleri

### Yedekleme
- [ ] WordPress veritabanı yedeği alındı
- [ ] Dosya yedeği alındı
- [ ] Ayarlar kaydedildi

### Güncelleme Hazırlığı
- [ ] Güncelleme prosedürü belirlendi
- [ ] Test ortamı hazır
- [ ] Rollback planı mevcut

## 📞 Destek ve Dokümantasyon

### Dokümantasyon
- [ ] `WORDPRESS-DEPLOYMENT-REHBERI-FINAL.md` okundu
- [ ] `README-WORDPRESS.md` incelendi
- [ ] Kullanıcı kılavuzu hazır

### Destek Bilgileri
- [ ] Hosting sağlayıcı iletişim bilgileri mevcut
- [ ] WordPress admin bilgileri güvenli yerde
- [ ] Application Password yedeklendi
- [ ] Hata logları nasıl kontrol edileceği biliniyor

---

## 🎯 Final Kontrol

### Tüm Sistemler Çalışıyor
- [ ] Uygulama tamamen çalışıyor
- [ ] Tüm özellikler test edildi
- [ ] Performans kabul edilebilir
- [ ] Güvenlik önlemleri alındı
- [ ] Yedekleme tamamlandı

### Kullanıcı Hazırlığı
- [ ] Kullanıcılar bilgilendirildi
- [ ] Eğitim materyalleri hazır
- [ ] Destek süreci belirlendi

---

## ✅ İmza ve Tarih

**Deployment Tamamlayan:** ________________  
**Tarih:** ________________  
**WordPress Site:** ________________  
**CRM URL:** ________________  

**Notlar:**
```
_________________________________________________
_________________________________________________
_________________________________________________
```

---

**Bu kontrol listesini yazdırıp her deployment için kullanabilirsiniz.**

**Son Güncelleme:** 2025-01-05  
**Versiyon:** 1.0 - WordPress Deployment Checklist
# 🏆 Spor Okulu CRM - WordPress Deployment

WordPress sitenizde çalışacak şekilde optimize edilmiş Spor Okulu CRM sistemi.

## 🚀 Hızlı Başlangıç

### 1. WordPress Build Alma

**Windows Kullanıcıları:**
```batch
# Çift tıklayın
wordpress-deployment-complete.bat
```

**PowerShell Kullanıcıları:**
```powershell
# PowerShell'de çalıştırın
.\wordpress-deployment-complete.ps1
```

**Manuel Build:**
```bash
npm run clean
npm run build:wordpress
npm run copy-htaccess
```

### 2. WordPress'e Yükleme

1. `out` klasöründeki **tüm dosyaları** kopyalayın
2. WordPress sitenizin `public_html/spor-okulu/` klasörüne yükleyin
3. `https://siteniz.com/spor-okulu/` adresini test edin

## 📋 Gereksinimler

### WordPress Gereksinimleri
- WordPress 5.6+
- PHP 7.4+
- MySQL 5.7+
- Application Passwords aktif

### Hosting Gereksinimleri
- En az 512MB RAM
- En az 100MB disk alanı
- mod_rewrite aktif
- .htaccess desteği

## ⚙️ Kurulum Adımları

### 1. WordPress Hazırlığı

1. **wp-admin** paneline giriş yapın
2. **Kullanıcılar > Profil** bölümüne gidin
3. **Application Passwords** bölümünde yeni şifre oluşturun:
   - İsim: `Spor Okulu CRM`
   - Oluşan şifreyi kaydedin

### 2. Build Alma

Proje klasöründe terminal açın:

```bash
# Otomatik build (önerilen)
wordpress-deployment-complete.bat

# Veya manuel
npm run build:wordpress
```

### 3. Dosya Yükleme

1. **cPanel File Manager** veya **FTP** ile bağlanın
2. `public_html` klasöründe `spor-okulu` klasörü oluşturun
3. `out` klasöründeki **tüm dosyaları** yükleyin

### 4. İzin Ayarları

- Klasörler: 755
- Dosyalar: 644
- .htaccess: 644

### 5. Uygulama Ayarları

1. `https://siteniz.com/spor-okulu/` adresine gidin
2. **Sistem Ayarları > WordPress Entegrasyonu** bölümüne gidin
3. WordPress bilgilerinizi girin:
   - Site URL: `https://siteniz.com`
   - Kullanıcı adı: WordPress admin kullanıcınız
   - Application Password: Oluşturduğunuz şifre

## 📁 Dosya Yapısı

Build sonrası `out` klasörü:

```
out/
├── .htaccess              # URL yönlendirme kuralları
├── index.html             # Ana sayfa
├── _next/                 # Next.js build dosyaları
│   ├── static/
│   └── ...
├── favicon.ico            # Site ikonu
├── manifest.json          # PWA manifest
├── dashboard.html         # Dashboard sayfası
├── athletes.html          # Sporcular sayfası
├── payments.html          # Ödemeler sayfası
└── ...                    # Diğer sayfa dosyaları
```

## 🔧 Özelleştirme

### Base Path Değiştirme

Farklı bir klasör adı kullanmak için:

1. `next.config.wordpress.mjs` dosyasını açın
2. `basePath` ve `assetPrefix` değerlerini değiştirin:

```javascript
assetPrefix: '/yeni-klasor-adi',
basePath: '/yeni-klasor-adi',
```

3. `.htaccess` dosyasındaki path'leri güncelleyin
4. Yeniden build alın

### WordPress API URL'si

Farklı bir WordPress sitesi için:

```javascript
env: {
  WORDPRESS_API_URL: 'https://yeni-site.com/wp-json/wp/v2',
  WORDPRESS_SITE_URL: 'https://yeni-site.com',
}
```

## 🚨 Sorun Giderme

### Build Hataları

**TypeScript Hataları:**
```bash
# Hataları görmezden gel
npm run build:wordpress
```

**Bellek Hatası:**
```bash
# Node.js bellek limitini artır
set NODE_OPTIONS=--max-old-space-size=4096
npm run build:wordpress
```

### 404 Hataları

1. `.htaccess` dosyasının yüklendiğini kontrol edin
2. WordPress kalıcı bağlantılarını yeniden kaydedin
3. mod_rewrite'ın aktif olduğunu kontrol edin

### API Bağlantı Sorunları

1. Application Password'ü kontrol edin
2. WordPress REST API'nin aktif olduğunu test edin:
   ```
   https://siteniz.com/wp-json/wp/v2/posts
   ```
3. CORS ayarlarını kontrol edin

### Performans Sorunları

1. **PHP Ayarları:**
   ```ini
   memory_limit = 512M
   max_execution_time = 300
   upload_max_filesize = 10M
   ```

2. **Cache Eklentisi:**
   - WP Rocket
   - W3 Total Cache
   - WP Super Cache

3. **CDN Kullanımı:**
   - CloudFlare
   - MaxCDN

## 🔒 Güvenlik

### WordPress Güvenlik

- WordPress'i güncel tutun
- Güçlü şifreler kullanın
- İki faktörlü kimlik doğrulama
- Düzenli yedekleme

### Uygulama Güvenliği

- Application Password'ü güvenli saklayın
- HTTPS kullanın
- Düzenli güvenlik taraması

### .htaccess Güvenlik

```apache
# Hassas dosyaları koru
<FilesMatch "\.(log|md|txt|json)$">
    Require all denied
</FilesMatch>

# Güvenlik başlıkları
Header always set X-Frame-Options DENY
Header always set X-Content-Type-Options nosniff
```

## 🔄 Güncelleme

### Uygulama Güncellemesi

1. **Yedek alın:**
   ```bash
   cp -r public_html/spor-okulu public_html/spor-okulu-backup
   ```

2. **Yeni build alın:**
   ```bash
   wordpress-deployment-complete.bat
   ```

3. **Dosyaları güncelleyin:**
   - Yeni `out` klasörünü yükleyin
   - Ayarları kontrol edin

### Veri Yedekleme

Uygulama verileri WordPress veritabanında saklanır:
- **Yazılar** bölümünde sporcu verileri
- **Özel alanlar** ile meta veriler

## 📊 Performans İzleme

### Önemli Metrikler

- Sayfa yükleme süresi: < 3 saniye
- First Contentful Paint: < 1.5 saniye
- Largest Contentful Paint: < 2.5 saniye

### İzleme Araçları

- Google PageSpeed Insights
- GTmetrix
- Pingdom
- WordPress Query Monitor

## 📞 Destek

### Hata Raporlama

1. **Browser Console:** F12 > Console
2. **WordPress Debug:** wp-content/debug.log
3. **Server Logs:** cPanel > Error Logs

### Yararlı Komutlar

```bash
# Cache temizleme
npm run clean

# Yeniden build
npm run build:wordpress

# Dosya izinleri (Linux/Mac)
find public_html/spor-okulu -type d -exec chmod 755 {} \;
find public_html/spor-okulu -type f -exec chmod 644 {} \;
```

## 📚 Ek Kaynaklar

- [WordPress REST API Dokümantasyonu](https://developer.wordpress.org/rest-api/)
- [Next.js Static Export](https://nextjs.org/docs/advanced-features/static-html-export)
- [Application Passwords](https://make.wordpress.org/core/2020/11/05/application-passwords-integration-guide/)

---

## ✅ Kurulum Kontrol Listesi

- [ ] WordPress 5.6+ kurulu
- [ ] Application Password oluşturuldu
- [ ] Build başarıyla alındı
- [ ] Dosyalar WordPress'e yüklendi
- [ ] .htaccess dosyası yerinde
- [ ] Dosya izinleri ayarlandı
- [ ] Uygulama ayarları yapıldı
- [ ] Test verileri oluşturuldu
- [ ] Güvenlik kontrolleri yapıldı
- [ ] Performans testi tamamlandı

**🎉 Kurulum tamamlandı! Spor Okulu CRM sisteminiz WordPress sitenizde çalışmaya hazır.**

---

**Son Güncelleme:** 2025-01-05  
**Versiyon:** 2.0 - WordPress Deployment Ready
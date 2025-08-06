# Spor Okulu CRM - Final Deployment Guide
## WordPress ve Lokal Kurulum Rehberi

Bu rehber, Spor Okulu CRM sisteminin hem WordPress hosting'de hem de lokal bilgisayarınızda nasıl çalıştırılacağını açıklar.

## 🚀 Hızlı Başlangıç

### Otomatik Deployment (Önerilen)

**Windows için:**
```batch
# Batch script ile
deploy-final.bat

# PowerShell ile (önerilen)
.\deploy-final.ps1
```

**Manuel Deployment:**
```bash
# WordPress için
npm run build:wordpress

# Lokal için
npm run dev
```

## 📋 Sistem Gereksinimleri

### Genel Gereksinimler
- Node.js 18.0 veya üzeri
- npm 8.0 veya üzeri
- Modern web tarayıcısı (Chrome, Firefox, Safari, Edge)

### WordPress Deployment için
- WordPress 5.6 veya üzeri
- PHP 7.4 veya üzeri
- MySQL 5.7 veya üzeri
- cPanel veya FTP erişimi
- En az 100MB disk alanı

### Lokal Development için
- Windows 10/11, macOS 10.15+, veya Linux
- En az 4GB RAM
- En az 1GB boş disk alanı

## 🌐 WordPress Deployment

### Adım 1: Build Alma

1. **Proje klasöründe terminal açın**
2. **Deployment script'ini çalıştırın:**
   ```batch
   deploy-final.bat
   ```
   veya
   ```powershell
   .\deploy-final.ps1
   ```

3. **Menüden "1. WordPress Deployment" seçin**

### Adım 2: WordPress Hazırlığı

1. **WordPress Admin Paneli:**
   - `wp-admin` paneline giriş yapın
   - **Ayarlar > Kalıcı Bağlantılar** → "Yazı adı" seçin
   - **Kullanıcılar > Profil** → Application Password oluşturun

2. **Application Password Oluşturma:**
   - Profil sayfasının altında "Application Passwords" bölümünü bulun
   - "New Application Password Name": `Spor Okulu CRM`
   - Oluşan şifreyi güvenli bir yere kaydedin

### Adım 3: Dosya Yükleme

1. **cPanel File Manager veya FTP ile:**
   - `public_html` klasörüne gidin
   - `spor-okulu` adında klasör oluşturun
   - `out` klasöründeki **TÜM** dosyaları `public_html/spor-okulu/` içine yükleyin

2. **Dosya Yapısı Kontrolü:**
   ```
   public_html/
   └── spor-okulu/
       ├── .htaccess
       ├── index.html
       ├── _next/
       ├── favicon.ico
       └── diğer dosyalar...
   ```

### Adım 4: WordPress Entegrasyonu

1. **Menü Oluşturma:**
   - **wp-admin > Görünüm > Menüler**
   - Yeni menü: "Spor Okulu CRM"
   - URL: `https://siteniz.com/spor-okulu/`
   - Menüyü kaydedin

2. **İlk Erişim:**
   - `https://siteniz.com/spor-okulu/` adresine gidin
   - Giriş ekranı görünmelidir

3. **Sistem Ayarları:**
   - **Yönetici Girişi** → **Sistem Ayarları**
   - **WordPress Entegrasyonu** sekmesi
   - WordPress bilgilerini girin ve test edin

## 💻 Lokal Development

### Adım 1: Proje Kurulumu

1. **Dependencies yükleme:**
   ```bash
   npm install
   ```

2. **Development server başlatma:**
   ```bash
   npm run dev
   ```

3. **Tarayıcıda açma:**
   - `http://localhost:3000` adresine gidin

### Adım 2: Lokal Ayarlar

1. **Environment Variables (Opsiyonel):**
   - `.env.local` dosyası oluşturun
   - Gerekli ayarları yapın

2. **Veri Depolama:**
   - Veriler tarayıcının localStorage'ında saklanır
   - Tarayıcı değiştirdiğinizde veriler kaybolabilir

## 🔧 Deployment Script Kullanımı

### deploy-final.bat / deploy-final.ps1

**Menü Seçenekleri:**

1. **WordPress Deployment:**
   - WordPress hosting için static build alır
   - `out` klasöründe deployment dosyaları oluşturur
   - `.htaccess` dosyasını kopyalar

2. **Lokal Development Setup:**
   - Dependencies yükler
   - Development server başlatır
   - Lokal geliştirme ortamını hazırlar

3. **Her ikisi birden:**
   - Hem WordPress build alır
   - Hem lokal ortamı hazırlar

4. **Çıkış:**
   - Script'i sonlandırır

### Manuel Komutlar

```bash
# Temizlik
npm run clean

# WordPress build
npm run build:wordpress

# Lokal development
npm run dev

# .htaccess kopyalama
npm run copy-htaccess
```

## 🔍 Sorun Giderme

### WordPress Deployment Sorunları

**404 Hatası:**
- `.htaccess` dosyasının `spor-okulu` klasöründe olduğunu kontrol edin
- WordPress kalıcı bağlantılarını yeniden kaydedin
- Dosya izinlerini kontrol edin (755/644)

**API Bağlantı Hatası:**
- Application Password'ün doğru girildiğini kontrol edin
- REST API'nin aktif olduğunu kontrol edin: `siteniz.com/wp-json/wp/v2/posts`

**Yavaş Yükleme:**
- Hosting sağlayıcınızdan PHP limitleri artırılmasını isteyin
- Cache eklentisi kullanın
- CDN hizmeti aktif edin

### Lokal Development Sorunları

**npm install Hatası:**
```bash
# Cache temizleme
npm cache clean --force

# Node modules silme ve yeniden yükleme
rm -rf node_modules
npm install
```

**Port 3000 Kullanımda:**
```bash
# Farklı port kullanma
npm run dev -- -p 3001
```

**PowerShell Execution Policy Hatası:**
```powershell
# Execution policy ayarlama
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## 📊 Performans Optimizasyonu

### WordPress için
- **Hosting Optimizasyonu:**
  - PHP 8.0+ kullanın
  - OPcache aktif edin
  - Gzip sıkıştırma aktif edin

- **WordPress Optimizasyonu:**
  - Cache eklentisi (WP Rocket, W3 Total Cache)
  - Gereksiz eklentileri kaldırın
  - Veritabanını optimize edin

- **CDN Kullanımı:**
  - CloudFlare veya benzeri CDN
  - Static dosyaları CDN üzerinden servis edin

### Lokal için
- **Development Optimizasyonu:**
  - SSD disk kullanın
  - Antivirus'ü node_modules klasörünü hariç tutacak şekilde ayarlayın
  - Windows Defender real-time protection'ı geçici olarak kapatın

## 🔒 Güvenlik

### WordPress Güvenlik
- WordPress, tema ve eklentileri güncel tutun
- Güçlü şifreler kullanın
- İki faktörlü kimlik doğrulama aktif edin
- Düzenli yedek alın
- Application Password'ü sadece gerekli kişilerle paylaşın

### Lokal Güvenlik
- Geliştirme sunucusunu sadece localhost'ta çalıştırın
- Hassas verileri production ortamında test etmeyin
- Düzenli olarak dependencies güncelleyin

## 📚 Ek Kaynaklar

### Dokümantasyon
- `WORDPRESS-DEPLOYMENT-REHBERI-FINAL.md` - Detaylı WordPress kurulum
- `LOKAL-SORUN-COZUMU.md` - Lokal geliştirme sorunları
- `POWERSHELL-KULLANIM-REHBERI.md` - PowerShell kullanım rehberi

### Yararlı Komutlar
```bash
# Proje durumu kontrol
npm run lint

# Test çalıştırma
npm test

# Build boyutu analizi
npm run build:wordpress && du -sh out/

# Cache temizleme
npm run clean
```

## ✅ Deployment Kontrol Listesi

### WordPress Deployment
- [ ] Node.js ve npm kurulu
- [ ] WordPress 5.6+ kurulu
- [ ] Application Password oluşturuldu
- [ ] Build başarıyla alındı (`out` klasörü oluştu)
- [ ] Dosyalar WordPress'e yüklendi
- [ ] `.htaccess` dosyası yerinde
- [ ] Dosya izinleri doğru (755/644)
- [ ] Menü oluşturuldu
- [ ] Uygulama erişilebilir
- [ ] WordPress entegrasyonu test edildi

### Lokal Development
- [ ] Node.js 18+ kurulu
- [ ] npm 8+ kurulu
- [ ] Dependencies yüklendi (`npm install`)
- [ ] Development server başlatıldı (`npm run dev`)
- [ ] Uygulama http://localhost:3000'de açılıyor
- [ ] Temel fonksiyonlar çalışıyor

## 🆘 Destek

### Sorun Yaşadığınızda:

1. **Browser Developer Tools:**
   - F12 → Console sekmesinde hata mesajlarını kontrol edin

2. **Build Logları:**
   - Terminal/Command Prompt'taki hata mesajlarını okuyun

3. **Dosya İzinleri:**
   - WordPress: 755 (klasörler), 644 (dosyalar)
   - Lokal: Özel izin gerekmez

4. **Cache Temizleme:**
   ```bash
   # Proje cache
   npm run clean
   
   # Browser cache
   Ctrl+F5 (Windows) / Cmd+Shift+R (Mac)
   ```

---

## 🎯 Özet

Bu rehber ile Spor Okulu CRM sisteminizi hem WordPress hosting'de hem de lokal bilgisayarınızda başarıyla çalıştırabilirsiniz. 

**Hızlı başlangıç için:**
- WordPress: `deploy-final.bat` çalıştırın, "1" seçin, `out` klasörünü hosting'e yükleyin
- Lokal: `npm install && npm run dev` komutlarını çalıştırın

**Son Güncelleme:** 2025-01-06  
**Versiyon:** 3.0 - Final Deployment Guide
# WordPress Deployment Rehberi - Spor Okulu CRM
## Tam Kurulum ve Deployment Kılavuzu

Bu rehber, Next.js tabanlı Spor Okulu CRM sistemini WordPress sitenizde nasıl kuracağınızı adım adım açıklar.

## 📋 Ön Gereksinimler

### Sistem Gereksinimleri
- WordPress 5.6 veya üzeri
- PHP 7.4 veya üzeri
- MySQL 5.7 veya üzeri
- En az 512MB RAM
- En az 100MB disk alanı

### Gerekli WordPress Eklentileri
1. **Application Passwords** (WordPress 5.6+ için dahili)
2. **Custom Post Type UI** (veri depolama için)
3. **Advanced Custom Fields** (opsiyonel, gelişmiş veri yönetimi için)

## 🚀 Adım 1: WordPress Hazırlığı

### 1.1 WordPress Yönetici Paneli Ayarları

1. **wp-admin** paneline giriş yapın
2. **Ayarlar > Kalıcı Bağlantılar** bölümüne gidin
3. **Yazı adı** seçeneğini seçin ve kaydedin
4. **Ayarlar > Genel** bölümünde site URL'lerini kontrol edin

### 1.2 Application Password Oluşturma

1. **Kullanıcılar > Profil** bölümüne gidin
2. Sayfanın altında **Application Passwords** bölümünü bulun
3. **New Application Password Name** alanına: `Spor Okulu CRM` yazın
4. **Add New Application Password** butonuna tıklayın
5. **ÖNEMLİ**: Oluşan şifreyi güvenli bir yere kaydedin (sadece bir kez gösterilir)

### 1.3 REST API Kontrolü

Tarayıcınızda şu adresi test edin:
```
https://siteniz.com/wp-json/wp/v2/posts
```
JSON verisi görüyorsanız REST API aktiftir.

## 🔧 Adım 2: Proje Build Alma

### 2.1 Geliştirme Ortamında Build

Bilgisayarınızda proje klasöründe terminal/komut satırı açın:

#### Windows için:
```batch
# WordPress build scriptini çalıştır
build-wordpress.bat
```

#### PowerShell için:
```powershell
# Execution policy ayarla (sadece ilk kez)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# WordPress build scriptini çalıştır
.\build-wordpress.ps1
```

#### Manuel Build (Alternatif):
```bash
# Temizlik
npm run clean

# WordPress build
npm run build:wordpress

# .htaccess kopyala
npm run copy-htaccess
```

### 2.2 Build Kontrolü

Build başarılı olduysa:
- `out` klasörü oluşmuş olmalı
- İçinde `index.html`, `_next` klasörü ve diğer dosyalar bulunmalı
- `.htaccess` dosyası `out` klasöründe olmalı

## 📁 Adım 3: WordPress'e Yükleme

### 3.1 FTP/cPanel File Manager ile Yükleme

1. **cPanel > File Manager** veya FTP istemcinizi açın
2. `public_html` klasörüne gidin
3. `spor-okulu` adında yeni bir klasör oluşturun
4. `out` klasöründeki **TÜM** dosyaları `public_html/spor-okulu/` klasörüne yükleyin

### 3.2 Dosya Yapısı Kontrolü

Yükleme sonrası dosya yapısı şöyle olmalı:
```
public_html/
└── spor-okulu/
    ├── .htaccess
    ├── index.html
    ├── _next/
    │   ├── static/
    │   └── ...
    ├── favicon.ico
    ├── manifest.json
    └── diğer HTML dosyaları
```

### 3.3 Dosya İzinleri

Gerekirse dosya izinlerini ayarlayın:
- Klasörler: 755
- Dosyalar: 644
- .htaccess: 644

## 🔗 Adım 4: WordPress Menü Entegrasyonu

### 4.1 Menü Oluşturma

1. **wp-admin > Görünüm > Menüler** bölümüne gidin
2. **Yeni menü oluştur** butonuna tıklayın
3. Menü adı: "Spor Okulu CRM"
4. **Özel Bağlantılar** bölümünden:
   - **URL**: `https://siteniz.com/spor-okulu/`
   - **Bağlantı Metni**: `Spor Okulu CRM`
5. **Menüye Ekle** butonuna tıklayın
6. Menüyü kaydedin ve istediğiniz konuma atayın

### 4.2 Widget Ekleme (Opsiyonel)

1. **Görünüm > Widget'lar** bölümüne gidin
2. **Özel HTML** widget'ı ekleyin
3. İçeriğe şunu yazın:
```html
<a href="/spor-okulu/" class="button">Spor Okulu CRM</a>
```

## ⚙️ Adım 5: Uygulama Konfigürasyonu

### 5.1 İlk Erişim

1. `https://siteniz.com/spor-okulu/` adresine gidin
2. Uygulama açılmalı ve giriş ekranı görünmelidir
3. **Yönetici Girişi** butonuna tıklayın

### 5.2 Sistem Ayarları

1. **Sistem Ayarları** bölümüne gidin
2. **WordPress Entegrasyonu** sekmesini açın
3. Şu bilgileri girin:
   - **WordPress Site URL**: `https://siteniz.com`
   - **REST API URL**: `https://siteniz.com/wp-json/wp/v2`
   - **Kullanıcı Adı**: WordPress admin kullanıcı adınız
   - **Application Password**: Yukarıda oluşturduğunuz şifre

4. **Bağlantıyı Test Et** butonuna tıklayın
5. Başarılı olursa **Ayarları Kaydet**

## 🧪 Adım 6: Test ve Doğrulama

### 6.1 Temel Fonksiyon Testleri

1. **Sporcular** bölümüne gidin
2. **Yeni Sporcu Ekle** ile test verisi girin
3. Sporcu bilgilerini kaydedin
4. **wp-admin > Yazılar** bölümünde verinin kaydedildiğini kontrol edin

### 6.2 Veri Senkronizasyonu Testi

1. WordPress admin panelinde **Yazılar** bölümüne gidin
2. Sporcu verileri şu formatta görünmelidir:
   - Başlık: "Sporcu: [Ad Soyad]"
   - Durum: "Özel"
   - İçerik: JSON formatında veri

### 6.3 Performans Testi

1. Uygulamanın yükleme hızını kontrol edin
2. Farklı sayfalarda gezinin
3. Veri kaydetme/yükleme işlemlerini test edin

## 🔒 Güvenlik Ayarları

### 6.1 WordPress Güvenlik

- WordPress, tema ve eklentileri güncel tutun
- Güçlü şifreler kullanın
- İki faktörlü kimlik doğrulama aktif edin
- Düzenli yedek alın

### 6.2 Uygulama Güvenliği

- Application Password'ü sadece gerekli kişilerle paylaşın
- Düzenli olarak erişim loglarını kontrol edin
- Şüpheli aktivite durumunda şifreyi yenileyin

### 6.3 .htaccess Güvenlik Kontrolleri

`.htaccess` dosyasında şu güvenlik ayarları aktif:
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin

## 🚨 Sorun Giderme

### Yaygın Sorunlar ve Çözümleri

#### 1. 404 Hatası
**Sorun**: Uygulama açılmıyor, 404 hatası veriyor
**Çözüm**: 
- `.htaccess` dosyasının `spor-okulu` klasöründe olduğunu kontrol edin
- WordPress kalıcı bağlantılarını yeniden kaydedin
- Dosya izinlerini kontrol edin

#### 2. API Bağlantı Hatası
**Sorun**: WordPress ile veri senkronizasyonu çalışmıyor
**Çözüm**:
- Application Password'ün doğru girildiğini kontrol edin
- REST API'nin aktif olduğunu kontrol edin
- CORS ayarlarını kontrol edin

#### 3. Yavaş Yükleme
**Sorun**: Uygulama çok yavaş açılıyor
**Çözüm**:
- Hosting sağlayıcınızdan PHP limitleri artırılmasını isteyin
- Cache eklentisi kullanın
- CDN hizmeti aktif edin

#### 4. Dosya Yükleme Hatası
**Sorun**: Dosyalar yüklenmiyor
**Çözüm**:
- Dosya izinlerini kontrol edin (755/644)
- PHP upload_max_filesize ayarını kontrol edin
- Disk alanını kontrol edin

#### 5. Stil/CSS Sorunları
**Sorun**: Uygulama düzgün görünmüyor
**Çözüm**:
- Browser cache'ini temizleyin
- CSS dosyalarının doğru yüklendiğini kontrol edin
- Developer Tools'da 404 hatalarını kontrol edin

## 🔄 Güncelleme Süreci

### Uygulama Güncellendiğinde:

1. **Yedek Alın**:
   ```bash
   # Mevcut klasörü yedekleyin
   cp -r public_html/spor-okulu public_html/spor-okulu-backup
   ```

2. **Yeni Build Alın**:
   ```bash
   npm run build:wordpress
   ```

3. **Dosyaları Güncelleyin**:
   - Yeni `out` klasörünün içeriğini `spor-okulu` klasörüne yükleyin
   - Ayarları kontrol edin

4. **Test Edin**:
   - Uygulamanın çalıştığını kontrol edin
   - Veri bütünlüğünü kontrol edin

## 📞 Destek ve Yardım

### Sorun Yaşadığınızda:

1. **Browser Developer Tools**:
   - F12 tuşuna basın
   - Console sekmesinde hata mesajlarını kontrol edin

2. **WordPress Debug Logları**:
   - `wp-config.php` dosyasında debug modunu aktif edin
   - `wp-content/debug.log` dosyasını kontrol edin

3. **Hosting Error Logları**:
   - cPanel > Error Logs bölümünü kontrol edin
   - PHP error loglarını inceleyin

### Yararlı Komutlar:

```bash
# Cache temizleme
npm run clean

# Yeniden build
npm run build:wordpress

# Dosya izinleri düzeltme (Linux/Mac)
find public_html/spor-okulu -type d -exec chmod 755 {} \;
find public_html/spor-okulu -type f -exec chmod 644 {} \;
```

## 📊 Performans Optimizasyonu

### 1. Hosting Optimizasyonu
- PHP 8.0+ kullanın
- OPcache aktif edin
- Gzip sıkıştırma aktif edin

### 2. WordPress Optimizasyonu
- Cache eklentisi kullanın (WP Rocket, W3 Total Cache)
- Gereksiz eklentileri kaldırın
- Veritabanını optimize edin

### 3. CDN Kullanımı
- CloudFlare veya benzeri CDN hizmeti kullanın
- Static dosyaları CDN üzerinden servis edin

---

## ✅ Kurulum Kontrol Listesi

- [ ] WordPress 5.6+ kurulu
- [ ] Application Password oluşturuldu
- [ ] REST API aktif
- [ ] Build başarıyla alındı
- [ ] Dosyalar WordPress'e yüklendi
- [ ] .htaccess dosyası yerinde
- [ ] Dosya izinleri doğru
- [ ] Menü oluşturuldu
- [ ] Uygulama ayarları yapıldı
- [ ] Test verileri oluşturuldu
- [ ] Güvenlik ayarları kontrol edildi

Bu rehberi takip ederek Spor Okulu CRM sisteminizi WordPress sitenizde başarıyla çalıştırabilirsiniz. Herhangi bir sorun yaşarsanız, adım adım kontrol listesini tekrar gözden geçirin.

**Son Güncelleme**: 2025-01-05
**Versiyon**: 2.0 - WordPress Deployment Final
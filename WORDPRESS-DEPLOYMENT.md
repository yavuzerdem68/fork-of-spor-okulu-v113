# WordPress Deployment Rehberi - G7 Spor Okulu CRM

Bu rehber, Next.js tabanlı Spor Okulu CRM sistemini WordPress sitenizde (www.g7spor.org) nasıl kuracağınızı adım adım açıklar.

## Ön Hazırlık

### 1. WordPress Yönetici Paneli Hazırlığı

1. **wp-admin** paneline giriş yapın: `https://www.g7spor.org/wp-admin`
2. **Eklentiler > Yeni Ekle** bölümüne gidin
3. Aşağıdaki eklentileri arayıp kurun:
   - **Application Passwords** (WordPress 5.6+ için gerekli)
   - **Custom Post Type UI** (veri depolama için)
   - **Advanced Custom Fields** (meta veriler için)

### 2. Application Password Oluşturma

1. **Kullanıcılar > Profil** bölümüne gidin
2. Sayfanın altında **Application Passwords** bölümünü bulun
3. **New Application Password Name** alanına: `Spor Okulu CRM` yazın
4. **Add New Application Password** butonuna tıklayın
5. Oluşan şifreyi güvenli bir yere kaydedin (sadece bir kez gösterilir)

### 3. Custom Post Types Oluşturma

**Eklentiler > Custom Post Type UI > Add/Edit Post Types** bölümüne gidin ve aşağıdaki post type'ları oluşturun:

#### Sporcu Verileri için:
- **Post Type Slug**: `spor_athletes`
- **Plural Label**: `Sporcular`
- **Singular Label**: `Sporcu`
- **Public**: `False` (güvenlik için)
- **Show in REST**: `True` (API erişimi için)

#### Genel Veriler için:
- **Post Type Slug**: `spor_data`
- **Plural Label**: `Spor Verileri`
- **Singular Label**: `Spor Verisi`
- **Public**: `False`
- **Show in REST**: `True`

### 4. Dosya Yükleme İzinleri

**Araçlar > Site Health > Info** bölümünde aşağıdaki değerleri kontrol edin:
- `upload_max_filesize`: En az 10MB
- `post_max_size`: En az 10MB
- `max_execution_time`: En az 300 saniye

## Proje Hazırlığı

### 1. Geliştirme Ortamında Build Alma

Bilgisayarınızda proje klasöründe terminal açın ve şu komutları çalıştırın:

```bash
# WordPress için özel build
npm run build:wordpress

# Veya manuel olarak:
NEXT_CONFIG_FILE=next.config.wordpress.mjs npm run build
```

### 2. .htaccess Dosyası Oluşturma

Proje ana dizininde `.htaccess` dosyası oluşturun:

```apache
# .htaccess
RewriteEngine On

# Handle client-side routing
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /spor-okulu/index.html [L]

# Security headers
Header always set X-Frame-Options DENY
Header always set X-Content-Type-Options nosniff
Header always set Referrer-Policy "strict-origin-when-cross-origin"

# Cache static assets
<FilesMatch "\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$">
    ExpiresActive On
    ExpiresDefault "access plus 1 month"
    Header set Cache-Control "public, immutable"
</FilesMatch>

# Compress files
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>
```

### 3. Build Sonrası Dosya Hazırlığı

Build tamamlandıktan sonra `out` klasöründeki tüm dosyaları hazırlayın.

## WordPress'e Yükleme

### 1. FTP/cPanel File Manager ile Yükleme

1. **cPanel > File Manager** veya FTP istemcinizi açın
2. `public_html` klasörüne gidin
3. `spor-okulu` adında yeni bir klasör oluşturun
4. `out` klasöründeki tüm dosyaları `public_html/spor-okulu/` klasörüne yükleyin

### 2. Dosya İzinleri Ayarlama

Yüklenen dosyalar için izinleri ayarlayın:
- Klasörler: 755
- Dosyalar: 644

### 3. WordPress Menü Ekleme

1. **wp-admin > Görünüm > Menüler** bölümüne gidin
2. Yeni menü oluşturun: "Spor Okulu"
3. **Özel Bağlantılar** bölümünden:
   - **URL**: `https://www.g7spor.org/spor-okulu/`
   - **Bağlantı Metni**: `Spor Okulu CRM`
4. Menüyü kaydedin ve istediğiniz konuma atayın

## Konfigürasyon

### 1. WordPress API Ayarları

Uygulamanın WordPress ile iletişim kurabilmesi için aşağıdaki bilgileri not edin:

- **WordPress Site URL**: `https://www.g7spor.org`
- **REST API URL**: `https://www.g7spor.org/wp-json/wp/v2`
- **Kullanıcı Adı**: WordPress admin kullanıcı adınız
- **Application Password**: Yukarıda oluşturduğunuz şifre

### 2. Uygulama İçi Ayarlar

Uygulama ilk açıldığında **Sistem Ayarları** bölümünden:

1. **WordPress Entegrasyonu** sekmesine gidin
2. Yukarıdaki bilgileri girin
3. **Bağlantıyı Test Et** butonuna tıklayın
4. Başarılı olursa ayarları kaydedin

## Test ve Doğrulama

### 1. Uygulama Erişimi

`https://www.g7spor.org/spor-okulu/` adresine gidin ve uygulamanın açıldığını kontrol edin.

### 2. Veri Kaydetme Testi

1. **Sporcular** bölümüne gidin
2. **Yeni Sporcu Ekle** ile test verisi girin
3. Kaydettikten sonra **wp-admin > Yazılar** bölümünde verinin kaydedildiğini kontrol edin

### 3. WordPress Veri Kontrolü

**wp-admin > Yazılar** bölümünde:
- Sporcu verileri "Sporcu: [Ad Soyad]" formatında görünmelidir
- Durum: "Özel" olmalıdır
- İçerik: JSON formatında veri içermelidir

## Güvenlik Önerileri

### 1. WordPress Güvenlik

- WordPress, tema ve eklentileri güncel tutun
- Güçlü şifreler kullanın
- İki faktörlü kimlik doğrulama aktif edin
- Düzenli yedek alın

### 2. Uygulama Güvenliği

- Application Password'ü sadece gerekli kişilerle paylaşın
- Düzenli olarak erişim loglarını kontrol edin
- Şüpheli aktivite durumunda şifreyi yenileyin

## Sorun Giderme

### Yaygın Sorunlar ve Çözümleri

1. **404 Hatası**: `.htaccess` dosyasının doğru yüklendiğini kontrol edin
2. **API Bağlantı Hatası**: Application Password'ün doğru girildiğini kontrol edin
3. **Yavaş Yükleme**: Hosting sağlayıcınızdan PHP limitleri artırılmasını isteyin
4. **Dosya Yükleme Hatası**: Dosya izinlerini kontrol edin

### Destek

Sorun yaşadığınızda:
1. Browser Developer Tools'da console hatalarını kontrol edin
2. WordPress Debug loglarını inceleyin
3. Hosting sağlayıcınızın error loglarına bakın

## Güncelleme Süreci

Uygulama güncellendiğinde:
1. Yeni build alın: `npm run build:wordpress`
2. Mevcut `spor-okulu` klasörünü yedekleyin
3. Yeni dosyaları yükleyin
4. Ayarları kontrol edin

---

Bu rehberi takip ederek Spor Okulu CRM sisteminizi WordPress sitenizde başarıyla çalıştırabilirsiniz. Herhangi bir sorun yaşarsanız, adım adım kontrol listesini tekrar gözden geçirin.
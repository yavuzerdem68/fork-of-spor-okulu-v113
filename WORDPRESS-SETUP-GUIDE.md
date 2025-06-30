# WordPress Kurulum ve Ayar Rehberi

## 1. WORDPRESS EKLENTİLERİ

### A) Gerekli Eklentiler
```
✅ Application Passwords (WordPress 5.6+ ile birlikte gelir)
✅ WP REST API Authentication (opsiyonel, ekstra güvenlik için)
✅ Custom Post Type UI (sporcu verilerini saklamak için)
✅ Advanced Custom Fields (opsiyonel, ekstra alanlar için)
```

### B) Eklenti Kurulumu
1. WordPress Admin → Eklentiler → Yeni Ekle
2. "Custom Post Type UI" ara ve kur
3. "Advanced Custom Fields" ara ve kur (opsiyonel)

## 2. APPLICATION PASSWORD OLUŞTURMA

### Adım 1: WordPress Admin'e Giriş
- WordPress admin paneline giriş yap
- Kullanıcılar → Profil'e git

### Adım 2: Application Password Oluştur
```
1. Sayfayı aşağı kaydır
2. "Application Passwords" bölümünü bul
3. "New Application Password Name" alanına: "SportsCRM"
4. "Add New Application Password" butonuna tık
5. Oluşan şifreyi KOPYALA ve SAKLA (bir daha gösterilmez!)
```

### Örnek Application Password:
```
Kullanıcı Adı: admin
Application Password: xxxx xxxx xxxx xxxx xxxx xxxx
```

## 3. CUSTOM POST TYPE OLUŞTURMA

### Adım 1: Custom Post Type UI Ayarları
1. WordPress Admin → CPT UI → Add/Edit Post Types
2. Yeni Post Type oluştur:

```
Post Type Slug: athletes
Plural Label: Sporcular
Singular Label: Sporcu
Public: True
Show in REST: True (ÖNEMLİ!)
REST Base: athletes
```

### Adım 2: Custom Fields (ACF ile)
```
Sporcu Bilgileri:
- ad (Text)
- soyad (Text)
- tc_kimlik (Text)
- dogum_tarihi (Date)
- telefon (Text)
- email (Email)
- adres (Textarea)
- spor_dali (Select)
- kayit_tarihi (Date)
- durum (Select: Aktif/Pasif)
```

## 4. REST API TEST

### Test URL'leri:
```bash
# Sporcuları listele
GET https://g7spor.org/wp-json/wp/v2/athletes

# Yeni sporcu ekle
POST https://g7spor.org/wp-json/wp/v2/athletes
Authorization: Basic base64(username:application_password)
```

### Test Komutu (Terminal):
```bash
curl -X GET "https://g7spor.org/wp-json/wp/v2/athletes" \
  -u "admin:xxxx xxxx xxxx xxxx xxxx xxxx"
```

## 5. WORDPRESS AYARLARI

### A) Permalink Ayarları
- WordPress Admin → Ayarlar → Kalıcı Bağlantılar
- "Post name" seçeneğini seç
- Değişiklikleri kaydet

### B) REST API Ayarları
- WordPress Admin → Ayarlar → Genel
- "Anyone can register" seçeneğini kapat (güvenlik)

### C) CORS Ayarları (functions.php'ye ekle)
```php
// WordPress tema functions.php dosyasına ekle
add_action('rest_api_init', function() {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function($value) {
        header('Access-Control-Allow-Origin: https://g7spor.org');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Authorization, Content-Type');
        return $value;
    });
});
```

## 6. GÜVENLİK AYARLARI

### A) Application Password Güvenliği
```
✅ Güçlü kullanıcı adı kullan (admin değil)
✅ Application Password'ü güvenli yerde sakla
✅ Düzenli olarak şifreleri yenile
✅ Kullanılmayan application password'leri sil
```

### B) REST API Güvenliği
```
✅ Sadece gerekli endpoint'leri aç
✅ Rate limiting uygula
✅ HTTPS kullan (SSL sertifikası)
✅ IP whitelist (opsiyonel)
```

## 7. VERİ YEDEKLEME

### A) WordPress Veritabanı Yedekleme
```bash
# cPanel → phpMyAdmin → Export
# Veya eklenti: UpdraftPlus
```

### B) Otomatik Yedekleme Ayarı
- UpdraftPlus eklentisi kur
- Günlük otomatik yedekleme ayarla
- Google Drive/Dropbox entegrasyonu

## 8. TEST VE DOĞRULAMA

### A) REST API Test
```javascript
// Browser console'da test
fetch('https://g7spor.org/wp-json/wp/v2/athletes', {
  headers: {
    'Authorization': 'Basic ' + btoa('admin:your_app_password')
  }
})
.then(response => response.json())
.then(data => console.log(data));
```

### B) Form Test
1. SportsCRM'de yeni sporcu ekle
2. WordPress Admin → Sporcular'da kontrol et
3. REST API'den veriyi çek ve kontrol et

## 9. SORUN GİDERME

### A) Yaygın Hatalar
```
403 Forbidden: Application password yanlış
404 Not Found: Custom post type REST'e açık değil
CORS Error: CORS headers eksik
500 Error: PHP/WordPress hatası
```

### B) Debug Modu
WordPress wp-config.php'ye ekle:
```php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
```

## 10. PRODUCTION HAZIRLIK

### A) Son Kontroller
```
✅ SSL sertifikası aktif
✅ Application passwords çalışıyor
✅ Custom post types REST'e açık
✅ CORS headers doğru
✅ Yedekleme sistemi aktif
```

### B) Performans Optimizasyonu
```
✅ Caching eklentisi (WP Rocket, W3 Total Cache)
✅ CDN kurulumu (Cloudflare)
✅ Database optimizasyonu
✅ Image optimization
```
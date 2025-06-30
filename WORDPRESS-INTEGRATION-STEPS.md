# WordPress Entegrasyon Adım Adım Rehber

## 🎯 HEMEN YAPILACAKLAR (Bugün)

### 1. WordPress'te Application Password Oluştur
```
1. https://g7spor.org/wp-admin/ → Giriş yap
2. Kullanıcılar → Profil
3. Aşağı kaydır → "Application Passwords"
4. Name: "SportsCRM-API"
5. "Add New" → Şifreyi KOPYALA ve SAKLA!
```

### 2. Custom Post Type UI Eklentisini Kur
```
1. Eklentiler → Yeni Ekle
2. "Custom Post Type UI" ara
3. Kur ve Etkinleştir
4. CPT UI → Add/Edit Post Types
```

### 3. Sporcu Post Type'ını Oluştur
```
Post Type Slug: athletes
Plural Label: Sporcular  
Singular Label: Sporcu
Public: ✅ True
Show in REST: ✅ True (ÇOK ÖNEMLİ!)
REST Base: athletes
```

## 🔧 WORDPRESS AYARLARI

### A) Permalink Ayarları
```
Ayarlar → Kalıcı Bağlantılar → "Post name" seç → Kaydet
```

### B) CORS Ayarları (Tema functions.php)
```php
// Aktif tema → functions.php dosyasının sonuna ekle:

add_action('rest_api_init', function() {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function($value) {
        header('Access-Control-Allow-Origin: https://g7spor.org');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Authorization, Content-Type, X-WP-Nonce');
        header('Access-Control-Allow-Credentials: true');
        return $value;
    });
});

// REST API için custom endpoint
add_action('rest_api_init', function() {
    register_rest_route('sportscrm/v1', '/athletes', array(
        'methods' => 'GET,POST,PUT,DELETE',
        'callback' => 'handle_athletes_request',
        'permission_callback' => function() {
            return current_user_can('edit_posts');
        }
    ));
});

function handle_athletes_request($request) {
    // Bu fonksiyon SportsCRM ile entegrasyon için
    return new WP_REST_Response(['status' => 'success'], 200);
}
```

## 🧪 TEST İŞLEMLERİ

### 1. REST API Test (Browser Console)
```javascript
// WordPress REST API test
fetch('https://g7spor.org/wp-json/wp/v2/athletes', {
  method: 'GET',
  headers: {
    'Authorization': 'Basic ' + btoa('KULLANICI_ADI:APPLICATION_PASSWORD'),
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => console.log('WordPress API Response:', data))
.catch(error => console.error('Error:', error));
```

### 2. Sporcu Ekleme Test
```javascript
// Yeni sporcu ekleme test
fetch('https://g7spor.org/wp-json/wp/v2/athletes', {
  method: 'POST',
  headers: {
    'Authorization': 'Basic ' + btoa('KULLANICI_ADI:APPLICATION_PASSWORD'),
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'Test Sporcu',
    content: 'Test sporcu açıklaması',
    status: 'publish',
    meta: {
      ad: 'Test',
      soyad: 'Sporcu',
      tc_kimlik: '12345678901'
    }
  })
})
.then(response => response.json())
.then(data => console.log('Sporcu eklendi:', data));
```

## 🔗 SPORTSCRM ENTEGRASYONu

### 1. WordPress Ayarları Sayfası Güncelle
SportsCRM'de WordPress Settings sayfasında şu bilgileri gir:

```
WordPress URL: https://g7spor.org
Username: [WordPress kullanıcı adın]
Application Password: [Oluşturduğun şifre]
API Endpoint: /wp-json/wp/v2/athletes
```

### 2. Çift Kaydetme Sistemi Aktifleştir
```javascript
// src/lib/wordpress-api.ts dosyasında
const WORDPRESS_CONFIG = {
  baseUrl: 'https://g7spor.org',
  username: process.env.WORDPRESS_USERNAME,
  password: process.env.WORDPRESS_APP_PASSWORD,
  endpoint: '/wp-json/wp/v2/athletes'
};
```

### 3. Environment Variables Ekle
```bash
# .env.local dosyası oluştur
WORDPRESS_USERNAME=your_username
WORDPRESS_APP_PASSWORD=your_app_password
WORDPRESS_API_URL=https://g7spor.org/wp-json/wp/v2
```

## 📊 VERİ MİGRASYON PLANI

### Aşama 1: Mevcut Verileri WordPress'e Aktar (1 hafta)
```bash
# Migration script çalıştır
npm run migrate:github-to-wordpress

# Manuel kontrol
# WordPress Admin → Sporcular → Tüm veriler geldi mi?
```

### Aşama 2: Çift Kaydetme Sistemi (2 hafta)
```
✅ Yeni veriler hem GitHub hem WordPress'e kaydedilir
✅ Günlük senkronizasyon kontrolü
✅ Veri tutarlılığı testi
```

### Aşama 3: WordPress'e Tam Geçiş (1 hafta)
```
✅ GitHub storage pasif
✅ WordPress ana depolama
✅ Performans testi
✅ Yedekleme sistemi aktif
```

## 🛠️ SORUN GİDERME

### A) Yaygın Hatalar ve Çözümleri

#### 1. 403 Forbidden Error
```
Sebep: Application password yanlış
Çözüm: Yeni application password oluştur
Test: Browser console'da API çağrısı yap
```

#### 2. 404 Not Found Error  
```
Sebep: Custom post type REST'e açık değil
Çözüm: CPT UI → athletes → Show in REST: True
Test: /wp-json/wp/v2/athletes URL'ini ziyaret et
```

#### 3. CORS Error
```
Sebep: CORS headers eksik
Çözüm: functions.php'ye CORS kodu ekle
Test: Browser network tab'ında headers kontrol et
```

#### 4. 500 Internal Server Error
```
Sebep: PHP hatası veya plugin çakışması
Çözüm: WordPress debug mode aç, error log kontrol et
Test: wp-config.php'de WP_DEBUG = true
```

### B) Debug Komutları
```bash
# WordPress error log kontrol
tail -f /path/to/wordpress/wp-content/debug.log

# REST API endpoint test
curl -I https://g7spor.org/wp-json/wp/v2/athletes

# Authentication test
curl -u "username:app_password" https://g7spor.org/wp-json/wp/v2/users/me
```

## 📋 KONTROL LİSTESİ

### WordPress Hazırlık ✅
```
□ Application Password oluşturuldu
□ Custom Post Type UI kuruldu
□ Athletes post type oluşturuldu
□ Show in REST aktif
□ Permalink ayarları yapıldı
□ CORS headers eklendi
□ REST API test edildi
```

### SportsCRM Entegrasyon ✅
```
□ WordPress settings sayfası güncellendi
□ Environment variables eklendi
□ API connection test edildi
□ Çift kaydetme sistemi aktif
□ Error handling eklendi
□ Backup sistemi hazır
```

### Production Hazırlık ✅
```
□ SSL sertifikası aktif
□ Yedekleme sistemi çalışıyor
□ Performance test yapıldı
□ Security scan tamamlandı
□ User acceptance test
□ Rollback planı hazır
```

## 🚀 DEPLOYMENT SONRASI

### 1. İlk 24 Saat
```
✅ Saatlik site kontrolü
✅ Form submission test
✅ Veri senkronizasyon kontrolü
✅ Error log monitoring
```

### 2. İlk Hafta
```
✅ Günlük veri backup
✅ Performance monitoring
✅ User feedback toplama
✅ Bug fix deployment
```

### 3. İlk Ay
```
✅ Haftalık güvenlik tarama
✅ Database optimization
✅ Feature enhancement
✅ Documentation update
```

Bu rehberi takip ederek WordPress entegrasyonunu güvenli ve adım adım gerçekleştirebilirsiniz.
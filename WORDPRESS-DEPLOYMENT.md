# 🎯 WordPress Deployment Rehberi

Bu rehber, SportsCRM projesini WordPress sitenizde yayınlamanız için özel olarak hazırlanmıştır.

## 📋 WordPress için Hazırlık

### Adım 1: Static Export Oluşturma

```bash
# 1. WordPress konfigürasyonunu aktif edin
cp next.config.wordpress.mjs next.config.mjs
cp package.wordpress.json package.json

# 2. Bağımlılıkları yükleyin
npm install

# 3. WordPress için build alın
npm run build:wordpress
```

Bu komutlar çalıştıktan sonra `out/` klasöründe WordPress'e yükleyebileceğiniz static dosyalar hazır olacak.

## 📁 WordPress'e Yükleme

### Yöntem 1: Alt Klasör Olarak
```
your-website.com/sportscrm/
```

1. `out/` klasörünün içindeki tüm dosyaları alın
2. WordPress sitenizin `public_html/sportscrm/` klasörüne yükleyin
3. `https://your-website.com/sportscrm/` adresinden erişin

### Yöntem 2: Subdomain Olarak
```
crm.your-website.com
```

1. cPanel'den subdomain oluşturun: `crm.your-website.com`
2. `out/` klasörünün içindeki dosyaları subdomain klasörüne yükleyin
3. `https://crm.your-website.com` adresinden erişin

### Yöntem 3: Ana Domain Olarak
```
your-website.com
```

1. WordPress'i başka bir klasöre taşıyın
2. `out/` klasörünün içindeki dosyaları `public_html/` ana klasörüne yükleyin

## ⚙️ WordPress Entegrasyonu

### WordPress Plugin Olarak Kullanım

1. **Custom Post Type** oluşturun:
```php
// functions.php'ye ekleyin
function create_sportscrm_post_type() {
    register_post_type('sportscrm_data',
        array(
            'labels' => array(
                'name' => 'SportsCRM Data',
            ),
            'public' => true,
            'has_archive' => true,
        )
    );
}
add_action('init', 'create_sportscrm_post_type');
```

2. **REST API** ile veri alışverişi:
```php
// WordPress REST API endpoint
add_action('rest_api_init', function () {
    register_rest_route('sportscrm/v1', '/athletes', array(
        'methods' => 'GET',
        'callback' => 'get_athletes_data',
    ));
});
```

## 🔧 Özelleştirmeler

### Logo ve Branding
```bash
# public/ klasörüne kendi logonuzu ekleyin
# src/components/Logo.tsx dosyasını güncelleyin
```

### Renk Teması
```css
/* src/styles/globals.css */
:root {
  --primary: 120 100% 25%; /* Yeşil tema */
  --secondary: 210 40% 95%;
}
```

### Domain Ayarları
```javascript
// next.config.wordpress.mjs
const nextConfig = {
  basePath: '/sportscrm', // Alt klasör kullanıyorsanız
  assetPrefix: 'https://your-domain.com/sportscrm/',
};
```

## 🚀 Performans Optimizasyonu

### 1. Gzip Sıkıştırma
`.htaccess` dosyasına ekleyin:
```apache
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

### 2. Cache Headers
```apache
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
</IfModule>
```

## 🔒 Güvenlik

### 1. Dosya İzinleri
```bash
# Klasör izinleri
chmod 755 sportscrm/
# Dosya izinleri  
chmod 644 sportscrm/*
```

### 2. .htaccess Güvenlik
```apache
# Hassas dosyaları gizle
<Files "*.json">
    Order allow,deny
    Deny from all
</Files>

<Files "*.md">
    Order allow,deny
    Deny from all
</Files>
```

## 📊 Analytics Entegrasyonu

### Google Analytics
```javascript
// src/pages/_app.tsx'ya ekleyin
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function App({ Component, pageProps }) {
  const router = useRouter();
  
  useEffect(() => {
    const handleRouteChange = (url) => {
      gtag('config', 'GA_MEASUREMENT_ID', {
        page_path: url,
      });
    };
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  return <Component {...pageProps} />;
}
```

## 🆘 Sorun Giderme

### Yaygın Sorunlar

1. **CSS yüklenmiyor**
   - `assetPrefix` ayarını kontrol edin
   - Dosya yollarını kontrol edin

2. **JavaScript çalışmıyor**
   - Browser console'da hata mesajlarını kontrol edin
   - CORS ayarlarını kontrol edin

3. **Resimler görünmüyor**
   - `next.config.mjs`'de `images.unoptimized: true` olduğundan emin olun

### Destek

Sorun yaşarsanız:
1. Browser Developer Tools'u açın
2. Console'daki hata mesajlarını kontrol edin
3. Network tab'inde dosyaların yüklenip yüklenmediğini kontrol edin

## ✅ Checklist

- [ ] Node.js 20.x yüklü
- [ ] `npm install` çalıştırıldı
- [ ] `npm run build:wordpress` çalıştırıldı
- [ ] `out/` klasörü oluştu
- [ ] Dosyalar WordPress'e yüklendi
- [ ] Domain/subdomain ayarlandı
- [ ] .htaccess dosyası yapılandırıldı
- [ ] SSL sertifikası aktif
- [ ] Test edildi ve çalışıyor

Başarılar! 🎉
# 404 Asset Hatalarının Çözümü

Bu rehber, subdirectory deployment sonrasında yaşanan 404 asset hatalarını çözmek için yapılan düzeltmeleri açıklar.

## Sorun
Deployment sonrasında şu hatalar alınıyordu:
- `webpack-*.js: 404`
- `*.css: 404` 
- `framework-*.js: 404`
- `main-*.js: 404`
- `_app-*.js: 404`
- `manifest.json: 404`

## Çözüm

### 1. .htaccess Düzeltmeleri
`.htaccess` dosyasındaki rewrite kuralları güncellendi:

```apache
RewriteEngine On

# Handle static assets first - don't rewrite if file exists
RewriteCond %{REQUEST_FILENAME} -f [OR]
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^ - [L]

# Handle Next.js _next static files specifically
RewriteRule ^spor-okulu/_next/(.*)$ /spor-okulu/_next/$1 [L]

# Handle other static assets (CSS, JS, images, etc.)
RewriteRule ^spor-okulu/(.*\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|json))$ /spor-okulu/$1 [L]

# Handle client-side routing for Next.js static export - only for non-static files
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} ^/spor-okulu/
RewriteRule ^spor-okulu/(.*)$ /spor-okulu/index.html [L]

# Redirect root requests to spor-okulu subdirectory
RewriteCond %{REQUEST_URI} !^/spor-okulu/
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /spor-okulu/$1 [R=301,L]
```

### 2. _document.tsx Düzeltmeleri
Tüm asset yolları subdirectory için güncellendi:

```tsx
// Önceki hali
<link rel="manifest" href="/manifest.json" />
<link rel="icon" href="/favicon.ico" />

// Yeni hali
<link rel="manifest" href="/spor-okulu/manifest.json" />
<link rel="icon" href="/spor-okulu/favicon.ico" />
```

### 3. manifest.json Düzeltmeleri
PWA manifest dosyasındaki tüm yollar güncellendi:

```json
{
  "start_url": "/spor-okulu/",
  "scope": "/spor-okulu/",
  "icons": [
    {
      "src": "/spor-okulu/favicon.ico",
      "sizes": "16x16 32x32 48x48"
    }
  ],
  "shortcuts": [
    {
      "url": "/spor-okulu/dashboard",
      "icons": [{"src": "/spor-okulu/favicon.ico"}]
    }
  ]
}
```

## Deployment Adımları

1. **Projeyi build edin:**
   ```bash
   npm run build:wordpress
   ```

2. **Out klasörünü oluşturun:**
   ```bash
   npm run create-out
   ```

3. **htaccess dosyasını kopyalayın:**
   ```bash
   copy .htaccess out\
   ```

4. **Out klasörünü sunucuya yükleyin:**
   - `out` klasörünün içeriğini `public_html/spor-okulu/` dizinine kopyalayın

## Test Etme

Deployment sonrasında şunları kontrol edin:

1. **Ana sayfa yükleniyor mu?**
   - `https://yourdomain.com/spor-okulu/`

2. **Static assetler yükleniyor mu?**
   - Browser Developer Tools > Network tab'ında 404 hatası var mı?

3. **PWA çalışıyor mu?**
   - Manifest.json erişilebilir mi?
   - Service worker kayıtlı mı?

4. **İç sayfalar çalışıyor mu?**
   - `/spor-okulu/dashboard`
   - `/spor-okulu/athletes`

## Sorun Giderme

Eğer hala 404 hataları alıyorsanız:

1. **Dosya yollarını kontrol edin:**
   - `public_html/spor-okulu/_next/static/` klasörü var mı?
   - `public_html/spor-okulu/manifest.json` dosyası var mı?

2. **htaccess çalışıyor mu?**
   - Apache mod_rewrite aktif mi?
   - htaccess dosyası doğru yerde mi?

3. **Cache temizleyin:**
   - Browser cache'ini temizleyin
   - CDN cache'ini temizleyin (varsa)

## Önemli Notlar

- Bu düzeltmeler sadece `/spor-okulu` subdirectory deployment için geçerlidir
- Root domain deployment için farklı konfigürasyon gerekir
- Tüm asset yolları hardcoded olarak `/spor-okulu` prefix'i ile güncellendi
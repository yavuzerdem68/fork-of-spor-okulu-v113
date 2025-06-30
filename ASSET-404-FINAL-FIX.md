# 404 Asset Hatası - Kesin Çözüm

Bu dosya, statik asset'lerin 404 hatası vermesi sorununu kesin olarak çözmek için gerekli adımları içerir.

## Yapılan Değişiklikler

### 1. `_document.tsx` Güncellemesi
- `<base href="/spor-okulu/">` etiketi eklendi
- Bu etiket tüm relative URL'lerin `/spor-okulu/` prefix'i ile başlamasını sağlar

### 2. `next.config.wordpress.mjs` Güncellemesi
- Webpack konfigürasyonunda `publicPath` zorlaması eklendi
- `publicRuntimeConfig` ile basePath zorlaması eklendi

### 3. `create-out-folder.js` Güncellemesi
- HTML dosyaları kopyalanırken asset yolları otomatik düzeltiliyor
- `/_next/` yolları `/spor-okulu/_next/` olarak değiştiriliyor
- Diğer asset yolları da `/spor-okulu/` prefix'i ile düzeltiliyor

## Deployment Adımları

### Adım 1: Temiz Build
```bash
# Eski build dosyalarını temizle
rmdir /s /q .next
rmdir /s /q out

# WordPress için build yap
npm run build:wordpress
```

### Adım 2: Out Klasörü Oluştur
```bash
# Out klasörünü oluştur ve asset yollarını düzelt
node create-out-folder.js
```

### Adım 3: .htaccess Kopyala
```bash
# .htaccess dosyasını out klasörüne kopyala
copy .htaccess out\
```

### Adım 4: Sunucuya Upload
1. **ÖNEMLİ**: Sunucudaki `public_html/spor-okulu/` klasöründeki TÜM dosyaları sil
2. `out` klasöründeki TÜM içeriği `public_html/spor-okulu/` klasörüne yükle
3. `.htaccess` dosyasının da yüklendiğinden emin ol

## Kontrol Listesi

- [ ] `.next` ve `out` klasörleri temizlendi
- [ ] `npm run build:wordpress` çalıştırıldı
- [ ] `node create-out-folder.js` çalıştırıldı
- [ ] `.htaccess` dosyası `out` klasörüne kopyalandı
- [ ] Sunucudaki eski dosyalar tamamen silindi
- [ ] `out` klasörünün tüm içeriği sunucuya yüklendi
- [ ] Site `https://g7spor.org/spor-okulu/` adresinden açılıyor
- [ ] Console'da 404 hatası yok

## Sorun Giderme

Eğer hala 404 hatası alıyorsanız:

1. **Browser cache'ini temizleyin** (Ctrl+Shift+R)
2. **Sunucudaki dosyaları kontrol edin**:
   - `public_html/spor-okulu/_next/static/` klasörü var mı?
   - `public_html/spor-okulu/.htaccess` dosyası var mı?
3. **HTML dosyasını kontrol edin**:
   - `public_html/spor-okulu/index.html` dosyasını açın
   - `<base href="/spor-okulu/">` etiketi var mı?
   - `_next` yolları `/spor-okulu/_next/` ile başlıyor mu?

## Test

Deployment sonrası şu adımları test edin:
1. `https://g7spor.org/spor-okulu/` adresini açın
2. F12 ile Developer Tools'u açın
3. Console sekmesinde 404 hatası olmamalı
4. Network sekmesinde tüm asset'ler başarıyla yüklenmeli

Bu adımları takip ettikten sonra 404 hatası tamamen çözülmüş olacaktır.
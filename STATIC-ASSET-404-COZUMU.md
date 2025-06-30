# Static Asset 404 Hatalarının Kesin Çözümü

Bu rehber, CSS, JS ve icon dosyaları için yaşanan 404 hatalarını tamamen çözmek için hazırlanmıştır.

## Sorunlar
- `1262faf80e05e4d9.css:1 Failed to load resource: 404`
- `webpack-286d346ef583cc19.js:1 Failed to load resource: 404`
- `framework-840cff9d6bb95703.js:1 Failed to load resource: 404`
- `main-3055608c0d6d3c47.js:1 Failed to load resource: 404`
- `spor-okulu/icons/icon-32x32.png:1 Failed to load resource: 404`
- `spor-okulu/icons/icon-16x16.png:1 Failed to load resource: 404`

## Kesin Çözüm Adımları

### 1. Proje Temizliği (Zorunlu)
```bash
# Windows
rmdir /s /q out
rmdir /s /q .next
del package-lock.json
npm cache clean --force

# Linux/Mac
rm -rf out .next package-lock.json
npm cache clean --force
```

### 2. Bağımlılıkları Yeniden Yükle
```bash
npm install
```

### 3. WordPress Konfigürasyonu ile Build
```bash
# WordPress konfigürasyonunu aktif et
copy next.config.wordpress.mjs next.config.mjs

# Build işlemi
npm run build
```

### 4. Güncellenmiş Out Klasörü Scripti Çalıştır
```bash
# Yeni script ile tüm sorunları çöz
node create-out-folder.js
```

## Güncellenmiş Script Özellikleri

### Yeni Eklenen Özellikler:
1. **Eksik Icon Dosyaları Oluşturma**
   - `icon-16x16.png`
   - `icon-32x32.png`
   - `icon-152x152.png`
   - `icon-192x192.png`
   - `icon-384x384.png`
   - `icon-512x512.png`
   - `favicon.ico`

2. **Manifest.json Yol Düzeltme**
   - Icon yollarını `/spor-okulu/icons/` ile düzeltir
   - Favicon yolunu `/spor-okulu/favicon.ico` yapar

3. **HTML Asset Yol Düzeltme**
   - `/_next/` → `/spor-okulu/_next/`
   - Tüm relative yolları `/spor-okulu/` ile başlatır

### 5. Build Sonrası Kontrol Listesi

**Out klasöründe olması gerekenler:**
```
out/
├── index.html ✅
├── parent-signup.html ✅
├── login.html ✅
├── register.html ✅
├── dashboard.html ✅
├── .htaccess ✅
├── manifest.json ✅
├── favicon.ico ✅
├── icons/
│   ├── icon-16x16.png ✅
│   ├── icon-32x32.png ✅
│   ├── icon-152x152.png ✅
│   ├── icon-192x192.png ✅
│   ├── icon-384x384.png ✅
│   └── icon-512x512.png ✅
└── _next/
    ├── static/ ✅
    └── ... (diğer Next.js dosyaları)
```

### 6. Sunucuya Upload
1. **Mevcut dosyaları tamamen sil:**
   ```
   public_html/spor-okulu/ klasöründeki TÜM dosyaları sil
   ```

2. **Yeni dosyaları upload et:**
   ```
   out/ klasöründeki TÜM içeriği public_html/spor-okulu/ klasörüne kopyala
   ```

3. **Dosya izinlerini kontrol et:**
   - `.htaccess`: 644
   - HTML dosyaları: 644
   - PNG dosyaları: 644
   - Klasörler: 755

### 7. Cache Temizliği (Kritik)
1. **Sunucu Cache:**
   - Hosting panelinden cache temizle
   - CloudFlare varsa cache purge yap

2. **Tarayıcı Cache:**
   - `Ctrl+F5` ile hard refresh
   - Geliştirici araçlarında "Disable cache" aktif et
   - Tarayıcı geçmişini temizle

### 8. Test Adımları
1. **Ana sayfa:** `https://yourdomain.com/spor-okulu/`
2. **Parent signup:** `https://yourdomain.com/spor-okulu/parent-signup`
3. **Geliştirici araçları:** Console'da hata olmamalı
4. **Network sekmesi:** Tüm dosyalar 200 status ile yüklenmeli

## Sorun Giderme

### CSS/JS Dosyaları Hala 404 Alıyorsa:
1. `out/_next/static/` klasörünün var olduğunu kontrol edin
2. HTML dosyalarında `/_next/` yollarının `/spor-okulu/_next/` olarak değiştirildiğini kontrol edin
3. `create-out-folder.js` scriptini tekrar çalıştırın

### Icon Dosyaları 404 Alıyorsa:
1. `out/icons/` klasörünün oluşturulduğunu kontrol edin
2. Icon dosyalarının var olduğunu kontrol edin
3. `manifest.json` dosyasındaki yolları kontrol edin

### Tarayıcı Hala Eski Dosyaları Yüklüyorsa:
1. Tarayıcı cache'ini tamamen temizleyin
2. Gizli sekme (incognito) modunda test edin
3. Farklı tarayıcıda test edin

## Başarı Kontrol Listesi
- [ ] `npm run build` başarılı
- [ ] `node create-out-folder.js` başarılı
- [ ] `out` klasöründe tüm dosyalar mevcut
- [ ] Sunucuya upload tamamlandı
- [ ] Cache temizlendi
- [ ] Ana sayfa açılıyor
- [ ] Parent-signup sayfası açılıyor
- [ ] Console'da 404 hatası yok
- [ ] Tüm CSS/JS dosyaları yükleniyor
- [ ] Icon dosyaları yükleniyor

## Önemli Notlar
1. **Her deployment öncesi** `out` ve `.next` klasörlerini silin
2. **Her zaman** `create-out-folder.js` scriptini çalıştırın
3. **Mutlaka** cache temizliği yapın
4. **Test etmeden** production'a almayın

Bu adımları takip ettikten sonra tüm static asset 404 hataları çözülmüş olmalıdır.
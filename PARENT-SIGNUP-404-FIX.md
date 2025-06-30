# Parent-Signup 404 Hatası Çözümü

Bu rehber, parent-signup sayfasında yaşanan 404 hatasını çözmek için güncellenmiş adımları içerir.

## Sorun
- `parent-signup:1 Failed to load resource: the server responded with a status of 404` hatası
- Sayfa HTML dosyalarının doğru oluşturulmaması
- Static export konfigürasyonu ile uyumsuzluk

## Çözüm Adımları

### 1. Proje Temizliği
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
# WordPress konfigürasyonunu kopyala
copy next.config.wordpress.mjs next.config.mjs

# Build işlemi
npm run build
```

### 4. Out Klasörünü Düzenle
```bash
# Güncellenmiş script ile out klasörünü düzenle
node create-out-folder.js
```

### 5. Dosya Kontrolü
Build sonrası aşağıdaki dosyaların `out` klasöründe olduğunu kontrol edin:

**Gerekli HTML Dosyaları:**
- `index.html`
- `parent-signup.html` ⭐ (Ana sorun bu dosya)
- `login.html`
- `register.html`
- `dashboard.html`
- `coach-dashboard.html`
- `parent-dashboard.html`
- `athletes.html`
- `payments.html`
- `attendance.html`
- `reports.html`
- `settings.html`
- `forgot-password.html`

**Diğer Gerekli Dosyalar:**
- `.htaccess`
- `_next/` klasörü (static assets)
- `manifest.json`
- `favicon.ico`

### 6. Sunucuya Upload
1. **Mevcut dosyaları temizle:**
   - `public_html/spor-okulu/` klasöründeki tüm dosyaları sil

2. **Yeni dosyaları upload et:**
   - `out` klasöründeki tüm içeriği `public_html/spor-okulu/` klasörüne kopyala

3. **Dosya izinlerini kontrol et:**
   - `.htaccess` dosyası: 644
   - HTML dosyaları: 644
   - Klasörler: 755

### 7. Cache Temizliği
1. **Sunucu cache:**
   - Hosting panelinden cache temizle
   - CloudFlare kullanıyorsanız cache purge yapın

2. **Tarayıcı cache:**
   - Ctrl+F5 ile hard refresh
   - Geliştirici araçlarında "Disable cache" aktif edin

### 8. Test
1. Ana sayfa: `https://yourdomain.com/spor-okulu/`
2. Parent signup: `https://yourdomain.com/spor-okulu/parent-signup`
3. Login: `https://yourdomain.com/spor-okulu/login`

## Güncellemeler

### create-out-folder.js Değişiklikleri
- Next.js export konfigürasyonu ile uyumlu hale getirildi
- Mevcut HTML dosyalarının asset yollarını düzeltme
- Tüm sayfa HTML dosyalarını otomatik oluşturma
- .htaccess dosyasını otomatik kopyalama

### .htaccess Değişiklikleri
- Tüm sayfa rotaları eklendi
- parent-signup dahil olmak üzere tüm sayfalar için routing kuralları

## Sorun Giderme

### Parent-signup.html Dosyası Yoksa
```bash
# Manuel olarak oluştur
cd out
copy index.html parent-signup.html
```

### Asset 404 Hataları Devam Ediyorsa
1. `out` klasöründeki HTML dosyalarını kontrol edin
2. `/_next/` yollarının `/spor-okulu/_next/` olarak değiştirildiğinden emin olun
3. `create-out-folder.js` scriptini tekrar çalıştırın

### Routing Hataları
1. `.htaccess` dosyasının sunucuda olduğunu kontrol edin
2. Apache mod_rewrite modülünün aktif olduğunu kontrol edin
3. Hosting sağlayıcınızdan .htaccess desteğini kontrol edin

## Başarı Kontrol Listesi
- [ ] `out` klasörü oluşturuldu
- [ ] `parent-signup.html` dosyası mevcut
- [ ] `.htaccess` dosyası kopyalandı
- [ ] Sunucuya upload tamamlandı
- [ ] Cache temizlendi
- [ ] Parent-signup sayfası açılıyor
- [ ] Diğer sayfalar çalışıyor

Bu adımları takip ettikten sonra parent-signup 404 hatası çözülmüş olmalıdır.
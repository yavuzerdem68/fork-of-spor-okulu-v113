# Routing 404 Hatası - Kesin Çözüm

Bu dosya, "Giriş Yap" ve "Kayıt Ol" butonlarının 404 hatası vermesi sorununu kesin olarak çözmek için gerekli adımları içerir.

## Sorunun Nedeni

Next.js static export'ta, tüm sayfalar için HTML dosyalarının oluşturulması gerekiyor. Sadece `index.html` oluşturulduğu için diğer sayfalar 404 hatası veriyor.

## Yapılan Değişiklikler

### 1. `create-out-folder.js` Güncellemesi
- `createMissingPages()` fonksiyonu eklendi
- Tüm sayfa rotaları için HTML dosyaları otomatik oluşturuluyor
- Her sayfa için `index.html` içeriği kopyalanıyor (SPA routing için)

### 2. `.htaccess` Güncellemesi
- Belirli sayfalar için özel rewrite kuralları eklendi
- `/login`, `/parent-signup`, `/register` vb. sayfalar doğru HTML dosyalarına yönlendiriliyor

### 3. `index.tsx` Güncellemesi
- `window.location.href` yerine Next.js `Link` bileşeni kullanılıyor
- Daha hızlı ve SEO dostu navigasyon

## Oluşturulan Sayfalar

Aşağıdaki sayfalar için HTML dosyaları otomatik oluşturuluyor:

- `login.html`
- `parent-signup.html`
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

## Güncellenmiş Deployment Adımları

### Adım 1: Temiz Build
```bash
# Eski build dosyalarını temizle
rmdir /s /q .next
rmdir /s /q out

# WordPress için build yap
npm run build:wordpress
```

### Adım 2: Out Klasörü Oluştur (Yeni Özelliklerle)
```bash
# Out klasörünü oluştur, asset yollarını düzelt ve tüm sayfalar için HTML oluştur
node create-out-folder.js
```

### Adım 3: .htaccess Kopyala
```bash
# Güncellenmiş .htaccess dosyasını out klasörüne kopyala
copy .htaccess out\
```

### Adım 4: Sunucuya Upload
1. **ÖNEMLİ**: Sunucudaki `public_html/spor-okulu/` klasöründeki TÜM dosyaları sil
2. `out` klasöründeki TÜM içeriği `public_html/spor-okulu/` klasörüne yükle
3. `.htaccess` dosyasının da yüklendiğinden emin ol

## Kontrol Listesi

- [ ] `.next` ve `out` klasörleri temizlendi
- [ ] `npm run build:wordpress` çalıştırıldı
- [ ] `node create-out-folder.js` çalıştırıldı (yeni özelliklerle)
- [ ] Console'da tüm HTML sayfalarının oluşturulduğu görüldü
- [ ] `.htaccess` dosyası `out` klasörüne kopyalandı
- [ ] Sunucudaki eski dosyalar tamamen silindi
- [ ] `out` klasörünün tüm içeriği sunucuya yüklendi
- [ ] Site `https://g7spor.org/spor-okulu/` adresinden açılıyor
- [ ] "Giriş Yap" butonu çalışıyor
- [ ] "Kayıt Ol" butonu çalışıyor

## Test Edilecek Sayfalar

Deployment sonrası şu sayfaları test edin:
1. `https://g7spor.org/spor-okulu/` - Ana sayfa
2. `https://g7spor.org/spor-okulu/login` - Giriş sayfası
3. `https://g7spor.org/spor-okulu/parent-signup` - Kayıt sayfası
4. `https://g7spor.org/spor-okulu/register` - Sporcu kayıt sayfası

## Sorun Giderme

Eğer hala 404 hatası alıyorsanız:

1. **Sunucudaki dosyaları kontrol edin**:
   - `public_html/spor-okulu/login.html` dosyası var mı?
   - `public_html/spor-okulu/parent-signup.html` dosyası var mı?
   - `public_html/spor-okulu/.htaccess` dosyası güncellenmiş mi?

2. **Browser cache'ini temizleyin** (Ctrl+Shift+R)

3. **Console çıktısını kontrol edin**:
   - `node create-out-folder.js` çalıştırıldığında tüm HTML dosyaları oluşturuldu mu?

Bu adımları takip ettikten sonra tüm routing sorunları çözülmüş olacaktır.
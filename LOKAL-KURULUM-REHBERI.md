# Spor Okulu CRM - Lokal Kurulum Rehberi

Bu rehber, Spor Okulu CRM uygulamasını masaüstünüzde lokal olarak çalıştırmanız için gerekli tüm adımları içermektedir.

## Sistem Gereksinimleri

- **Node.js**: 20.x veya üzeri
- **npm** veya **pnpm** (önerilen)
- **Git**
- **Metin editörü** (VS Code önerilir)

## 1. Gerekli Yazılımları Yükleme

### Node.js Kurulumu
1. [Node.js resmi sitesinden](https://nodejs.org/) Node.js 20.x LTS sürümünü indirin
2. İndirdiğiniz dosyayı çalıştırarak kurulumu tamamlayın
3. Terminal/Command Prompt açarak şu komutla kontrol edin:
   ```bash
   node --version
   npm --version
   ```

### PNPM Kurulumu (Önerilen)
```bash
npm install -g pnpm
```

### Git Kurulumu
1. [Git resmi sitesinden](https://git-scm.com/) Git'i indirin ve kurun
2. Kurulumu kontrol edin:
   ```bash
   git --version
   ```

## 2. Projeyi İndirme

### Seçenek A: Git ile klonlama (önerilen)
```bash
git clone [PROJE_URL]
cd next-pages-chakra
```

### Seçenek B: ZIP dosyası olarak indirme
1. Projeyi ZIP olarak indirin
2. Dosyayı masaüstünüze çıkarın
3. Terminal ile proje klasörüne gidin

## 3. Bağımlılıkları Yükleme

Proje klasöründe terminal açarak:

### PNPM ile (önerilen):
```bash
pnpm install
```

### NPM ile:
```bash
npm install
```

## 4. Çevre Değişkenlerini Ayarlama

Proje kök dizininde `.env.local` dosyası oluşturun:

```bash
# .env.local dosyası
NEXT_PUBLIC_WORDPRESS_URL=http://localhost/wordpress
NEXT_PUBLIC_CO_DEV_ENV=local

# E-posta ayarları (isteğe bağlı)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com

# GitHub entegrasyonu (isteğe bağlı)
GITHUB_TOKEN=your-github-token
GITHUB_OWNER=your-username
GITHUB_REPO=your-repo-name
```

## 5. Uygulamayı Çalıştırma

### Geliştirme Modu (Development)

#### Windows'ta:
```bash
pnpm run dev:local
# veya
npm run dev:local
```

#### Mac/Linux'ta:
```bash
pnpm run dev:local-unix
# veya
npm run dev:local-unix
```

### Uygulama Erişimi
Tarayıcınızda şu adrese gidin:
```
http://localhost:3000
```

## 6. WordPress Entegrasyonu (İsteğe Bağlı)

Eğer WordPress ile entegrasyon kullanmak istiyorsanız:

### Lokal WordPress Kurulumu
1. **XAMPP** veya **WAMP** kurun
2. WordPress'i `htdocs/wordpress` klasörüne kurun
3. WordPress admin panelinden gerekli eklentileri yükleyin:
   - JWT Authentication for WP REST API

### WordPress Ayarları
`wp-config.php` dosyasına ekleyin:
```php
define('JWT_AUTH_SECRET_KEY', 'your-secret-key-here');
define('JWT_AUTH_CORS_ENABLE', true);
```

`.htaccess` dosyasına ekleyin:
```apache
RewriteEngine On
RewriteCond %{HTTP:Authorization} ^(.*)
RewriteRule .* - [e=HTTP_AUTHORIZATION:%1]
```

## 7. Üretim Derlemesi (Production Build)

### Lokal üretim derlemesi:
```bash
# Windows
pnpm run build:local
pnpm run start:local

# Mac/Linux
pnpm run build:local-unix
pnpm run start:local-unix
```

## 8. Yaygın Sorunlar ve Çözümleri

### Port 3000 kullanımda hatası
```bash
# Farklı port kullanmak için
pnpm run dev:local -- -p 3001
```

### Node.js sürüm uyumsuzluğu
```bash
# Node.js sürümünü kontrol edin
node --version
# 20.x sürümünü yükleyin
```

### Bağımlılık yükleme hataları
```bash
# Cache temizleme
pnpm store prune
# veya
npm cache clean --force

# Tekrar yükleme
pnpm install
```

### TypeScript hataları
```bash
# Type kontrolü
pnpm run type-check
```

## 9. Geliştirme Araçları

### VS Code Eklentileri (Önerilen)
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- TypeScript Importer
- Prettier - Code formatter
- Auto Rename Tag

### Faydalı Komutlar
```bash
# Linting
pnpm run lint

# Test çalıştırma
pnpm run test

# Type kontrolü
pnpm run type-check

# Temizlik
pnpm run clean
```

## 10. Proje Yapısı

```
next-pages-chakra/
├── src/
│   ├── components/     # React bileşenleri
│   ├── pages/         # Next.js sayfaları
│   ├── lib/           # Yardımcı kütüphaneler
│   ├── hooks/         # Custom React hooks
│   ├── styles/        # CSS dosyaları
│   └── types/         # TypeScript tip tanımları
├── public/            # Statik dosyalar
├── data/             # Lokal veri dosyaları
└── next.config.local.mjs  # Lokal konfigürasyon
```

## 11. Veri Yönetimi

Uygulama varsayılan olarak lokal dosya sistemini kullanır:
- Sporcu verileri: `data/athletes/` klasöründe
- Tanı verileri: `data/diagnostic/` klasöründe

## 12. Destek ve Yardım

### Logları Kontrol Etme
- Tarayıcı geliştirici araçları (F12)
- Terminal çıktıları
- Network sekmesi (API çağrıları için)

### Yaygın Hata Mesajları
- **404 Not Found**: Sayfa yolu kontrolü
- **500 Internal Server Error**: Server logları kontrolü
- **CORS Error**: WordPress CORS ayarları

## Başarılı Kurulum Kontrolü

Uygulama başarıyla çalışıyorsa:
1. Ana sayfa yüklenir
2. Giriş sayfası çalışır
3. Dashboard'a erişim sağlanır
4. Sporcu ekleme/düzenleme işlemleri çalışır

---

**Not**: Bu rehber lokal geliştirme ortamı içindir. Üretim ortamına deploy için ayrı rehberler mevcuttur.
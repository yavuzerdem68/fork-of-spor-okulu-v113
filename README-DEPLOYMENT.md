# SportsCRM - Deployment Rehberi

Bu rehber, SportsCRM projesini kendi web sitenizde yayınlamanız için hazırlanmıştır.

## 🚀 Hızlı Başlangıç

### Gereksinimler
- Node.js 20.x veya üzeri
- npm veya pnpm paket yöneticisi

### Kurulum
```bash
# 1. Bağımlılıkları yükleyin
npm install

# 2. Geliştirme sunucusunu başlatın
npm run dev

# 3. Tarayıcınızda http://localhost:3000 adresini açın
```

## 📦 Production Build

```bash
# Production build oluşturun
npm run build

# Production sunucusunu başlatın
npm start
```

## 🌐 Deployment Seçenekleri

### 1. Vercel (Önerilen)
1. GitHub'a projeyi yükleyin
2. [vercel.com](https://vercel.com) adresine gidin
3. "New Project" → GitHub repository'nizi seçin
4. Deploy butonuna tıklayın
5. Otomatik deploy olacak

### 2. Netlify
1. GitHub'a projeyi yükleyin
2. [netlify.com](https://netlify.com) adresine gidin
3. "New site from Git" seçin
4. Build ayarları:
   - Build command: `npm run build`
   - Publish directory: `.next`

### 3. Kendi Sunucunuz
```bash
# Sunucunuzda Node.js 20.x yükleyin
# Proje dosyalarını sunucuya yükleyin
npm install
npm run build
npm start
```

### 4. Static Export (WordPress için)
```bash
# next.config.mjs dosyasına ekleyin:
# output: 'export'

npm run build
# out/ klasörü oluşacak, bu dosyaları web sitenize yükleyin
```

## ⚙️ Önemli Notlar

### Çevre Değişkenleri
Eğer WhatsApp entegrasyonu veya diğer API'ları kullanacaksanız:

1. `.env.local` dosyası oluşturun:
```env
NEXT_PUBLIC_WHATSAPP_API_KEY=your_api_key_here
NEXT_PUBLIC_STRIPE_KEY=your_stripe_key_here
```

### Domain Ayarları
`next.config.mjs` dosyasında `images.domains` kısmını kendi domain'inize göre güncelleyin.

### Database
Bu proje şu anda frontend-only çalışıyor. Backend entegrasyonu için:
- Supabase
- Firebase
- MongoDB Atlas
- PostgreSQL
gibi seçenekleri kullanabilirsiniz.

## 🔧 Özelleştirme

### Logo Değiştirme
`public/` klasörüne kendi logonuzu ekleyin ve `src/components/Logo.tsx` dosyasını güncelleyin.

### Renk Teması
`src/styles/globals.css` dosyasındaki CSS değişkenlerini düzenleyin.

### Spor Branşları
`src/pages/register.tsx` dosyasındaki `sports` array'ini kendi branşlarınıza göre güncelleyin.

## 📞 Destek

Herhangi bir sorun yaşarsanız:
1. GitHub Issues bölümünü kontrol edin
2. Dokümantasyonu inceleyin
3. Community forumlarından yardım alın

## 📄 Lisans

Bu proje MIT lisansı altında dağıtılmaktadır.
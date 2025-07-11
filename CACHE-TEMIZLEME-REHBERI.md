# Next.js Cache Temizleme Rehberi

Bu rehber, "API Routes cannot be used with output: export" hatasını çözmek için hazırlanmıştır.

## 🚨 Sorun

Next.js bazen eski konfigürasyon dosyalarını cache'ler ve yeni ayarları okumaz. Bu durumda API route hatası alırsınız.

## ✅ Çözüm Adımları

### 1. Next.js Cache'ini Temizle
```bash
# .next klasörünü sil
rmdir /s .next
# veya Linux/Mac için
rm -rf .next

# node_modules/.cache klasörünü sil (varsa)
rmdir /s node_modules\.cache
# veya Linux/Mac için
rm -rf node_modules/.cache
```

### 2. Bağımlılıkları Yeniden Yükle
```bash
# node_modules'ü sil
rmdir /s node_modules
# veya Linux/Mac için
rm -rf node_modules

# Package lock dosyasını sil
del package-lock.json
del pnpm-lock.yaml
# veya Linux/Mac için
rm -f package-lock.json pnpm-lock.yaml

# Bağımlılıkları yeniden yükle
npm install
# veya
pnpm install
```

### 3. Temiz Başlatma
```bash
# Uygulamayı başlat
npm run dev:local
# veya
pnpm run dev:local
```

## 🔧 Hızlı Temizleme Scripti

### Windows için (clean-cache.bat)
```batch
@echo off
echo Cache temizleniyor...
if exist .next rmdir /s /q .next
if exist node_modules\.cache rmdir /s /q node_modules\.cache
echo Cache temizlendi!
echo Simdi npm run dev:local calistirin
pause
```

### Mac/Linux için (clean-cache.sh)
```bash
#!/bin/bash
echo "Cache temizleniyor..."
rm -rf .next
rm -rf node_modules/.cache
echo "Cache temizlendi!"
echo "Şimdi npm run dev:local çalıştırın"
```

## 🚀 Tam Temizleme (Sorun Devam Ederse)

```bash
# 1. Tüm cache'leri temizle
rm -rf .next
rm -rf node_modules
rm -f package-lock.json
rm -f pnpm-lock.yaml

# 2. NPM cache'ini temizle
npm cache clean --force

# 3. Bağımlılıkları yeniden yükle
npm install

# 4. Uygulamayı başlat
npm run dev:local
```

## 📋 Kontrol Listesi

- [ ] `.next` klasörü silindi
- [ ] `node_modules/.cache` silindi (varsa)
- [ ] `next.config.local.mjs` dosyasında `output: 'export'` yorum satırı
- [ ] Uygulama `npm run dev:local` ile başlatıldı
- [ ] Tarayıcıda `http://localhost:3000` açıldı

## ❓ Hala Sorun Var mı?

### Konfigürasyon Kontrolü
```bash
# Hangi config dosyasının kullanıldığını kontrol et
echo $NEXT_CONFIG_FILE
# veya Windows'ta
echo %NEXT_CONFIG_FILE%
```

### Alternatif Başlatma
```bash
# Direkt config dosyası belirterek başlat
NEXT_CONFIG_FILE=next.config.local.mjs npm run dev
# veya Windows'ta
set NEXT_CONFIG_FILE=next.config.local.mjs && npm run dev
```

### Port Değiştirme
```bash
# Farklı port kullan
npm run dev:local -- -p 3001
```

## 🔍 Debug Modu

```bash
# Debug modunda başlat
DEBUG=* npm run dev:local
```

---

**Not**: Bu adımlar %99 oranında sorunu çözer. Sorun devam ederse proje klasörünü tamamen yeniden indirin.
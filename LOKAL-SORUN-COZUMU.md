# 🔧 Lokal Çalışma Sorunu Çözümü

## 🚨 Sorun: Proje Lokal Olarak Çalışmıyor

### ⚡ Hızlı Çözüm (Önerilen)

**PowerShell Kullanıcıları:**
```powershell
.\lokal-fix.ps1
```

**Windows Batch Kullanıcıları:**
```cmd
lokal-fix.bat
```

Bu scriptler tüm yaygın sorunları otomatik olarak çözer.

---

## 🔍 Manuel Sorun Tespiti

### 1. Sistem Gereksinimleri Kontrolü

```bash
# Node.js versiyonu (20.x olmalı)
node --version

# npm versiyonu
npm --version
```

**Sorun:** Node.js kurulu değil veya eski versiyon
**Çözüm:** https://nodejs.org adresinden Node.js 20.x indirin

### 2. Proje Dosyaları Kontrolü

```bash
# Test scripti çalıştırın
node lokal-test.js
```

**Eksik dosyalar varsa:**
- `package.json` - Proje bağımlılıkları
- `next.config.mjs` - Next.js konfigürasyonu
- `src/pages/index.tsx` - Ana sayfa
- `tsconfig.json` - TypeScript konfigürasyonu

### 3. Cache Sorunları

```bash
# Cache temizleme
npm run clean
npm cache clean --force

# Klasörleri manuel sil
rmdir /s .next
rmdir /s out
rmdir /s node_modules
```

### 4. Bağımlılık Sorunları

```bash
# Temiz kurulum
npm install

# Sorun devam ederse
npm ci
```

---

## 🛠️ Adım Adım Manuel Çözüm

### Adım 1: Temizlik
```bash
# Eski build dosyalarını sil
rmdir /s /q .next
rmdir /s /q out
rmdir /s /q node_modules

# Lock dosyalarını sil
del package-lock.json
del pnpm-lock.yaml
del yarn.lock
```

### Adım 2: Cache Temizleme
```bash
npm cache clean --force
```

### Adım 3: Yeniden Kurulum
```bash
npm install
```

### Adım 4: Ortam Dosyası
```bash
# .env.local oluştur
copy .env.local.example .env.local
```

### Adım 5: Test
```bash
npm run dev
```

---

## 🚨 Yaygın Hatalar ve Çözümleri

### Hata 1: "Module not found"
**Sebep:** node_modules eksik veya bozuk
**Çözüm:**
```bash
rmdir /s /q node_modules
npm install
```

### Hata 2: "Port 3000 is already in use"
**Sebep:** Başka bir process portu kullanıyor
**Çözüm:**
```bash
# Windows
taskkill /f /im node.exe

# Veya farklı port kullan
npm run dev -- -p 3001
```

### Hata 3: "Cannot resolve module"
**Sebep:** TypeScript path mapping sorunu
**Çözüm:**
```bash
npx tsc --noEmit --skipLibCheck
```

### Hata 4: "Permission denied"
**Sebep:** Dosya izinleri sorunu
**Çözüm:**
- PowerShell'i yönetici olarak çalıştırın
- Antivirus yazılımını geçici olarak devre dışı bırakın

### Hata 5: "ENOENT: no such file or directory"
**Sebep:** Eksik dosya veya klasör
**Çözüm:**
```bash
# Proje bütünlüğünü kontrol et
node lokal-test.js
```

---

## 🎯 Giriş Bilgileri

Proje çalıştıktan sonra http://localhost:3000 adresinde:

**Yönetici Girişi:**
- Email: `yavuz@g7spor.org`
- Şifre: `444125yA/`

**Test Antrenör:**
- Email: `coach@sportscr.com`
- Şifre: `coach123`

**Test Veli:**
- Email: `parent@sportscr.com`
- Şifre: `parent123`

---

## 🔧 Gelişmiş Sorun Giderme

### TypeScript Sorunları
```bash
# TypeScript cache temizle
npx tsc --build --clean

# Type check
npx tsc --noEmit
```

### Next.js Sorunları
```bash
# Next.js cache temizle
npx next build --debug

# Development mode debug
npm run dev -- --turbo
```

### Dependency Sorunları
```bash
# Dependency tree kontrol
npm ls

# Audit ve fix
npm audit fix
```

---

## 📞 Hala Çalışmıyor mu?

### Son Çare Çözümler:

1. **Bilgisayarı yeniden başlatın**
2. **Antivirus yazılımını kontrol edin**
3. **Windows Defender'ı geçici devre dışı bırakın**
4. **Farklı bir klasörde test edin**
5. **Node.js'i tamamen kaldırıp yeniden kurun**

### Sistem Temizliği:
```bash
# npm global cache temizle
npm cache clean --force

# Windows temp temizle
%temp% klasörünü temizleyin

# Node.js yeniden kur
# 1. Node.js'i kaldır
# 2. %APPDATA%\npm klasörünü sil
# 3. Node.js 20.x yeniden kur
```

---

## ✅ Başarı Kontrol Listesi

- [ ] Node.js 20.x kurulu
- [ ] npm çalışıyor
- [ ] Proje dosyaları mevcut
- [ ] node_modules kurulu
- [ ] .env.local mevcut
- [ ] npm run dev çalışıyor
- [ ] http://localhost:3000 açılıyor
- [ ] Giriş yapılabiliyor

**Tüm adımlar tamamlandıysa proje çalışır durumda! 🎉**
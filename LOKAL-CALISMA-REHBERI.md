# 🚀 Lokal Çalışma Rehberi

## 📋 Mevcut Scriptler

### ⚡ Hızlı Başlatma (Sorun Yoksa)
```powershell
# PowerShell
.\hizli-baslat.ps1

# Windows Batch
hizli-baslat.bat
```

### 🔧 Sorun Giderme (Sorun Varsa)
```powershell
# PowerShell
.\lokal-fix.ps1

# Windows Batch
lokal-fix.bat
```

### 🔍 Sistem Testi
```bash
node lokal-test.js
```

---

## 🎯 Hangi Scripti Kullanmalıyım?

### ✅ İlk Kez Çalıştırıyorsanız:
```powershell
.\lokal-fix.ps1
```
Bu script tüm sorunları çözer ve projeyi hazırlar.

### ✅ Proje Daha Önce Çalışıyorsa:
```powershell
.\hizli-baslat.ps1
```
Bu script hızlıca başlatır.

### ✅ Sorun Yaşıyorsanız:
```powershell
.\lokal-fix.ps1
```
Bu script tüm yaygın sorunları çözer.

---

## 🔧 Script İşlevleri

### `lokal-fix.ps1` / `lokal-fix.bat`
- ✅ Node.js versiyonu kontrol eder
- ✅ Proje dosyalarını kontrol eder
- ✅ Cache'i temizler (.next, out)
- ✅ node_modules'ü yeniden kurar
- ✅ .env.local oluşturur
- ✅ TypeScript kontrol eder
- ✅ Test çalıştırması yapar

### `hizli-baslat.ps1` / `hizli-baslat.bat`
- ✅ Temel kontroller yapar
- ✅ Eksik bağımlılıkları kurar
- ✅ .env.local oluşturur
- ✅ Eski cache'i temizler
- ✅ Geliştirme sunucusunu başlatır

### `lokal-test.js`
- ✅ Sistem gereksinimlerini kontrol eder
- ✅ Proje dosyalarını listeler
- ✅ Sorunları tespit eder
- ✅ Çözüm önerileri sunar

---

## 🚨 Yaygın Sorunlar ve Çözümler

### Sorun 1: "Node.js kurulu değil"
**Çözüm:**
1. https://nodejs.org adresine gidin
2. Node.js 20.x LTS versiyonunu indirin
3. Kurulumu tamamlayın
4. Terminal'i yeniden açın

### Sorun 2: "npm install başarısız"
**Çözüm:**
```powershell
.\lokal-fix.ps1
```

### Sorun 3: "Port 3000 kullanımda"
**Çözüm:**
```bash
# Windows
taskkill /f /im node.exe

# Farklı port kullan
npm run dev -- -p 3001
```

### Sorun 4: "Module not found"
**Çözüm:**
```powershell
.\lokal-fix.ps1
```

### Sorun 5: "Permission denied"
**Çözüm:**
- PowerShell'i yönetici olarak çalıştırın
- Antivirus yazılımını kontrol edin

---

## 📁 Proje Yapısı Kontrolü

### Gerekli Dosyalar:
- ✅ `package.json` - Proje bağımlılıkları
- ✅ `next.config.mjs` - Next.js konfigürasyonu
- ✅ `tsconfig.json` - TypeScript konfigürasyonu
- ✅ `tailwind.config.js` - Tailwind CSS konfigürasyonu
- ✅ `postcss.config.js` - PostCSS konfigürasyonu
- ✅ `src/pages/index.tsx` - Ana sayfa
- ✅ `.env.local` - Ortam değişkenleri

### Gerekli Klasörler:
- ✅ `src/` - Kaynak kod
- ✅ `src/pages/` - Sayfa bileşenleri
- ✅ `src/components/` - UI bileşenleri
- ✅ `src/lib/` - Yardımcı kütüphaneler
- ✅ `public/` - Statik dosyalar
- ✅ `node_modules/` - Bağımlılıklar

---

## 🎯 Giriş Bilgileri

Proje çalıştıktan sonra http://localhost:3000 adresinde:

### Yönetici Girişi:
- **Email:** `yavuz@g7spor.org`
- **Şifre:** `444125yA/`

### Test Hesapları:
- **Antrenör:** `coach@sportscr.com` / `coach123`
- **Veli:** `parent@sportscr.com` / `parent123`

---

## 🔄 Günlük Kullanım

### Her Gün Çalışmaya Başlarken:
```powershell
.\hizli-baslat.ps1
```

### Sorun Yaşadığınızda:
```powershell
.\lokal-fix.ps1
```

### Proje Güncellemesi Sonrası:
```powershell
.\lokal-fix.ps1
```

---

## 📞 Destek

### Hala Çalışmıyor mu?

1. **Bilgisayarı yeniden başlatın**
2. **Antivirus yazılımını kontrol edin**
3. **Windows Defender'ı geçici devre dışı bırakın**
4. **Node.js'i yeniden kurun**
5. **Farklı bir klasörde test edin**

### Sistem Temizliği:
```bash
# npm global cache
npm cache clean --force

# Windows temp klasörü
%temp% klasörünü temizleyin

# Node.js tamamen yeniden kur
```

---

## ✅ Başarı Kontrol Listesi

- [ ] Node.js 20.x kurulu
- [ ] npm çalışıyor
- [ ] Proje dosyaları mevcut
- [ ] `.\lokal-fix.ps1` başarılı
- [ ] `npm run dev` çalışıyor
- [ ] http://localhost:3000 açılıyor
- [ ] Giriş yapılabiliyor
- [ ] Dashboard görünüyor

**Tüm adımlar ✅ ise proje hazır! 🎉**

---

## 🚀 Sonraki Adımlar

Proje çalıştıktan sonra:

1. **GitHub'a yüklemek için:** `HIZLI-GITHUB-YENILEME.md`
2. **Temiz proje oluşturmak için:** `TEMIZ-PROJE-KULLANIM.md`
3. **WordPress deployment için:** `build-wordpress.ps1`

**Artık lokal olarak çalışan bir projeniz var! 🎉**
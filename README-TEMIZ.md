# Spor Okulu CRM Sistemi

Modern, kullanıcı dostu spor okulu yönetim sistemi. Next.js tabanlı, yerel depolama kullanan ve hem masaüstü hem de WordPress entegrasyonu destekleyen hibrit çözüm.

## 🚀 Hızlı Başlangıç

### Gereksinimler
- Node.js 20.x
- npm veya yarn

### Kurulum

1. **Projeyi indirin**
   ```bash
   git clone [YENİ-REPO-URL]
   cd spor-okulu-temiz
   ```

2. **Bağımlılıkları yükleyin**
   ```bash
   npm install
   ```

3. **Ortam dosyasını oluşturun**
   ```bash
   # Windows
   copy .env.local.example .env.local
   
   # Linux/Mac
   cp .env.local.example .env.local
   ```

4. **Geliştirme sunucusunu başlatın**
   ```bash
   npm run dev
   ```

5. **Tarayıcıda açın**: http://localhost:3000

## 📦 Deployment Seçenekleri

### Yerel Kullanım (Önerilen)
```bash
# Windows
build-local.bat

# PowerShell
.\build-local.ps1
```

### WordPress Entegrasyonu
```bash
# Windows
build-wordpress.bat

# PowerShell
.\build-wordpress.ps1
```

## 🔧 PowerShell Sorunları

PowerShell execution policy hatası alırsanız:

```powershell
# Geçici çözüm
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Veya doğrudan çalıştırın
powershell -ExecutionPolicy Bypass -File .\build-local.ps1
```

Detaylı bilgi için: `POWERSHELL-KULLANIM-REHBERI.md`

## 📋 Özellikler

- **Sporcu Yönetimi**: Kayıt, güncelleme, takip
- **Ödeme Sistemi**: Aidat takibi, banka dekont işleme
- **Antrenman Yönetimi**: Yoklama, program planlama
- **Veli Paneli**: Çocukların durumunu takip
- **Raporlama**: Detaylı analiz ve raporlar
- **Offline Çalışma**: İnternet bağlantısı olmadan kullanım

## 🔐 Giriş Bilgileri

**Yönetici:**
- Kullanıcı: admin
- Şifre: admin123

**Veli Girişi:**
- TC Kimlik No ile giriş

## 📁 Proje Yapısı

```
├── src/
│   ├── components/     # UI bileşenleri
│   ├── pages/         # Sayfa bileşenleri
│   ├── lib/           # Yardımcı kütüphaneler
│   ├── services/      # Veri servisleri
│   └── styles/        # CSS dosyaları
├── public/            # Statik dosyalar
├── build-local.*      # Yerel build scriptleri
├── build-wordpress.*  # WordPress build scriptleri
└── package.json       # Proje bağımlılıkları
```

## 🛠️ Geliştirme

```bash
# Geliştirme sunucusu
npm run dev

# Build (yerel)
npm run build

# Build (WordPress)
npm run build:wordpress

# Linting
npm run lint

# Temizlik
npm run clean
```

## 📞 Destek

Sorun yaşarsanız:
1. `POWERSHELL-KULLANIM-REHBERI.md` dosyasını kontrol edin
2. Node.js versiyonunuzun 20.x olduğundan emin olun
3. `npm run clean` ile temizlik yapın
4. Bağımlılıkları yeniden yükleyin: `npm install`

## 📄 Lisans

Bu proje özel kullanım içindir.
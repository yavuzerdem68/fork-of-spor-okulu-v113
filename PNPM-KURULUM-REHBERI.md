# PNPM Kurulum ve Sorun Giderme Rehberi

Bu rehber, `pnpm is not recognized` hatası alan kullanıcılar için hazırlanmıştır.

## Hızlı Çözüm

### Otomatik Çözüm (Önerilen)
1. Güncellenmiş `start-local.bat` dosyasını çalıştırın
2. Script otomatik olarak pnpm'i yükleyecek
3. Eğer pnpm yüklenemezse, otomatik olarak npm kullanacak

### Manuel Çözüm

#### Seçenek 1: PNPM Yükle
```bash
# PNPM'i global olarak yükle
npm install -g pnpm

# Kurulumu kontrol et
pnpm --version

# Projeyi çalıştır
pnpm install
pnpm run dev:local
```

#### Seçenek 2: NPM Kullan
```bash
# NPM ile bağımlılıkları yükle
npm install

# NPM ile projeyi çalıştır
npm run dev:local
```

## PNPM Nedir?

PNPM (Performant NPM), NPM'e alternatif bir paket yöneticisidir:
- **Daha hızlı**: Paketleri daha hızlı yükler
- **Daha az yer kaplar**: Disk alanından tasarruf sağlar
- **Daha güvenli**: Bağımlılık çakışmalarını önler

## Kurulum Yöntemleri

### Windows
```bash
# NPM ile
npm install -g pnpm

# Chocolatey ile
choco install pnpm

# Scoop ile
scoop install pnpm
```

### Mac
```bash
# NPM ile
npm install -g pnpm

# Homebrew ile
brew install pnpm
```

### Linux
```bash
# NPM ile
npm install -g pnpm

# Curl ile
curl -fsSL https://get.pnpm.io/install.sh | sh -
```

## Sorun Giderme

### "pnpm is not recognized" Hatası
1. **Çözüm 1**: Otomatik script kullanın (`start-local.bat`)
2. **Çözüm 2**: `npm install -g pnpm` komutu çalıştırın
3. **Çözüm 3**: NPM kullanın (`npm install` ve `npm run dev:local`)

### Yetki Hatası (Permission Error)
```bash
# Windows (Yönetici olarak çalıştır)
npm install -g pnpm

# Mac/Linux
sudo npm install -g pnpm
```

### PATH Sorunu
Eğer pnpm yüklendikten sonra hala tanınmıyorsa:
1. Terminal/Command Prompt'u kapatıp tekrar açın
2. Sistem PATH değişkenini kontrol edin
3. Node.js'i yeniden yükleyin

## Alternatif Komutlar

Eğer pnpm çalışmıyorsa, tüm komutları npm ile değiştirebilirsiniz:

| PNPM Komutu | NPM Karşılığı |
|-------------|---------------|
| `pnpm install` | `npm install` |
| `pnpm run dev:local` | `npm run dev:local` |
| `pnpm run build:local` | `npm run build:local` |
| `pnpm add paket-adi` | `npm install paket-adi` |

## Öneriler

1. **İlk kurulumda**: Otomatik scriptleri kullanın
2. **Sorun yaşıyorsanız**: NPM'e geçin, aynı işlevi görür
3. **Gelecekte**: PNPM öğrenmeye değer, daha performanslı

---

**Not**: Bu proje hem pnpm hem de npm ile çalışacak şekilde yapılandırılmıştır. Hangisini kullandığınız önemli değil.
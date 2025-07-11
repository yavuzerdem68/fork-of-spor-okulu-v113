# Hızlı Başlatma Rehberi

Bu rehber, uygulamayı en hızlı şekilde çalıştırmanız için hazırlanmıştır.

## Otomatik Başlatma (Önerilen)

### Windows Kullanıcıları
1. `start-local.bat` dosyasına çift tıklayın
2. Script otomatik olarak:
   - Node.js kontrolü yapar
   - Bağımlılıkları yükler
   - .env.local dosyasını oluşturur
   - Uygulamayı başlatır

### Mac/Linux Kullanıcıları
1. Terminal açın
2. Proje klasörüne gidin
3. Şu komutları çalıştırın:
```bash
chmod +x start-local.sh
./start-local.sh
```

## Manuel Başlatma

### 1. Gereksinimler
- Node.js 20.x
- npm veya pnpm

### 2. Kurulum
```bash
# Bağımlılıkları yükle
pnpm install
# veya
npm install

# .env.local dosyasını oluştur
cp .env.local.example .env.local
```

### 3. Çalıştırma
```bash
# Windows
pnpm run dev:local
# veya
npm run dev:local

# Mac/Linux
pnpm run dev:local-unix
# veya
npm run dev:local-unix
```

### 4. Erişim
Tarayıcınızda: `http://localhost:3000`

## İlk Giriş

### Test Kullanıcıları
- **Admin**: admin / admin123
- **Antrenör**: coach / coach123  
- **Veli**: parent / parent123

### Özellikler
- Sporcu kayıt sistemi
- Performans takibi
- Ödeme yönetimi
- Mesajlaşma sistemi
- Medya galerisi

## Sorun Giderme

### Port 3000 kullanımda
```bash
pnpm run dev:local -- -p 3001
```

### Bağımlılık hataları
```bash
# Cache temizle
pnpm store prune
# Tekrar yükle
pnpm install
```

### .env.local ayarları
Dosyayı düzenleyip kendi ayarlarınızı girin:
- WordPress URL'i
- E-posta ayarları
- GitHub token (isteğe bağlı)

---

**İpucu**: İlk çalıştırmada otomatik başlatma scriptlerini kullanın, tüm kontrolları otomatik yapar.
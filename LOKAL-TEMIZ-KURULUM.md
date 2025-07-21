# LOKAL TEMİZ KURULUM REHBERİ

Bu rehber, tüm karmaşık sistemleri kaldırılmış, sadece localStorage kullanan temiz bir lokal kurulum için hazırlanmıştır.

## ÖNEMLİ NOT
- GitHub senkronizasyonu KALDIRILDI
- Cloud sistemler KALDIRILDI  
- Sadece localStorage kullanılıyor
- Veriler sadece o bilgisayarda kalıyor
- Farklı tarayıcılarda veriler görünmez (bu normal)

## KURULUM ADIMLARI

### 1. Gereksinimler
- Node.js (v18 veya üzeri)
- npm veya pnpm

### 2. Kurulum
```bash
# Bağımlılıkları yükle
npm install

# Veya pnpm kullanıyorsanız
pnpm install
```

### 3. Çalıştırma
```bash
# Lokal sunucuyu başlat
npm run dev

# Veya pnpm kullanıyorsanız
pnpm dev
```

### 4. Erişim
- Tarayıcıda: http://localhost:3000
- İlk giriş: yavuz@g7spor.org / 444125yA/

## ÖNEMLİ BİLGİLER

### Veri Depolama
- Tüm veriler localStorage'da saklanır
- Sadece o tarayıcıda görünür
- Tarayıcı cache'i temizlenirse veriler silinir

### Yedekleme
- Otomatik yedekleme YOK
- Manuel export/import özelliği var
- Düzenli olarak veri yedeklemesi yapın

### Güvenlik
- Şifreler düz metin olarak saklanır
- Sadece lokal kullanım için
- İnternet bağlantısı gerektirmez

## SORUN GİDERME

### Port Hatası
Eğer 3000 portu kullanılıyorsa:
```bash
npm run dev -- -p 3001
```

### Cache Temizleme
```bash
# Node modules temizle
rm -rf node_modules
npm install

# Tarayıcı cache temizle
Ctrl+Shift+R (Windows/Linux)
Cmd+Shift+R (Mac)
```

### Veri Sıfırlama
- Tarayıcı Developer Tools > Application > Local Storage
- localhost:3000 altındaki tüm verileri sil

## KULLANIM

### İlk Kurulum
1. http://localhost:3000 adresine git
2. Login sayfasında Admin sekmesini seç
3. Email: yavuz@g7spor.org
4. Şifre: 444125yA/
5. Giriş yap

### Veri Girişi
- Sporcular, ödemeler, antrenmanlar ekle
- Tüm veriler localStorage'da saklanır
- Sadece o tarayıcıda görünür

### Yedekleme
- Ayarlar > Veri Yedekleme sayfasından export yap
- JSON dosyasını güvenli yerde sakla
- Gerektiğinde import et

Bu sistem tamamen lokal çalışır ve karmaşık senkronizasyon sistemleri içermez.
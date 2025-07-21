# G7 Spor Okulu - Lokal CRM Sistemi

Tamamen lokal çalışan, basit ve etkili spor okulu yönetim sistemi.

## ÖNEMLİ NOT
Bu sistem tamamen lokal çalışır:
- ✅ İnternet bağlantısı gerektirmez
- ✅ Veriler sadece bilgisayarınızda saklanır
- ✅ GitHub senkronizasyonu YOK
- ✅ Cloud sistemler YOK
- ✅ Karmaşık konfigürasyon YOK

## Özellikler

- 🏃‍♂️ **Sporcu Yönetimi**: Sporcu kayıt ve takip
- 💰 **Aidat Takibi**: Ödeme takibi ve borç hesaplama
- 📅 **Antrenman Yönetimi**: Antrenman planlama ve yoklama
- 👨‍🏫 **Antrenör Yönetimi**: Antrenör profilleri
- 📊 **Raporlama**: Basit raporlar
- 📱 **Responsive**: Tüm cihazlarda çalışır

## Hızlı Başlangıç

### Windows Kullanıcıları
```bash
start-clean.bat
```

### Mac/Linux Kullanıcıları
```bash
chmod +x start-clean.sh
./start-clean.sh
```

### Manuel Kurulum
```bash
npm install
npm run dev
```

## Giriş Bilgileri
- **Email**: yavuz@g7spor.org
- **Şifre**: 444125yA/

## Tarayıcıda Açın
http://localhost:3000

## Veri Yedekleme
- Ayarlar > Veri Yedekleme sayfasından JSON export yapın
- Dosyayı güvenli yerde saklayın
- Gerektiğinde import edin

## Sorun Giderme

### Port Hatası
```bash
npm run dev -- -p 3001
```

### Temizlik
```bash
npm run clean
npm run fresh-start
```

### Veri Sıfırlama
- Tarayıcı Developer Tools > Application > Local Storage
- localhost:3000 altındaki tüm verileri silin

## Sistem Gereksinimleri
- Node.js 18+
- Modern tarayıcı (Chrome, Firefox, Safari, Edge)

---

**Basit, Güvenilir, Lokal** - Karmaşık sistemler olmadan spor okulu yönetimi.
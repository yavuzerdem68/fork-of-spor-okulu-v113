# 🗑️ SportsCRM - Komple Veri Sıfırlama Rehberi

Bu rehber, SportsCRM uygulamasındaki tüm verileri tamamen temizlemek ve sıfırdan başlamak için gerekli adımları açıklar.

## 🚨 ÖNEMLİ UYARILAR

- **Bu işlemler GERİ ALINAMAZ!**
- **Tüm sporcu kayıtları, ödemeler, cari hesap bilgileri silinecek**
- **İşlem öncesi önemli verilerinizi mutlaka yedekleyin**

## 📋 İçindekiler

1. [Hızlı Temizleme (Otomatik)](#hızlı-temizleme-otomatik)
2. [Web Arayüzü ile Temizleme](#web-arayüzü-ile-temizleme)
3. [Manuel Temizleme](#manuel-temizleme)
4. [Sorun Giderme](#sorun-giderme)

---

## 🚀 Hızlı Temizleme (Otomatik)

### Windows Batch Script (.bat)

1. **Script'i çalıştırın:**
   ```bash
   clear-all-data.bat
   ```

2. **Onay verin:**
   - Script size uyarı verecek
   - `E` yazıp Enter'a basın

3. **Bekleyin:**
   - Tüm tarayıcı verileri temizlenecek
   - Geçici dosyalar silinecek
   - DNS önbelleği temizlenecek

### PowerShell Script (.ps1)

1. **PowerShell'i yönetici olarak açın**

2. **Execution Policy'yi ayarlayın:**
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

3. **Script'i çalıştırın:**
   ```powershell
   .\clear-all-data.ps1
   ```

---

## 🖥️ Web Arayüzü ile Temizleme

### Komple Veri Sıfırlama Sayfası

1. **Sayfaya gidin:**
   ```
   http://localhost:3000/complete-data-reset
   ```

2. **Veri analizi yapın:**
   - "Yeniden Analiz Et" butonuna tıklayın
   - LocalStorage öğeleri listelenecek

3. **Temizleme seçenekleri:**

   **🔥 Hızlı Kullanıcı Verisi Temizle:**
   - Tüm sporcu kayıtları
   - Tüm ödeme kayıtları
   - Tüm cari hesap kayıtları
   - Ödeme eşleştirme geçmişi
   - Sistem ayarları korunur

   **⚙️ Seçmeli Temizleme:**
   - İstediğiniz öğeleri seçin
   - "Seçilenleri Dışa Aktar" ile yedek alın
   - "X Öğeyi Kalıcı Olarak Sil" butonuna tıklayın

### Ödemeler Sayfasından Temizleme

1. **Ödemeler sayfasına gidin:**
   ```
   http://localhost:3000/payments
   ```

2. **Mevcut ödemeleri kontrol edin**

3. **Yeni başlangıç için:**
   - Tüm ödemeleri manuel olarak silin
   - Veya komple sıfırlama sayfasını kullanın

---

## 🔧 Manuel Temizleme

### Tarayıcı LocalStorage Temizleme

#### Chrome:
1. `F12` tuşuna basın (Developer Tools)
2. **Application** sekmesine gidin
3. **Local Storage** → `http://localhost:3000` seçin
4. Tüm öğeleri seçip **Delete** tuşuna basın

#### Firefox:
1. `F12` tuşuna basın
2. **Storage** sekmesine gidin
3. **Local Storage** → `http://localhost:3000` seçin
4. Tüm öğeleri sağ tık → **Delete All**

#### Edge:
1. `F12` tuşuna basın
2. **Application** sekmesine gidin
3. **Local Storage** → `http://localhost:3000` seçin
4. **Clear All** butonuna tıklayın

### Tarayıcı Cache Temizleme

**Tüm tarayıcılar için:**
1. `Ctrl + Shift + Delete` tuşlarına basın
2. **Tüm zamanlar** seçin
3. Şunları işaretleyin:
   - ✅ Tarama geçmişi
   - ✅ İndirme geçmişi
   - ✅ Çerezler ve site verileri
   - ✅ Önbelleğe alınmış resimler ve dosyalar
4. **Verileri temizle** butonuna tıklayın

---

## 📊 Temizlenecek Veri Türleri

### 🔵 Kullanıcı Verisi
- `students` - Sporcu kayıtları
- `payments` - Ödeme kayıtları
- `account_*` - Cari hesap kayıtları (her sporcu için ayrı)

### 🟠 Önbellek Verisi
- `paymentMatchingHistory` - Ödeme eşleştirme geçmişi
- `turkishMatchingMemory` - Türkçe eşleştirme hafızası

### 🟢 Ayar Verisi
- `wordpress-settings` - WordPress bağlantı ayarları
- `theme` - Tema ayarları
- `language` - Dil ayarları

### 🔴 Sistem Verisi (KRİTİK)
- `userRole` - Kullanıcı yetki bilgisi
- `currentUser` - Aktif kullanıcı bilgisi

---

## 🔍 Temizleme Sonrası Kontrol

### 1. Tarayıcıyı Yeniden Başlatın
```bash
# Tarayıcıyı tamamen kapatın
# Yeniden açın
# http://localhost:3000 adresine gidin
```

### 2. Giriş Sayfası Kontrolü
- Giriş sayfası açılmalı
- Eski veriler görünmemeli
- Temiz bir arayüz olmalı

### 3. Dashboard Kontrolü
- Sporcu sayısı: 0
- Ödeme sayısı: 0
- Tüm istatistikler sıfır olmalı

### 4. Sayfa Kontrolleri
- **Sporcular sayfası:** Boş liste
- **Ödemeler sayfası:** Boş liste
- **Raporlar:** Sıfır veriler

---

## ⚠️ Sorun Giderme

### Problem: Veriler hala görünüyor

**Çözüm 1: Hard Refresh**
```bash
Ctrl + F5  # Windows/Linux
Cmd + Shift + R  # Mac
```

**Çözüm 2: İncognito/Private Mode**
```bash
Ctrl + Shift + N  # Chrome/Edge
Ctrl + Shift + P  # Firefox
```

**Çözüm 3: Tarayıcı Yeniden Başlatma**
```bash
# Tarayıcıyı tamamen kapatın
# Task Manager'dan process'leri sonlandırın
# Yeniden başlatın
```

### Problem: Script çalışmıyor

**Windows Batch (.bat) için:**
```bash
# Yönetici olarak çalıştırın
# Sağ tık → "Yönetici olarak çalıştır"
```

**PowerShell (.ps1) için:**
```powershell
# Execution Policy ayarlayın
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Script'i çalıştırın
.\clear-all-data.ps1
```

### Problem: Localhost açılmıyor

**Sunucu kontrolü:**
```bash
# Sunucunun çalıştığından emin olun
npm run dev
# veya
yarn dev
```

**Port kontrolü:**
```bash
# 3000 portu kullanımda mı?
netstat -an | findstr :3000
```

---

## 📝 Temizleme Checklist

### Temizleme Öncesi
- [ ] Önemli verileri yedekledim
- [ ] Hangi verilerin silineceğini anladım
- [ ] Sunucu çalışıyor durumda

### Temizleme Sırasında
- [ ] Script/Web arayüzü ile temizleme yaptım
- [ ] Tarayıcı cache'ini temizledim
- [ ] Tarayıcıyı yeniden başlattım

### Temizleme Sonrası
- [ ] Giriş sayfası açılıyor
- [ ] Dashboard temiz görünüyor
- [ ] Tüm sayfalar boş liste gösteriyor
- [ ] Yeni veri girişi yapabiliyorum

---

## 🆘 Acil Durum Kurtarma

### Yanlışlıkla Sistem Verilerini Sildiyseniz

1. **Tarayıcıyı kapatın**
2. **LocalStorage'a sistem verilerini geri ekleyin:**

```javascript
// Tarayıcı console'unda çalıştırın (F12 → Console)
localStorage.setItem('userRole', '"admin"');
localStorage.setItem('currentUser', '{"username":"admin","role":"admin"}');
```

3. **Sayfayı yenileyin**
4. **Giriş yapın**

### Veri Kurtarma

Eğer yedek aldıysanız:

1. **Komple Veri Sıfırlama sayfasına gidin**
2. **Import özelliğini kullanın** (gelecek güncellemede)
3. **Yedek dosyanızı seçin**

---

## 📞 Destek

Sorun yaşıyorsanız:

1. **Bu rehberi tekrar okuyun**
2. **Sorun giderme bölümünü kontrol edin**
3. **Tarayıcı console'unu kontrol edin** (F12 → Console)
4. **Hata mesajlarını kaydedin**

---

## 🎯 Özet

Bu rehber ile SportsCRM uygulamanızdaki tüm verileri güvenli bir şekilde temizleyebilir ve sıfırdan başlayabilirsiniz. 

**En kolay yöntem:** `clear-all-data.bat` script'ini çalıştırmak
**En güvenli yöntem:** Web arayüzünden seçmeli temizleme yapmak

**Unutmayın:** Tüm işlemler geri alınamaz, önemli verilerinizi mutlaka yedekleyin!

---

*Son güncelleme: 2025-01-17*
*SportsCRM v2.0*
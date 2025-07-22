# Bağımsız Sporcu Kayıt Formu - Kurulum Rehberi

Bu rehber, sporcu kayıt formunu kendi web sitenizde nasıl kuracağınızı adım adım açıklar.

## 📋 Gereksinimler

- Web hosting (PHP desteği olan)
- E-posta gönderimi için SMTP erişimi
- Modern web tarayıcısı

## 📁 Dosya Yapısı

```
your-website/
├── sporcu-kayit/
│   ├── index.html (standalone-registration-form.html'i yeniden adlandırın)
│   ├── send-form.php
│   └── README.md
```

## 🚀 Kurulum Seçenekleri

### Seçenek A: Mevcut API'yi Kullanma (En Kolay)

1. **HTML dosyasını hazırlayın:**
   - `standalone-registration-form.html` dosyasını `index.html` olarak yeniden adlandırın
   - Dosyayı web sitenizin istediğiniz klasörüne yükleyin

2. **API endpoint'ini ayarlayın:**
   - HTML dosyasında `API_ENDPOINT` değişkenini bulun (satır ~542)
   - Mevcut değeri koruyun: `https://yrtndlooyuamztzl-g9q59dgy8.preview.co.dev/api/send-form`

3. **Test edin:**
   - Formu web sitenizde açın
   - Test verisi ile form gönderin
   - E-posta gelip gelmediğini kontrol edin

**Avantajları:**
- ✅ Hızlı kurulum
- ✅ Sunucu yapılandırması gerektirmez
- ✅ Anında çalışır

**Dezavantajları:**
- ❌ Dış servise bağımlı
- ❌ E-posta ayarlarını değiştiremezsiniz

### Seçenek B: Kendi PHP Backend'inizi Kullanma (Önerilen)

1. **Dosyaları yükleyin:**
   ```
   your-website/sporcu-kayit/
   ├── index.html
   └── send-form.php
   ```

2. **PHP dosyasını yapılandırın:**
   `send-form.php` dosyasını açın ve aşağıdaki satırları düzenleyin:

   ```php
   // Satır 13-17 arası
   $EMAIL_HOST = 'smtp.gmail.com';
   $EMAIL_PORT = 587;
   $EMAIL_USERNAME = 'your-email@gmail.com'; // KENDİ EMAİLİNİZ
   $EMAIL_PASSWORD = 'your-app-password';    // UYGULAMA ŞİFRENİZ
   $EMAIL_TO = 'admin@sporokulu.com';        // ALICI EMAİL ADRESİ
   ```

3. **HTML dosyasını güncelleyin:**
   `index.html` dosyasında API endpoint'ini değiştirin:
   ```javascript
   // Satır ~542
   const API_ENDPOINT = './send-form.php'; // Kendi PHP dosyanız
   ```

4. **Gmail ayarlarını yapın:**
   - Gmail hesabınızda 2FA'yı etkinleştirin
   - Uygulama şifresi oluşturun
   - Oluşturulan şifreyi PHP dosyasına girin

**Avantajları:**
- ✅ Tam kontrol
- ✅ Özelleştirilebilir
- ✅ Dış servise bağımlı değil

### Seçenek C: Sadece JSON İndirme (Offline)

1. **HTML dosyasını güncelleyin:**
   ```javascript
   // Satır ~541
   const USE_LOCAL_DOWNLOAD = true; // true yapın
   ```

2. **Dosyayı yükleyin:**
   - Sadece `index.html` dosyasını yükleyin
   - Form doldurulduğunda JSON dosyası indirilecek

**Avantajları:**
- ✅ En basit kurulum
- ✅ Sunucu gerektirmez

**Dezavantajları:**
- ❌ Manuel işlem gerekir
- ❌ E-posta gönderimi yok

## 📧 Gmail Kurulum Rehberi

### 1. 2 Adımlı Doğrulamayı Etkinleştirin
1. Gmail hesabınıza giriş yapın
2. Hesap ayarlarına gidin
3. "Güvenlik" sekmesini açın
4. "2 Adımlı Doğrulama"yı etkinleştirin

### 2. Uygulama Şifresi Oluşturun
1. "Güvenlik" sekmesinde "Uygulama şifreleri"ni bulun
2. "Uygulama seç" → "Diğer (özel ad)"
3. "Spor Okulu Form" gibi bir ad verin
4. "Oluştur" butonuna tıklayın
5. Oluşturulan 16 haneli şifreyi kopyalayın

### 3. PHP Dosyasını Güncelleyin
```php
$EMAIL_USERNAME = 'sizin-email@gmail.com';
$EMAIL_PASSWORD = 'abcd efgh ijkl mnop'; // 16 haneli uygulama şifresi
$EMAIL_TO = 'formlar@sporokulu.com';     // Formların gideceği adres
```

## 🔧 Özelleştirme

### Renk Temasını Değiştirme
HTML dosyasında CSS renklerini değiştirin:
```css
/* Ana renk */
.btn-primary { background: #your-color; }

/* Vurgu rengi */
.section-title { color: #your-color; }
```

### Logo Ekleme
Header bölümüne logo ekleyin:
```html
<div class="card-header">
    <img src="logo.png" alt="Logo" style="height: 60px; margin-bottom: 10px;">
    <h1 class="card-title">Spor Okulu Kayıt Formu</h1>
</div>
```

### Spor Branşlarını Değiştirme
JavaScript bölümünde sports dizisini düzenleyin:
```javascript
const sports = [
    "Basketbol", "Futbol", "Voleybol",
    // Kendi spor branşlarınızı ekleyin
];
```

## 🧪 Test Etme

### 1. Yerel Test
- Formu bir test sunucusunda açın
- Tüm alanları doldurun
- Form gönderimi test edin

### 2. E-posta Testi
- Test verisi ile form gönderin
- E-posta kutunuzu kontrol edin
- JSON eki açılıyor mu kontrol edin

### 3. Mobil Test
- Formu mobil cihazlarda test edin
- Responsive tasarımı kontrol edin

## 🔒 Güvenlik

### Öneriler
- HTTPS kullanın
- PHP dosyasında input validation yapın
- Rate limiting ekleyin
- Spam koruması ekleyin

### Dosya İzinleri
```bash
chmod 644 index.html
chmod 644 send-form.php
```

## 🐛 Sorun Giderme

### Form Gönderilmiyor
1. Browser console'da hata var mı kontrol edin
2. PHP error log'larını kontrol edin
3. E-posta ayarlarını doğrulayın

### E-posta Gelmiyor
1. Spam klasörünü kontrol edin
2. Gmail uygulama şifresini kontrol edin
3. Sunucu mail fonksiyonunu test edin

### Fotoğraf Yüklenmiyor
1. Dosya boyutu 5MB'dan küçük mü?
2. Dosya formatı destekleniyor mu?
3. Browser'da JavaScript aktif mi?

## 📞 Destek

Kurulum sırasında sorun yaşarsanız:

1. **Hata mesajlarını kaydedin**
2. **Browser console'u kontrol edin**
3. **PHP error log'larını inceleyin**

## 📝 Lisans

Bu form açık kaynak kodludur ve ticari projelerinizde kullanabilirsiniz.

---

**Son Güncelleme:** 22 Temmuz 2025
**Versiyon:** 1.0
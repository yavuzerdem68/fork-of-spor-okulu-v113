# Bağımsız Sporcu Kayıt Formu Paketi

Bu paket, sporcu kayıt formunu kendi web sitenizde kullanabilmeniz için hazırlanmıştır.

## Paket İçeriği

### 1. Ana Form Dosyası
- `standalone-registration-form.html` - Tek dosyada çalışan HTML formu

### 2. Gerekli Dosyalar
- `form-styles.css` - Form stilleri
- `form-script.js` - Form işlevselliği
- `tc-validation.js` - TC kimlik numarası doğrulama

### 3. API Endpoint
- Form verilerini e-posta ile gönderecek PHP dosyası (opsiyonel)

## Kurulum Seçenekleri

### Seçenek A: Mevcut API'yi Kullanma
1. HTML formunu web sitenize yükleyin
2. Form action'ını mevcut API endpoint'ine yönlendirin
3. CORS ayarlarını yapılandırın

### Seçenek B: Kendi Backend'inizi Kullanma
1. Tüm dosyaları web sitenize yükleyin
2. PHP mail fonksiyonunu yapılandırın
3. E-posta ayarlarını güncelleyin

### Seçenek C: Sadece Frontend (JSON İndirme)
1. HTML formunu web sitenize yükleyin
2. Form verilerini JSON olarak indirme özelliği

## Özellikler

- ✅ Responsive tasarım
- ✅ TC kimlik numarası doğrulama
- ✅ Fotoğraf yükleme
- ✅ Form validasyonu
- ✅ E-posta gönderimi
- ✅ JSON export
- ✅ Türkçe karakter desteği

## Teknik Gereksinimler

- Modern web tarayıcısı
- E-posta gönderimi için PHP (opsiyonel)
- HTTPS (fotoğraf yükleme için önerilir)

## Destek

Form ile ilgili sorularınız için:
- E-posta: [E-posta adresiniz]
- Telefon: [Telefon numaranız]
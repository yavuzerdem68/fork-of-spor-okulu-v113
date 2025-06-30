# Spor Okulu CRM - Türkçe Deployment Rehberi

## 🎯 Başlangıç - Sıfırdan Kurulum

### Adım 1: Dosyaları Hazırlama
1. **fork-of-spor-okulu-v113-main.zip** dosyasını indirdiğiniz klasöre gidin
2. ZIP dosyasını **çıkarın** (Extract/Ayıkla)
3. Çıkan **fork-of-spor-okulu-v113-main** klasörüne girin

### Adım 2: PowerShell'i Açma
1. **Windows tuşu + R** basın
2. **powershell** yazın ve Enter basın
3. PowerShell açıldığında, proje klasörünüze gidin:
   ```powershell
   cd "C:\Users\KullaniciAdiniz\Downloads\fork-of-spor-okulu-v113-main"
   ```
   *(Kendi dosya yolunuzu yazın)*

### Adım 3: Node.js Kontrol
PowerShell'de şu komutu çalıştırın:
```powershell
node --version
```
- Eğer versiyon numarası görüyorsanız (örn: v20.x.x) devam edin
- Eğer hata alıyorsanız, önce Node.js'i indirip kurun: https://nodejs.org

### Adım 4: Bağımlılıkları Yükleme
```powershell
npm install
```
Bu komut tüm gerekli paketleri yükleyecek (birkaç dakika sürebilir).

### Adım 5: WordPress için Build Alma
```powershell
npm run build:wordpress
```
Bu komut çalıştıktan sonra **out** klasörü oluşacak.

### Adım 6: Build Kontrolü
Proje klasörünüzde şimdi **out** klasörü olmalı. İçinde şunlar olmalı:
- index.html
- _next klasörü
- manifest.json
- Diğer HTML sayfaları (athletes.html, dashboard.html, vb.)

## 🚀 Plesk Panel'e Yükleme

### Adım 7: Plesk File Manager'a Giriş
1. Plesk panelinizi açın
2. **"Dosyalar"** veya **"Files"** bölümüne tıklayın
3. **httpdocs** veya **public_html** klasörüne gidin

### Adım 8: Klasör Hazırlığı
1. Eğer **spor-okulu** klasörü varsa, **tamamen silin**
2. Yeni bir **spor-okulu** klasörü oluşturun

### Adım 9: Dosya Yükleme
1. Bilgisayarınızdaki **out** klasörünün **içindeki tüm dosyaları** seçin
2. Plesk'teki **spor-okulu** klasörüne yükleyin
3. Ayrıca proje ana dizinindeki **.htaccess** dosyasını da **spor-okulu** klasörüne yükleyin

### Adım 10: Dosya Yapısı Kontrolü
Plesk'te şu yapı olmalı:
```
httpdocs/spor-okulu/
├── .htaccess
├── index.html
├── manifest.json
├── _next/
│   ├── static/
│   └── ...
├── athletes.html
├── dashboard.html
└── ... (diğer sayfalar)
```

## 🧪 Test Etme

### Adım 11: Site Testi
1. Tarayıcınızda şu adresi açın: **https://g7spor.org/spor-okulu/**
2. **F12** basarak geliştirici araçlarını açın
3. **Console** sekmesine bakın
4. **404 hatası** olmamalı

## ❗ Sorun Giderme

### Eğer 404 Hataları Alıyorsanız:
1. **Tarayıcı önbelleğini temizleyin** (Ctrl+Shift+Delete)
2. **Sayfayı yenileyin** (Ctrl+F5)
3. Plesk'te dosya izinlerini kontrol edin:
   - Dosyalar: 644
   - Klasörler: 755

### Eğer Build Alamıyorsanız:
```powershell
# Önce temizlik yapın
Remove-Item -Recurse -Force out/, .next/ -ErrorAction SilentlyContinue

# Tekrar deneyin
npm install
npm run build:wordpress
```

### Eğer npm install Hatası Alıyorsanız:
```powershell
# npm cache'i temizleyin
npm cache clean --force

# Tekrar deneyin
npm install
```

## 📞 Yardım

### Sık Karşılaşılan Hatalar:
1. **"node komutu bulunamadı"** → Node.js kurun
2. **"npm komutu bulunamadı"** → Node.js ile birlikte gelir
3. **"out klasörü oluşmadı"** → Build komutu başarısız, hata mesajlarını kontrol edin
4. **"404 hataları"** → Dosya yükleme eksik veya yanlış klasör

### Başarı Kontrol Listesi:
- [ ] Node.js kurulu
- [ ] npm install başarılı
- [ ] npm run build:wordpress başarılı
- [ ] out klasörü oluştu
- [ ] Tüm dosyalar Plesk'e yüklendi
- [ ] .htaccess dosyası yüklendi
- [ ] Site açılıyor
- [ ] Console'da hata yok

## 🎉 Tamamlandı!

Tüm adımları doğru takip ettiyseniz, spor okulu CRM sisteminiz artık https://g7spor.org/spor-okulu/ adresinde çalışıyor olmalı.

### Sonraki Adımlar:
1. Tüm özellikleri test edin (giriş, sporcu yönetimi, ödemeler)
2. SSL sertifikası kontrol edin
3. WordPress API ayarlarını yapılandırın (gerekirse)
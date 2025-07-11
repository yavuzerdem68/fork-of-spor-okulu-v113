# NPM PATH Hatası Çözümü

## Sorun Açıklaması

Node.js kurulu olmasına rağmen `npm` komutu bulunamıyor hatası alıyorsunuz. Bu genellikle PATH çevre değişkeni sorunundan kaynaklanır.

## Hızlı Çözümler

### 1. NPM Onarma Aracını Çalıştırın
```bash
fix-npm-installation.bat
```
Bu araç eksik NPM kurulumunu otomatik olarak onarır.

### 2. Diagnostik Aracını Çalıştırın
```bash
diagnose-nodejs.bat
```
Bu araç sorunu detaylı olarak analiz eder ve çözüm önerileri sunar.

### 3. Bilgisayarı Yeniden Başlatın
En basit çözüm - Node.js kurulumundan sonra bilgisayarı yeniden başlatmak PATH değişkenlerini yeniler.

### 4. Manuel PATH Kontrolü

#### Windows 10/11:
1. `Windows + R` tuşlarına basın
2. `sysdm.cpl` yazın ve Enter'a basın
3. "Advanced" sekmesine gidin
4. "Environment Variables" butonuna tıklayın
5. "System variables" bölümünde "Path" değişkenini bulun
6. Düzenle'ye tıklayın
7. Node.js yolunun ekli olduğunu kontrol edin (örn: `C:\Program Files\nodejs\`)

## Detaylı Çözümler

### Çözüm 1: Node.js Yeniden Kurulum
1. Node.js'i kaldırın (Control Panel > Programs)
2. https://nodejs.org/ adresinden LTS versiyonunu indirin
3. Yönetici olarak çalıştırın
4. Kurulum sırasında "Add to PATH" seçeneğinin işaretli olduğundan emin olun
5. Bilgisayarı yeniden başlatın

### Çözüm 2: Manuel PATH Ekleme
1. Node.js kurulum dizinini bulun (genellikle `C:\Program Files\nodejs\`)
2. Bu dizini PATH çevre değişkenine ekleyin:
   - Windows + R → `sysdm.cpl`
   - Advanced → Environment Variables
   - System variables → Path → Edit
   - New → Node.js dizinini ekleyin
   - OK ile kaydedin
3. Tüm komut istemlerini kapatın ve yeniden açın

### Çözüm 3: PowerShell ile Geçici Çözüm
```powershell
# Node.js dizinini PATH'e ekle (geçici)
$env:PATH += ";C:\Program Files\nodejs\"

# Test et
npm --version
```

### Çözüm 4: NPM'i Tam Yol ile Kullanma
Eğer npm PATH'te yoksa, tam yolunu kullanabilirsiniz:
```bash
"C:\Program Files\nodejs\npm.cmd" --version
```

## Güvenli Başlatma Scripti Güncellemesi

`start-local-safe.bat` scripti artık bu sorunu otomatik olarak tespit eder ve çözer:

1. NPM'i PATH'te arar
2. Bulamazsa Node.js dizininde arar
3. Bulduğu NPM'i tam yol ile kullanır
4. Detaylı hata mesajları ve çözüm önerileri sunar

## Test Etme

Çözümlerden birini uyguladıktan sonra test edin:

```bash
# Yeni komut istemi açın
node --version
npm --version

# Veya diagnostik aracını çalıştırın
diagnose-nodejs.bat
```

## Sık Karşılaşılan Durumlar

### 1. Node.js Portable Kurulum
Portable Node.js kullanıyorsanız PATH'e manuel eklemeniz gerekir.

### 2. Çoklu Node.js Versiyonları
NVM veya benzer araçlar kullanıyorsanız, aktif versiyonu kontrol edin.

### 3. Kurumsal Bilgisayarlar
Yönetici hakları gerekebilir veya IT departmanından destek alın.

### 4. Antivirus Engellemesi
Antivirus yazılımı npm'i engelliyor olabilir - geçici olarak devre dışı bırakıp test edin.

## Alternatif Çözümler

### Yarn Kullanımı
NPM yerine Yarn kullanabilirsiniz:
```bash
npm install -g yarn
yarn --version
```

### PNPM Kurulumu
```bash
npm install -g pnpm
# veya
iwr https://get.pnpm.io/install.ps1 -useb | iex
```

## Destek

Bu çözümler işe yaramazsa:

1. `diagnose-nodejs.bat` çıktısını kaydedin
2. Node.js versiyonunu ve kurulum yöntemini belirtin
3. Windows versiyonunu belirtin
4. Hata mesajının tam metnini paylaşın

## Önleme

Gelecekte bu sorunla karşılaşmamak için:

1. Node.js'i her zaman resmi siteden indirin
2. Kurulum sırasında "Add to PATH" seçeneğini işaretleyin
3. Yönetici hakları ile kurun
4. Kurulumdan sonra bilgisayarı yeniden başlatın
5. Kurulum sonrası test edin: `node --version` ve `npm --version`
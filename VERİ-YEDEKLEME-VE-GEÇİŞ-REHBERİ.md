# 📊 VERİ YEDEKLEME VE YENİ VERSİYONA GEÇİŞ REHBERİ

## 🎯 AMAÇ
Mevcut form verilerinizi (sporcu kayıtları, cari hesap hareketleri, veli hesapları) kaybetmeden yeni versiyona güvenli geçiş yapmak.

## 📋 VERİLERİNİZİN MEVCUT DURUMU

Sisteminizde şu veriler localStorage'da saklanıyor:
- **Sporcu Kayıtları**: `students` anahtarında
- **Cari Hesap Hareketleri**: `account_[sporcu_id]` anahtarlarında
- **Veli Kullanıcı Hesapları**: `parentUsers` anahtarında
- **Sistem Ayarları**: Çeşitli ayar anahtarlarında

## 🔄 GEÇİŞ YÖNTEMLERİ

### YÖNTEM 1: OTOMATIK YEDEKLEME VE GEÇİŞ (ÖNERİLEN)

#### Adım 1: Mevcut Verileri Yedekle
```javascript
// Tarayıcı konsolunda çalıştırın (F12 > Console)
function backupAllData() {
    const backup = {
        timestamp: new Date().toISOString(),
        version: 'v1.0',
        data: {
            students: JSON.parse(localStorage.getItem('students') || '[]'),
            parentUsers: JSON.parse(localStorage.getItem('parentUsers') || '[]'),
            accounts: {},
            settings: {}
        }
    };
    
    // Tüm cari hesap verilerini yedekle
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('account_')) {
            backup.data.accounts[key] = JSON.parse(localStorage.getItem(key) || '[]');
        }
        if (key.includes('settings') || key.includes('config')) {
            backup.data.settings[key] = localStorage.getItem(key);
        }
    }
    
    // JSON dosyası olarak indir
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sportscrm_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    console.log('Yedekleme tamamlandı!', backup);
    return backup;
}

// Yedekleme işlemini başlat
backupAllData();
```

#### Adım 2: Yeni Versiyonu İndir ve Kur
1. Yeni versiyonu GitHub'dan indirin
2. Mevcut klasörü yedekleyin (klasör adını değiştirin)
3. Yeni versiyonu aynı konuma kurun

#### Adım 3: Verileri Geri Yükle
```javascript
// Yeni versiyonda tarayıcı konsolunda çalıştırın
function restoreAllData(backupData) {
    try {
        // Sporcu verilerini geri yükle
        if (backupData.data.students) {
            localStorage.setItem('students', JSON.stringify(backupData.data.students));
            console.log(`${backupData.data.students.length} sporcu kaydı geri yüklendi`);
        }
        
        // Veli hesaplarını geri yükle
        if (backupData.data.parentUsers) {
            localStorage.setItem('parentUsers', JSON.stringify(backupData.data.parentUsers));
            console.log(`${backupData.data.parentUsers.length} veli hesabı geri yüklendi`);
        }
        
        // Cari hesap verilerini geri yükle
        if (backupData.data.accounts) {
            Object.keys(backupData.data.accounts).forEach(key => {
                localStorage.setItem(key, JSON.stringify(backupData.data.accounts[key]));
            });
            console.log(`${Object.keys(backupData.data.accounts).length} cari hesap geri yüklendi`);
        }
        
        // Ayarları geri yükle
        if (backupData.data.settings) {
            Object.keys(backupData.data.settings).forEach(key => {
                localStorage.setItem(key, backupData.data.settings[key]);
            });
            console.log(`${Object.keys(backupData.data.settings).length} ayar geri yüklendi`);
        }
        
        alert('Tüm veriler başarıyla geri yüklendi! Sayfayı yenileyin.');
        location.reload();
        
    } catch (error) {
        console.error('Veri geri yükleme hatası:', error);
        alert('Veri geri yükleme sırasında hata oluştu: ' + error.message);
    }
}

// Yedek dosyasını yüklemek için
function loadBackupFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const backupData = JSON.parse(e.target.result);
                    restoreAllData(backupData);
                } catch (error) {
                    alert('Yedek dosyası okunamadı: ' + error.message);
                }
            };
            reader.readAsText(file);
        }
    };
    input.click();
}

// Dosya seçici aç
loadBackupFile();
```

### YÖNTEM 2: MANUEL EXCEL YEDEKLEME

#### Adım 1: Sporcu Verilerini Excel'e Aktar
1. Mevcut sistemde "Aktif Sporcuları Dışa Aktar" butonunu kullanın
2. Tüm sporcu verileriniz Excel dosyasına aktarılacak

#### Adım 2: Cari Hesap Verilerini Yedekle
```javascript
// Tarayıcı konsolunda çalıştırın
function exportAccountData() {
    const students = JSON.parse(localStorage.getItem('students') || '[]');
    const accountData = [];
    
    students.forEach(student => {
        const accountEntries = JSON.parse(localStorage.getItem(`account_${student.id}`) || '[]');
        accountEntries.forEach(entry => {
            accountData.push({
                'Sporcu ID': student.id,
                'Sporcu Adı': student.studentName,
                'Sporcu Soyadı': student.studentSurname,
                'Tarih': new Date(entry.date).toLocaleDateString('tr-TR'),
                'Ay': entry.month,
                'Açıklama': entry.description,
                'Tür': entry.type === 'debit' ? 'Borç' : 'Alacak',
                'Tutar (KDV Hariç)': entry.amountExcludingVat,
                'KDV Oranı': entry.vatRate,
                'KDV Tutarı': entry.vatAmount,
                'Toplam': entry.amountIncludingVat,
                'Birim Kod': entry.unitCode
            });
        });
    });
    
    console.log('Cari hesap verileri:', accountData);
    
    // CSV olarak indir
    const csv = [
        Object.keys(accountData[0]).join(','),
        ...accountData.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cari_hesap_verileri_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

exportAccountData();
```

#### Adım 3: Veli Giriş Bilgilerini Yedekle
Mevcut sistemde "Veli Giriş Bilgileri İndir" butonunu kullanın.

### YÖNTEM 3: TARAYICI GELIŞTIRICI ARAÇLARI İLE YEDEKLEME

#### localStorage Verilerini Görüntüleme
1. F12 tuşuna basın
2. "Application" sekmesine gidin
3. Sol menüden "Local Storage" > site adresinizi seçin
4. Tüm verileri görebilirsiniz

#### Verileri Kopyalama
```javascript
// Tüm localStorage verilerini kopyala
function copyAllLocalStorage() {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        data[key] = localStorage.getItem(key);
    }
    
    const jsonString = JSON.stringify(data, null, 2);
    navigator.clipboard.writeText(jsonString);
    console.log('Tüm localStorage verileri panoya kopyalandı');
    return data;
}

copyAllLocalStorage();
```

## 🛡️ GÜVENLİK ÖNLEMLERİ

### 1. Çoklu Yedekleme
- JSON yedek dosyası
- Excel dosyaları
- Manuel kopyalama
- Farklı konumlarda saklama

### 2. Veri Doğrulama
```javascript
// Yedeklenen veri sayısını kontrol et
function validateBackup(backupData) {
    console.log('Yedekleme Raporu:');
    console.log('- Sporcu sayısı:', backupData.data.students?.length || 0);
    console.log('- Veli hesabı sayısı:', backupData.data.parentUsers?.length || 0);
    console.log('- Cari hesap sayısı:', Object.keys(backupData.data.accounts || {}).length);
    console.log('- Ayar sayısı:', Object.keys(backupData.data.settings || {}).length);
    
    return {
        students: backupData.data.students?.length || 0,
        parents: backupData.data.parentUsers?.length || 0,
        accounts: Object.keys(backupData.data.accounts || {}).length,
        settings: Object.keys(backupData.data.settings || {}).length
    };
}
```

### 3. Test Ortamı
- Yeni versiyonu önce farklı bir klasörde test edin
- Verileri geri yükledikten sonra kontrol edin
- Sorun yoksa ana sistemi güncelleyin

## 📝 ADIM ADIM GEÇİŞ PLANI

### Hazırlık (5 dakika)
1. ✅ Mevcut sistemi kapatın
2. ✅ Tarayıcıyı açık tutun (veriler silinmesin)
3. ✅ Yedekleme scriptlerini hazırlayın

### Yedekleme (10 dakika)
1. ✅ Otomatik yedekleme scriptini çalıştırın
2. ✅ Excel dosyalarını indirin
3. ✅ Veli giriş bilgilerini indirin
4. ✅ Yedek dosyalarını güvenli yere kopyalayın

### Kurulum (15 dakika)
1. ✅ Mevcut klasörü yedekleyin
2. ✅ Yeni versiyonu indirin ve kurun
3. ✅ Gerekli bağımlılıkları yükleyin
4. ✅ Sistemi başlatın

### Geri Yükleme (10 dakika)
1. ✅ Veri geri yükleme scriptini çalıştırın
2. ✅ Yedek dosyasını seçin
3. ✅ Verilerin yüklendiğini kontrol edin
4. ✅ Sayfayı yenileyin

### Test (10 dakika)
1. ✅ Sporcu listesini kontrol edin
2. ✅ Cari hesap hareketlerini kontrol edin
3. ✅ Veli giriş bilgilerini test edin
4. ✅ Tüm fonksiyonları test edin

## 🚨 SORUN GİDERME

### Veri Kaybolursa
1. Tarayıcı geçmişini kontrol edin
2. Yedek dosyalarını kullanın
3. Eski klasörü geri yükleyin

### Script Çalışmazsa
1. Tarayıcı konsolunu kontrol edin
2. Hata mesajlarını okuyun
3. Manuel yedekleme yöntemini kullanın

### Veriler Eksikse
1. localStorage'ı kontrol edin
2. Farklı tarayıcı profili deneyin
3. Sistem geri yükleme yapın

## 📞 DESTEK

Sorun yaşarsanız:
1. Hata mesajlarını kaydedin
2. Yedek dosyalarınızı koruyun
3. Adım adım tekrar deneyin

## ✅ BAŞARI KONTROL LİSTESİ

- [ ] Tüm veriler yedeklendi
- [ ] Yeni versiyon kuruldu
- [ ] Veriler geri yüklendi
- [ ] Sporcu sayısı doğru
- [ ] Cari hesaplar çalışıyor
- [ ] Veli girişleri çalışıyor
- [ ] Tüm özellikler aktif

---

**ÖNEMLİ NOT**: Bu işlemi yapmadan önce mutlaka yedekleme yapın. Veri kaybı durumunda sorumluluk kabul edilmez.
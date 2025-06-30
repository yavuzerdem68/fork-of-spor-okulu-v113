# Güvenli Geliştirme ve Deployment Stratejisi

## 🔒 STABİL VERSİYON KORUMA

### 1. Mevcut Çalışan Versiyonu Yedekleme
```bash
# Şu anki çalışan out klasörünü yedekle
cp -r out out-stable-backup-$(date +%Y%m%d_%H%M%S)

# Windows için:
xcopy out out-stable-backup-%date:~-4,4%%date:~-10,2%%date:~-7,2% /E /I
```

### 2. Git Branch Stratejisi
```bash
# Ana çalışan versiyonu korumak için
git checkout -b stable-production
git add .
git commit -m "Stable working version - all navigation fixed"
git push origin stable-production

# Geliştirme için yeni branch
git checkout -b wordpress-integration
```

### 3. Rollback Planı
```bash
# Sorun çıkarsa hızla geri dön
git checkout stable-production
npm run build:wordpress
node create-out-folder.js
# out klasörünü tekrar upload et
```

## 📊 VERİ KAYBI ÖNLEME STRATEJİSİ

### A) Çoklu Yedekleme Sistemi

#### 1. GitHub Storage (Ana)
```
✅ Otomatik commit/push
✅ Version history
✅ Conflict resolution
✅ Backup: data/ klasörü
```

#### 2. WordPress Database (İkincil)
```
✅ MySQL veritabanı
✅ REST API erişimi
✅ Admin panel erişimi
✅ Backup: phpMyAdmin export
```

#### 3. LocalStorage (Geçici)
```
✅ Offline çalışma
✅ Hızlı erişim
✅ Geçici saklama
✅ Backup: Browser export
```

### B) Veri Senkronizasyon Stratejisi
```javascript
// Veri kaydetme öncelik sırası:
1. LocalStorage (anında)
2. GitHub Storage (birincil)
3. WordPress DB (ikincil)
4. Conflict resolution (çakışma durumunda)
```

## 🚀 GÜVENLİ DEPLOYMENT SÜRECİ

### 1. Pre-Deployment Checklist
```bash
# Test listesi
✅ npm run build:wordpress (hatasız)
✅ node create-out-folder.js (başarılı)
✅ out/ klasörü kontrol
✅ Kritik sayfalar test (login, dashboard, athletes)
✅ Navigation linkleri test
✅ Form submission test
```

### 2. Deployment Adımları
```bash
# Adım 1: Mevcut versiyonu yedekle
cp -r out out-backup-$(date +%Y%m%d_%H%M%S)

# Adım 2: Build yap
npm run build:wordpress
node create-out-folder.js

# Adım 3: Kritik dosyaları kontrol et
ls -la out/
ls -la out/_next/

# Adım 4: Test deployment (staging)
# Önce test subdomain'e yükle: test.g7spor.org/spor-okulu/

# Adım 5: Production deployment
# Başarılı test sonrası: g7spor.org/spor-okulu/
```

### 3. Post-Deployment Verification
```bash
# Test URL'leri
curl -I https://g7spor.org/spor-okulu/
curl -I https://g7spor.org/spor-okulu/dashboard
curl -I https://g7spor.org/spor-okulu/athletes
curl -I https://g7spor.org/spor-okulu/login

# Form test
# Manuel olarak sporcu ekleme testi
```

## 🔧 YENİ MODÜL EKLEME SÜRECİ

### 1. Geliştirme Branch'inde Çalış
```bash
git checkout -b feature/new-module
# Yeni modül geliştir
# Test et
# Commit yap
```

### 2. Staging Test
```bash
# Test ortamında dene
npm run build:wordpress
node create-out-folder.js
# Test subdomain'e yükle
# Kapsamlı test yap
```

### 3. Production Merge
```bash
# Başarılı test sonrası
git checkout stable-production
git merge feature/new-module
git push origin stable-production
```

## 📋 VERİ MİGRASYON PLANI

### A) Mevcut Veriler (data/ klasörü)
```json
{
  "athletes": "35+ sporcu kaydı",
  "diagnostic": "6+ teşhis kaydı",
  "format": "JSON files",
  "location": "GitHub repository"
}
```

### B) WordPress'e Migrasyon
```bash
# Migration script çalıştır
npm run migrate:to-wordpress

# Manuel kontrol
# WordPress Admin → Sporcular
# Veri bütünlüğü kontrolü
```

### C) Dual Storage Period
```
📅 1-2 hafta boyunca:
✅ GitHub storage aktif (ana)
✅ WordPress storage aktif (yedek)
✅ Günlük senkronizasyon kontrolü
✅ Veri tutarlılığı kontrolü
```

## 🛡️ ACİL DURUM PLANI

### 1. Site Çöktüğünde
```bash
# Hızla stable versiyona dön
cd out-stable-backup-YYYYMMDD_HHMMSS/
# Bu klasörü tekrar upload et
# 5 dakika içinde site ayakta
```

### 2. Veri Kaybında
```bash
# GitHub'dan veri kurtar
git checkout stable-production
# data/ klasörünü kontrol et
# WordPress'ten veri çek (yedek)
```

### 3. WordPress Sorunu
```bash
# GitHub storage'a geç
# LocalStorage'dan veri kurtar
# WordPress'i düzelt
# Veriyi tekrar senkronize et
```

## 📞 DESTEK VE BAKIM

### A) Günlük Kontroller
```
✅ Site erişilebilirlik
✅ Form çalışması
✅ Veri senkronizasyonu
✅ Error log kontrolü
```

### B) Haftalık Bakım
```
✅ WordPress güncelleme
✅ Eklenti güncelleme
✅ Veritabanı optimizasyonu
✅ Yedek kontrolü
```

### C) Aylık Güvenlik
```
✅ Application password yenileme
✅ SSL sertifika kontrolü
✅ Security scan
✅ Performance audit
```

## 🎯 ÖNERİLEN WORKFLOW

### 1. Günlük Geliştirme
```bash
git checkout wordpress-integration
# Kod yaz
# Test et
git commit -m "Feature: new functionality"
```

### 2. Haftalık Deployment
```bash
# Test ortamında kapsamlı test
# Stable branch'e merge
# Production deployment
# Post-deployment verification
```

### 3. Acil Düzeltmeler
```bash
# Hotfix branch oluştur
git checkout -b hotfix/critical-fix
# Hızla düzelt
# Direkt stable'a merge
# Acil deployment
```

Bu strateji ile hem mevcut çalışan sisteminizi korur, hem de güvenli bir şekilde yeni özellikler ekleyebilirsiniz.
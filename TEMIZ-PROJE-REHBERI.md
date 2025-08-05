# Temiz Proje Oluşturma Rehberi

## Yöntem 1: Yeni GitHub Deposu Oluşturma (Önerilen)

### Adım 1: Gerekli Dosyaları Belirleme
Aşağıdaki dosyalar projenin çalışması için gereklidir:

**Temel Konfigürasyon Dosyaları:**
- package.json
- next.config.mjs
- tsconfig.json
- tailwind.config.js
- postcss.config.js
- components.json
- .gitignore

**Kaynak Kod:**
- src/ klasörü (tüm içeriği)
- public/ klasörü (tüm içeriği)

**Ortam Dosyaları:**
- .env.local.example
- .env.cloud.example

**Yapı Scriptleri (Sadece Çalışanlar):**
- build-local.ps1
- build-wordpress.ps1
- build-local.bat
- build-wordpress.bat

**Temel Dokümantasyon:**
- README.md (yeni, temiz versiyon)
- POWERSHELL-KULLANIM-REHBERI.md

### Adım 2: Yeni GitHub Deposu Oluşturma

1. GitHub'da yeni bir depo oluşturun (örn: `spor-okulu-temiz`)
2. Yerel bilgisayarınızda yeni bir klasör oluşturun
3. Yukarıdaki dosyaları yeni klasöre kopyalayın
4. Yeni depoya yükleyin

### Adım 3: Temiz Klasör Yapısı

```
spor-okulu-temiz/
├── .env.local.example
├── .env.cloud.example
├── .gitignore
├── README.md
├── POWERSHELL-KULLANIM-REHBERI.md
├── package.json
├── next.config.mjs
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
├── components.json
├── build-local.ps1
├── build-local.bat
├── build-wordpress.ps1
├── build-wordpress.bat
├── public/
│   ├── favicon.ico
│   ├── manifest.json
│   ├── sw.js
│   ├── icons/
│   └── images/
└── src/
    ├── components/
    ├── hooks/
    ├── lib/
    ├── pages/
    ├── services/
    ├── styles/
    ├── types/
    ├── util/
    └── utils/
```

## Yöntem 2: Mevcut Depoda Büyük Temizlik

Mevcut depoda gereksiz dosyaları silmek için aşağıdaki dosyaları silebilirsiniz:

**Silinebilir Dokümantasyon Dosyaları:**
- ASSET-404-*.md
- BASIT-*.md
- CACHE-*.md
- CLOUD-*.md
- COMPLETE-*.md
- CROSS-ENV-*.md
- DEPLOYMENT-*.md
- FORM-*.md
- HIBRIT-*.md
- HIZLI-*.md
- KALICI-*.md
- KURULUM-*.md
- LOKAL-*.md
- NPM-PATH-*.md
- PARENT-*.md
- PLESK-*.md
- PNPM-*.md
- QUICK-*.md
- README-DEPLOYMENT.md
- README-FINAL.md
- ROUTING-*.md
- SAFE-*.md
- STANDALONE-*.md
- STATIC-*.md
- SUPABASE-*.md
- TANITIM-*.md
- TURKCE-*.md
- VELI-*.md
- VERİ-*.md
- WINDOWS-*.md
- WORDPRESS-*.md

**Silinebilir Konfigürasyon Dosyaları:**
- next.config.cloud.mjs
- next.config.local.mjs
- next.config.supabase.mjs
- next.config.wordpress.mjs
- package.wordpress.json
- vercel.cloud.json
- vercel.supabase.json
- jest.config.js
- jest.setup.js

**Silinebilir Script Dosyaları:**
- clean-cache.*
- clear-all-data.*
- start-local.*
- start-clean.*
- emergency-start.bat
- fix-dependencies.bat
- fix-npm-installation.bat
- diagnose-nodejs.bat
- test-npm-path.bat
- setup-cloud.js
- create-out-folder.js

**Silinebilir Test/Log Dosyaları:**
- src/__tests__/
- data/ klasörü (tüm içeriği)
- deployment-logs/
- pnpm-lock.yaml

**Silinebilir Diğer Dosyalar:**
- .htaccess
- send-form.php
- standalone-registration-form.html

## Önerilen Yöntem: Yeni Depo

Yeni bir GitHub deposu oluşturmanızı öneriyorum çünkü:
1. Tamamen temiz başlangıç
2. Eski dosyaların karışıklığı olmaz
3. Daha kolay yönetim
4. Daha hızlı klonlama/indirme

Hangi yöntemi tercih edersiniz?
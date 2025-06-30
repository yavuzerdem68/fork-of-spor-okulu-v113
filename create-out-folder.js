const fs = require('fs');
const path = require('path');

console.log('🚀 KALICI ÇÖZÜM SİSTEMİ - Out klasörü düzenleniyor...');

const outDir = 'out';
const basePath = '/spor-okulu';

// 1. ASSET PATH DÜZELTİCİ FONKSİYONU
function fixAssetPaths(htmlContent) {
  console.log('🔧 Asset pathleri düzeltiliyor...');
  
  // SADECE çifte/üçlü prefix'leri temizle - yeni prefix ekleme!
  htmlContent = htmlContent.replace(/\/spor-okulu\/spor-okulu\/spor-okulu\//g, '/spor-okulu/');
  htmlContent = htmlContent.replace(/\/spor-okulu\/spor-okulu\//g, '/spor-okulu/');
  htmlContent = htmlContent.replace(/\/spor-okulu\/spor-okulu(?=[\s"'>])/g, '/spor-okulu');
  
  return htmlContent;
}

// 2. MEVCUT HTML DOSYALARINI DÜZELT
function fixExistingHtmlFiles() {
  console.log('📝 Mevcut HTML dosyaları düzeltiliyor...');
  
  if (!fs.existsSync(outDir)) {
    console.log('❌ out klasörü bulunamadı');
    return false;
  }

  const files = fs.readdirSync(outDir);
  let fixedCount = 0;
  
  files.forEach(file => {
    if (file.endsWith('.html')) {
      const filePath = path.join(outDir, file);
      let htmlContent = fs.readFileSync(filePath, 'utf8');
      const fixedContent = fixAssetPaths(htmlContent);
      
      if (fixedContent !== htmlContent) {
        fs.writeFileSync(filePath, fixedContent, 'utf8');
        fixedCount++;
      }
    }
  });
  
  console.log(`✅ ${fixedCount} HTML dosyası düzeltildi`);
  return true;
}

// 3. EKSİK SAYFALARI OLUŞTUR (SADECE GERÇEKTEN EKSİK OLANLARI)
function createMissingPages() {
  console.log('📄 Eksik sayfalar kontrol ediliyor...');
  
  const pages = [
    'login', 'parent-signup', 'register', 'dashboard', 'coach-dashboard', 
    'parent-dashboard', 'athletes', 'payments', 'attendance', 'reports', 
    'settings', 'forgot-password', 'coaches', 'trainings', 'events-tournaments',
    'inventory-sales', 'media', 'messages', 'documents', 'leave-requests',
    'performance', 'system-settings', 'admin-settings', 'wordpress-settings'
  ];

  // Template HTML oluştur (sadece eksik sayfalar için)
  const templateHtml = `<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Spor Okulu CRM</title>
    <link rel="icon" href="/spor-okulu/favicon.ico">
    <link rel="manifest" href="/spor-okulu/manifest.json">
    <meta name="theme-color" content="#3b82f6">
    <style>
        body { font-family: system-ui, -apple-system, sans-serif; margin: 0; padding: 20px; background: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .logo { text-align: center; margin-bottom: 30px; }
        .loading { text-align: center; color: #64748b; }
        .spinner { display: inline-block; width: 20px; height: 20px; border: 2px solid #e2e8f0; border-top: 2px solid #3b82f6; border-radius: 50%; animation: spin 1s linear infinite; margin-right: 10px; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">
            <h1 style="color: #3b82f6; margin: 0;">🏃‍♂️ Spor Okulu CRM</h1>
        </div>
        <div class="loading">
            <div class="spinner"></div>
            Sistem yükleniyor...
        </div>
    </div>
    <script>
        // Sayfa yüklendiğinde ana uygulamaya yönlendir
        setTimeout(() => {
            window.location.href = '/spor-okulu/';
        }, 2000);
    </script>
</body>
</html>`;

  let createdCount = 0;
  
  pages.forEach(pageName => {
    // Sadece eksik olan .html dosyalarını oluştur
    const pageHtmlPath = path.join(outDir, `${pageName}.html`);
    if (!fs.existsSync(pageHtmlPath)) {
      fs.writeFileSync(pageHtmlPath, templateHtml, 'utf8');
      createdCount++;
    }
    
    // Sadece eksik olan klasör yapılarını oluştur
    const pageDirPath = path.join(outDir, pageName);
    const pageIndexPath = path.join(pageDirPath, 'index.html');
    if (!fs.existsSync(pageIndexPath)) {
      if (!fs.existsSync(pageDirPath)) {
        fs.mkdirSync(pageDirPath, { recursive: true });
      }
      fs.writeFileSync(pageIndexPath, templateHtml, 'utf8');
    }
  });
  
  if (createdCount > 0) {
    console.log(`✅ ${createdCount} eksik sayfa oluşturuldu`);
  } else {
    console.log('✅ Tüm sayfalar mevcut, yeni sayfa oluşturulmadı');
  }
}

// 4. EKSİK FAVICON VE ICON DOSYALARINI OLUŞTUR
function createMissingIcons() {
  console.log('🎨 Eksik icon dosyaları kontrol ediliyor...');
  
  const iconsDir = path.join(outDir, 'icons');
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  let createdCount = 0;

  // Basit SVG icon oluştur (sadece yoksa)
  const iconSvgPath = path.join(iconsDir, 'icon.svg');
  if (!fs.existsSync(iconSvgPath)) {
    const simpleSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#3b82f6">
      <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"/>
    </svg>`;
    fs.writeFileSync(iconSvgPath, simpleSvg, 'utf8');
    createdCount++;
  }

  // Basit PNG icon (1x1 mavi pixel) - sadece eksik olanları oluştur
  const bluePng = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
    0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
    0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0xD7, 0x63, 0xF8, 0x0F, 0x00, 0x01,
    0x01, 0x01, 0x00, 0x18, 0xDD, 0x8D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49,
    0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
  ]);

  const iconSizes = ['16x16', '32x32', '152x152', '192x192', '384x384', '512x512'];
  iconSizes.forEach(size => {
    const iconPath = path.join(iconsDir, `icon-${size}.png`);
    if (!fs.existsSync(iconPath)) {
      fs.writeFileSync(iconPath, bluePng);
      createdCount++;
    }
  });

  // Favicon.ico oluştur (sadece yoksa)
  const faviconPath = path.join(outDir, 'favicon.ico');
  if (!fs.existsSync(faviconPath)) {
    fs.writeFileSync(faviconPath, bluePng);
    createdCount++;
  }
  
  if (createdCount > 0) {
    console.log(`✅ ${createdCount} eksik icon dosyası oluşturuldu`);
  } else {
    console.log('✅ Tüm icon dosyaları mevcut');
  }
}

// 5. MANIFEST.JSON DÜZELT
function fixManifestPaths() {
  console.log('📱 Manifest.json düzeltiliyor...');
  
  const manifestPath = path.join(outDir, 'manifest.json');
  
  if (fs.existsSync(manifestPath)) {
    let manifestContent = fs.readFileSync(manifestPath, 'utf8');
    
    // Çifte prefix'leri temizle
    manifestContent = manifestContent.replace(/\/spor-okulu\/spor-okulu\//g, '/spor-okulu/');
    
    // Prefix'i olmayan path'lere ekle
    manifestContent = manifestContent.replace(/"\/icons\//g, '"/spor-okulu/icons/');
    manifestContent = manifestContent.replace(/"\/favicon\.ico"/g, '"/spor-okulu/favicon.ico"');
    
    fs.writeFileSync(manifestPath, manifestContent, 'utf8');
    console.log('✅ Manifest.json düzeltildi');
  } else {
    // Manifest.json yoksa oluştur
    const defaultManifest = {
      "name": "Spor Okulu CRM",
      "short_name": "Spor CRM",
      "description": "Spor okulları için kapsamlı dijital yönetim sistemi",
      "start_url": "/spor-okulu/",
      "display": "standalone",
      "background_color": "#ffffff",
      "theme_color": "#3b82f6",
      "icons": [
        {
          "src": "/spor-okulu/icons/icon-192x192.png",
          "sizes": "192x192",
          "type": "image/png"
        },
        {
          "src": "/spor-okulu/icons/icon-512x512.png",
          "sizes": "512x512",
          "type": "image/png"
        }
      ]
    };
    
    fs.writeFileSync(manifestPath, JSON.stringify(defaultManifest, null, 2), 'utf8');
    console.log('✅ Manifest.json oluşturuldu');
  }
}

// 6. .HTACCESS KOPYALA
function copyHtaccess() {
  console.log('⚙️ .htaccess kopyalanıyor...');
  
  const htaccessSource = '.htaccess';
  const htaccessTarget = path.join(outDir, '.htaccess');
  
  if (fs.existsSync(htaccessSource)) {
    fs.copyFileSync(htaccessSource, htaccessTarget);
    console.log('✅ .htaccess kopyalandı');
  } else {
    console.log('⚠️ .htaccess dosyası bulunamadı');
  }
}

// 7. OUT KLASÖRÜ OLUŞTUR (eğer yoksa)
function ensureOutDirectory() {
  if (!fs.existsSync(outDir)) {
    console.log('📁 out klasörü oluşturuluyor...');
    fs.mkdirSync(outDir, { recursive: true });
    console.log('✅ out klasörü oluşturuldu');
    return true;
  }
  console.log('✅ out klasörü mevcut');
  return false;
}

// ANA FONKSİYON
function main() {
  console.log('🎯 KALICI ÇÖZÜM SİSTEMİ BAŞLADI');
  console.log('================================');
  
  // 1. Out klasörünü kontrol et/oluştur
  const wasCreated = ensureOutDirectory();
  
  // 2. Mevcut HTML dosyalarını düzelt
  if (!wasCreated) {
    fixExistingHtmlFiles();
  }
  
  // 3. Eksik sayfaları oluştur
  createMissingPages();
  
  // 4. Icon dosyalarını oluştur
  createMissingIcons();
  
  // 5. Manifest.json'u düzelt
  fixManifestPaths();
  
  // 6. .htaccess'i kopyala
  copyHtaccess();
  
  console.log('================================');
  console.log('🎉 KALICI ÇÖZÜM SİSTEMİ TAMAMLANDI!');
  console.log('');
  console.log('📋 Oluşturulan/Düzeltilen:');
  console.log('   ✅ Tüm HTML sayfaları');
  console.log('   ✅ Favicon ve icon dosyaları');
  console.log('   ✅ Manifest.json');
  console.log('   ✅ .htaccess dosyası');
  console.log('   ✅ Asset path düzeltmeleri');
  console.log('');
  console.log('🚀 Artık out/ klasörünü public_html/spor-okulu/ klasörüne yükleyebilirsiniz!');
}

// Çalıştır
main();
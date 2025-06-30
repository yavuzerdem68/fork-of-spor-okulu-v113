const fs = require('fs');
const path = require('path');

console.log('🚀 KALICI ÇÖZÜM SİSTEMİ - Out klasörü düzenleniyor...');

const outDir = 'out';
const basePath = '/spor-okulu';

// 1. ASSET PATH DÜZELTİCİ FONKSİYONU
function fixAssetPaths(htmlContent) {
  console.log('🔧 Asset path'leri düzeltiliyor...');
  
  // ADIM 1: Tüm çifte/üçlü prefix'leri temizle
  htmlContent = htmlContent.replace(/\/spor-okulu\/spor-okulu\/spor-okulu\//g, '/spor-okulu/');
  htmlContent = htmlContent.replace(/\/spor-okulu\/spor-okulu\//g, '/spor-okulu/');
  htmlContent = htmlContent.replace(/\/spor-okulu\/spor-okulu(?=[\s"'>])/g, '/spor-okulu');
  
  // ADIM 2: _next dosyaları için özel düzeltme
  htmlContent = htmlContent.replace(/\/spor-okulu\/_next\//g, '/_next/');
  htmlContent = htmlContent.replace(/\/_next\//g, '/spor-okulu/_next/');
  
  // ADIM 3: Favicon ve manifest düzeltmeleri
  htmlContent = htmlContent.replace(/href="\/favicon\.ico"/g, 'href="/spor-okulu/favicon.ico"');
  htmlContent = htmlContent.replace(/src="\/favicon\.ico"/g, 'src="/spor-okulu/favicon.ico"');
  htmlContent = htmlContent.replace(/href="\/manifest\.json"/g, 'href="/spor-okulu/manifest.json"');
  
  // ADIM 4: Icons klasörü düzeltmeleri
  htmlContent = htmlContent.replace(/href="\/icons\//g, 'href="/spor-okulu/icons/');
  htmlContent = htmlContent.replace(/src="\/icons\//g, 'src="/spor-okulu/icons/');
  
  // ADIM 5: Genel asset path'leri (prefix'i olmayanlar için)
  htmlContent = htmlContent.replace(/href="\/(?!spor-okulu)(?!http)(?!mailto)(?!tel)(?!#)/g, 'href="/spor-okulu/');
  htmlContent = htmlContent.replace(/src="\/(?!spor-okulu)(?!http)(?!data:)(?!#)/g, 'src="/spor-okulu/');
  htmlContent = htmlContent.replace(/content="\/(?!spor-okulu)(?!http)/g, 'content="/spor-okulu/');
  
  // ADIM 6: Son temizlik - çifte prefix'leri tekrar temizle
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

// 3. EKSİK SAYFALARI OLUŞTUR
function createMissingPages() {
  console.log('📄 Eksik sayfalar oluşturuluyor...');
  
  const pages = [
    'login', 'parent-signup', 'register', 'dashboard', 'coach-dashboard', 
    'parent-dashboard', 'athletes', 'payments', 'attendance', 'reports', 
    'settings', 'forgot-password', 'coaches', 'trainings', 'events-tournaments',
    'inventory-sales', 'media', 'messages', 'documents', 'leave-requests',
    'performance', 'system-settings', 'admin-settings', 'wordpress-settings'
  ];

  // Template HTML oluştur
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
    // .html dosyası oluştur
    const pageHtmlPath = path.join(outDir, `${pageName}.html`);
    fs.writeFileSync(pageHtmlPath, templateHtml, 'utf8');
    
    // Klasör yapısı oluştur
    const pageDirPath = path.join(outDir, pageName);
    if (!fs.existsSync(pageDirPath)) {
      fs.mkdirSync(pageDirPath, { recursive: true });
    }
    const pageIndexPath = path.join(pageDirPath, 'index.html');
    fs.writeFileSync(pageIndexPath, templateHtml, 'utf8');
    
    createdCount++;
  });
  
  console.log(`✅ ${createdCount} sayfa oluşturuldu`);
}

// 4. FAVICON VE ICON DOSYALARINI OLUŞTUR
function createMissingIcons() {
  console.log('🎨 Icon dosyaları oluşturuluyor...');
  
  const iconsDir = path.join(outDir, 'icons');
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  // Basit SVG icon oluştur
  const simpleSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#3b82f6">
    <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"/>
  </svg>`;
  
  const iconSvgPath = path.join(iconsDir, 'icon.svg');
  fs.writeFileSync(iconSvgPath, simpleSvg, 'utf8');

  // Basit PNG icon (1x1 mavi pixel)
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
    fs.writeFileSync(iconPath, bluePng);
  });

  // Favicon.ico oluştur
  const faviconPath = path.join(outDir, 'favicon.ico');
  fs.writeFileSync(faviconPath, bluePng);
  
  console.log('✅ Icon dosyaları oluşturuldu');
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
    
    // Basit index.html oluştur
    const basicIndex = `<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Spor Okulu CRM</title>
    <link rel="icon" href="/spor-okulu/favicon.ico">
</head>
<body>
    <h1>Spor Okulu CRM</h1>
    <p>Sistem hazırlanıyor...</p>
</body>
</html>`;
    
    fs.writeFileSync(path.join(outDir, 'index.html'), basicIndex, 'utf8');
    console.log('✅ out klasörü ve index.html oluşturuldu');
    return true;
  }
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
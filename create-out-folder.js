const fs = require('fs');
const path = require('path');

const outDir = 'out';

function fixAssetPaths(htmlContent) {
  // 1. ÖNCE TÜM ÇİFTE PREFIX'LERİ TEMİZLE
  // Tüm çifte prefix durumlarını kapsamlı şekilde temizle
  htmlContent = htmlContent.replace(/\/spor-okulu\/spor-okulu\//g, '/spor-okulu/');
  htmlContent = htmlContent.replace(/\/spor-okulu\/spor-okulu(?=[\s"'>])/g, '/spor-okulu');
  htmlContent = htmlContent.replace(/"\/spor-okulu\/spor-okulu\//g, '"/spor-okulu/');
  htmlContent = htmlContent.replace(/"\/spor-okulu\/spor-okulu"/g, '"/spor-okulu"');
  htmlContent = htmlContent.replace(/='\/spor-okulu\/spor-okulu\//g, '="/spor-okulu/');
  htmlContent = htmlContent.replace(/='\/spor-okulu\/spor-okulu'/g, '="/spor-okulu"');
  htmlContent = htmlContent.replace(/content="\/spor-okulu\/spor-okulu\//g, 'content="/spor-okulu/');
  htmlContent = htmlContent.replace(/content='\/spor-okulu\/spor-okulu\//g, 'content="/spor-okulu/');
  
  // 2. _NEXT ASSET PATHS İÇİN ÖZEL DÜZELTME
  // Önce mevcut _next path'lerini temizle, sonra doğru prefix'i ekle
  htmlContent = htmlContent.replace(/\/spor-okulu\/_next\//g, '/_next/');
  htmlContent = htmlContent.replace(/\/_next\//g, '/spor-okulu/_next/');
  
  // 3. DİĞER ASSET PATH'LERİ DÜZELT
  // Sadece prefix'i olmayan path'lere ekle
  htmlContent = htmlContent.replace(/href="\/(?!spor-okulu)(?!http)(?!mailto)(?!tel)/g, 'href="/spor-okulu/');
  htmlContent = htmlContent.replace(/src="\/(?!spor-okulu)(?!http)(?!data:)/g, 'src="/spor-okulu/');
  htmlContent = htmlContent.replace(/content="\/(?!spor-okulu)(?!http)/g, 'content="/spor-okulu/');
  
  // 4. ÖZEL DOSYALAR İÇİN DÜZELTMELER
  // Manifest ve favicon - sadece prefix'i yoksa ekle
  htmlContent = htmlContent.replace(/href="\/manifest\.json"/g, 'href="/spor-okulu/manifest.json"');
  htmlContent = htmlContent.replace(/href="\/favicon\.ico"/g, 'href="/spor-okulu/favicon.ico"');
  htmlContent = htmlContent.replace(/src="\/favicon\.ico"/g, 'src="/spor-okulu/favicon.ico"');
  
  // Icons klasörü - sadece prefix'i yoksa ekle
  htmlContent = htmlContent.replace(/src="\/icons\//g, 'src="/spor-okulu/icons/');
  htmlContent = htmlContent.replace(/href="\/icons\//g, 'href="/spor-okulu/icons/');
  
  // 5. SON TEMİZLİK - ÇİFTE PREFIX'LERİ TEKRAR TEMİZLE
  htmlContent = htmlContent.replace(/\/spor-okulu\/spor-okulu\//g, '/spor-okulu/');
  htmlContent = htmlContent.replace(/\/spor-okulu\/spor-okulu(?=[\s"'>])/g, '/spor-okulu');
  
  // 6. ÜÇLÜ PREFIX'LERİ DE TEMİZLE (eğer varsa)
  htmlContent = htmlContent.replace(/\/spor-okulu\/spor-okulu\/spor-okulu\//g, '/spor-okulu/');
  
  return htmlContent;
}

// Fix existing HTML files in out directory
function fixExistingHtmlFiles() {
  if (!fs.existsSync(outDir)) {
    console.log('❌ out klasörü bulunamadı, önce build yapın');
    return;
  }

  const files = fs.readdirSync(outDir);
  
  files.forEach(file => {
    if (file.endsWith('.html')) {
      const filePath = path.join(outDir, file);
      let htmlContent = fs.readFileSync(filePath, 'utf8');
      const fixedContent = fixAssetPaths(htmlContent);
      
      if (fixedContent !== htmlContent) {
        fs.writeFileSync(filePath, fixedContent, 'utf8');
        console.log(`✅ ${file} asset yolları düzeltildi`);
      }
    }
  });
}

// Eksik HTML sayfalarını oluştur
function createMissingPages() {
  const pages = [
    'login',
    'parent-signup',
    'register',
    'dashboard',
    'coach-dashboard',
    'parent-dashboard',
    'athletes',
    'payments',
    'attendance',
    'reports',
    'settings',
    'forgot-password',
    'coaches',
    'trainings',
    'events-tournaments',
    'inventory-sales',
    'media',
    'messages',
    'documents',
    'leave-requests',
    'performance',
    'system-settings',
    'admin-settings',
    'wordpress-settings'
  ];

  // Ana index.html dosyasını template olarak kullan
  const indexPath = path.join(outDir, 'index.html');
  if (!fs.existsSync(indexPath)) {
    console.log('❌ index.html bulunamadı, önce build yapın');
    return;
  }

  let indexContent = fs.readFileSync(indexPath, 'utf8');
  
  // Asset path'lerini düzelt
  indexContent = fixAssetPaths(indexContent);
  
  pages.forEach(pageName => {
    // Hem .html dosyası hem de klasör/index.html yapısı oluştur
    const pageHtmlPath = path.join(outDir, `${pageName}.html`);
    const pageDirPath = path.join(outDir, pageName);
    const pageIndexPath = path.join(pageDirPath, 'index.html');
    
    // .html dosyası oluştur
    fs.writeFileSync(pageHtmlPath, indexContent, 'utf8');
    console.log(`✅ ${pageName}.html oluşturuldu/güncellendi`);
    
    // Klasör yapısı oluştur
    if (!fs.existsSync(pageDirPath)) {
      fs.mkdirSync(pageDirPath, { recursive: true });
    }
    fs.writeFileSync(pageIndexPath, indexContent, 'utf8');
    console.log(`✅ ${pageName}/index.html oluşturuldu/güncellendi`);
  });
}

// Copy .htaccess file
function copyHtaccess() {
  const htaccessSource = '.htaccess';
  const htaccessTarget = path.join(outDir, '.htaccess');
  
  if (fs.existsSync(htaccessSource)) {
    fs.copyFileSync(htaccessSource, htaccessTarget);
    console.log('✅ .htaccess dosyası kopyalandı');
  } else {
    console.log('⚠️ .htaccess dosyası bulunamadı');
  }
}

// Create missing icon files
function createMissingIcons() {
  const iconsDir = path.join(outDir, 'icons');
  
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
    console.log('✅ icons klasörü oluşturuldu');
  }

  // Copy icon.svg from public/icons if exists
  const sourceIconSvg = path.join('public', 'icons', 'icon.svg');
  const targetIconSvg = path.join(iconsDir, 'icon.svg');
  
  if (fs.existsSync(sourceIconSvg)) {
    fs.copyFileSync(sourceIconSvg, targetIconSvg);
    console.log('✅ icon.svg kopyalandı');
  } else {
    // Create a simple SVG icon if source doesn't exist
    const simpleSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 0 1-8 0"/>
    </svg>`;
    fs.writeFileSync(targetIconSvg, simpleSvg, 'utf8');
    console.log('✅ icon.svg oluşturuldu (varsayılan)');
  }

  // Create simple placeholder icons (1x1 transparent PNG)
  const transparentPng = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
    0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, 0x89, 0x00, 0x00, 0x00,
    0x0B, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
    0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49,
    0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
  ]);

  const iconSizes = ['16x16', '32x32', '152x152', '192x192', '384x384', '512x512'];
  
  iconSizes.forEach(size => {
    const iconPath = path.join(iconsDir, `icon-${size}.png`);
    if (!fs.existsSync(iconPath)) {
      fs.writeFileSync(iconPath, transparentPng);
      console.log(`✅ icon-${size}.png oluşturuldu`);
    }
  });

  // Copy favicon.ico from public if exists, otherwise create placeholder
  const sourceFavicon = path.join('public', 'favicon.ico');
  const targetFavicon = path.join(outDir, 'favicon.ico');
  
  if (fs.existsSync(sourceFavicon)) {
    fs.copyFileSync(sourceFavicon, targetFavicon);
    console.log('✅ favicon.ico kopyalandı');
  } else if (!fs.existsSync(targetFavicon)) {
    fs.writeFileSync(targetFavicon, transparentPng);
    console.log('✅ favicon.ico oluşturuldu (placeholder)');
  }
}

// Fix manifest.json paths
function fixManifestPaths() {
  const manifestPath = path.join(outDir, 'manifest.json');
  
  if (fs.existsSync(manifestPath)) {
    let manifestContent = fs.readFileSync(manifestPath, 'utf8');
    
    // Önce çifte prefix'leri temizle
    manifestContent = manifestContent.replace(/\/spor-okulu\/spor-okulu\//g, '/spor-okulu/');
    
    // Eğer prefix yoksa ekle, varsa dokunma
    manifestContent = manifestContent.replace(/"\/icons\//g, '"/spor-okulu/icons/');
    manifestContent = manifestContent.replace(/"\/favicon\.ico"/g, '"/spor-okulu/favicon.ico"');
    
    // Son kontrol - çifte prefix'leri tekrar temizle
    manifestContent = manifestContent.replace(/\/spor-okulu\/spor-okulu\//g, '/spor-okulu/');
    
    fs.writeFileSync(manifestPath, manifestContent, 'utf8');
    console.log('✅ manifest.json yolları düzeltildi');
  }
}

// Yardımcı fonksiyonlar
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const files = fs.readdirSync(src);
  files.forEach(file => {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);
    
    if (fs.statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
}

function copyServerPages(serverDir, outDir) {
  if (!fs.existsSync(serverDir)) return;
  
  const files = fs.readdirSync(serverDir);
  
  files.forEach(file => {
    if (file.endsWith('.html')) {
      const srcPath = path.join(serverDir, file);
      const destPath = path.join(outDir, file);
      fs.copyFileSync(srcPath, destPath);
    }
  });
}

// Ana fonksiyon
console.log('🚀 out klasörü düzenleniyor...');

// Önce .next klasörünü kontrol et, sonra out klasörünü oluştur
const nextDir = '.next';
if (fs.existsSync(nextDir) && !fs.existsSync(outDir)) {
  console.log('📁 .next klasörü bulundu, out klasörü oluşturuluyor...');
  
  // Out klasörünü oluştur
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  
  // Static dosyaları kopyala
  const nextStaticDir = path.join(nextDir, 'static');
  if (fs.existsSync(nextStaticDir)) {
    const outStaticDir = path.join(outDir, '_next', 'static');
    fs.mkdirSync(path.dirname(outStaticDir), { recursive: true });
    copyDir(nextStaticDir, outStaticDir);
    console.log('✅ Static dosyalar kopyalandı');
  }
  
  // Server pages'i HTML olarak kopyala
  const nextServerDir = path.join(nextDir, 'server', 'pages');
  if (fs.existsSync(nextServerDir)) {
    copyServerPages(nextServerDir, outDir);
    console.log('✅ HTML sayfalar kopyalandı');
  }
  
  // Public klasörünü kopyala
  const publicDir = 'public';
  if (fs.existsSync(publicDir)) {
    copyDir(publicDir, outDir);
    console.log('✅ Public dosyalar kopyalandı');
  }
  
  // Basit bir index.html oluştur eğer yoksa
  const indexPath = path.join(outDir, 'index.html');
  if (!fs.existsSync(indexPath)) {
    const basicHtml = `<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Spor Okulu CRM</title>
    <link rel="manifest" href="/spor-okulu/manifest.json">
    <link rel="icon" href="/spor-okulu/favicon.ico">
</head>
<body>
    <div id="__next">
        <h1>Spor Okulu CRM</h1>
        <p>Sistem yükleniyor...</p>
    </div>
    <script src="/spor-okulu/_next/static/chunks/main.js"></script>
</body>
</html>`;
    fs.writeFileSync(indexPath, basicHtml, 'utf8');
    console.log('✅ index.html oluşturuldu');
  }
}

if (!fs.existsSync(outDir)) {
  console.log('❌ out klasörü bulunamadı. Manuel olarak oluşturuluyor...');
  fs.mkdirSync(outDir, { recursive: true });
  
  // Basit bir index.html oluştur
  const basicHtml = `<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Spor Okulu CRM</title>
    <link rel="manifest" href="/spor-okulu/manifest.json">
    <link rel="icon" href="/spor-okulu/favicon.ico">
</head>
<body>
    <div id="__next">
        <h1>Spor Okulu CRM</h1>
        <p>Sistem yükleniyor...</p>
    </div>
</body>
</html>`;
  fs.writeFileSync(path.join(outDir, 'index.html'), basicHtml, 'utf8');
  console.log('✅ out klasörü ve index.html oluşturuldu');
}

fixExistingHtmlFiles();
createMissingPages();
copyHtaccess();
createMissingIcons();
fixManifestPaths();

console.log('✅ out klasörü başarıyla düzenlendi!');
console.log('📁 Oluşturulan dosyalar:');
console.log('   - Tüm sayfa HTML dosyaları');
console.log('   - .htaccess dosyası');
console.log('   - Eksik icon dosyaları');
console.log('   - manifest.json yolları düzeltildi');
console.log('   - Asset yolları düzeltildi');
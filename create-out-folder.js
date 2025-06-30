const fs = require('fs');
const path = require('path');

const outDir = 'out';

function fixAssetPaths(htmlContent) {
  // Önce tüm çifte prefix'leri temizle - daha kapsamlı regex'ler
  htmlContent = htmlContent.replace(/\/spor-okulu\/spor-okulu\//g, '/spor-okulu/');
  htmlContent = htmlContent.replace(/\/spor-okulu\/spor-okulu(?=[\s"'>])/g, '/spor-okulu');
  htmlContent = htmlContent.replace(/"\/spor-okulu\/spor-okulu\//g, '"/spor-okulu/');
  htmlContent = htmlContent.replace(/"\/spor-okulu\/spor-okulu"/g, '"/spor-okulu"');
  htmlContent = htmlContent.replace(/='\/spor-okulu\/spor-okulu\//g, '="/spor-okulu/');
  htmlContent = htmlContent.replace(/='\/spor-okulu\/spor-okulu'/g, '="/spor-okulu"');
  
  // Manifest içindeki çifte prefix'leri de temizle
  htmlContent = htmlContent.replace(/content="\/spor-okulu\/spor-okulu\//g, 'content="/spor-okulu/');
  htmlContent = htmlContent.replace(/content='\/spor-okulu\/spor-okulu\//g, 'content="/spor-okulu/');
  
  // _next asset paths için özel düzeltme - lookbehind olmadan
  htmlContent = htmlContent.replace(/\/_next\//g, '/spor-okulu/_next/');
  // Çifte prefix'i tekrar temizle
  htmlContent = htmlContent.replace(/\/spor-okulu\/spor-okulu\/_next\//g, '/spor-okulu/_next/');
  
  // Diğer asset path'leri düzelt (prefix yoksa ekle)
  htmlContent = htmlContent.replace(/href="\/(?!spor-okulu)(?!http)/g, 'href="/spor-okulu/');
  htmlContent = htmlContent.replace(/src="\/(?!spor-okulu)(?!http)/g, 'src="/spor-okulu/');
  htmlContent = htmlContent.replace(/content="\/(?!spor-okulu)(?!http)/g, 'content="/spor-okulu/');
  
  // Manifest ve favicon için özel düzeltmeler
  htmlContent = htmlContent.replace(/\/manifest\.json/g, '/spor-okulu/manifest.json');
  htmlContent = htmlContent.replace(/\/favicon\.ico/g, '/spor-okulu/favicon.ico');
  
  // Icon path'leri için özel düzeltme
  htmlContent = htmlContent.replace(/\/icons\//g, '/spor-okulu/icons/');
  
  // Son temizlik - çifte prefix'leri tekrar temizle
  htmlContent = htmlContent.replace(/\/spor-okulu\/spor-okulu\//g, '/spor-okulu/');
  htmlContent = htmlContent.replace(/\/spor-okulu\/spor-okulu(?=[\s"'>])/g, '/spor-okulu');
  
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
    
    // Fix icon paths in manifest
    manifestContent = manifestContent.replace(/\/icons\//g, '/spor-okulu/icons/');
    manifestContent = manifestContent.replace(/\/favicon\.ico/g, '/spor-okulu/favicon.ico');
    
    fs.writeFileSync(manifestPath, manifestContent, 'utf8');
    console.log('✅ manifest.json yolları düzeltildi');
  }
}

// Ana fonksiyon
console.log('🚀 out klasörü düzenleniyor...');

if (!fs.existsSync(outDir)) {
  console.log('❌ out klasörü bulunamadı. Önce "npm run build" komutunu çalıştırın.');
  process.exit(1);
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
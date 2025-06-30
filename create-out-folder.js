const fs = require('fs');
const path = require('path');

const outDir = 'out';

function fixAssetPaths(htmlContent) {
  // Fix _next static asset paths - sadece tek prefix ekle
  htmlContent = htmlContent.replace(/\/_next\//g, '/spor-okulu/_next/');
  
  // Çifte prefix'i düzelt
  htmlContent = htmlContent.replace(/\/spor-okulu\/spor-okulu\//g, '/spor-okulu/');
  
  // Fix other asset paths that don't already have the prefix
  htmlContent = htmlContent.replace(/href="\/(?!spor-okulu)/g, 'href="/spor-okulu/');
  htmlContent = htmlContent.replace(/src="\/(?!spor-okulu)/g, 'src="/spor-okulu/');
  
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
  
  pages.forEach(pageName => {
    const pageHtmlPath = path.join(outDir, `${pageName}.html`);
    
    // Her zaman yeniden oluştur (güncel index.html içeriğini kullanmak için)
    fs.writeFileSync(pageHtmlPath, indexContent, 'utf8');
    console.log(`✅ ${pageName}.html oluşturuldu/güncellendi`);
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

  // Create favicon.ico if missing
  const faviconPath = path.join(outDir, 'favicon.ico');
  if (!fs.existsSync(faviconPath)) {
    fs.writeFileSync(faviconPath, transparentPng);
    console.log('✅ favicon.ico oluşturuldu');
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
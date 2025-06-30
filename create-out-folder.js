const fs = require('fs');
const path = require('path');

const outDir = 'out';

function fixAssetPaths(htmlContent) {
  // Fix _next static asset paths
  htmlContent = htmlContent.replace(/\/_next\//g, '/spor-okulu/_next/');
  
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

// Ana fonksiyon
console.log('🚀 out klasörü düzenleniyor...');

if (!fs.existsSync(outDir)) {
  console.log('❌ out klasörü bulunamadı. Önce "npm run build" komutunu çalıştırın.');
  process.exit(1);
}

fixExistingHtmlFiles();
createMissingPages();
copyHtaccess();

console.log('✅ out klasörü başarıyla düzenlendi!');
console.log('📁 Oluşturulan dosyalar:');
console.log('   - Tüm sayfa HTML dosyaları');
console.log('   - .htaccess dosyası');
console.log('   - Asset yolları düzeltildi');
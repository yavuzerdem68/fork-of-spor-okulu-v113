const fs = require('fs');
const path = require('path');

// out klasörünü oluştur
if (!fs.existsSync('out')) {
  fs.mkdirSync('out');
  console.log('✅ out klasörü oluşturuldu');
}

// .next/server/pages içindeki HTML dosyalarını kopyala ve asset yollarını düzelt
const serverPagesDir = '.next/server/pages';
const outDir = 'out';

function fixAssetPaths(htmlContent) {
  // Fix _next static asset paths
  htmlContent = htmlContent.replace(/\/_next\//g, '/spor-okulu/_next/');
  
  // Fix other asset paths that don't already have the prefix
  htmlContent = htmlContent.replace(/href="\/(?!spor-okulu)/g, 'href="/spor-okulu/');
  htmlContent = htmlContent.replace(/src="\/(?!spor-okulu)/g, 'src="/spor-okulu/');
  
  return htmlContent;
}

function copyHtmlFiles(sourceDir, targetDir) {
  if (!fs.existsSync(sourceDir)) {
    console.log('❌ .next/server/pages klasörü bulunamadı');
    return;
  }

  const files = fs.readdirSync(sourceDir);
  
  files.forEach(file => {
    const sourcePath = path.join(sourceDir, file);
    const stat = fs.statSync(sourcePath);
    
    if (stat.isDirectory()) {
      // Alt klasörleri de kopyala
      const targetSubDir = path.join(targetDir, file);
      if (!fs.existsSync(targetSubDir)) {
        fs.mkdirSync(targetSubDir, { recursive: true });
      }
      copyHtmlFiles(sourcePath, targetSubDir);
    } else if (file.endsWith('.html')) {
      const targetPath = path.join(targetDir, file);
      
      // HTML içeriğini oku ve asset yollarını düzelt
      let htmlContent = fs.readFileSync(sourcePath, 'utf8');
      htmlContent = fixAssetPaths(htmlContent);
      
      // Düzeltilmiş içeriği yaz
      fs.writeFileSync(targetPath, htmlContent, 'utf8');
      console.log(`✅ ${file} kopyalandı ve asset yolları düzeltildi`);
    }
  });
}

// Static dosyaları kopyala
function copyStaticFiles() {
  const staticSource = '.next/static';
  const staticTarget = 'out/_next/static';
  
  if (fs.existsSync(staticSource)) {
    if (!fs.existsSync('out/_next')) {
      fs.mkdirSync('out/_next', { recursive: true });
    }
    
    // Recursive copy function
    function copyRecursive(src, dest) {
      const stat = fs.statSync(src);
      if (stat.isDirectory()) {
        if (!fs.existsSync(dest)) {
          fs.mkdirSync(dest, { recursive: true });
        }
        const files = fs.readdirSync(src);
        files.forEach(file => {
          copyRecursive(path.join(src, file), path.join(dest, file));
        });
      } else {
        fs.copyFileSync(src, dest);
      }
    }
    
    copyRecursive(staticSource, staticTarget);
    console.log('✅ Static dosyalar kopyalandı');
  }
}

// Public dosyalarını kopyala
function copyPublicFiles() {
  const publicSource = 'public';
  const publicTarget = 'out';
  
  if (fs.existsSync(publicSource)) {
    const files = fs.readdirSync(publicSource);
    files.forEach(file => {
      const sourcePath = path.join(publicSource, file);
      const targetPath = path.join(publicTarget, file);
      const stat = fs.statSync(sourcePath);
      
      if (stat.isDirectory()) {
        if (!fs.existsSync(targetPath)) {
          fs.mkdirSync(targetPath, { recursive: true });
        }
        // Recursive copy for directories
        function copyDir(src, dest) {
          const files = fs.readdirSync(src);
          files.forEach(f => {
            const srcPath = path.join(src, f);
            const destPath = path.join(dest, f);
            const stat = fs.statSync(srcPath);
            if (stat.isDirectory()) {
              if (!fs.existsSync(destPath)) {
                fs.mkdirSync(destPath, { recursive: true });
              }
              copyDir(srcPath, destPath);
            } else {
              fs.copyFileSync(srcPath, destPath);
            }
          });
        }
        copyDir(sourcePath, targetPath);
      } else {
        fs.copyFileSync(sourcePath, targetPath);
      }
    });
    console.log('✅ Public dosyalar kopyalandı');
  }
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
    'forgot-password'
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
    
    if (!fs.existsSync(pageHtmlPath)) {
      // Her sayfa için aynı HTML içeriğini kullan (SPA routing için)
      fs.writeFileSync(pageHtmlPath, indexContent, 'utf8');
      console.log(`✅ ${pageName}.html oluşturuldu`);
    }
  });
}

// Ana fonksiyon
console.log('🚀 out klasörü oluşturuluyor...');
copyHtmlFiles(serverPagesDir, outDir);
copyStaticFiles();
copyPublicFiles();
createMissingPages();
console.log('✅ out klasörü başarıyla oluşturuldu!');
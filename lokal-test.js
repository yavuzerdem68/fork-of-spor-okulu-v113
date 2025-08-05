// Lokal Çalışma Testi
console.log('=== LOKAL ÇALIŞMA TESTİ ===');

// Node.js versiyonu
console.log('Node.js versiyonu:', process.version);

// Gerekli modülleri test et
const fs = require('fs');
const path = require('path');

// Package.json kontrolü
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  console.log('✓ package.json okundu');
  console.log('✓ Proje adı:', packageJson.name);
  console.log('✓ Next.js versiyonu:', packageJson.dependencies.next);
} catch (error) {
  console.log('✗ package.json okuma hatası:', error.message);
}

// Next.js config kontrolü
try {
  if (fs.existsSync('next.config.mjs')) {
    console.log('✓ next.config.mjs mevcut');
  } else {
    console.log('✗ next.config.mjs bulunamadı');
  }
} catch (error) {
  console.log('✗ next.config.mjs kontrol hatası:', error.message);
}

// .env.local kontrolü
try {
  if (fs.existsSync('.env.local')) {
    console.log('✓ .env.local mevcut');
  } else {
    console.log('! .env.local bulunamadı (opsiyonel)');
  }
} catch (error) {
  console.log('✗ .env.local kontrol hatası:', error.message);
}

// src klasörü kontrolü
try {
  if (fs.existsSync('src')) {
    console.log('✓ src klasörü mevcut');
    
    // pages kontrolü
    if (fs.existsSync('src/pages')) {
      console.log('✓ src/pages mevcut');
      
      // index.tsx kontrolü
      if (fs.existsSync('src/pages/index.tsx')) {
        console.log('✓ src/pages/index.tsx mevcut');
      } else {
        console.log('✗ src/pages/index.tsx bulunamadı');
      }
    } else {
      console.log('✗ src/pages bulunamadı');
    }
  } else {
    console.log('✗ src klasörü bulunamadı');
  }
} catch (error) {
  console.log('✗ src klasörü kontrol hatası:', error.message);
}

// node_modules kontrolü
try {
  if (fs.existsSync('node_modules')) {
    console.log('✓ node_modules mevcut');
    
    // Next.js kurulu mu?
    if (fs.existsSync('node_modules/next')) {
      console.log('✓ Next.js kurulu');
    } else {
      console.log('✗ Next.js kurulu değil');
    }
    
    // React kurulu mu?
    if (fs.existsSync('node_modules/react')) {
      console.log('✓ React kurulu');
    } else {
      console.log('✗ React kurulu değil');
    }
  } else {
    console.log('✗ node_modules bulunamadı - npm install çalıştırın');
  }
} catch (error) {
  console.log('✗ node_modules kontrol hatası:', error.message);
}

// .next klasörü kontrolü (build cache)
try {
  if (fs.existsSync('.next')) {
    console.log('! .next klasörü mevcut (eski build cache)');
  } else {
    console.log('✓ .next klasörü yok (temiz)');
  }
} catch (error) {
  console.log('✗ .next kontrol hatası:', error.message);
}

console.log('\n=== ÖNERİLER ===');
console.log('1. npm install çalıştırın');
console.log('2. npm run clean çalıştırın (cache temizleme)');
console.log('3. npm run dev çalıştırın');
console.log('4. http://localhost:3000 adresini açın');

console.log('\n=== HATA DURUMUNDA ===');
console.log('1. Node.js 20.x kurulu olduğundan emin olun');
console.log('2. npm cache clean --force');
console.log('3. node_modules ve .next klasörlerini silin');
console.log('4. npm install tekrar çalıştırın');
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 SportsCRM Cloud Deployment Setup');
console.log('=====================================\n');

// Check if we're in the right directory
if (!fs.existsSync('package.json')) {
  console.error('❌ Bu script proje kök dizininde çalıştırılmalıdır!');
  process.exit(1);
}

// Copy cloud configuration files
const filesToCopy = [
  {
    src: 'next.config.cloud.mjs',
    dest: 'next.config.mjs',
    description: 'Next.js cloud configuration'
  },
  {
    src: 'vercel.cloud.json',
    dest: 'vercel.json',
    description: 'Vercel deployment configuration'
  },
  {
    src: '.env.cloud.example',
    dest: '.env.local.example',
    description: 'Environment variables example'
  }
];

console.log('📁 Konfigürasyon dosyaları kopyalanıyor...\n');

filesToCopy.forEach(file => {
  try {
    if (fs.existsSync(file.src)) {
      fs.copyFileSync(file.src, file.dest);
      console.log(`✅ ${file.description} -> ${file.dest}`);
    } else {
      console.log(`⚠️  ${file.src} bulunamadı, atlanıyor...`);
    }
  } catch (error) {
    console.error(`❌ ${file.src} kopyalanırken hata: ${error.message}`);
  }
});

console.log('\n🔧 Kurulum tamamlandı!\n');

console.log('📋 Sonraki adımlar:');
console.log('1. .env.local.example dosyasını .env.local olarak kopyalayın');
console.log('2. .env.local dosyasındaki Supabase bilgilerini doldurun');
console.log('3. npm run build:cloud komutu ile test edin');
console.log('4. Vercel\'e deploy etmek için: npm run deploy:vercel\n');

console.log('📖 Detaylı rehber için CLOUD-DEPLOYMENT-GUIDE.md dosyasını okuyun');

// Check if .env.local exists
if (!fs.existsSync('.env.local')) {
  console.log('\n⚠️  .env.local dosyası bulunamadı!');
  console.log('Lütfen .env.cloud.example dosyasını .env.local olarak kopyalayın ve Supabase bilgilerinizi girin.');
}
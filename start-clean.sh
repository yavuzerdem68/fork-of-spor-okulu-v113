#!/bin/bash

echo "================================"
echo "   G7 SPOR OKULU - TEMİZ BAŞLATMA"
echo "================================"
echo

echo "Temizlik yapılıyor..."
rm -rf .next
rm -rf node_modules

echo
echo "Bağımlılıklar yükleniyor..."
npm install

echo
echo "Sunucu başlatılıyor..."
echo
echo "Tarayıcınızda şu adresi açın: http://localhost:3000"
echo "Giriş bilgileri:"
echo "  Email: yavuz@g7spor.org"
echo "  Şifre: 444125yA/"
echo
echo "Sunucuyu durdurmak için Ctrl+C basın"
echo

npm run dev
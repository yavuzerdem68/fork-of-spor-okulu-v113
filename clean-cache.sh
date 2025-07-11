#!/bin/bash

echo "================================"
echo "Next.js Cache Temizleme"
echo "================================"
echo

echo "Cache dosyaları temizleniyor..."

# .next klasörünü sil
if [ -d ".next" ]; then
    echo ".next klasörü siliniyor..."
    rm -rf .next
    echo ".next klasörü silindi."
else
    echo ".next klasörü bulunamadı."
fi

# node_modules/.cache klasörünü sil
if [ -d "node_modules/.cache" ]; then
    echo "node_modules/.cache klasörü siliniyor..."
    rm -rf node_modules/.cache
    echo "node_modules/.cache klasörü silindi."
else
    echo "node_modules/.cache klasörü bulunamadı."
fi

echo
echo "================================"
echo "Cache temizleme tamamlandı!"
echo "================================"
echo
echo "Şimdi aşağıdaki komutu çalıştırın:"
echo "npm run dev:local"
echo
echo "veya start-local.sh dosyasını çalıştırın"
echo

read -p "Devam etmek için Enter'a basın..."
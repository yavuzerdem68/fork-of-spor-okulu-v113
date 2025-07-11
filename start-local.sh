#!/bin/bash

echo "================================"
echo "Spor Okulu CRM - Lokal Başlatma"
echo "================================"
echo

# Node.js kontrolü
echo "Node.js versiyonu kontrol ediliyor..."
if ! command -v node &> /dev/null; then
    echo "HATA: Node.js bulunamadı! Lütfen Node.js 20.x yükleyin."
    echo "İndirme linki: https://nodejs.org/"
    exit 1
fi

echo "Node.js bulundu: $(node --version)"

# Paket yöneticisi kontrolü
echo
echo "Paket yöneticisi kontrol ediliyor..."

# Önce pnpm var mı kontrol et
if command -v pnpm &> /dev/null; then
    echo "PNPM bulundu: $(pnpm --version)"
    PACKAGE_MANAGER="pnpm"
else
    # pnpm yoksa npm ile yükle
    echo "PNPM bulunamadı, otomatik yükleniyor..."
    if npm install -g pnpm &> /dev/null; then
        echo "PNPM başarıyla yüklendi!"
        echo "PNPM versiyonu: $(pnpm --version)"
        PACKAGE_MANAGER="pnpm"
    else
        # pnpm yüklenemezse npm kullan
        echo "PNPM yüklenemedi, NPM kullanılacak..."
        if ! command -v npm &> /dev/null; then
            echo "HATA: NPM de bulunamadı! Node.js kurulumunu kontrol edin."
            exit 1
        fi
        echo "NPM bulundu: $(npm --version)"
        PACKAGE_MANAGER="npm"
    fi
fi

# .env.local dosyası kontrolü
echo
echo "Çevre değişkenleri kontrol ediliyor..."
if [ ! -f ".env.local" ]; then
    echo ".env.local dosyası bulunamadı!"
    if [ -f ".env.local.example" ]; then
        echo ".env.local.example dosyasından kopyalanıyor..."
        cp ".env.local.example" ".env.local"
        echo ".env.local dosyası oluşturuldu!"
        echo "Lütfen .env.local dosyasını düzenleyip kendi ayarlarınızı girin."
    else
        echo "UYARI: .env.local.example dosyası bulunamadı!"
        echo "Lütfen .env.local dosyasını manuel olarak oluşturun."
    fi
fi

# node_modules kontrolü
echo
echo "Bağımlılıklar kontrol ediliyor..."
if [ ! -d "node_modules" ]; then
    echo "node_modules bulunamadı, bağımlılıklar yükleniyor..."
    $PACKAGE_MANAGER install
    if [ $? -ne 0 ]; then
        echo "HATA: Bağımlılıklar yüklenemedi!"
        exit 1
    fi
else
    echo "Bağımlılıklar mevcut."
fi

# Uygulamayı başlat
echo
echo "================================"
echo "Uygulama başlatılıyor..."
echo "Tarayıcınızda http://localhost:3000 adresine gidin"
echo "Durdurmak için Ctrl+C basın"
echo "================================"
echo

$PACKAGE_MANAGER run dev:local-unix
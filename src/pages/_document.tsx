import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="tr">
      <Head>
        {/* PWA Meta Tags */}
        <meta name="application-name" content="Spor CRM" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Spor CRM" />
        <meta name="description" content="Spor okulları için kapsamlı dijital yönetim sistemi. Sporcu kayıtları, ödeme takibi, yoklama, fatura oluşturma ve daha fazlası." />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/icons/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#3b82f6" />

        {/* Favicon - En önemli */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="shortcut icon" href="/favicon.ico" />
        
        {/* PWA Icons */}
        <link rel="apple-touch-icon" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-16x16.png" />
        <link rel="mask-icon" href="/icons/icon.svg" color="#3b82f6" />
        
        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* PWA Splash Screens */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Spor Okulu CRM - Türkiye'nin En Gelişmiş Spor Okulu Yönetim Sistemi" />
        <meta property="og:description" content="Spor okulları için kapsamlı dijital yönetim sistemi. %90 zaman tasarrufu, otomatik faturalama, akıllı banka eşleştirme." />
        <meta property="og:site_name" content="Spor CRM" />
        <meta property="og:url" content="https://localhost:3000/" />
        <meta property="og:image" content="/icons/icon-512x512.png" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Spor Okulu CRM" />
        <meta name="twitter:description" content="Spor okulları için kapsamlı dijital yönetim sistemi" />
        <meta name="twitter:image" content="/icons/icon-512x512.png" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
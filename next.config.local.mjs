/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  // Lokal geliştirme için static export'u kaldırıyoruz
  // output: 'export', // Bu satırı kaldırdık
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  images: {
    unoptimized: true,
    domains: ["assets.co.dev", "images.unsplash.com", "www.g7spor.org", "localhost"],
  },
  // Lokal geliştirme için basePath ve assetPrefix'i kaldırıyoruz
  // assetPrefix: '/spor-okulu', // Bu satırı kaldırdık
  // basePath: '/spor-okulu', // Bu satırı kaldırdık
  
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  
  env: {
    // Lokal WordPress kurulumu için URL'leri güncelleyebilirsiniz
    WORDPRESS_API_URL: process.env.NEXT_PUBLIC_WORDPRESS_URL ? `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wp/v2` : 'http://localhost/wordpress/wp-json/wp/v2',
    WORDPRESS_SITE_URL: process.env.NEXT_PUBLIC_WORDPRESS_URL || 'http://localhost/wordpress',
    NEXT_PUBLIC_BASE_PATH: '', // Lokal için boş
  },
  
  publicRuntimeConfig: {
    basePath: '', // Lokal için boş
  }
};

export default nextConfig;
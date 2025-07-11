/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  // Masaüstü sürümü - API routes kullanabilmek için export kapalı
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  images: {
    unoptimized: true,
    domains: ["assets.co.dev", "images.unsplash.com", "localhost"],
  },
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },

  env: {
    // Masaüstü sürümü - localStorage tabanlı
    NEXT_PUBLIC_BASE_PATH: '',
    NEXT_PUBLIC_APP_MODE: 'desktop',
  },
  publicRuntimeConfig: {
    basePath: '',
    appMode: 'desktop',
  }
};

export default nextConfig;
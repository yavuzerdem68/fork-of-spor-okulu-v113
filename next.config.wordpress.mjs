/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  output: 'export',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  images: {
    unoptimized: true,
    domains: ["assets.co.dev", "images.unsplash.com", "www.g7spor.org"],
  },
  assetPrefix: '/spor-okulu',
  basePath: '/spor-okulu',

  // Static export için optimizasyonlar
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  
  // WordPress deployment için özel ayarlar
  generateBuildId: async () => {
    return 'wordpress-build-' + Date.now();
  },
  
  webpack: (config, context) => {
    config.optimization.minimize = true;
    
    // Static export için asset path'i düzelt
    if (context.isServer === false) {
      config.output.publicPath = '/spor-okulu/_next/';
    }
    
    // Asset handling
    config.output.assetModuleFilename = 'static/media/[name].[hash][ext]';
    
    // WordPress deployment için özel optimizasyonlar
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    
    return config;
  },
  
  env: {
    WORDPRESS_API_URL: 'https://www.g7spor.org/wp-json/wp/v2',
    WORDPRESS_SITE_URL: 'https://www.g7spor.org',
    NEXT_PUBLIC_BASE_PATH: '/spor-okulu',
    NEXT_PUBLIC_WORDPRESS_MODE: 'true',
  },
  
  // WordPress için runtime config
  publicRuntimeConfig: {
    basePath: '/spor-okulu',
    wordpressMode: true,
  },
  
  // Distillation directory
  distDir: '.next',
  
  // WordPress için özel headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
/** @type {import('next').NextConfig} */

// Deployment mode belirleme - environment variable veya build script'ten
const isWordPressMode = process.env.WORDPRESS_MODE === 'true' || process.env.npm_config_wordpress === 'true';
const isLocalMode = !isWordPressMode;

console.log(`🚀 Building in ${isWordPressMode ? 'WordPress' : 'Local'} mode`);

const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // WordPress için static export, local için normal
  ...(isWordPressMode && {
    output: 'export',
    trailingSlash: true,
    skipTrailingSlashRedirect: true,
    assetPrefix: '/spor-okulu',
    basePath: '/spor-okulu',
  }),
  
  // Local için normal ayarlar
  ...(isLocalMode && {
    trailingSlash: false,
  }),
  
  images: {
    unoptimized: true,
    domains: [
      "assets.co.dev", 
      "images.unsplash.com", 
      "localhost",
      ...(isWordPressMode ? ["www.g7spor.org"] : [])
    ],
  },
  
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  
  // WordPress için özel webpack konfigürasyonu
  ...(isWordPressMode && {
    webpack: (config, context) => {
      config.optimization.minimize = true;
      
      // Static export için asset path'i düzelt
      if (context.isServer === false) {
        config.output.publicPath = '/spor-okulu/_next/';
      }
      
      config.output.assetModuleFilename = 'static/media/[name].[hash][ext]';
      
      return config;
    },
    
    generateBuildId: async () => {
      return 'static-build-' + Date.now();
    },
  }),
  
  env: {
    NEXT_PUBLIC_APP_MODE: isWordPressMode ? 'wordpress' : 'local',
    ...(isWordPressMode && {
      WORDPRESS_API_URL: 'https://www.g7spor.org/wp-json/wp/v2',
      WORDPRESS_SITE_URL: 'https://www.g7spor.org',
      NEXT_PUBLIC_BASE_PATH: '/spor-okulu',
    }),
  },
  
  // WordPress için runtime config
  ...(isWordPressMode && {
    publicRuntimeConfig: {
      basePath: '/spor-okulu',
    },
  }),
};

export default nextConfig;
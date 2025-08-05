/** @type {import('next').NextConfig} */

// Deployment mode belirleme
const isWordPressMode = process.env.WORDPRESS_MODE === 'true' || process.env.npm_config_wordpress === 'true';
const isLocalMode = !isWordPressMode;

console.log(`🚀 Building in ${isWordPressMode ? 'WordPress' : 'Local'} mode`);

// Base configuration
const baseConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    domains: ["assets.co.dev", "images.unsplash.com", "localhost"],
  },
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  env: {
    NEXT_PUBLIC_APP_MODE: 'local',
  },
};

// WordPress specific configuration
const wordpressConfig = {
  ...baseConfig,
  output: 'export',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  assetPrefix: '/spor-okulu',
  basePath: '/spor-okulu',
  images: {
    ...baseConfig.images,
    domains: [...baseConfig.images.domains, "www.g7spor.org"],
  },
  webpack: (config, context) => {
    config.optimization.minimize = true;
    
    if (context.isServer === false) {
      config.output.publicPath = '/spor-okulu/_next/';
    }
    
    config.output.assetModuleFilename = 'static/media/[name].[hash][ext]';
    
    return config;
  },
  generateBuildId: async () => {
    return 'static-build-' + Date.now();
  },
  env: {
    NEXT_PUBLIC_APP_MODE: 'wordpress',
    WORDPRESS_API_URL: 'https://www.g7spor.org/wp-json/wp/v2',
    WORDPRESS_SITE_URL: 'https://www.g7spor.org',
    NEXT_PUBLIC_BASE_PATH: '/spor-okulu',
  },
  publicRuntimeConfig: {
    basePath: '/spor-okulu',
  },
};

// Local specific configuration
const localConfig = {
  ...baseConfig,
  trailingSlash: false,
};

// Export the appropriate configuration
const nextConfig = isWordPressMode ? wordpressConfig : localConfig;

export default nextConfig;
/** @type {import('next').NextConfig} */

const isWordPressMode = process.env.WORDPRESS_MODE === 'true';

console.log(`Building in ${isWordPressMode ? 'WordPress' : 'Local'} mode`);

let nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  trailingSlash: false,
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

if (isWordPressMode) {
  nextConfig = {
    ...nextConfig,
    output: 'export',
    trailingSlash: true,
    skipTrailingSlashRedirect: true,
    assetPrefix: '/spor-okulu',
    basePath: '/spor-okulu',
    images: {
      ...nextConfig.images,
      domains: [...nextConfig.images.domains, "www.g7spor.org"],
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
}

export default nextConfig;
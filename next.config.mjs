const isWordPressMode = process.env.WORDPRESS_MODE === 'true';

console.log('Building in', isWordPressMode ? 'WordPress' : 'Local', 'mode');

const nextConfig = {
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
  nextConfig.output = 'export';
  nextConfig.trailingSlash = true;
  nextConfig.skipTrailingSlashRedirect = true;
  nextConfig.assetPrefix = '/spor-okulu';
  nextConfig.basePath = '/spor-okulu';
  nextConfig.images.domains.push("www.g7spor.org");
  nextConfig.env.NEXT_PUBLIC_APP_MODE = 'wordpress';
  nextConfig.env.WORDPRESS_API_URL = 'https://www.g7spor.org/wp-json/wp/v2';
  nextConfig.env.WORDPRESS_SITE_URL = 'https://www.g7spor.org';
  nextConfig.env.NEXT_PUBLIC_BASE_PATH = '/spor-okulu';
  nextConfig.publicRuntimeConfig = {
    basePath: '/spor-okulu',
  };
  nextConfig.webpack = function(config, context) {
    config.optimization.minimize = true;
    if (context.isServer === false) {
      config.output.publicPath = '/spor-okulu/_next/';
    }
    config.output.assetModuleFilename = 'static/media/[name].[hash][ext]';
    return config;
  };
  nextConfig.generateBuildId = async function() {
    return 'static-build-' + Date.now();
  };
}

export default nextConfig;
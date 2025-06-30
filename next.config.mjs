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
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  generateBuildId: async () => {
    return 'static-build-' + Date.now();
  },
  webpack: (config, context) => {
    config.optimization.minimize = process.env.NEXT_PUBLIC_CO_DEV_ENV !== "preview";
    
    if (context.isServer === false) {
      config.output.publicPath = '/spor-okulu/_next/';
    }
    
    config.output.assetModuleFilename = 'static/media/[name].[hash][ext]';
    
    return config;
  },
  env: {
    WORDPRESS_API_URL: 'https://www.g7spor.org/wp-json/wp/v2',
    WORDPRESS_SITE_URL: 'https://www.g7spor.org',
    NEXT_PUBLIC_BASE_PATH: '/spor-okulu',
  },
  publicRuntimeConfig: {
    basePath: '/spor-okulu',
  }
};

export default nextConfig;
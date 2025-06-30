/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  output: 'export',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  distDir: 'out',
  images: {
    unoptimized: true,
    domains: ["assets.co.dev", "images.unsplash.com", "www.g7spor.org"],
  },
  assetPrefix: '/spor-okulu',
  basePath: '/spor-okulu',
  // API routes'ları devre dışı bırak
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  webpack: (config, context) => {
    config.optimization.minimize = true;
    
    // Ensure proper asset prefix handling
    if (context.isServer === false) {
      config.output.publicPath = '/spor-okulu/_next/';
    }
    
    return config;
  },
  env: {
    WORDPRESS_API_URL: 'https://www.g7spor.org/wp-json/wp/v2',
    WORDPRESS_SITE_URL: 'https://www.g7spor.org',
  },
  // Force asset prefix in all environments
  publicRuntimeConfig: {
    basePath: '/spor-okulu',
  }
};

export default nextConfig;
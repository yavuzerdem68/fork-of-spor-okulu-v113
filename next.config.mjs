/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  // Temporarily disabled for local development - use next.config.wordpress.mjs for production
  // output: 'export',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  images: {
    unoptimized: true,
    domains: ["assets.co.dev", "images.unsplash.com", "www.g7spor.org", "localhost"],
  },
  // Temporarily disabled for local development
  // assetPrefix: '/spor-okulu',
  // basePath: '/spor-okulu',
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },

  env: {
    // Local development settings
    WORDPRESS_API_URL: process.env.NEXT_PUBLIC_WORDPRESS_URL ? `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wp/v2` : 'http://localhost/wordpress/wp-json/wp/v2',
    WORDPRESS_SITE_URL: process.env.NEXT_PUBLIC_WORDPRESS_URL || 'http://localhost/wordpress',
    NEXT_PUBLIC_BASE_PATH: '', // Empty for local development
  },
  publicRuntimeConfig: {
    basePath: '', // Empty for local development
  }
};

export default nextConfig;
/** @type {import('next').NextConfig} */

const isWordPressMode = process.env.WORDPRESS_MODE === 'true';

console.log(`Building in ${isWordPressMode ? 'WordPress' : 'Local'} mode`);

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

export default nextConfig;
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    domains: ["assets.co.dev", "images.unsplash.com"],
  },
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
  // Remove static export for Supabase version (we need API routes)
  // output: 'export', 
  // trailingSlash: true,
  // skipTrailingSlashRedirect: true,
  // assetPrefix: '/spor-okulu',
  // basePath: '/spor-okulu',
};

export default nextConfig;
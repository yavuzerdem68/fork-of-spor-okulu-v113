/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  // Cloud deployment configuration
  output: 'standalone',
  trailingSlash: false,
  images: {
    unoptimized: true,
    domains: ["assets.co.dev", "images.unsplash.com"],
  },
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },

  env: {
    // Cloud deployment - Supabase tabanlı
    NEXT_PUBLIC_BASE_PATH: '',
    NEXT_PUBLIC_APP_MODE: 'cloud',
  },
  publicRuntimeConfig: {
    basePath: '',
    appMode: 'cloud',
  },

  // Vercel optimizations
  poweredByHeader: false,
  compress: true,
  
  // Environment variables for build time
  generateBuildId: async () => {
    return 'sports-crm-' + Date.now()
  },

  // Redirect configuration
  async redirects() {
    return [
      {
        source: '/spor-okulu/:path*',
        destination: '/:path*',
        permanent: true,
      },
    ]
  },
};

export default nextConfig;
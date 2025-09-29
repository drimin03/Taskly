/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Optimize build performance
  swcMinify: true,
  reactStrictMode: false, // Disable for better performance in development
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'firebase',
      'framer-motion',
      'swr'
    ]
  },
  // Reduce bundle size
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{member}}',
      skipDefaultConversion: true,
    },
  },
  // Vercel-specific optimizations
  poweredByHeader: false,
  compress: true,
  // Enable for better caching
  generateEtags: true,
  // Add webpack optimization
  webpack: (config, { dev, isServer }) => {
    // Fix for the webpack module resolution error
    if (!config.experiments) {
      config.experiments = {};
    }
    
    // Ensure proper module handling
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "fs": false,
      "net": false,
      "tls": false,
      "dns": false,
      "child_process": false,
      "path": false,
    };
    
    // Optimize chunk splitting
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
            },
          },
        },
      };
      
      // Exclude nodemailer from client-side bundle
      config.externals = {
        ...config.externals,
        'nodemailer': 'commonjs nodemailer',
      };
    }
    
    return config;
  }
}

export default nextConfig
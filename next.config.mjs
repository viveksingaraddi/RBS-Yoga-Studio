/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimize package imports so Next.js doesn't parse thousands of barrel files on startup
  experimental: {
    optimizePackageImports: ['lucide-react', 'gsap', 'framer-motion'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default nextConfig;

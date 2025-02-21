
/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      
      remotePatterns: [
        {
              protocol: 'https', 
              hostname: 'firebasestorage.googleapis.com',
              port: '',
              // pathname: '/v0/b/mining-expo-bc804.appspot.com/o/**',
            },
            {
              protocol: 'https',
              hostname: 'i.ytimg.com',
              pathname: '/vi/**'
            }
          ],
        },
      };
      
      const withBundleAnalyzer = require('@next/bundle-analyzer')({
        enabled: process.env.ANALYZE === 'true',
      })
  module.exports = withBundleAnalyzer(nextConfig);
  
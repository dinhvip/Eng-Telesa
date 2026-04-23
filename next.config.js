/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://dev-admin.telesaenglish.com/api/:path*',
      },
    ];
  },
  images: {
    domains: ['dev-admin.telesaenglish.com'],
  },
};

module.exports = nextConfig;
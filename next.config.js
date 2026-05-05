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
    domains: ['dev-admin.telesaenglish.com', 's3.ap-southeast-2.amazonaws.com'],
  },
};

module.exports = nextConfig;
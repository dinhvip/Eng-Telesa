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
};

module.exports = nextConfig;
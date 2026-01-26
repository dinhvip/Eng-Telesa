/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "dev-admin.telesaenglish.com" },
      { protocol: "https", hostname: "api.telesaenglish.com" },
    ],
  },
};

export default nextConfig;

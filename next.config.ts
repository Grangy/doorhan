/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/img/upload/**",
      },
      {
        protocol: "https",
        hostname: "yourdomain.com",
        pathname: "/img/upload/**",
      },
    ],
  },
};

module.exports = nextConfig;
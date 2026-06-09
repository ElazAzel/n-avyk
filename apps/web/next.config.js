/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["localhost", "navyk.kz"],
  },
  transpilePackages: ["@navyk/types", "@navyk/utils"],
};

module.exports = nextConfig;

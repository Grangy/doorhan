// @ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbopack: false, // отключаем Turbopack, чтобы использовать Webpack
  },
  // здесь можно добавить другие опции конфигурации
}

module.exports = nextConfig

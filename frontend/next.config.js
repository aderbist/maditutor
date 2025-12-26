/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // Важно для статического экспорта
  images: {
    unoptimized: true,  // Для простоты
  },
  trailingSlash: true,
}

module.exports = nextConfig
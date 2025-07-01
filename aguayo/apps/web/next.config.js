// apps/web/next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',         // Dónde se guardará el service worker
  register: true,         // Registra el SW automáticamente
  skipWaiting: true       // Activa el nuevo SW inmediatamente
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true
}

module.exports = withPWA(nextConfig)

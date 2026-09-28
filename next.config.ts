import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Genera una carpeta .next/standalone para el contenedor Docker
  output: 'standalone',

  // Evita que TypeScript bloquee el build en el contenedor
  typescript: {
    ignoreBuildErrors: false,
  },
}

export default nextConfig

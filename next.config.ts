import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Genera una carpeta .next/standalone para el contenedor Docker
  output: 'standalone',

  // Desactiva el procesador de imágenes dinámico para servir estáticos al instante
  images: {
    unoptimized: true,
  },

  // Evita que TypeScript bloquee el build en el contenedor
  typescript: {
    ignoreBuildErrors: false,
  },
}

export default nextConfig

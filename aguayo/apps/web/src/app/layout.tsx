// apps/web/src/app/layout.tsx

import '../styles/globals.css' // Cambiar la ruta del import
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Providers from '@/components/providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Aguayo - Servicios de Confianza',
  description: 'Conecta con personas de confianza para todos tus servicios del hogar',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${inter.className} relative min-h-screen pb-16`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
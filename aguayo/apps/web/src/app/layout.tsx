// aguayo/apps/web/src/app/layout.tsx
import './global.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { BottomNav } from '@repo/ui';


const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Tu App',
  description: 'Descripción de tu app',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} relative min-h-screen pb-16`}>
        {children}
        <BottomNav />
      </body>
    </html>
  )
}

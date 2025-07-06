// apps/web/src/app/layout.tsx
import './glow'
import { ReactNode } from 'react'
import { getServerSession } from 'next-auth'
import { authOptions } from './api/auth/[...nextauth]/authOptions'
import SessionProvider from '../providers/session-provider'
import UserNav from '@/layouts/UserNav'
import Link from 'next/link'

export const metadata = { /* ... */ }

export default async function RootLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="es">
      <head />
      <body className="flex flex-col min-h-screen bg-bg-light text-neutral-500">
        <SessionProvider session={session}>
          <header className="w-full px-4 py-2 shadow-card bg-surface flex justify-between items-center">
            <Link
              href="/"
              className="text-xl font-bold text-primary hover:text-primary-dark transition"
            >
              Aguayo
            </Link>
            <UserNav />
          </header>

          <main className="flex-grow p-4">
            {children}
          </main>

          <footer className="mt-auto p-4 text-center text-sm text-neutral-400 bg-surface">
            © {new Date().getFullYear()} Aguayo. Todos los derechos reservados.
          </footer>
        </SessionProvider>
      </body>
    </html>
  )
}

// apps/web/src/app/layout.tsx
import '../styles/globals.css'
import { ReactNode } from 'react'
import { getServerSession } from 'next-auth'
import {authOptions} from './api/auth/[...nextauth]/authOptions'
import SessionProvider from '../providers/session-provider'

export const metadata = {
  title: 'Aguayo | Servicios entre personas',
  description: 'Plataforma boliviana para ofrecer y contratar servicios físicos C2C.',
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="es">
      <head />
      <body className="bg-gray-50 text-gray-900">
        <SessionProvider session={session}>
          {/* Header global */}
          <header className="w-full px-4 py-2 shadow bg-white">
            <h1 className="text-xl font-bold text-blue-600">Aguayo</h1>
          </header>

          {/* Contenido dinámico según ruta */}
          <main className="p-4">{children}</main>

          {/* Footer global */}
          <footer className="mt-10 p-4 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Aguayo. Todos los derechos reservados.
          </footer>
        </SessionProvider>
      </body>
    </html>
  )
}

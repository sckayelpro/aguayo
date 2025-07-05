// apps/web/src/app/layout.tsx
import './global.css' // Asegúrate de importar tus estilos globales
import { ReactNode } from 'react'
import { getServerSession } from 'next-auth'
import {authOptions} from './api/auth/[...nextauth]/authOptions'
import SessionProvider from '../providers/session-provider'
// import AuthButton from '../components/auth/AuthButton' // Ya no lo necesitas aquí directamente
import UserNav from '@/layouts/UserNav' // <--- ¡Importa el nuevo componente!
import Link from 'next/link'

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
          <header className="w-full px-4 py-2 shadow bg-white flex justify-between items-center">
            <Link href="/" className="text-xl font-bold text-blue-600 hover:opacity-80 transition-opacity"> {/* ¡Añade Link para el logo/título! */}
              Aguayo
            </Link>
            <UserNav /> {/* <--- ¡Usa el nuevo componente aquí! */}
          </header>

          {/* Contenido dinámico según ruta */}
          <main className="p-4 flex-grow">{children}</main> {/* Añade flex-grow para que el footer baje */}

          {/* Footer global */}
          <footer className="mt-10 p-4 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Aguayo. Todos los derechos reservados.
          </footer>
        </SessionProvider>
      </body>
    </html>
  )
}
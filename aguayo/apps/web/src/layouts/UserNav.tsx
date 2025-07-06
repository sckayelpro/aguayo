// apps/web/src/components/layout/UserNav.tsx
'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function UserNav() {
  const { data: session, status } = useSession()
  const router = useRouter()

  if (status === 'loading') {
    return <div className="text-neutral-500">Cargando...</div>
  }

  if (status === 'authenticated') {
    return (
      <div className="flex items-center space-x-4">
        <Link
          href="/dashboard"
          className="text-neutral-500 hover:text-primary transition"
        >
          Dashboard
        </Link>
        <Link
          href="/profile"
          className="text-neutral-500 hover:text-primary transition"
        >
          Mi Perfil
        </Link>
        {session.user.role === 'PROVIDER' && (
          <Link
            href="/my-services"
            className="text-neutral-500 hover:text-primary transition"
          >
            Mis Servicios
          </Link>
        )}
        <span className="font-semibold text-primary">
          Hola, {session.user.name || session.user.email}!
        </span>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="bg-danger text-white px-4 py-2 rounded-md hover:bg-warning transition"
        >
          Cerrar Sesión
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-4">
      <Link
        href="/auth/login"
        className="text-primary hover:text-primary-dark transition"
      >
        Iniciar Sesión
      </Link>
      <Link
        href="/auth/signup/role"
        className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition"
      >
        Registrarse
      </Link>
    </div>
  )
}

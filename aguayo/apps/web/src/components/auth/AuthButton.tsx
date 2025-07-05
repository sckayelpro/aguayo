//apps/web/src/components/AuthButton.tsx
'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation' // Importa useRouter
import { useEffect } from 'react'

export default function AuthButton() {
  const { data: session, status } = useSession()
  const router = useRouter() // Inicializa useRouter

  // Añade un useEffect para manejar la redirección si el usuario ya está autenticado
  useEffect(() => {
    if (status === 'authenticated') {
      if (session.user.hasProfile) {
        router.replace('/dashboard'); // Si tiene perfil, al dashboard
      } else {
        router.replace('/auth/signup/role'); // Si no tiene perfil, al wizard
      }
    }
  }, [status, session, router]); // Dependencias: status, session, router

  if (status === 'loading') return <span className="text-gray-500">Cargando...</span>

  if (session?.user) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-700">Hola, {session.user.name || session.user.email}</span>
        <button
          onClick={() => signOut()}
          className="px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
        >
          Cerrar sesión
        </button>
      </div>
    )
  }

  return (
    <button
      // IMPORTANTE: Redirige a la página de inicio del flujo de registro/login
      onClick={() => signIn('google', { callbackUrl: '/auth/signup' })}
      className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
    >
      Iniciar sesión
    </button>
  )
}
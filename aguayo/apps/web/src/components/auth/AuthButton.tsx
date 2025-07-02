'use client'

import { useSession, signIn, signOut } from 'next-auth/react'

export default function AuthButton() {
  const { data: session, status } = useSession()

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
      onClick={() => signIn('google')}
      className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
    >
      Iniciar sesión
    </button>
  )
}

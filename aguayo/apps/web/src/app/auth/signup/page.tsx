// apps/web/src/app/auth/signup/page.tsx
'use client'
import { useSession, signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function SignupStart() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (status === 'authenticated') {
      if (session.user.hasProfile) {
        // Usuario con perfil completo: ir al dashboard
        router.replace('/dashboard')
      } else {
        // Usuario sin perfil: ir al wizard de roles (primer paso real del wizard)
        router.replace('/auth/signup/role')
      }
    }
  }, [status, session, router])

  const handleSignIn = async () => {
    try {
      setIsLoading(true)
      // Importante: La callbackUrl debe ser el primer paso del wizard de registro.
      // NextAuth completará la autenticación y luego redirigirá aquí.
      // Tu `useEffect` luego manejará la redirección al wizard (`/auth/signup/role`)
      // o al dashboard si ya tiene perfil.
      await signIn('google', { callbackUrl: '/auth/signup' }) // Redirigir a esta misma página después del login
    } catch (error) {
      console.error('Error during sign in:', error)
      setIsLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p>Cargando...</p>
      </div>
    )
  }

  // Si ya está autenticado, no mostrar el botón, el useEffect ya lo redirigió
  if (status === 'authenticated') return null;


  return (
    <div className="flex flex-col items-center gap-6 min-h-[60vh] justify-center">
      <h1 className="text-2xl font-bold">Crea tu cuenta en Aguayo</h1>
      <p className="text-gray-600 text-center max-w-md">
        Para continuar, por favor regístrate con tu cuenta de Google.
      </p>
      <button
        onClick={handleSignIn}
        disabled={isLoading}
        className={`bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors ${
          isLoading ? 'opacity-70 cursor-not-allowed' : ''
        }`}
      >
        {isLoading ? 'Procesando...' : 'Continuar con Google'}
      </button>
    </div>
  )
}
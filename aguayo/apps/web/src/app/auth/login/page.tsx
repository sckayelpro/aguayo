
// apps/web/src/app/auth/login/page.tsx
'use client'

import { signIn } from 'next-auth/react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function LoginPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'authenticated') {
      if (session.user.hasProfile) {
        router.replace('/dashboard');
      } else {
        router.replace('/auth/signup/role');
      }
    }
  }, [status, router, session]);

  if (status === 'authenticated') return null;

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6">Iniciar sesión</h1>
        <button
          // IMPORTANTE: Redirige al inicio del flujo de registro/login
          onClick={() => signIn('google', { callbackUrl: '/auth/signup' })}
          className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 flex items-center justify-center"
        >
          Continuar con Google
        </button>
      </div>
    </div>
  )
}
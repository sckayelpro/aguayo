// apps/web/src/app/page.tsx
'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import AuthButton from '@/components/auth/AuthButton'


export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'authenticated' && !session.user.hasProfile) {
      router.replace('/auth/signup/role')
    }
  }, [status, session, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-light">
        <p className="text-neutral-500">Cargando sesión...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg-light px-4">
      <h1 className="text-4xl font-bold text-primary mb-6">Bienvenido a Aguayo </h1>
      <p className="text-lg text-neutral-400 mb-8 text-center max-w-md">
        Encuentra personas de confianza para realizar servicios como limpieza, jardinería,
        cuidado de personas y más.
      </p>

      {status === 'unauthenticated' && <AuthButton />}

      {status === 'authenticated' && session.user.hasProfile && (
        <button
          onClick={() => router.push('/dashboard')}
          className="bg-primary text-white px-6 py-3 rounded-xl text-lg hover:bg-primary-dark transition"
        >
          Ir al Dashboard
        </button>
      )}
  
    </div>
  )
}

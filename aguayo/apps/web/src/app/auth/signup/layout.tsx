// apps/web/src/app/auth/signup/layout.tsx
'use client'

import { ReactNode, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

const STEPS = [
  { slug: 'role', label: 'Tipo de cuenta' },
  { slug: 'personal', label: 'Datos personales' },
  { slug: 'documents', label: 'Documentos' },
  { slug: 'finish', label: 'Listo' }, // El paso final donde se crea el perfil
]

export default function SignupLayout({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  const currentStep = pathname?.split('/').pop() || ''
  const isInitialPage = pathname === '/auth/signup' // Página de "Continuar con Google"

  useEffect(() => {
    // Si no está autenticado y no es la página inicial de signup, redirigir a signup
    if (status === 'unauthenticated' && !isInitialPage) {
      router.replace('/auth/signup')
      return
    }

    if (status === 'authenticated') {
      // Si ya tiene perfil, no debería estar en ninguna página del wizard.
      // Redirigir al dashboard.
      if (session.user.hasProfile) {
        router.replace('/dashboard')
        return
      }

      // Si está en la página inicial de signup y ya está autenticado (pero sin perfil),
      // redirigir al primer paso del wizard (role).
      if (isInitialPage) {
        router.replace('/auth/signup/role')
        return
      }

      // Lógica para proteger los pasos del wizard
      // Esto es crucial para asegurar que los usuarios no salten pasos.
      // Por ejemplo, si intentan ir a /personal sin haber seleccionado un rol.
      // Implementación más avanzada: podrías guardar el progreso en el estado de la sesión
      // o en la base de datos temporalmente. Por ahora, asumimos un flujo lineal.
      // Para este MVP, si solo el último paso depende de los anteriores,
      // la protección más simple es asegurar que no puedan saltarse el paso de "finalizar".
      // La verdadera protección de datos debe estar en el endpoint de la API.
    }
  }, [status, router, pathname, isInitialPage, session])

  if (status === 'loading') {
    return (
      <div className="max-w-md mx-auto p-4 flex justify-center items-center min-h-[200px]">
        <p>Cargando...</p>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto p-4">
      {/* Mostrar la navegación del wizard solo si está autenticado y no tiene perfil */}
      {!isInitialPage && status === 'authenticated' && !session?.user.hasProfile && (
        <nav className="flex justify-between mb-6">
          {STEPS.map((step) => {
            const isActive = step.slug === currentStep
            const stepIndex = STEPS.findIndex(s => s.slug === step.slug)
            const currentIndex = STEPS.findIndex(s => s.slug === currentStep)
            const isCompleted = currentIndex > stepIndex // Un paso se considera "completado" si ya estamos en un paso posterior

            return (
              <Link
                key={step.slug}
                href={`/auth/signup/${step.slug}`}
                className={`text-sm font-medium ${
                  isActive
                    ? 'text-blue-600 underline'
                    : isCompleted
                      ? 'text-green-600'
                      : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {step.label}
              </Link>
            )
          })}
        </nav>
      )}

      <div className="mt-4">
        {children}
      </div>
    </div>
  )
}
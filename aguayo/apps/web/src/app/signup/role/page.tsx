// apps/web/src/app/signup/role/page.tsx
'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function RoleSelection() {
  const router = useRouter()

  const selectRole = (role: 'PROVIDER' | 'CONSUMER') => {
    localStorage.setItem('signupRole', role)
    router.push('/signup/personal')
  }

  useEffect(() => {
    // Limpia pasos previos si se regresa
    localStorage.removeItem('signupPersonal')
  }, [])

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">¿Qué deseas hacer?</h1>
      <p className="mb-6">Selecciona una opción para continuar:</p>
      <div className="space-y-4">
        <button
          onClick={() => selectRole('PROVIDER')}
          className="w-full bg-green-600 text-white py-3 rounded hover:bg-green-700"
        >
          Ofrecer mis servicios
        </button>
        <button
          onClick={() => selectRole('CONSUMER')}
          className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700"
        >
          Buscar personas que me ayuden
        </button>
      </div>
    </div>
  )
}

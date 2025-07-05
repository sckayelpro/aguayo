// apps/web/src/app/auth/signup/role/page.tsx
'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function RoleSelection() {
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<'PROVIDER' | 'CONSUMER'>()

  const handleSubmit = () => {
    if (selectedRole) {
      // Guardar el rol en localStorage
      localStorage.setItem('signupRole', selectedRole)
      // Redirigir al siguiente paso
      router.push(`/auth/signup/personal`)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">¿Qué deseas hacer?</h1>
      <p className="mb-6">Selecciona una opción para continuar:</p>
      <div className="space-y-4 mb-6">
        <button
          onClick={() => setSelectedRole('PROVIDER')}
          className={`w-full py-3 rounded ${
            selectedRole === 'PROVIDER'
              ? 'bg-green-700 text-white'
              : 'bg-green-100 text-green-800 hover:bg-green-200'
          }`}
        >
          Ofrecer mis servicios
        </button>
        <button
          onClick={() => setSelectedRole('CONSUMER')}
          className={`w-full py-3 rounded ${
            selectedRole === 'CONSUMER'
              ? 'bg-blue-700 text-white'
              : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
          }`}
        >
          Buscar personas que me ayuden
        </button>
      </div>
      <button
        onClick={handleSubmit}
        disabled={!selectedRole}
        className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Continuar
      </button>
    </div>
  )
}
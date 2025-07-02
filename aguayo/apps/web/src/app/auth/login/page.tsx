// src/app/auth/login/page.tsx
'use client'

import { signIn } from 'next-auth/react'

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h2 className="text-2xl font-semibold">Iniciar sesión en Aguayo</h2>
      <button
        onClick={() => signIn('google')}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Continuar con Google
      </button>
    </div>
  )
}

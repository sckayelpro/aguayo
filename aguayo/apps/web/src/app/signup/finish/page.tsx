'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

type Personal = {
  fullName: string
  birthDate: string
  phoneNumber: string
  location: string
  bio?: string
  servicesOffered?: string[]
}

export default function FinishStep() {
  const router = useRouter()
  const [role, setRole] = useState<'PROVIDER' | 'CONSUMER' | null>(null)
  const [personal, setPersonal] = useState<Personal | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const r = localStorage.getItem('signupRole') as 'PROVIDER' | 'CONSUMER' | null
    const p = JSON.parse(localStorage.getItem('signupPersonal') || 'null')

    if (!r || !p) {
      router.replace('/signup/role')
    } else {
      setRole(r)
      setPersonal(p)
      setReady(true)
    }
  }, [router])

  const handleConfirm = async () => {
    if (!role || !personal) return

    setSubmitting(true)

    const formData = new FormData()
    formData.append('role', role)

    Object.entries(personal).forEach(([k, v]) => {
      if (Array.isArray(v)) {
        v.forEach(val => formData.append(`${k}[]`, val))
      } else {
        formData.append(k, String(v))
      }
    })

    const res = await fetch('/api/profile/create', {
      method: 'POST',
      body: formData,
    })

    if (res.ok) {
      localStorage.removeItem('signupRole')
      localStorage.removeItem('signupPersonal')
      localStorage.removeItem('signupDocumentsUploaded')
      router.push('/dashboard')
    } else {
      alert('Ocurrió un error al finalizar tu registro. Intenta nuevamente.')
      setSubmitting(false)
    }
  }

  if (!ready || !role || !personal) return null

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h2 className="text-2xl font-bold">¡Casi terminamos!</h2>
      <p className="text-gray-700">Revisa que tus datos estén correctos:</p>

      <ul className="list-disc list-inside space-y-1 text-gray-800">
        <li><strong>Rol:</strong> {role === 'PROVIDER' ? 'Ofrecer servicios' : 'Buscar servicios'}</li>
        <li><strong>Nombre:</strong> {personal.fullName}</li>
        <li><strong>Fecha de nacimiento:</strong> {personal.birthDate}</li>
        <li><strong>Celular:</strong> {personal.phoneNumber}</li>
        <li><strong>Ubicación:</strong> {personal.location}</li>
        {role === 'PROVIDER' && Array.isArray(personal.servicesOffered) && personal.servicesOffered.length > 0 && (

<li><strong>Servicios:</strong> {personal.servicesOffered.join(', ')}</li> )}
        {personal.bio && <li><strong>Biografía:</strong> {personal.bio}</li>}
      </ul>

      <div className="flex gap-4 pt-4">
        <button
          onClick={() => router.push('/signup/personal')}
          className="w-full border border-gray-400 text-gray-700 py-2 rounded hover:bg-gray-100"
        >
          Editar
        </button>
        <button
          onClick={handleConfirm}
          disabled={submitting}
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
        >
          {submitting ? 'Registrando...' : 'Confirmar y finalizar'}
        </button>
      </div>
    </div>
  )
}

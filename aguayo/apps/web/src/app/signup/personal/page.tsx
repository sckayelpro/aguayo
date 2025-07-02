'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'

type FormData = {
  fullName: string
  birthDate: string
  phoneNumber: string
  location: string
  bio?: string
  servicesOffered?: string[] // solo si es PROVIDER
}

export default function PersonalStep() {
  const router = useRouter()
  const [role, setRole] = useState<'PROVIDER' | 'CONSUMER' | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>()

  useEffect(() => {
    const storedRole = localStorage.getItem('signupRole') as 'PROVIDER' | 'CONSUMER' | null
    if (!storedRole) {
      router.replace('/signup/role')
      return
    }

    setRole(storedRole)

    // Restaurar datos previos si existen
    const saved = localStorage.getItem('signupPersonal')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        Object.entries(parsed).forEach(([k, v]) => {
          const key = k as keyof FormData
          if (key === 'servicesOffered' && Array.isArray(v)) {
            setValue(key, v)
          } else if (typeof v === 'string') {
            setValue(key, v)
          }
        })
      } catch (e) {
        console.error('Error parsing saved form data', e)
      }
    }
  }, [router, setValue])

  const onSubmit = (data: FormData) => {
    localStorage.setItem('signupPersonal', JSON.stringify(data))
    router.push('/signup/documents')
  }

  if (!role) return null // esperar a que se cargue el role

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-md mx-auto p-6 space-y-4">
      <h2 className="text-xl font-bold">Datos personales</h2>

      <div>
        <label>Nombre completo</label>
        <input
          type="text"
          {...register('fullName', { required: 'Requerido' })}
          className="w-full border p-2 rounded"
        />
        {errors.fullName && <p className="text-red-500">{errors.fullName.message}</p>}
      </div>

      <div>
        <label>Fecha de nacimiento</label>
        <input
          type="date"
          {...register('birthDate', { required: 'Requerido' })}
          className="w-full border p-2 rounded"
        />
        {errors.birthDate && <p className="text-red-500">{errors.birthDate.message}</p>}
      </div>

      <div>
        <label>Celular</label>
        <input
          type="tel"
          {...register('phoneNumber', { required: 'Requerido' })}
          className="w-full border p-2 rounded"
        />
        {errors.phoneNumber && <p className="text-red-500">{errors.phoneNumber.message}</p>}
      </div>

      <div>
        <label>Ubicación o zona</label>
        <input
          type="text"
          {...register('location', { required: 'Requerido' })}
          className="w-full border p-2 rounded"
        />
        {errors.location && <p className="text-red-500">{errors.location.message}</p>}
      </div>

      {role === 'PROVIDER' && (
        <>
          <div>
            <label>Servicios que ofreces</label>
            <select
              multiple
              {...register('servicesOffered')}
              className="w-full border p-2 rounded"
            >
              <option value="cleaning">Limpieza</option>
              <option value="gardening">Jardinería</option>
              <option value="plumbing">Plomería</option>
            </select>
          </div>

          <div>
            <label>Biografía (opcional)</label>
            <textarea
              {...register('bio')}
              className="w-full border p-2 rounded"
              rows={3}
            />
          </div>
        </>
      )}

      <button
        type="submit"
        className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
      >
        Continuar
      </button>
    </form>
  )
}

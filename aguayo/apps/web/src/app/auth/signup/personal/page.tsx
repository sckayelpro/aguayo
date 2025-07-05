// apps/web/src/app/auth/signup/personal/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'

// Define un tipo para el servicio si no lo tienes ya
type Service = {
  id: string;
  title: string;
};

type FormData = {
  fullName: string
  birthDate: string
  phoneNumber: string
  location: string
  bio?: string
  servicesOffered?: string[] // Ahora contendrá IDs reales
}

export default function PersonalStep() {
  const router = useRouter()
  const [role, setRole] = useState<'PROVIDER' | 'CONSUMER' | null>(null)
  const [availableServices, setAvailableServices] = useState<Service[]>([]) // Nuevo estado para los servicios
  const [isLoadingServices, setIsLoadingServices] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>()

  useEffect(() => {
    const storedRole = localStorage.getItem('signupRole') as 'PROVIDER' | 'CONSUMER' | null
    if (!storedRole) {
      router.replace('/auth/signup/role')
      return
    }
    setRole(storedRole)

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

    // Cargar servicios disponibles si el rol es PROVEEDOR
    if (storedRole === 'PROVIDER') {
      const fetchServices = async () => {
        setIsLoadingServices(true);
        try {
          const res = await fetch('/api/services'); // Necesitas crear este endpoint si no lo tienes
          if (!res.ok) {
            throw new Error('Failed to fetch services');
          }
          const data: Service[] = await res.json();
          setAvailableServices(data);
        } catch (error) {
          console.error('Error fetching services:', error);
          // Podrías mostrar un error al usuario aquí
        } finally {
          setIsLoadingServices(false);
        }
      };
      fetchServices();
    }
  }, [router, setValue])

  const onSubmit = (data: FormData) => {
    localStorage.setItem('signupPersonal', JSON.stringify(data))
    router.push('/auth/signup/documents')
  }

  if (!role) return null

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
            <label>Biografía (opcional)</label>
            <textarea
              {...register('bio')}
              className="w-full border p-2 rounded"
              rows={3}
            />
          </div>
          <div>
            <label>Servicios que ofreces</label>
            {isLoadingServices ? (
              <p>Cargando servicios...</p>
            ) : availableServices.length === 0 ? (
              <p className="text-red-500">No hay servicios disponibles. Contacta al administrador.</p>
            ) : (
              <select
                multiple
                {...register('servicesOffered')}
                className="w-full border p-2 rounded"
                // Puedes ajustar el tamaño para que muestre más opciones
                size={Math.min(availableServices.length, 5)}
              >
                {availableServices.map(service => (
                  <option key={service.id} value={service.id}>
                    {service.title}
                  </option>
                ))}
              </select>
            )}
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
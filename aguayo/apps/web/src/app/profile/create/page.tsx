// apps/web/src/app/profile/create/page.tsx
'use client' // este componente se renderiza en cliente

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSession } from 'next-auth/react'

// --------------------------------------------------
// 1. Definimos el esquema de validación con Zod
// --------------------------------------------------
const profileSchema = z.object({
  fullName: z.string().min(3, 'El nombre completo es obligatorio'),
  birthDate: z.string().nonempty('La fecha de nacimiento es obligatoria'),
  phoneNumber: z.string().min(7, 'El número de celular es obligatorio'),
  location: z.string().nonempty('La ubicación es obligatoria'),
  servicesOffered: z
    .array(z.string())
    .min(1, 'Selecciona al menos 1 servicio'),
  bio: z.string().max(500).optional(),
  // Para archivos, recibimos FileList
  profileImage: z
    .instanceof(FileList)
    .refine((files) => files.length === 1, 'Debes subir una foto de perfil'),
  idFront: z
    .instanceof(FileList)
    .refine((files) => files.length === 1, 'Debes subir foto del carnet anverso'),
  idBack: z
    .instanceof(FileList)
    .refine((files) => files.length === 1, 'Debes subir foto del carnet reverso'),
  // Galería opcional
  gallery: z
    .instanceof(FileList)
    .optional(),
})

// Derivamos el tipo de datos del formulario
type ProfileFormData = z.infer<typeof profileSchema>

export default function CreateProfilePage() {
  const { data: session } = useSession()
  const [errorMsg, setErrorMsg] = useState('')
  const [loading, setLoading] = useState(false)

  // --------------------------------------------------
  // 2. Inicializamos React Hook Form con Zod
  // --------------------------------------------------
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  })

  // --------------------------------------------------
  // 3. Función de envío del formulario
  // --------------------------------------------------
  const onSubmit = async (data: ProfileFormData) => {
    if (!session?.user?.id) {
      setErrorMsg('No estás autenticado')
      return
    }
    setLoading(true)
    setErrorMsg('')
    try {
      // Preparamos FormData para subir archivos
      const formData = new FormData()
      formData.append('fullName', data.fullName)
      formData.append('birthDate', data.birthDate)
      formData.append('phoneNumber', data.phoneNumber)
      formData.append('location', data.location)
      data.servicesOffered.forEach((s) => formData.append('servicesOffered[]', s))
      if (data.bio) formData.append('bio', data.bio)

      // Como garantizamos con Zod que es FileList de longitud 1:
      formData.append('profileImage', data.profileImage.item(0)!)
      formData.append('idFront', data.idFront.item(0)!)
      formData.append('idBack', data.idBack.item(0)!)

      // Galería opcional
      if (data.gallery) {
        Array.from(data.gallery).forEach((file: File) =>
          formData.append('gallery', file)
        )
      }

      // Enviamos a nuestro endpoint API
      const res = await fetch('/api/profile/create', {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) throw new Error('Error creando perfil')
      // Redirigir o mostrar éxito
      window.location.href = '/dashboard'
    } catch (err: any) {
      setErrorMsg(err.message || 'Ha ocurrido un error')
    } finally {
      setLoading(false)
    }
  }

  // --------------------------------------------------
  // 4. Render del formulario
  // --------------------------------------------------
  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Crear perfil de proveedor</h1>

      {errorMsg && (
        <div className="mb-4 text-red-600 bg-red-100 p-2 rounded">{errorMsg}</div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Nombre completo */}
        <div>
          <label className="block font-medium">Nombre completo</label>
          <input
            type="text"
            {...register('fullName')}
            className="w-full border p-2 rounded"
          />
          {errors.fullName && (
            <p className="text-red-500">{errors.fullName.message}</p>
          )}
        </div>

        {/* Fecha de nacimiento */}
        <div>
          <label className="block font-medium">Fecha de nacimiento</label>
          <input
            type="date"
            {...register('birthDate')}
            className="w-full border p-2 rounded"
          />
          {errors.birthDate && (
            <p className="text-red-500">{errors.birthDate.message}</p>
          )}
        </div>

        {/* Número de celular */}
        <div>
          <label className="block font-medium">Celular</label>
          <input
            type="tel"
            {...register('phoneNumber')}
            className="w-full border p-2 rounded"
            placeholder="+591 7XXXXXXX"
          />
          {errors.phoneNumber && (
            <p className="text-red-500">{errors.phoneNumber.message}</p>
          )}
        </div>

        {/* Ubicación */}
        <div>
          <label className="block font-medium">Ubicación</label>
          <input
            type="text"
            {...register('location')}
            className="w-full border p-2 rounded"
            placeholder="Ciudad, barrio o zona"
          />
          {errors.location && (
            <p className="text-red-500">{errors.location.message}</p>
          )}
        </div>

        {/* Servicios que ofrece */}
        <div>
          <label className="block font-medium">Servicios que ofrezco</label>
          <select
            multiple
            {...register('servicesOffered')}
            className="w-full border p-2 rounded"
          >
            <option value="cleaning">Limpieza</option>
            <option value="plumbing">Plomería</option>
            <option value="gardening">Jardinería</option>
            {/* Agrega más opciones según tu negocio */}
          </select>
          {errors.servicesOffered && (
            <p className="text-red-500">{errors.servicesOffered.message}</p>
          )}
        </div>

        {/* Biografía opcional */}
        <div>
          <label className="block font-medium">Biografía (opcional)</label>
          <textarea
            {...register('bio')}
            className="w-full border p-2 rounded"
            rows={3}
          />
          {errors.bio && <p className="text-red-500">{errors.bio.message}</p>}
        </div>

        {/* Foto de perfil */}
        <div>
          <label className="block font-medium">Foto de perfil</label>
          <input
            type="file"
            accept="image/*"
            capture="user"
            {...register('profileImage')}
          />
          {errors.profileImage && (
            <p className="text-red-500">{errors.profileImage.message}</p>
          )}
        </div>

        {/* Carnet anverso */}
        <div>
          <label className="block font-medium">Carnet (anverso)</label>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            {...register('idFront')}
          />
          {errors.idFront && (
            <p className="text-red-500">{errors.idFront.message}</p>
          )}
        </div>

        {/* Carnet reverso */}
        <div>
          <label className="block font-medium">Carnet (reverso)</label>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            {...register('idBack')}
          />
          {errors.idBack && (
            <p className="text-red-500">{errors.idBack.message}</p>
          )}
        </div>

        {/* Galería opcional */}
        <div>
          <label className="block font-medium">Galería (opcional)</label>
          <input
            type="file"
            accept="image/*,video/*"
            multiple
            {...register('gallery')}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
        >
          {loading ? 'Guardando...' : 'Crear perfil'}
        </button>
      </form>
    </div>
  )
}

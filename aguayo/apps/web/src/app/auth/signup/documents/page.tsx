// apps/web/src/app/auth/signup/documents/page.tsx
'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { useEffect, useState } from 'react'

type DocumentsForm = {
  idFront: FileList
  idBack: FileList
  profileImage: FileList // Asumo que la foto de perfil también se sube aquí
  gallery?: FileList // Solo para proveedores
}

export default function DocumentsStep() {
  const router = useRouter()
  const { register, handleSubmit } = useForm<DocumentsForm>()
  const [role, setRole] = useState<'PROVIDER' | 'CONSUMER' | null>(null) // Necesitamos el rol aquí
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const storedRole = localStorage.getItem('signupRole') as 'PROVIDER' | 'CONSUMER' | null
    const personalData = localStorage.getItem('signupPersonal')

    if (!storedRole || !personalData) {
      // Si no hay rol o datos personales, redirige al paso personal
      router.replace('/auth/signup/personal')
      return
    }
    setRole(storedRole)

    // Aquí podrías cargar los datos de documentos si ya fueron subidos
    // y quieres permitir al usuario "saltarse" este paso si ya los tiene
    // Para simplificar, asumimos que siempre se suben en este paso
  }, [router])

  const onSubmit = async (data: DocumentsForm) => {
    setIsSubmitting(true)
    setError(null)

    const storedRole = localStorage.getItem('signupRole') as 'PROVIDER' | 'CONSUMER' | null
    const personalData = JSON.parse(localStorage.getItem('signupPersonal') || '{}')

    if (!storedRole) {
      setError('Rol no seleccionado. Por favor, vuelva al paso anterior.')
      setIsSubmitting(false)
      return router.replace('/auth/signup/role')
    }
    if (Object.keys(personalData).length === 0) {
      setError('Datos personales incompletos. Por favor, vuelva al paso anterior.')
      setIsSubmitting(false)
      return router.replace('/auth/signup/personal')
    }

    const profileImageFile = data.profileImage?.[0]
    if (!profileImageFile) {
      setError('Debes subir una foto de perfil.')
      setIsSubmitting(false)
      return
    }

    let idFrontFile: File | undefined
    let idBackFile: File | undefined
    let galleryFiles: File[] = []

    if (storedRole === 'PROVIDER') {
      idFrontFile = data.idFront?.[0]
      idBackFile = data.idBack?.[0]
      galleryFiles = Array.from(data.gallery || [])

      if (!idFrontFile || !idBackFile) {
        setError('Debes subir ambos lados del carnet para ser proveedor.')
        setIsSubmitting(false)
        return
      }
    }

    // Aquí, en lugar de enviar a /api/profile/create, simulamos guardar
    // los datos de los archivos en localStorage.
    // EN UN ESCENARIO REAL Y SEGURO:
    // Deberías subir los archivos a Supabase (o un servicio de almacenamiento)
    // directamente desde este cliente y luego guardar las URLs/keys en localStorage.
    // Esto es para que no tengas que enviar los archivos binarios
    // en cada solicitud de API de los pasos.
    // Por simplicidad y para seguir tu patrón, vamos a "simular"
    // que se guardan los "datos del archivo" en localStorage,
    // que luego serán tomados por el paso `finish`.

    // **IMPORTANTE**: Almacenar File objetos en localStorage NO es buena práctica
    // por su tamaño y por ser objetos complejos. Lo correcto sería:
    // 1. Subir los archivos a Supabase AQUÍ.
    // 2. Obtener las URLs/keys de Supabase.
    // 3. Almacenar esas URLs/keys en localStorage.
    // Esto es solo un ejemplo para mantener la estructura de tu wizard.
    // Si realmente quieres enviar los archivos en la llamada final,
    // el paso 'finish' necesitará acceso a los objetos File reales.

    // Por ahora, y para el propósito de este wizard que culmina en 'finish',
    // NO vamos a hacer la llamada a la API aquí.
    // Simplemente vamos a guardar la información para el siguiente paso.

    // Si estás usando FormData para /api/profile/create, necesitarás una forma
    // de pasar los File objects al paso 'finish'.
    // Esto es un desafío con localStorage.
    // Una alternativa es usar un contexto global (React Context)
    // o un estado manejado por Zustand/Redux para los datos del wizard.

    // DADO QUE TU API /api/profile/create ESPERA FormData (que incluye Files):
    // La mejor estrategia es recolectar todos los datos (incluyendo Files)
    // en un contexto o estado global y ENVIARLOS TODOS JUNTOS desde `finish/page.tsx`.
    // Esto significa que los archivos NO se guardarán en localStorage.

    // **RECOMENDACIÓN FUERTE:** Usa un contexto de React o Zustand para el estado global del wizard.
    // Pero si quieres mantener `localStorage` para ahora, la única forma de pasar `File` objetos
    // es que el `finish` acceda al mismo `FormData` o a los objetos `File` directamente.
    // Esto es complicado si recargas la página entre `documents` y `finish`.

    // **OPCIÓN TEMPORAL Y MENOS IDEAL (manteniendo localStorage para files de forma indirecta):**
    // Guarda solo el nombre o una indicación de que se seleccionaron los archivos,
    // pero el usuario tendría que re-seleccionarlos en 'finish' para el FormData final,
    // o confiar en que los `File` objetos se puedan pasar de otra forma.

    // Dadas tus implementaciones actuales, donde `profile/create` espera `FormData` con `File`s:
    // La página `documents` debería preparar los `File`s y pasarlos al siguiente paso,
    // no subirlos aún ni guardarlos en `localStorage`.

    // Vamos a ajustar esto para que la página `finish` sea la que envíe *todos* los datos,
    // incluyendo los archivos, usando un **estado global de React (Context)** para el wizard.
    // Es la forma más limpia de pasar `File` objetos entre componentes cliente-lado.
    // Si no quieres añadir React Context ahora, tendrías que re-seleccionar los archivos en `finish`
    // o manejar la subida de archivos en `documents` y guardar las URLs en `localStorage`
    // (y modificar `profile/create` para que acepte URLs para imágenes, no archivos binarios).

    // **Asumiendo que vamos a usar `localStorage` y que la API `/api/profile/create`
    // seguirá esperando `FormData` con los archivos reales:**

    // La lógica de `DocumentsStep` necesita un cambio fundamental si quieres que
    // los archivos se incluyan en el `FormData` final en el paso `finish`.
    // Los objetos `File` no se serializan bien para `localStorage`.

    // UNA SOLUCIÓN CON localStorage QUE IMPLICA RESELECCIONAR EN EL ÚLTIMO PASO (MENOS IDEAL PARA UX):
    // El paso `documents` simplemente verifica que los archivos fueron seleccionados y
    // permite al usuario continuar, pero no los almacena.
    // En `finish`, el usuario tendría que volver a seleccionar las imágenes para el envío final.
    // Esto no es bueno para la UX.

    // MEJOR SOLUCIÓN SIN ESTADO GLOBAL (Pero requiere refactorizar `profile/create`):
    // 1. En `documents/page.tsx`, sube los archivos a Supabase.
    // 2. Guarda las URLs de los archivos en `localStorage`.
    // 3. En `finish/page.tsx`, recupera las URLs de `localStorage` y envíalas a `/api/profile`.
    // 4. `profile/create` (o una nueva API) debe aceptar URLs para las imágenes, no `File` objetos.

    // **Dada tu configuración actual con `/api/profile/create` esperando FormData con `File`s,
    // Y el uso de localStorage, lo más directo es hacer la llamada final en `documents/page.tsx`
    // SI SOLO LOS PROVEEDORES SUBEN DOCUMENTOS.**

    // REPLANTEANDO: Si solo los proveedores suben documentos y el `finish` es solo para consumidores
    // o una confirmación, entonces `documents` es el lugar para la llamada a la API si eres PROVEEDOR.

    // Vamos a ajustar `documents/page.tsx` para que si el rol es **PROVIDER**,
    // envíe TODOS los datos (incluyendo archivos) a `/api/profile/create`.
    // Si el rol es **CONSUMER**, no necesita archivos, y los datos personales se enviarán desde `finish`.

    // Nuevo enfoque para `documents/page.tsx`:
    // Si es PROVIDER: Recolecta todos los datos (de localStorage y archivos de este paso),
    //                  y envía a /api/profile/create. Luego redirige al dashboard.
    // Si es CONSUMER: Este paso se omite o solo carga la imagen de perfil. Los demás datos
    //                  se recopilan y se envían en `finish`.

    // **Vamos a simplificar y hacer que `documents/page.tsx` sea el punto de envío final
    // para AMBOS tipos de usuario, ya que todos necesitan subir una `profileImage`.**
    // Esto significa que `/api/profile/create` necesita estar configurado para manejar
    // todos los campos opcionales y requeridos según el rol.

    try {
      // Recolectar todos los datos
      const formData = new FormData()
      formData.append('role', storedRole)
      Object.entries(personalData).forEach(([key, value]) => {
        // Asegúrate de que los valores sean strings para FormData
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          // Si es un objeto complejo (ej. fecha si no se parseó a string), maneja
          formData.append(key, JSON.stringify(value))
        } else if (Array.isArray(value)) {
          value.forEach(item => formData.append(`${key}[]`, item))
        } else {
          formData.append(key, String(value))
        }
      })

      // Adjuntar archivos
      formData.append('profileImage', profileImageFile)
      if (idFrontFile) formData.append('idFront', idFrontFile)
      if (idBackFile) formData.append('idBack', idBackFile)
      galleryFiles.forEach(file => formData.append('gallery', file))

      const response = await fetch('/api/profile/create', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al completar el registro.')
      }

      // Limpiar localStorage después de un envío exitoso
      localStorage.removeItem('signupRole')
      localStorage.removeItem('signupPersonal')
      localStorage.removeItem('signupDocumentsUploaded') // Si lo usas para otra cosa

      // Actualizar la sesión para reflejar que el perfil ya existe
      // Esto hará que `session.user.hasProfile` se actualice a `true`.
      // (Necesitas `useSession` con `update` aquí o en el layout, si no,
      // la sesión se actualizará en el siguiente request).
      // Para simplicidad, asumo que el layout o un wrapper ya lo gestiona.
      // O puedes hacer un `router.refresh()` para forzar la revalidación.
      // await update({ hasProfile: true }); // Si tuvieras update aquí

      // Redirigir al dashboard después de crear el perfil
      router.replace('/dashboard')

    } catch (err: any) {
      console.error('Error al completar el registro:', err)
      setError(err.message || 'Ocurrió un error inesperado.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!role) return null // espera validación inicial

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md mx-auto p-6">
      <h2 className="text-xl font-semibold">Documentos y Fotos</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div>
        <label>Foto de perfil <span className="text-red-500">*</span></label>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          {...register('profileImage', { required: 'La foto de perfil es obligatoria' })}
          className="w-full border p-2 rounded"
        />
      </div>

      {role === 'PROVIDER' && (
        <>
          <div>
            <label>Carnet (anverso) <span className="text-red-500">*</span></label>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              {...register('idFront', { required: 'El carnet anverso es obligatorio para proveedores' })}
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label>Carnet (reverso) <span className="text-red-500">*</span></label>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              {...register('idBack', { required: 'El carnet reverso es obligatorio para proveedores' })}
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label>Galería de trabajos (opcional)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              {...register('gallery')}
              className="w-full border p-2 rounded"
            />
          </div>
        </>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-green-600 text-white px-4 py-2 rounded w-full hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Finalizando registro...' : 'Finalizar registro'}
      </button>
    </form>
  )
}
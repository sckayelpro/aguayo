'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { useEffect, useState } from 'react'

type DocumentsForm = {
  idFront: FileList
  idBack: FileList
}

export default function DocumentsStep() {
  const router = useRouter()
  const { register, handleSubmit } = useForm<DocumentsForm>()
  const [alreadyUploaded, setAlreadyUploaded] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const role = localStorage.getItem('signupRole')
    const personal = localStorage.getItem('signupPersonal')

    if (!role || !personal) {
      router.replace('/signup/personal')
    } else {
      setReady(true)
    }

    // Opcional: verifica si ya se subieron antes los documentos
    const completed = localStorage.getItem('signupDocumentsUploaded')
    if (completed === 'true') {
      setAlreadyUploaded(true)
    }
  }, [router])

  const onSubmit = async (data: DocumentsForm) => {
    const role = localStorage.getItem('signupRole')
    const personal = JSON.parse(localStorage.getItem('signupPersonal') || '{}')

    if (!role || !personal) {
      alert('Faltan datos previos, vuelve al paso anterior.')
      return router.replace('/signup/personal')
    }

    if (alreadyUploaded) {
      return router.push('/signup/finish')
    }

    const idFrontFile = data.idFront?.[0]
    const idBackFile = data.idBack?.[0]

    if (!idFrontFile || !idBackFile) {
      alert('Debes subir ambos lados del carnet.')
      return
    }

    const formData = new FormData()
    formData.append('role', role)
    Object.entries(personal).forEach(([key, value]) => {
      formData.append(key, value as string)
    })
    formData.append('idFront', idFrontFile)
    formData.append('idBack', idBackFile)

    const res = await fetch('/api/profile/create', {
      method: 'POST',
      body: formData,
    })

    if (res.ok) {
      localStorage.setItem('signupDocumentsUploaded', 'true')
      router.push('/signup/finish')
    } else {
      alert('Error al subir documentos. Intenta de nuevo.')
    }
  }

  if (!ready) return null // espera validación inicial

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md mx-auto p-6">
      <h2 className="text-xl font-semibold">Documentos</h2>

      {alreadyUploaded && (
        <p className="text-green-600">
          Ya has subido tus documentos. Puedes continuar o volver atrás si deseas editarlos.
        </p>
      )}

      {!alreadyUploaded && (
        <>
          <div>
            <label>Carnet (anverso)</label>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              {...register('idFront')}
              required
            />
          </div>

          <div>
            <label>Carnet (reverso)</label>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              {...register('idBack')}
              required
            />
          </div>
        </>
      )}

      <button
        type="submit"
        className="bg-green-600 text-white px-4 py-2 rounded w-full hover:bg-green-700"
      >
        {alreadyUploaded ? 'Continuar' : 'Finalizar registro'}
      </button>
    </form>
  )
}

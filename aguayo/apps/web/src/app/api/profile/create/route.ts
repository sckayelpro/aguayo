// apps/web/src/app/api/profile/create/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'
import { prisma} from '@/lib/prisma'
import { supabase } from '@/lib/supabase'
import { Role } from 'prisma/generated/client'


export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const form = await req.formData()
  const userId = session.user.id
  const role = form.get('role') as 'PROVIDER' | 'CONSUMER'

  // Datos básicos
  const fullName = form.get('fullName') as string
  const birthDate = new Date(form.get('birthDate') as string)
  const phoneNumber = form.get('phoneNumber') as string
  const location = form.get('location') as string
  const bio = form.get('bio') as string | null

  const upload = async (file: File, path: string) => {
    const { data, error } = await supabase.storage
      .from('profiles')
      .upload(path, file, { contentType: file.type })
    if (error) throw error
    return data.path // usamos .path en lugar de .Key por supabase-js
  }

  // Documentos
  const idFrontFile = form.get('idFront') as File | null
  const idBackFile = form.get('idBack') as File | null
  let idFrontKey: string | null = null
  let idBackKey: string | null = null

  if (role === 'PROVIDER') {
    if (!idFrontFile || !idBackFile) {
      return NextResponse.json({ error: 'Documentos requeridos para proveedores' }, { status: 400 })
    }
    idFrontKey = await upload(idFrontFile, `${userId}/id-front.jpg`)
    idBackKey = await upload(idBackFile, `${userId}/id-back.jpg`)
  }

  // Foto de perfil (siempre requerida)
  const profileImageFile = form.get('profileImage') as File
  if (!profileImageFile) {
    return NextResponse.json({ error: 'Foto de perfil obligatoria' }, { status: 400 })
  }
  const profileImageKey = await upload(profileImageFile, `${userId}/profile.jpg`)

  // Servicios y galería (solo para PROVIDER)
  let servicesOffered: string[] = []
  let galleryKeys: string[] = []

  if (role === 'PROVIDER') {
    servicesOffered = form.getAll('servicesOffered[]').map(s => s as string)

    const galleryFiles = form.getAll('gallery') as File[]
    for (const file of galleryFiles) {
      const key = await upload(file, `${userId}/gallery/${file.name}`)
      galleryKeys.push(key)
    }
  }

  // Guardar en la base de datos
  const user = await prisma.user.update({
  where: { authUserId: userId },
  data: {
    fullName,
    birthDate,
    phoneNumber,
    location,
    bio,
    profileImage: profileImageKey,
    idFront: idFrontKey,
    idBack: idBackKey,
    role: role === 'PROVIDER' ? Role.PROVIDER : Role.CLIENT,
    servicesOffered: role === 'PROVIDER'
      ? { connect: servicesOffered.map(id => ({ id })) }
      : undefined,
    gallery: galleryKeys,
  },
})

  return NextResponse.json({ ok: true, user })
}

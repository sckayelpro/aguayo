// apps/web/src/app/api/profile/create/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'
import { prisma } from '@/lib/prisma'
import { supabase } from '@/lib/supabase'
import { Role } from 'prisma/generated/client'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    console.error('[API] profile/create: No autenticado')
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const role = formData.get('role') as Role

    // Datos básicos
    const fullName = formData.get('fullName') as string
    const birthDate = new Date(formData.get('birthDate') as string)
    const phoneNumber = formData.get('phoneNumber') as string
    const location = formData.get('location') as string
    const bio = formData.get('bio') as string | null

    // Función para subir archivos
    const upload = async (file: File, path: string) => {
      const { data, error } = await supabase.storage
        .from('profiles')
        .upload(path, file, { contentType: file.type })
      if (error) throw error
      return data.path
    }

    // Documentos (solo para proveedores)
    let idFrontKey: string | null = null
    let idBackKey: string | null = null

    if (role === Role.PROVIDER) {
      const idFrontFile = formData.get('idFront') as File | null
      const idBackFile = formData.get('idBack') as File | null

      if (!idFrontFile || !idBackFile) {
        return NextResponse.json({ error: 'Documentos requeridos para proveedores' }, { status: 400 })
      }

      idFrontKey = await upload(idFrontFile, `${session.user.id}/id-front.jpg`)
      idBackKey = await upload(idBackFile, `${session.user.id}/id-back.jpg`)
    }

    // Foto de perfil (requerida para todos)
    const profileImageFile = formData.get('profileImage') as File
    if (!profileImageFile) {
      return NextResponse.json({ error: 'Foto de perfil obligatoria' }, { status: 400 })
    }
    const profileImageKey = await upload(profileImageFile, `${session.user.id}/profile.jpg`)

    // Servicios y galería (solo para proveedores)
    let servicesOffered: string[] = []
    let galleryKeys: string[] = []

    if (role === Role.PROVIDER) {
      servicesOffered = formData.getAll('servicesOffered[]').map(s => s as string)

      const galleryFiles = formData.getAll('gallery') as File[]
      for (const file of galleryFiles) {
        const key = await upload(file, `${session.user.id}/gallery/${file.name}`)
        galleryKeys.push(key)
      }
    }

    // IMPORTANTE: Configurar el cliente de Supabase con la sesión del usuario
    // Si usas Supabase RLS, necesitas autenticar el cliente
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('Error de autenticación de Supabase:', authError)
      
      // Alternativa: Crear un cliente admin de Supabase que bypasse RLS
      const { createClient } = await import('@supabase/supabase-js')
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!, // Clave de servicio (admin)
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      )

      // Usar Prisma pero con el cliente admin para bypass RLS
      const profile = await prisma.profile.create({
        data: {
          authUserId: session.user.id,
          email: session.user.email!,
          fullName,
          birthDate,
          phoneNumber,
          location,
          bio,
          profileImage: profileImageKey,
          idFront: idFrontKey,
          idBack: idBackKey,
          role,
          gallery: galleryKeys,
          servicesOffered: role === Role.PROVIDER && servicesOffered.length > 0
            ? { connect: servicesOffered.map(id => ({ id })) }
            : undefined,
        },
      })

      return NextResponse.json({ ok: true, profile })
    }

    // Si llegamos aquí, Supabase está autenticado
    const profile = await prisma.profile.create({
      data: {
        authUserId: session.user.id,
        email: session.user.email!,
        fullName,
        birthDate,
        phoneNumber,
        location,
        bio,
        profileImage: profileImageKey,
        idFront: idFrontKey,
        idBack: idBackKey,
        role,
        gallery: galleryKeys,
        servicesOffered: role === Role.PROVIDER && servicesOffered.length > 0
          ? { connect: servicesOffered.map(id => ({ id })) }
          : undefined,
      },
    })

    return NextResponse.json({ ok: true, profile })
    
  } catch (error) {
    console.error("Error creating profile:", error)
    return NextResponse.json({ 
      error: "Error interno del servidor", 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
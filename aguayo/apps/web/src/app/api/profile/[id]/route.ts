// apps/web/src/app/api/profile/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase'; // Asegúrate de importar supabase para subir archivos
import { Role } from 'prisma/generated/client'; // Importa Role

// --- GET (Para obtener el perfil - ya lo tienes) ---
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // ... (código existente para GET) ...
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  const { id } = params;

  if (session.user.id !== id) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  try {
    const profile = await prisma.profile.findUnique({
      where: {
        authUserId: id,
      },
      include: {
        servicesOffered: { // Asegúrate que esto coincide con tu schema si es relación
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 });
    }

    return NextResponse.json(profile, { status: 200 });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: (error as Error).message },
      { status: 500 }
    );
  }
}


// --- PUT (Para actualizar el perfil) ---
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  const { id: authUserId } = params; // El ID de la URL es el authUserId del perfil

  if (session.user.id !== authUserId) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  try {
    const formData = await req.formData();

    // Obtener el perfil actual para saber su rol y documentos/galería existentes
    const currentProfile = await prisma.profile.findUnique({
      where: { authUserId: authUserId },
      select: { role: true, profileImage: true, idFront: true, idBack: true, gallery: true }
    });

    if (!currentProfile) {
        return NextResponse.json({ error: 'Perfil no encontrado para actualizar' }, { status: 404 });
    }

    const role = currentProfile.role; // El rol no se cambia en este endpoint

    // Datos básicos
    const fullName = formData.get('fullName') as string;
    const birthDate = new Date(formData.get('birthDate') as string);
    const phoneNumber = formData.get('phoneNumber') as string;
    const location = formData.get('location') as string;
    const bio = formData.get('bio') as string | null;

    // Función auxiliar para subir archivos
    const uploadFile = async (file: File, path: string) => {
      const { data, error } = await supabase.storage
        .from('profiles')
        .upload(path, file, { contentType: file.type, upsert: true }); // `upsert: true` para sobrescribir
      if (error) throw error;
      return data.path;
    };

    let profileImageKey = currentProfile.profileImage; // Mantener la actual si no se sube una nueva
    const newProfileImageFile = formData.get('profileImage') as File | null;
    if (newProfileImageFile && newProfileImageFile.size > 0) {
      profileImageKey = await uploadFile(newProfileImageFile, `${authUserId}/profile.jpg`);
    }

    let idFrontKey = currentProfile.idFront;
    let idBackKey = currentProfile.idBack;
    let galleryKeys: string[] = currentProfile.gallery || []; // Mantener las actuales

    if (role === Role.PROVIDER) {
      const newIdFrontFile = formData.get('idFront') as File | null;
      const newIdBackFile = formData.get('idBack') as File | null;
      const newGalleryFiles = formData.getAll('gallery') as File[]; // Nuevos archivos para añadir

      if (newIdFrontFile && newIdFrontFile.size > 0) {
        idFrontKey = await uploadFile(newIdFrontFile, `${authUserId}/id-front.jpg`);
      }
      if (newIdBackFile && newIdBackFile.size > 0) {
        idBackKey = await uploadFile(newIdBackFile, `${authUserId}/id-back.jpg`);
      }

      // Añadir nuevas imágenes a la galería (no reemplaza las existentes)
      for (const file of newGalleryFiles) {
        if (file.size > 0) { // Asegúrate de que el archivo no esté vacío
          const key = await uploadFile(file, `${authUserId}/gallery/${Date.now()}-${file.name}`); // Añadir timestamp para evitar conflictos
          galleryKeys.push(key);
        }
      }
    }

    // Manejar servicios ofrecidos (solo para proveedores)
    let servicesOfferedUpdate: { connect?: { id: string }[], disconnect?: { id: string }[] } | undefined;
    if (role === Role.PROVIDER) {
      const newServicesSelectedIds = formData.getAll('servicesOffered[]').map(s => s as string);

      // Obtener los IDs de los servicios actuales del proveedor (si los hay)
      const currentProviderServices = await prisma.profile.findUnique({
        where: { authUserId: authUserId },
        select: { servicesOffered: { select: { id: true } } }
      });
      const currentServicesIds = currentProviderServices?.servicesOffered.map(s => s.id) || [];

      const servicesToConnect = newServicesSelectedIds.filter(id => !currentServicesIds.includes(id));
      const servicesToDisconnect = currentServicesIds.filter(id => !newServicesSelectedIds.includes(id));

      if (servicesToConnect.length > 0 || servicesToDisconnect.length > 0) {
        servicesOfferedUpdate = {};
        if (servicesToConnect.length > 0) {
          servicesOfferedUpdate.connect = servicesToConnect.map(id => ({ id }));
        }
        if (servicesToDisconnect.length > 0) {
          servicesOfferedUpdate.disconnect = servicesToDisconnect.map(id => ({ id }));
        }
      }
    }

    const updatedProfile = await prisma.profile.update({
      where: {
        authUserId: authUserId,
      },
      data: {
        fullName,
        birthDate,
        phoneNumber,
        location,
        bio,
        profileImage: profileImageKey,
        idFront: idFrontKey,
        idBack: idBackKey,
        gallery: galleryKeys, // Actualiza la lista completa de la galería
        servicesOffered: servicesOfferedUpdate,
      },
    });

    return NextResponse.json({ ok: true, profile: updatedProfile }, { status: 200 });

  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({
      error: 'Error interno del servidor al actualizar el perfil',
      details: (error as Error).message,
    }, { status: 500 });
  }
}
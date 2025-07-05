// apps/web/src/app/api/profile/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/authOptions';
import { prisma } from '@/lib/prisma'; // Tu instancia de Prisma global

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ message: 'No autenticado' }, { status: 401 });
  }

  // Prevenir que un usuario ya con perfil cree otro
  if (session.user.hasProfile) {
    return NextResponse.json({ message: 'El usuario ya tiene un perfil' }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { role, fullName, phoneNumber, /* ...otros campos del perfil... */ } = body;

    // Validación básica
    if (!role || !fullName || !session.user.email) {
      return NextResponse.json({ message: 'Faltan datos requeridos para el perfil' }, { status: 400 });
    }

    // Crear el perfil en tu base de datos
    const newProfile = await prisma.profile.create({
      data: {
        authUserId: session.user.id, // El ID del usuario de NextAuth
        email: session.user.email, // El email del usuario de NextAuth
        role: role,
        fullName: fullName,
        phoneNumber: phoneNumber,
        // ... otros campos que recibas del wizard
      },
    });

    // Una vez que el perfil se crea, la sesión debe ser actualizada
    // para que `session.user.hasProfile` sea `true`.
    // NextAuth automáticamente revalida la sesión en el siguiente request
    // si usas el `useSession` hook con `revalidate` o si el token de sesión expira y se refresca.
    // Para forzar una revalidación inmediata, puedes hacer un `router.refresh()` en el cliente.

    return NextResponse.json({ message: 'Perfil creado exitosamente', profileId: newProfile.id }, { status: 201 });

  } catch (error) {
    console.error('Error al crear el perfil:', error);
    return NextResponse.json({ message: 'Error interno del servidor al crear el perfil' }, { status: 500 });
  }
}
// apps/web/src/app/api/publications/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/authOptions';
import { prisma } from '@/lib/prisma';
import { PriceType } from 'prisma/generated/client'; // <-- Importar el Enum de Prisma

// POST: Crear una nueva publicación
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'No autenticado o sesión inválida' }, { status: 401 });
  }

  const profile = await prisma.profile.findUnique({
    where: { authUserId: session.user.id },
  });

  if (!profile || profile.role !== 'PROVIDER') {
    return NextResponse.json({ error: 'Acceso denegado. Solo proveedores pueden crear publicaciones.' }, { status: 403 });
  }

  try {
    const { title, description, serviceId, price, priceType, images } = await req.json();

    // Validaciones básicas
    if (!title || !description || !serviceId || !priceType) {
      return NextResponse.json({ error: 'Faltan campos obligatorios: título, descripción, servicio, tipo de precio.' }, { status: 400 });
    }

    // Validación para PriceType usando el Enum
    if (!Object.values(PriceType).includes(priceType as PriceType)) {
      return NextResponse.json({ error: 'Tipo de precio inválido.' }, { status: 400 });
    }

    // Validar si el servicio existe y si el proveedor lo ofrece
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: { profilesOffering: true }
    });

    if (!service) {
      return NextResponse.json({ error: 'El servicio seleccionado no existe.' }, { status: 404 });
    }

    const isServiceOfferedByProvider = service.profilesOffering.some(p => p.id === profile.id);

    if (!isServiceOfferedByProvider) {
      return NextResponse.json({ error: 'El servicio seleccionado no está registrado como ofrecido por tu perfil.' }, { status: 400 });
    }

    // Convertir precio a Decimal si no es NEGOTIABLE
    const finalPrice = priceType === PriceType.NEGOTIABLE ? null : (price ? parseFloat(price) : null);

    // Si el tipo de precio no es NEGOTIABLE y el precio es nulo, devolver error
    if (priceType !== PriceType.NEGOTIABLE && finalPrice === null) {
      return NextResponse.json({ error: 'El precio es obligatorio para este tipo de precio.' }, { status: 400 });
    }
    // Si el precio existe y es menor o igual a 0, devolver error
    if (finalPrice !== null && finalPrice <= 0) {
      return NextResponse.json({ error: 'El precio debe ser mayor a 0.' }, { status: 400 });
    }


    const newPublication = await prisma.publication.create({
      data: {
        title,
        description,
        price: finalPrice,
        priceType: priceType as PriceType, // Asegurar que el tipo es correcto
        images: images || [],
        providerId: profile.id,
        serviceId,
      },
    });

    return NextResponse.json(newPublication, { status: 201 });

  } catch (error) {
    console.error('Error al crear la publicación:', error);
    // Para errores de Prisma, puedes añadir más detalle si es necesario
    if (error instanceof Error) {
      return NextResponse.json({ error: `Error interno del servidor al crear la publicación: ${error.message}` }, { status: 500 });
    }
    return NextResponse.json({ error: 'Error interno del servidor al crear la publicación.' }, { status: 500 });
  }
}

// GET: Obtener publicaciones (puede ser por ID de proveedor o todas)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const providerId = searchParams.get('providerId'); // Si se busca por un proveedor específico
  const includeInactive = searchParams.get('includeInactive') === 'true'; // Nuevo param para ver inactivas
  const includeDeleted = searchParams.get('includeDeleted') === 'true'; // Nuevo param para ver eliminadas

  try {
    const whereClause: any = {};

    if (providerId) {
      whereClause.providerId = providerId;
    }

    // Filtrar publicaciones activas por defecto, a menos que se pida incluir inactivas
    if (!includeInactive) {
      whereClause.isActive = true;
    }

    // Filtrar publicaciones no eliminadas por defecto, a menos que se pida incluir eliminadas
    if (!includeDeleted) {
      whereClause.isDeleted = false;
    }

    const publications = await prisma.publication.findMany({
      where: whereClause,
      include: {
        service: true,
        provider: {
          select: {
            fullName: true,
            profileImage: true,
            location: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(publications, { status: 200 });

  } catch (error) {
    console.error('Error al obtener publicaciones:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: `Error interno del servidor al obtener publicaciones: ${error.message}` }, { status: 500 });
    }
    return NextResponse.json({ error: 'Error interno del servidor al obtener publicaciones.' }, { status: 500 });
  }
}
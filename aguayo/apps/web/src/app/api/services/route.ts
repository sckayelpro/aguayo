// apps/web/src/app/api/services/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const services = await prisma.service.findMany({
      select: {
        id: true,
        title: true,
        // Puedes seleccionar más campos si los necesitas en el frontend
      },
    })
    return NextResponse.json(services, { status: 200 })
  } catch (error) {
    console.error("Error fetching services:", error)
    return NextResponse.json(
      { error: 'Error al obtener los servicios' },
      { status: 500 }
    )
  }
}
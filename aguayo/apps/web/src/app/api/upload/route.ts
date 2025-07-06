// apps/web/src/app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid'; // Para generar nombres de archivo únicos
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/authOptions';

// Inicializa el cliente de Supabase (lado del servidor)
// Usa la clave de "Service Role" para tener permisos de escritura en Storage
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// Define el tamaño máximo de archivo permitido (ej: 5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Configuración para Next.js para manejar FormData
export const config = {
  api: {
    bodyParser: false, // Deshabilita el body parser predeterminado de Next.js para manejar FormData
  },
};

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'No autenticado o sesión inválida' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const bucketName = searchParams.get('bucket') || 'publications';

  try {
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No se encontraron archivos para subir.' }, { status: 400 });
    }

    if (files.length > 5) {
      return NextResponse.json({ error: 'Solo se permiten subir hasta 5 imágenes por publicación.' }, { status: 400 });
    }

    const uploadedUrls: string[] = [];

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: `El archivo ${file.name} excede el tamaño máximo permitido de ${MAX_FILE_SIZE / (1024 * 1024)} MB.` }, { status: 400 });
      }
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        return NextResponse.json({ error: `El archivo ${file.name} tiene un tipo no permitido (${file.type}). Solo se permiten JPG, PNG, WEBP.` }, { status: 400 });
      }

      const fileExtension = file.name.split('.').pop();
      const uniqueFileName = `${uuidv4()}.${fileExtension}`;
      const filePath = `${session.user.id}/${uniqueFileName}`; // Guarda en una carpeta por usuario

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, buffer, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type,
        });

      if (error) {
        console.error('Error al subir a Supabase:', error);
        return NextResponse.json({ error: `Error al subir el archivo ${file.name}: ${error.message}` }, { status: 500 });
      }

      const { data: publicUrlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      if (publicUrlData) {
        uploadedUrls.push(publicUrlData.publicUrl);
      }
    }

    return NextResponse.json({ urls: uploadedUrls }, { status: 200 });

  } catch (error) {
    console.error('Error general en la API de subida:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: `Error interno del servidor al procesar la subida de archivos: ${error.message}` }, { status: 500 });
    }
    return NextResponse.json({ error: 'Error interno del servidor al procesar la subida de archivos.' }, { status: 500 });
  }
}
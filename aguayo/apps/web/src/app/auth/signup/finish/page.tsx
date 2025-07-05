// apps/web/src/app/auth/signup/finish/page.tsx
'use client'

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

export default function FinishSignup() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    // Si ya tiene perfil, lo redirigimos
    if (status === 'authenticated' && session?.user.hasProfile) {
      router.replace('/dashboard');
    } else if (status === 'authenticated' && !session?.user.hasProfile) {
      // Si está autenticado pero aún no tiene perfil,
      // esto implica que la creación del perfil falló o no se ha completado
      // en el paso 'documents'. Podemos redirigirlo de vuelta a 'documents'
      // o a una página de error/reintento.
      // Por simplicidad, si llegó aquí sin perfil, lo enviamos al dashboard
      // y asumimos que la sesión se actualizará luego, o que ya se envió.
      // En un flujo ideal, esto no debería pasar si documents/page.tsx hace el envío final.
      console.warn("Llegó a /signup/finish sin un perfil completado. Redirigiendo a /dashboard.");
      router.replace('/dashboard'); // O a /auth/signup/documents si el envío falló
    }
  }, [status, session, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p>Cargando...</p>
      </div>
    );
  }

  // Si ya tiene perfil, no mostrar nada, el useEffect ya lo redirigió
  if (status === 'authenticated' && session?.user.hasProfile) return null;

  // Si no está autenticado, o si llegó aquí por alguna razón sin perfil
  // (lo cual debería ser raro con la lógica anterior), se podría mostrar un mensaje.
  return (
    <div className="max-w-md mx-auto p-6 text-center">
      <h1 className="text-2xl font-bold mb-4">¡Registro completado!</h1>
      <p className="mb-6">
        Tu perfil ha sido creado exitosamente. Serás redirigido al dashboard en breve.
      </p>
    </div>
  );
}
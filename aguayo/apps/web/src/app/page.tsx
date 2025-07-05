// apps/web/src/app/page.tsx (Ejemplo de cómo debería ser tu página raíz si no lo es ya)
'use client'

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import AuthButton from '@/components/auth/AuthButton';
import styles from './page.module.css'; // Asegúrate de tener un archivo CSS para estilos personalizados

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      if (!session.user.hasProfile) {
        // Si está autenticado pero no tiene perfil, redirige al wizard
        router.replace('/auth/signup/role');
      } else {
        // Opcional: Si ya tiene perfil, podrías redirigirlo automáticamente al dashboard
        // router.replace('/dashboard');
      }
    }
  }, [status, session, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Cargando sesión...</p>
      </div>
    );
  }

  // Si el usuario no está autenticado, muestra la bienvenida general o un botón de login.
  // Si está autenticado y tiene perfil, muestra el contenido normal de la home.
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-6">Bienvenido a Aguayo 👋</h1>
      <p className="text-lg text-gray-700 mb-8 text-center max-w-xl">
        Encuentra personas de confianza para realizar servicios como limpieza, jardinería, cuidado de personas y más.
      </p>

      {status === 'unauthenticated' && (
        <AuthButton /> // Tu componente de botón de login/registro
      )}

      {status === 'authenticated' && session.user.hasProfile && (
        <button
          onClick={() => router.push('/dashboard')}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg hover:bg-blue-700 transition-colors"
        >
          Ir al Dashboard
        </button>
      )}

      <p className="mt-10 text-gray-500 text-sm">© 2025 Aguayo. Todos los derechos reservados.</p>
    </div>
  );
}
// apps/web/src/components/layout/UserNav.tsx
'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Importar useRouter para redirecciones

export default function UserNav() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === 'loading') {
    return <div className="text-gray-600">Cargando...</div>; // O un spinner
  }

  if (status === 'authenticated') {
    return (
      <div className="flex items-center space-x-4">
        {/* Enlace al Dashboard */}
        <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
          Dashboard
        </Link>

        {/* Enlace al Perfil del usuario */}
        <Link href="/profile" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
          Mi Perfil
        </Link>

        {/* Podrías añadir más enlaces aquí, ej. "Mis Servicios" si es proveedor */}
        {session.user.role === 'PROVIDER' && (
           <Link href="/my-services" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
             Mis Servicios
           </Link>
        )}

        {/* Menú desplegable o simple botón de Logout */}
        <span className="font-semibold text-blue-700">Hola, {session.user.name || session.user.email}!</span>
        <button
          onClick={() => signOut({ callbackUrl: '/' })} // Redirige a la página principal después de cerrar sesión
          className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
        >
          Cerrar Sesión
        </button>
      </div>
    );
  }

  // Si no está autenticado, muestra el AuthButton (Login/Register)
  return (
    <div className="flex items-center space-x-4">
      <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 font-medium">
        Iniciar Sesión
      </Link>
      <Link href="/auth/signup/role" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
        Registrarse
      </Link>
    </div>
  );
}
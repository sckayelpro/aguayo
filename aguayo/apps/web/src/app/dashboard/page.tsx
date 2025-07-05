// apps/web/src/app/dashboard/page.tsx
'use client'; // Si vas a usar hooks de cliente, como useSession

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Opcional: Proteger la ruta del dashboard si no está autenticado
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/auth/login'); // O donde sea tu página de login
    }
  }, [status, router]);

  if (status === 'loading') {
    return <div className="flex justify-center items-center h-screen">Cargando dashboard...</div>;
  }

  if (!session || !session.user) {
    return null; // O un mensaje de "Acceso denegado"
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Bienvenido al Dashboard, {session.user.name || session.user.email}!</h1>
      {session.user.role && (
        <p className="text-lg">Tu rol: {session.user.role}</p>
      )}
      {session.user.hasProfile && (
        <p className="text-md">Perfil completo: Sí</p>
      )}
      <p className="mt-4">¡Aquí es donde construirás la funcionalidad principal de tu aplicación!</p>
    </div>
  );
}
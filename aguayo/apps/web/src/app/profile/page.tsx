// apps/web/src/app/profile/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import type { Profile, Role, Service } from 'prisma/generated/client';
import Link from 'next/link';

type ProfileWithServices = Profile & {
  servicesOffered?: Service[];
};

// Define la URL base de Supabase Storage para no repetirla
const SUPABASE_STORAGE_BASE_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/profiles`;

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileWithServices | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session || !session.user?.id) {
      router.replace('/auth/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/profile/${session.user.id}`);
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to fetch profile');
        }
        const data: ProfileWithServices = await res.json();
        setProfile(data);
      } catch (err: any) {
        console.error('Error fetching profile:', err);
        setError(err.message || 'Error al cargar el perfil.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [session, status, router]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Cargando perfil...</div>;
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <p>No se encontró el perfil.</p>
        <Link href="/auth/signup/personal" className="text-blue-500 hover:underline mt-4">
          Completar mi perfil ahora
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Mi Perfil</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {profile.profileImage && (
          <div className="flex justify-center md:col-span-2">
            <img
              // Usando la variable de entorno
              src={`${SUPABASE_STORAGE_BASE_URL}/${profile.profileImage}`}
              alt="Foto de perfil"
              className="w-48 h-48 rounded-full object-cover border-4 border-green-500 shadow-md"
            />
          </div>
        )}

        <div className="info-item">
          <p className="text-sm font-semibold text-gray-600">Nombre Completo:</p>
          <p className="text-lg text-gray-900">{profile.fullName}</p>
        </div>
        {/* ... (resto de los campos del perfil) ... */}
        {profile.bio && (
          <div className="md:col-span-2 info-item">
            <p className="text-sm font-semibold text-gray-600">Biografía:</p>
            <p className="text-lg text-gray-900 leading-relaxed">{profile.bio}</p>
          </div>
        )}

        {profile.role === 'PROVIDER' && (
          <>
            {profile.idFront && profile.idBack && (
              <div className="md:col-span-2">
                <p className="text-sm font-semibold text-gray-600 mb-2">Documentos de Identidad:</p>
                <div className="flex space-x-4 justify-center">
                  <a
                    // Usando la variable de entorno
                    href={`${SUPABASE_STORAGE_BASE_URL}/${profile.idFront}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    Ver Anverso
                  </a>
                  <a
                    // Usando la variable de entorno
                    href={`${SUPABASE_STORAGE_BASE_URL}/${profile.idBack}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    Ver Reverso
                  </a>
                </div>
              </div>
            )}
            {profile.servicesOffered && profile.servicesOffered.length > 0 && (
              <div className="md:col-span-2 info-item">
                <p className="text-sm font-semibold text-gray-600">Servicios Ofrecidos:</p>
                <ul className="list-disc list-inside text-lg text-gray-900">
                  {profile.servicesOffered.map((service) => (
                    <li key={service.id}>{service.title}</li>
                  ))}
                </ul>
              </div>
            )}
            {profile.gallery && profile.gallery.length > 0 && (
              <div className="md:col-span-2 info-item">
                <p className="text-sm font-semibold text-gray-600 mb-2">Galería de Trabajos:</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {profile.gallery.map((imageKey, index) => (
                    <img
                      key={index}
                      // Usando la variable de entorno
                      src={`${SUPABASE_STORAGE_BASE_URL}/${imageKey}`}
                      alt={`Galería ${index + 1}`}
                      className="w-full h-32 object-cover rounded-md shadow-sm"
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/profile/edit"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-md"
        >
          Editar Perfil
        </Link>
      </div>
    </div>
  );
}
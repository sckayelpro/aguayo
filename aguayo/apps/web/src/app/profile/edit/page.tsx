// apps/web/src/app/profile/edit/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import type { Profile, Role, Service } from 'prisma/generated/client';
import Link from 'next/link';

type ProfileWithServices = Profile & {
  servicesOffered?: Service[];
};

// Define los campos del formulario de edición.
// Para 'bio', lo marcamos como 'string' porque lo convertimos de 'null' a '' al resetear.
// Los campos de archivos (profileImage, idFront, idBack, gallery) son FileList para el input,
// pero no se pre-llenan con 'reset', por lo que no los incluimos en el objeto que se pasa a 'reset'.
type EditFormData = {
  fullName: string;
  birthDate: string; // Para el input type="date"
  phoneNumber: string;
  location: string;
  bio: string; // Ahora es siempre string gracias a ?? ''
  profileImage?: FileList; // Para subir una nueva imagen
  idFront?: FileList; // Para subir nuevos documentos
  idBack?: FileList;
  gallery?: FileList; // Para añadir nuevas imágenes a la galería
  servicesOffered?: string[]; // IDs de los servicios seleccionados
};
// Define la URL base de Supabase Storage para no repetirla
const SUPABASE_STORAGE_BASE_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/profiles`;
export default function EditProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileWithServices | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableServices, setAvailableServices] = useState<Service[]>([]); // Para el selector de servicios

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditFormData>();

  useEffect(() => {
    if (status === 'loading') return;

    if (!session?.user?.id) {
      router.replace('/auth/login');
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch Profile
        const profileRes = await fetch(`/api/profile/${session.user.id}`);
        if (!profileRes.ok) {
          throw new Error('Failed to fetch profile');
        }
        const profileData: ProfileWithServices = await profileRes.json();
        setProfile(profileData);

        // Pre-fill the form with current profile data
        // CORRECCIÓN CLAVE AQUÍ: No incluyas los campos de tipo FileList en el objeto de 'reset'.
        // Ellos no pueden ser pre-llenados de esta manera.
        reset({
          fullName: profileData.fullName ?? '',
          birthDate: profileData.birthDate ? new Date(profileData.birthDate).toISOString().split('T')[0] : '',
          phoneNumber: profileData.phoneNumber ?? '',
          location: profileData.location ?? '',
          bio: profileData.bio ?? '', // Usamos ?? '' para asegurar que siempre sea string
          servicesOffered: profileData.servicesOffered?.map(s => s.id) || [],
        });

        // Fetch Available Services (only if provider)
        if (profileData.role === 'PROVIDER') {
          const servicesRes = await fetch('/api/services');
          if (!servicesRes.ok) {
            throw new Error('Failed to fetch available services');
          }
          const servicesData: Service[] = await servicesRes.json();
          setAvailableServices(servicesData);
        }
      } catch (err: any) {
        console.error('Error fetching data for edit:', err);
        setError(err.message || 'Error al cargar los datos para edición.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session, status, router, reset]);

  const onSubmit = async (data: EditFormData) => {
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData();
    // Datos básicos
    formData.append('fullName', data.fullName);
    formData.append('birthDate', data.birthDate);
    formData.append('phoneNumber', data.phoneNumber);
    formData.append('location', data.location);
    if (data.bio && data.bio.trim() !== '') formData.append('bio', data.bio);


    // Archivos (solo si se seleccionaron nuevos archivos)
    const profileImageFile = data.profileImage?.[0];
    if (profileImageFile instanceof File && profileImageFile.size > 0) {
      formData.append('profileImage', profileImageFile);
    }

    if (profile?.role === 'PROVIDER') {
      const idFrontFile = data.idFront?.[0];
      if (idFrontFile instanceof File && idFrontFile.size > 0) {
        formData.append('idFront', idFrontFile);
      }

      const idBackFile = data.idBack?.[0];
      if (idBackFile instanceof File && idBackFile.size > 0) {
        formData.append('idBack', idBackFile);
      }

      const newGalleryFiles = Array.from(data.gallery || []);
      for (const file of newGalleryFiles) {
        if (file instanceof File && file.size > 0) {
          formData.append('gallery', file);
        }
      }

      // Servicios ofrecidos
      if (data.servicesOffered && data.servicesOffered.length > 0) {
        data.servicesOffered.forEach(serviceId => {
          formData.append('servicesOffered[]', serviceId);
        });
      }
    }

    try {
      const response = await fetch(`/api/profile/${session?.user?.id}`, {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar el perfil.');
      }

      router.push('/profile');
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Ocurrió un error inesperado al actualizar.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Cargando datos para edición...</div>;
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
        <p>No se encontró el perfil para editar.</p>
        <Link href="/auth/signup/personal" className="text-blue-500 hover:underline mt-4">
          Completar mi perfil
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-8 space-y-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">Editar Perfil</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* Campos de datos personales */}
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Nombre completo</label>
        <input
          type="text"
          id="fullName"
          {...register('fullName', { required: 'El nombre completo es requerido' })}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        />
        {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>}
      </div>

      <div>
        <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700">Fecha de nacimiento</label>
        <input
          type="date"
          id="birthDate"
          {...register('birthDate', { required: 'La fecha de nacimiento es requerida' })}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        />
        {errors.birthDate && <p className="mt-1 text-sm text-red-600">{errors.birthDate.message}</p>}
      </div>

      <div>
        <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">Celular</label>
        <input
          type="tel"
          id="phoneNumber"
          {...register('phoneNumber', { required: 'El número de celular es requerido' })}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        />
        {errors.phoneNumber && <p className="mt-1 text-sm text-red-600">{errors.phoneNumber.message}</p>}
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700">Ubicación o zona</label>
        <input
          type="text"
          id="location"
          {...register('location', { required: 'La ubicación es requerida' })}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        />
        {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>}
      </div>

      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Biografía (opcional)</label>
        <textarea
          id="bio"
          {...register('bio')} // No es requerido, por eso no tiene el {required: ...}
          rows={4}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        ></textarea>
      </div>

      {/* Sección de archivos y servicios (condicional para proveedores) */}
      <h2 className="text-2xl font-bold mt-8 mb-4 text-gray-800">Archivos y Servicios</h2>

     {/* Foto de Perfil - siempre presente */}
      <div>
        <label htmlFor="profileImage" className="block text-sm font-medium text-gray-700">Nueva Foto de Perfil (opcional)</label>
        {profile.profileImage && (
          <p className="text-xs text-gray-500 mb-2">Foto actual: <a href={`${SUPABASE_STORAGE_BASE_URL}/${profile.profileImage}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Ver</a></p>
        )}
        <input
          type="file"
          id="profileImage"
          accept="image/*"
          {...register('profileImage')}
          className="mt-1 block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
        />
      </div>

      {/* Campos específicos para proveedores */}
      {profile.role === 'PROVIDER' && (
        <>
                    <div>
            <label htmlFor="idFront" className="block text-sm font-medium text-gray-700">Nuevo Carnet (Anverso) (opcional)</label>
            {profile.idFront && (
              <p className="text-xs text-gray-500 mb-2">Actual: <a href={`${SUPABASE_STORAGE_BASE_URL}/${profile.idFront}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Ver</a></p>
            )}
            <input
              type="file"
              id="idFront"
              accept="image/*"
              {...register('idFront')}
              className="mt-1 block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="idBack" className="block text-sm font-medium text-gray-700">Nuevo Carnet (Reverso) (opcional)</label>
            {profile.idBack && (
              <p className="text-xs text-gray-500 mb-2">Actual: <a href={`${SUPABASE_STORAGE_BASE_URL}/${profile.idBack}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Ver</a></p>
            )}
            <input
              type="file"
              id="idBack"
              accept="image/*"
              {...register('idBack')}
              className="mt-1 block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
            />
          </div>

           <div>
            <label htmlFor="gallery" className="block text-sm font-medium text-gray-700">Añadir a Galería de Trabajos (opcional)</label>
            {profile.gallery && profile.gallery.length > 0 && (
              <div className="mb-2">
                <p className="text-xs text-gray-500">Imágenes actuales en galería:</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {profile.gallery.map((imageKey, index) => (
                    <a key={index} href={`${SUPABASE_STORAGE_BASE_URL}/${imageKey}`} target="_blank" rel="noopener noreferrer">
                      <img src={`${SUPABASE_STORAGE_BASE_URL}/${imageKey}`} alt={`Galería ${index + 1}`} className="w-16 h-16 object-cover rounded-md border" />
                    </a>
                  ))}
                </div>
              </div>
            )}
            <input
              type="file"
              id="gallery"
              accept="image/*"
              multiple
              {...register('gallery')}
              className="mt-1 block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
            />
            <p className="mt-1 text-xs text-gray-500">Selecciona múltiples archivos para añadir a tu galería. Las imágenes existentes no se eliminarán a menos que implementes esa lógica.</p>
          </div>

          {/* Selector de servicios */}
          <div>
            <label htmlFor="servicesOffered" className="block text-sm font-medium text-gray-700">Servicios que ofreces</label>
            {availableServices.length === 0 && !loading ? (
              <p className="mt-1 text-sm text-red-600">No hay servicios disponibles para seleccionar.</p>
            ) : (
              <select
                multiple
                id="servicesOffered"
                {...register('servicesOffered')}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                size={Math.min(availableServices.length, 5)} // Muestra al menos 5 opciones si hay muchas
              >
                {availableServices.map(service => (
                  <option key={service.id} value={service.id}>
                    {service.title}
                  </option>
                ))}
              </select>
            )}
            <p className="mt-1 text-xs text-gray-500">Mantén Ctrl/Cmd para seleccionar múltiples servicios.</p>
          </div>
        </>
      )}

      <div className="flex justify-end space-x-4 mt-8">
        <Link
          href="/profile"
          className="bg-gray-300 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-400 transition-colors shadow-md flex items-center"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>
    </form>
  );
}
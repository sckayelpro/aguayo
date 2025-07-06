// apps/web/src/app/publish/page.tsx
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import type { Profile, Service } from 'prisma/generated/client';
import Link from 'next/link';

export enum PriceTypeEnum {
  FIXED = 'FIXED',
  HOURLY = 'HOURLY',
  DAILY = 'DAILY',
  NEGOTIABLE = 'NEGOTIABLE',
}

type PublishFormData = {
  title: string;
  description: string;
  serviceId: string;
  price: number | null;
  priceType: PriceTypeEnum;
  images: FileList | null;
};

export default function PublishPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [offeredServices, setOfferedServices] = useState<Service[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<PublishFormData>({
    defaultValues: {
      priceType: PriceTypeEnum.FIXED,
      price: null,
      images: null,
    },
  });

  const watchPriceType = watch('priceType');
  const watchImages = watch('images');

  useEffect(() => {
    if (watchImages && watchImages.length > 0) {
      const urls = Array.from(watchImages).map(file => URL.createObjectURL(file));
      setImagePreviews(urls);
      return () => urls.forEach(url => URL.revokeObjectURL(url));
    } else {
      setImagePreviews([]);
    }
  }, [watchImages]);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session || !session.user?.id) {
      toast.error('Debes iniciar sesión para crear publicaciones.');
      router.replace('/auth/login');
      return;
    }

    const fetchProfileAndServices = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/profile/${session.user.id}`);
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to fetch profile');
        }
        const data: Profile & { servicesOffered?: Service[] } = await res.json();

        if (!data || typeof data.role === 'undefined') {
          throw new Error('Profile data is incomplete or missing role.');
        }

        if (data.role !== 'PROVIDER') {
          toast.error('Solo los proveedores pueden crear publicaciones.');
          router.replace('/dashboard');
          return;
        }

        setProfile(data);

        if (data.servicesOffered) {
          setOfferedServices(data.servicesOffered);
          if (data.servicesOffered.length > 0 && data.servicesOffered[0]) {
            setValue('serviceId', data.servicesOffered[0].id);
          }
        } else {
          setOfferedServices([]);
        }

      } catch (err: any) {
        console.error('Error fetching profile or services:', err);
        toast.error(err.message || 'Error al cargar datos del perfil.');
        router.replace('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndServices();
  }, [session, status, router, setValue]);


  const onSubmit: SubmitHandler<PublishFormData> = async (data) => {
    setIsSubmitting(true);
    toast.loading('Creando publicación...');

    try {
      let imageUrls: string[] = [];

      if (data.images && data.images.length > 0) {
        const formData = new FormData();
        for (let i = 0; i < data.images.length; i++) {
          const file = data.images[i];
          // *** CORRECCIÓN AQUÍ: Verificar si 'file' es undefined antes de usarlo ***
          if (file) {
            // Simple validación de tamaño y tipo antes de enviar
            if (file.size > 5 * 1024 * 1024) { // 5 MB
              throw new Error(`La imagen ${file.name} excede el tamaño máximo de 5MB.`);
            }
            if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
              throw new Error(`La imagen ${file.name} tiene un formato no permitido.`);
            }
            formData.append('files', file); // 'file' ahora está garantizado de no ser undefined
          }
        }

        const uploadRes = await fetch('/api/upload?bucket=publications', {
          method: 'POST',
          body: formData,
        });

        if (!uploadRes.ok) {
          const errorData = await uploadRes.json();
          throw new Error(errorData.error || 'Error al subir imágenes.');
        }
        const uploadData = await uploadRes.json();
        imageUrls = uploadData.urls;
      }

      const publishRes = await fetch('/api/publications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          serviceId: data.serviceId,
          price: data.priceType === PriceTypeEnum.NEGOTIABLE ? null : data.price,
          priceType: data.priceType,
          images: imageUrls,
        }),
      });

      if (!publishRes.ok) {
        const errorData = await publishRes.json();
        throw new Error(errorData.error || 'Error al crear la publicación.');
      }

      toast.dismiss();
      toast.success('¡Publicación creada con éxito!');
      reset();
      setImagePreviews([]);
      router.push('/profile');

    } catch (err: any) {
      toast.dismiss();
      toast.error(err.message || 'Ocurrió un error inesperado.');
      console.error('Error en onSubmit de publicación:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen text-lg font-medium">Cargando...</div>;
  }

  if (!profile || profile.role !== 'PROVIDER') {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-red-500">
        <p>No tienes permiso para crear publicaciones. Solo los proveedores pueden.</p>
        <button onClick={() => router.push('/dashboard')} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">Ir al Dashboard</button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">Crear Nueva Publicación</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Título de la Publicación */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">Título de la Publicación</label>
          <input
            type="text"
            id="title"
            {...register('title', { required: 'El título es obligatorio.' })}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            disabled={isSubmitting}
          />
          {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
        </div>

        {/* Descripción */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descripción Detallada</label>
          <textarea
            id="description"
            rows={5}
            {...register('description', { required: 'La descripción es obligatoria.' })}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            disabled={isSubmitting}
          ></textarea>
          {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
        </div>

        {/* Selector de Servicio */}
        <div>
          <label htmlFor="serviceId" className="block text-sm font-medium text-gray-700">Selecciona el Servicio que Ofreces</label>
          <select
            id="serviceId"
            {...register('serviceId', { required: 'Debes seleccionar un servicio.' })}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white"
            disabled={isSubmitting || offeredServices.length === 0}
          >
            {offeredServices.length === 0 ? (
                <option value="">{loading ? "Cargando servicios..." : "Carga tus servicios en tu perfil"}</option>
            ) : (
                offeredServices.map(service => (
                    <option key={service.id} value={service.id}>
                        {service.title}
                    </option>
                ))
            )}
          </select>
          {errors.serviceId && <p className="mt-1 text-sm text-red-600">{errors.serviceId.message}</p>}
          {offeredServices.length === 0 && !loading && (
             <p className="mt-2 text-sm text-blue-600">
                Aún no has configurado los servicios que ofreces. Ve a tu <Link href="/profile/edit" className="underline">perfil</Link> para añadirlos.
             </p>
          )}
        </div>

        {/* Tipo de Precio */}
        <div>
          <label htmlFor="priceType" className="block text-sm font-medium text-gray-700">Tipo de Precio</label>
          <select
            id="priceType"
            {...register('priceType', { required: 'Debes seleccionar un tipo de precio.' })}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white"
            disabled={isSubmitting}
          >
            {Object.values(PriceTypeEnum).map(type => (
                <option key={type} value={type}>
                    {type === PriceTypeEnum.FIXED && "Precio Fijo"}
                    {type === PriceTypeEnum.HOURLY && "Por Hora"}
                    {type === PriceTypeEnum.DAILY && "Por Día"}
                    {type === PriceTypeEnum.NEGOTIABLE && "A Convenir"}
                </option>
            ))}
          </select>
          {errors.priceType && <p className="mt-1 text-sm text-red-600">{errors.priceType.message}</p>}
        </div>

        {/* Campo de Precio (condicional) */}
        {watchPriceType !== PriceTypeEnum.NEGOTIABLE && (
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">Precio</label>
            <input
              type="number"
              id="price"
              step="0.01"
              {...register('price', {
                required: (watchPriceType as PriceTypeEnum) !== PriceTypeEnum.NEGOTIABLE ? 'El precio es obligatorio.' : false,
                min: {
                  value: 0.01,
                  message: 'El precio debe ser mayor a 0.'
                },
                valueAsNumber: true
              })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              disabled={isSubmitting}
            />
            {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>}
          </div>
        )}

        {/* Carga de Imágenes */}
        <div>
          <label htmlFor="images" className="block text-sm font-medium text-gray-700">Imágenes de tu Trabajo (Máx. 5)</label>
          <input
            type="file"
            id="images"
            multiple
            accept="image/jpeg,image/png,image/webp"
            {...register('images', {
              validate: (value) => {
                if (value && value.length > 5) {
                  return 'Solo se permiten hasta 5 imágenes.';
                }
                return true;
              },
            })}
            className="mt-1 block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
            disabled={isSubmitting}
          />
          {errors.images && <p className="mt-1 text-sm text-red-600">{errors.images.message}</p>}

          {/* Previsualización de imágenes */}
          {imagePreviews.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {imagePreviews.map((src, index) => (
                <img key={index} src={src} alt={`Previsualización ${index + 1}`} className="w-24 h-24 object-cover rounded-md shadow-sm" />
              ))}
            </div>
          )}
        </div>

        {/* Botón de Enviar */}
        <div className="text-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-3 rounded-lg text-white font-semibold transition-colors duration-200 ${
              isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {isSubmitting ? 'Publicando...' : 'Crear Publicación'}
          </button>
        </div>
      </form>
    </div>
  );
}
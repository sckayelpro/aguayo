// apps/web/src/app/profile/page.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'
import { prisma } from '@/lib/prisma'
import Image from 'next/image'
import { redirect } from 'next/navigation'

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/login')
  }

const user = await prisma.user.findUnique({
  where: { authUserId: session.user.id },
  include: {
    servicesOffered: true, // ← incluir relación con servicios ofrecidos
  },
})


  if (!user) {
    redirect('/profile/create')
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Mi perfil</h1>

      {/* Imagen de perfil */}
      {user.profileImage && (
        <Image
          src={`https://<your-project-ref>.supabase.co/storage/v1/object/public/profiles/${user.profileImage}`}
          alt="Foto de perfil"
          width={120}
          height={120}
          className="rounded-full mb-4 object-cover"
        />
      )}

      <div className="space-y-2">
        <p><strong>Nombre:</strong> {user.fullName}</p>
        <p><strong>Celular:</strong> {user.phoneNumber}</p>
        <p><strong>Ubicación:</strong> {user.location}</p>
        <p><strong>Biografía:</strong> {user.bio || 'No definida'}</p>
        <p><strong>Fecha de nacimiento:</strong> {user.birthDate?.toLocaleDateString()}</p>
        <p><strong>Rol:</strong> {user.role}</p>
        <p><strong>Servicios ofrecidos:</strong> {(user.servicesOffered as any)?.join(', ')}</p>
      </div>

      {/* Galería */}
      {user.gallery?.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Galería</h2>
          <div className="grid grid-cols-2 gap-4">
            {user.gallery.map((key, index) => (
              <Image
                key={index}
                src={`https://zzyyfqtwxwlsfownjbfx.supabase.co/storage/v1/object/public/profiles/${key}`}
                alt={`Foto ${index + 1}`}
                width={300}
                height={200}
                className="rounded shadow object-cover"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

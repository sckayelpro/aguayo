// apps/web/src/app/page.tsx
import Link from 'next/link'

export default function HomePage() {
return (
<section className="flex flex-col items-center justify-center min-h-[70vh] text-center">
<h2 className="text-3xl font-bold text-blue-700 mb-4">
Bienvenido a Aguayo 👋
</h2>
<p className="max-w-md text-gray-600 mb-6">
Encuentra personas de confianza para realizar servicios como limpieza, jardinería, cuidado de personas y más.
</p>
<Link href="/signup/role">
<button className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
Comenzar
</button>
</Link>
</section>
)
}
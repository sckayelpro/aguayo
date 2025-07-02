// app/signup/layout.tsx
import { ReactNode } from 'react'
import Link from 'next/link'

const STEPS = [
  { slug: 'role', label: 'Tipo de cuenta' },
  { slug: 'personal', label: 'Datos personales' },
  { slug: 'documents', label: 'Documentos' },
  { slug: 'finish', label: 'Listo' },
]

export default function SignupLayout({ children }: { children: ReactNode }) {
  return (
    <div className="max-w-md mx-auto p-4">
      <nav className="flex justify-between mb-6">
        {STEPS.map((step) => (
          <Link
            key={step.slug}
            href={`/signup/${step.slug}`}
            className="text-sm font-medium"
          >
            {step.label}
          </Link>
        ))}
      </nav>
      <div>{children}</div>
    </div>
  )
}

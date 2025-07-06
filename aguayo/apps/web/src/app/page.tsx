'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import AuthButton from '@/components/auth/AuthButton'
import { Sparkles, Shield, Clock, Users } from 'lucide-react'

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'authenticated' && !session.user.hasProfile) {
      router.replace('/auth/signup/role')
    }
  }, [status, session, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cool-100 via-white to-warm-100">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-neutral-500 font-medium">Cargando sesión...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cool-100 via-white to-warm-100">
      {/* Header con efecto glassmorphism */}
      <div className="relative pt-12 pb-8 px-4">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 backdrop-blur-sm"></div>
        <div className="relative z-10 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-6 backdrop-blur-sm border border-primary/20">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
            Aguayo
          </h1>
          <p className="text-lg text-neutral-600 max-w-sm mx-auto leading-relaxed">
            Conecta con personas de confianza para todos tus servicios del hogar
          </p>
        </div>
      </div>

      {/* Features cards */}
      <div className="px-4 mb-8">
        <div className="grid grid-cols-1 gap-4 max-w-md mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-card border border-white/20 hover:shadow-card-hover transition-all duration-300">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Personas verificadas</h3>
                <p className="text-sm text-neutral-600">Todos los perfiles están validados</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-card border border-white/20 hover:shadow-card-hover transition-all duration-300">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Disponibilidad 24/7</h3>
                <p className="text-sm text-neutral-600">Encuentra servicios cuando los necesites</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-card border border-white/20 hover:shadow-card-hover transition-all duration-300">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-accent-600" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Comunidad activa</h3>
                <p className="text-sm text-neutral-600">Miles de proveedores y clientes</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="px-4 pb-8">
        <div className="max-w-md mx-auto text-center">
          {status === 'unauthenticated' && (
            <div className="space-y-4">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-card border border-white/20">
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  ¿Listo para empezar?
                </h2>
                <AuthButton />
              </div>
            </div>
          )}

          {status === 'authenticated' && session.user.hasProfile && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-6 shadow-floating">
                <h2 className="text-xl font-semibold text-white mb-4">
                  ¡Bienvenido de vuelta!
                </h2>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="w-full bg-white text-primary px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors duration-200 shadow-sm"
                >
                  Ir al Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Services preview */}
      <div className="px-4 pb-20">
        <div className="max-w-md mx-auto">
          <h3 className="text-lg font-semibold text-center text-foreground mb-6">
            Servicios más solicitados
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { name: 'Limpieza', emoji: '🧹', color: 'bg-primary/10 text-primary' },
              { name: 'Jardinería', emoji: '🌱', color: 'bg-secondary/10 text-secondary' },
              { name: 'Cuidado', emoji: '👥', color: 'bg-accent/10 text-accent-600' },
              { name: 'Reparaciones', emoji: '🔧', color: 'bg-warm/10 text-warm-700' },
            ].map((service) => (
              <div
                key={service.name}
                className={`${service.color} rounded-xl p-4 text-center transition-all duration-200 hover:scale-105 cursor-pointer`}
              >
                <div className="text-2xl mb-2">{service.emoji}</div>
                <div className="text-sm font-medium">{service.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
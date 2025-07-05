// apps/web/src/types/next-auth.d.ts
import NextAuth from "next-auth"
import { Role } from "@prisma/client"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role?: Role | null // Rol de tu aplicación, no el rol de NextAuth
      hasProfile: boolean // Indica si el usuario ha completado su perfil de la aplicación
      appUserId?: string | null // El ID de la tabla Profile de tu aplicación
    }
  }

  interface User {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
  }
}
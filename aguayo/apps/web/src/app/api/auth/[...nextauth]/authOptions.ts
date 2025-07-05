// apps/web/src/app/api/auth/[...nextauth]/authOptions.ts
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import GoogleProvider from "next-auth/providers/google";
import type { NextAuthOptions } from "next-auth";

// Usar el prisma client global para evitar múltiples instancias en desarrollo
import { prisma } from "@/lib/prisma"; // Asegúrate de que esta ruta sea correcta para tu monorepo

// const prisma = new PrismaClient() // Ya lo importamos de @/lib/prisma

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    // Redirige siempre a la página de registro (o al inicio del wizard)
    signIn: "/auth/signup",
    error: "/auth/signup",
  },
  callbacks: {
    async signIn({ user, account, profile: googleProfile }) {
      console.log("[signIn callback] User email:", user.email);

      if (!user.email) {
        console.error("[signIn callback] User email is missing.");
        return false; // No permitir sign-in sin email
      }

      // No creamos el perfil aquí, solo nos aseguramos que el usuario de NextAuth exista.
      // PrismaAdapter se encarga de crear el usuario en la tabla `nextauth_users`
      // si no existe, o de actualizarlo si ya existe.
      console.log("[signIn callback] User authenticated by NextAuth.");
      return true; // Permitir el inicio de sesión de NextAuth
    },

    async session({ session, user }) {
      // Asegúrate de que `user` aquí es el objeto `User` de Prisma (del adapter)
      if (user) {
        session.user.id = user.id;

        // Busca el perfil asociado al ID del usuario de NextAuth
        const profile = await prisma.profile.findUnique({
          where: { authUserId: user.id },
        });

        console.log("[session callback] Profile exists:", !!profile);

        // Asigna propiedades personalizadas a la sesión
        session.user.hasProfile = !!profile;
        session.user.role = profile?.role || null;
        session.user.appUserId = profile?.id || null; // ID del perfil de tu aplicación
      }

      return session;
    },

    // Añadir una redirección personalizada si es necesario
    async redirect({ url, baseUrl }) {
      // Si el usuario está intentando acceder a una página restringida
      // y no tiene perfil, redirige al inicio del wizard.
      // Esta lógica se complementa con la que está en `SignupLayout.tsx`.
      // Podrías refinarla para que si la `url` es el dashboard y no tiene perfil,
      // lo redirija al wizard.
      // return url.startsWith(baseUrl) ? url : baseUrl; // Comportamiento por defecto

      // Por ahora, solo queremos que si no se especificó un callbackUrl,
      // o si se especificó el dashboard pero no tiene perfil,
      // redirija al inicio del wizard de signup.

      // Si la URL es la de inicio de sesión o la del dashboard
      // y queremos forzar el wizard, podemos hacerlo aquí.
      // Sin embargo, la lógica de redirección es mejor manejarla
      // en el lado del cliente con `useEffect` en tus componentes.
      // La callbackUrl en `signIn` es la más importante.

      return url.startsWith(baseUrl) ? url : baseUrl; // Mantener comportamiento por defecto
    },
  },
};
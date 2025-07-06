// apps/web/src/app/api/auth/[...nextauth]/authOptions.ts
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import type { NextAuthOptions } from "next-auth";
import { Adapter } from "next-auth/adapters"; // Importar Adapter para el cast

// Usar el prisma client global para evitar múltiples instancias en desarrollo
import { prisma } from "@/lib/prisma"; // Asegúrate de que esta ruta sea correcta para tu monorepo
import { DefaultSession } from "next-auth";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter, // Asegura el tipo correcto para el adapter
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt', // <--- ¡MUY IMPORTANTE! Usar JWT para las sesiones
    maxAge: 30 * 24 * 60 * 60, // Duración de la sesión (30 días)
  },
  pages: {
    signIn: "/auth/signup", // Redirige a la página de registro/wizard
    error: "/auth/signup",
  },
  callbacks: {
    async signIn({ user, account, profile: googleProfile }) {
      console.log("[signIn callback] User email:", user.email);

      if (!user.email) {
        console.error("[signIn callback] User email is missing.");
        return false; // No permitir sign-in sin email
      }

      console.log("[signIn callback] User authenticated by NextAuth.");
      return true; // Permitir el inicio de sesión de NextAuth
    },

    async session({ session, token }) {
      // El 'token' contiene el JWT (si strategy: 'jwt')
      // El 'session' es el objeto de sesión que se envía al cliente
      // El 'user' (del callback session) ya no es necesario si usamos 'token.sub'

      // Asegúrate de que session.user exista
      if (session.user) {
        // El 'sub' del token JWT es el ID del usuario de NextAuth (User.id)
        session.user.id = token.sub as string;

        // Busca el perfil asociado al ID del usuario de NextAuth
        const profile = await prisma.profile.findUnique({
          where: { authUserId: session.user.id },
          select: { role: true, id: true } // Solo necesitamos el rol y el ID del perfil
        });

        console.log("[session callback] Profile exists:", !!profile);

        // Asigna propiedades personalizadas a la sesión
        session.user.hasProfile = !!profile;
        session.user.role = profile?.role || undefined; // Mejor undefined que null para opcionales
        session.user.profileId = profile?.id || undefined; // Mejor undefined que null para opcionales
      }

      return session;
    },

    async jwt({ token, user, account, profile: nextAuthProfile }) {
      // Este callback se ejecuta ANTES que el callback 'session'
      // y se encarga de añadir propiedades al token JWT.
      // 'user' solo está presente en el primer inicio de sesión o si la sesión se actualiza.

      // Si el usuario existe (primer inicio de sesión o actualización),
      // añade el ID del usuario de NextAuth (user.id) al token.
      if (user) {
        token.sub = user.id; // Guarda el ID del usuario de NextAuth en el token JWT
        // También puedes añadir aquí las propiedades iniciales del perfil si las conoces
        // o si las buscas aquí para que estén disponibles en el token desde el principio.
        // Sin embargo, para `hasProfile` y `role`, es más seguro buscarlas en el callback `session`
        // para asegurar que siempre reflejen el estado actual de la DB.
      }

      return token;
    },

    async redirect({ url, baseUrl }) {
      // Lógica de redirección. La lógica de si tiene perfil o no
      // es mejor manejarla en el lado del cliente con `useEffect`
      // en tus componentes de página (como ya lo haces en `page.tsx`).
      // Aquí, simplemente permitimos redirecciones dentro de nuestra app.
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
  },
  debug: process.env.NODE_ENV === 'development', // Activa el debug en desarrollo
};

// Extiende los tipos de NextAuth.js para incluir tus propiedades personalizadas
declare module 'next-auth' {
  interface Session {
    user: {
      id: string; // ID del usuario de NextAuth (User.id de nextauth_users)
      hasProfile?: boolean; // Indica si el usuario tiene un perfil completo en tu tabla Profile
      role?: 'CLIENT' | 'PROVIDER'; // Rol del usuario de tu tabla Profile
      profileId?: string; // ID de tu modelo Profile
    } & DefaultSession['user']; // Mantiene las propiedades por defecto de NextAuth
  }

  interface User {
    id: string; // Asegura que el ID está disponible en el objeto User del adapter
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string; // ID del usuario de NextAuth (User.id)
    hasProfile?: boolean;
    role?: 'CLIENT' | 'PROVIDER';
    profileId?: string;
  }
}
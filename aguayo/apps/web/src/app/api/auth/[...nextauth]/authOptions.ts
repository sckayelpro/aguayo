// apps/web/src/app/api/auth/[...nextauth]/authOptions.ts
import { SupabaseAdapter } from '@next-auth/supabase-adapter'
import GoogleProvider from 'next-auth/providers/google'
import type { NextAuthOptions } from 'next-auth'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  adapter: SupabaseAdapter({
    url: process.env.SUPABASE_URL!,
    secret: process.env.SUPABASE_ANON_KEY!,
  }),
  secret: process.env.NEXTAUTH_SECRET,
 pages: {
  signIn: '/auth/login', // ✅ ruta correcta en tu App Router
},
  callbacks: {
    async session({ session, user }) {
      // Puedes añadir info personalizada a la sesión aquí
      session.user.id = user.id
      return session
    },
  },
}
